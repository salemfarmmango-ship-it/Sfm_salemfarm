<?php
// backend/auth/login.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$identifier = $input['identifier'] ?? '';
$password = $input['password'] ?? '';

if (!$identifier || !$password) {
    sendJson(['error' => 'Missing identifier or password'], 400);
}

// Convert phone number to the pseudo-email if needed, to match existing frontend logic
$isPhone = preg_match('/^[6-9][0-9]{9}$/', $identifier);
$email = $isPhone ? "{$identifier}@phone.salemfarmmango.local" : $identifier;

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendJson(['error' => 'Invalid credentials'], 401);
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
