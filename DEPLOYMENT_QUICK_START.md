# 🚀 DEPLOYMENT QUICK START

## What You Have

✅ **Frontend**: Next.js 14.1.0 (React 18, TypeScript)  
✅ **Backend**: PHP API with MySQL database  
✅ **Services**: Supabase, Firebase, Razorpay integrated  

---

## 📋 DEPLOYMENT ROADMAP

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: BACKEND (cPanel) - 30 minutes                       │
├─────────────────────────────────────────────────────────────┤
│ 1. Create MySQL database in cPanel                          │
│ 2. Update backend/config.php for production                 │
│ 3. Create backend/.env.production with credentials          │
│ 4. Upload PHP files to public_html/api                      │
│ 5. Import database schema via phpMyAdmin                    │
│ 6. Test API endpoints (curl or browser)                     │
│ ✓ Backend ready at: https://yourdomain.com/api              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: FRONTEND (Vercel) - 20 minutes                      │
├─────────────────────────────────────────────────────────────┤
│ 1. Replace localhost with environment variable              │
│ 2. Push code to GitHub                                      │
│ 3. Import project into Vercel                               │
│ 4. Add environment variables in Vercel dashboard            │
│ 5. Deploy (auto-triggered)                                  │
│ 6. Test frontend connects to backend                        │
│ ✓ Frontend ready at: https://yourdomain.vercel.app          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: VERIFY & SECURE - 15 minutes                        │
├─────────────────────────────────────────────────────────────┤
│ 1. Test login/signup flow                                   │
│ 2. Verify API calls work                                    │
│ 3. Check browser console for errors                         │
│ 4. Backup database                                          │
│ 5. Configure HTTPS                                          │
│ ✓ LIVE IN PRODUCTION!                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 DOCUMENTATION CREATED

Created 5 comprehensive guides in your project root:

### 1. **DEPLOYMENT_GUIDE.md** (Main Guide)
   - Complete step-by-step for both backend and frontend
   - Security checklist
   - Troubleshooting section
   - Environment setup details

### 2. **PRE_DEPLOYMENT_CHECKLIST.md** (Action Items)
   - Phase-by-phase tasks
   - ~1.5 hour total time estimate
   - Quick troubleshooting table
   - All commands ready to copy-paste

### 3. **PRODUCTION_CONFIG_UPDATES.md** (Code Updates)
   - Production-ready config.php
   - .htaccess configuration
   - JWT helper class
   - API router template

### 4. **ENV_AND_CONFIG_EXAMPLES.md** (Templates)
   - .env file examples for each environment
   - vercel.json configuration
   - Response helper classes
   - JWT implementation

### 5. **This File** (Quick Reference)

---

## 🎯 QUICK START COMMANDS

### Backend (cPanel)
```bash
# Generate secure JWT Secret
openssl rand -base64 32

# Test backend API
curl https://yourdomain.com/api/products.php

# View error logs
tail -f ~/public_html/error.log
```

### Frontend (Vercel)
```bash
# Local build test
npm run build
npm start

# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## ✅ DEPLOYMENT CHECKLIST

### Before You Start
- [ ] cPanel access with MySQL privileges
- [ ] Vercel account
- [ ] GitHub account
- [ ] All credentials (Supabase, Firebase, Razorpay)
- [ ] .env.production file created (not in git!)

### Backend Deployment
- [ ] Updated `backend/config.php` for production
- [ ] Created `backend/.env.production` with DB credentials
- [ ] Created `backend/.htaccess` with routing
- [ ] Uploaded PHP files to cPanel public_html/api
- [ ] Created database in phpMyAdmin
- [ ] Imported schema.sql
- [ ] Tested API endpoint works

### Frontend Deployment
- [ ] Updated API_URL environment variable
- [ ] Removed localhost references
- [ ] Pushed code to GitHub
- [ ] Created Vercel project
- [ ] Added all environment variables
- [ ] Deployment successful

### Post-Deployment
- [ ] Test login/signup flow
- [ ] Verify API calls succeed
- [ ] Check for CORS errors
- [ ] Enable HTTPS/SSL
- [ ] Configure database backups
- [ ] Monitor error logs

---

## ⚠️ CRITICAL SECURITY TASKS

1. **Change JWT_SECRET**
   - Generate: `openssl rand -base64 32`
   - Use long, random string

2. **Update CORS settings**
   - Change `*` to specific domain: `https://yourdomain.vercel.app`

3. **Set file permissions**
   - .env files: chmod 600 (read-only by owner)
   - .htaccess: chmod 644

4. **Enable HTTPS**
   - Use SSL certificate (usually free with cPanel)

5. **Database backups**
   - Configure automatic daily backups
   - Test restore process

---

## 🔧 KEY CONFIGURATION UPDATES

