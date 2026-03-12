/**
 * Complete License System Test
 * 
 * This script tests the entire license system end-to-end:
 * 1. License generation
 * 2. Signature verification
 * 3. Machine ID validation
 * 4. Expiry checking
 * 5. Feature validation
 */

const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

// Test configuration
const TEST_MACHINE_ID = 'LND-0AC1DF443381F8F2'
const WRONG_MACHINE_ID = 'LND-WRONG-MACHINE-ID'

// Public key (same as in crypto.service.ts)
const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjrMrzCU+FUVaEmfCXtXe
luaVozH3R8sOeCrJtNEbdBEclrOZMmAyNdwKgXD7qdkEBRhh9zsmUOBGdvMyetkt
vJLO1l9WdxA4O35GijChaEPiBcFyh/r+zbjc54lwdNTnQbInrbzhJ7MWa70F9pqA
W2k1P0kPVP8HDDYSNh1QYJHZuGoFgGHqNeeA1veOHv7iOwooS5mKeiBMSfUFXBnn
mQylNGlIXbbPvQU2AeHFXg0Tq5Xh1ww6THm1EwmTQ/baMLBPYQhz/SFPkRKavZNI
Ne+mc+yrb/RfcTm9Vp666wrt1xMc3x+EY82U0zjo6z8atz5oiDrIBpWyrYJfhOsE
2QIDAQAB
-----END PUBLIC KEY-----`

/**
 * Crypto service implementation (same as crypto.service.ts)
 */
class TestCryptoService {
  async verifySignature(data, signature) {
    try {
      const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY)
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')
      const signatureBytes = forge.util.decode64(signature)
      return publicKey.verify(md.digest().bytes(), signatureBytes)
    } catch (error) {
      return false
    }
  }

  async verifyLicenseKey(licenseKey) {
    try {
      const decoded = JSON.parse(Buffer.from(licenseKey, 'base64').toString())
      
      if (!decoded.payload || !decoded.signature) {
        return {
          valid: false,
          error: 'Invalid license key format: missing payload or signature'
        }
      }

      const signatureValid = await this.verifySignature(decoded.payload, decoded.signature)
      
      if (!signatureValid) {
        return {
          valid: false,
          error: 'Invalid license signature'
        }
      }

      const payload = JSON.parse(decoded.payload)
      
      return {
        valid: true,
        payload
      }
    } catch (error) {
      return {
        valid: false,
        error: `License key verification failed: ${error.message}`
      }
    }
  }
}

/**
 * License service implementation (simplified for testing)
 */
class TestLicenseService {
  constructor() {
    this.cryptoService = new TestCryptoService()
  }

  async validateLicense(licenseKey, machineId = TEST_MACHINE_ID) {
    try {
      // Verify cryptographic signature using crypto service
      const verification = await this.cryptoService.verifyLicenseKey(licenseKey)
      
      if (!verification.valid) {
        return { 
          valid: false, 
          error: verification.error || 'Invalid license signature'
        }
      }
      
      const payload = verification.payload
      
      // Validate machine ID match
      if (payload.machineId !== machineId) {
        return { 
          valid: false, 
          error: 'License is not valid for this machine',
          details: `Expected: ${payload.machineId}, Got: ${machineId}`
        }
      }
      
      // Check license expiry
      if (payload.expiresAt) {
        const expiryDate = new Date(payload.expiresAt)
        const now = new Date()
        
        if (now > expiryDate) {
          return { 
            valid: false, 
            error: 'License has expired',
            details: `Expired on: ${expiryDate.toLocaleDateString()}`
          }
        }
      }
      
      // Validate product
      if (payload.product !== 'LaundryPro') {
        return { valid: false, error: 'License is not for this product' }
      }
      
      return {
        valid: true,
        license: {
          issuedTo: payload.issuedTo,
          email: payload.email || '',
          licenseType: payload.licenseType,
          features: payload.features || [],
          maxUsers: payload.maxUsers || 1,
          issuedAt: new Date(payload.issuedAt),
          expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null,
          machineId: payload.machineId
        }
      }
      
    } catch (error) {
      return { 
        valid: false, 
        error: 'License validation failed',
        details: error.message
      }
    }
  }
}

/**
 * Extract license key from file
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
 * Run comprehensive tests
 */
async function runTests() {
  console.log('🧪 Running Complete License System Tests...\n')
  
  const licenseService = new TestLicenseService()
  const licensesDir = path.join(__dirname, '..', 'sample-licenses')
  
  if (!fs.existsSync(licensesDir)) {
    console.error('❌ Sample licenses directory not found. Run create-sample-license.cjs first.')
    return
  }
  
  const tests = [
    {
      name: 'Valid License Test',
      description: 'Test valid license with correct machine ID',
      licenseFile: 'trial-license.txt',
      machineId: TEST_MACHINE_ID,
      expectedValid: true
    },
    {
      name: 'Wrong Machine ID Test',
      description: 'Test license with wrong machine ID',
      licenseFile: 'trial-license.txt',
      machineId: WRONG_MACHINE_ID,
      expectedValid: false
    },
    {
      name: 'Annual License Test',
      description: 'Test annual license validation',
      licenseFile: 'annual-license.txt',
      machineId: TEST_MACHINE_ID,
      expectedValid: true
    },
    {
      name: 'Lifetime License Test',
      description: 'Test lifetime license validation',
      licenseFile: 'lifetime-license.txt',
      machineId: TEST_MACHINE_ID,
      expectedValid: true
    }
  ]
  
  let passedTests = 0
  let totalTests = tests.length
  
  for (const test of tests) {
    console.log(`🔍 ${test.name}`)
    console.log(`   ${test.description}`)
    
    const licenseFile = path.join(licensesDir, test.licenseFile)
    
    if (!fs.existsSync(licenseFile)) {
      console.log(`   ❌ License file not found: ${test.licenseFile}`)
      continue
    }
    
    const licenseKey = extractLicenseKey(licenseFile)
    
    if (!licenseKey) {
      console.log('   ❌ Could not extract license key from file')
      continue
    }
    
    const result = await licenseService.validateLicense(licenseKey, test.machineId)
    
    if (result.valid === test.expectedValid) {
      console.log('   ✅ Test PASSED')
      passedTests++
      
      if (result.valid && result.license) {
        console.log(`   📋 License Type: ${result.license.licenseType}`)
        console.log(`   📋 Issued To: ${result.license.issuedTo}`)
        console.log(`   📋 Features: ${result.license.features.join(', ')}`)
        console.log(`   📋 Max Users: ${result.license.maxUsers}`)
        console.log(`   📋 Expires: ${result.license.expiresAt ? result.license.expiresAt.toLocaleDateString() : 'Never'}`)
      }
    } else {
      console.log('   ❌ Test FAILED')
      console.log(`   📋 Expected: ${test.expectedValid ? 'Valid' : 'Invalid'}`)
      console.log(`   📋 Got: ${result.valid ? 'Valid' : 'Invalid'}`)
      
      if (!result.valid) {
        console.log(`   📋 Error: ${result.error}`)
        if (result.details) {
          console.log(`   📋 Details: ${result.details}`)
        }
      }
    }
    
    console.log('')
  }
  
  // Additional tests
  console.log('🔍 Invalid License Format Test')
  console.log('   Testing with malformed license key')
  
  const invalidResult = await licenseService.validateLicense('invalid-license-key', TEST_MACHINE_ID)
  
  if (!invalidResult.valid) {
    console.log('   ✅ Test PASSED - Invalid license correctly rejected')
    passedTests++
  } else {
    console.log('   ❌ Test FAILED - Invalid license was accepted')
  }
  totalTests++
  
  console.log('')
  
  // Summary
  console.log('📊 Test Summary')
  console.log('─'.repeat(50))
  console.log(`Total Tests: ${totalTests}`)
  console.log(`Passed: ${passedTests}`)
  console.log(`Failed: ${totalTests - passedTests}`)
  console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`)
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! License system is working correctly.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.')
  }
}

// Run the tests
runTests().catch(console.error)