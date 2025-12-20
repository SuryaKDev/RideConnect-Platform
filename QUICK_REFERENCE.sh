#!/bin/bash

# Quick Reference: Commands to Apply Security Fixes
# This file contains the exact commands needed to apply the security fixes
# to each affected branch. Execute these commands in order.

# IMPORTANT: Before running any commands, ensure you have:
# 1. Write access to the repository
# 2. Git configured with your credentials
# 3. A clean working directory (git status shows no uncommitted changes)

echo "============================================================"
echo "Security Fix Quick Reference"
echo "============================================================"
echo ""

# METHOD 1: Automated Fix (Recommended)
echo "METHOD 1: Automated Fix (Recommended)"
echo "--------------------------------------"
echo "This method applies all patches automatically:"
echo ""
echo "  ./apply-security-fix.sh"
echo ""

# METHOD 2: Manual Patch Application
echo "METHOD 2: Manual Patch Application"
echo "-----------------------------------"
echo "Apply patches to individual branches manually:"
echo ""

echo "# Fix dev branch:"
echo "git checkout dev"
echo "git am patches/0001-Security-Replace-exposed-API-keys-with-environme.dev.patch"
echo "git push origin dev"
echo ""

echo "# Fix feature/user-auth branch:"
echo "git checkout feature/user-auth"
echo "git am patches/0001-Security-Replace-exposed-API-keys-.feature-user-auth.patch"
echo "git push origin feature/user-auth"
echo ""

echo "# Fix feature/admin-module branch:"
echo "git checkout feature/admin-module"
echo "git am patches/0001-Security-Replace-exposed-API-ke.feature-admin-module.patch"
echo "git push origin feature/admin-module"
echo ""

echo "# Fix new-ui branch:"
echo "git checkout new-ui"
echo "git am patches/0001-Security-Replace-exposed-API-keys-with-enviro.new-ui.patch"
echo "git push origin new-ui"
echo ""

# METHOD 3: Manual File Edit
echo "METHOD 3: Manual File Edit"
echo "--------------------------"
echo "If patches don't apply cleanly, manually edit the file:"
echo ""
echo "For each affected branch (dev, feature/user-auth, feature/admin-module, new-ui):"
echo "  1. git checkout <branch-name>"
echo "  2. Edit backend/src/main/resources/application.properties"
echo "  3. Replace all hardcoded values with \${variable.name} placeholders"
echo "  4. Refer to the secure template in this PR's application.properties"
echo "  5. git add backend/src/main/resources/application.properties"
echo "  6. git commit -m 'Security: Replace exposed API keys with environment variables'"
echo "  7. git push origin <branch-name>"
echo ""

# Post-Fix Actions
echo "============================================================"
echo "POST-FIX ACTIONS (CRITICAL - DO NOT SKIP)"
echo "============================================================"
echo ""
echo "After applying fixes, IMMEDIATELY rotate these credentials:"
echo ""
echo "1. Google Maps API Key:"
echo "   - Go to: https://console.cloud.google.com/apis/credentials"
echo "   - Revoke: AIzaSyAYu6n-Vwz8LMXwsYGogD2WnYttR3yta9M"
echo "   - Generate new key with appropriate restrictions"
echo ""
echo "2. Razorpay API Keys:"
echo "   - Go to: https://dashboard.razorpay.com/app/keys"
echo "   - Revoke: rzp_test_RpSNiUHKHGT1rz"
echo "   - Generate new test/live keys"
echo ""
echo "3. Database Password:"
echo "   - Connect to PostgreSQL and run:"
echo "   - ALTER USER postgres WITH PASSWORD 'new_secure_password';"
echo ""
echo "4. JWT Secret:"
echo "   - Generate a new cryptographically secure secret:"
echo "   - openssl rand -base64 64"
echo ""
echo "5. Admin Password:"
echo "   - Update in your user management system"
echo "   - Use a strong, unique password"
echo ""

# Environment Setup
echo "============================================================"
echo "ENVIRONMENT SETUP"
echo "============================================================"
echo ""
echo "Set up local development environment:"
echo ""
echo "  cp .env.example .env"
echo "  # Edit .env file with your new credentials"
echo "  # The .env file is gitignored and safe for local use"
echo ""

# Verification
echo "============================================================"
echo "VERIFICATION"
echo "============================================================"
echo ""
echo "Verify the fixes worked:"
echo ""
echo "For each fixed branch:"
echo "  git checkout <branch-name>"
echo "  grep -E '(jdbc:|rzp_|AIza|admin123|Thenmoli)' backend/src/main/resources/application.properties"
echo "  # Should return nothing (no hardcoded values found)"
echo ""

echo "============================================================"
echo "For detailed information, see:"
echo "  - SECURITY_FIX_REPORT.md"
echo "  - SUMMARY.md"
echo "  - patches/README.md"
echo "============================================================"
