<?php
require_once 'backend/config.php';
try {
    $stmt = $pdo->query("DESCRIBE users");
    print_r($stmt->fetchAll());
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
