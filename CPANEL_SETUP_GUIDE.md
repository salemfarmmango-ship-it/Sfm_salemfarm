# 🚀 Complete cPanel Setup Guide - Salem Farm Mango

## ⚠️ IMPORTANT: Follow These Steps Exactly

---

## **STEP 1: Update .env.production with Real Credentials**

**File Location:** Root folder → `.env.production`

Open `.env.production` and update with **YOUR ACTUAL** cPanel credentials:

```bash
# DATABASE CONFIGURATION (cPanel MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=salemfar_admin          # ← YOUR CPANEL DB USER
DB_PASS=Tnbbsth1p0091002        # ← YOUR CPANEL DB PASSWORD
DB_NAME=salemfar_mango          # ← YOUR CPANEL DB NAME

# JWT CONFIGURATION
JWT_SECRET=your_very_long_secure_random_string_min_32_chars
JWT_EXPIRY=86400

# API CONFIGURATION
API_BASE_URL=https://salemfarmmango.com/api
FRONTEND_URL=https://salemfarmmango.vercel.app

# APPLICATION ENVIRONMENT
APP_ENV=production
APP_URL=https://salemfarmmango.com
```

**⚠️ CRITICAL:** Replace `salemfar_admin`, `Tnbbsth1p0091002`, and `salemfar_mango` with YOUR actual credentials!

---

## **STEP 2: Upload Files to cPanel Using FTP**

### **2.1 Connect to cPanel via FTP**
```
Server: salemfarmmango.com (or your cPanel FTP address)
Username: salemfar (or your cPanel FTP username)
Password: (your FTP password)
Port: 21
```

### **2.2 Upload Backend Files**
**Navigate to:** `/public_html/api/`

Upload these folders/files:
```
/public_html/
├── .env.production          ← MOST IMPORTANT
├── api/
│   ├── .htaccess
│   ├── config.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   ├── logout.php
│   │   ├── me.php
│   │   └── refresh-token.php
│   ├── products.php
│   ├── categories.php
│   ├── blogs.php
│   ├── offers.php
│   ├── reviews.php
│   ├── bookings.php
│   ├── enquiries.php
│   ├── addresses.php
│   └── [other endpoint files]
```

### **2.3 File Permissions**
After uploading, set proper permissions via File Manager in cPanel:

```
.env.production     → 600 (NOT readable by others)
api/config.php      → 644
api/*.php           → 644
api/.htaccess       → 644
```

**How to set permissions in cPanel File Manager:**
1. Right-click file → Change Permissions
2. Set Owner: Read ✓ Write ✓, Group/Other: Read ✓

---

## **STEP 3: Create MySQL Database in cPanel**

### **3.1 Go to cPanel → MySQL Databases**

**Step-by-step:**
1. Log in to cPanel
2. Find "MySQL Databases" or "MySQL Database Wizard"
3. Create new database:
   - Name: `salemfar_mango`
   - Click "Create Database"

### **3.2 Create Database User**

1. In "MySQL Users" section:
   - Username: `salemfar_admin`
   - Password: `Tnbbsth1p0091002` (or generate strong password)
   - Click "Create User"

### **3.3 Assign User to Database**

1. In "MySQL User Privileges":
   - Add user `salemfar_admin` to database `salemfar_mango`
   - Give ALL privileges ✓
   - Click "Make Changes"

### **3.4 Import Database Schema**

1. Go to **phpMyAdmin** in cPanel
2. Select database `salemfar_mango`
3. Click **Import** tab
4. Upload file: `backend/schema.sql`
5. Click **Import**

**Verify tables created:** You should see:
- `products`
- `categories`
- `orders`
- `users`
- `reviews`
- `blogs`
- `enquiries`
- etc.

---

## **STEP 4: Verify .htaccess is in Place**

**Location:** `/public_html/api/.htaccess`

Content should be:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>

<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "DENY"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

If file is missing, create it in cPanel File Manager:
1. Right-click in `/public_html/api/` folder
2. Create New File → `.htaccess`
3. Copy-paste the content above

---

## **STEP 5: Test PHP Endpoints**

### **5.1 Test Direct Access**

Open in browser and verify you get **JSON response** (no errors):

```
✅ https://salemfarmmango.com/api/products.php
✅ https://salemfarmmango.com/api/categories.php
✅ https://salemfarmmango.com/api/blogs.php
❌ If you see error/blank page → Database connection failed
❌ If you see 404 → Files not uploaded
❌ If you see 500 → Check file permissions or .env.production
```

### **5.2 Create Test File**

Create file: `/public_html/api/test-connection.php`

```php
<?php
header('Content-Type: application/json');

// Load config
require_once __DIR__ . '/config.php';

// Test database connection
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";port=" . DB_PORT,
        DB_USER,
        DB_PASS
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful!',
        'db_host' => DB_HOST,
        'db_name' => DB_NAME,
        'env_file_used' => $envFileUsed ?? 'None found'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed!',
        'error' => $e->getMessage(),
        'env_file_used' => $envFileUsed ?? 'None found'
    ]);
}
?>
```

