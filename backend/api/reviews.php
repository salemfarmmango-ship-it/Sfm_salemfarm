<?php
// backend/api/reviews.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$productId = $_GET['product_id'] ?? null;
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($productId) {
            $stmt = $pdo->prepare("SELECT * FROM reviews WHERE product_id = ? AND is_approved = TRUE ORDER BY created_at DESC");
            $stmt->execute([$productId]);
            sendJson($stmt->fetchAll());
        } else {
            // Admin list all reviews
            $user = requireAuth();
            if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

            $filter = $_GET['filter'] ?? 'all';
            $query = "SELECT r.*, p.name as product_name, u.full_name as user_full_name 
                      FROM reviews r 
                      JOIN products p ON r.product_id = p.id 
                      LEFT JOIN users u ON r.user_id = u.id 
                      WHERE 1=1";
            $params = [];

            if ($filter === 'pending') {
                $query .= " AND r.is_approved = 0";
            } elseif ($filter === 'approved') {
                $query .= " AND r.is_approved = 1";
            }

            $query .= " ORDER BY r.created_at DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $reviews = $stmt->fetchAll();

            foreach ($reviews as &$r) {
                // For frontend compatibility with the nested structure
                $r['products'] = ['name' => $r['product_name']];
                $r['profiles'] = ['full_name' => $r['user_full_name']];
                $r['is_approved'] = (bool)$r['is_approved'];
            }

            // Wrap in "reviews" object for frontend compatibility if needed, 
            // but the route.ts currently returns the response as is.
            // Let's check AdminReviewsPage: it does `if (data.reviews)`.
            sendJson(['reviews' => $reviews]);
        }
        break;

    case 'POST':
        $user = requireAuth();
        $input = json_decode(file_get_contents('php://input'), true);
        $reqProductId = $input['product_id'] ?? null;
        $rating = $input['rating'] ?? 0;
        $comment = $input['comment'] ?? '';
        $reviewerName = $input['reviewer_name'] ?? $user['full_name'];

        if (!$reqProductId || $rating < 1 || $rating > 5) {
            sendJson(['error' => 'Invalid data'], 400);
        }

        $stmt = $pdo->prepare("INSERT INTO reviews (product_id, user_id, reviewer_name, rating, comment, is_approved) VALUES (?, ?, ?, ?, ?, FALSE)");
        $stmt->execute([$reqProductId, $user['sub'], $reviewerName, $rating, $comment]);
        sendJson(['success' => true, 'message' => 'Review submitted for approval']);
        break;

    case 'PUT':
    case 'PATCH':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ids = $input['ids'] ?? ($input['id'] ?? ($id ? [$id] : []));
        if (!is_array($ids)) $ids = [$ids];

        if (empty($ids)) sendJson(['error' => 'Missing review ID(s)'], 400);

        if ($method === 'DELETE') {
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM reviews WHERE id IN ($placeholders)");
            $stmt->execute($ids);
        } else {
            $isApproved = isset($input['is_approved']) ? (int)$input['is_approved'] : null;
            if ($isApproved !== null) {
                $placeholders = implode(',', array_fill(0, count($ids), '?'));
                $stmt = $pdo->prepare("UPDATE reviews SET is_approved = ? WHERE id IN ($placeholders)");
                $stmt->execute(array_merge([$isApproved], $ids));
            }
        }
        sendJson(['success' => true]);
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
