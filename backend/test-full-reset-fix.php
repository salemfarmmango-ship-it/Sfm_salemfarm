<?php
require_once 'config.php';

// Verification Script for Unmigrated User Reset
try {
    // 1. Find an orphaned record in addresses
    $stmt = $pdo->query("SELECT user_id, phone, full_name FROM addresses WHERE user_id NOT IN (SELECT id FROM users) LIMIT 1");
    $orphaned = $stmt->fetch();
    
    if (!$orphaned) {
        echo "No orphaned records found for testing.\n";
        exit();
    }
    
    $userId = $orphaned['user_id'];
    $phone = $orphaned['phone'];
    $name = $orphaned['full_name'];
    echo "Testing with unmigrated User: $name ($phone, ID: $userId)\n";

    // 2. Simulate send-otp.php (should now find the user in addresses)
    $stmt = $pdo->prepare("SELECT user_id FROM addresses WHERE phone = ? LIMIT 1");
    $stmt->execute([$phone]);
    if ($stmt->fetch()) {
        echo "SUCCESS: send-otp.php logic found user in addresses.\n";
    } else {
        echo "FAILURE: send-otp.php logic failed to find user.\n";
    }

    // 3. Simulate reset-password.php logic
    $pdo->beginTransaction();
    $email = "{$phone}@phone.salemfarmmango.local";
    $newPassword = 'test_password_123';
    
    // Lookup logic from reset-password.php
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo "User not in 'users' table (as expected).\n";
        $stmt = $pdo->prepare("SELECT user_id, full_name FROM addresses WHERE phone = ? LIMIT 1");
        $stmt->execute([$phone]);
        $addr = $stmt->fetch();
        if ($addr) {
            echo "Found in addresses. Creating user record...\n";
            $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, 'customer')");
            $stmt->execute([$addr['user_id'], $email, $addr['full_name'], $password_hash]);
            echo "User record created successfully!\n";
        }
    }
    $pdo->commit();

    // 4. Final verification
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $finalUser = $stmt->fetch();
    if ($finalUser && $finalUser['email'] === $email) {
        echo "FINAL VERIFICATION SUCCESS: User now exists in MySQL with correct data.\n";
        // Cleanup the test-created user to reset state
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$userId]);
        echo "Cleanup: Removed newly created user for testing.\n";
    } else {
        echo "FINAL VERIFICATION FAILURE.\n";
    }

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
?>
