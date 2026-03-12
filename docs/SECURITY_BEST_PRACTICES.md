# Electron Security Best Practices

## Overview

This document outlines the security measures implemented in the Laundry Desktop Management System and provides guidelines for maintaining security.

## Implemented Security Measures

### 1. Main Process Security

#### ✅ Context Isolation
- **Setting**: `contextIsolation: true`
- **Purpose**: Isolates the main world context from the isolated world context
- **Benefit**: Prevents renderer process from accessing Node.js APIs directly

#### ✅ Node Integration Disabled
- **Setting**: `nodeIntegration: false`
- **Purpose**: Prevents renderer process from having direct access to Node.js APIs
- **Benefit**: Reduces attack surface significantly

#### ✅ Web Security Enabled
- **Setting**: `webSecurity: true`
- **Purpose**: Enables standard web security features
- **Benefit**: Prevents loading of insecure content

#### ✅ Remote Module Disabled
- **Setting**: `enableRemoteModule: false`
- **Purpose**: Disables the remote module
- **Benefit**: Prevents renderer from accessing main process modules

#### ⚠️ Sandbox Mode
- **Setting**: `sandbox: false` (currently disabled)
- **Status**: Disabled for compatibility
- **Recommendation**: Enable in production after thorough testing

### 2. Content Security Policy (CSP)

#### ✅ Implemented CSP Headers
```javascript
'Content-Security-Policy': [
  "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob:; " +
  "font-src 'self' data:; " +
  "connect-src 'self' ws://localhost:* http://localhost:*; " +
  "media-src 'none'; " +
  "object-src 'none'; " +
  "frame-src 'none';"
]
```

**Benefits**:
- Prevents XSS attacks
- Controls resource loading
- Blocks unauthorized external connections

### 3. Navigation Protection

#### ✅ Navigation Blocking
- Blocks unauthorized navigation attempts
- Allows only localhost in development
- Logs all blocked attempts

#### ✅ New Window Prevention
- Blocks all attempts to open new windows
- Prevents popup attacks
- Logs blocked attempts

### 4. IPC Security

#### ✅ IPC Validation Middleware
- **Input Sanitization**: Removes dangerous characters and validates data types
- **Rate Limiting**: 100 requests per minute per client
- **Type Validation**: Ensures proper data types for all inputs
- **Session Validation**: Validates session tokens for authenticated endpoints

#### ✅ Secure IPC Pattern
- Uses `ipcRenderer.invoke()` for secure communication
- All sensitive operations require session tokens
- Proper error handling and logging

### 5. Authentication Security

#### ✅ Password Hashing
- **Algorithm**: bcrypt with 12 rounds
- **Salt**: Automatically generated per password
- **Storage**: Only hashed passwords stored in database

#### ✅ Session Management
- **Tokens**: Cryptographically secure random tokens
- **Expiration**: 24 hours default, 30 days with "Remember Me"
- **Validation**: Server-side session validation for all requests

#### ✅ Failed Login Protection
- **Limit**: 5 failed attempts
- **Lockout**: 15 minutes
- **Tracking**: Per-user attempt tracking

### 6. Database Security

#### ✅ SQL Injection Prevention
- **ORM**: Using Prisma ORM with parameterized queries
- **Validation**: Input validation before database operations
- **Sanitization**: Data sanitization in middleware

#### ✅ Access Control
- **RBAC**: Role-based access control with 42 permissions
- **Session-based**: All database operations require valid sessions
- **Audit Logging**: All sensitive operations logged

## Security Monitoring

### Logging
- All IPC calls are logged with sender information
- Failed authentication attempts are logged
- Navigation and window opening attempts are logged
- Rate limiting violations are logged

### Audit Script
Run the security audit script to check current security status:
```bash
node scripts/security-audit.cjs
```

## Development Guidelines

### 1. IPC Handler Security
When creating new IPC handlers:

```typescript
// ✅ Good - Validate session and sanitize input
ipcMain.handle('my-handler', async (event, sessionToken: string, data: any) => {
  const session = await authService.validateSession(sessionToken)
  if (!session) {
    return { success: false, error: 'Invalid session' }
  }
  
  // Validate permissions
  const hasPermission = await rbacService.hasPermission(session.userId, 'required_permission')
  if (!hasPermission) {
    return { success: false, error: 'Insufficient permissions' }
  }
  
  // Process sanitized data (middleware handles this)
  // ...
})

// ❌ Bad - No validation
ipcMain.handle('bad-handler', async (event, data: any) => {
  // Direct database access without validation
  return await prisma.user.findMany()
})
```

### 2. Frontend Security
When making IPC calls:

```typescript
// ✅ Good - Always include session token
const result = await window.api.user.getAll(sessionToken)

// ❌ Bad - No authentication
const result = await window.api.user.getAll()
```

### 3. Data Validation
Always validate data on both frontend and backend:

```typescript
// Frontend validation
if (!email || !email.includes('@')) {
  throw new Error('Invalid email')
}

// Backend validation (handled by middleware)
// Additional business logic validation in handlers
```

## Production Deployment

### 1. Environment Variables
- Store sensitive configuration in `.env` file
- Never commit `.env` to version control
- Use different `.env` files for different environments

### 2. Code Signing
- Sign the application with a valid certificate
- Use proper certificate chain
- Implement automatic updates with signature verification

### 3. Sandbox Mode
Consider enabling sandbox mode for production:
```typescript
webPreferences: {
  sandbox: true,
  // ... other settings
}
```

### 4. CSP Hardening
For production, consider stricter CSP:
```javascript
"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;"
```

## Incident Response

### 1. Security Breach Detection
- Monitor logs for suspicious activity
- Set up alerts for multiple failed login attempts
- Monitor IPC rate limiting violations

### 2. Response Procedures
1. Identify the scope of the breach
2. Revoke affected sessions
3. Update security measures
4. Notify users if necessary
5. Document the incident

## Regular Security Tasks

### Weekly
- Review security logs
- Run security audit script
- Check for dependency updates

### Monthly
- Review and update CSP policies
- Audit user permissions
- Review failed login attempts

### Quarterly
- Full security assessment
- Penetration testing
- Update security documentation

## Security Contacts

For security issues or questions:
- Create an issue in the project repository
- Mark as "security" label
- Include detailed description of the issue

## References

- [Electron Security Guidelines](https://www.electronjs.org/docs/tutorial/security)
- [OWASP Desktop App Security](https://owasp.org/www-project-desktop-app-security-top-10/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)