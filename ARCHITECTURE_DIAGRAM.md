# DEPLOYMENT ARCHITECTURE

## Current Setup (Local/Development)

```
Your Computer (XAMPP/Local Dev)
│
├─── Frontend: http://localhost:3000 (Next.js Dev Server)
│    └─── src/ (React app)
│
└─── Backend: http://localhost:3001 (PHP local server)
     ├─── /api/products.php
     ├─── /api/orders.php
     ├─── /api/auth/login.php
     └─── MySQL: localhost:3306 (sfms)
```

---

## Production Setup (Post-Deployment)

```
🌍 INTERNET

    ┌─────────────────────────────────────────────────────┐
    │                   YOUR DOMAIN                       │
    │                 yourdomain.com                      │
    └───────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴──────────────┐
        │                              │
        ▼                              ▼
   ┌─────────────┐            ┌─────────────────────┐
   │   cPanel    │            │      Vercel         │
   │   Server    │            │      (Global CDN)   │
   ├─────────────┤            ├─────────────────────┤
   │ Backend API │            │  Frontend (Next.js) │
   │ + MySQL DB  │            │  yourdomain.vercel  │
   │             │            │  .app               │
   │ /public_html│            │                     │
   │   /api/     │            │  - React App        │
   │             │            │  - Static assets    │
   │ • config.php│            │  - Auto-deploys     │
   │ • products  │            │                     │
   │ • orders.php│            │  Browser ←────────┐ │
   │ • auth/     │            │                  │ │ │
   │ • MySQL DB  │            │  User Traffic    │ │ │
   │             │            │    (HTTPS)       │ │ │
   └────┬────────┘            └──────┬───────────┘ │ │
        │                             │             │ │
        │ Database                    │             │ │
        │ Credentials:                │             │ │
        │ • Host: localhost           │             │ │
        │ • User: username_sfmsuser   │             │ │
        │ • DB: username_sfms         │             │ │
        │                             │ API Calls   │ │
        │   (HTTPS)                   │  (JSON)     │ │
        │                             │             │ │
        └─────────────────────────────┼─────────────┘ │
                                      │               │
                                      └───────────────┘

HTTP FLOW:

1. User visits: https://yourdomain.vercel.app
   ↓
2. Vercel serves Next.js frontend
   ↓
3. User clicks "Login"
   ↓
4. Frontend POST to: https://yourdomain.com/api/auth/login.php
   ↓
5. cPanel PHP backend processes request
   ↓
6. Queries MySQL database
   ↓
7. Returns JWT token as JSON
   ↓
8. Frontend stores token, creates session
   ↓
9. User can browse products, place orders, etc.
```

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  https://yourdomain.vercel.app (Frontend)                    │
└──────────────┬───────────────────────────────────────────────┘
               │
               │ HTTPS Requests (API Calls)
               │
               ▼
┌──────────────────────────────────────────────────────────────┐
│                     VERCEL PLATFORM                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Next.js Frontend Application                          │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ • React Components                                     │  │
│  │ • API Route Handlers (optional)                        │  │
│  │ • Static Assets (images, CSS, JS)                      │  │
│  │ • Environment Variables                                │  │
│  │   - NEXT_PUBLIC_SUPABASE_URL                           │  │
│  │   - NEXT_PUBLIC_FIREBASE_API_KEY                       │  │
│  │   - NEXT_PUBLIC_API_URL → points to cPanel backend     │  │
│  └────────────────────────────────────────────────────────┘  │
│            │                                                  │
│            │ API Requests                                    │
│            │ fetch(`${NEXT_PUBLIC_API_URL}/products`)        │
│            │                                                  │
└────────────┼──────────────────────────────────────────────────┘
             │
             │ HTTPS (Port 443)
             │ Request to: yourdomain.com/api/products.php
             │
             ▼
