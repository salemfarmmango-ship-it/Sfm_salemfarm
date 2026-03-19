<?php
require_once 'c:/xampp/htdocs/SFM/backend/config.php';

try {
    $stmt = $pdo->prepare("UPDATE blogs SET status = 'published' WHERE id = 1");
    $stmt->execute();
    echo "Blog #1 status updated to 'published'. Row count: " . $stmt->rowCount() . "\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
