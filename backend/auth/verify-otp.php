<?php
// backend/auth/verify-otp.php
require_once '../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');
$code = $input['code'] ?? '';
$purpose = $input['purpose'] ?? '';

// Sanitize phone number (auto-detect)
if (preg_match('/^[0-9\s\-+]+$/', $identifier)) {
    $identifier = str_replace([' ', '-', '+91'], '', $identifier);
    if (strlen($identifier) === 11 && str_starts_with($identifier, '0')) {
        $identifier = substr($identifier, 1);
    }
}

if (!$identifier || !$code || !$purpose) {
    sendJson(['error' => 'Missing required fields'], 400);
}

try {
    // Find valid OTP
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("SELECT * FROM otp_verifications WHERE identifier = ? AND code = ? AND verified = FALSE AND expires_at > ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$identifier, $code, $now]);
    $otpData = $stmt->fetch();

    if (!$otpData) {
        sendJson(['error' => 'Invalid or expired OTP'], 400);
    }

    // Mark OTP as verified
    $stmt = $pdo->prepare("UPDATE otp_verifications SET verified = TRUE WHERE id = ?");
    $stmt->execute([$otpData['id']]);

    // Generate verification token (15 mins)
    $token = bin2hex(random_bytes(32));
    $expiresAt = date('Y-m-d H:i:s', time() + (15 * 60));
    $tokenId = bin2hex(random_bytes(16));

    // Store verification token (Upsert technically, but we can just insert and delete old ones of same purpose+identifier)
    // Delete old ones first instead of real upsert (simplified for MySQL)
    $stmt = $pdo->prepare("DELETE FROM verification_tokens WHERE identifier = ? AND purpose = ?");
    $stmt->execute([$identifier, $purpose]);

    $stmt = $pdo->prepare("INSERT INTO verification_tokens (id, identifier, token, purpose, expires_at) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$tokenId, $identifier, $token, $purpose, $expiresAt]);

    sendJson([
        'success' => true,
        'verificationToken' => $token,
        'message' => 'OTP verified successfully'
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
}
?>
