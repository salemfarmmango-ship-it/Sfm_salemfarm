<?php
require_once 'backend/config.php';
try {
    $stmt = $pdo->query("SELECT * FROM shipping_rates");
    $rates = $stmt->fetchAll();
    echo json_encode($rates, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
