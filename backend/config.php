<?php
// backend/config.php
date_default_timezone_set('Asia/Kolkata');

// Load .env variables
// In production (cPanel): /public_html/.env.production
// In development (local): /backend/../.env
$possibleEnvFiles = [
    __DIR__ . '/.env.production',              // Direct in api folder
    __DIR__ . '/../.env.production',           // Parent folder (public_html)
    __DIR__ . '/../../../.env.production',     // Further up
    __DIR__ . '/.env',                         // Local development
    __DIR__ . '/../.env',                      // Parent folder
];

$ENV_SFM = [];
$envFileUsed = null;

foreach ($possibleEnvFiles as $envFile) {
    if (file_exists($envFile)) {
        $envFileUsed = $envFile;
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
        break;
    }
}

// CORS Headers - Allow only salemfarmmango domains
$allowedOrigins = [
    'https://salemfarmmango.com',
    'https://www.salemfarmmango.com',
    'https://salemfarmmango.vercel.app',
    'http://localhost:3000',  // Development frontend
    'http://localhost:3001'   // Local backend
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// Handle preflight OPTIONS requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Credentials - Load from environment variables
define('DB_HOST', $ENV_SFM['DB_HOST'] ?? 'localhost');
define('DB_USER', $ENV_SFM['DB_USER'] ?? 'root');
define('DB_PASS', $ENV_SFM['DB_PASS'] ?? '');
define('DB_NAME', $ENV_SFM['DB_NAME'] ?? 'sfms');
define('DB_PORT', $ENV_SFM['DB_PORT'] ?? 3306);

// JWT Configuration
define('JWT_SECRET', $ENV_SFM['JWT_SECRET'] ?? 'your_super_secret_jwt_key_here_change_in_production');
define('JWT_EXPIRY', intval($ENV_SFM['JWT_EXPIRY'] ?? '86400')); // 24 hours

// API Configuration
define('API_BASE_URL', $ENV_SFM['API_BASE_URL'] ?? 'https://salemfarmmango.com/api');
define('FRONTEND_URL', $ENV_SFM['FRONTEND_URL'] ?? 'https://salemfarmmango.vercel.app');

// Debug Mode (disable in production)
define('DEBUG_MODE', filter_var($ENV_SFM['DEBUG'] ?? 'false', FILTER_VALIDATE_BOOLEAN));

// Connect to Database
try {
    $dsn = "mysql:host=" . DB_HOST . ":" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
catch (PDOException $e) {
    http_response_code(500);
    
    if (DEBUG_MODE) {
        echo json_encode([
            'error' => 'Database connection failed',
            'details' => $e->getMessage(),
            'host' => DB_HOST,
            'port' => DB_PORT,
            'database' => DB_NAME,
            'user' => DB_USER,
            'env_file_used' => $envFileUsed ?? 'NONE FOUND'
        ]);
    } else {
        echo json_encode(['error' => 'Database connection failed']);
    }
    
    error_log('DB Connection Error: ' . $e->getMessage() . ' | File: ' . $e->getFile() . ' | Line: ' . $e->getLine());
    error_log('DB Connection Details: Host=' . DB_HOST . ', Port=' . DB_PORT . ', DB=' . DB_NAME . ', User=' . DB_USER);
    error_log('Env File Used: ' . ($envFileUsed ?? 'NONE'));
    exit();
}

// Utility function to send JSON response
function sendJson($data, $statusCode = 200)
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($data);
    exit();
}

// Error Logging Setup
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Ensure logs directory exists
$logsDir = __DIR__ . '/../logs';
if (!is_dir($logsDir)) {
    mkdir($logsDir, 0755, true);
}

// Helper function for logging
function logError($message, $context = []) {
    error_log(date('Y-m-d H:i:s') . ' | ' . $message . ' | ' . json_encode($context));
}

// Input sanitization helper
function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>
