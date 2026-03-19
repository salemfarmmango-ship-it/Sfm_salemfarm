<?php
require_once 'config.php';
try {
    // 1. Find UserIDs in orders NOT in users table
    $stmt = $pdo->query("SELECT DISTINCT user_id FROM orders WHERE user_id NOT IN (SELECT id FROM users)");
    $orphansInOrders = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Found " . count($orphansInOrders) . " orphaned UserIDs in 'orders' table.\n";

    // 2. Check which of these are ALSO missing from addresses table
    $completelyMissing = [];
    foreach ($orphansInOrders as $uid) {
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM addresses WHERE user_id = ?");
        $stmt->execute([$uid]);
        if ($stmt->fetchColumn() == 0) {
            $completelyMissing[] = $uid;
        }
    }
    echo "Of these, " . count($completelyMissing) . " are ALSO missing from 'addresses' table.\n";

    // 3. Look inside shipping_address JSON for these completely missing users
    foreach (array_slice($completelyMissing, 0, 10) as $uid) {
        $stmt = $pdo->prepare("SELECT shipping_address FROM orders WHERE user_id = ? LIMIT 1");
        $stmt->execute([$uid]);
        $json = $stmt->fetchColumn();
        $addr = json_decode($json, true);
        echo "- UserID: $uid, Phone in JSON: " . ($addr['phone'] ?? 'N/A') . ", Name: " . ($addr['full_name'] ?? 'N/A') . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
