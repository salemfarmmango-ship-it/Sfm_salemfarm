<?php
require_once 'config.php';
try {
    echo "--- Checking orders for phone numbers ---\n";
    $stmt = $pdo->query("SELECT shipping_address FROM orders WHERE shipping_address IS NOT NULL LIMIT 50");
    $phones = [];
    while($row = $stmt->fetch()) {
        $addr = json_decode($row['shipping_address'], true);
        if (isset($addr['phone']) && $addr['phone']) {
            $phones[] = $addr['phone'];
        }
    }
    $uniquePhones = array_unique($phones);
    echo "Total unique phones in orders: " . count($uniquePhones) . "\n";
    foreach ($uniquePhones as $p) echo "- '$p'\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
