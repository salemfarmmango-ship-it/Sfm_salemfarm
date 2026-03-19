<?php
// backend/auth/supabase-token.php
// Issues a PHP JWT for a Supabase OAuth user by upserting them into the MySQL users table.
// Called only from the Next.js backend (server-to-server), never from the browser.
// Protected by a shared internal secret.
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

// Internal server-to-server secret check
$internalSecret = $ENV_SFM['INTERNAL_API_SECRET'] ?? 'sfm_internal_secret_change_me';
$providedSecret = $_SERVER['HTTP_X_SFM_INTERNAL'] ?? '';
if ($providedSecret !== $internalSecret) {
    sendJson(['error' => 'Forbidden'], 403);
}

$input = json_decode(file_get_contents('php://input'), true);
$supabaseId = $input['supabase_id'] ?? '';
$email      = $input['email'] ?? '';
$fullName   = $input['full_name'] ?? '';
$avatarUrl  = $input['avatar_url'] ?? '';

if (!$supabaseId || !$email) {
    sendJson(['error' => 'Missing supabase_id or email'], 400);
}

try {
    // Check if user already exists by supabase_id (used as primary key uuid)
    $stmt = $pdo->prepare("SELECT id, email, full_name, role FROM users WHERE id = ?");
    $stmt->execute([$supabaseId]);
    $user = $stmt->fetch();

    if (!$user) {
        // Also check by email (in case migrated without UUID matching)
        $stmt = $pdo->prepare("SELECT id, email, full_name, role FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    }

    if (!$user) {
        // Create user in MySQL (no password for OAuth users)
        $stmt = $pdo->prepare(
            "INSERT INTO users (id, email, full_name, avatar_url, role) VALUES (?, ?, ?, ?, 'customer')
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), avatar_url = VALUES(avatar_url)"
        );
        $stmt->execute([$supabaseId, $email, $fullName, $avatarUrl]);

        $userId = $pdo->lastInsertId() ?: $supabaseId;
        $role   = 'customer';
        $name   = $fullName;
    } else {
        $userId = $user['id'];
        $role   = $user['role'];
        $name   = $user['full_name'];
    }

    // Generate a short-lived PHP JWT (1 hour) for this request
    $payload = [
        'sub'       => $userId,
        'email'     => $email,
        'role'      => $role,
        'full_name' => $name,
        'exp'       => time() + 3600, // 1 hour
    ];
    $token = generateJWT($payload);

    sendJson(['token' => $token, 'user_id' => $userId]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal error: ' . $e->getMessage()], 500);
}
?>
