#!/bin/bash

# Script to apply security fixes across all branches with exposed API keys
# This script replaces hardcoded credentials with environment variable placeholders

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== RideConnect Security Fix Script ===${NC}"
echo ""

# List of branches that need to be fixed
BRANCHES_TO_FIX=("dev" "feature/user-auth" "feature/admin-module" "new-ui")

# The secure configuration content
SECURE_CONFIG='spring.application.name=backend
spring.datasource.url=${spring.datasource.url}
spring.datasource.username=${spring.datasource.username}
spring.datasource.password=${spring.datasource.password}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

jwt.secret=${jwt.secret}

#Admin Details
admin.email=${admin.email}
admin.password=${admin.password}

# Google Maps Configuration
google.maps.api.key=${Google.API.Key}

# Razorpay API Keys (Get these from Razorpay Dashboard > Settings > API Keys)
razorpay.key.id=${razorpay.key.id}
razorpay.key.secret=${razorpay.key.secret}
'

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}This script will update the application.properties file in the following branches:${NC}"
for branch in "${BRANCHES_TO_FIX[@]}"; do
    echo "  - $branch"
done
echo ""
read -p "Do you want to proceed? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Process each branch
for branch in "${BRANCHES_TO_FIX[@]}"; do
    echo ""
    echo -e "${YELLOW}=== Processing branch: ${branch} ===${NC}"
    
    # Check if branch exists remotely
    if ! git ls-remote --exit-code --heads origin "$branch" > /dev/null 2>&1; then
        echo -e "${RED}Branch ${branch} does not exist remotely. Skipping...${NC}"
        continue
    fi
    
    # Fetch the branch
    echo "Fetching branch ${branch}..."
    git fetch origin "$branch:$branch" 2>/dev/null || git checkout "$branch"
    
    # Checkout the branch
    echo "Checking out branch ${branch}..."
    git checkout "$branch"
    
    # Check if application.properties exists
    APP_PROPS_PATH="backend/src/main/resources/application.properties"
    if [ ! -f "$APP_PROPS_PATH" ]; then
        echo -e "${YELLOW}Warning: ${APP_PROPS_PATH} not found in branch ${branch}. Skipping...${NC}"
        continue
    fi
    
    # Backup the original file
    cp "$APP_PROPS_PATH" "${APP_PROPS_PATH}.backup"
    echo "Created backup: ${APP_PROPS_PATH}.backup"
    
    # Replace with secure configuration
    echo "$SECURE_CONFIG" > "$APP_PROPS_PATH"
    echo "Updated ${APP_PROPS_PATH} with secure configuration"
    
    # Check if there are changes
    if git diff --quiet "$APP_PROPS_PATH"; then
        echo -e "${GREEN}No changes needed in ${branch} (already secure)${NC}"
        rm "${APP_PROPS_PATH}.backup"
        continue
    fi
    
    # Show the diff
    echo ""
    echo -e "${YELLOW}Changes to be committed:${NC}"
    git --no-pager diff "$APP_PROPS_PATH"
    echo ""
    
    # Commit the changes
    git add "$APP_PROPS_PATH"
    git commit -m "Security: Replace exposed API keys with environment variables

This commit removes hardcoded credentials and replaces them with
environment variable placeholders to prevent exposure of sensitive data.

Affected credentials:
- Database connection details
- JWT secret
- Admin credentials
- Google Maps API key
- Razorpay API keys

See SECURITY_FIX_REPORT.md for details."
    
    echo -e "${GREEN}Committed changes to ${branch}${NC}"
    
    # Push the changes
    echo "Pushing changes to origin/${branch}..."
    if git push origin "$branch"; then
        echo -e "${GREEN}Successfully pushed changes to ${branch}${NC}"
        rm "${APP_PROPS_PATH}.backup"
    else
        echo -e "${RED}Failed to push changes to ${branch}. Backup preserved at ${APP_PROPS_PATH}.backup${NC}"
        echo -e "${RED}You may need to push manually or check permissions.${NC}"
    fi
done

# Return to original branch
echo ""
echo -e "${YELLOW}Returning to original branch: ${CURRENT_BRANCH}${NC}"
git checkout "$CURRENT_BRANCH"

echo ""
echo -e "${GREEN}=== Security fix script completed ===${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Don't forget to:${NC}"
echo "1. Rotate all exposed credentials immediately"
echo "2. Update the SECURITY_FIX_REPORT.md with rotation status"
echo "3. Set up environment variables for local development"
echo "4. Configure secrets in your deployment environment"
echo ""
