# Salem Farm Mango - Deployment Guide

**Domain**: https://salemfarmmango.com  
**Frontend**: https://salemfarmmango.vercel.app  
**Backend API**: https://salemfarmmango.com/api  

---

## 🚀 QUICK DEPLOY

### Step 1: Update Environment Variables

#### For cPanel Backend
1. Create `.env.production` file with your cPanel credentials (provided in template)
2. Set secure JWT_SECRET: `openssl rand -base64 32`

#### For Vercel Frontend
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add all variables from `.env.local` and `.env.production.local`

### Step 2: Deploy Backend to cPanel

```bash
# 1. Upload backend files to cPanel public_html/api/
# Files: config.php, .htaccess, all PHP endpoint files

# 2. Create database in cPanel MySQL
# Database: yourusername_sfms
# User: yourusername_sfmsuser

# 3. Import schema in phpMyAdmin
# Upload backend/schema.sql

# 4. Set .env.production on cPanel with credentials
```

### Step 3: Deploy Frontend to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Deploy to production"
git push origin main

# Vercel auto-deploys from GitHub
```

---

## 📁 Project Structure

```
SFM_deploy/
├── .env                        # Local development (frontend + backend)
├── .env.local                  # Frontend local dev
├── .env.production             # Backend production (cPanel) - NOT IN GIT
├── .env.production.local       # Frontend production (Vercel)
├── .gitignore                  # Exclude secrets from git
├── vercel.json                 # Vercel configuration
│
├── src/                        # Next.js Frontend
│   ├── app/
│   ├── components/
│   ├── context/
│   └── lib/
│
├── backend/                    # PHP Backend
│   ├── config.php              # Main configuration (UPDATED for production)
│   ├── api/
│   │   ├── .htaccess           # API routing
│   │   ├── index.php           # Router
│   │   ├── products.php
│   │   ├── orders.php
│   │   ├── auth/
│   │   │   ├── login.php
│   │   │   ├── signup.php
│   │   │   └── ...
│   │   └── ...
│   ├── schema.sql              # Database schema
│   └── jwt.php                 # JWT handling
│
├── logs/                       # Error logging directory
│   └── .gitkeep
│
├── public/                     # Static files
├── package.json                # Dependencies
└── next.config.js              # Next.js config
```

---

## 🔐 Environment Setup

### Backend (.env.production)
Deploy to cPanel public_html after upload (do NOT commit to GitHub):

```env
DB_HOST=localhost
DB_USER=yourusername_sfmsuser
DB_PASS=your_secure_password
DB_NAME=yourusername_sfms
JWT_SECRET=generate_secure_string_openssl_rand_base64_32
API_BASE_URL=https://salemfarmmango.com/api
FRONTEND_URL=https://salemfarmmango.vercel.app
DEBUG=false
```

### Frontend (.env variables in Vercel)
Set in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_RAZORPAY_KEY_ID
NEXT_PUBLIC_API_URL=https://salemfarmmango.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID
NEXT_PUBLIC_STORE_PINCODE
```

---

## 📋 Deployment Checklist

### Backend (cPanel)
- [ ] Create MySQL database `username_sfms`
- [ ] Create MySQL user `username_sfmsuser`
- [ ] Add user to database with ALL privileges
- [ ] Upload backend files to public_html/api/
- [ ] Create .env.production with credentials
- [ ] Import schema.sql in phpMyAdmin
- [ ] Test API: curl https://salemfarmmango.com/api/products.php
- [ ] Check error logs: cPanel → Logs

### Frontend (Vercel)
- [ ] Add all environment variables to Vercel dashboard
- [ ] Verify NEXT_PUBLIC_API_URL=https://salemfarmmango.com/api
- [ ] Push code to GitHub
- [ ] Vercel auto-deploys
- [ ] Test frontend: https://salemfarmmango.vercel.app

### Post-Deployment
- [ ] Test login flow
- [ ] Test API calls
- [ ] Check browser console for errors
- [ ] Verify HTTPS working
- [ ] Configure automated backups
- [ ] Monitor error logs

---

## 🔧 Configuration Files Changed

### backend/config.php
✅ Updated with:
- Environment variable loading (.env vs .env.production)
- Restricted CORS to salemfarmmango domains
- Database credentials from environment
- Security headers
- Error logging setup
- Debug mode configuration

### backend/api/.htaccess
✅ Created with:
- API routing rules
- Security headers
- PHP configuration
- Compression & caching

### vercel.json
✅ Created with:
- Build configuration
- Environment variable mapping
- Security headers
- API rewrite rules

---

## 🧪 Testing APIs

```bash
# Test products endpoint
curl https://salemfarmmango.com/api/products.php

# Test login
curl -X POST https://salemfarmmango.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test protected endpoint
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://salemfarmmango.com/api/auth/me.php
```

---

## 📞 Important Information

### Domain
- **Main Domain**: salemfarmmango.com
- **Frontend**: salemfarmmango.vercel.app  
- **API**: salemfarmmango.com/api

### Services
- **Frontend Hosting**: Vercel (auto-deploy)
- **Backend Hosting**: cPanel shared hosting
- **Database**: MySQL on cPanel
- **Auth**: JWT tokens
- **Services**: Supabase, Firebase, Razorpay

### Database
- **Host**: localhost (on cPanel)
- **Database Name**: yourusername_sfms
- **User**: yourusername_sfmsuser
- **Port**: 3306

### Files NOT to Commit to GitHub
- `.env`
- `.env.local`
- `.env.production`
- `.env.production.local`
- Any `sfmo-5be58-*.json` files
- Log files

---

## ⚠️ Critical Security Notes

1. **Generate New JWT Secret**
   ```bash
   openssl rand -base64 32
   ```

2. **Update .env.production** with your cPanel credentials

3. **Set File Permissions** (on cPanel)
   ```bash
   chmod 600 .env.production
   chmod 644 config.php
   chmod 755 api/
   ```

4. **Enable HTTPS** on cPanel (usually free)

5. **Configure Backups** in cPanel for MySQL

6. **Monitor Logs**:
   - cPanel error logs: `~/public_html/logs/error.log`
   - Vercel logs: Dashboard → Deployments → Logs

---

## 📚 Documentation Files

- `START_HERE.md` - Quick overview
- `DOCUMENTATION_INDEX.md` - Index of all guides
- `DEPLOYMENT_QUICK_START.md` - Quick reference
- `PRE_DEPLOYMENT_CHECKLIST.md` - Step-by-step guide
- `PRODUCTION_CONFIG_UPDATES.md` - Code templates
- `ENV_AND_CONFIG_EXAMPLES.md` - Configuration examples
- `ARCHITECTURE_DIAGRAM.md` - System design

---

## 🚀 Ready to Deploy!

1. ✅ Project structure organized
2. ✅ Config files updated for salemfarmmango.com
3. ✅ Environment files ready
4. ✅ .gitignore configured
5. ✅ Security headers configured

**Next Steps:**
1. Push to GitHub: `git add . && git commit -m "Ready for deployment" && git push origin main`
2. Deploy backend to cPanel (upload files, create DB, import schema)
3. Deploy frontend to Vercel (should auto-deploy from GitHub)
4. Test all endpoints
5. Monitor logs

---

**Last Updated**: March 20, 2026  
**Domain**: salemfarmmango.com  
**Status**: ✅ Ready for Production Deployment
