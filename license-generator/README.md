# LaundryPro License Generator

**🔐 Internal Vendor Tool - DO NOT DISTRIBUTE**

This is an internal command-line tool for generating, managing, and verifying licenses for the LaundryPro Desktop Management System. This tool is intended for vendor use only and must never be included in the distributed application.

## ⚠️ CRITICAL SECURITY WARNINGS

- **NEVER distribute this tool with the application**
- **Keep the private key secure and never share it**
- **Back up the private key in a secure location**
- **Only authorized personnel should have access to this tool**
- **All generated licenses are cryptographically signed**

## 🚀 Quick Start

### 1. Installation

```bash
cd license-generator
npm install
```

### 2. Generate RSA Key Pair (First Time Only)

```bash
npm run license:keys
```

This creates:
- `keys/rsa-private.pem` - Private key (keep secure!)
- `keys/rsa-public.pem` - Public key (embed in application)

### 3. Generate Your First License

```bash
npm run license:generate
```

Follow the interactive prompts to create a license.

## 📋 Available Commands

### Key Management

```bash
# Generate RSA-2048 key pair
npm run license:keys
```

### License Generation

```bash
# Interactive license generation
npm run license:generate

# Batch generate multiple licenses
npm run license:batch
```

### License Management

```bash
# List all generated licenses
npm run license:list

# Verify a license key
npm run license:verify [license-key]

# Revoke a license
npm run license:revoke [license-id]

# Extend license expiry
npm run license:extend [license-id] [new-expiry-date]
```

### Testing

```bash
# Run comprehensive test suite
npm test
```

## 🎫 License Types

### TRIAL
- **Duration**: 14 days
- **Features**: Limited feature set
- **Users**: 1 user
- **Use Case**: Evaluation period

### STANDARD
- **Duration**: Configurable
- **Features**: Core features
- **Users**: 1-5 users
- **Use Case**: Small businesses

### PROFESSIONAL
- **Duration**: Configurable
- **Features**: Advanced features
- **Users**: 5-25 users
- **Use Case**: Medium businesses

### ENTERPRISE
- **Duration**: Configurable
- **Features**: All features
- **Users**: Unlimited
- **Use Case**: Large businesses

## 🔧 Available Features

- `all` - All features (Enterprise only)
- `customers` - Customer management
- `orders` - Order management
- `payments` - Payment processing
- `expenses` - Expense tracking
- `reports` - Reporting & analytics
- `backup` - Backup & restore
- `users` - User management
- `audit` - Audit logging
- `printing` - Print management
- `services` - Service management

## 📊 License Management

### Interactive License Generation

The tool provides a user-friendly wizard that prompts for:

1. **Machine ID** - Hardware fingerprint (format: LND-XXXXXXXX)
2. **Customer Details** - Name, email, company
3. **License Type** - Trial, Standard, Professional, Enterprise
4. **Features** - Select from available features
5. **User Limit** - Maximum concurrent users
6. **Expiry** - Duration or custom date

### Batch Generation

Generate multiple licenses at once:

```bash
npm run license:batch
```

Options:
- Number of licenses (1-1000)
- License type and features
- Automatic customer naming
- Bulk export to JSON file

### License Verification

Verify any license key:

```bash
npm run license:verify
```

Shows:
- License validity and signature verification
- Customer and license details
- Expiry status and days remaining
- Database storage status
- Revocation status

### License Revocation

Revoke licenses for security or policy violations:

```bash
npm run license:revoke
```

Revocation reasons:
- License violation
- Payment issue
- Customer request
- Security breach
- Duplicate license
- Other (custom reason)

### License Extension

Extend license expiry dates:

```bash
npm run license:extend
```

Extension options:
- 30 days, 90 days, 1 year, 2 years
- Custom date
- Lifetime (never expires)

## 🗄️ Database Management

The tool uses SQLite for local license storage:

- **Database File**: `license-generator.db`
- **Automatic Backups**: Available via export
- **Search Functionality**: Find licenses by customer, email, machine ID
- **Statistics**: License counts by type and status

