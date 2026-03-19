<?php
// backend/auth/login-otp.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = trim($input['identifier'] ?? '');
$verificationToken = $input['verificationToken'] ?? '';
$type = $input['type'] ?? 'phone'; // default to phone if not provided

// Sanitize phone number (auto-detect)
if (preg_match('/^[0-9\s\-+]+$/', $identifier)) {
    $identifier = str_replace([' ', '-', '+91'], '', $identifier);
    if (strlen($identifier) === 11 && str_starts_with($identifier, '0')) {
        $identifier = substr($identifier, 1);
    }
}

if (!$identifier || !$verificationToken) {
    sendJson(['error' => 'Missing identifier or verification token'], 400);
}

$email = $type === 'phone' ? "{$identifier}@phone.salemfarmmango.local" : $identifier;

try {
    // Verify token
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("SELECT * FROM verification_tokens WHERE identifier = ? AND token = ? AND purpose = 'login' AND expires_at > ? LIMIT 1");
    $stmt->execute([$identifier, $verificationToken, $now]);
    $tokenData = $stmt->fetch();

    if (!$tokenData) {
        sendJson(['error' => 'Invalid or expired verification token'], 400);
    }

    // Delete used token
    $stmt = $pdo->prepare("DELETE FROM verification_tokens WHERE id = ?");
    $stmt->execute([$tokenData['id']]);

    // Fetch user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(['error' => 'User not found'], 401);
    }

    // Generate JWT
    $payload = [
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ];
    $token = generateJWT($payload);

    // Determine auth method based on email format
    $authMethod = str_ends_with($user['email'], '@phone.salemfarmmango.local') ? 'phone' : 'email';
    $phone = $authMethod === 'phone' ? explode('@', $user['email'])[0] : null;

    sendJson([
        'success' => true,
        'session' => [
            'access_token' => $token
        ],
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'user_metadata' => [
                'full_name' => $user['full_name'],
                'avatar_url' => $user['avatar_url'],
                'auth_method' => $authMethod,
                'phone' => $phone
            ]
        ],
        'message' => 'Login successful'
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
}
?>
