# Security Fix: Remove Exposed API Keys

## Issue
Multiple branches in the repository contain exposed API keys and sensitive credentials hardcoded in the `application.properties` file.

## Exposed Credentials Found

### Branches with Exposed Credentials:

#### 1. `dev` branch
- **Database credentials**: 
  - URL: `jdbc:postgresql://localhost:5432/ride_sharing_db`
  - Username: `postgres`
  - Password: `Thenmoli123!`
- **JWT secret**: `super_secret_key_for_ride_sharing_app_123!`
- **Admin credentials**:
  - Email: `admin@rideconnect.com`
  - Password: `admin123`
- **Google Maps API Key**: `AIzaSyAYu6n-Vwz8LMXwsYGogD2WnYttR3yta9M`
- **Razorpay Keys**:
  - Key ID: `rzp_test_RpSNiUHKHGT1rz`
  - Key Secret: `pfRgTw6TMvLE5HF1g9O994LP`

#### 2. `feature/user-auth` branch
- **Database credentials**:
  - URL: `jdbc:postgresql://localhost:5432/ride_sharing_db`
  - Username: `postgres`
  - Password: `Thenmoli123!`
- **JWT secret**: `super_secret_key_for_ride_sharing_app_123!`

#### 3. `feature/admin-module` branch
- **Database credentials**:
  - URL: `jdbc:postgresql://localhost:5432/ride_sharing_db`
  - Username: `postgres`
  - Password: `Thenmoli123!`
- **JWT secret**: `super_secret_key_for_ride_sharing_app_123!`

#### 4. `new-ui` branch
- **Database credentials**:
  - URL: `jdbc:postgresql://localhost:5432/ride_sharing_db`
  - Username: `postgres`
  - Password: `Thenmoli123!`
- **JWT secret**: `super_secret_key_for_ride_sharing_app_123!`
- **Admin credentials**:
  - Email: `admin@rideconnect.com`
  - Password: `admin123`

### Branches Already Secure (No Changes Needed):
- ✅ `full-project` - Already uses environment variables
- ✅ `Surya_K` - Already uses environment variables
- ✅ `Raghvendra_Kumar` - Already uses environment variables

## Solution

### Corrected Configuration File
The `application.properties` file has been updated to use environment variable placeholders instead of hardcoded values:

```properties
spring.application.name=backend
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
```

### How to Apply This Fix to Other Branches

For each branch listed above that has exposed credentials:

1. Checkout the branch:
   ```bash
   git checkout <branch-name>
   ```

2. Replace the content of `backend/src/main/resources/application.properties` with the corrected version shown above.

3. Commit and push the changes:
   ```bash
   git add backend/src/main/resources/application.properties
   git commit -m "Security: Replace exposed API keys with environment variables"
   git push origin <branch-name>
   ```

### Setting Environment Variables

After applying the fix, users must set the following environment variables before running the application:

```bash
export spring.datasource.url="jdbc:postgresql://localhost:5432/ride_sharing_db"
export spring.datasource.username="postgres"
export spring.datasource.password="your_secure_password"
export jwt.secret="your_secure_jwt_secret"
export admin.email="admin@rideconnect.com"
export admin.password="your_secure_admin_password"
export Google.API.Key="your_google_maps_api_key"
export razorpay.key.id="your_razorpay_key_id"
export razorpay.key.secret="your_razorpay_key_secret"
```

Or use a `.env` file with a library like `dotenv` or configure them in your deployment environment (e.g., Kubernetes secrets, AWS Parameter Store, etc.).

## Security Best Practices

1. **Never commit sensitive credentials** to version control
2. **Use environment variables** for all sensitive configuration
3. **Rotate exposed credentials immediately**:
   - Change the database password
   - Generate a new JWT secret
   - Revoke and regenerate the exposed Google Maps API key
   - Revoke and regenerate the exposed Razorpay API keys
4. **Use `.gitignore`** to prevent committing local environment files
5. **Consider using secret management tools** like HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault for production environments

## Immediate Actions Required

⚠️ **CRITICAL**: The exposed credentials should be rotated immediately:

1. **Google Maps API Key** (`AIzaSyAYu6n-Vwz8LMXwsYGogD2WnYttR3yta9M`):
   - Revoke this key in Google Cloud Console
   - Generate a new API key
   - Set appropriate restrictions on the new key

2. **Razorpay API Keys** (`rzp_test_RpSNiUHKHGT1rz`):
   - Revoke these keys in Razorpay Dashboard
   - Generate new test/live keys
   - Store them securely as environment variables

3. **Database Password** (`Thenmoli123!`):
   - Change the PostgreSQL password
   - Update it in your secure environment configuration

4. **JWT Secret** (`super_secret_key_for_ride_sharing_app_123!`):
   - Generate a new, cryptographically secure secret
   - Update it in your environment configuration
   - Note: This will invalidate all existing user sessions

5. **Admin Password** (`admin123`):
   - Change the admin password to a strong, unique password
   - Store it securely

## Git History Cleanup (Optional but Recommended)

Since these credentials are in the Git history, consider using tools like:
- `git-filter-repo` or `BFG Repo-Cleaner` to remove sensitive data from Git history
- Contact GitHub Support to clear the cache if needed

However, **always rotate the exposed credentials first**, as cleaning Git history does not guarantee the secrets haven't been accessed.
