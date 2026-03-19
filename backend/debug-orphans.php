<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT DISTINCT user_id FROM addresses WHERE user_id NOT IN (SELECT id FROM users)");
    $orphans = $stmt->fetchAll();
    echo "Number of UserIDs in 'addresses' NOT in 'users': " . count($orphans) . "\n";
    foreach (array_slice($orphans, 0, 10) as $o) {
        $stmt = $pdo->prepare("SELECT phone, full_name FROM addresses WHERE user_id = ? LIMIT 1");
        $stmt->execute([$o['user_id']]);
        $addr = $stmt->fetch();
        echo "- ID: " . $o['user_id'] . ", Phone: " . $addr['phone'] . ", Name: " . $addr['full_name'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
