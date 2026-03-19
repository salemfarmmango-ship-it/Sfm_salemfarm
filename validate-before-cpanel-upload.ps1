# validate-before-cpanel-upload.ps1
# Run this before uploading to cPanel to verify everything is ready
# Usage: powershell -ExecutionPolicy Bypass -File validate-before-cpanel-upload.ps1

Write-Host "🔍 Salem Farm Mango - Pre-Upload Validation Script`n" -ForegroundColor Cyan
Write-Host "================================================`n"

$script:ERRORS = 0
$script:WARNINGS = 0

# Function to check files
function Test-FileExists {
    param(
        [string]$FilePath,
        [string]$Description = ""
    )
    
    if (Test-Path $FilePath -Type Leaf) {
        Write-Host "✓ $FilePath exists" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ $FilePath is MISSING" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

function Test-DirectoryExists {
    param(
        [string]$DirPath
    )
    
    if (Test-Path $DirPath -Type Container) {
        Write-Host "✓ $DirPath exists" -ForegroundColor Green
        return $true
    }
    else {
        Write-Host "✗ $DirPath is MISSING" -ForegroundColor Red
        $script:ERRORS++
        return $false
    }
}

# STEP 1: Check .env.production
Write-Host "📋 STEP 1: Environment Configuration`n" -ForegroundColor Yellow
Write-Host "======================================"

if (Test-FileExists ".env.production") {
    $envContent = Get-Content ".env.production" -Raw
    
    if ($envContent -match "DB_USER=salemfar_admin") {
        Write-Host "✓ DB_USER is set correctly" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ DB_USER might not be correct (should be: salemfar_admin)" -ForegroundColor Yellow
        $script:WARNINGS++
    }
    
    if ($envContent -match "DB_PASS=") {
        Write-Host "✓ DB_PASS is set" -ForegroundColor Green
    }
    else {
        Write-Host "✗ DB_PASS is not set" -ForegroundColor Red
        $script:ERRORS++
    }
    
    if ($envContent -match "DB_NAME=salemfar_mango") {
        Write-Host "✓ DB_NAME is set to salemfar_mango" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ DB_NAME should be: salemfar_mango" -ForegroundColor Yellow
        $script:WARNINGS++
    }
}
Write-Host ""

# STEP 2: Check backend structure
Write-Host "📁 STEP 2: Backend File Structure`n" -ForegroundColor Yellow
Write-Host "=================================="
Test-DirectoryExists "backend" | Out-Null
Test-DirectoryExists "backend/api" | Out-Null
Test-DirectoryExists "backend/auth" | Out-Null
Test-FileExists "backend/api/.htaccess" | Out-Null
Test-FileExists "backend/config.php" | Out-Null
Test-FileExists "backend/api/products.php" | Out-Null
Test-FileExists "backend/api/categories.php" | Out-Null
Write-Host ""

# STEP 3: Check required PHP files
Write-Host "🔌 STEP 3: Required PHP Endpoints`n" -ForegroundColor Yellow
Write-Host "=================================="

$RequiredFiles = @(
    "backend/api/products.php",
    "backend/api/categories.php",
    "backend/api/auth/login.php",
    "backend/api/auth/signup.php",
    "backend/api/auth/logout.php",
    "backend/api/auth/me.php",
    "backend/api/blogs.php",
    "backend/api/offers.php",
    "backend/api/reviews.php",
    "backend/api/hero-slides.php",
    "backend/api/settings.php"
)

foreach ($file in $RequiredFiles) {
    Test-FileExists $file | Out-Null
}
Write-Host ""

# STEP 4: Check frontend structure
Write-Host "🎨 STEP 4: Frontend Structure`n" -ForegroundColor Yellow
Write-Host "============================="
Test-DirectoryExists "src" | Out-Null
Test-DirectoryExists "src/app" | Out-Null
Test-DirectoryExists "src/components" | Out-Null
Test-DirectoryExists "src/context" | Out-Null
Test-FileExists "package.json" | Out-Null
Test-FileExists ".env.production.local" | Out-Null
Write-Host ""

# STEP 5: Check database schema
Write-Host "🗄️ STEP 5: Database Schema`n" -ForegroundColor Yellow
Write-Host "============================"
Test-FileExists "backend/schema.sql" | Out-Null
Write-Host ""

# STEP 6: Check documentation
Write-Host "📚 STEP 6: Documentation Files`n" -ForegroundColor Yellow
Write-Host "==============================="
Test-FileExists "CPANEL_SETUP_GUIDE.md" | Out-Null
Test-FileExists "CPANEL_FTP_UPLOAD_CHECKLIST.md" | Out-Null
Write-Host ""

# STEP 7: Check .gitignore
Write-Host "🔐 STEP 7: Security (.gitignore)`n" -ForegroundColor Yellow
Write-Host "=================================="

if (Test-Path ".gitignore" -Type Leaf) {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if ($gitignoreContent -match "\.env") {
        Write-Host "✓ .env files are in .gitignore" -ForegroundColor Green
    }
    else {
        Write-Host "✗ .env files NOT in .gitignore (SECURITY RISK!)" -ForegroundColor Red
        $script:ERRORS++
    }
}
else {
    Write-Host "⚠ .gitignore file not found" -ForegroundColor Yellow
    $script:WARNINGS++
}
Write-Host ""

# SUMMARY
Write-Host "📊 VALIDATION SUMMARY`n" -ForegroundColor Cyan
Write-Host "====================="

if ($script:ERRORS -eq 0 -and $script:WARNINGS -eq 0) {
    Write-Host "✓ ALL CHECKS PASSED! Ready to upload to cPanel`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. FTP upload /backend/api and /backend/auth folders to /public_html/api/" -ForegroundColor White
    Write-Host "2. FTP upload .env.production to /public_html/" -ForegroundColor White
    Write-Host "3. Set file permissions (.env.production → 600, others → 644)" -ForegroundColor White
    Write-Host "4. Create MySQL database in cPanel" -ForegroundColor White
    Write-Host "5. Test with: https://salemfarmmango.com/api/test-connection.php" -ForegroundColor White
    exit 0
}
else {
    Write-Host "Found $($script:ERRORS) errors and $($script:WARNINGS) warnings`n" -ForegroundColor Red
    Write-Host "⚠️  PLEASE FIX THESE ISSUES BEFORE UPLOADING TO CPANEL:`n" -ForegroundColor Yellow
    
    if ($script:ERRORS -gt 0) {
        Write-Host "🔴 CRITICAL ERRORS (must fix):" -ForegroundColor Red
        Write-Host "   - Check missing files above" -ForegroundColor Red
        Write-Host "   - Verify .env.production has all required variables" -ForegroundColor Red
        Write-Host "   - Ensure database schema file exists" -ForegroundColor Red
    }
    
    if ($script:WARNINGS -gt 0) {
        Write-Host "`n🟡 WARNINGS (should review):" -ForegroundColor Yellow
        Write-Host "   - Configuration values might need updating" -ForegroundColor Yellow
    }
    
    exit 1
}
