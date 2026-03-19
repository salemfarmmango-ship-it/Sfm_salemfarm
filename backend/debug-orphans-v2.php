<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT COUNT(DISTINCT user_id) FROM addresses WHERE user_id NOT IN (SELECT id FROM users)");
    echo "Orphaned user_ids in addresses: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) FROM addresses");
    echo "Total records in addresses: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $pdo->query("SELECT user_id, phone FROM addresses WHERE user_id NOT IN (SELECT id FROM users) LIMIT 20");
    echo "Sample orphans:\n";
    while($row = $stmt->fetch()) {
        echo "- ID: " . $row['user_id'] . ", Phone: " . $row['phone'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
