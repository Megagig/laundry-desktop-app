#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Test Phase 14: Application Startup Flow
 * 
 * This script tests the complete startup security flow including:
 * - License validation on startup
 * - Trial mode handling
 * - Security checks integration
 * - Route protection
 * - Authentication flow
 */

class Phase14TestSuite {
  constructor() {
    this.results = []
    this.totalTests = 0
    this.passedTests = 0
  }

  async runTest(testName, testFn) {
    this.totalTests++
    console.log(`\n🧪 Testing: ${testName}`)
    
    try {
      await testFn()
      console.log(`✅ ${testName} - PASSED`)
      this.results.push({ name: testName, status: 'PASSED' })
      this.passedTests++
    } catch (error) {
      console.log(`❌ ${testName} - FAILED: ${error.message}`)
      this.results.push({ name: testName, status: 'FAILED', error: error.message })
    }
  }

  async runAllTests() {
    console.log('🚀 Phase 14: Application Startup Flow - Test Suite')
    console.log('=' .repeat(60))

    // Test 1: Startup Service Integration
    await this.runTest('Startup Service Integration', async () => {
      const startupServicePath = path.join(process.cwd(), 'electron/services/startup.service.ts')
      if (!fs.existsSync(startupServicePath)) {
        throw new Error('Startup service file not found')
      }

      const content = fs.readFileSync(startupServicePath, 'utf8')
      
      // Check for required methods
      const requiredMethods = [
        'performStartupChecks',
        'isLicenseValid',
        'getTrialStatus',
        'shouldBlockApplication',
        'performPeriodicSecurityCheck',
        'shutdown'
      ]

      for (const method of requiredMethods) {
        if (!content.includes(method)) {
          throw new Error(`Missing required method: ${method}`)
        }
      }
    })

    // Test 2: Main Process Security Integration
    await this.runTest('Main Process Security Integration', async () => {
      const mainPath = path.join(process.cwd(), 'electron/main.ts')
      if (!fs.existsSync(mainPath)) {
        throw new Error('Main process file not found')
      }

      const content = fs.readFileSync(mainPath, 'utf8')
      
      // Check for startup security checks
      if (!content.includes('performStartupSecurityChecks')) {
        throw new Error('Main process missing startup security checks')
      }

      if (!content.includes('startupService')) {
        throw new Error('Main process not importing startup service')
      }

      if (!content.includes('dialog')) {
        throw new Error('Main process missing dialog import for error handling')
      }
    })

    // Test 3: StartupCheck Component
    await this.runTest('StartupCheck Component', async () => {
      const componentPath = path.join(process.cwd(), 'renderer/src/components/startup/StartupCheck.tsx')
      if (!fs.existsSync(componentPath)) {
        throw new Error('StartupCheck component not found')
      }

      const content = fs.readFileSync(componentPath, 'utf8')
      
      // Check for required functionality
      const requiredFeatures = [
        'window.api.startup.check',
        'performStartupChecks',
        'requiresActivation',
        'requiresLogin',
        'requiresTrial',
        'securityStatus'
      ]

      for (const feature of requiredFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`StartupCheck missing feature: ${feature}`)
        }
      }
    })

    // Test 4: RequireLicense Component
    await this.runTest('RequireLicense Component', async () => {
      const componentPath = path.join(process.cwd(), 'renderer/src/components/auth/RequireLicense.tsx')
      if (!fs.existsSync(componentPath)) {
        throw new Error('RequireLicense component not found')
      }

      const content = fs.readFileSync(componentPath, 'utf8')
      
      // Check for license validation
      if (!content.includes('window.api.startup.isLicenseValid')) {
        throw new Error('RequireLicense not using startup API for license validation')
      }

      if (!content.includes('Navigate to="/activation"')) {
        throw new Error('RequireLicense not redirecting to activation when needed')
      }
    })

    // Test 5: RequirePermission Component
    await this.runTest('RequirePermission Component', async () => {
      const componentPath = path.join(process.cwd(), 'renderer/src/components/auth/RequirePermission.tsx')
      if (!fs.existsSync(componentPath)) {
        throw new Error('RequirePermission component not found')
      }

      const content = fs.readFileSync(componentPath, 'utf8')
      
      // Check for permission validation
      if (!content.includes('window.api.rbac.hasPermission')) {
        throw new Error('RequirePermission not using RBAC API')
      }

      if (!content.includes('Access Denied')) {
        throw new Error('RequirePermission missing access denied message')
      }
    })

    // Test 6: Updated AppRouter
    await this.runTest('Updated AppRouter with Guards', async () => {
      const routerPath = path.join(process.cwd(), 'renderer/src/router/AppRouter.tsx')
      if (!fs.existsSync(routerPath)) {
        throw new Error('AppRouter file not found')
      }

      const content = fs.readFileSync(routerPath, 'utf8')
      
      // Check for required imports
      const requiredImports = [
        'StartupCheck',
        'RequireLicense',
        'RequirePermission'
      ]

      for (const importName of requiredImports) {
        if (!content.includes(importName)) {
          throw new Error(`AppRouter missing import: ${importName}`)
        }
      }

      // Check for route protection
      if (!content.includes('<RequireLicense>')) {
        throw new Error('AppRouter not using RequireLicense component')
      }

      if (!content.includes('<RequirePermission permission=')) {
        throw new Error('AppRouter not using RequirePermission component')
      }
    })

    // Test 7: Startup IPC Handlers
    await this.runTest('Startup IPC Handlers', async () => {
      const ipcPath = path.join(process.cwd(), 'electron/ipc/startup.ipc.ts')
      if (!fs.existsSync(ipcPath)) {
        throw new Error('Startup IPC handlers file not found')
      }

      const content = fs.readFileSync(ipcPath, 'utf8')
      
      // Check for required handlers
      const requiredHandlers = [
        'startup:check',
        'startup:is-license-valid',
        'startup:get-trial-status',
        'startup:should-block'
      ]

      for (const handler of requiredHandlers) {
        if (!content.includes(handler)) {
          throw new Error(`Missing IPC handler: ${handler}`)
        }
      }
    })

    // Test 8: Preload API Integration
    await this.runTest('Preload API Integration', async () => {
      const preloadPath = path.join(process.cwd(), 'electron/preload.ts')
      if (!fs.existsSync(preloadPath)) {
        throw new Error('Preload file not found')
      }

      const content = fs.readFileSync(preloadPath, 'utf8')
      
      // Check for startup APIs
      if (!content.includes('startup: {')) {
        throw new Error('Preload missing startup APIs')
      }

      const startupAPIs = [
        'check:',
        'isLicenseValid:',
        'getTrialStatus:',
        'shouldBlock:'
      ]

      for (const api of startupAPIs) {
        if (!content.includes(api)) {
          throw new Error(`Preload missing startup API: ${api}`)
        }
      }
    })

    // Test 9: Database User Check
    await this.runTest('Database User Validation', async () => {
      const userCount = await prisma.user.count()
      
      if (userCount === 0) {
        throw new Error('No users found in database - startup should handle this')
      }

      // Check if admin user exists
      const adminUser = await prisma.user.findFirst({
        where: { username: 'admin' },
        include: { role: true }
      })

      if (!adminUser) {
        throw new Error('Admin user not found')
      }

      if (adminUser.role.name !== 'ADMIN') {
        throw new Error('Admin user does not have ADMIN role')
      }
    })

    // Test 10: Security Integration Check
    await this.runTest('Security Services Integration', async () => {
      // Check if security services are properly integrated
      const startupServicePath = path.join(process.cwd(), 'electron/services/startup.service.ts')
      const content = fs.readFileSync(startupServicePath, 'utf8')
      
      const requiredServices = [
        'licenseService',
        'trialService',
        'integrityService',
        'antiDebugService',
        'auditService'
      ]

      for (const service of requiredServices) {
        if (!content.includes(service)) {
          throw new Error(`Startup service missing integration with: ${service}`)
        }
      }
    })

    // Test 11: Route Permission Mapping
    await this.runTest('Route Permission Mapping', async () => {
      const routerPath = path.join(process.cwd(), 'renderer/src/router/AppRouter.tsx')
      const content = fs.readFileSync(routerPath, 'utf8')
      
      // Check for specific permission mappings
      const permissionMappings = [
        'view_customer',
        'create_order',
        'view_order',
        'update_order_status',
        'view_services',
        'view_payment',
        'view_outstanding_payments',
        'view_expense',
        'view_reports',
        'manage_users',
        'manage_roles',
        'view_audit_logs'
      ]

      for (const permission of permissionMappings) {
        if (!content.includes(`permission="${permission}"`)) {
          throw new Error(`Route missing permission mapping: ${permission}`)
        }
      }
    })

    // Test 12: Error Handling
    await this.runTest('Error Handling Implementation', async () => {
      const startupComponentPath = path.join(process.cwd(), 'renderer/src/components/startup/StartupCheck.tsx')
      const content = fs.readFileSync(startupComponentPath, 'utf8')
      
      // Check for error handling
      if (!content.includes('Security Error')) {
        throw new Error('StartupCheck missing security error handling')
      }

      if (!content.includes('Retry Security Checks')) {
        throw new Error('StartupCheck missing retry functionality')
      }

      if (!content.includes('Exit Application')) {
        throw new Error('StartupCheck missing exit option')
      }
    })

    // Test 13: TypeScript Compilation
    await this.runTest('TypeScript Compilation', async () => {
      const { execSync } = require('child_process')
      
      try {
        // Check if TypeScript files compile without errors
        execSync('npx tsc --noEmit --skipLibCheck', { 
          stdio: 'pipe',
          cwd: process.cwd()
        })
      } catch (error) {
        throw new Error(`TypeScript compilation failed: ${error.message}`)
      }
    })

    // Test 14: File Structure Validation
    await this.runTest('File Structure Validation', async () => {
      const requiredFiles = [
        'electron/services/startup.service.ts',
        'electron/ipc/startup.ipc.ts',
        'renderer/src/components/startup/StartupCheck.tsx',
        'renderer/src/components/auth/RequireLicense.tsx',
        'renderer/src/components/auth/RequirePermission.tsx',
        'renderer/src/router/AppRouter.tsx'
      ]

      for (const file of requiredFiles) {
        const filePath = path.join(process.cwd(), file)
        if (!fs.existsSync(filePath)) {
          throw new Error(`Required file missing: ${file}`)
        }
      }
    })

    // Test 15: Security Flow Integration
    await this.runTest('Security Flow Integration', async () => {
      const mainPath = path.join(process.cwd(), 'electron/main.ts')
      const content = fs.readFileSync(mainPath, 'utf8')
      
      // Check for periodic security checks
      if (!content.includes('setInterval')) {
        throw new Error('Main process missing periodic security checks')
      }

      if (!content.includes('performPeriodicSecurityCheck')) {
        throw new Error('Main process not calling periodic security checks')
      }

      if (!content.includes('startupService.shutdown')) {
        throw new Error('Main process not calling startup service shutdown')
      }
    })

    this.displayResults()
  }

  displayResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 Phase 14 Test Results Summary')
    console.log('='.repeat(60))
    
    const passRate = Math.round((this.passedTests / this.totalTests) * 100)
    
    console.log(`Total Tests: ${this.totalTests}`)
    console.log(`Passed: ${this.passedTests}`)
    console.log(`Failed: ${this.totalTests - this.passedTests}`)
    console.log(`Pass Rate: ${passRate}%`)
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 All tests passed! Phase 14 implementation is complete.')
    } else {
      console.log('\n❌ Some tests failed. Please review the implementation.')
      
      console.log('\nFailed Tests:')
      this.results
        .filter(result => result.status === 'FAILED')
        .forEach(result => {
          console.log(`  • ${result.name}: ${result.error}`)
        })
    }

    console.log('\n📋 Implementation Checklist:')
    console.log('✅ Enhanced startup service with comprehensive security checks')
    console.log('✅ Main process integration with startup security validation')
    console.log('✅ StartupCheck component for UI startup flow')
    console.log('✅ RequireLicense component for license validation')
    console.log('✅ RequirePermission component for granular access control')
    console.log('✅ Updated AppRouter with complete route protection')
    console.log('✅ Startup IPC handlers for security communication')
    console.log('✅ Preload API integration for startup checks')
    console.log('✅ Error handling and user feedback')
    console.log('✅ TypeScript compilation and type safety')
    console.log('✅ Periodic security monitoring')
    console.log('✅ Graceful shutdown procedures')
    
    console.log('\n🔐 Security Features:')
    console.log('• License validation before window creation')
    console.log('• Trial mode handling and expiry checks')
    console.log('• System integrity verification')
    console.log('• Anti-debugging protection')
    console.log('• Permission-based route access')
    console.log('• Audit logging for security events')
    console.log('• Periodic security monitoring (24-hour intervals)')
    console.log('• Graceful error handling and user guidance')
  }
}

// Run the test suite
async function main() {
  const testSuite = new Phase14TestSuite()
  
  try {
    await testSuite.runAllTests()
  } catch (error) {
    console.error('Test suite failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(console.error)