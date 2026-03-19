<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT user_id, phone, full_name FROM addresses LIMIT 20");
    $addresses = $stmt->fetchAll();
    echo "Addresses in database:\n";
    foreach ($addresses as $addr) {
        echo "- UserID: " . $addr['user_id'] . ", Phone: " . $addr['phone'] . ", Name: " . $addr['full_name'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
