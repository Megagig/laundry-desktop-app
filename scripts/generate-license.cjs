#!/usr/bin/env node

/**
 * Simple License Generator
 * Automatically generates a license key for your machine
 */

const crypto = require('crypto')

// Your machine ID (from previous script)
const MACHINE_ID = 'e01f56f77a68875ee489a98e98eb1cb4'

// License configuration
const LICENSE_CONFIG = {
  product: 'LaundryPro',
  version: '1.0.0',
  machineId: MACHINE_ID,
  issuedTo: 'Development User',
  email: 'dev@laundrypro.com',
  licenseType: 'LIFETIME',
  issuedAt: new Date().toISOString(),
  expiresAt: null, // null = never expires
  features: ['basic', 'reports', 'backup', 'multi-user', 'advanced'],
  maxUsers: 10,
  licenseId: crypto.randomUUID(),
  vendorId: 'LaundryPro-Vendor'
}

// Create a mock signature (for development - in production this would use RSA)
function createMockSignature(payload) {
  // Create a base64 encoded "signature" that will pass basic validation
  const hash = crypto.createHash('sha256')
    .update(payload + 'development-secret')
    .digest('base64')
  return hash
}

function generateLicense() {
  console.log('🎫 Generating Development License Key...\n')
  
  const payload = JSON.stringify(LICENSE_CONFIG)
  const signature = createMockSignature(payload)
  
  const licenseData = {
    payload: payload,
    signature: signature
  }
  
  const licenseKey = Buffer.from(JSON.stringify(licenseData)).toString('base64')
  
  console.log('✅ DEVELOPMENT LICENSE GENERATED!')
  console.log('=' .repeat(60))
  console.log('📋 License Details:')
  console.log(`   Product: ${LICENSE_CONFIG.product}`)
  console.log(`   Type: ${LICENSE_CONFIG.licenseType}`)
  console.log(`   Machine ID: ${LICENSE_CONFIG.machineId}`)
  console.log(`   Issued To: ${LICENSE_CONFIG.issuedTo}`)
  console.log(`   Max Users: ${LICENSE_CONFIG.maxUsers}`)
  console.log(`   Features: ${LICENSE_CONFIG.features.join(', ')}`)
  console.log('=' .repeat(60))
  console.log('\n🔑 YOUR LICENSE KEY:')
  console.log(`\x1b[32m${licenseKey}\x1b[0m`)
  console.log('\n⚠️  NOTE: This is a development license.')
  console.log('   For production, use the proper license generator.')
  console.log('\n📝 INSTRUCTIONS:')
  console.log('1. Copy the green license key above')
  console.log('2. Go to your application activation screen')
  console.log('3. Paste the license key in the "License Key" field')
  console.log('4. Click "Activate License"')
  console.log('\n🎉 Your application will be activated!')
  
  return licenseKey
}

// Generate the license
generateLicense()