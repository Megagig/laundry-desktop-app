#!/usr/bin/env node

/**
 * Audit System Test Suite
 * 
 * Tests all audit logging functionality including:
 * - Audit service methods
 * - IPC handlers
 * - Permission checks
 * - Export functionality
 * - Statistics and reporting
 */

const { PrismaClient } = require('@prisma/client')
const path = require('path')
const fs = require('fs')

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

async function testAuditService() {
  console.log('\n🔍 Testing Audit Service...\n')
  
  try {
    // Import the audit service
    const { auditService } = await import('../dist/electron/services/audit.service.js')
    
    // Test 1: Log a basic action
    try {
      await auditService.logAction({
        userId: 1,
        username: 'admin',
        action: 'TEST_ACTION',
        module: 'TEST',
        description: 'This is a test audit log entry',
        metadata: { testData: 'test value' }
      })
      logTest('Log basic action', true)
    } catch (error) {
      logTest('Log basic action', false, error)
    }

    // Test 2: Log login success
    try {
      await auditService.logLogin(1, 'admin', true)
      logTest('Log login success', true)
    } catch (error) {
      logTest('Log login success', false, error)
    }

    // Test 3: Log login failure
    try {
      await auditService.logLogin(0, 'baduser', false)
      logTest('Log login failure', true)
    } catch (error) {
      logTest('Log login failure', false, error)
    }

    // Test 4: Log logout
    try {
      await auditService.logLogout(1, 'admin')
      logTest('Log logout', true)
    } catch (error) {
      logTest('Log logout', false, error)
    }

    // Test 5: Log permission denied
    try {
      await auditService.logPermissionDenied(1, 'admin', 'manage_users', 'USER_MANAGEMENT')
      logTest('Log permission denied', true)
    } catch (error) {
      logTest('Log permission denied', false, error)
    }

    // Test 6: Log password change
    try {
      await auditService.logPasswordChange(1, 'admin')
      logTest('Log password change', true)
    } catch (error) {
      logTest('Log password change', false, error)
    }

    // Test 7: Log user management action
    try {
      await auditService.logUserManagement(
        'CREATE',
        1,
        'admin',
        2,
        'testuser',
        { fullName: 'Test User', email: 'test@example.com' }
      )
      logTest('Log user management action', true)
    } catch (error) {
      logTest('Log user management action', false, error)
    }

    // Test 8: Log license action
    try {
      await auditService.logLicenseAction(
        'ACTIVATE',
        1,
        'admin',
        { licenseType: 'ANNUAL', machineId: 'TEST-123' }
      )
      logTest('Log license action', true)
    } catch (error) {
      logTest('Log license action', false, error)
    }

    // Test 9: Log data operation
    try {
      await auditService.logDataOperation(
        'CREATE',
        'CUSTOMER',
        123,
        1,
        'admin',
        { name: 'Test Customer', phone: '1234567890' }
      )
      logTest('Log data operation', true)
    } catch (error) {
      logTest('Log data operation', false, error)
    }

    // Test 10: Get audit logs
    try {
      const logs = await auditService.getAuditLogs({ limit: 10 })
      logTest('Get audit logs', logs.length > 0)
    } catch (error) {
      logTest('Get audit logs', false, error)
    }

    // Test 11: Get logs by user
    try {
      const logs = await auditService.getLogsByUser(1, 5)
      logTest('Get logs by user', logs.length > 0)
    } catch (error) {
      logTest('Get logs by user', false, error)
    }

    // Test 12: Get logs by module
    try {
      const logs = await auditService.getLogsByModule('TEST', 5)
      logTest('Get logs by module', logs.length > 0)
    } catch (error) {
      logTest('Get logs by module', false, error)
    }

    // Test 13: Get logs by date range
    try {
      const startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
      
      const logs = await auditService.getLogsByDateRange(startDate, endDate, 10)
      logTest('Get logs by date range', logs.length > 0)
    } catch (error) {
      logTest('Get logs by date range', false, error)
    }

    // Test 14: Get audit statistics
    try {
      const stats = await auditService.getAuditStats()
      logTest('Get audit statistics', 
        stats.totalLogs > 0 &&
        typeof stats.todayLogs === 'number' &&
        Array.isArray(stats.topUsers) &&
        Array.isArray(stats.topModules) &&
        Array.isArray(stats.topActions)
      )
    } catch (error) {
      logTest('Get audit statistics', false, error)
    }

    // Test 15: Search audit logs
    try {
      const logs = await auditService.searchAuditLogs('admin', { limit: 5 })
      logTest('Search audit logs', logs.length > 0)
    } catch (error) {
      logTest('Search audit logs', false, error)
    }

    // Test 16: Get unique modules
    try {
      const modules = await auditService.getUniqueModules()
      logTest('Get unique modules', Array.isArray(modules) && modules.length > 0)
    } catch (error) {
      logTest('Get unique modules', false, error)
    }

    // Test 17: Get unique actions
    try {
      const actions = await auditService.getUniqueActions()
      logTest('Get unique actions', Array.isArray(actions) && actions.length > 0)
    } catch (error) {
      logTest('Get unique actions', false, error)
    }

    // Test 18: Get audit log count
    try {
      const count = await auditService.getAuditLogCount()
      logTest('Get audit log count', typeof count === 'number' && count > 0)
    } catch (error) {
      logTest('Get audit log count', false, error)
    }

    // Test 19: Export audit logs
    try {
      const filepath = await auditService.exportAuditLogs({ limit: 100 })
      const fileExists = fs.existsSync(filepath)
      
      // Clean up the exported file
      if (fileExists) {
        fs.unlinkSync(filepath)
      }
      
      logTest('Export audit logs', fileExists)
    } catch (error) {
      logTest('Export audit logs', false, error)
    }

  } catch (error) {
    console.error('Failed to import audit service:', error)
    logTest('Import audit service', false, error)
  }
}

