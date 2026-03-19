<?php
// backend/api/shipping.php
require_once '../config.php';
require_once '../jwt.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            $stmt = $pdo->query("SELECT * FROM shipping_rates ORDER BY state_name ASC");
            $rates = $stmt->fetchAll();
            sendJson($rates);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    case 'PUT':
        $user = requireAuth();
        if ($user['role'] !== 'admin') {
            sendJson(['error' => 'Forbidden'], 403);
        }

        $input = json_decode(file_get_contents('php://input'), true);
        $id = $input['id'] ?? null;
        $charge = $input['charge'] ?? null;

        if (!$id || $charge === null) {
            sendJson(['error' => 'ID and charge are required'], 400);
        }

        try {
            $stmt = $pdo->prepare("UPDATE shipping_rates SET charge = ? WHERE id = ?");
            $stmt->execute([$charge, $id]);
            sendJson(['success' => true]);
        } catch (Exception $e) {
            sendJson(['error' => $e->getMessage()], 500);
        }
        break;

    default:
        sendJson(['error' => 'Method not allowed'], 405);
}
?>
