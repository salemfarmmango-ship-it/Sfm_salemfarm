<?php
require_once 'backend/config.php';
try {
    $stmt = $pdo->query("SHOW TABLES LIKE 'notification_tokens'");
    $exists = $stmt->fetch();
    if ($exists) {
        echo "Table notification_tokens exists.\n";
        $stmt = $pdo->query("DESCRIBE notification_tokens");
        $columns = $stmt->fetchAll();
        print_r($columns);
    } else {
        echo "Table notification_tokens does NOT exist.\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
