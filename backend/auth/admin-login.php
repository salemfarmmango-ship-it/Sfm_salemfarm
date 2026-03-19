<?php
// backend/auth/admin-login.php
require_once '../config.php';
require_once '../jwt.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$email    = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if (!$email || !$password) {
    sendJson(['error' => 'Email and password are required'], 400);
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = 'admin'");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendJson(['error' => 'Invalid email or password'], 401);
    }

    // PHP password_verify handles both $2y$ and $2b$ bcrypt variants
    // Replace $2b$ with $2y$ for compatibility (Node.js uses $2b$, PHP uses $2y$)
    $hash = str_replace('$2b$', '$2y$', $user['password_hash']);

    if (!password_verify($password, $hash)) {
        sendJson(['error' => 'Invalid email or password'], 401);
    }

    // Generate JWT for admin session
    $payload = [
        'sub'       => $user['id'],
        'email'     => $user['email'],
        'role'      => $user['role'],
        'full_name' => $user['full_name']
    ];
    $token = generateJWT($payload);

    sendJson([
        'success' => true,
        'admin' => [
            'id'    => $user['id'],
            'email' => $user['email'],
            'name'  => $user['full_name']
        ],
        'token' => $token
    ]);

} catch (Exception $e) {
    sendJson(['error' => 'Internal server error', 'details' => $e->getMessage()], 500);
}
?>
