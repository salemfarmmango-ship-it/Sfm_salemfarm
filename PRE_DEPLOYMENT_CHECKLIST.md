# PRE-DEPLOYMENT CHECKLIST

## Phase 0: Before You Start
- [ ] You have cPanel access with domain & MySQLprivileges
- [ ] You have Vercel account
- [ ] All credentials ready (Supabase, Firebase, Razorpay)
- [ ] Application tested locally without errors

---

## Phase 1: BACKEND SETUP (cPanel) - ~30 min

### 1.1 Create Database
```
1. Login to cPanel
2. Search "MySQL Databases"
3. Create database: username_sfms
4. Create user: username_sfmsuser
5. Add user to database with ALL privileges
6. Note credentials:
   - Host: localhost
   - Database: username_sfms
   - Username: username_sfmsuser
   - Password: [set secure password]
```

### 1.2 Prepare Backend Files
```
ACTIONS ON YOUR LOCAL MACHINE:

1. Update backend/config.php
   - Change CORS origin to your domain
   - Use environment variables instead of hardcoded values

2. Create backend/.env.production
   DB_HOST=localhost
   DB_USER=username_sfmsuser
   DB_PASS=YourSecurePassword123!
   DB_NAME=username_sfms
   JWT_SECRET=GenerateSecureStringHere

3. Verify these files exist:
   - backend/config.php (updated)
   - backend/api/*.php (all endpoints)
   - backend/.htaccess (create if missing)
   - backend/schema.sql
```

### 1.3 Upload to cPanel
```
METHOD A - Via cPanel File Manager:
1. Open File Manager → public_html
2. Create folder "api"
3. Upload contents:
   - config.php
   - All .php files from backend/api/
   - .htaccess
   - .env.production (not in git!)

METHOD B - Via FTP/SFTP:
1. Connect to FTP: ftp.yourdomain.com
2. Navigate to public_html
3. Create "api" directory
4. Upload files from backend/

IMPORTANT: Keep .env.production secure!
- Set file permissions to 600 (readable only by owner)
```

### 1.4 Import Database Schema
```
1. cPanel → phpMyAdmin
2. Select your database (username_sfms)
3. Click "Import" tab
4. Choose backend/schema.sql
5. Click "Go" to import
6. Verify tables created in database
```

### 1.5 Test Backend
```
Test API endpoint by visiting in browser:
https://yourdomain.com/api/products.php

Or use curl:
curl https://yourdomain.com/api/products.php

Expected response: JSON array of products
```

---

## Phase 2: FRONTEND SETUP (Vercel) - ~20 min

### 2.1 Prepare Frontend
```
ACTIONS ON YOUR LOCAL MACHINE:

1. Update NEXT_PUBLIC_API_URL
   - In package.json scripts or .env
   - Set to: https://yourdomain.com/api

2. Remove hardcoded localhost/IP addresses
   - Search codebase for "localhost:3001"
   - Replace with process.env.NEXT_PUBLIC_API_URL

3. Update API calls pattern:
   OLD: fetch('http://localhost:3001/products')
   NEW: fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)

4. Test build locally:
   npm run build
   npm start
```

### 2.2 Push to GitHub
```
1. Initialize git (if not already):
   git init
   git add .
   git commit -m "Initial commit"

2. Create GitHub repository

3. Push code:
   git remote add origin https://github.com/yourname/repo.git
   git push -u origin main

4. Verify on GitHub:
   - Repo exists
   - All files visible
   - .env files in .gitignore (NOT pushed)
```

### 2.3 Deploy to Vercel
```
1. Visit vercel.com
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./ (default)

5. Add Environment Variables:
   NEXT_PUBLIC_SUPABASE_URL=[your value]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your value]
   NEXT_PUBLIC_FIREBASE_API_KEY=[your value]
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[your value]
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=[your value]
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=[your value]
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[your value]
   NEXT_PUBLIC_FIREBASE_APP_ID=[your value]
   NEXT_PUBLIC_API_URL=https://yourdomain.com/api

6. Click "Deploy"
7. Wait for deployment (3-5 minutes)
8. Visit your-project.vercel.app
```

### 2.4 Test Frontend
```
1. Visit https://your-project.vercel.app
2. Check browser console (F12) for errors
3. Try a login/signup flow
4. Verify API calls succeed
5. Check Network tab to confirm API endpoint
```

