<?php
// backend/auth/google.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$idToken = $input['credential'] ?? '';

if (!$idToken) {
    sendJson(['error' => 'Google ID Token is required'], 400);
}

try {
    // Verify ID Token with Google API
    // In a production environment, you should use the Google PHP Client Library for off-line verification
    // but for this implementation, we use the tokeninfo endpoint which is standard.
    $verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($idToken);
    $response = file_get_contents($verifyUrl);
    
    if ($response === false) {
        sendJson(['error' => 'Failed to verify Google token'], 401);
    }
    
    $payload = json_decode($response, true);
    
    if (isset($payload['error_description'])) {
        sendJson(['error' => $payload['error_description']], 401);
    }

    // Check if the token was intended for our client ID if needed
    // $clientId = "your-google-client-id.apps.googleusercontent.com";
    // if ($payload['aud'] !== $clientId) { ... }

    $email = $payload['email'];
    $fullName = $payload['name'] ?? 'Google User';
    $avatarUrl = $payload['picture'] ?? null;
    $googleId = $payload['sub']; // Unique Google ID

    // Check if user exists in MySQL
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Create new user
        $userId = bin2hex(random_bytes(16)); // Generate a UUID-like ID
        // Note: We use a pseudo-UUID to match the char(36) PRI key from our earlier check
        $userId = sprintf('%s-%s-%s-%s-%s',
            substr($userId, 0, 8),
            substr($userId, 8, 4),
            substr($userId, 12, 4),
            substr($userId, 16, 4),
            substr($userId, 20, 12)
        );

        $stmt = $pdo->prepare("INSERT INTO users (id, email, full_name, avatar_url, role) VALUES (?, ?, ?, ?, 'customer')");
        $stmt->execute([$userId, $email, $fullName, $avatarUrl]);
        
        // Fetch the newly created user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
    } else {
        // Update avatar if changed
        if ($avatarUrl && $user['avatar_url'] !== $avatarUrl) {
            $stmt = $pdo->prepare("UPDATE users SET avatar_url = ?, full_name = ? WHERE id = ?");
            $stmt->execute([$avatarUrl, $fullName, $user['id']]);
        }
    }

    // Generate JWT
    $jwtPayload = [
        'sub' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'full_name' => $user['full_name']
    ];
    $token = generateJWT($jwtPayload);

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
                'auth_method' => 'google'
            ]
        ],
        'message' => 'Login successful via Google'
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal Server Error', 'details' => $e->getMessage()], 500);
}
?>
