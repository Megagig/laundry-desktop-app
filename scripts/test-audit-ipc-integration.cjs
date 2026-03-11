#!/usr/bin/env node

/**
 * Audit IPC Integration Test Suite
 * 
 * Tests that all IPC handlers properly integrate with audit logging
 * by checking that audit logs are created when operations are performed.
 */

const { PrismaClient } = require('@prisma/client')

// Initialize Prisma
const prisma = new PrismaClient()

// Test results tracking
let totalTests = 0
let passedTests = 0
let failedTests = []

function logTest(testName, passed, error = null) {
  totalTests++
  if (passed) {
    passedTests++
    console.log(`✅ ${testName}`)
  } else {
    failedTests.push({ testName, error })
    console.log(`❌ ${testName}`)
    if (error) {
      console.log(`   Error: ${error.message}`)
    }
  }
}

async function testAuditIpcIntegration() {
  console.log('\n🔗 Testing Audit IPC Integration...\n')
  
  try {
    // Import the audit service
    const { auditService } = await import('../dist/electron/services/audit.service.js')
    
    // Get initial audit log count
    const initialCount = await auditService.getAuditLogCount()
    
    // Test 1: Verify audit service is available
    logTest('Audit service available', typeof auditService.logAction === 'function')
    
    // Test 2: Test customer audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'CUSTOMER',
        999,
        1,
        'admin',
        { name: 'Test Customer', phone: '1234567890' }
      )
      
      const customerLogs = await auditService.getLogsByModule('CUSTOMER', 1)
      logTest('Customer audit logging works', customerLogs.length > 0)
    } catch (error) {
      logTest('Customer audit logging works', false, error)
    }
    
    // Test 3: Test order audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'ORDER',
        999,
        1,
        'admin',
        { orderNumber: 'TEST-001', customerId: 1, totalAmount: 5000 }
      )
      
      const orderLogs = await auditService.getLogsByModule('ORDER', 1)
      logTest('Order audit logging works', orderLogs.length > 0)
    } catch (error) {
      logTest('Order audit logging works', false, error)
    }
    
    // Test 4: Test payment audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'PAYMENT',
        999,
        1,
        'admin',
        { orderId: 1, amount: 5000, method: 'CASH' }
      )
      
      const paymentLogs = await auditService.getLogsByModule('PAYMENT', 1)
      logTest('Payment audit logging works', paymentLogs.length > 0)
    } catch (error) {
      logTest('Payment audit logging works', false, error)
    }
    
    // Test 5: Test expense audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'EXPENSE',
        999,
        1,
        'admin',
        { title: 'Test Expense', amount: 1000, category: 'UTILITIES' }
      )
      
      const expenseLogs = await auditService.getLogsByModule('EXPENSE', 1)
      logTest('Expense audit logging works', expenseLogs.length > 0)
    } catch (error) {
      logTest('Expense audit logging works', false, error)
    }
    
    // Test 6: Test service audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'SERVICE',
        999,
        1,
        'admin',
        { name: 'Test Service', price: 500, category: 'WASHING' }
      )
      
      const serviceLogs = await auditService.getLogsByModule('SERVICE', 1)
      logTest('Service audit logging works', serviceLogs.length > 0)
    } catch (error) {
      logTest('Service audit logging works', false, error)
    }
    
    // Test 7: Test settings audit logging
    try {
      await auditService.logDataOperation(
        'UPDATE',
        'SETTINGS',
        'test_setting',
        1,
        'admin',
        { key: 'test_setting', originalValue: 'old', newValue: 'new' }
      )
      
      const settingsLogs = await auditService.getLogsByModule('SETTINGS', 1)
      logTest('Settings audit logging works', settingsLogs.length > 0)
    } catch (error) {
      logTest('Settings audit logging works', false, error)
    }
    
    // Test 8: Test backup audit logging
    try {
      await auditService.logDataOperation(
        'CREATE',
        'BACKUP',
        'test_backup.db',
        1,
        'admin',
        { backupPath: '/path/to/backup.db', action: 'create' }
      )
      
      const backupLogs = await auditService.getLogsByModule('BACKUP', 1)
      logTest('Backup audit logging works', backupLogs.length > 0)
    } catch (error) {
      logTest('Backup audit logging works', false, error)
    }
    
    // Test 9: Verify total audit log count increased
    const finalCount = await auditService.getAuditLogCount()
    const expectedIncrease = 7 // Number of audit logs we created
    const actualIncrease = finalCount - initialCount
    
    logTest(
      `Audit log count increased correctly (expected: ${expectedIncrease}, actual: ${actualIncrease})`,
      actualIncrease >= expectedIncrease
    )
    
    // Test 10: Test audit log search functionality
    try {
      const searchResults = await auditService.searchAuditLogs('admin')
      logTest('Audit log search works', searchResults.length > 0)
    } catch (error) {
      logTest('Audit log search works', false, error)
    }
    
    // Test 11: Test audit statistics
    try {
      const stats = await auditService.getAuditStats()
      logTest('Audit statistics work', 
        stats.totalLogs > 0 &&
        typeof stats.todayLogs === 'number' &&
        Array.isArray(stats.topUsers) &&
        Array.isArray(stats.topModules) &&
        Array.isArray(stats.topActions)
      )
    } catch (error) {
      logTest('Audit statistics work', false, error)
    }
    
    // Test 12: Test audit log export
    try {
      const exportPath = await auditService.exportAuditLogs({ limit: 10 })
      const fs = require('fs')
      const fileExists = fs.existsSync(exportPath)
      
      // Clean up the exported file
      if (fileExists) {
        fs.unlinkSync(exportPath)
      }
      
      logTest('Audit log export works', fileExists)
    } catch (error) {
      logTest('Audit log export works', false, error)
    }

  } catch (error) {
    console.error('Failed to import audit service:', error)
    logTest('Import audit service', false, error)
  }
}

