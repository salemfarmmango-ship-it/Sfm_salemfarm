<?php
/**
 * test-connection.php
 * Upload this to https://salemfarmmango.com/api/ and access it to verify database connection
 */

header('Content-Type: application/json');

// Load config
require_once __DIR__ . '/config.php';

$response = [
    'timestamp' => date('Y-m-d H:i:s'),
    'php_version' => phpversion(),
    'env_file_used' => $envFileUsed ?? 'None found',
    'database' => [],
    'environment' => [],
    'errors' => []
];

// Check what environment variables were loaded
$response['environment'] = [
    'DB_HOST' => defined('DB_HOST') ? DB_HOST : 'NOT DEFINED',
    'DB_USER' => defined('DB_USER') ? DB_USER : 'NOT DEFINED',
    'DB_NAME' => defined('DB_NAME') ? DB_NAME : 'NOT DEFINED',
    'DB_PORT' => defined('DB_PORT') ? DB_PORT : 'NOT DEFINED',
    'APP_ENV' => $ENV_SFM['APP_ENV'] ?? 'NOT SET',
    'API_BASE_URL' => $ENV_SFM['API_BASE_URL'] ?? 'NOT SET',
    'FRONTEND_URL' => $ENV_SFM['FRONTEND_URL'] ?? 'NOT SET'
];

// Test database connection
try {
    if (!defined('DB_HOST') || !defined('DB_USER') || !defined('DB_NAME')) {
        throw new Exception('Database constants not defined. Check .env.production file.');
    }

    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";port=" . DB_PORT . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_STRINGIFY_FETCHES => false
        ]
    );

    // Test query
    $stmt = $pdo->query("SELECT 1 as test");
    $test = $stmt->fetch();

    $response['database']['status'] = 'SUCCESS';
    $response['database']['message'] = 'Database connection successful!';
    $response['database']['test_query'] = $test;

    // Get table count
    $stmt = $pdo->query("SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = '" . DB_NAME . "'");
    $result = $stmt->fetch();
    $response['database']['table_count'] = $result['table_count'] ?? 0;

    // List tables
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $response['database']['tables'] = $tables;

    // Sample data from products
    if (in_array('products', $tables)) {
        $stmt = $pdo->query("SELECT COUNT(*) as product_count FROM products");
        $result = $stmt->fetch();
        $response['database']['product_count'] = $result['product_count'] ?? 0;
    }

} catch (PDOException $e) {
    http_response_code(500);
    $response['database']['status'] = 'ERROR';
    $response['database']['message'] = 'Database connection failed!';
    $response['database']['error'] = $e->getMessage();
    $response['database']['error_code'] = $e->getCode();
    $response['errors'][] = 'Database connection failed: ' . $e->getMessage();

} catch (Exception $e) {
    http_response_code(500);
    $response['database']['status'] = 'ERROR';
    $response['database']['message'] = $e->getMessage();
    $response['errors'][] = $e->getMessage();
}

// Check CORS headers
$response['cors'] = [
    'origin_header' => $_SERVER['HTTP_ORIGIN'] ?? 'Not sent by browser',
    'allowed_origins' => [
        'https://salemfarmmango.com',
        'https://www.salemfarmmango.com',
        'https://salemfarmmango.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
    ]
];

// Check if .env.production exists
$response['file_checks'] = [
    '.env.production in /api' => file_exists(__DIR__ . '/.env.production') ? '✓ Found' : '✗ NOT FOUND',
    '.env.production in parent' => file_exists(__DIR__ . '/../.env.production') ? '✓ Found' : '✗ NOT FOUND',
    'config.php' => file_exists(__DIR__ . '/config.php') ? '✓ Found' : '✗ NOT FOUND',
    '.htaccess' => file_exists(__DIR__ . '/.htaccess') ? '✓ Found' : '✗ NOT FOUND'
];

// Output response
if (empty($response['errors'])) {
    http_response_code(200);
    $response['overall_status'] = '✓ ALL SYSTEMS GO!';
} else {
    http_response_code(500);
    $response['overall_status'] = '✗ CONFIGURATION ISSUES DETECTED';
}

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>
