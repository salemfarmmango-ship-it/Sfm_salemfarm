<?php
require_once 'config.php';
try {
    $stmt = $pdo->query("SELECT u.id, u.email, a.phone FROM users u LEFT JOIN addresses a ON u.id = a.user_id LIMIT 100");
    $data = $stmt->fetchAll();
    echo "User-Phone Mapping:\n";
    foreach ($data as $row) {
        echo "- ID: " . $row['id'] . ", Email: " . $row['email'] . ", Phone: " . ($row['phone'] ?? 'N/A') . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
