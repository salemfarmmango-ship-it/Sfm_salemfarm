# Salem Farm Mango - Deployment Guide

## Project Analysis

### Stack Overview
- **Frontend**: Next.js 14.1.0 (React 18, TypeScript)
- **Backend**: PHP with MySQL
- **Database**: MySQL (sfms)
- **Auth**: JWT-based authentication
- **External Services**: Supabase, Firebase, Razorpay

### Current Structure
```
Frontend: src/ (Next.js app)
Backend: backend/api/ (PHP endpoints)
Database: backend/schema.sql (MySQL schema)
```

---

## Part 1: FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Frontend for Vercel

#### 1.1 Update Environment Variables

Create `.env.local` in root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_API_URL=https://yourdomain.com/backend/api
```

#### 1.2 Fix API Calls

Update all API calls to use environment variable:
```javascript
// Instead of hardcoding
const response = await fetch('http://localhost:3001/...');

// Use
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/...`);
```

#### 1.3 Build Test Locally

```bash
npm run build
npm start
```

### Step 2: Deploy to Vercel

#### 2.1 Option A: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub (recommended)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Environment Variables**: Add all from `.env.local`
6. Click "Deploy"

#### 2.2 Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all other env variables

# Deploy with env variables
vercel --prod
```

### Step 3: Verify Frontend Deployment
- Frontend will be at: `https://yourdomain.vercel.app`
- Check that it loads and connects to backend API

---

## Part 2: BACKEND DEPLOYMENT (cPanel with PHP/MySQL)

### Step 1: Prepare Backend for cPanel

#### 1.1 Update Configuration Files

**backend/config.php** - Update for Production:
```php
<?php
date_default_timezone_set('Asia/Kolkata');

// Load environment variables
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

// CORS Headers - Update domain for production
header("Access-Control-Allow-Origin: https://yourdomain.vercel.app");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_USER', getenv('DB_USER') ?: $ENV_SFM['DB_USER']);
define('DB_PASS', getenv('DB_PASS') ?: $ENV_SFM['DB_PASS']);
define('DB_NAME', getenv('DB_NAME') ?: $ENV_SFM['DB_NAME']);

// JWT Secret - MUST change in production
define('JWT_SECRET', $ENV_SFM['JWT_SECRET'] ?? 'your_super_secret_jwt_key_here_change_in_production');

// API Base URL
define('API_BASE_URL', $ENV_SFM['API_BASE_URL'] ?? 'https://yourdomain.com/backend/api');

// Database Connection
try {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    http_response_code(500);
    error_log($e->getMessage());
    exit(json_encode(['error' => 'Database connection error']));
}
?>
```

#### 1.2 Create `.env.production` File

Create `backend/.env.production`:
```env
# Database
DB_HOST=your_cpanel_db_host
DB_USER=your_cpanel_db_user
DB_PASS=your_cpanel_db_password
DB_NAME=your_database_name

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_long_random_secret_key_here

# API Configuration
API_BASE_URL=https://yourdomain.com/backend/api
FRONTEND_URL=https://yourdomain.vercel.app
```

#### 1.3 Create `.htaccess` for API Routes

Create `backend/api/.htaccess`:
```apache
# Enable mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Allow static files
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [QSA,L]
    
    # Allow directories
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [QSA,L]
    
    # Route all requests to index.php
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>

# CORS Headers
<FilesMatch "\.php$">
    Header set Access-Control-Allow-Origin "https://yourdomain.vercel.app"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
</FilesMatch>
```

#### 1.4 Create API Router (Optional but Recommended)

Create `backend/api/index.php`:
```php
<?php
require_once __DIR__ . '/../config.php';

// Get the request path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = str_replace('/backend/api/', '', $path);
$parts = explode('/', trim($path, '/'));
$endpoint = $parts[0] ?? '';

// Route to appropriate API file
$apiFile = __DIR__ . '/' . $endpoint . '.php';

if (file_exists($apiFile)) {
    require_once $apiFile;
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
```

### Step 2: Create Database Backup

```bash
# From your local machine, backup database
mysqldump -u root -p sfms > backend/database_backup.sql
```

### Step 3: Deploy to cPanel

#### 3.1 Prepare Files for Upload

1. Create deployment package:
   - Include only `backend/` folder
   - Include `backend/.env.production` (add to gitignore!)
   - Include SQL schema file

2. Files structure on cPanel:
   ```
   public_html/
   ├── api/
   │   ├── index.php (router)
   │   ├── products.php
   │   ├── orders.php
   │   ├── auth/
   │   │   ├── login.php
   │   │   ├── signup.php
   │   │   └── ...
   │   └── ...
   ├── config.php
   ├── .htaccess
   └── api_utils.php (shared utilities)
   ```

#### 3.2 Upload via cPanel File Manager

1. Login to cPanel
2. Go to **File Manager** → **public_html**
3. Create folder `api` (or `backend`)
4. Upload PHP files:
   - Upload `config.php`
   - Upload API endpoint files from `backend/api/`
   - Upload `.htaccess`

