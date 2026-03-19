<?php
require_once 'config.php';
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
    echo "Successfully added 'updated_at' column to 'users' table.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
