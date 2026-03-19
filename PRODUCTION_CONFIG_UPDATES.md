# PRODUCTION CONFIG UPDATES

## Files That Need Changes Before Deployment

### 1. backend/config.php - CRITICAL CHANGES

**Current Issues:**
- Hardcoded `root` user (localhost development)
- CORS allows ALL origins (`*`)
- Database credentials not from environment

**Update Required:**

```php
<?php
// backend/config.php - PRODUCTION VERSION
date_default_timezone_set('Asia/Kolkata');

// Load .env variables
$envFile = __DIR__ . '/../.env.production';
$ENV_SFM = [];

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (!$line || strpos($line, '#') === 0) continue;
        
        $parts = explode('=', $line, 2);
        if (count($parts) === 2) {
            $ENV_SFM[trim($parts[0])] = trim($parts[1], " \t\n\r\0\x0B\"'");
        }
    }
}

// ========== IMPORTANT: UPDATE FOR PRODUCTION ==========
// CORS Headers - ONLY allow your Vercel domain
$allowedOrigins = [
    'https://yourdomain.vercel.app',
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ========== UPDATE THESE FROM ENVIRONMENT ==========
define('DB_HOST', $ENV_SFM['DB_HOST'] ?? 'localhost');
define('DB_USER', $ENV_SFM['DB_USER'] ?? 'root');
define('DB_PASS', $ENV_SFM['DB_PASS'] ?? '');
define('DB_NAME', $ENV_SFM['DB_NAME'] ?? 'sfms');
define('DB_PORT', $ENV_SFM['DB_PORT'] ?? 3306);

// JWT Secret - MUST BE LONG AND RANDOM
define('JWT_SECRET', $ENV_SFM['JWT_SECRET'] ?? 'CHANGE_THIS_IN_PRODUCTION_USE_VERY_LONG_STRING');
define('JWT_EXPIRY', intval($ENV_SFM['JWT_EXPIRY'] ?? '86400')); // 24 hours

// API URLs
define('API_BASE_URL', $ENV_SFM['API_BASE_URL'] ?? 'https://yourdomain.com/api');
define('FRONTEND_URL', $ENV_SFM['FRONTEND_URL'] ?? 'https://yourdomain.vercel.app');

// Debug Mode (disable in production)
define('DEBUG_MODE', filter_var($ENV_SFM['DEBUG'] ?? 'false', FILTER_VALIDATE_BOOLEAN));

// ========== DATABASE CONNECTION ==========
try {
    $dsn = "mysql:host=" . DB_HOST . ":" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $pdo = new PDO($dsn, DB_USER, DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    
    if (DEBUG_MODE) {
        echo json_encode([
            'error' => 'Database connection failed',
            'details' => $e->getMessage()
        ]);
    } else {
        echo json_encode(['error' => 'Database connection failed']);
    }
    
    error_log('DB Connection Error: ' . $e->getMessage());
    exit();
}

// ========== LOGGING ==========
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../error.log');

// ========== UTILITY FUNCTIONS ==========
function sendJson($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo json_encode($data);
    exit();
}

function logError($message, $context = []) {
    error_log(date('Y-m-d H:i:s') . ' | ' . $message . ' | ' . json_encode($context));
}

function sanitize($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
?>
```

### 2. Create backend/.htaccess

```apache
# Enable mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    # Block direct access to .php files
    <FilesMatch "\.php$">
        Deny from all
    </FilesMatch>
    
    # Allow public API files
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [QSA,L]
    
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [QSA,L]
    
    # Route all requests
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
    Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header set Content-Security-Policy "default-src 'self'"
</IfModule>

# Disable directory listing
Options -Indexes

# Set PHP memory and timeout
php_value memory_limit 256M
php_value max_execution_time 300
php_value upload_max_filesize 50M
php_value post_max_size 50M
```

### 3. Create backend/api/index.php

