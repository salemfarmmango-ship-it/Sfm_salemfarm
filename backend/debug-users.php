<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT id, email, role FROM users LIMIT 20");
    $users = $stmt->fetchAll();
    echo "Users in database:\n";
    foreach ($users as $user) {
        echo "- ID: " . $user['id'] . ", Email: " . $user['email'] . ", Role: " . $user['role'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
