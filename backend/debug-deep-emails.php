<?php
require_once 'config.php';
try {
    echo "--- Checking admin_users ---\n";
    $stmt = $pdo->query("SELECT email, full_name FROM admin_users LIMIT 5");
    while($row = $stmt->fetch()) echo "Email: " . $row['email'] . " (" . $row['full_name'] . ")\n";

    echo "\n--- Deep check orders JSON (all) ---\n";
    $stmt = $pdo->query("SELECT shipping_address FROM orders WHERE shipping_address IS NOT NULL");
    $emailsFound = [];
    while($row = $stmt->fetch()) {
        $addr = json_decode($row['shipping_address'], true);
        if (isset($addr['email']) && $addr['email']) {
            $emailsFound[] = $addr['email'];
        }
    }
    echo "Total emails found in orders: " . count($emailsFound) . "\n";
    foreach (array_unique($emailsFound) as $e) echo "- $e\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
