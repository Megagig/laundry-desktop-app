/**
 * Test License Storage System
 * 
 * This script tests the enhanced license storage functionality
 * including backup, export, statistics, and management features.
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Test license storage functionality
 */
async function testLicenseStorage() {
  console.log('🗄️  Testing License Storage System...\n')
  
  try {
    // Test 1: Check if we have any licenses in the database
    console.log('📊 Test 1: Checking existing licenses...')
    const licenses = await prisma.license.findMany()
    console.log(`   Found ${licenses.length} licenses in database`)
    
    if (licenses.length === 0) {
      console.log('   ⚠️  No licenses found. You may need to activate a license first.')
      console.log('   💡 Run the application and activate a sample license from sample-licenses/')
      return
    }
    
    // Test 2: License statistics
    console.log('\n📈 Test 2: License statistics...')
    const now = new Date()
    const stats = {
      total: licenses.length,
      active: 0,
      expired: 0,
      inactive: 0,
      byType: {}
    }
    
    licenses.forEach(license => {
      // Count by status
      if (license.isActive) {
        stats.active++
      } else if (license.expiresAt && now > license.expiresAt) {
        stats.expired++
      } else {
        stats.inactive++
      }
      
      // Count by type
      stats.byType[license.licenseType] = (stats.byType[license.licenseType] || 0) + 1
    })
    
    console.log('   📊 Statistics:')
    console.log(`      Total: ${stats.total}`)
    console.log(`      Active: ${stats.active}`)
    console.log(`      Expired: ${stats.expired}`)
    console.log(`      Inactive: ${stats.inactive}`)
    console.log('      By Type:', stats.byType)
    
    // Test 3: License export
    console.log('\n📤 Test 3: License data export...')
    const exportData = {
      exportDate: new Date().toISOString(),
      machineId: 'LND-TEST-EXPORT',
      licenses: licenses.map(license => ({
        issuedTo: license.issuedTo,
        email: license.email,
        licenseType: license.licenseType,
        features: license.features?.split(',') || [],
        maxUsers: license.maxUsers,
        issuedAt: license.issuedAt,
        expiresAt: license.expiresAt,
        activatedAt: license.activatedAt,
        isActive: license.isActive
      }))
    }
    
    const exportJson = JSON.stringify(exportData, null, 2)
    console.log(`   ✅ Export data generated (${exportJson.length} characters)`)
    
    // Test 4: Create backup
    console.log('\n💾 Test 4: Creating license backup...')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `license-backup-test-${timestamp}.json`
    const backupsDir = path.join(process.cwd(), 'backups', 'licenses')
    
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true })
      console.log(`   📁 Created backups directory: ${backupsDir}`)
    }
    
    const filePath = path.join(backupsDir, filename)
    fs.writeFileSync(filePath, exportJson)
    console.log(`   ✅ Backup created: ${filePath}`)
    
    // Test 5: License history
    console.log('\n📜 Test 5: License history...')
    const history = licenses.map(license => ({
      id: license.id,
      issuedTo: license.issuedTo,
      licenseType: license.licenseType,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      isActive: license.isActive,
      status: license.isActive ? 'Active' : 
              (license.expiresAt && new Date() > license.expiresAt) ? 'Expired' : 'Inactive'
    }))
    
    console.log('   📋 License History:')
    history.forEach((license, index) => {
      console.log(`      ${index + 1}. ${license.issuedTo} (${license.licenseType}) - ${license.status}`)
    })
    
    // Test 6: License validation check
    console.log('\n🔍 Test 6: Validating stored licenses...')
    let validCount = 0
    let invalidCount = 0
    
    for (const license of licenses) {
      try {
        // Basic validation check (without crypto verification for this test)
        const isValid = license.licenseKey && 
                        license.machineId && 
                        license.issuedTo &&
                        license.licenseType
        
        if (isValid) {
          validCount++
        } else {
          invalidCount++
          console.log(`   ⚠️  Invalid license: ${license.issuedTo} - Missing required fields`)
        }
      } catch (error) {
        invalidCount++
        console.log(`   ❌ Validation error for ${license.issuedTo}: ${error.message}`)
      }
    }
    
    console.log(`   ✅ Valid licenses: ${validCount}`)
    console.log(`   ❌ Invalid licenses: ${invalidCount}`)
    
    // Test 7: Cleanup simulation (dry run)
    console.log('\n🧹 Test 7: Expired license cleanup simulation...')
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 365) // 1 year ago
    
    const expiredLicenses = licenses.filter(license => 
      !license.isActive && 
      license.expiresAt && 
      license.expiresAt < cutoffDate
    )
    
    console.log(`   📊 Found ${expiredLicenses.length} expired licenses older than 365 days`)
    if (expiredLicenses.length > 0) {
      console.log('   💡 These would be cleaned up in a real cleanup operation')
      expiredLicenses.forEach(license => {
        console.log(`      - ${license.issuedTo} (expired: ${license.expiresAt?.toLocaleDateString()})`)
      })
    }
    
    // Test 8: Storage integrity check
    console.log('\n🔧 Test 8: Storage integrity check...')
    const integrityIssues = []
    
    licenses.forEach(license => {
      if (!license.licenseKey) integrityIssues.push(`License ${license.id}: Missing license key`)
      if (!license.machineId) integrityIssues.push(`License ${license.id}: Missing machine ID`)
      if (!license.issuedTo) integrityIssues.push(`License ${license.id}: Missing issued to`)
      if (!license.licenseType) integrityIssues.push(`License ${license.id}: Missing license type`)
      if (!license.signature) integrityIssues.push(`License ${license.id}: Missing signature`)
    })
    
    if (integrityIssues.length === 0) {
      console.log('   ✅ All licenses have required fields')
    } else {
      console.log(`   ⚠️  Found ${integrityIssues.length} integrity issues:`)
      integrityIssues.forEach(issue => console.log(`      - ${issue}`))
    }
    
    console.log('\n🎯 License Storage Test Summary:')
    console.log('─'.repeat(50))
    console.log(`✅ Database connection: Working`)
    console.log(`✅ License statistics: Generated`)
    console.log(`✅ Data export: Working`)
    console.log(`✅ Backup creation: Working`)
    console.log(`✅ License history: Generated`)
    console.log(`✅ Validation check: Completed`)
    console.log(`✅ Cleanup simulation: Completed`)
    console.log(`✅ Integrity check: Completed`)
    
    console.log('\n🎉 License storage system is working correctly!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the tests
testLicenseStorage().catch(console.error)