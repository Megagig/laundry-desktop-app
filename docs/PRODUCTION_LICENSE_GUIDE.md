# Production License Generation Guide 🎫

**Complete workflow for generating and managing LaundryPro licenses in production**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Production Workflow](#production-workflow)
5. [License Types & Features](#license-types--features)
6. [Customer Onboarding Process](#customer-onboarding-process)
7. [License Management](#license-management)
8. [Security Best Practices](#security-best-practices)
9. [Troubleshooting](#troubleshooting)
10. [Emergency Procedures](#emergency-procedures)

---

## Overview

The LaundryPro license system uses RSA-2048 cryptographic signatures to ensure license authenticity and prevent tampering. Each license is bound to a specific machine ID and contains customer details, feature permissions, and expiry information.

### Key Components
- **License Generator Tool** - Secure CLI tool for creating licenses
- **RSA Key Pair** - Private key for signing, public key embedded in app
- **License Database** - SQLite database for tracking issued licenses
- **Machine ID System** - Hardware fingerprinting for license binding

---

## Prerequisites

### System Requirements
- **Operating System**: Windows, macOS, or Linux
- **Node.js**: Version 18 or higher
- **Storage**: 100MB for tool and database
- **Network**: Internet access for customer verification (optional)

### Personnel Requirements
- **License Administrator** - Authorized to generate licenses
- **Security Officer** - Manages private keys and security policies
- **Customer Support** - Handles license-related customer issues

### Security Infrastructure
- **Secure Workstation** - Air-gapped or highly secured machine
- **Encrypted Storage** - For private key backup
- **Access Controls** - Multi-factor authentication
- **Audit Logging** - Track all license operations

---

## Initial Setup

### 1. Install License Generator

```bash
# Navigate to license generator directory
cd license-generator

# Install dependencies
npm install

# Verify installation
npm test
```

**Expected Output**: All 15 tests should pass ✅

### 2. Generate RSA Key Pair

```bash
# Generate RSA-2048 key pair (FIRST TIME ONLY)
npm run license:keys
```

**This creates**:
- `keys/rsa-private.pem` - **CRITICAL**: Keep secure, never share
- `keys/rsa-public.pem` - Embed in application

### 3. Secure Private Key

**CRITICAL SECURITY STEPS**:

1. **Backup Private Key**:
   ```bash
   # Create encrypted backup
   cp keys/rsa-private.pem /secure/backup/location/
   ```

2. **Set Permissions**:
   ```bash
   # Restrict access (Linux/macOS)
   chmod 600 keys/rsa-private.pem
   chmod 644 keys/rsa-public.pem
   ```

3. **Document Key Information**:
   - Creation date
   - Backup locations
   - Authorized personnel
   - Rotation schedule

### 4. Update Application

**Embed public key in application**:

1. Copy `keys/rsa-public.pem` content
2. Update `electron/config/public-key.ts`:
   ```typescript
   export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
   -----END PUBLIC KEY-----`
   ```
3. Rebuild and test application

---

## Production Workflow

### Phase 1: Customer Qualification

#### 1.1 Sales Process
- Customer expresses interest
- Sales team qualifies requirements
- Pricing and licensing terms agreed
- Purchase order received

#### 1.2 Technical Assessment
- Customer provides system specifications
- Machine ID collection process explained
- Installation requirements verified
- Support contact established

### Phase 2: License Preparation

#### 2.1 Collect Customer Information

**Required Information**:
- **Company Name**: Legal business name
- **Contact Person**: Primary license holder
- **Email Address**: For license delivery and support
- **Machine ID**: Hardware fingerprint (format: LND-XXXXXXXX)
- **License Type**: Trial, Standard, Professional, Enterprise
- **User Count**: Maximum concurrent users
- **Features**: Required feature set
- **Duration**: License validity period

#### 2.2 Machine ID Collection

**Customer Instructions**:
```bash
# Customer runs on their machine
node scripts/get-machine-id.cjs
```

**Output Format**: `LND-E01F56F7` (formatted machine ID)

**Verification Steps**:
1. Confirm machine ID format is correct
2. Verify it's from the target installation machine
3. Check for duplicate machine IDs in database
4. Document machine specifications

### Phase 3: License Generation

#### 3.1 Interactive License Generation

```bash
# Start interactive license generator
npm run license:generate
```

**Wizard Prompts**:
1. **Machine ID**: Enter customer's machine ID
2. **Customer Name**: Full name of license holder
3. **Email**: Customer's email address
4. **Company**: Company name (optional)
5. **License Type**: Select from available types
6. **Features**: Choose feature set
7. **Max Users**: Set user limit
8. **Expiry**: Set expiration date or lifetime

#### 3.2 License Validation

**Automatic Checks**:
- ✅ Machine ID format validation
- ✅ Email format validation
- ✅ Feature compatibility check
- ✅ User limit validation
- ✅ Expiry date validation
- ✅ Cryptographic signature generation
- ✅ Database storage

#### 3.3 License Output

**Generated Files**:
- **License Key**: Base64-encoded signed license
- **Database Record**: Stored in `license-generator.db`
- **Verification Info**: License details and signature

**Example Output**:
```
✅ LICENSE GENERATED SUCCESSFULLY!

📋 License Details:
   License ID: 8b8826b4-87a2-4ebe-970b-f5004fc35e4b
   Machine ID: LND-E01F56F7
   Issued To: John Smith
   Company: ABC Laundry Services
   License Type: PROFESSIONAL
   Features: customers, orders, payments, reports, backup
   Max Users: 10
   Expires: 2027-03-12 (365 days)

🔑 LICENSE KEY:
eyJwYXlsb2FkIjoie1wicHJvZHVjdFwiOlwiTGF1bmRyeVByb1wiLFwidmVyc2lvblwiOlwiMS4wLjBcIi...

📧 DELIVERY INSTRUCTIONS:
1. Send license key to customer via secure channel
2. Provide activation instructions
3. Schedule installation support call
4. Add customer to support system
```

### Phase 4: License Delivery

#### 4.1 Secure Delivery Methods

**Recommended Channels**:
1. **Encrypted Email**: PGP/GPG encrypted message
2. **Secure Portal**: Customer login portal
3. **Phone/Video Call**: Read license key verbally
4. **Secure File Transfer**: SFTP or similar

**Delivery Template**:
```
Subject: LaundryPro License - [Customer Name]

Dear [Customer Name],

Your LaundryPro license has been generated and is ready for activation.

License Details:
- License Type: [TYPE]
- Max Users: [COUNT]
- Expires: [DATE]
- Features: [FEATURE LIST]

License Key:
[LICENSE_KEY]

Activation Instructions:
1. Install LaundryPro application
2. Launch the application
3. Navigate to License Activation page
4. Paste the license key above
5. Click "Activate License"

Support:
- Installation Guide: [LINK]
- Video Tutorial: [LINK]
- Support Contact: [EMAIL/PHONE]

Best regards,
LaundryPro Licensing Team
```

#### 4.2 Customer Activation Support

**Support Checklist**:
- [ ] License key delivered securely
- [ ] Customer received activation instructions
- [ ] Installation support scheduled
- [ ] Customer added to support system
- [ ] License activation confirmed
- [ ] Initial training scheduled

---

## License Types & Features

### Trial License
- **Duration**: 14 days
- **Users**: 1
- **Features**: Basic features only
- **Use Case**: Product evaluation
- **Restrictions**: Limited data, no backup

### Standard License
- **Duration**: 1 year (renewable)
- **Users**: 1-5
- **Features**: Core business features
- **Use Case**: Small laundromats
- **Includes**: Customers, orders, payments, basic reports

### Professional License
- **Duration**: 1-3 years
- **Users**: 5-25
- **Features**: Advanced features
- **Use Case**: Medium businesses
- **Includes**: All Standard + expenses, advanced reports, backup

### Enterprise License
- **Duration**: 1-5 years or lifetime
- **Users**: Unlimited
- **Features**: All features
- **Use Case**: Large operations
- **Includes**: Everything + audit logs, user management, API access

### Feature Matrix

| Feature | Trial | Standard | Professional | Enterprise |
|---------|-------|----------|--------------|------------|
| Customer Management | ✅ | ✅ | ✅ | ✅ |
| Order Management | ✅ | ✅ | ✅ | ✅ |
| Payment Processing | ✅ | ✅ | ✅ | ✅ |
| Basic Reports | ✅ | ✅ | ✅ | ✅ |
| Expense Tracking | ❌ | ❌ | ✅ | ✅ |
| Advanced Reports | ❌ | ❌ | ✅ | ✅ |
| Backup & Restore | ❌ | ❌ | ✅ | ✅ |
| Multi-User Support | ❌ | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |
| Audit Logging | ❌ | ❌ | ❌ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |

---

## Customer Onboarding Process

### Pre-Installation Phase

#### 1. Welcome Package
- License key and activation instructions
- Installation guide and system requirements
- Quick start tutorial videos
- Support contact information

#### 2. System Preparation
- Verify system requirements
- Prepare installation environment
- Backup existing data (if applicable)
- Schedule installation window

### Installation Phase

#### 3. Application Installation
- Download latest application version
- Run installer with administrator privileges
- Configure initial settings
- Test basic functionality

#### 4. License Activation
- Launch application
- Navigate to activation page
- Enter license key
- Verify activation success
- Confirm feature availability

### Post-Installation Phase

#### 5. Initial Configuration
- Set up company information
- Configure user accounts (if multi-user)
- Import existing data (if applicable)
- Configure backup settings

#### 6. Training & Support
- Conduct initial training session
- Provide user manuals and guides
- Set up ongoing support channels
- Schedule follow-up check-ins

---

## License Management

### Daily Operations

#### License Verification
```bash
# Verify a specific license
npm run license:verify [LICENSE_KEY]

# List all licenses
npm run license:list

# Check license statistics
npm run license:list | grep "Total Licenses"
```

#### Customer Support
```bash
# Find customer license
npm run license:list | grep "customer@email.com"

# Verify license status
npm run license:verify [LICENSE_KEY]

# Check expiry dates
npm run license:list | grep "Expires:"
```

### License Modifications

#### Extend License
```bash
# Extend specific license
npm run license:extend [LICENSE_ID] [NEW_EXPIRY_DATE]

# Example: Extend for 1 year
npm run license:extend abc123 2025-03-12
```

#### Revoke License
```bash
# Revoke license (with reason)
npm run license:revoke [LICENSE_ID]

# Common revocation reasons:
# - Payment issue
# - License violation
# - Customer request
# - Security breach
```

### Batch Operations

#### Bulk License Generation
```bash
# Generate multiple licenses
npm run license:batch

# Prompts for:
# - Number of licenses (1-1000)
# - License type and features
# - Customer prefix
# - Expiry settings
```

#### License Renewal Campaign
```bash
# List expiring licenses (next 30 days)
npm run license:list | grep "30 days"

# Generate renewal licenses
npm run license:generate
# (Use same machine ID, extend expiry)
```

---

## Security Best Practices

### Private Key Security

#### Storage Requirements
- **Primary Location**: Encrypted storage on secure workstation
- **Backup Location**: Offline encrypted backup (separate location)
- **Access Control**: Multi-factor authentication required
- **Audit Trail**: Log all key access attempts

#### Key Rotation Schedule
- **Annual Rotation**: Generate new key pair yearly
- **Emergency Rotation**: Immediate rotation if compromise suspected
- **Transition Period**: 30-day overlap for license verification
- **Customer Notification**: Advance notice of key rotation

### Operational Security

#### Workstation Security
- **Dedicated Machine**: Use separate computer for license operations
- **Network Isolation**: Air-gapped or restricted network access
- **Antivirus Protection**: Real-time scanning enabled
- **System Updates**: Regular security patches applied

#### Access Controls
- **Role-Based Access**: Limit license generation to authorized personnel
- **Session Management**: Automatic logout after inactivity
- **Activity Logging**: Record all license operations
- **Regular Audits**: Review access logs monthly

### License Distribution Security

#### Secure Channels
- **Encrypted Email**: Use PGP/GPG encryption
- **Secure Portal**: Customer-specific login portals
- **Phone Verification**: Verbal confirmation of license details
- **Multi-Factor Delivery**: Combine multiple delivery methods

#### Customer Verification
- **Identity Confirmation**: Verify customer identity before license delivery
- **Purchase Validation**: Confirm payment and purchase order
- **Contact Verification**: Use established communication channels
- **Documentation**: Record all verification steps

---

## Troubleshooting

### Common Issues

#### License Generation Failures

**Issue**: "RSA keys not found"
```bash
# Solution: Generate key pair
npm run license:keys
```

**Issue**: "Invalid machine ID format"
```bash
# Solution: Verify machine ID format (LND-XXXXXXXX)
node scripts/format-machine-id.cjs [RAW_MACHINE_ID]
```

**Issue**: "Database connection failed"
```bash
# Solution: Reinitialize database
rm license-generator.db
npm run license:generate
```

#### License Activation Failures

**Issue**: "License key verification failed"
- **Cause**: Corrupted license key during transmission
- **Solution**: Regenerate and resend license key
- **Prevention**: Use checksums for license key validation

**Issue**: "Machine ID mismatch"
- **Cause**: License activated on wrong machine
- **Solution**: Generate new license for correct machine ID
- **Prevention**: Double-check machine ID before generation

**Issue**: "License expired"
- **Cause**: System clock incorrect or license actually expired
- **Solution**: Verify system time, extend license if needed
- **Prevention**: Set up expiry notifications

#### Application Integration Issues

**Issue**: "Public key mismatch"
- **Cause**: Application has old public key
- **Solution**: Update application with current public key
- **Prevention**: Version control for public key updates

**Issue**: "Feature not available"
- **Cause**: Feature not included in license
- **Solution**: Upgrade license or generate new license with feature
- **Prevention**: Verify feature requirements before generation

### Diagnostic Tools

#### License Verification
```bash
# Comprehensive license check
npm run license:verify [LICENSE_KEY]

# Check license in database
npm run license:list | grep [LICENSE_ID]

# Verify signature manually
node -e "console.log(JSON.parse(Buffer.from('[LICENSE_KEY]', 'base64').toString()))"
```

#### System Health Check
```bash
# Test key pair
npm run license:keys --test

# Database integrity check
npm run license:list > /dev/null && echo "Database OK"

# Generate test license
npm run license:generate --test
```

---

## Emergency Procedures

### Private Key Compromise

#### Immediate Actions (Within 1 Hour)
1. **Isolate Compromised System**
   - Disconnect from network
   - Preserve evidence for investigation
   - Document timeline of events

2. **Generate New Key Pair**
   ```bash
   # Backup old keys
   mv keys keys-compromised-$(date +%Y%m%d)
   
   # Generate new keys
   npm run license:keys
   ```

3. **Update Application**
   - Embed new public key in application
   - Build and test new application version
   - Prepare emergency update for customers

#### Recovery Actions (Within 24 Hours)
4. **Revoke Affected Licenses**
   ```bash
   # Revoke all licenses signed with old key
   npm run license:list | grep "ACTIVE" | while read license; do
     npm run license:revoke $license "Security: Key compromise"
   done
   ```

5. **Customer Communication**
   - Notify all customers of security update
   - Provide new application version
   - Issue replacement licenses

6. **Investigation**
   - Determine cause of compromise
   - Implement additional security measures
   - Update security procedures

### License Abuse Detection

#### Monitoring Indicators
- Multiple activations of same license key
- Unusual geographic distribution of activations
- Rapid license generation requests
- Suspicious customer information patterns

#### Response Procedures
1. **Investigate Suspicious Activity**
   ```bash
   # Check license usage patterns
   npm run license:list | grep [SUSPICIOUS_PATTERN]
   
   # Verify customer information
   npm run license:verify [SUSPICIOUS_LICENSE]
   ```

2. **Temporary Measures**
   ```bash
   # Revoke suspicious licenses
   npm run license:revoke [LICENSE_ID] "Investigation: Suspicious activity"
   ```

3. **Customer Contact**
   - Contact legitimate customers
   - Verify license usage
   - Issue replacement licenses if needed

### Database Corruption

#### Backup and Recovery
```bash
# Create database backup
cp license-generator.db license-generator-backup-$(date +%Y%m%d).db

# Restore from backup
cp license-generator-backup-[DATE].db license-generator.db

# Verify database integrity
npm run license:list > /dev/null && echo "Database restored successfully"
```

#### Data Recovery
```bash
# Export license data
npm run license:list > licenses-export-$(date +%Y%m%d).txt

# Rebuild database from export
# (Manual process - contact technical support)
```

---

## Appendices

### Appendix A: Command Reference

#### Key Management
```bash
npm run license:keys          # Generate RSA key pair
```

#### License Operations
```bash
npm run license:generate      # Interactive license generation
npm run license:verify [key]  # Verify license key
npm run license:list          # List all licenses
npm run license:revoke [id]   # Revoke license
npm run license:extend [id]   # Extend license
npm run license:batch         # Batch generation
```

#### Testing
```bash
npm test                      # Run test suite
npm run dev                   # Development mode
npm run build                 # Build for production
```

### Appendix B: File Locations

#### Key Files
- `keys/rsa-private.pem` - Private signing key (SECURE)
- `keys/rsa-public.pem` - Public verification key
- `license-generator.db` - License database
- `package.json` - Tool configuration

#### Generated Files
- `batch-licenses-[timestamp].json` - Batch export
- `license-export-[date].txt` - License list export
- `license-generator-backup-[date].db` - Database backup

### Appendix C: Support Contacts

#### Internal Support
- **License Administrator**: [CONTACT_INFO]
- **Security Officer**: [CONTACT_INFO]
- **Technical Support**: [CONTACT_INFO]

#### Emergency Contacts
- **Security Incident**: [24/7_CONTACT]
- **Key Compromise**: [EMERGENCY_CONTACT]
- **System Administrator**: [CONTACT_INFO]

---

**© 2026 LaundryPro Team - Internal Use Only**

**⚠️ SECURITY NOTICE**: This document contains sensitive information about the license generation system. Distribute only to authorized personnel with appropriate security clearance.