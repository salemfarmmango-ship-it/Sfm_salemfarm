<?php
// backend/api/auth/logout.php
require_once __DIR__ . '/../../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJson(['error' => 'Method not allowed']);
}

// Logout is typically a client-side operation (clear token from localStorage)
// This endpoint is just a confirmation endpoint

try {
    // Get JWT token from Authorization header
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? '';
    
    if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
        http_response_code(401);
        sendJson(['error' => 'No token provided']);
    }

    // Token validation (optional - can add to blacklist if needed)
    // For now, just confirm logout
    
    sendJson([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);

} catch (Exception $e) {
    logError('Logout error', ['error' => $e->getMessage()]);
    http_response_code(500);
    sendJson(['error' => 'Logout failed']);
}
?>
