# 📋 cPanel FTP Upload Checklist

## What to Upload and Where

### **Using FTP Client** (Recommended: FileZilla)
```
FTP Server: salemfarmmango.com
FTP User: salemfar
FTP Password: [your FTP password]
FTP Port: 21
```

---

## **Files to Upload to `/public_html/`**

### Authentication
- [ ] `.env.production` (with YOUR actual DB credentials)

### Root Files
- [ ] `setup_database.php` (optional, for first-time setup)
- [ ] `test-connection.php` (for testing)

---

## **Files to Upload to `/public_html/api/`**

### Configuration & Routing
- [ ] `.htaccess`
- [ ] `config.php`
- [ ] `index.php` (if exists)

### Authentication Endpoints (`/public_html/api/auth/`)
- [ ] `auth/login.php`
- [ ] `auth/signup.php`
- [ ] `auth/logout.php`
- [ ] `auth/me.php`
- [ ] `auth/refresh-token.php`
- [ ] `auth/google.php` (if exists)
- [ ] `auth/verify-otp.php` (if exists)

### Product & Category Endpoints
- [ ] `products.php`
- [ ] `categories.php`
- [ ] `product-details.php` (if exists)
- [ ] `product-status.php` (if exists)

### Feature Endpoints
- [ ] `blogs.php`
- [ ] `offers.php`
- [ ] `reviews.php`
- [ ] `hero-slides.php`
- [ ] `settings.php`

### Order & Booking Endpoints
- [ ] `bookings.php`
- [ ] `enquiries.php`
- [ ] `addresses.php`
- [ ] `orders.php` (if exists)

### Admin Endpoints
- [ ] `admin-verify.php`
- [ ] `admin-login.php` (if exists)
- [ ] `admin-dashboard.php` (if exists)

### Testing Files (Upload only for troubleshooting)
- [ ] `debug.php`
- [ ] `test-connection.php`
- [ ] `check-endpoints.php`

---

## **Folder Structure on cPanel Should Look Like:**

```
/public_html/
├── .env.production          ← CRITICAL!
├── test-connection.php      ← Upload to test
├── api/
│   ├── .htaccess
│   ├── config.php
│   ├── products.php
│   ├── categories.php
│   ├── blogs.php
│   ├── offers.php
│   ├── reviews.php
│   ├── hero-slides.php
│   ├── settings.php
│   ├── bookings.php
│   ├── enquiries.php
│   ├── addresses.php
│   ├── admin-verify.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   ├── logout.php
│   │   ├── me.php
│   │   └── refresh-token.php
│   └── debug/
│       ├── debug.php
│       ├── test-connection.php
│       └── check-endpoints.php
├── [other web files]
├── [other folders]
```

---

## **File Permissions After Upload**

Set these via cPanel File Manager (Right-click → Change Permissions):

```
File                        | Permissions | Owner Read/Write | Group/Other Read
────────────────────────────|────────────|──────────────────|─────────────────
.env.production            | 600        | ✓ ✓              | ✗
api/.htaccess              | 644        | ✓ ✓              | ✓
api/config.php             | 644        | ✓ ✓              | ✓
api/*.php (all PHP files)   | 644        | ✓ ✓              | ✓
auth/ (folder)             | 755        | ✓ ✓ ✓            | ✓ ✓
```

---

## **Upload Order (Important!)**

1. **FIRST:** Upload `.env.production` to `/public_html/`
   - Without this, database will not connect
   - Must be at root level or in `/api/` folder

2. **SECOND:** Create database in cPanel MySQL
   - Create database: `salemfar_mango`
   - Create user: `salemfar_admin`
   - Assign user to database with ALL privileges
   - Import `backend/schema.sql` via phpMyAdmin

3. **THIRD:** Upload all `.php` files to `/public_html/api/`
   - Upload folder structure (`auth/`, etc.)
   - Upload `.htaccess` file

4. **FOURTH:** Set file permissions correctly
   - Especially `.env.production` (must be 600)

5. **FIFTH:** Test with `test-connection.php`
   - Access: `https://salemfarmmango.com/api/test-connection.php`
   - Should show green ✓ for database connection

6. **SIXTH:** Test individual endpoints
   - `https://salemfarmmango.com/api/products.php`
   - `https://salemfarmmango.com/api/categories.php`
   - Should return JSON data

7. **SEVENTH:** Update frontend environment and redeploy
   - Update `.env.production.local` with correct API URL
   - Fix API calls to use `NEXT_PUBLIC_API_URL`
   - Push to GitHub and deploy to Vercel

---

## **Troubleshooting Upload Issues**

| Problem | Solution |
|---------|----------|
| Can't connect via FTP | Check FTP credentials in cPanel Settings, use Port 21 |
| Can't see `/public_html/` folder | You may be seeing `/` root, navigate to `/public_html/` |
| Files transferred but not visible | Refresh with F5 in FTP client |
| After upload, still 404 errors | Check `.htaccess` exists and is correctly uploaded |
| After upload, still 500 errors | Check `.env.production` credentials, file permissions |
| Can upload but can't modify | Use FTP client instead of cPanel File Manager, set permissions |

---

## **Quick Links**

- cPanel Admin: https://salemfarmmango.com:2083/
- File Manager: https://salemfarmmango.com:2083/ → File Manager
- phpMyAdmin: https://salemfarmmango.com:2083/ → phpMyAdmin
- Test endpoint: https://salemfarmmango.com/api/test-connection.php
- Test products: https://salemfarmmango.com/api/products.php

---

## **Common cPanel Paths**

```
FTP Root:              /home/salemfar/ or /home2/salemfar/
Web Root:              /home/salemfar/public_html/ or /home2/salemfar/public_html/
MySQL Databases:       cPanel → MySQL Databases
MySQL Users:           cPanel → MySQL Users
phpMyAdmin:            cPanel → phpMyAdmin
Error Log:             /home/salemfar/public_html/error_log
```

---

## **Last-Minute Checklist Before Testing**

- [ ] .env.production has correct DB credentials
- [ ] .env.production is at `/public_html/` level (NOT in `/api/`)
- [ ] All `.php` files uploaded to `/public_html/api/`
- [ ] `.htaccess` uploaded to `/public_html/api/`
- [ ] Permissions: 600 for `.env.production`, 644 for `.php` files
- [ ] Database created with correct name: `salemfar_mango`
- [ ] Database user created: `salemfar_admin`
- [ ] Schema imported via phpMyAdmin
- [ ] test-connection.php shows ✓ green status
- [ ] Can access `products.php` and see JSON data

You're ready to go! 🚀

---

**Created:** March 20, 2026
