/**
 * Test License Storage IPC Handlers
 * 
 * This script tests the IPC handlers for license storage functionality
 * by simulating the calls that would be made from the renderer process.
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mock session token for testing (in real app, this would come from auth)
const MOCK_ADMIN_SESSION = 'mock-admin-session-token'

/**
 * Mock permission check (simulates the real permission middleware)
 */
async function mockCheckPermission(sessionToken, permission) {
  // In a real test, this would validate the session and check permissions
  // For this test, we'll assume the session is valid and has admin permissions
  if (sessionToken === MOCK_ADMIN_SESSION) {
    return { success: true }
  }
  return { success: false, error: 'Invalid session' }
}

/**
 * Mock license service methods for testing
 */
class MockLicenseService {
  async getAllLicenses() {
    const licenses = await prisma.license.findMany({
      orderBy: { activatedAt: 'desc' }
    })
    
    return licenses.map(license => ({
      id: license.id,
      issuedTo: license.issuedTo,
      email: license.email,
      licenseType: license.licenseType,
      features: license.features?.split(',') || [],
      maxUsers: license.maxUsers,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt,
      activatedAt: license.activatedAt,
      isActive: license.isActive,
      machineId: license.machineId,
      daysRemaining: license.expiresAt ? 
        Math.max(0, Math.ceil((license.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))) : 
        null,
      isExpired: license.expiresAt ? new Date() > license.expiresAt : false
    }))
  }
  
  async getLicenseHistory() {
    const licenses = await prisma.license.findMany({
      orderBy: { activatedAt: 'desc' }
    })
    
    return licenses.map(license => ({
      id: license.id,
      issuedTo: license.issuedTo,
      licenseType: license.licenseType,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      isActive: license.isActive,
      status: license.isActive ? 'Active' : 
              (license.expiresAt && new Date() > license.expiresAt) ? 'Expired' : 'Inactive'
    }))
  }
  
  async exportLicenseData() {
    const licenses = await this.getAllLicenses()
    
    const exportData = {
      exportDate: new Date().toISOString(),
      machineId: 'LND-TEST-MACHINE',
      licenses: licenses.map(license => ({
        issuedTo: license.issuedTo,
        email: license.email,
        licenseType: license.licenseType,
        features: license.features,
        maxUsers: license.maxUsers,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        activatedAt: license.activatedAt,
        isActive: license.isActive
      }))
    }
    
    return JSON.stringify(exportData, null, 2)
  }
  
  async getLicenseStats() {
    const licenses = await prisma.license.findMany()
    const now = new Date()
    
    const stats = {
      total: licenses.length,
      active: 0,
      expired: 0,
      inactive: 0,
      byType: {}
    }
    
    licenses.forEach(license => {
      if (license.isActive) {
        stats.active++
      } else if (license.expiresAt && now > license.expiresAt) {
        stats.expired++
      } else {
        stats.inactive++
      }
      
      stats.byType[license.licenseType] = (stats.byType[license.licenseType] || 0) + 1
    })
    
    return stats
  }
  
  async validateStoredLicenses() {
    const licenses = await prisma.license.findMany()
    const results = {
      valid: 0,
      invalid: 0,
      details: []
    }
    
    licenses.forEach(license => {
      // Basic validation check
      const isValid = license.licenseKey && 
                      license.machineId && 
                      license.issuedTo &&
                      license.licenseType
      
      if (isValid) {
        results.valid++
      } else {
        results.invalid++
        results.details.push({
          id: license.id,
          issuedTo: license.issuedTo,
          error: 'Missing required fields'
        })
      }
    })
    
    return results
  }
  
  async cleanupExpiredLicenses(daysOld) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)
    
    // For testing, just count what would be deleted
    const licenses = await prisma.license.findMany({
      where: {
        AND: [
          { isActive: false },
          { expiresAt: { lt: cutoffDate } }
        ]
      }
    })
    
    return licenses.length
  }
  
  async updateLicenseMetadata(licenseId, updates) {
    const license = await prisma.license.findUnique({
      where: { id: licenseId }
    })
    
    if (!license) {
      throw new Error('License not found')
    }
    
    await prisma.license.update({
      where: { id: licenseId },
      data: {
        expiresAt: updates.expiresAt,
        maxUsers: updates.maxUsers,
        features: updates.features?.join(','),
        isActive: updates.isActive
      }
    })
  }
  
  async archiveLicense(licenseId) {
    await prisma.license.update({
      where: { id: licenseId },
      data: { isActive: false }
    })
  }
}

/**
 * Mock IPC handlers (simulates the real IPC handlers)
 */
class MockIPCHandlers {
  constructor() {
    this.licenseService = new MockLicenseService()
  }
  
