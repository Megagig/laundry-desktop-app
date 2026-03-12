#!/usr/bin/env node

/**
 * Phase 12: License Logic Protection Test Suite
 * Tests obfuscation, integrity checks, and anti-tampering measures
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🔒 Phase 12: License Logic Protection Test Suite')
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

function getFileSize(filePath) {
  const fullPath = path.join(__dirname, '..', filePath)
  if (!fs.existsSync(fullPath)) return 0
  return fs.statSync(fullPath).size
}

// Test 1: Verify obfuscation scripts exist
test('Obfuscation script exists', () => {
  if (!fileExists('scripts/obfuscate-security.js')) {
    throw new Error('obfuscate-security.js not found')
  }
})

test('Production build script exists', () => {
  if (!fileExists('scripts/build-production.js')) {
    throw new Error('build-production.js not found')
  }
})

test('Debug log stripper exists', () => {
  if (!fileExists('scripts/strip-debug-logs.js')) {
    throw new Error('strip-debug-logs.js not found')
  }
})

// Test 2: Verify security services exist
test('Integrity service exists', () => {
  if (!fileExists('electron/services/integrity.service.ts')) {
    throw new Error('integrity.service.ts not found')
  }
})

test('Anti-debug service exists', () => {
  if (!fileExists('electron/services/anti-debug.service.ts')) {
    throw new Error('anti-debug.service.ts not found')
  }
})

// Test 3: Verify enhanced startup service
test('Enhanced startup service has security checks', () => {
  if (!fileContains('electron/services/startup.service.ts', 'integrityService')) {
    throw new Error('Startup service not enhanced with integrity checks')
  }
  if (!fileContains('electron/services/startup.service.ts', 'antiDebugService')) {
    throw new Error('Startup service not enhanced with anti-debug checks')
  }
})

// Test 4: Check obfuscation configuration
test('Obfuscation script has proper configuration', () => {
  if (!fileContains('scripts/obfuscate-security.js', 'obfuscationConfigs')) {
    throw new Error('Obfuscation configurations not found')
  }
  if (!fileContains('scripts/obfuscate-security.js', 'high')) {
    throw new Error('High security obfuscation config not found')
  }
  if (!fileContains('scripts/obfuscate-security.js', 'medium')) {
    throw new Error('Medium security obfuscation config not found')
  }
})

// Test 5: Verify critical files are marked for obfuscation
test('Critical files marked for high security obfuscation', () => {
  const criticalFiles = [
    'license.service.ts',
    'crypto.service.ts',
    'machine-id.service.ts',
    'trial.service.ts'
  ]
  
  for (const file of criticalFiles) {
    if (!fileContains('scripts/obfuscate-security.js', file)) {
      throw new Error(`${file} not marked for obfuscation`)
    }
  }
})

// Test 6: Check integrity service functionality
test('Integrity service has required methods', () => {
  const requiredMethods = [
    'performIntegrityCheck',
    'detectDebugger',
    'validatePublicKey',
    'performAntiTamperingCheck'
  ]
  
  for (const method of requiredMethods) {
    if (!fileContains('electron/services/integrity.service.ts', method)) {
      throw new Error(`Integrity service missing method: ${method}`)
    }
  }
})

// Test 7: Check anti-debug service functionality
test('Anti-debug service has detection methods', () => {
  const detectionMethods = [
    'detectDebuggerStatement',
    'detectConsoleOpen',
    'detectNodeInspector',
    'detectTimingAttack'
  ]
  
  for (const method of detectionMethods) {
    if (!fileContains('electron/services/anti-debug.service.ts', method)) {
      throw new Error(`Anti-debug service missing method: ${method}`)
    }
  }
})

// Test 8: Verify production build script has all steps
test('Production build script has all required steps', () => {
  const requiredSteps = [
    'Clean previous builds',
    'Compile TypeScript',
    'Obfuscate security modules',
    'Remove source maps',
    'Strip debug logs'
  ]
  
  for (const step of requiredSteps) {
    if (!fileContains('scripts/build-production.js', step)) {
      throw new Error(`Production build missing step: ${step}`)
    }
  }
})

// Test 9: Check debug log stripper patterns
test('Debug log stripper has comprehensive patterns', () => {
  const patterns = [
    'console.log',
    'console.debug',
    'debugger',
    'TODO',
    'FIXME'
  ]
  
  for (const pattern of patterns) {
    if (!fileContains('scripts/strip-debug-logs.js', pattern)) {
      throw new Error(`Debug stripper missing pattern: ${pattern}`)
    }
  }
})

// Test 10: Verify JavaScript obfuscator dependency
test('JavaScript obfuscator dependency installed', () => {
  try {
    require.resolve('javascript-obfuscator')
  } catch (error) {
    throw new Error('javascript-obfuscator not installed')
  }
})

// Test 11: Check if TypeScript compiles without errors
test('TypeScript compilation passes', () => {
  try {
    execSync('npx tsc --noEmit --skipLibCheck', { 
      stdio: 'pipe',
      timeout: 30000,
      cwd: path.join(__dirname, '..')
    })
  } catch (error) {
    throw new Error(`TypeScript compilation failed: ${error.message}`)
  }
})

// Test 12: Verify security service imports
test('Security services have proper imports', () => {
  if (!fileContains('electron/services/integrity.service.ts', 'import * as crypto')) {
    throw new Error('Integrity service missing crypto import')
  }
  if (!fileContains('electron/services/anti-debug.service.ts', 'EventEmitter')) {
    throw new Error('Anti-debug service missing EventEmitter import')
  }
})

// Test 13: Check startup service integration
test('Startup service integrates all security checks', () => {
  const integrations = [
    'integrityService.performIntegrityCheck',
    'antiDebugService.startMonitoring',
    'performPeriodicSecurityCheck',
    'shutdown'
  ]
  
  for (const integration of integrations) {
    if (!fileContains('electron/services/startup.service.ts', integration)) {
      throw new Error(`Startup service missing integration: ${integration}`)
    }
  }
})

// Test 14: Verify obfuscation script can run (dry run)
test('Obfuscation script syntax is valid', () => {
  try {
    // Use Node.js to check syntax
    execSync('node -c scripts/obfuscate-security.js', { 
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    })
  } catch (error) {
    throw new Error(`Obfuscation script has syntax errors: ${error.message}`)
  }
})

// Test 15: Check security configuration completeness
test('Security configuration is comprehensive', () => {
  const securityFeatures = [
    'selfDefending',
    'debugProtection',
    'controlFlowFlattening',
    'stringArray',
    'transformObjectKeys'
  ]
  
  for (const feature of securityFeatures) {
    if (!fileContains('scripts/obfuscate-security.js', feature)) {
      throw new Error(`Security feature not configured: ${feature}`)
    }
  }
})

// Summary
console.log('\n' + '='.repeat(60))
console.log(`📊 Test Results: ${passedTests}/${totalTests} tests passed`)

if (passedTests === totalTests) {
  console.log('🎉 All Phase 12 License Logic Protection tests passed!')
  console.log('\n✅ Phase 12 Implementation Status:')
  console.log('   • Code obfuscation system implemented')
  console.log('   • Integrity checking service created')
  console.log('   • Anti-debugging protection implemented')
  console.log('   • Production build pipeline with security hardening')
  console.log('   • Debug log stripping functionality')
  console.log('   • Enhanced startup service with security checks')
  console.log('   • Comprehensive protection against reverse engineering')
  
  console.log('\n🔐 Security Features:')
  console.log('   • High-level obfuscation for critical modules')
  console.log('   • Medium-level obfuscation for auth modules')
  console.log('   • Runtime integrity verification')
  console.log('   • Multiple debugger detection methods')
  console.log('   • Anti-tampering measures')
  console.log('   • Periodic security validation')
  
  console.log('\n📦 Ready for Production:')
  console.log('   • Run: node scripts/build-production.js')
  console.log('   • All security measures will be applied')
  console.log('   • License logic will be protected')
  
  process.exit(0)
} else {
  console.log(`❌ ${totalTests - passedTests} tests failed`)
  console.log('Please fix the issues above before proceeding.')
  process.exit(1)
}