# LaundryPro Security System - Usage Guide

**Version:** 1.0.0  
**Last Updated:** March 12, 2026  
**Status:** Production Ready 🚀

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [License Management](#license-management)
4. [User Management](#user-management)
5. [Role-Based Access Control](#role-based-access-control)
6. [Trial Mode](#trial-mode)
7. [Security Features](#security-features)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## 🔐 Overview

LaundryPro now includes enterprise-grade security with:

- **License-Based Access Control**: Software requires valid license activation
- **User Authentication**: Secure login with bcrypt password hashing
- **Role-Based Permissions**: 4 roles with granular access control
- **Trial Mode**: 14-day evaluation period
- **Audit Logging**: Complete activity tracking
- **Session Management**: Secure token-based sessions
- **Anti-Tampering**: Code obfuscation and integrity checks

---

## 🚀 Getting Started

### First-Time Setup

1. **Launch Application**
   - Application performs automatic security checks
   - Shows professional loading screen during validation

2. **License Activation** (Choose One)
   - **Option A**: Enter valid license key from vendor
   - **Option B**: Start 14-day trial period

3. **Admin User Login**
   - Username: `admin`
   - Password: `admin123`
   - **⚠️ IMPORTANT**: Change default password immediately

4. **Initial Configuration**
   - Change admin password
   - Create additional users
   - Configure security settings

### Application Startup Flow

```
Application Launch
       ↓
Security Validation
├─ System Integrity Check ✓
├─ License/Trial Validation ✓
├─ Anti-Debug Protection ✓
└─ Database Verification ✓
       ↓
User Authentication
├─ Login Screen
├─ Session Validation
└─ Permission Loading
       ↓
Dashboard Access
```

---

## 📄 License Management

### License Activation

1. **Get Machine ID**
   - Go to Settings → License Information
   - Copy the Machine ID (format: `LND-XXXXXXXX`)
   - Provide to vendor for license generation

2. **Activate License**
   - Navigate to Activation screen
   - Enter license key provided by vendor
   - Click "Activate License"
   - System validates signature and machine binding

3. **License Information**
   - View license details in Settings
   - Check expiry date and features
   - Monitor days remaining

### License Types

| Type | Duration | Features | Max Users | Use Case |
|------|----------|----------|-----------|----------|
| **TRIAL** | 14 days | All features | 1 user | Evaluation |
| **STANDARD** | 1 year | Core features | 1-5 users | Small business |
| **PROFESSIONAL** | 1 year | Advanced features | 5-25 users | Medium business |
| **ENTERPRISE** | 1 year | All features | Unlimited | Large business |

### License Features

- **Core Features**: Customer management, orders, payments, services
- **Advanced Features**: Reports, analytics, expense tracking
- **Enterprise Features**: User management, audit logs, advanced security

---

## 👥 User Management

### Default Users

**Admin User** (Created automatically)
- Username: `admin`
- Password: `admin123` (⚠️ Change immediately)
- Role: Administrator
- Permissions: Full access

### Creating New Users

1. **Access User Management** (Admin only)
   - Navigate to Users section
   - Click "Add New User"

2. **User Information**
   - Full Name: User's display name
   - Username: Login identifier (unique)
   - Email: Contact email
   - Password: Secure password (8+ characters)
   - Role: Select appropriate role

3. **User Activation**
   - Users are active by default
   - Can be deactivated without deletion
   - Deactivated users cannot login

### Password Management

**Password Requirements:**
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character

**Password Changes:**
- Users can change own password
- Admins can reset any user password
- Password history prevents reuse

---

## 🔑 Role-Based Access Control

### Available Roles

#### 1. ADMIN (Administrator)
**Full system access including:**
- All business operations
- User and role management
- System settings and configuration
- Audit logs and security features
- License management
- Backup and restore operations

#### 2. MANAGER (Operations Manager)
**Business operations management:**
- Dashboard and reports access
- Customer and order management
- Payment processing and refunds
- Expense tracking
- Service management
- Print operations
- Audit log viewing
- Backup operations

#### 3. CASHIER (Front Desk Operations)
**Customer-facing operations:**
- Dashboard access
- Customer management (create/edit/view)
- Order management (create/view/update status)
- Payment processing
- Service viewing
- Print receipts
- Outstanding payments view

#### 4. ATTENDANT (Basic Operations)
**Limited operational access:**
- Dashboard viewing
- Customer viewing (read-only)
- Order viewing and status updates
- Service viewing
- Receipt printing

### Permission System

**42 Granular Permissions** across 13 modules:
- Dashboard, Customers, Orders, Services
- Payments, Expenses, Reports, Users
- Roles, Settings, Backup, Audit, Printing

**Permission Examples:**
- `view_customer` - View customer information
- `create_order` - Create new orders
- `process_payment` - Process payments
- `manage_users` - User management access
- `view_audit_logs` - Audit log access

---

## ⏱️ Trial Mode

### Trial Period
- **Duration**: 14 days from first launch
- **Features**: All features enabled
- **Users**: 1 user (admin)
- **Machine Binding**: Tied to specific machine

### Trial Status
- View remaining days in Settings
- Warning notifications at 7, 3, and 1 days remaining
- Application blocks access after expiry

### Trial to License Conversion
1. Contact vendor with Machine ID
2. Purchase appropriate license
3. Enter license key in Activation screen
4. Trial converts to full license seamlessly

---

## 🛡️ Security Features

### Authentication Security
- **bcrypt Password Hashing**: 12 rounds for maximum security
- **Session Management**: 24-hour sessions (30 days with "Remember Me")
- **Failed Login Protection**: Account lockout after 5 failed attempts
- **Session Expiry**: Automatic logout with warning countdown

### License Security
- **RSA-2048 Signatures**: Cryptographically signed licenses
- **Machine Binding**: Hardware-locked to prevent sharing
- **Integrity Checks**: Tamper detection and validation
- **Anti-Debugging**: Real-time debugging attempt detection

### System Security
- **Code Obfuscation**: Critical security code protected
- **Integrity Monitoring**: File hash verification
- **Audit Logging**: Complete activity tracking
- **Periodic Validation**: 24-hour security checks

### Data Protection
- **Encrypted Passwords**: bcrypt with salt
- **Secure Sessions**: Cryptographically secure tokens
- **Input Validation**: SQL injection protection
- **Rate Limiting**: Brute force attack prevention

---

## 🔍 Audit Logging

### Logged Activities
- User login/logout events
- User creation/modification/deletion
- Role and permission changes
- Order creation/modification/cancellation
- Payment processing/refunds
- Customer data changes
- Service price modifications
- Settings changes
- Backup operations
- License activation/deactivation
- Failed login attempts
- Permission denied attempts

### Audit Log Access
1. **Navigate to Audit Logs** (Admin/Manager only)
2. **Filter Options**:
   - User: Filter by specific user
   - Module: Filter by system module
   - Action: Filter by action type
   - Date Range: Custom date filtering
3. **Export**: CSV export for compliance

### Audit Log Information
- **Timestamp**: Exact date and time
- **User**: Who performed the action
- **Action**: What was done
- **Module**: Which part of system
- **Description**: Detailed description
- **IP Address**: User's IP (if available)
- **Metadata**: Additional context data

---

## 🚨 Troubleshooting

### Common Issues

#### 1. License Activation Failed
**Symptoms**: "Invalid license signature" error
**Solutions**:
- Verify license key is copied correctly
- Check Machine ID matches license
- Ensure license hasn't expired
- Contact vendor for new license

#### 2. Login Issues
**Symptoms**: Cannot login with correct credentials
**Solutions**:
- Check if account is locked (wait 15 minutes)
- Verify username/password spelling
- Try "Forgot Password" if available
- Contact admin for password reset

#### 3. Permission Denied
**Symptoms**: "Access Denied" messages
**Solutions**:
- Check user role and permissions
- Contact admin to update permissions
- Verify session hasn't expired
- Re-login to refresh permissions

#### 4. Trial Expired
**Symptoms**: Application won't start after 14 days
**Solutions**:
- Purchase license from vendor
- Provide Machine ID for license generation
- Enter license key in activation screen

#### 5. Security Check Failed
**Symptoms**: "Security integrity check failed"
**Solutions**:
- Reinstall application from trusted source
- Check antivirus isn't blocking files
- Verify system hasn't been compromised
- Contact support for assistance

### Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "License activation required" | No valid license | Activate license or start trial |
| "Trial period expired" | 14-day trial ended | Purchase and activate license |
| "Invalid session" | Session expired | Login again |
| "Access denied" | Insufficient permissions | Contact admin for access |
| "Account locked" | Too many failed logins | Wait 15 minutes or contact admin |
| "Security check failed" | System integrity issue | Reinstall application |

---

## 📚 Best Practices

### Security Best Practices

#### For Administrators
1. **Change Default Password**: Immediately change admin password
2. **Strong Passwords**: Enforce strong password policy
3. **Regular Audits**: Review audit logs regularly
4. **User Management**: Remove inactive users promptly
5. **License Management**: Monitor license expiry dates
6. **Backup Security**: Secure backup files properly
7. **Update Management**: Keep application updated

#### For Users
1. **Secure Passwords**: Use strong, unique passwords
2. **Logout Properly**: Always logout when finished
3. **Report Issues**: Report suspicious activity
4. **Session Security**: Don't share login credentials
5. **Physical Security**: Lock workstation when away

### Operational Best Practices

#### Daily Operations
- Monitor trial/license expiry warnings
- Review failed login attempts
- Check system security status
- Backup critical data regularly

#### Weekly Operations
- Review user access and permissions
- Check audit logs for anomalies
- Verify license status
- Update user passwords if needed

#### Monthly Operations
- Full security audit review
- User access review and cleanup
- License renewal planning
- Security training for staff

### Compliance Considerations

#### Data Protection
- Audit logs provide compliance trail
- User activity tracking for accountability
- Secure password storage (bcrypt)
- Session management for data security

#### Access Control
- Role-based access for segregation of duties
- Permission-based feature access
- User authentication for accountability
- Session expiry for security

---

## 📞 Support and Contact

### Technical Support
- **License Issues**: Contact vendor immediately
- **Security Concerns**: Escalate to security team
- **User Management**: Admin user assistance
- **General Support**: Standard support channels

### Emergency Procedures
- **Security Breach**: Immediately change all passwords
- **License Compromise**: Contact vendor for new license
- **System Compromise**: Reinstall from trusted source
- **Data Loss**: Restore from secure backup

---

## 📈 System Requirements

### Minimum Requirements
- **Operating System**: Windows 10/11, macOS 10.15+, Linux
- **Memory**: 4GB RAM minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for license activation

### Security Requirements
- **Antivirus**: Compatible antivirus software
- **Firewall**: Standard firewall configuration
- **Updates**: Regular OS security updates
- **Physical Security**: Secure workstation environment

---

## 🎯 Quick Reference

### Default Credentials
- **Username**: `admin`
- **Password**: `admin123`
- **⚠️ Change immediately after first login**

### Key Shortcuts
- **Ctrl+L**: Quick logout
- **Ctrl+Shift+A**: Audit logs (if permitted)
- **Ctrl+Shift+U**: User management (if permitted)
- **Ctrl+Shift+S**: Settings

### Important URLs
- **Activation**: `/activation`
- **Login**: `/login`
- **Dashboard**: `/dashboard`
- **Users**: `/users` (Admin only)
- **Audit Logs**: `/audit-logs` (Admin/Manager)

---

**🔐 Security is everyone's responsibility. Follow best practices and report any security concerns immediately.**

---

*This guide covers the essential security features of LaundryPro. For additional technical details, refer to the complete security documentation.*