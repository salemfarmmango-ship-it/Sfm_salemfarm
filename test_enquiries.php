<?php
require 'backend/config.php';
try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $pdo->prepare("INSERT INTO bulk_enquiries (name, email, phone, quantity, message) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['Test', 'test@test.com', '1234', '50', 'msg']);
    echo "Bulk insert OK\n";
} catch(Exception $e) {
    echo "Bulk Error: " . $e->getMessage() . "\n";
}

try {
    $stmt = $pdo->prepare("INSERT INTO corporate_enquiries (company_name, contact_person, email, phone, requirements) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute(['Company', 'Person', 'test@test.com', '1234', 'req']);
    echo "Corporate insert OK\n";
} catch(Exception $e) {
    echo "Corporate Error: " . $e->getMessage() . "\n";
}
