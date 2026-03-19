<?php
require_once 'c:/xampp/htdocs/SFM/backend/config.php';
try {
    $stmt = $pdo->query("DESCRIBE orders");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($columns);
} catch (Exception $e) {
    echo "DB Error: " . $e->getMessage() . "\n";
}