┌──────────────────────────────────────────────────────────────┐
│                      cPANEL SERVER                           │
│  yourdomain.com                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Apache Web Server                                      │  │
│  │ port 80/443                                            │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────▼───────────────────────────────────────────┐  │
│  │ public_html/api/                  .htaccess routing  │  │
│  │ ├── index.php (router)    ←────── /api/* → index.php │  │
│  │ ├── products.php                                      │  │
│  │ ├── orders.php                                        │  │
│  │ ├── auth/                                             │  │
│  │ │   ├── login.php                                     │  │
│  │ │   ├── signup.php                                    │  │
│  │ │   └── ...                                           │  │
│  │ ├── config.php                                        │  │
│  │ └── error.log                                         │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────▼───────────────────────────────────────────┐  │
│  │ PHP Runtime                                           │  │
│  │ ├── config.php Setup                                  │  │
│  │ ├── Load environment variables                        │  │
│  │ ├── Verify JWT tokens                                 │  │
│  │ └── Process requests                                  │  │
│  └──────────┬───────────────────────────────────────────┘  │
│             │                                               │
│  ┌──────────▼───────────────────────────────────────────┐  │
│  │ MySQL Server (localhost:3306)                        │  │
│  │ Database: username_sfms                              │  │
│  │ User: username_sfmsuser                              │  │
│  │                                                       │  │
│  │ Tables:                                              │  │
│  │ ├── users (email, password, JWT tokens)              │  │
│  │ ├── products                                         │  │
│  │ ├── orders                                           │  │
│  │ ├── categories                                       │  │
│  │ └── ... (other tables from schema.sql)               │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
             ▲
             │ Database Response (JSON)
             │
             │ Response sent back to browser
             │
             └─────────────────────────────────────────────────→
```

---

## File Structure in cPanel

```
yourdomain.com
│
├── public_html/
│   │
│   ├── api/                              # Your API root
│   │   ├── .htaccess                     # Routing configuration
│   │   ├── index.php                     # Main router
│   │   │
│   │   ├── products.php                  # GET/POST products
│   │   ├── orders.php                    # GET/POST orders
│   │   ├── coupons.php                   # Coupon management
│   │   ├── categories.php                # Category listing
│   │   ├── blogs.php                     # Blog endpoints
│   │   │
│   │   └── auth/                         # Authentication endpoints
│   │       ├── login.php                 # POST - User login
│   │       ├── signup.php                # POST - User registration
│   │       ├── logout.php                # POST - User logout
│   │       ├── me.php                    # GET - Current user (requires JWT)
│   │       ├── send-otp.php              # POST - Send OTP
│   │       ├── verify-otp.php            # POST - Verify OTP
│   │       └── ...
│   │
│   ├── config.php                        # ← CRITICAL: App configuration
│   ├── .env.production                   # ← CRITICAL: Secrets (NOT IN GIT)
│   │
│   └── error.log                         # Error logging
│
└── other_cpanel_files...
```

---

## Environment Variables Location

### Frontend (in Vercel Dashboard)

```
Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL    = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
NEXT_PUBLIC_FIREBASE_API_KEY  = AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = xxx.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = xxx.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 123...
NEXT_PUBLIC_FIREBASE_APP_ID = 1:123:web:abc...
NEXT_PUBLIC_API_URL = https://yourdomain.com/api
```

### Backend (in backend/.env.production on cPanel)

```
DB_HOST=localhost
DB_USER=username_sfmsuser
DB_PASS=YourSecurePassword123!
DB_NAME=username_sfms
JWT_SECRET=your_very_long_secure_string_here
API_BASE_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.vercel.app
DEBUG=false
```

---

## Data Flow Example: User Login

```
1. User enters email/password in browser
                │
                ▼
2. Frontend (Vercel) validates input
                │
                ▼
3. Sends POST request to:
   https://yourdomain.com/api/auth/login.php
                │
                ├─ Headers:
                │  ├─ Content-Type: application/json
                │  └─ Origin: https://yourdomain.vercel.app
                │
                ▼
4. cPanel .htaccess routes to index.php
                │
                ▼
5. Backend index.php routes to auth/login.php
                │
                ▼
6. login.php processes request:
   ├─ Sanitizes email input
   ├─ Queries MySQL for user
   ├─ Verifies password hash
   ├─ Generates JWT token
   └─ Returns JSON response
                │
                ▼
7. Database query (MySQL):
   SELECT * FROM users WHERE email = 'user@example.com'
                │
                ▼
8. Response back to browser:
   {
     "success": true,
     "data": {
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
       "user": {
         "id": 1,
         "email": "user@example.com",
         "name": "John Doe",
         "role": "user"
       }
     }
   }
                │
                ▼
9. Frontend stores JWT token in localStorage
                │
                ▼
10. Frontend redirects to dashboard
                │
                ▼
11. All future API calls include token:
    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                │
                ▼
12. Backend verifies token on each protected endpoint
```

---

## Security Layers

```
Vercel Frontend
    │
    ├─ HTTPS encryption
    ├─ Environment variables (secrets not in code)
    ├─ Automatic rebuilds
    └─ DDoS protection
         │
         ▼
    cPanel Backend
    │
    ├─ HTTPS/SSL encryption
    ├─ .htaccess securing routes
    ├─ JWT token verification
    ├─ Input sanitization
    ├─ Error logging (not showing details to users)
    └─ Database
         │
         ├─ Password hashing (bcrypt)
         ├─ User permissions
         ├─ Backups
         └─ Access logs
```

---

## Important URLs After Deployment

| Purpose | URL | Notes |
|---------|-----|-------|
| **Frontend** | https://yourdomain.vercel.app | Main user interface |
| **API Root** | https://yourdomain.com/api/ | All API calls go here |
| **Login** | POST /api/auth/login.php | Returns JWT token |
| **Products** | GET /api/products.php | Public endpoint |
| **Admin** | POST /api/... | Requires JWT token |
| **Database** | cPanel phpMyAdmin | username_sfms DB |

---

## Monitoring After Deployment

```
Daily Checks:
├─ Check cPanel error.log for PHP errors
├─ Monitor API response times
├─ Verify Vercel build status
└─ Check failed authentication attempts

Weekly:
├─ Review error patterns
├─ Test critical flows (login, checkout)
├─ Backup database
└─ Monitor server resources

Monthly:
├─ Update dependencies
├─ Security audit
├─ Review access logs
└─ Performance optimization
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-03-20 | Initial architecture documentation |

---

## Quick Reference

**Frontend Domain**: yourdomain.vercel.app  
**Backend Domain**: yourdomain.com  
**API Base URL**: yourdomain.com/api  
**Database Host**: localhost (on cPanel)  
**Database Name**: username_sfms  

All secure! 🔒
