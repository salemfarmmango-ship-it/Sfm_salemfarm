<?php
// backend/api/admin-verify.php
// Verifies that an admin_session ID corresponds to a real admin user in MySQL
require_once '../config.php';

require_once '../jwt.php';

$id = $_GET['id'] ?? '';

if (!$id) {
    sendJson(['authenticated' => false], 401);
}

try {
    $stmt = $pdo->prepare("SELECT id, email, full_name as name, role FROM users WHERE id = ? AND role = 'admin'");
    $stmt->execute([$id]);
    $admin = $stmt->fetch();

    if (!$admin) {
        sendJson(['authenticated' => false], 401);
    }

    $payload = [
        'sub'       => $admin['id'],
        'email'     => $admin['email'],
        'role'      => $admin['role'],
        'full_name' => $admin['name']
    ];
    $token = generateJWT($payload);

    sendJson([
        'authenticated' => true,
        'admin' => $admin,
        'token' => $token
    ]);

} catch (Exception $e) {
    sendJson(['authenticated' => false, 'error' => $e->getMessage()], 500);
}
?>
