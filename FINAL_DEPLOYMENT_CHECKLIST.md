# ✅ SALEM FARM MANGO - FINAL DEPLOYMENT CHECKLIST

**Project**: Salem Farm Mango  
**Domain**: salemfarmmango.com  
**Frontend**: salemfarmmango.vercel.app  
**Backend**: salemfarmmango.com/api  
**Date**: March 20, 2026  

---

## 📋 BEFORE YOU PUSH TO GITHUB

### 1. Files to Verify
```
SFM_deploy/
├── ✅ backend/config.php (UPDATED for production)
├── ✅ backend/api/.htaccess (CREATED)
├── ✅ .env (local development)
├── ✅ .env.local (frontend local dev)
├── ✅ .env.production (YOUR SECRETS - DO NOT COMMIT)
├── ✅ .env.production.local (frontend prod)
├── ✅ vercel.json (CREATED)
├── ✅ .gitignore (UPDATED)
└── ✅ logs/ directory (CREATED)
```

### 2. What NOT to Commit to GitHub
- [ ] .env.production (contains cPanel credentials)
- [ ] Any credentials or API keys
- [ ] node_modules/
- [ ] .next/
- [ ] Log files

### 3. What SHOULD Be Committed
- [ ] backend/config.php (production version)
- [ ] backend/api/.htaccess
- [ ] vercel.json
- [ ] Updated .gitignore
- [ ] All source code
- [ ] package.json
- [ ] tsconfig.json

---

## 📤 GITHUB SETUP

```bash
# Navigate to project
cd C:\Users\gokul\Downloads\SFM_deploy

# Check git status
git status

# Should show:
# - backend/config.php (modified)
# - backend/api/.htaccess (new file)
# - vercel.json (new file)
# - .gitignore (modified)
# - DEPLOYMENT_SALEMFARMMANGO.md (new file)
# And should NOT show .env files

# Add files to git
git add .

# Commit changes
git commit -m "Configure production deployment for salemfarmmango.com"

# Push to GitHub
git push origin main
```

---

## 🌐 CPANEL BACKEND DEPLOYMENT

### Step 1: Prepare .env.production
```
Create this file (DO NOT add to GitHub):
.env.production

With your cPanel credentials:
DB_HOST=localhost
DB_USER=youruser_sfmsuser
DB_PASS=your_password_123
DB_NAME=youruser_sfms
JWT_SECRET=generate_with_openssl_rand_base64_32
API_BASE_URL=https://salemfarmmango.com/api
FRONTEND_URL=https://salemfarmmango.vercel.app
DEBUG=false
```

### Step 2: Create Database
```
1. Login to cPanel
2. Go to MySQL Databases
3. Create Database:
   - Name: youruser_sfms
   - Username: youruser_sfmsuser
   - Password: [Generate secure password]
4. Add user to database with ALL privileges
5. Note down the credentials
```

### Step 3: Upload Backend Files
```
1. Go to File Manager → public_html
2. Create folder: "api"
3. Upload from backend/:
   - config.php
   - All .php files from api/
   - .htaccess
4. Do NOT upload .env files (create on server)
```

### Step 4: Create .env.production on cPanel
```
1. File Manager → public_html
2. Create new file: .env.production
3. Add contents with your real credentials
4. Set permissions: chmod 600
```

### Step 5: Import Database Schema
```
1. cPanel → phpMyAdmin
2. Select youruser_sfms database
3. Import tab
4. Upload backend/schema.sql
5. Click Import
6. Verify tables created
```

### Step 6: Test Backend API
```
Visit in browser:
https://salemfarmmango.com/api/products.php

Or in terminal:
curl https://salemfarmmango.com/api/products.php

Expected: JSON array of products
```

---

## 🚀 VERCEL FRONTEND DEPLOYMENT

### Step 1: Vercel Login
1. Visit https://vercel.com
2. Login with GitHub account
3. Import from GitHub

### Step 2: Create Vercel Project
```
1. Click "Import Project"
2. Select: Sfm_salemfarm repository
3. Framework: Next.js (auto-detected)
4. Root directory: ./ (default)
5. Click "Deploy"
```

### Step 3: Add Environment Variables
```
Go to: Project Settings → Environment Variables

Add:
NEXT_PUBLIC_SUPABASE_URL=https://cqqoahxkhzzpnpvjhtui.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJfOZb893RY9xM8AlKfZ4ErvlN1u3UWWo
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sfmo-5be58.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sfmo-5be58
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sfmo-5be58.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=133122772580
NEXT_PUBLIC_FIREBASE_APP_ID=1:133122772580:web:cf8168d8e9a6d3d612d971
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_ST54EVEOT8vbCl
NEXT_PUBLIC_API_URL=https://salemfarmmango.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=83923168146-ikhnn9n4ik1ulg8gpi1nfo1rj9b2h8l7.apps.googleusercontent.com
NEXT_PUBLIC_STORE_PINCODE=637103
```

### Step 4: Deploy
```
Click "Deploy"
Wait 3-5 minutes for build to complete
Visit: https://salemfarmmango.vercel.app
```

---

## 🧪 TESTING

