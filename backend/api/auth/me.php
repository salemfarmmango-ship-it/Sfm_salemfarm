<?php
// backend/api/auth/me.php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// requireAuth will automatically exit with 401 if token is invalid
$user = requireAuth();

try {
    // Fetch fresh user data from DB
    $stmt = $pdo->prepare("SELECT id, email, full_name, avatar_url, role, created_at FROM users WHERE id = ?");
    $stmt->execute([$user['sub']]);
    $dbUser = $stmt->fetch();

    if (!$dbUser) {
        sendJson(['error' => 'User not found'], 404);
    }

    // Determine auth method based on email format
    $authMethod = str_ends_with($dbUser['email'], '@phone.salemfarmmango.local') ? 'phone' : 'email';
    $phone = $authMethod === 'phone' ? explode('@', $dbUser['email'])[0] : null;

    sendJson([
        'authenticated' => true,
        'user' => [
            'id' => $dbUser['id'],
            'email' => $dbUser['email'],
            'role' => $dbUser['role'] ?? 'user',
            'user_metadata' => [
                'full_name' => $dbUser['full_name'] ?? '',
                'avatar_url' => $dbUser['avatar_url'] ?? null,
                'auth_method' => $authMethod,
                'phone' => $phone
            ],
            'created_at' => $dbUser['created_at']
        ]
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal server error', 'details' => $e->getMessage()], 500);
}
?>
