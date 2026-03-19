@echo off
REM validate-before-cpanel-upload.bat
REM Windows batch script to validate project before cPanel upload

setlocal enabledelayedexpansion

echo.
echo 🔍 Salem Farm Mango - Pre-Upload Validation
echo ============================================
echo.

set ERRORS=0
set WARNINGS=0

REM STEP 1: Check .env.production
echo 📋 STEP 1: Environment Configuration
echo =====================================
if exist ".env.production" (
    echo ✓ .env.production exists
    findstr /M "DB_PASS" .env.production >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo ✓ DB_PASS is set
    ) else (
        echo ✗ DB_PASS is NOT set
        set /a ERRORS+=1
    )
) else (
    echo ✗ .env.production is MISSING
    set /a ERRORS+=1
)
echo.

REM STEP 2: Check backend structure
echo 📁 STEP 2: Backend File Structure
echo ==================================
if exist "backend" (echo ✓ backend/ folder exists) else (echo ✗ backend/ missing & set /a ERRORS+=1)
if exist "backend\api" (echo ✓ backend\api/ folder exists) else (echo ✗ backend\api/ missing & set /a ERRORS+=1)
if exist "backend\config.php" (echo ✓ backend\config.php exists) else (echo ✗ backend\config.php missing & set /a ERRORS+=1)
if exist "backend\api\.htaccess" (echo ✓ backend\api\.htaccess exists) else (echo ✗ backend\api\.htaccess missing & set /a ERRORS+=1)
echo.

REM STEP 3: Check required PHP files
echo 🔌 STEP 3: Required PHP Endpoints
echo ==================================
if exist "backend\api\products.php" (echo ✓ products.php exists) else (echo ✗ products.php missing & set /a ERRORS+=1)
if exist "backend\api\categories.php" (echo ✓ categories.php exists) else (echo ✗ categories.php missing & set /a ERRORS+=1)
if exist "backend\api\auth\login.php" (echo ✓ auth\login.php exists) else (echo ✗ auth\login.php missing & set /a ERRORS+=1)
if exist "backend\api\auth\logout.php" (echo ✓ auth\logout.php exists) else (echo ✗ auth\logout.php missing & set /a ERRORS+=1)
if exist "backend\api\auth\me.php" (echo ✓ auth\me.php exists) else (echo ✗ auth\me.php missing & set /a ERRORS+=1)
if exist "backend\api\blogs.php" (echo ✓ blogs.php exists) else (echo ✗ blogs.php missing & set /a ERRORS+=1)
echo.

REM STEP 4: Check frontend
echo 🎨 STEP 4: Frontend Structure  
echo ============================
if exist "src" (echo ✓ src/ folder exists) else (echo ✗ src/ missing & set /a ERRORS+=1)
if exist "package.json" (echo ✓ package.json exists) else (echo ✗ package.json missing & set /a ERRORS+=1)
if exist ".env.production.local" (echo ✓ .env.production.local exists) else (echo ⚠ .env.production.local missing & set /a WARNINGS+=1)
echo.

REM STEP 5: Check database schema
echo 🗄️  STEP 5: Database Schema
echo ============================
if exist "backend\schema.sql" (echo ✓ backend\schema.sql exists) else (echo ✗ backend\schema.sql missing & set /a ERRORS+=1)
echo.

REM STEP 6: Check documentation
echo 📚 STEP 6: Documentation Files
echo ===============================
if exist "CPANEL_SETUP_GUIDE.md" (echo ✓ CPANEL_SETUP_GUIDE.md exists) else (echo ⚠ CPANEL_SETUP_GUIDE.md missing)
echo.

REM SUMMARY
echo 📊 VALIDATION SUMMARY
echo =====================
echo Errors: %ERRORS%
echo Warnings: %WARNINGS%
echo.

if %ERRORS% equ 0 (
    if %WARNINGS% equ 0 (
        echo ✓ ALL CHECKS PASSED! Ready for cPanel upload
        echo.
        echo Next steps:
        echo 1. Update .env.production with YOUR actual DB credentials
        echo 2. Use FTP to upload files to cPanel /public_html/api/
        echo 3. Create MySQL database in cPanel
        echo 4. Test with: https://salemfarmmango.com/api/test-connection.php
    ) else (
        echo ⚠ Found %WARNINGS% warnings - review above
    )
) else (
    echo ✗ Found %ERRORS% CRITICAL ERRORS - FIX BEFORE UPLOADING
)

echo.
pause
