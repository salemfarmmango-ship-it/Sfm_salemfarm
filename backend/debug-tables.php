<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Tables in database:\n";
    foreach ($tables as $t) echo "- $t\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