#### 3.3 Create Database in cPanel

1. Go to **MySQL Databases**
2. Create new database (e.g., `username_sfms`)
3. Create database user
4. Add user to database with ALL privileges
5. Note the credentials

#### 3.4 Import Database Schema

1. Go to **phpMyAdmin**
2. Select your database
3. Go to **Import** tab
4. Upload `backend/schema.sql` → Import

#### 3.5 Update `.env.production`

Update on server (via FTP or File Manager):
```env
DB_HOST=localhost
DB_USER=username_sfmsuser
DB_PASS=your_password
DB_NAME=username_sfms
JWT_SECRET=generate-random-secure-string-here
API_BASE_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.vercel.app
```

### Step 4: Verify Backend Deployment

Test API endpoints:
```bash
# Test auth endpoint
curl -X POST https://yourdomain.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test products endpoint
curl https://yourdomain.com/api/products.php
```

---

## Part 3: ENVIRONMENT SETUP CHECKLIST

### Frontend (Vercel)
- [ ] GitHub repository configured
- [ ] Vercel project created
- [ ] Environment variables set in Vercel dashboard
- [ ] API_URL points to correct cPanel backend
- [ ] Test deployment and API calls work
- [ ] Custom domain configured (if needed)

### Backend (cPanel)
- [ ] cPanel account with adequate resources
- [ ] MySQL database created
- [ ] Database user created with privileges
- [ ] Schema imported successfully
- [ ] PHP version compatible (≥7.4 recommended)
- [ ] Config file updated for production
- [ ] `.env.production` file created and secured
- [ ] Files uploaded to public_html
- [ ] `.htaccess` configured for API routing
- [ ] CORS headers configured correctly
- [ ] Test endpoints with curl or Postman

### Services
- [ ] Supabase credentials updated
- [ ] Firebase credentials updated
- [ ] Razorpay credentials updated
- [ ] Database backups configured
- [ ] Error logging enabled

---

## Part 4: SECURITY CHECKLIST

### Backend Security
```php
// Add to config.php
ini_set('display_errors', 0);
error_reporting(E_ALL);
ini_set('log_errors', 1);
ini_set('error_log', '/home/username/public_html/error.log');

// Sanitize inputs
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Validate JWT
function verifyJWT($token) {
    // Implementation of JWT verification
}
```

### Recommended Actions
1. **Change JWT Secret** - Generate a secure 64-character string
2. **Enable HTTPS** - Use SSL certificate (usually free with cPanel)
3. **Restrict CORS** - Only allow your Vercel domain
4. **Set proper permissions** - 644 for PHP files, 755 for directories
5. **Backup database regularly** - Configure automated backups
6. **Monitor errors** - Check error logs weekly
7. **Use environment variables** - Never hardcode sensitive data
8. **Add rate limiting** - Prevent API abuse

---

## Part 5: TROUBLESHOOTING

### Common Issues

**Issue: CORS errors**
- Solution: Update `ALLOWED_ORIGIN` in config.php to match Vercel domain

**Issue: Database connection failed**
- Solution: Verify credentials, check if database user has privileges to `DB_NAME`

**Issue: 404 errors on API calls**
- Solution: Check .htaccess configuration and URL routing

**Issue: JWT authentication fails**
- Solution: Ensure JWT_SECRET is the same frontend/backend, check token format

**Issue: File upload size limits**
- Solution: Increase `upload_max_filesize` and `post_max_size` in php.ini (cPanel → PHP)

---

## Part 6: DEPLOYMENT WORKFLOW

### First-time Deployment
1. Update all config files
2. Test backend locally
3. Deploy backend to cPanel
4. Update frontend env variables
5. Deploy frontend to Vercel
6. Test full flow (login → API calls)

### Future Updates
```bash
# Backend update
git push origin backend-updates
# Update files in cPanel File Manager

# Frontend update  
git push origin main
# Vercel auto-deploys from main branch
```

---

## Useful Commands

### Generate Secure JWT Secret
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use this PHP function locally
echo base64_encode(random_bytes(32));
```

### Test API Endpoints
```bash
# Login
curl -X POST https://yourdomain.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Get products
curl https://yourdomain.com/api/products.php

# With authorization
curl -H "Authorization: Bearer TOKEN_HERE" \
  https://yourdomain.com/api/auth/me.php
```

### Monitor cPanel
- **Error logs**: tail -f ~/public_html/error.log
- **MySQL**: Check query logs in phpMyAdmin
- **Traffic**: Monitor in cPanel → Bandwidth

---

## Support Resources
- Vercel Docs: https://vercel.com/docs
- cPanel Documentation: https://documentation.cpanel.net/
- MySQL Reference: https://dev.mysql.com/doc/
- Next.js Documentation: https://nextjs.org/docs

---

**Last Updated**: 2026-03-20
**Need Help?** Check error logs and verify all environment variables are set correctly.
