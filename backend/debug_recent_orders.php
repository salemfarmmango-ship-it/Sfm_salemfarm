<?php
require_once 'config.php';

try {
    $stmt = $pdo->query("SELECT id, user_id, total_amount, status, payment_status, created_at FROM orders ORDER BY id DESC LIMIT 5");
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['orders' => $orders]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
