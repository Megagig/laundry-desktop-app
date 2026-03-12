#!/usr/bin/env node

/**
 * Test License Service Directly
 * Tests the license service validation logic
 */

const path = require('path')

// Mock the environment for testing
process.env.NODE_ENV = 'development'

async function testLicenseService() {
  console.log('🧪 Testing License Service...\n')
  
  try {
    // Import the crypto service (we need to use dynamic import for ES modules)
    const { cryptoService } = await import('../dist/electron/services/crypto.service.js')
    
    const LICENSE_KEY = 'eyJwYXlsb2FkIjoie1wicHJvZHVjdFwiOlwiTGF1bmRyeVByb1wiLFwidmVyc2lvblwiOlwiMS4wLjBcIixcIm1hY2hpbmVJZFwiOlwiZTAxZjU2Zjc3YTY4ODc1ZWU0ODlhOThlOThlYjFjYjRcIixcImlzc3VlZFRvXCI6XCJEZXZlbG9wbWVudCBVc2VyXCIsXCJlbWFpbFwiOlwiZGV2QGxhdW5kcnlwcm8uY29tXCIsXCJsaWNlbnNlVHlwZVwiOlwiTElGRVRJTUVcIixcImlzc3VlZEF0XCI6XCIyMDI2LTAzLTEyVDA4OjMzOjMwLjQyM1pcIixcImV4cGlyZXNBdFwiOm51bGwsXCJmZWF0dXJlc1wiOltcImJhc2ljXCIsXCJyZXBvcnRzXCIsXCJiYWNrdXBcIixcIm11bHRpLXVzZXJcIixcImFkdmFuY2VkXCJdLFwibWF4VXNlcnNcIjoxMCxcImxpY2Vuc2VJZFwiOlwiOGI4ODI2YjQtODdhMi00ZWJlLTk3MGItZjUwMDRmYzM1ZTRiXCIsXCJ2ZW5kb3JJZFwiOlwiTGF1bmRyeVByby1WZW5kb3JcIn0iLCJzaWduYXR1cmUiOiJMOUVYUUdLbVNHYlVFUVJBWnZ4NEhXYS9UWWdsR2JKd1JCb0oxNkdSY1RjPSJ9'
    
    console.log('🔐 Testing crypto service verification...')
    const result = await cryptoService.verifyLicenseKey(LICENSE_KEY)
    
    if (result.valid) {
      console.log('✅ License verification successful!')
      console.log('📋 License payload:')
      console.log(`   Product: ${result.payload.product}`)
      console.log(`   Machine ID: ${result.payload.machineId}`)
      console.log(`   License Type: ${result.payload.licenseType}`)
      console.log(`   Issued To: ${result.payload.issuedTo}`)
      console.log(`   Features: ${result.payload.features.join(', ')}`)
    } else {
      console.log('❌ License verification failed!')
      console.log(`   Error: ${result.error}`)
    }
    
    return result.valid
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Stack:', error.stack)
    return false
  }
}

testLicenseService().then(success => {
  console.log('\n' + '='.repeat(50))
  console.log(`📊 Test Result: ${success ? '✅ PASS' : '❌ FAIL'}`)
  
  if (success) {
    console.log('\n🎉 License service is working correctly!')
    console.log('The license key should activate successfully in the app.')
  } else {
    console.log('\n⚠️  License service test failed.')
    console.log('There may be an issue with the license verification logic.')
  }
}).catch(console.error)