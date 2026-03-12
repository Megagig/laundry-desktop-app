#!/usr/bin/env node

/**
 * Test License Activation
 * Tests the license activation process directly
 */

const { spawn } = require('child_process')
const path = require('path')

// The license key from the generator
const LICENSE_KEY = 'eyJwYXlsb2FkIjoie1wicHJvZHVjdFwiOlwiTGF1bmRyeVByb1wiLFwidmVyc2lvblwiOlwiMS4wLjBcIixcIm1hY2hpbmVJZFwiOlwiZTAxZjU2Zjc3YTY4ODc1ZWU0ODlhOThlOThlYjFjYjRcIixcImlzc3VlZFRvXCI6XCJEZXZlbG9wbWVudCBVc2VyXCIsXCJlbWFpbFwiOlwiZGV2QGxhdW5kcnlwcm8uY29tXCIsXCJsaWNlbnNlVHlwZVwiOlwiTElGRVRJTUVcIixcImlzc3VlZEF0XCI6XCIyMDI2LTAzLTEyVDA4OjMzOjMwLjQyM1pcIixcImV4cGlyZXNBdFwiOm51bGwsXCJmZWF0dXJlc1wiOltcImJhc2ljXCIsXCJyZXBvcnRzXCIsXCJiYWNrdXBcIixcIm11bHRpLXVzZXJcIixcImFkdmFuY2VkXCJdLFwibWF4VXNlcnNcIjoxMCxcImxpY2Vuc2VJZFwiOlwiOGI4ODI2YjQtODdhMi00ZWJlLTk3MGItZjUwMDRmYzM1ZTRiXCIsXCJ2ZW5kb3JJZFwiOlwiTGF1bmRyeVByby1WZW5kb3JcIn0iLCJzaWduYXR1cmUiOiJMOUVYUUdLbVNHYlVFUVJBWnZ4NEhXYS9UWWdsR2JKd1JCb0oxNkdSY1RjPSJ9'

function testLicenseDecoding() {
  console.log('🧪 Testing License Key Decoding...\n')
  
  try {
    // Decode the license key
    const decoded = JSON.parse(Buffer.from(LICENSE_KEY, 'base64').toString())
    console.log('✅ License key decoded successfully!')
    console.log('📋 Decoded structure:')
    console.log('   - Has payload:', !!decoded.payload)
    console.log('   - Has signature:', !!decoded.signature)
    
    // Try to parse the payload
    const payload = JSON.parse(decoded.payload)
    console.log('\n✅ Payload parsed successfully!')
    console.log('📋 License details:')
    console.log(`   - Product: ${payload.product}`)
    console.log(`   - Machine ID: ${payload.machineId}`)
    console.log(`   - License Type: ${payload.licenseType}`)
    console.log(`   - Issued To: ${payload.issuedTo}`)
    console.log(`   - Features: ${payload.features.join(', ')}`)
    
    return true
  } catch (error) {
    console.error('❌ License decoding failed:', error.message)
    return false
  }
}

function testCryptoVerification() {
  console.log('\n🔐 Testing Crypto Verification...\n')
  
  try {
    const crypto = require('crypto')
    const decoded = JSON.parse(Buffer.from(LICENSE_KEY, 'base64').toString())
    
    // Test development signature verification
    const expectedHash = crypto.createHash('sha256')
      .update(decoded.payload + 'development-secret')
      .digest('base64')
    
    const isValid = decoded.signature === expectedHash
    
    if (isValid) {
      console.log('✅ Development signature verification passed!')
    } else {
      console.log('❌ Development signature verification failed!')
      console.log(`   Expected: ${expectedHash}`)
      console.log(`   Got: ${decoded.signature}`)
    }
    
    return isValid
  } catch (error) {
    console.error('❌ Crypto verification failed:', error.message)
    return false
  }
}

async function main() {
  console.log('🎫 License Activation Test\n')
  console.log('=' .repeat(50))
  
  const decodingOk = testLicenseDecoding()
  const cryptoOk = testCryptoVerification()
  
  console.log('\n' + '=' .repeat(50))
  console.log('📊 Test Results:')
  console.log(`   License Decoding: ${decodingOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`   Crypto Verification: ${cryptoOk ? '✅ PASS' : '❌ FAIL'}`)
  
  if (decodingOk && cryptoOk) {
    console.log('\n🎉 All tests passed! License key should work.')
    console.log('\n📝 To activate:')
    console.log('1. Go to the activation page in your app')
    console.log('2. Paste this license key:')
    console.log(`\x1b[32m${LICENSE_KEY}\x1b[0m`)
    console.log('3. Click "Activate License"')
  } else {
    console.log('\n⚠️  Some tests failed. License activation may not work.')
  }
}

main().catch(console.error)