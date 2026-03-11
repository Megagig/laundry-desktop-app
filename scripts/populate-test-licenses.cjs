/**
 * Populate Test Licenses
 * 
 * This script populates the database with test licenses
 * to demonstrate the license storage functionality.
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

/**
 * Extract license key from license file
 */
function extractLicenseKey(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  
  let licenseKeyStart = false
  let licenseKey = ''
  
  for (const line of lines) {
    if (line.includes('License Key:')) {
      licenseKeyStart = true
      continue
    }
    
    if (licenseKeyStart) {
      if (line.trim() === '' || line.includes('Details:')) {
        break
      }
      licenseKey += line.trim()
    }
  }
  
  return licenseKey
}

/**
 * Parse license payload from license key
 */
function parseLicenseKey(licenseKey) {
  try {
    const decoded = JSON.parse(Buffer.from(licenseKey, 'base64').toString())
    if (!decoded.payload || !decoded.signature) {
      return null
    }
    
    const payload = JSON.parse(decoded.payload)
    return { payload, signature: decoded.signature }
  } catch (error) {
    return null
  }
}

/**
 * Populate database with test licenses
 */
async function populateTestLicenses() {
  console.log('📝 Populating Database with Test Licenses...\n')
  
  try {
    // Check if sample licenses exist
    const licensesDir = path.join(__dirname, '..', 'sample-licenses')
    
    if (!fs.existsSync(licensesDir)) {
      console.error('❌ Sample licenses directory not found.')
      console.log('💡 Run "node scripts/create-sample-license.cjs" first to create sample licenses.')
      return
    }
    
    const licenseFiles = fs.readdirSync(licensesDir).filter(file => file.endsWith('.txt'))
    
    if (licenseFiles.length === 0) {
      console.error('❌ No license files found in sample-licenses directory.')
      return
    }
    
    console.log(`📁 Found ${licenseFiles.length} license files`)
    
    // Clear existing licenses
    console.log('🧹 Clearing existing licenses...')
    await prisma.license.deleteMany({})
    console.log('   ✅ Existing licenses cleared')
    
    let successCount = 0
    let errorCount = 0
    
    // Process each license file
    for (const filename of licenseFiles) {
      console.log(`\n📄 Processing ${filename}...`)
      
      const filePath = path.join(licensesDir, filename)
      const licenseKey = extractLicenseKey(filePath)
      
      if (!licenseKey) {
        console.log('   ❌ Could not extract license key')
        errorCount++
        continue
      }
      
      const licenseData = parseLicenseKey(licenseKey)
      
      if (!licenseData) {
        console.log('   ❌ Could not parse license key')
        errorCount++
        continue
      }
      
      const { payload, signature } = licenseData
      
      try {
        // Create license record
        const license = await prisma.license.create({
          data: {
            licenseKey,
            machineId: payload.machineId,
            issuedTo: payload.issuedTo,
            email: payload.email || '',
            licenseType: payload.licenseType,
            features: payload.features?.join(',') || '',
            maxUsers: payload.maxUsers || 1,
            issuedAt: new Date(payload.issuedAt),
            expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
            signature: signature.substring(0, 100), // Truncate for storage
            isActive: filename.includes('trial') // Make trial license active
          }
        })
        
        console.log(`   ✅ License created (ID: ${license.id})`)
        console.log(`      Issued To: ${payload.issuedTo}`)
        console.log(`      Type: ${payload.licenseType}`)
        console.log(`      Features: ${payload.features?.join(', ') || 'None'}`)
        console.log(`      Max Users: ${payload.maxUsers}`)
        console.log(`      Expires: ${payload.expiresAt ? new Date(payload.expiresAt).toLocaleDateString() : 'Never'}`)
        console.log(`      Active: ${license.isActive}`)
        
        successCount++
      } catch (error) {
        console.log(`   ❌ Failed to create license: ${error.message}`)
        errorCount++
      }
    }
    
    console.log('\n📊 Population Summary:')
    console.log('─'.repeat(40))
    console.log(`✅ Successfully created: ${successCount} licenses`)
    console.log(`❌ Failed to create: ${errorCount} licenses`)
    console.log(`📁 Total processed: ${licenseFiles.length} files`)
    
    if (successCount > 0) {
      console.log('\n🎯 Next Steps:')
      console.log('1. Run "node scripts/test-license-storage.cjs" to test storage functionality')
      console.log('2. Start the application to see the licenses in action')
      console.log('3. Test license management features in the admin interface')
    }
    
  } catch (error) {
    console.error('❌ Population failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the population
populateTestLicenses().catch(console.error)