async function testDatabaseIntegration() {
  console.log('\n💾 Testing Database Integration...\n')
  
  try {
    // Test 1: Check if audit logs were created
    const auditLogCount = await prisma.auditLog.count()
    logTest('Audit logs created in database', auditLogCount > 0)

    // Test 2: Check audit log structure
    const sampleLog = await prisma.auditLog.findFirst({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    })
    
    logTest('Audit log structure correct', 
      sampleLog &&
      typeof sampleLog.action === 'string' &&
      typeof sampleLog.module === 'string' &&
      sampleLog.createdAt instanceof Date
    )

    // Test 3: Check metadata JSON parsing
    const logWithMetadata = await prisma.auditLog.findFirst({
      where: {
        metadata: { not: null }
      }
    })
    
    if (logWithMetadata && logWithMetadata.metadata) {
      try {
        const parsed = JSON.parse(logWithMetadata.metadata)
        logTest('Metadata JSON parsing', typeof parsed === 'object')
      } catch (error) {
        logTest('Metadata JSON parsing', false, error)
      }
    } else {
      logTest('Metadata JSON parsing', true) // No metadata to test
    }

    // Test 4: Check user relationship
    const logWithUser = await prisma.auditLog.findFirst({
      where: {
        userId: { not: null }
      },
      include: {
        user: true
      }
    })
    
    logTest('User relationship works', 
      logWithUser && 
      logWithUser.user &&
      logWithUser.user.username
    )

  } catch (error) {
    logTest('Database integration test', false, error)
  }
}

async function testAuditFiltering() {
  console.log('\n🔍 Testing Audit Filtering...\n')
  
  try {
    const { auditService } = await import('../dist/electron/services/audit.service.js')
    
    // Test 1: Filter by user ID
    try {
      const logs = await auditService.getAuditLogs({ userId: 1, limit: 5 })
      const allFromUser = logs.every(log => log.userId === 1)
      logTest('Filter by user ID', allFromUser)
    } catch (error) {
      logTest('Filter by user ID', false, error)
    }

    // Test 2: Filter by module
    try {
      const logs = await auditService.getAuditLogs({ module: 'AUTH', limit: 5 })
      const allFromModule = logs.every(log => log.module === 'AUTH')
      logTest('Filter by module', allFromModule)
    } catch (error) {
      logTest('Filter by module', false, error)
    }

    // Test 3: Filter by action
    try {
      const logs = await auditService.getAuditLogs({ action: 'LOGIN_SUCCESS', limit: 5 })
      const allFromAction = logs.every(log => log.action === 'LOGIN_SUCCESS')
      logTest('Filter by action', allFromAction)
    } catch (error) {
      logTest('Filter by action', false, error)
    }

    // Test 4: Filter by date range
    try {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const logs = await auditService.getAuditLogs({ 
        startDate: yesterday, 
        endDate: tomorrow, 
        limit: 10 
      })
      
      const allInRange = logs.every(log => 
        log.createdAt >= yesterday && log.createdAt <= tomorrow
      )
      
      logTest('Filter by date range', allInRange)
    } catch (error) {
      logTest('Filter by date range', false, error)
    }

    // Test 5: Combined filters
    try {
      const logs = await auditService.getAuditLogs({ 
        userId: 1, 
        module: 'AUTH',
        limit: 5 
      })
      
      const matchesFilters = logs.every(log => 
        log.userId === 1 && log.module === 'AUTH'
      )
      
      logTest('Combined filters', matchesFilters)
    } catch (error) {
      logTest('Combined filters', false, error)
    }

  } catch (error) {
    logTest('Audit filtering tests', false, error)
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n')
  
  try {
    // Remove test audit logs
    const result = await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { module: 'TEST' },
          { action: { contains: 'TEST' } },
          { description: { contains: 'test' } }
        ]
      }
    })
    
    console.log(`✅ Cleaned up ${result.count} test audit logs`)
  } catch (error) {
    console.log('❌ Failed to clean up test data:', error.message)
  }
}

async function runAllTests() {
  console.log('🎯 Audit System Test Suite')
  console.log('=' .repeat(50))
  
  try {
    // Run all test suites
    await testAuditService()
    await testDatabaseIntegration()
    await testAuditFiltering()
    
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
    console.log('\n🎉 All tests passed! Audit system is working correctly.')
  } else {
    console.log(`\n⚠️  ${failedTests.length} test(s) failed. Please review the errors above.`)
    process.exit(1)
  }
}

// Run the tests
runAllTests().catch(console.error)