<?php
// backend/api/profiles.php
require_once '../config.php';
require_once '../jwt.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? $user['sub'];

if ($method === 'GET') {
    if (!$id) {
        sendJson(['error' => 'Missing ID'], 400);
    }

    try {
        // In this schema, profiles is merged into users
        $stmt = $pdo->prepare("SELECT id, email, full_name, avatar_url, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $profile = $stmt->fetch();

        if (!$profile) {
            sendJson(['error' => 'Profile not found'], 404);
        }

        sendJson($profile);
    } catch (Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
} elseif ($method === 'POST' || $method === 'PUT') {
    // Handle profile updates (e.g. name update)
    $input = json_decode(file_get_contents('php://input'), true);
    $fullName = $input['full_name'] ?? null;
    $avatarUrl = $input['avatar_url'] ?? null;
    
    // In React, upsert is used, so we handle both based on SUB
    $targetId = $input['id'] ?? $user['sub'];
    
    if ($user['role'] !== 'admin' && $targetId !== $user['sub']) {
        sendJson(['error' => 'Forbidden'], 403);
    }

    try {
        $stmt = $pdo->prepare("UPDATE users SET full_name = COALESCE(?, full_name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?");
        $stmt->execute([$fullName, $avatarUrl, $targetId]);
        
        sendJson(['success' => true]);
    } catch (Exception $e) {
        sendJson(['error' => $e->getMessage()], 500);
    }
} else {
    sendJson(['error' => 'Method not allowed'], 405);
}
?>
