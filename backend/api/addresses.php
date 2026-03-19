<?php
// backend/api/addresses.php
require_once '../config.php';
require_once '../jwt.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$userId = $_GET['user_id'] ?? null;

switch ($method) {
    case 'GET':
        $targetUserId = $userId ?: $user['sub'];
        
        // Non-admins can only see their own addresses
        if ($user['role'] !== 'admin' && $targetUserId !== $user['sub']) {
            sendJson(['error' => 'Forbidden'], 403);
        }

        try {
            $stmt = $pdo->prepare("SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC");
            $stmt->execute([$targetUserId]);
            $addresses = $stmt->fetchAll();
            sendJson($addresses);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        $targetId = $input['user_id'] ?? $user['sub'];

        if ($user['role'] !== 'admin' && $targetId !== $user['sub']) {
            sendJson(['error' => 'Forbidden'], 403);
        }

        try {
            // If is_default is true, unset other defaults
            if (!empty($input['is_default'])) {
                $pdo->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?")->execute([$targetId]);
            }

            $stmt = $pdo->prepare("INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $targetId,
                $input['full_name'],
                $input['phone'],
                $input['address_line1'],
                $input['address_line2'] ?? '',
                $input['city'],
                $input['state'],
                $input['postal_code'],
                !empty($input['is_default']) ? 1 : 0
            ]);

            sendJson(['success' => true, 'id' => $pdo->lastInsertId()]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'PUT':
    case 'PATCH':
        if (!$id) sendJson(['error' => 'Missing ID'], 400);
        $input = json_decode(file_get_contents('php://input'), true);

        try {
            // Check ownership
            $check = $pdo->prepare("SELECT user_id FROM addresses WHERE id = ?");
            $check->execute([$id]);
            $addr = $check->fetch();
            if (!$addr) sendJson(['error' => 'Address not found'], 404);
            if ($user['role'] !== 'admin' && $addr['user_id'] !== $user['sub']) sendJson(['error' => 'Forbidden'], 403);

            if (!empty($input['is_default'])) {
                $pdo->prepare("UPDATE addresses SET is_default = 0 WHERE user_id = ?")->execute([$addr['user_id']]);
            }

            $fields = [];
            $params = [];
            $allowed = ['full_name', 'phone', 'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'is_default'];
            foreach ($allowed as $f) {
                if (isset($input[$f])) {
                    $fields[] = "$f = ?";
                    $params[] = ($f === 'is_default' ? ($input[$f] ? 1 : 0) : $input[$f]);
                }
            }

            if (empty($fields)) sendJson(['error' => 'Nothing to update'], 400);

            $params[] = $id;
            $stmt = $pdo->prepare("UPDATE addresses SET " . implode(', ', $fields) . " WHERE id = ?");
            $stmt->execute($params);

            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'DELETE':
        if (!$id) sendJson(['error' => 'Missing ID'], 400);
        try {
            // Check ownership
            $check = $pdo->prepare("SELECT user_id FROM addresses WHERE id = ?");
            $check->execute([$id]);
            $addr = $check->fetch();
            if (!$addr) sendJson(['error' => 'Address not found'], 404);
            if ($user['role'] !== 'admin' && $addr['user_id'] !== $user['sub']) sendJson(['error' => 'Forbidden'], 403);

            $stmt = $pdo->prepare("DELETE FROM addresses WHERE id = ?");
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
