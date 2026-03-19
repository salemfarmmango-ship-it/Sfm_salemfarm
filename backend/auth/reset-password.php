<?php
// backend/auth/reset-password.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');
$newPassword = $input['newPassword'] ?? '';
$verificationToken = $input['verificationToken'] ?? '';

// Sanitize phone number (auto-detect)
if (preg_match('/^[0-9\s\-+]+$/', $identifier)) {
    $identifier = str_replace([' ', '-', '+91'], '', $identifier);
    if (strlen($identifier) === 11 && str_starts_with($identifier, '0')) {
        $identifier = substr($identifier, 1);
    }
}

if (!$identifier || !$newPassword || !$verificationToken) {
    error_log("[Reset Debug] Missing fields: ident=" . ($identifier ? 'Y' : 'N') . ", pass=" . ($newPassword ? 'Y' : 'N') . ", token=" . ($verificationToken ? 'Y' : 'N'));
    sendJson(['error' => 'Missing required fields'], 400);
}

try {
    // Verify token
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("SELECT * FROM verification_tokens WHERE token = ? AND identifier = ? AND purpose = 'reset' AND used = FALSE AND expires_at > ?");
    $stmt->execute([$verificationToken, $identifier, $now]);
    $tokenData = $stmt->fetch();

    if (!$tokenData) {
        sendJson(['error' => 'Invalid or expired verification token'], 400);
    }

    $pdo->beginTransaction();

    // Mark token as used
    $stmt = $pdo->prepare("UPDATE verification_tokens SET used = TRUE WHERE id = ?");
    $stmt->execute([$tokenData['id']]);

    // Format dummy email for phone numbers
    $isPhone = preg_match('/^[6-9][0-9]{9}$/', $identifier);
    $email = $isPhone ? "{$identifier}@phone.salemfarmmango.local" : $identifier;
    
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    $targetUserId = null;
    if ($user) {
        $targetUserId = $user['id'];
    } else if ($isPhone) {
        // Fallback: Check addresses for unmigrated users
        $stmt = $pdo->prepare("SELECT user_id, full_name FROM addresses WHERE phone = ? LIMIT 1");
        $stmt->execute([$identifier]);
        $addr = $stmt->fetch();
        
        if ($addr) {
            $targetUserId = $addr['user_id'];
            // Create the missing user record
            $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (id, email, full_name, password_hash, role) VALUES (?, ?, ?, ?, 'customer')");
            $stmt->execute([$targetUserId, $email, $addr['full_name'], $password_hash]);
            
            $pdo->commit();
            sendJson([
                'success' => true,
                'message' => 'Account activated and password set successfully'
            ]);
            exit();
        }
    }

    if (!$targetUserId) {
        $pdo->rollBack();
        sendJson(['error' => 'User not found'], 404);
    }

    $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$password_hash, $user['id']]);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Password reset successfully'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson(['error' => 'Failed to reset password', 'details' => $e->getMessage()], 500);
}
?>
