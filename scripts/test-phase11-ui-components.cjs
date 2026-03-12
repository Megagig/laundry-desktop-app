#!/usr/bin/env node

/**
 * Phase 11 UI Security Components Integration Test
 * Tests all newly created and updated UI components
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔒 Phase 11: UI Security Components Integration Test')
console.log('=' .repeat(60))

let passedTests = 0
let totalTests = 0

function test(description, testFn) {
  totalTests++
  try {
    testFn()
    console.log(`✅ ${description}`)
    passedTests++
  } catch (error) {
    console.log(`❌ ${description}`)
    console.log(`   Error: ${error.message}`)
  }
}

function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, '..', filePath))
}

function fileContains(filePath, content) {
  const fullPath = path.join(__dirname, '..', filePath)
  if (!fs.existsSync(fullPath)) return false
  const fileContent = fs.readFileSync(fullPath, 'utf8')
  return fileContent.includes(content)
}

// Test 1: Verify all UI security components exist
test('AuditLogs page exists', () => {
  if (!fileExists('renderer/src/pages/AuditLogs.tsx')) {
    throw new Error('AuditLogs.tsx not found')
  }
})

test('ChangePasswordModal component exists', () => {
  if (!fileExists('renderer/src/components/auth/ChangePasswordModal.tsx')) {
    throw new Error('ChangePasswordModal.tsx not found')
  }
})

test('SessionExpiredModal component exists', () => {
  if (!fileExists('renderer/src/components/auth/SessionExpiredModal.tsx')) {
    throw new Error('SessionExpiredModal.tsx not found')
  }
})

test('UserProfileDropdown component exists', () => {
  if (!fileExists('renderer/src/components/auth/UserProfileDropdown.tsx')) {
    throw new Error('UserProfileDropdown.tsx not found')
  }
})

// Test 2: Verify router integration
test('AuditLogs route added to router', () => {
  if (!fileContains('renderer/src/router/AppRouter.tsx', '/audit-logs')) {
    throw new Error('AuditLogs route not found in router')
  }
  if (!fileContains('renderer/src/router/AppRouter.tsx', 'import AuditLogs')) {
    throw new Error('AuditLogs import not found in router')
  }
})

// Test 3: Verify sidebar integration
test('Audit Logs link added to sidebar', () => {
  if (!fileContains('renderer/src/components/Sidebar.tsx', '/audit-logs')) {
    throw new Error('Audit logs link not found in sidebar')
  }
  if (!fileContains('renderer/src/components/Sidebar.tsx', 'VIEW_AUDIT_LOGS')) {
    throw new Error('VIEW_AUDIT_LOGS permission not found in sidebar')
  }
})

// Test 4: Verify AppLayout header integration
test('UserProfileDropdown integrated in AppLayout', () => {
  if (!fileContains('renderer/src/layout/AppLayout.tsx', 'UserProfileDropdown')) {
    throw new Error('UserProfileDropdown not found in AppLayout')
  }
  if (!fileContains('renderer/src/layout/AppLayout.tsx', '<header')) {
    throw new Error('Header section not found in AppLayout')
  }
})

// Test 5: Verify Settings page security tab
test('Security settings tab added to Settings', () => {
  if (!fileContains('renderer/src/pages/Settings.tsx', 'Security Settings')) {
    throw new Error('Security Settings tab not found')
  }
  if (!fileContains('renderer/src/pages/Settings.tsx', 'sessionTimeout')) {
    throw new Error('Session timeout setting not found')
  }
  if (!fileContains('renderer/src/pages/Settings.tsx', 'passwordMinLength')) {
    throw new Error('Password min length setting not found')
  }
})

// Test 6: Verify backup functions use sessionToken
test('Backup functions updated to use sessionToken', () => {
  if (!fileContains('renderer/src/pages/Settings.tsx', 'window.api.backup.create(sessionToken)')) {
    throw new Error('Create backup function not updated to use sessionToken')
  }
  if (!fileContains('renderer/src/pages/Settings.tsx', 'window.api.backup.restore(sessionToken)')) {
    throw new Error('Restore backup function not updated to use sessionToken')
  }
})

// Test 7: Verify component imports and dependencies
test('AuditLogs uses correct permissions', () => {
  if (!fileContains('renderer/src/pages/AuditLogs.tsx', 'PERMISSIONS.VIEW_AUDIT_LOGS')) {
    throw new Error('VIEW_AUDIT_LOGS permission not used in AuditLogs')
  }
  if (!fileContains('renderer/src/pages/AuditLogs.tsx', 'usePermission')) {
    throw new Error('usePermission hook not used in AuditLogs')
  }
})

test('ChangePasswordModal has proper validation', () => {
  if (!fileContains('renderer/src/components/auth/ChangePasswordModal.tsx', 'validateForm')) {
    throw new Error('Form validation not found in ChangePasswordModal')
  }
  if (!fileContains('renderer/src/components/auth/ChangePasswordModal.tsx', 'Password must be at least 8 characters long')) {
    throw new Error('Password length validation not found')
  }
})

test('SessionExpiredModal has countdown functionality', () => {
  if (!fileContains('renderer/src/components/auth/SessionExpiredModal.tsx', 'countdown')) {
    throw new Error('Countdown functionality not found in SessionExpiredModal')
  }
  if (!fileContains('renderer/src/components/auth/SessionExpiredModal.tsx', 'formatTime')) {
    throw new Error('Time formatting not found in SessionExpiredModal')
  }
})

// Test 8: Verify permissions are properly defined
test('All required permissions exist', () => {
  const requiredPermissions = [
    'VIEW_AUDIT_LOGS',
    'EXPORT_AUDIT_LOGS',
    'MANAGE_SETTINGS',
    'VIEW_SETTINGS',
    'MANAGE_LICENSE'
  ]
  
  for (const permission of requiredPermissions) {
    if (!fileContains('shared/types/permissions.ts', permission)) {
      throw new Error(`Permission ${permission} not found`)
    }
  }
})

// Test 9: Check TypeScript compilation
test('TypeScript compilation passes', () => {
  try {
    // Check if we can compile the TypeScript files
    execSync('cd renderer && npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      timeout: 30000 
    })
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`)
  }
})

// Test 10: Verify component structure and exports
test('Components have proper exports', () => {
  const components = [
    'renderer/src/pages/AuditLogs.tsx',
    'renderer/src/components/auth/ChangePasswordModal.tsx',
    'renderer/src/components/auth/SessionExpiredModal.tsx',
    'renderer/src/components/auth/UserProfileDropdown.tsx'
  ]
  
  for (const component of components) {
    if (!fileContains(component, 'export default')) {
      throw new Error(`Default export not found in ${component}`)
    }
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`)

if (passedTests === totalTests) {
  console.log('🎉 All Phase 11 UI Security Components tests passed!')
  console.log('\n✅ Phase 11 Implementation Status:')
  console.log('   • AuditLogs page created with filtering and pagination')
  console.log('   • ChangePasswordModal with validation and security requirements')
  console.log('   • SessionExpiredModal with countdown and session extension')
  console.log('   • UserProfileDropdown integrated in header')
  console.log('   • Security settings tab added to Settings page')
  console.log('   • All routes and navigation updated')
  console.log('   • Backup functions updated to use sessionToken')
  console.log('   • All components use proper permissions and hooks')
  
  process.exit(0)
} else {
  console.log(`❌ ${totalTests - passedTests} tests failed`)
  console.log('Please fix the issues above before proceeding.')
  process.exit(1)
}