```php
<?php
// backend/api/index.php - Main router
require_once __DIR__ . '/../config.php';

// Parse request path
$basePath = '/api/';
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$relativePath = str_replace($basePath, '', $requestUri);
$parts = array_filter(explode('/', trim($relativePath, '/')));

if (empty($parts)) {
    http_response_code(404);
    sendJson(['error' => 'API endpoint not specified']);
}

$endpoint = array_shift($parts);
$subEndpoint = array_shift($parts);

// Construct file path
if ($subEndpoint) {
    $filePath = __DIR__ . '/' . $endpoint . '/' . $subEndpoint . '.php';
} else {
    $filePath = __DIR__ . '/' . $endpoint . '.php';
}

// Security: prevent directory traversal
if (strpos(realpath($filePath), realpath(__DIR__)) !== 0) {
    http_response_code(403);
    sendJson(['error' => 'Forbidden']);
}

if (!file_exists($filePath)) {
    http_response_code(404);
    sendJson(['error' => 'Endpoint not found: ' . $endpoint . '/' . ($subEndpoint ?? '')]);
}

// Include the endpoint
require_once $filePath;
?>
```

### 4. Create backend/helper/JWT.php

```php
<?php
// backend/helper/JWT.php

class JWT {
    /**
     * Encode payload to JWT token
     */
    public static function encode($payload, $secret) {
        $header = [
            'type' => 'JWT',
            'alg' => 'HS256'
        ];

        $header = rtrim(strtr(base64_encode(json_encode($header)), '+/', '-_'), '=');
        $payload['iat'] = time();
        $payload['exp'] = time() + JWT_EXPIRY;
        $payload = rtrim(strtr(base64_encode(json_encode($payload)), '+/', '-_'), '=');

        $signature = rtrim(
            strtr(
                base64_encode(
                    hash_hmac('sha256', $header . '.' . $payload, $secret, true)
                ),
                '+/',
                '-_'
            ),
            '='
        );

        return $header . '.' . $payload . '.' . $signature;
    }

    /**
     * Decode and verify JWT token
     */
    public static function decode($token, $secret) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $hash = rtrim(
            strtr(
                base64_encode(
                    hash_hmac('sha256', $header . '.' . $payload, $secret, true)
                ),
                '+/',
                '-_'
            ),
            '='
        );

        if (!hash_equals($hash, $signature)) {
            return null;
        }

        // Decode payload
        $decoded = json_decode(
            base64_decode(strtr($payload, '-_', '+/')),
            true
        );

        // Check expiration
        if (isset($decoded['exp']) && $decoded['exp'] < time()) {
            return null;
        }

        return $decoded;
    }

    /**
     * Verify Authorization header and return payload
     */
    public static function verify() {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';

        if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
            return null;
        }

        return self::decode($matches[1], JWT_SECRET);
    }
}
?>
```

### 5. Update backend/api/auth/login.php (Example)

```php
<?php
// backend/api/auth/login.php
require_once __DIR__ . '/../../config.php';
require_once __DIR__ . '/../../helper/JWT.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendJson(['error' => 'Method not allowed']);
}

// Get JSON input
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = sanitize($input['email'] ?? '');
$password = $input['password'] ?? '';

// Validate input
if (!$email || !$password) {
    http_response_code(400);
    sendJson(['error' => 'Email and password are required']);
}

try {
    // Query user
    $stmt = $pdo->prepare('SELECT id, email, password, name, role FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        http_response_code(401);
        sendJson(['error' => 'Invalid email or password']);
    }

    // Generate JWT token
    $token = JWT::encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'user'
    ], JWT_SECRET);

    // Success
    sendJson([
        'success' => true,
        'data' => [
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'] ?? 'user'
            ]
        ]
    ]);

} catch (Exception $e) {
    logError('Login error', ['email' => $email, 'error' => $e->getMessage()]);
    http_response_code(500);
    sendJson(['error' => 'Server error']);
}
?>
```

---

## Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| `config.php` | Use env variables, restrict CORS | Security & flexibility |
| `.htaccess` | Add routing & security headers | API routing & protection |
| `api/index.php` | Create router | Clean URL handling |
| `helper/JWT.php` | Create JWT class | Centralized auth |
| `/auth/login.php` | Use JWT helper, add error logging | Better maintainability |

---

## Deployment Steps Using These Files

1. **Backup current config.php**
2. **Replace config.php with production version**
3. **Create .env.production with credentials**
4. **Create .htaccess in api folder**
5. **Test locally**: `php -S localhost:3001 backend/`
6. **Upload to cPanel**
7. **Verify endpoints work**

---

## Testing Locally Before Deploy

```bash
# Start PHP server
cd /path/to/SFM_deploy
php -S localhost:3001

# Test in another terminal
curl http://localhost:3001/api/products.php
curl -X POST http://localhost:3001/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

**Version**: 1.0  
**Updated**: 2026-03-20
