<?php
require_once 'config.php';
try {
    echo "--- Checking bulk_enquiries ---\n";
    $stmt = $pdo->query("SELECT email, name FROM bulk_enquiries WHERE email IS NOT NULL LIMIT 10");
    while($row = $stmt->fetch()) echo "Email: " . $row['email'] . " (" . $row['name'] . ")\n";

    echo "\n--- Checking corporate_enquiries ---\n";
    $stmt = $pdo->query("SELECT email, contact_person FROM corporate_enquiries WHERE email IS NOT NULL LIMIT 10");
    while($row = $stmt->fetch()) echo "Email: " . $row['email'] . " (" . $row['contact_person'] . ")\n";

    echo "\n--- Checking newsletter_subscribers ---\n";
    $stmt = $pdo->query("SELECT email FROM newsletter_subscribers LIMIT 10");
    while($row = $stmt->fetch()) echo "Email: " . $row['email'] . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
