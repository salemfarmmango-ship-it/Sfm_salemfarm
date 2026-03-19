<?php
// backend/api/hero_slides.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM hero_slides WHERE is_active = 1 ORDER BY sort_order ASC, created_at DESC");
            $slides = $stmt->fetchAll();
            sendJson($slides);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'POST':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $input = json_decode(file_get_contents('php://input'), true);
        $title = $input['title'] ?? '';
        if (!$title) sendJson(['error' => 'Title is required'], 400);

        try {
            $keys = array_keys($input);
            $values = array_values($input);
            $placeholders = implode(',', array_fill(0, count($keys), '?'));
            $cols = implode(',', array_map(fn($k) => "`$k`", $keys));

            $stmt = $pdo->prepare("INSERT INTO hero_slides ($cols) VALUES ($placeholders)");
            $stmt->execute($values);
            
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT * FROM hero_slides WHERE id = ?");
            $stmt->execute([$id]);
            sendJson($stmt->fetch());
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'PUT':
    case 'PATCH':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $id = $_GET['id'] ?? null;
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$id && isset($input['id'])) $id = $input['id'];

        if (!$id) sendJson(['error' => 'ID required'], 400);

        try {
            $sets = [];
            $params = [];
            foreach ($input as $key => $value) {
                if ($key === 'id') continue;
                $sets[] = "`$key` = ?";
                $params[] = $value;
            }
            $params[] = $id;

            $stmt = $pdo->prepare("UPDATE hero_slides SET " . implode(',', $sets) . " WHERE id = ?");
            $stmt->execute($params);

            $stmt = $pdo->prepare("SELECT * FROM hero_slides WHERE id = ?");
            $stmt->execute([$id]);
            sendJson($stmt->fetch());
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        $user = requireAuth();
        if ($user['role'] !== 'admin') sendJson(['error' => 'Forbidden'], 403);

        $id = $_GET['id'] ?? null;
        if (!$id) sendJson(['error' => 'ID required'], 400);

        try {
            $stmt = $pdo->prepare("DELETE FROM hero_slides WHERE id = ?");
            $stmt->execute([$id]);
            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
