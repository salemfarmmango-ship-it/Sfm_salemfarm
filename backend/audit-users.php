<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "Total Users in MySQL: " . $stmt->fetchColumn() . "\n";
    $stmt = $pdo->query("SELECT email FROM users LIMIT 30");
    while($row = $stmt->fetch()) echo "- " . $row['email'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
