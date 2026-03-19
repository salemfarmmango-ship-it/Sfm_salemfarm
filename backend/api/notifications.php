<?php
// backend/api/notifications.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        // Save FCM token
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? '';
        $userId = $input['userId'] ?? null;
        $deviceInfo = isset($input['deviceInfo']) ? json_encode($input['deviceInfo']) : '{}';

        if (!$token) {
            sendJson(['error' => 'FCM token is required'], 400);
        }

        try {
            $stmt = $pdo->prepare("INSERT INTO notification_tokens (token, user_id, device_info, updated_at) 
                                   VALUES (?, ?, ?, NOW()) 
                                   ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), device_info = VALUES(device_info), updated_at = NOW()");
            $stmt->execute([$token, $userId, $deviceInfo]);
            sendJson(['success' => true, 'message' => 'Token saved']);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'GET':
        // Check if token exists or list all
        $action = $_GET['action'] ?? 'check';
        
        if ($action === 'list') {
            try {
                $stmt = $pdo->query("SELECT * FROM notification_tokens ORDER BY updated_at DESC");
                $subscriptions = $stmt->fetchAll();
                sendJson(['success' => true, 'subscriptions' => $subscriptions]);
            } catch (Exception $e) {
                sendJson(['error' => $e->getMessage()], 500);
            }
        } else {
            $token = $_GET['token'] ?? '';
            if (!$token) sendJson(['error' => 'Token required'], 400);

            try {
                $stmt = $pdo->prepare("SELECT * FROM notification_tokens WHERE token = ?");
                $stmt->execute([$token]);
                $exists = $stmt->fetch();
                sendJson(['subscribed' => !!$exists, 'data' => $exists]);
            } catch (Exception $e) {
                sendJson(['error' => $e->getMessage()], 500);
            }
        }
        break;

    case 'DELETE':
        // Unsubscribe or delete multiple
        $input = json_decode(file_get_contents('php://input'), true);
        $token = $input['token'] ?? null;
        $tokens = $input['tokens'] ?? null;
        
        if (!$token && (!$tokens || !is_array($tokens))) {
            sendJson(['error' => 'Token(s) required'], 400);
        }

        try {
            if ($tokens) {
                $placeholders = implode(',', array_fill(0, count($tokens), '?'));
                $stmt = $pdo->prepare("DELETE FROM notification_tokens WHERE token IN ($placeholders)");
                $stmt->execute($tokens);
            } else {
                $stmt = $pdo->prepare("DELETE FROM notification_tokens WHERE token = ?");
                $stmt->execute([$token]);
            }
            sendJson(['success' => true, 'message' => 'Deleted']);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
