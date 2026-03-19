<?php
// backend/auth/change-password.php
require_once '../config.php';
require_once '../jwt.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
$currentPassword = $input['currentPassword'] ?? '';
$newPassword = $input['newPassword'] ?? '';

if (!$currentPassword || !$newPassword) {
    sendJson(['error' => 'Current and new passwords are required'], 400);
}

if (strlen($newPassword) < 6) {
    sendJson(['error' => 'New password must be at least 6 characters'], 400);
}

try {
    // Fetch user
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$user['sub']]);
    $dbUser = $stmt->fetch();

    if (!$dbUser) {
        sendJson(['error' => 'User not found'], 404);
    }

    // Verify current password
    // Handle $2b$ to $2y$ compatibility as in admin-login.php
    $hash = str_replace('$2b$', '$2y$', $dbUser['password_hash']);
    if (!password_verify($currentPassword, $hash)) {
        sendJson(['error' => 'Current password is incorrect'], 401);
    }

    // Hash new password
    $newHash = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update password
    $now = date('Y-m-d H:i:s');
    $updateStmt = $pdo->prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?");
    $updateStmt->execute([$newHash, $now, $user['sub']]);

    sendJson(['success' => true, 'message' => 'Password updated successfully']);

} catch (Exception $e) {
    sendJson(['error' => $e->getMessage()], 500);
}
?>
