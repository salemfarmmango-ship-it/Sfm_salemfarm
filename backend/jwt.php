<?php
// backend/jwt.php - Simple JWT Implementation

function generateJWT($payload, $secret = JWT_SECRET) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

    // Ensure payload has exp and iat
    if (!isset($payload['iat'])) $payload['iat'] = time();
    if (!isset($payload['exp'])) $payload['exp'] = time() + (86400 * 7); // 7 days expiry

    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token, $secret = JWT_SECRET) {
    $tokenParts = explode('.', $token);
    if (count($tokenParts) != 3) {
        return false;
    }

    $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[0]));
    $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $tokenParts[1]));
    $providedSignature = $tokenParts[2];

    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    if ($base64UrlSignature === $providedSignature) {
        $decodedPayload = json_decode($payload, true);
        if (isset($decodedPayload['exp']) && $decodedPayload['exp'] < time()) {
            return false; // Token expired
        }
        return $decodedPayload;
    }

    return false;
}

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    }
    else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (isset($_SERVER['HTTP_X_SFM_TOKEN'])) { // Custom header fallback
        return $_SERVER['HTTP_X_SFM_TOKEN'];
    } elseif (isset($_GET['token'])) { // Query param fallback
        return $_GET['token'];
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    // HEADER: Get the access token from the header
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

// Middleware to protect routes
function requireAuth() {
    $token = getBearerToken();
    if (!$token) {
        sendJson(['error' => 'No token provided'], 401);
    }

    $payload = verifyJWT($token);
    if (!$payload) {
        sendJson(['error' => 'Invalid or expired token'], 401);
    }

    // Map Supabase JWT payload to our expected user format
    // Supports both old Supabase token structure and new custom PHP structure
    $user = [
        'sub' => $payload['sub'],
        'email' => $payload['email'] ?? null,
        'role' => $payload['role'] ?? ($payload['user_metadata']['role'] ?? 'customer'),
        'full_name' => $payload['full_name'] ?? ($payload['user_metadata']['full_name'] ?? null)
    ];

    return $user; 
}
?>
