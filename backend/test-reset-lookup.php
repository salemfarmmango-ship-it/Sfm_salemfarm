<?php
require_once 'config.php';

$phone = '9991112223';
$email = "{$phone}@phone.salemfarmmango.local";
$userId = bin2hex(random_bytes(16));

try {
    // 1. Insert test user
    $stmt = $pdo->prepare("INSERT INTO users (id, email, role) VALUES (?, ?, 'customer')");
    $stmt->execute([$userId, $email]);
    echo "Created test user: $email\n";

    // 2. Simulate send-otp.php logic for 'reset'
    $type = 'phone';
    $purpose = 'reset';
    $identifier = $phone;
    
    $emailToCheck = $type === 'phone' ? "{$identifier}@phone.salemfarmmango.local" : $identifier;
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$emailToCheck]);
    $userExists = $stmt->fetch();

    if ($userExists) {
        echo "SUCCESS: User found for reset: " . $userExists['id'] . "\n";
    } else {
        echo "FAILURE: User NOT found for reset using $emailToCheck\n";
    }

    // Cleanup
    $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
    echo "Cleaned up test user.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
