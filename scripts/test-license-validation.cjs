/**
 * Test License Validation
 * 
 * This script tests the license validation functionality
 * using the generated sample licenses.
 */

const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

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
 * Verify license signature (same logic as crypto.service.ts)
 */
function verifySignature(data, signature) {
  try {
    // Load public key
    const publicKey = forge.pki.publicKeyFromPem(PUBLIC_KEY)
    
    // Create SHA-256 hash of data
    const md = forge.md.sha256.create()
    md.update(data, 'utf8')
    
    // Decode signature from base64
    const signatureBytes = forge.util.decode64(signature)
    
    // Verify signature
    const verified = publicKey.verify(md.digest().bytes(), signatureBytes)
    
    return verified
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}

/**
 * Verify complete license key
 */
function verifyLicenseKey(licenseKey) {
  try {
    // Decode license key from base64
    const decoded = JSON.parse(Buffer.from(licenseKey, 'base64').toString())
    
    if (!decoded.payload || !decoded.signature) {
      return {
        valid: false,
        error: 'Invalid license key format: missing payload or signature'
      }
    }

    // Verify signature
    const signatureValid = verifySignature(decoded.payload, decoded.signature)
    
    if (!signatureValid) {
      return {
        valid: false,
        error: 'Invalid license signature'
      }
    }

    // Parse payload
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
 * Test all sample licenses
 */
function testLicenses() {
  console.log('🔐 Testing License Validation...\n')
  
  const licensesDir = path.join(__dirname, '..', 'sample-licenses')
  
  if (!fs.existsSync(licensesDir)) {
    console.error('❌ Sample licenses directory not found. Run create-sample-license.cjs first.')
    return
  }
  
  const licenseFiles = fs.readdirSync(licensesDir).filter(file => file.endsWith('.txt'))
  
  if (licenseFiles.length === 0) {
    console.error('❌ No license files found in sample-licenses directory.')
    return
  }
  
  licenseFiles.forEach(filename => {
    console.log(`📄 Testing ${filename}...`)
    
    const filePath = path.join(licensesDir, filename)
    const licenseKey = extractLicenseKey(filePath)
    
    if (!licenseKey) {
      console.log('   ❌ Could not extract license key from file')
      return
    }
    
    const result = verifyLicenseKey(licenseKey)
    
    if (result.valid) {
      console.log('   ✅ License signature is VALID')
      console.log(`   📋 Issued To: ${result.payload.issuedTo}`)
      console.log(`   📋 Type: ${result.payload.licenseType}`)
      console.log(`   📋 Machine ID: ${result.payload.machineId}`)
      console.log(`   📋 Features: ${result.payload.features.join(', ')}`)
      console.log(`   📋 Expires: ${result.payload.expiresAt ? new Date(result.payload.expiresAt).toLocaleDateString() : 'Never'}`)
    } else {
      console.log('   ❌ License signature is INVALID')
      console.log(`   📋 Error: ${result.error}`)
    }
    
    console.log('')
  })
  
  console.log('🎯 License validation testing complete!')
}

// Run the tests
testLicenses()