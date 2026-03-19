<?php
// backend/auth/signup.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');
$password = $input['password'] ?? '';
$verificationToken = $input['verificationToken'] ?? '';
$type = $input['type'] ?? '';

// Sanitize phone number if type is phone
if ($type === 'phone') {
    $identifier = str_replace([' ', '-', '+91'], '', $identifier);
    if (strlen($identifier) === 11 && str_starts_with($identifier, '0')) {
        $identifier = substr($identifier, 1);
    }
}

if (!$identifier || !$password || !$verificationToken || !$type) {
    error_log("[Signup Debug] Missing fields: ident=" . ($identifier ? 'Y' : 'N') . ", pass=" . ($password ? 'Y' : 'N') . ", token=" . ($verificationToken ? 'Y' : 'N') . ", type=" . ($type ? 'Y' : 'N'));
    sendJson(['error' => 'Missing required fields'], 400);
}

try {
    // Verify token
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("SELECT * FROM verification_tokens WHERE token = ? AND identifier = ? AND purpose = 'signup' AND used = FALSE AND expires_at > ?");
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
    $email = $type === 'phone' ? "{$identifier}@phone.salemfarmmango.local" : $identifier;
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    $userId = bin2hex(random_bytes(16)); // simple UUID equivalent

    // Create user
    $stmt = $pdo->prepare("INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'customer')");
    $stmt->execute([$userId, $email, $password_hash]);

    $pdo->commit();

    // Generate JWT
    $payload = [
        'sub' => $userId,
        'email' => $email,
        'role' => 'customer',
        'full_name' => null
    ];
    $token = generateJWT($payload);

    sendJson([
        'success' => true,
        'session' => [
            'access_token' => $token
        ],
        'user' => [
            'id' => $userId,
            'email' => $email,
            'role' => 'customer',
            'user_metadata' => [
                'auth_method' => $type,
                'phone' => $type === 'phone' ? $identifier : null
            ]
        ],
        'message' => 'Account created successfully'
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    sendJson(['error' => 'Failed to create account', 'details' => $e->getMessage()], 500);
}
?>
