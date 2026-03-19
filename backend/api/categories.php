<?php
// backend/api/categories.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            $stmt = $pdo->prepare("SELECT * FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            $category = $stmt->fetch();
            if ($category) {
                sendJson($category);
            } else {
                sendJson(['error' => 'Category not found'], 404);
            }
        } else {
            $stmt = $pdo->query("SELECT * FROM categories ORDER BY created_at ASC");
            $categories = $stmt->fetchAll();
            sendJson($categories);
        }
        break;

    case 'POST':
    case 'PUT':
    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        if ($method === 'DELETE') {
            if (!$id) sendJson(['error' => 'Missing category ID'], 400);
            $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $name = $input['name'] ?? '';
        $slug = $input['slug'] ?? '';
        $imageUrl = $input['image_url'] ?? null;

        if ($method === 'POST') {
            if (!$name || !$slug) sendJson(['error' => 'Name and slug are required'], 400);
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug, image_url) VALUES (?, ?, ?)");
            $stmt->execute([$name, $slug, $imageUrl]);
            sendJson(['success' => true, 'id' => $pdo->lastInsertId()]);
        }

        if ($method === 'PUT') {
            if (!$id) sendJson(['error' => 'Missing category ID'], 400);
            $stmt = $pdo->prepare("UPDATE categories SET name=?, slug=?, image_url=? WHERE id=?");
            $stmt->execute([$name, $slug, $imageUrl, $id]);
            sendJson(['success' => true]);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
