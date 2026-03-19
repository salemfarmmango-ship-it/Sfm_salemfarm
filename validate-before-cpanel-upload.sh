#!/bin/bash
# validate-before-cpanel-upload.sh
# Run this before uploading to cPanel to verify everything is ready

echo "🔍 Salem Farm Mango - Pre-Upload Validation Script"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to print status
check_file() {
    local file=$1
    local type=$2
    
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file exists"
        return 0
    else
        echo -e "${RED}✗${NC} $file missing"
        ((ERRORS++))
        return 1
    fi
}

check_dir() {
    local dir=$1
    
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
        return 0
    else
        echo -e "${RED}✗${NC} $dir missing"
        ((ERRORS++))
        return 1
    fi
}

# 1. Check .env.production
echo "📋 STEP 1: Environment Configuration"
echo "======================================"
check_file ".env.production"
if [ -f ".env.production" ]; then
    if grep -q "DB_USER=salemfar_admin" .env.production; then
        echo -e "${GREEN}✓${NC} DB_USER is set"
    else
        echo -e "${YELLOW}⚠${NC} DB_USER might not be correct (should be: salemfar_admin)"
        ((WARNINGS++))
    fi
    
    if grep -q "DB_PASS=" .env.production; then
        echo -e "${GREEN}✓${NC} DB_PASS is set"
    else
        echo -e "${RED}✗${NC} DB_PASS is not set"
        ((ERRORS++))
    fi
    
    if grep -q "DB_NAME=salemfar_mango" .env.production; then
        echo -e "${GREEN}✓${NC} DB_NAME is set to salemfar_mango"
    else
        echo -e "${YELLOW}⚠${NC} DB_NAME should be: salemfar_mango"
        ((WARNINGS++))
    fi
fi
echo ""

# 2. Check backend structure
echo "📁 STEP 2: Backend File Structure"
echo "=================================="
check_dir "backend"
check_dir "backend/api"
check_dir "backend/auth"
check_file "backend/api/.htaccess"
check_file "backend/config.php"
check_file "backend/api/products.php"
check_file "backend/api/categories.php"
echo ""

# 3. Check required PHP files
echo "🔌 STEP 3: Required PHP Endpoints"
echo "=================================="
REQUIRED_FILES=(
    "backend/api/products.php"
    "backend/api/categories.php"
    "backend/api/auth/login.php"
    "backend/api/auth/signup.php"
    "backend/api/auth/logout.php"
    "backend/api/auth/me.php"
    "backend/api/blogs.php"
    "backend/api/offers.php"
    "backend/api/reviews.php"
    "backend/api/hero-slides.php"
    "backend/api/settings.php"
)

for file in "${REQUIRED_FILES[@]}"; do
    check_file "$file"
done
echo ""

# 4. Check frontend structure
echo "🎨 STEP 4: Frontend Structure"
echo "============================="
check_dir "src"
check_dir "src/app"
check_dir "src/components"
check_dir "src/context"
check_file "package.json"
check_file ".env.production.local"
echo ""

# 5. Check database schema
echo "🗄️ STEP 5: Database Schema"
echo "============================"
check_file "backend/schema.sql"
echo ""

# 6. Check documentation
echo "📚 STEP 6: Documentation Files"
echo "==============================="
check_file "CPANEL_SETUP_GUIDE.md"
check_file "CPANEL_FTP_UPLOAD_CHECKLIST.md"
echo ""

# 7. Check Git status
echo "🔄 STEP 7: Git Status"
echo "====================="
if git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Git repository exists"
    
    if [ -z "$(git status --porcelain)" ]; then
        echo -e "${GREEN}✓${NC} Working directory clean (all changes committed)"
    else
        echo -e "${YELLOW}⚠${NC} Uncommitted changes detected:"
        git status --short | head -5
        ((WARNINGS++))
    fi
else
    echo -e "${RED}✗${NC} Not a git repository"
    ((ERRORS++))
fi
echo ""

# 8. Check gitignore
echo "🔐 STEP 8: Security (.gitignore)"
echo "=================================="
if grep -q "\.env" .gitignore 2>/dev/null; then
    echo -e "${GREEN}✓${NC} .env files are in .gitignore"
else
    echo -e "${RED}✗${NC} .env files NOT in .gitignore (SECURITY RISK!)"
    ((ERRORS++))
fi
echo ""

# 9. Summary
echo "📊 VALIDATION SUMMARY"
echo "====================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CHECKS PASSED!${NC} Ready to upload to cPanel"
    echo ""
    echo "Next steps:"
    echo "1. FTP upload /backend/api and /backend/auth folders to /public_html/api/"
    echo "2. FTP upload .env.production to /public_html/"
    echo "3. Set file permissions (.env.production → 600, others → 644)"
    echo "4. Create MySQL database in cPanel"
    echo "5. Test with: https://salemfarmmango.com/api/test-connection.php"
    exit 0
else
    echo -e "${YELLOW}Found ${ERRORS} errors and ${WARNINGS} warnings${NC}"
    echo ""
    echo "⚠️  PLEASE FIX THESE ISSUES BEFORE UPLOADING TO CPANEL:"
    echo ""
    if [ $ERRORS -gt 0 ]; then
        echo "🔴 CRITICAL ERRORS (must fix):"
        echo "   - Check missing files above"
        echo "   - Verify .env.production has all required variables"
        echo "   - Ensure database schema file exists"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo ""
        echo "🟡 WARNINGS (should review):"
        echo "   - Uncommitted changes in git"
        echo "   - Configuration values might need updating"
    fi
    exit 1
fi