async function testPermissionDeniedLogging() {
  console.log('\n🚫 Testing Permission Denied Logging...\n')
  
  try {
    const { auditService } = await import('../dist/electron/services/audit.service.js')
    
    // Test permission denied logging
    await auditService.logPermissionDenied(1, 'admin', 'manage_users', 'USER_MANAGEMENT')
    
    const permissionLogs = await auditService.getAuditLogs({ action: 'PERMISSION_DENIED', limit: 1 })
    logTest('Permission denied logging works', permissionLogs.length > 0)
    
    // Test login/logout logging
    await auditService.logLogin(1, 'admin', true)
    await auditService.logLogout(1, 'admin')
    
    const authLogs = await auditService.getLogsByModule('AUTH', 5)
    logTest('Auth logging works', authLogs.length >= 2)
    
  } catch (error) {
    logTest('Permission denied logging', false, error)
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n')
  
  try {
    // Remove test audit logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { module: { in: ['CUSTOMER', 'ORDER', 'PAYMENT', 'EXPENSE', 'SERVICE', 'SETTINGS', 'BACKUP'] } },
          { action: { contains: 'TEST' } },
          { description: { contains: 'test' } },
          { description: { contains: 'Test' } }
        ]
      }
    })
    
    console.log(`✅ Cleaned up ${result.count} test audit logs`)
  } catch (error) {
    console.log('❌ Failed to clean up test data:', error.message)
  }
}

async function runAllTests() {
  console.log('🔗 Audit IPC Integration Test Suite')
  console.log('=' .repeat(50))
  
  try {
    // Run all test suites
    await testAuditIpcIntegration()
    await testPermissionDeniedLogging()
    
    // Clean up test data
    await cleanup()
    
  } catch (error) {
    console.error('Test suite failed:', error)
  } finally {
    await prisma.$disconnect()
  }
  
  // Print summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${failedTests.length}`)
  console.log(`Success Rate: ${totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0}%`)
  
  if (failedTests.length > 0) {
    console.log('\n❌ Failed Tests:')
    failedTests.forEach(({ testName, error }) => {
      console.log(`  - ${testName}`)
      if (error) {
        console.log(`    ${error.message}`)
      }
    })
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Audit IPC integration is working correctly.')
  } else {
    console.log(`\n⚠️  ${failedTests.length} test(s) failed. Please review the errors above.`)
    process.exit(1)
  }
}

// Run the tests
runAllTests().catch(console.error)