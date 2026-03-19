<?php
require_once 'config.php';

// Test OTP Flow
$identifier = '9994050456';
$code = '123456';
$type = 'phone';
$purpose = 'signup';

try {
    // 1. Create OTP
    $now = date('Y-m-d H:i:s');
    $expiresAt = date('Y-m-d H:i:s', time() + (30 * 60));
    $otpId = bin2hex(random_bytes(16));
    
    $pdo->prepare("DELETE FROM otp_verifications WHERE identifier = ?")->execute([$identifier]);
    
    $stmt = $pdo->prepare("INSERT INTO otp_verifications (id, identifier, type, code, expires_at) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$otpId, $identifier, $type, $code, $expiresAt])) {
        echo "Successfully created OTP for $identifier expiring at $expiresAt\n";
    }

    // 2. Verify OTP (using the logic from verify-otp.php)
    $now_verify = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("SELECT * FROM otp_verifications WHERE identifier = ? AND code = ? AND verified = FALSE AND expires_at > ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$identifier, $code, $now_verify]);
    $otpData = $stmt->fetch();

    if ($otpData) {
        echo "OTP matched! Expiry: " . $otpData['expires_at'] . ", Current Time: $now_verify\n";
        $pdo->prepare("UPDATE otp_verifications SET verified = TRUE WHERE id = ?")->execute([$otpData['id']]);
        echo "OTP marked as verified.\n";
    } else {
        echo "OTP NOT found or expired! (Check if $now_verify is > than " . $expiresAt . ")\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
