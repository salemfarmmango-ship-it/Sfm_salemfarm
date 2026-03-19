<?php
// backend/api/blogs.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$slug = $_GET['slug'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT b.*, p.name as product_name FROM blogs b LEFT JOIN products p ON b.product_id = p.id WHERE b.id = ?");
            $stmt->execute([$id]);
            $blog = $stmt->fetch();
            if ($blog) {
                sendJson($blog);
            } else {
                sendJson(['error' => 'Blog not found'], 404);
            }
        } elseif ($slug) {
            $stmt = $pdo->prepare("SELECT b.*, p.name as product_name FROM blogs b LEFT JOIN products p ON b.product_id = p.id WHERE b.slug = ?");
            $stmt->execute([$slug]);
            $blog = $stmt->fetch();
            if ($blog) {
                sendJson($blog);
            } else {
                sendJson(['error' => 'Blog not found'], 404);
            }
        } else {
            $status = $_GET['status'] ?? null;
            $query = "SELECT b.*, p.name as product_name FROM blogs b LEFT JOIN products p ON b.product_id = p.id WHERE 1=1";
            $params = [];
            
            if ($status) {
                $query .= " AND b.status = ?";
                $params[] = $status;
            }
            
            $query .= " ORDER BY b.created_at DESC";
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            sendJson($stmt->fetchAll());
        }
        break;

    case 'POST':
    case 'PATCH':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if ($method === 'DELETE') {
            $ids = $input['ids'] ?? ($id ? [$id] : []);
            if (empty($ids)) sendJson(['error' => 'Missing blog ID(s)'], 400);

            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $stmt = $pdo->prepare("DELETE FROM blogs WHERE id IN ($placeholders)");
            $stmt->execute($ids);
            sendJson(['success' => true, 'deleted' => $stmt->rowCount()]);
            break;
        }

        if ($method === 'POST') {
            $title = $input['title'] ?? '';
            $slug = $input['slug'] ?? '';
            $content = $input['content'] ?? '';
            $imageUrl = $input['image_url'] ?? '';
            $productId = $input['product_id'] ?? null;
            $status = $input['status'] ?? 'draft';

            if (!$title || !$slug) {
                sendJson(['error' => 'Title and slug are required'], 400);
            }

            try {
                $stmt = $pdo->prepare("INSERT INTO blogs (title, slug, content, image_url, product_id, status) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$title, $slug, $content, $imageUrl, $productId, $status]);
                sendJson(['success' => true, 'id' => $pdo->lastInsertId()]);
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    sendJson(['error' => 'Slug already exists'], 400);
                } else {
                    sendJson(['error' => $e->getMessage()], 500);
                }
            }
        }

        if ($method === 'PATCH') {
            if (!$id) sendJson(['error' => 'Missing blog ID'], 400);

            $allowedFields = ['title', 'slug', 'content', 'image_url', 'product_id', 'status'];
            $updateFields = [];
            $updateParams = [];

            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $input)) {
                    $updateFields[] = "`$field` = ?";
                    $updateParams[] = $input[$field];
                }
            }

            if (empty($updateFields)) sendJson(['error' => 'No fields to update'], 400);

            $updateParams[] = $id;
            $sql = "UPDATE blogs SET " . implode(', ', $updateFields) . " WHERE id = ?";
            
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute($updateParams);
                sendJson(['success' => true]);
            } catch (PDOException $e) {
                if ($e->getCode() == 23000) {
                    sendJson(['error' => 'Slug already exists'], 400);
                } else {
                    sendJson(['error' => $e->getMessage()], 500);
                }
            }
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
