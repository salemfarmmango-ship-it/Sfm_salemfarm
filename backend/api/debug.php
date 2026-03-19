<?php
/**
 * Debug File - Check environment and database status
 * Access: https://salemfarmmango.com/api/debug.php
 */

// Get .env file status
$possibleEnvFiles = [
    __DIR__ . '/.env.production',
    __DIR__ . '/../.env.production',
    __DIR__ . '/../../../.env.production',
    __DIR__ . '/.env',
    __DIR__ . '/../.env',
];

$envStatus = [];
foreach ($possibleEnvFiles as $file) {
    $envStatus[$file] = [
        'exists' => file_exists($file),
        'readable' => is_readable($file),
        'size' => file_exists($file) ? filesize($file) : null
    ];
}

// Load env file
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

// Get database credentials
$DB_HOST = $ENV_SFM['DB_HOST'] ?? 'localhost';
$DB_USER = $ENV_SFM['DB_USER'] ?? 'root';
$DB_PASS = $ENV_SFM['DB_PASS'] ?? '';
$DB_NAME = $ENV_SFM['DB_NAME'] ?? 'sfms';
$DB_PORT = $ENV_SFM['DB_PORT'] ?? 3306;

// Test database connection
$dbTestResult = [
    'host' => $DB_HOST,
    'port' => $DB_PORT,
    'database' => $DB_NAME,
    'user' => $DB_USER,
    'password' => strlen($DB_PASS) . ' characters',
    'connected' => false,
    'error' => null,
    'tables' => []
];

try {
    $dsn = "mysql:host=" . $DB_HOST . ":" . $DB_PORT . ";dbname=" . $DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS);
    $dbTestResult['connected'] = true;
    
    // Get tables
    $stmt = $pdo->query("SHOW TABLES");
    $dbTestResult['tables'] = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
} catch (PDOException $e) {
    $dbTestResult['connected'] = false;
    $dbTestResult['error'] = $e->getMessage();
}

// Send JSON response
header('Content-Type: application/json');
echo json_encode([
    'status' => 'debug',
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [
        'php_version' => phpversion(),
        'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
        'current_file' => __FILE__,
        'current_dir' => __DIR__
    ],
    'env_files' => $envStatus,
    'env_file_used' => $envFileUsed,
    'env_variables_loaded' => count($ENV_SFM) . ' variables',
    'database' => $dbTestResult,
    'api_url' => $ENV_SFM['API_BASE_URL'] ?? 'Not set',
    'frontend_url' => $ENV_SFM['FRONTEND_URL'] ?? 'Not set'
], JSON_PRETTY_PRINT);
?>
