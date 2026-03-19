<?php
// backend/api/shipping_rates.php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $state = $_GET['state_name'] ?? null;
        $active = $_GET['is_active'] ?? null;

        $sql = "SELECT * FROM shipping_rates WHERE 1=1";
        $params = [];

        if ($state) {
            $sql .= " AND state_name = ?";
            $params[] = $state;
        }

        if ($active !== null) {
            $sql .= " AND is_active = ?";
            $params[] = $active;
        }

        $sql .= " ORDER BY state_name ASC";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rates = $stmt->fetchAll();

        sendJson($rates);
    } catch (Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
} else {
    sendJson(['error' => 'Method not allowed'], 405);
}
?>
