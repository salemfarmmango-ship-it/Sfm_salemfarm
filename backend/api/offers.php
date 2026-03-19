<?php
// backend/api/offers.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        // Determine whether to fetch only active records based on user role
        // For simplicity, public GET = active only.
        // If an admin token is passed, we could show all. Let's just use a param `all=1` for admin.
        if (isset($_GET['all'])) {
            $user = requireAuth();
            if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);
            $stmt = $pdo->query("SELECT * FROM offers ORDER BY created_at DESC");
        } else {
            $stmt = $pdo->query("SELECT * FROM offers WHERE is_active = TRUE ORDER BY created_at DESC");
        }
        sendJson($stmt->fetchAll());
        break;

    case 'POST':
    case 'PUT':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        if ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'Missing ID'], 400);
            $stmt = $pdo->prepare("DELETE FROM offers WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? '';
        $description = $input['description'] ?? '';
        $couponCode = $input['coupon_code'] ?? '';
        $imageUrl = $input['image_url'] ?? null;
        $isActive = isset($input['is_active']) ? filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN) : 1;

        if ($method === 'POST') {
            if (!$title || !$couponCode) sendJson(['error' => 'Title and coupon code required'], 400);
            $stmt = $pdo->prepare("INSERT INTO offers (title, description, coupon_code, image_url, is_active) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$title, $description, $couponCode, $imageUrl, $isActive ? 1 : 0]);
            sendJson(['success' => true, 'id' => $pdo->lastInsertId()]);
        }

        if ($method === 'PUT') {
            if (!$id) sendJson(['error' => 'Missing ID'], 400);
            $stmt = $pdo->prepare("UPDATE offers SET title=?, description=?, coupon_code=?, image_url=?, is_active=? WHERE id=?");
            $stmt->execute([$title, $description, $couponCode, $imageUrl, $isActive ? 1 : 0, $id]);
            sendJson(['success' => true]);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