### config.php Changes
```php
// ❌ OLD - Development
$pdo = new PDO("mysql:host=localhost;...", 'root', '');

// ✅ NEW - Production
define('DB_HOST', $ENV_SFM['DB_HOST']);
define('DB_USER', $ENV_SFM['DB_USER']);
define('DB_PASS', $ENV_SFM['DB_PASS']);
// Load from .env.production
```

### CORS Changes
```php
// ❌ OLD - Allows everyone
header("Access-Control-Allow-Origin: *");

// ✅ NEW - Only your frontend
header("Access-Control-Allow-Origin: https://yourdomain.vercel.app");
```

### API URL Changes
```javascript
// ❌ OLD - Hardcoded
const response = await fetch('http://localhost:3001/...');

// ✅ NEW - From environment
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/...`);
```

---

## 📊 PROJECT STRUCTURE

```
SFM_deploy/
├── PUBLIC FACING (Vercel)
│   ├── src/
│   │   ├── app/              # Next.js app
│   │   ├── components/       # React components
│   │   └── lib/              # Utility functions
│   ├── public/               # Static files
│   ├── package.json          # Dependencies
│   └── next.config.js        # Next.js config
│
└── API BACKEND (cPanel)
    └── backend/
        ├── api/              # API endpoints
        │   ├── products.php
        │   ├── orders.php
        │   ├── auth/         # Authentication
        │   └── ...
        ├── config.php        # Database & JWT config
        ├── schema.sql        # Database structure
        └── .env.production   # Secrets (not in git)
```

---

## 🌐 EXPECTED ENDPOINTS

After deployment, these should work:

```
Frontend:       https://yourdomain.vercel.app
API Base:       https://yourdomain.com/api/

Auth Endpoints:
  POST          /api/auth/login.php
  POST          /api/auth/signup.php
  GET           /api/auth/me.php

Product Endpoints:
  GET           /api/products.php
  GET           /api/products.php?id=1
  POST          /api/products.php

Order Endpoints:
  GET           /api/orders.php
  POST          /api/orders.php
  GET           /api/orders.php?id=1
```

---

## ⏱️ ESTIMATED TIME

| Task | Duration |
|------|----------|
| Database setup | 10 min |
| Backend upload & config | 20 min |
| Backend testing | 10 min |
| Frontend env setup | 5 min |
| GitHub push | 5 min |
| Vercel deployment | 10 min |
| Full testing | 15 min |
| Security hardening | 10 min |
| **TOTAL** | **~1.5 hours** |

---

## 🆘 COMMON ISSUES

| Error | Fix |
|-------|-----|
| 404 on API | Check .htaccess exists & URL is correct |
| CORS error | Update `Access-Control-Allow-Origin` to match Vercel domain |
| DB connection failed | Verify username/password in .env.production |
| JWT auth fails | Ensure JWT_SECRET matches on frontend & backend |
| Vercel build fails | Check error logs, no hardcoded localhost |
| File upload fails | Increase `upload_max_filesize` in cPanel PHP settings |

---

## 📖 NEXT STEPS

1. **Read** `PRE_DEPLOYMENT_CHECKLIST.md` - Get exact steps
2. **Update** Config files using `PRODUCTION_CONFIG_UPDATES.md`
3. **Deploy** Backend to cPanel
4. **Deploy** Frontend to Vercel
5. **Test** Full user journey
6. **Monitor** Logs for errors

---

## 💡 PRO TIPS

- Test backend locally first: `php -S localhost:3001`
- Keep .env.production in .gitignore (never push secrets!)
- Use Vercel's environment secrets, not in code
- Monitor error logs daily for first week
- Set up automated database backups immediately
- Test critical flows: login → checkout → order complete

---

## 📞 SUPPORT

Got stuck? Check:
1. **Error logs**: 
   - cPanel: `error_log` in public_html/
   - Vercel: Deployments → Logs

2. **Common issues**: See section above

3. **Documentation**:
   - DEPLOYMENT_GUIDE.md (complete reference)
   - PRE_DEPLOYMENT_CHECKLIST.md (step-by-step)
   - PRODUCTION_CONFIG_UPDATES.md (code examples)

4. **Tools**:
   - Test backend: curl, Postman
   - Test frontend: Browser DevTools
   - Database: phpMyAdmin

---

## ✨ SUMMARY

Your app is ready to deploy! You have:

- ✅ Modern Next.js frontend (ready for Vercel)
- ✅ PHP backend with proper structure
- ✅ Supabase, Firebase, Razorpay ready
- ✅ JWT authentication in place
- ✅ Complete deployment guides

**Time to production: ~1.5 hours**

---

**Created**: 2026-03-20  
**For**: Salem Farm Mango Project  
**Status**: Ready for Deployment ✅

---

### 👉 START HERE: Read `PRE_DEPLOYMENT_CHECKLIST.md` next!
