<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT phone FROM addresses LIMIT 50");
    $phones = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Phone formats in addresses:\n";
    foreach ($phones as $p) {
        echo "- '" . $p . "' (length: " . strlen($p) . ")\n";
    }
    
    $stmt = $pdo->query("SELECT shipping_address FROM orders WHERE shipping_address IS NOT NULL LIMIT 20");
    $orders = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "\nEmail field in shipping_address JSON:\n";
    foreach ($orders as $json) {
        $addr = json_decode($json, true);
        if (isset($addr['email'])) {
            echo "- Found Email: " . $addr['email'] . "\n";
        } else {
            echo "- No Email field in this JSON\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