---

## Phase 3: FINAL VERIFICATION - ~15 min

### 3.1 Cross-Origin Request Test
```
Open browser console and run:
fetch('https://yourdomain.com/api/products.php')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))

Expected: JSON response, NOT CORS error
```

### 3.2 Authentication Test
```
Test login endpoint:
curl -X POST https://yourdomain.com/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

Expected: 
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {...}
  }
}
```

### 3.3 Full User Journey Test
From your Vercel frontend:
- [ ] Page loads without errors
- [ ] Login/Signup works
- [ ] Authentication token stored
- [ ] API calls succeed
- [ ] Images load correctly
- [ ] Razorpay integration loads
- [ ] Mobile responsive

### 3.4 Check Logs
```
cPanel Error Logs:
1. cPanel → Logs
2. Check error_log for PHP errors
3. Should be empty or only warnings

Verify no critical errors:
tail -f ~/public_html/error.log

Frontend:
1. Visit Vercel dashboard
2. Go to Deployments → Latest
3. Check Logs tab
4. Should show successful build
```

---

## Phase 4: POST-DEPLOYMENT - ~15 min

### 4.1 Security Hardening
```
Backend Security:
1. Update JWT_SECRET to a 64-character random string
   openssl rand -base64 32

2. Change all default passwords

3. Set proper file permissions:
   chmod 644 config.php
   chmod 644 .htaccess
   chmod 600 .env.production

4. Enable HTTPS/SSL (usually free with cPanel)

5. Update CORS to specific domain:
   Access-Control-Allow-Origin: https://yourdomain.vercel.app
```

### 4.2 Database Backups
```
1. cPanel → Backups
2. Configure automated daily backups
3. Download backup immediately:
   1. cPanel → phpMyAdmin
   2. Select database
   3. Export → Download

4. Store backup in safe location
```

### 4.3 Monitor Application
```
Daily checks:
- [ ] Check error logs
- [ ] Verify API response times
- [ ] Monitor database size
- [ ] Check failed login attempts

Weekly:
- [ ] Backup database
- [ ] Review error logs for patterns
- [ ] Test critical flow (checkout, login)

Monthly:
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Check performance metrics
```

### 4.4 Add Custom Domain (Optional)
```
Vercel:
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records:
   A: 76.76.19.165
   CNAME: cname.vercel-dns.com

cPanel:
1. Add DNS records if hosting DNS
2. Points to Vercel's IP
```

---

## QUICK TROUBLESHOOTING

| Issue | Solution |
|-------|----------|
| 404 on API | Check URL path, verify .htaccess exists |
| CORS Error | Update `Access-Control-Allow-Origin` in config.php |
| Database Connection Failed | Verify credentials, check phpMyAdmin access |
| JWT Token Error | Ensure JWT_SECRET matches frontend/backend |
| Vercel Build Fails | Check build logs, ensure no errors in src/ |
| File Upload Error | Increase `upload_max_filesize` in php.ini |
| Blank Page | Check error_log in cPanel, enable debug mode |

---

## SUPPORT COMMANDS

**Generate Secure JWT Secret:**
```bash
openssl rand -base64 32
```

**Test Backend API:**
```bash
# Test products
curl https://yourdomain.com/api/products.php

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://yourdomain.com/api/auth/me.php
```

**View cPanel Logs:**
```bash
tail -f ~/public_html/error.log
```

**Check PHP Version:**
```
cPanel → PHP Version → Show all versions
```

---

## ESTIMATED TIMELINE
- Backend Setup: 30 minutes
- Frontend Setup: 20 minutes  
- Testing: 15 minutes
- Security & Monitoring: 15 minutes
- **Total: ~1.5 hours**

---

## FINAL CHECKLIST
- [ ] Backend deployed to cPanel
- [ ] Database created and schema imported
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] API endpoints responding correctly
- [ ] Authentication working
- [ ] CORS configured properly
- [ ] SSL/HTTPS enabled
- [ ] Backups configured
- [ ] Error logging enabled
- [ ] User testing completed successfully

✅ **DEPLOYMENT COMPLETE!**

---

**Document Version**: 1.0  
**Last Updated**: 2026-03-20  
**Need Help?** Check error logs first, then refer to DEPLOYMENT_GUIDE.md
