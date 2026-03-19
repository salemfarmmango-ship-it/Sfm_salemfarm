<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT shipping_address FROM orders WHERE shipping_address IS NOT NULL");
    $count = 0;
    while($row = $stmt->fetch()) {
        $addr = json_decode($row['shipping_address'], true);
        if (isset($addr['email'])) {
            echo "Found Email: " . $addr['email'] . "\n";
            $count++;
        }
    }
    echo "Total Emails Found in orders JSON: " . $count . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
