<?php
// backend/config.php
date_default_timezone_set('Asia/Kolkata');

// Load .env variables manually (XAMPP doesn't auto-load them)
$envFile = __DIR__ . '/../.env';
$ENV_SFM = [];
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (!$line || strpos($line, '#') === 0)
            continue;
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $ENV_SFM[trim($parts[0])] = trim($parts[1], " \t\n\r\0\x0B\"'");
        }
    }
}

// CORS Headers - Modify as needed for production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // Set your MySQL password here
define('DB_NAME', 'sfms'); // Ensure you create this database in phpMyAdmin

// JWT Secret
define('JWT_SECRET', $ENV_SFM['JWT_SECRET'] ?? 'your_super_secret_jwt_key_here_change_in_production');

// Connect to Database
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
    // Set PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Fetch objects by default
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
}
catch (PDOException $e) {
    // Return JSON error response if connection fails
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Utility function to send JSON response
function sendJson($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($data);
    exit();
}
?>