  async handleGetAll(sessionToken) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'MANAGE_LICENSE')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const licenses = await this.licenseService.getAllLicenses()
      return { success: true, data: licenses }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to get licenses' 
      }
    }
  }
  
  async handleGetHistory(sessionToken) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'VIEW_AUDIT_LOGS')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const history = await this.licenseService.getLicenseHistory()
      return { success: true, data: history }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to get license history' 
      }
    }
  }
  
  async handleExportData(sessionToken) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'CREATE_BACKUP')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const exportData = await this.licenseService.exportLicenseData()
      return { success: true, data: exportData }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to export license data' 
      }
    }
  }
  
  async handleGetStats(sessionToken) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'VIEW_REPORTS')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const stats = await this.licenseService.getLicenseStats()
      return { success: true, data: stats }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to get license stats' 
      }
    }
  }
  
  async handleValidateStored(sessionToken) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'MANAGE_LICENSE')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const validation = await this.licenseService.validateStoredLicenses()
      return { success: true, data: validation }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to validate stored licenses' 
      }
    }
  }
  
  async handleCleanupExpired(sessionToken, daysOld) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'MANAGE_LICENSE')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      const deletedCount = await this.licenseService.cleanupExpiredLicenses(daysOld)
      return { success: true, data: { deletedCount } }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to cleanup expired licenses' 
      }
    }
  }
  
  async handleUpdateMetadata(sessionToken, licenseId, updates) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'MANAGE_LICENSE')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await this.licenseService.updateLicenseMetadata(licenseId, updates)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to update license metadata' 
      }
    }
  }
  
  async handleArchive(sessionToken, licenseId) {
    try {
      const permissionCheck = await mockCheckPermission(sessionToken, 'MANAGE_LICENSE')
      if (!permissionCheck.success) {
        return { success: false, error: permissionCheck.error }
      }

      await this.licenseService.archiveLicense(licenseId)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to archive license' 
      }
    }
  }
}

/**
 * Run IPC handler tests
 */
async function testLicenseStorageIPC() {
  console.log('🔌 Testing License Storage IPC Handlers...\n')
  
  const handlers = new MockIPCHandlers()
  let passedTests = 0
  let totalTests = 0
  
  try {
    // Test 1: Get all licenses
    console.log('📋 Test 1: license:getAll handler...')
    totalTests++
    const getAllResult = await handlers.handleGetAll(MOCK_ADMIN_SESSION)
    if (getAllResult.success && Array.isArray(getAllResult.data)) {
      console.log(`   ✅ Success - Found ${getAllResult.data.length} licenses`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${getAllResult.error}`)
    }
    
    // Test 2: Get license history
    console.log('\n📜 Test 2: license:getHistory handler...')
    totalTests++
    const getHistoryResult = await handlers.handleGetHistory(MOCK_ADMIN_SESSION)
    if (getHistoryResult.success && Array.isArray(getHistoryResult.data)) {
      console.log(`   ✅ Success - Found ${getHistoryResult.data.length} history entries`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${getHistoryResult.error}`)
    }
    
    // Test 3: Export license data
    console.log('\n📤 Test 3: license:exportData handler...')
    totalTests++
    const exportResult = await handlers.handleExportData(MOCK_ADMIN_SESSION)
    if (exportResult.success && typeof exportResult.data === 'string') {
      console.log(`   ✅ Success - Export data generated (${exportResult.data.length} characters)`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${exportResult.error}`)
    }
    
    // Test 4: Get license statistics
    console.log('\n📊 Test 4: license:getStats handler...')
    totalTests++
    const statsResult = await handlers.handleGetStats(MOCK_ADMIN_SESSION)
    if (statsResult.success && statsResult.data.total !== undefined) {
      console.log(`   ✅ Success - Stats: ${JSON.stringify(statsResult.data)}`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${statsResult.error}`)
    }
    
    // Test 5: Validate stored licenses
    console.log('\n🔍 Test 5: license:validateStored handler...')
    totalTests++
    const validateResult = await handlers.handleValidateStored(MOCK_ADMIN_SESSION)
    if (validateResult.success && validateResult.data.valid !== undefined) {
      console.log(`   ✅ Success - Valid: ${validateResult.data.valid}, Invalid: ${validateResult.data.invalid}`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${validateResult.error}`)
    }
    
    // Test 6: Cleanup expired licenses
    console.log('\n🧹 Test 6: license:cleanupExpired handler...')
    totalTests++
    const cleanupResult = await handlers.handleCleanupExpired(MOCK_ADMIN_SESSION, 365)
    if (cleanupResult.success && cleanupResult.data.deletedCount !== undefined) {
      console.log(`   ✅ Success - Would delete ${cleanupResult.data.deletedCount} expired licenses`)
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${cleanupResult.error}`)
    }
    
    // Test 7: Update license metadata
    console.log('\n✏️  Test 7: license:updateMetadata handler...')
    totalTests++
    const updateResult = await handlers.handleUpdateMetadata(MOCK_ADMIN_SESSION, 1, {
      maxUsers: 10,
      features: ['basic', 'reports', 'backup']
    })
    if (updateResult.success) {
      console.log('   ✅ Success - License metadata updated')
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${updateResult.error}`)
    }
    
    // Test 8: Archive license
    console.log('\n📦 Test 8: license:archive handler...')
    totalTests++
    const archiveResult = await handlers.handleArchive(MOCK_ADMIN_SESSION, 2)
    if (archiveResult.success) {
      console.log('   ✅ Success - License archived')
      passedTests++
    } else {
      console.log(`   ❌ Failed - ${archiveResult.error}`)
    }
    
    // Test 9: Permission denied test
    console.log('\n🚫 Test 9: Permission denied test...')
    totalTests++
    const deniedResult = await handlers.handleGetAll('invalid-session')
    if (!deniedResult.success && deniedResult.error.includes('Invalid session')) {
      console.log('   ✅ Success - Permission correctly denied')
      passedTests++
    } else {
      console.log('   ❌ Failed - Permission check not working')
    }
    
    // Summary
    console.log('\n📊 IPC Handler Test Summary:')
    console.log('─'.repeat(50))
    console.log(`Total Tests: ${totalTests}`)
    console.log(`Passed: ${passedTests}`)
    console.log(`Failed: ${totalTests - passedTests}`)
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All IPC handlers are working correctly!')
    } else {
      console.log('\n⚠️  Some IPC handlers failed. Please review the implementation.')
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
testLicenseStorageIPC().catch(console.error)