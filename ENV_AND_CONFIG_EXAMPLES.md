# Deployment Configuration Examples

## .env.local (Frontend - Local Development)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd...
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## .env.production (Frontend - Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd...
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

## backend/.env.production (cPanel Backend)
```
# Database Configuration
DB_HOST=localhost
DB_USER=username_sfmsuser
DB_PASS=your_secure_password_here
DB_NAME=username_sfms
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_very_long_secure_random_string_min_32_chars
JWT_EXPIRY=86400

# API Configuration
API_BASE_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.vercel.app

# Email Configuration (Optional)
MAIL_HOST=mail.yourdomain.com
MAIL_USER=noreply@yourdomain.com
MAIL_PASS=your_email_password
MAIL_FROM=noreply@yourdomain.com

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Debug Mode
DEBUG=false
```

## vercel.json (Frontend - Vercel Config)
```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "nodeVersion": "18.x",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@next_public_firebase_api_key",
    "NEXT_PUBLIC_API_URL": "@next_public_api_url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

## backend/api/index.php (Router)
```php
<?php
// backend/api/index.php
require_once __DIR__ . '/../config.php';

// Get request path
$basePath = '/api/';
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace($basePath, '', $requestUri);
$parts = explode('/', trim($path, '/'));
$endpoint = array_shift($parts);
$subEndpoint = array_shift($parts) ?? null;

// Construct file path
if ($subEndpoint) {
    $filePath = __DIR__ . '/' . $endpoint . '/' . $subEndpoint . '.php';
} else {
    $filePath = __DIR__ . '/' . $endpoint . '.php';
}

// Route request
if (file_exists($filePath)) {
    require_once $filePath;
} else {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'error' => 'Endpoint not found',
        'path' => $path
    ]);
}
?>
```

## helper/JSONResponse.php (API Response Helper)
```php
<?php
// backend/helper/JSONResponse.php

class JSONResponse {
    public static function success($data = [], $message = 'Success', $code = 200) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ]);
        exit();
    }

    public static function error($message = 'An error occurred', $code = 400, $errors = []) {
        http_response_code($code);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ]);
        exit();
    }

    public static function paginate($items, $total, $page, $limit) {
        http_response_code(200);
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'limit' => $limit,
                'pages' => ceil($total / $limit)
            ]
        ]);
        exit();
    }
}
?>
```

## helper/JWT.php (JWT Handler)
```php
<?php
// backend/helper/JWT.php

class JWT {
    public static function encode($payload, $secret, $algorithm = 'HS256') {
        $header = json_encode(['typ' => 'JWT', 'alg' => $algorithm]);
        $payload['iat'] = time();
        $payload['exp'] = time() + (24 * 60 * 60); // 24 hours
        
        $payload_encoded = base64_encode($header) . '.' . base64_encode(json_encode($payload));
        $signature = base64_encode(hash_hmac('sha256', $payload_encoded, $secret, true));
        
        return $payload_encoded . '.' . $signature;
    }

    public static function decode($token, $secret) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        $header = json_decode(base64_decode($parts[0]), true);
        $payload = json_decode(base64_decode($parts[1]), true);
        $signature = $parts[2];

        $payload_encoded = $parts[0] . '.' . $parts[1];
        $expected_signature = base64_encode(hash_hmac('sha256', $payload_encoded, $secret, true));

        if ($signature !== $expected_signature) return null;
        if (isset($payload['exp']) && $payload['exp'] < time()) return null;

        return $payload;
    }

    public static function verify($secret) {
        $headers = getallheaders();
        $auth = $headers['Authorization'] ?? '';
        
        if (!preg_match('/Bearer\s+(.+)/', $auth, $matches)) {
            return null;
        }

        return self::decode($matches[1], $secret);
    }
}
?>
```
