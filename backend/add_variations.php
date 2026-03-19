<?php
require_once 'config.php';

try {
    $pdo->exec('ALTER TABLE products ADD COLUMN variations JSON DEFAULT NULL AFTER size;');
    echo "Column 'variations' added successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Column 'variations' already exists.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
