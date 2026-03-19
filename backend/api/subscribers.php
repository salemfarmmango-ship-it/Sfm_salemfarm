<?php
// backend/api/subscribers.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }
        
        $stmt = $pdo->query("SELECT * FROM newsletter ORDER BY created_at DESC");
        $subscribers = $stmt->fetchAll();
        sendJson($subscribers);
        break;

    case 'POST':
        // Subscribe (Public)
        $input = json_decode(file_get_contents('php://input'), true);
        $email = $input['email'] ?? '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendJson(['error' => 'Invalid email address'], 400);
        }

        try {
            $stmt = $pdo->prepare("INSERT IGNORE INTO newsletter (email) VALUES (?)");
            $stmt->execute([$email]);
            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        // Unsubscribe or Admin Delete
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $id = $_GET['id'] ?? null;
        if (!$id) sendJson(['error' => 'Missing subscriber ID'], 400);

        try {
            $stmt = $pdo->prepare("DELETE FROM newsletter WHERE id = ?");
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
