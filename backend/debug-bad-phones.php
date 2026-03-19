<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT phone, full_name, user_id FROM addresses WHERE LENGTH(phone) != 10 OR phone NOT REGEXP '^[0-9]+$'");
    $badPhones = $stmt->fetchAll();
    echo "Found " . count($badPhones) . " non-standard phone numbers in 'addresses' table:\n";
    foreach ($badPhones as $row) {
        echo "- Phone: |" . $row['phone'] . "|, Name: " . $row['full_name'] . ", ID: " . $row['user_id'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
