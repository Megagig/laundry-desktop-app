# Production License Architecture 🏗️

## Separation of Concerns

### 🔐 License Generator (VENDOR ONLY)
**Location**: Separate, secure system
**Purpose**: Generate and sign licenses
**Contains**: 
- RSA private key (CRITICAL)
- License generation tools
- Customer database
- Signing algorithms

**Security Requirements**:
- Air-gapped or highly secured network
- Multi-factor authentication
- Encrypted storage
- Access logging
- Regular security audits

### 📱 Customer Application (DISTRIBUTED)
**Location**: Customer systems
**Purpose**: Verify and use licenses
**Contains**:
- RSA public key (embedded)
- License verification logic
- Application features
- User interface

**Security Features**:
- Public key verification only
- No license generation capability
- Tamper detection
- Audit logging

## Production Deployment Strategy

### Phase 1: Separate License Generator

```bash
# Create separate license generator repository
git clone current-repo license-generator-secure
cd license-generator-secure

# Keep only license generator
rm -rf electron/ renderer/ scripts/ docs/
mv license-generator/* .
rm -rf license-generator/

# Secure the repository
git remote remove origin  # Disconnect from main repo
# Set up secure, private repository
```

### Phase 2: Clean Customer Application

```bash
# In main application repository
rm -rf license-generator/
rm scripts/generate-license.cjs
rm scripts/activate-license.cjs

# Keep only verification components:
# - electron/services/crypto.service.ts (verification only)
# - electron/config/public-key.ts
# - renderer/src/pages/Activation.tsx
```

### Phase 3: Secure Key Management

```bash
# On secure license generation system
cd license-generator-secure
npm install
npm run license:keys  # Generate production keys

# Extract public key for application
cat keys/rsa-public.pem
```

## File Structure After Separation

### License Generator System (Secure)
```
license-generator-secure/
├── src/
│   ├── services/
│   │   ├── crypto.service.ts      # Full crypto + signing
│   │   ├── database.service.ts    # License storage
│   │   └── cli.service.ts         # Interactive tools
│   ├── index.ts                   # CLI application
│   └── test.ts                    # Test suite
├── keys/                          # RSA keys (SECURE!)
│   ├── rsa-private.pem           # NEVER DISTRIBUTE
│   └── rsa-public.pem            # Copy to application
├── license-generator.db          # License database
├── package.json
└── README.md
```

### Customer Application (Distributed)
```
laundry-desktop-app/
├── electron/
│   ├── services/
│   │   └── crypto.service.ts      # Verification ONLY
│   └── config/
│       └── public-key.ts          # Embedded public key
├── renderer/
│   └── src/
│       └── pages/
│           └── Activation.tsx     # License activation UI
├── package.json
└── README.md
```

## Production Workflow

### 1. License Generation (Secure System)
```bash
# On secure, isolated system
cd license-generator-secure
npm run license:generate

# Customer: John Smith
# Machine ID: LND-E01F56F7
# License Type: Professional
# Generated: eyJwYXlsb2FkIjoie1wicHJvZHVjdFwiOlwiTGF1bmRyeVByb1wiLFwidmVyc2lvblwiOlwiMS4wLjBcIi...
```

### 2. Secure License Delivery
```bash
# Encrypt license for delivery
gpg --encrypt --recipient customer@email.com license.txt

# Or use secure portal/phone delivery
```

### 3. Customer Activation (Customer System)
```bash
# Customer downloads and installs application
# Application contains ONLY public key
# Customer enters license key in activation page
# Application verifies signature using embedded public key
```

## Security Boundaries

### What's in Customer Application ✅
- **Public Key**: For signature verification
- **Verification Logic**: Check license validity
- **Activation UI**: Enter license key
- **Feature Gates**: Enable/disable features based on license

### What's NOT in Customer Application ❌
- **Private Key**: Never, ever, under any circumstances
- **License Generation**: No ability to create licenses
- **Signing Logic**: No RSA signing capabilities
- **Customer Database**: No access to other customers' data

## Key Management in Production

### Public Key Embedding
```typescript
// electron/config/public-key.ts
export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjrMrzCU+FUVaEmfCXtXe
luaVozH3R8sOeCrJtNEbdBEclrOZMmAyNdwKgXD7qdkEBRhh9zsmUOBGdvMyetkt
vJLO1l9WdxA4O35GijChaEPiBcFyh/r+zbjc54lwdNTnQbInrbzhJ7MWa70F9pqA
W2k1P0kPVP8HDDYSNh1QYJHZuGoFgGHqNeeA1veOHv7iOwooS5mKeiBMSfUFXBnn
mQylNGlIXbbPvQU2AeHFXg0Tq5Xh1ww6THm1EwmTQ/baMLBPYQhz/SFPkRKavZNI
Ne+mc+yrb/RfcTm9Vp666wrt1xMc3x+EY82U0zjo6z8atz5oiDrIBpWyrYJfhOsE
2QIDAQAB
-----END PUBLIC KEY-----`
```

### Crypto Service (Verification Only)
```typescript
// electron/services/crypto.service.ts
export class CryptoService {
  // Only verification methods, NO signing methods
  async verifyLicenseKey(licenseKey: string): Promise<{valid: boolean, payload?: any}> {
    // Verification logic only
  }
  
  // REMOVED: createLicenseKey() - No signing in customer app
  // REMOVED: generateKeyPair() - No key generation in customer app
}
```

## Deployment Checklist

### Before Production Release
- [ ] **License generator completely removed from customer application**
- [ ] **Private key never committed to customer repository**
- [ ] **Public key embedded in application code**
- [ ] **License verification working in customer application**
- [ ] **No signing capabilities in customer application**
- [ ] **Secure license generator system set up separately**
- [ ] **Production RSA keys generated on secure system**
- [ ] **License generation workflow tested end-to-end**

### Security Verification
- [ ] **Code review confirms no private key in customer app**
- [ ] **Binary analysis shows no signing capabilities**
- [ ] **License verification works with production public key**
- [ ] **Tamper detection working**
- [ ] **No debug/development license generation code**

## Emergency Procedures

### If Private Key Accidentally Included
1. **IMMEDIATE**: Stop all distribution
2. **Generate new RSA key pair** on secure system
3. **Update application** with new public key
4. **Revoke all existing licenses** (they're compromised)
5. **Re-issue licenses** with new key pair
6. **Audit code** to prevent future incidents

### If License Generator Exposed
1. **Assess exposure scope** (who had access?)
2. **Generate new key pair** immediately
3. **Invalidate all licenses** signed with old key
4. **Customer communication** about security update
5. **Legal review** of potential damages
6. **Implement additional security** measures

## Best Practices Summary

### ✅ DO
- Keep license generator on separate, secure system
- Use air-gapped or highly secured network
- Embed only public key in customer application
- Implement strong access controls
- Regular security audits
- Encrypted backups of private key

### ❌ DON'T
- Include license generator in customer application
- Commit private key to any repository
- Allow network access from customer app to license generator
- Store private key on customer systems
- Include signing logic in distributed application
- Use same system for development and production keys

---

**🔒 REMEMBER: The security of your entire licensing system depends on keeping the private key and license generator completely separate from the customer application!**