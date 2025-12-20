# Security Patches for Exposed API Keys

This directory contains Git patch files that can be applied to branches with exposed API keys.

## Available Patches

| Patch File | Branch | Description |
|------------|--------|-------------|
| `0001-Security-Replace-exposed-API-keys-with-environme.dev.patch` | `dev` | Replaces all exposed credentials (database, JWT, admin, Google Maps, Razorpay) |
| `0001-Security-Replace-exposed-API-keys-.feature-user-auth.patch` | `feature/user-auth` | Replaces database and JWT credentials |
| `0001-Security-Replace-exposed-API-ke.feature-admin-module.patch` | `feature/admin-module` | Replaces database and JWT credentials |
| `0001-Security-Replace-exposed-API-keys-with-enviro.new-ui.patch` | `new-ui` | Replaces all exposed credentials |

## How to Apply Patches

### Option 1: Apply Individual Patches

To apply a specific patch to its corresponding branch:

```bash
# Checkout the target branch
git checkout <branch-name>

# Apply the patch
git am patches/<patch-file-name>

# Push the changes
git push origin <branch-name>
```

### Option 2: Use the Automation Script

The repository includes an automation script that applies all patches:

```bash
./apply-security-fix.sh
```

This script will:
1. Checkout each affected branch
2. Apply the security fixes
3. Commit the changes
4. Push to the remote repository

### Option 3: Manual Application

If you prefer to manually apply the changes:

1. Checkout the branch you want to fix:
   ```bash
   git checkout <branch-name>
   ```

2. Edit `backend/src/main/resources/application.properties` and replace all hardcoded values with environment variable placeholders as shown in the root `backend/src/main/resources/application.properties` file.

3. Commit and push:
   ```bash
   git add backend/src/main/resources/application.properties
   git commit -m "Security: Replace exposed API keys with environment variables"
   git push origin <branch-name>
   ```

## Verification

After applying the patches, verify that:

1. The `application.properties` file no longer contains hardcoded credentials
2. All values are replaced with `${variable.name}` placeholders
3. The application still runs when proper environment variables are set

## Important Notes

⚠️ **Remember to:**
- Rotate all exposed credentials immediately (see [SECURITY_FIX_REPORT.md](../SECURITY_FIX_REPORT.md))
- Set up environment variables before running the application
- Never commit actual credentials to version control again
- Use the provided `.env.example` file as a template for local development

## Troubleshooting

### Patch fails to apply

If a patch fails to apply due to conflicts:

1. Check if the branch has been modified since the patch was created
2. Apply the changes manually by referring to the patch file content
3. Use `git apply --reject` to see what parts failed

### Permission denied when pushing

If you get authentication errors when pushing:

1. Ensure you have write access to the repository
2. Check your Git credentials
3. Consider using SSH instead of HTTPS for authentication

## Questions?

Refer to the main [SECURITY_FIX_REPORT.md](../SECURITY_FIX_REPORT.md) for detailed information about the security issue and remediation steps.
