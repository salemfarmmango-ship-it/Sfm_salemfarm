<?php
// backend/api/settings.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }
        
        $stmt = $pdo->query("SELECT setting_key, setting_value FROM store_settings");
        $rows = $stmt->fetchAll();
        
        $settings = [];
        foreach ($rows as $row) {
            $val = $row['setting_value'];
            // Auto-convert booleans/numbers if possible
            if ($val === 'true') $val = true;
            if ($val === 'false') $val = false;
            
            $settings[$row['setting_key']] = $val;
        }
        
        sendJson(['settings' => $settings]);
        break;

    case 'POST':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $key = $input['key'] ?? '';
        $value = $input['value'] ?? '';

        if (!$key) sendJson(['error' => 'Key is required'], 400);

        // Convert value to string for storage
        if (is_bool($value)) $value = $value ? 'true' : 'false';

        try {
            $stmt = $pdo->prepare("INSERT INTO store_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$key, (string)$value, (string)$value]);
            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
