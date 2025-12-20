"# RideConnect Platform

## 🔒 Security Notice

**IMPORTANT**: This repository previously contained exposed API keys and credentials. If you cloned this repository before the security fix, please:

1. **Review** the [SECURITY_FIX_REPORT.md](./SECURITY_FIX_REPORT.md) for details
2. **Never use** the exposed credentials in production
3. **Rotate** all credentials mentioned in the security report
4. **Use environment variables** as described below

## Setup

### Environment Configuration

This project uses environment variables for sensitive configuration. Copy the example file and update it with your credentials:

```bash
cp .env.example .env
```

Then edit `.env` with your actual credentials. **Never commit the `.env` file to version control.**

### Required Environment Variables

- `spring.datasource.url` - Database connection URL
- `spring.datasource.username` - Database username
- `spring.datasource.password` - Database password
- `jwt.secret` - JWT signing secret
- `admin.email` - Admin email address
- `admin.password` - Admin password
- `Google.API.Key` - Google Maps API key
- `razorpay.key.id` - Razorpay API key ID
- `razorpay.key.secret` - Razorpay API secret

### Applying Security Fixes to Other Branches

If you need to apply the security fix to multiple branches, use the provided script:

```bash
./apply-security-fix.sh
```

This script will automatically update the `application.properties` file across all affected branches.

## Development

(Add your development instructions here)

## Contributing

When contributing to this project, please ensure:
- Never commit sensitive credentials
- Use environment variables for all secrets
- Test your changes before submitting a PR
" 