### Database Schema

```sql
CREATE TABLE licenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  licenseId TEXT UNIQUE NOT NULL,
  machineId TEXT NOT NULL,
  issuedTo TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  licenseType TEXT NOT NULL,
  features TEXT NOT NULL,
  maxUsers INTEGER NOT NULL DEFAULT 1,
  issuedAt TEXT NOT NULL,
  expiresAt TEXT,
  product TEXT NOT NULL,
  version TEXT NOT NULL,
  licenseKey TEXT NOT NULL,
  isRevoked BOOLEAN DEFAULT FALSE,
  revokedAt TEXT,
  revokedReason TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🔐 Cryptographic Details

### RSA-2048 Signature

- **Algorithm**: RSA-2048 with SHA-256
- **Key Format**: PEM
- **Signature**: Base64 encoded
- **Verification**: Public key embedded in application

### License Key Format

License keys are Base64-encoded JSON containing:

```json
{
  "payload": "JSON string of license data",
  "signature": "Base64 RSA signature"
}
```

### Security Features

- **Hardware Binding**: Machine ID prevents license sharing
- **Cryptographic Signing**: RSA-2048 prevents tampering
- **Expiry Validation**: Time-based license control
- **Revocation Support**: Centralized license management
- **Audit Trail**: Complete license history

## 🧪 Testing

Comprehensive test suite with 15 automated tests:

```bash
npm test
```

Test Coverage:
- ✅ RSA key generation and loading
- ✅ Database initialization and operations
- ✅ License generation and signing
- ✅ License verification and parsing
- ✅ Database storage and retrieval
- ✅ License revocation and extension
- ✅ Statistics and search functionality
- ✅ CLI service utilities
- ✅ Hash functions and crypto operations
- ✅ Export and backup functionality

Expected: **100% pass rate** (15/15 tests)

## 📁 File Structure

```
license-generator/
├── src/
│   ├── services/
│   │   ├── crypto.service.ts      # RSA operations
│   │   ├── database.service.ts    # SQLite management
│   │   └── cli.service.ts         # Interactive prompts
│   ├── index.ts                   # Main CLI application
│   └── test.ts                    # Test suite
├── keys/                          # RSA key storage (gitignored)
│   ├── rsa-private.pem           # Private key (SECURE!)
│   └── rsa-public.pem            # Public key
├── dist/                         # Compiled JavaScript
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── .gitignore                    # Security exclusions
└── README.md                     # This documentation
```

## 🔒 Security Best Practices

### Private Key Security

1. **Generate keys on secure machine**
2. **Store private key in encrypted storage**
3. **Create secure backups**
4. **Limit access to authorized personnel only**
5. **Never commit keys to version control**
6. **Rotate keys annually**

### License Distribution

1. **Verify customer identity before issuing**
2. **Use secure channels for license delivery**
3. **Keep records of all issued licenses**
4. **Monitor for license abuse**
5. **Revoke compromised licenses immediately**

### Tool Security

1. **Keep tool on secure, isolated machines**
2. **Use strong authentication for tool access**
3. **Audit all license generation activities**
4. **Regular security updates**
5. **Secure database backups**

## 🚨 Emergency Procedures

### Compromised Private Key

1. **Immediately stop using the compromised key**
2. **Generate new RSA key pair**
3. **Update application with new public key**
4. **Revoke all licenses signed with old key**
5. **Re-issue licenses with new key**
6. **Notify customers of security update**

### License Abuse Detection

1. **Monitor license usage patterns**
2. **Check for duplicate machine IDs**
3. **Investigate unusual activation patterns**
4. **Revoke suspicious licenses**
5. **Contact affected customers**

## 📞 Support

For technical support or security concerns:

- **Internal Use Only** - Contact system administrator
- **Security Issues** - Immediate escalation required
- **Key Management** - Authorized personnel only

## 📄 License

This tool is proprietary software for internal vendor use only.

**© 2026 LaundryPro Team - All Rights Reserved**

---

**⚠️ REMEMBER: This tool must NEVER be distributed with the application!**