**Access:** `https://salemfarmmango.com/api/test-connection.php`

**Expected Response:**
```json
{
  "status": "success",
  "message": "Database connection successful!",
  "db_host": "localhost",
  "db_name": "salemfar_mango",
  "env_file_used": "/home2/salemfar/public_html/.env.production"
}
```

If you get error, it means:
- .env.production not found
- Database credentials wrong
- File permissions issue

---

## **STEP 6: Fix Frontend API Calls**

Now that backend is working, fix frontend code to use correct API URLs.

### **6.1 Update Frontend Environment Variables**

**File:** `.env.production.local` (create if missing)

```bash
NEXT_PUBLIC_API_URL=https://salemfarmmango.com/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_key
```

### **6.2 Fix API Calls in Frontend Code**

Replace these hardcoded URLs in your source files:

**src/app/page.tsx** (Around line 66-103)
```typescript
// ❌ OLD - REMOVE THESE
const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/categories.php'...

// ✅ NEW - USE ENVIRONMENT VARIABLE
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories.php`...
```

**src/app/sitemap.ts** (Line 26)
```typescript
// ❌ OLD
const res = await fetch('http://localhost/SFM/backend/api/products.php'...

// ✅ NEW
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products.php`...
```

**src/context/AuthContext.tsx** (Lines 37, 64)
```typescript
// ❌ OLD
const response = await fetch('/api/auth/me'...
await fetch('/api/auth/logout'...

// ✅ NEW
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me.php`...
await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout.php`...
```

### **6.3 Other Files to Fix**
- `src/app/sitemap.ts`
- `src/hooks/useNotifications.ts`
- `src/lib/EmailService.ts`
- `src/app/admin-login/page.tsx`
- `src/lib/adminAuth.ts`

---

## **STEP 7: Deploy Updated Frontend**

### **7.1 Push to GitHub**
```bash
git add .
git commit -m "Fix API URLs to use environment variables"
git push origin main
```

### **7.2 Vercel Auto-Deploy**
1. Go to Vercel Dashboard
2. Wait for automatic deployment (or trigger manually)
3. Check deployment succeeded

### **7.3 Test Frontend**
Open `https://salemfarmmango.vercel.app`
- Check if homepage loads
- Verify products/categories display
- Check browser Network tab for no 500 errors

---

## **STEP 8: Troubleshooting Checklist**

| Issue | Solution |
|-------|----------|
| **Network Error / Can't reach API** | Check if `.env.production` is uploaded to cPanel |
| **500 Error on API endpoint** | Check file permissions (should be 644), or `.env.production` has wrong DB credentials |
| **Can't connect to database** | Verify credentials in .env.production match cPanel MySQL settings |
| **CORS Error in browser** | Check `config.php` CORS headers allow `salemfarmmango.vercel.app` |
| **Frontend shows no data** | Check frontend is using `NEXT_PUBLIC_API_URL` environment variable correctly |
| **404 on `.php` files** | Check `.htaccess` is in `/public_html/api/` with correct content |
| **Can't modify permissions** | Use FTP client (FileZilla) instead of cPanel File Manager |

---

## **STEP 9: Verify Database Has Data**

1. Go to cPanel → phpMyAdmin
2. Select `salemfar_mango` database
3. Click `products` table
4. Should see product rows
5. If empty, run `backend/schema.sql` with sample data

---

## **Final Verification Checklist**

- [ ] `.env.production` uploaded to `/public_html/`
- [ ] All `.php` files uploaded to `/public_html/api/`
- [ ] `.htaccess` file exists in `/public_html/api/`
- [ ] MySQL database `salemfar_mango` created
- [ ] Database user `salemfar_admin` created and assigned
- [ ] File permissions set correctly (600 for .env, 644 for .php)
- [ ] Can access `https://salemfarmmango.com/api/products.php` directly
- [ ] Frontend `.env.production.local` has correct `NEXT_PUBLIC_API_URL`
- [ ] Frontend code updated to use environment variables
- [ ] Frontend deployed and loads with data

---

## **Quick Reference: File Locations**

```
cPanel File Manager Path          | What It Contains
================================|============================
/public_html/                    | Root folder for website
/public_html/.env.production     | Database credentials (SECURE!)
/public_html/api/                | API endpoints folder
/public_html/api/config.php      | Database connection config
/public_html/api/products.php    | Products endpoint
/public_html/api/auth/           | Authentication endpoints
```

---

## **Need Help?**

If you're stuck:
1. Check `https://salemfarmmango.com/api/test-connection.php` for database errors
2. Check cPanel error logs: `public_html/error_log`
3. Verify .env.production syntax (no extra spaces, quotes, etc.)
4. Ensure database credentials match exactly what's in cPanel

---

**Created:** March 20, 2026
**Project:** Salem Farm Mango - salemfarmmango.com
