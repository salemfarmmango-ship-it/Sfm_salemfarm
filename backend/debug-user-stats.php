<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $row = $stmt->fetch();
    echo "Total users in 'users' table: " . $row['count'] . "\n";
    
    $stmt = $pdo->query("SELECT email FROM users WHERE email LIKE '%@phone.%' LIMIT 20");
    $phoneUsers = $stmt->fetchAll();
    echo "Phone-based users (pattern: %@phone.%):\n";
    foreach ($phoneUsers as $pu) {
        echo "- " . $pu['email'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