### Test Backend API
```bash
# Products
curl https://salemfarmmango.com/api/products.php

# Login
curl -X POST https://salemfarmmango.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Frontend
```
1. Visit https://salemfarmmango.vercel.app
2. Open browser DevTools (F12)
3. Go to Network tab
4. Try login
5. Verify API call to salemfarmmango.com/api/*
6. Should see successful responses
```

### Test Full Journey
- [ ] Page loads
- [ ] Login/signup works
- [ ] API calls succeed
- [ ] Products load
- [ ] Images display
- [ ] No CORS errors
- [ ] Mobile responsive

---

## 🔐 SECURITY HARDENING

### Backend Security
- [ ] JWT_SECRET is long random string (openssl rand -base64 32)
- [ ] .env.production has secure password
- [ ] Set .env.production permissions to 600
- [ ] DEBUG=false in .env.production
- [ ] Check CORS allows only salemfarmmango domains
- [ ] Enable HTTPS/SSL on cPanel

### Frontend Security
- [ ] No hardcoded API URLs (use NEXT_PUBLIC_API_URL env var)
- [ ] No secrets in code or .env.local
- [ ] All environment variables in Vercel dashboard
- [ ] HTTPS enabled (automatic with Vercel)

### Database Security
- [ ] Strong password for MySQL user
- [ ] Restrict user to specific database
- [ ] Configure backups in cPanel
- [ ] Monitor access logs

---

## 📊 EXPECTED RESULTS

### URLs After Deployment
- Frontend: https://salemfarmmango.vercel.app
- Backend API: https://salemfarmmango.com/api
- API endpoints: https://salemfarmmango.com/api/products.php, etc.

### Files on cPanel public_html/
```
public_html/
├── api/
│   ├── .htaccess
│   ├── config.php
│   ├── products.php
│   ├── orders.php
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   └── ...
│   └── ...
├── .env.production (not in git, on server only)
├── logs/
│   └── error.log
└── error.log
```

### Environment Files (Local Only)
```
.env (git: NOT tracked)
.env.local (git: NOT tracked)
.env.production (git: NOT tracked)
.env.production.local (git: NOT tracked)
```

These are created on:
- **Local machine**: .env, .env.local
- **cPanel server**: .env.production
- **Vercel dashboard**: Environment variables (no files)

---

## ✅ FINAL CHECKLIST

### Code Preparation
- [ ] backend/config.php updated for production
- [ ] backend/api/.htaccess created
- [ ] vercel.json created
- [ ] .gitignore updated
- [ ] All .env files reviewed
- [ ] logs/ directory created
- [ ] DEPLOYMENT_SALEMFARMMANGO.md created

### GitHub
- [ ] .env.production NOT in git
- [ ] All production config files committed
- [ ] Code pushed to main branch
- [ ] Can see files on GitHub

### cPanel Backend
- [ ] Database created: username_sfms
- [ ] Database user created: username_sfmsuser
- [ ] Backend files uploaded to public_html/api/
- [ ] .env.production created (with credentials)
- [ ] Schema imported in phpMyAdmin
- [ ] API endpoints responding: https://salemfarmmango.com/api/products.php
- [ ] Error logs checked (cPanel → Logs)
- [ ] HTTPS/SSL enabled

### Vercel Frontend
- [ ] Project imported from GitHub
- [ ] Environment variables added
- [ ] Build successful
- [ ] Frontend loads: https://salemfarmmango.vercel.app
- [ ] Navigation works
- [ ] API calls to backend working

### Testing Complete
- [ ] Frontend loads without errors
- [ ] Login works
- [ ] API calls succeed (check Network tab)
- [ ] No CORS errors
- [ ] Products display
- [ ] Full checkout flow tested
- [ ] Mobile responsive
- [ ] HTTPS working on both domains

### Monitoring
- [ ] Error logs empty (or only warnings)
- [ ] Database backups configured
- [ ] Monitor cPanel - check daily
- [ ] Monitor Vercel - check deployments

---

## 🎉 YOU'RE DONE!

When all checkboxes are ✅:
- ✅ Code on GitHub
- ✅ Backend on cPanel
- ✅ Frontend on Vercel
- ✅ Everything tested
- ✅ Secure configuration

**Status**: 🟢 LIVE IN PRODUCTION!

---

## 📞 QUICK REFERENCE

| What | Where |
|------|-------|
| Frontend App | https://salemfarmmango.vercel.app |
| Backend API | https://salemfarmmango.com/api |
| GitHub Repo | https://github.com/salemfarmmango-ship-it/Sfm_salemfarm |
| Database | cPanel phpMyAdmin |
| Error Logs | cPanel: ~/public_html/logs/error.log |
| Vercel Logs | Vercel Dashboard → Deployments |
| Environment Variables | .env (local), Vercel dashboard (prod) |
| Config File | backend/config.php |
| API Routes | backend/api/.htaccess |

---

## 🚀 DEPLOYMENT TIMELINE

- **Preparation**: 30 min (update configs)
- **GitHub Push**: 5 min
- **cPanel Setup**: 30 min (DB + upload)
- **Vercel Deploy**: 10 min (auto-deploy)
- **Testing**: 15 min
- **Security Hardening**: 10 min
- **Total**: ~1.5-2 hours ✅

---

**Final Status**: Ready to deploy to salemfarmmango.com! 🎉
