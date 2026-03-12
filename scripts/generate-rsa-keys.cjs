/**
 * RSA Key Pair Generation Script
 * 
 * IMPORTANT: This script is for VENDOR USE ONLY
 * DO NOT include this in the distributed application!
 * 
 * This script generates RSA-2048 key pairs for license signing.
 * The private key must be kept secure and never distributed.
 * The public key is embedded in the application for signature verification.
 */

const forge = require('node-forge')
const fs = require('fs')
const path = require('path')

console.log('🔐 Generating RSA-2048 Key Pair for License Signing...\n')

// Generate RSA key pair
console.log('⏳ Generating keys (this may take a moment)...')
const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048 })

// Convert to PEM format
const publicKeyPem = forge.pki.publicKeyToPem(keypair.publicKey)
const privateKeyPem = forge.pki.privateKeyToPem(keypair.privateKey)

// Create keys directory if it doesn't exist
const keysDir = path.join(__dirname, '..', 'keys')
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true })
}

// Save keys to files
const publicKeyPath = path.join(keysDir, 'public-key.pem')
const privateKeyPath = path.join(keysDir, 'private-key.pem')

fs.writeFileSync(publicKeyPath, publicKeyPem)
fs.writeFileSync(privateKeyPath, privateKeyPem)

console.log('✅ Keys generated successfully!\n')

console.log('📁 Files created:')
console.log(`   Public Key:  ${publicKeyPath}`)
console.log(`   Private Key: ${privateKeyPath}\n`)

console.log('🔒 SECURITY WARNINGS:')
console.log('   1. Keep the private key SECURE and NEVER distribute it')
console.log('   2. The private key should be stored in a secure location')
console.log('   3. Consider encrypting the private key with a passphrase')
console.log('   4. Add keys/ directory to .gitignore to prevent accidental commits')
console.log('   5. Only the public key should be embedded in the application\n')

console.log('📋 Next Steps:')
console.log('   1. Copy the public key content to crypto.service.ts')
console.log('   2. Store the private key securely (NOT in the repository)')
console.log('   3. Use the private key in the license generator tool')
console.log('   4. Delete the keys/ directory after copying the keys\n')

// Display public key for easy copying
console.log('📄 Public Key (copy this to crypto.service.ts):')
console.log('─'.repeat(60))
console.log(publicKeyPem)
console.log('─'.repeat(60))

// Add to .gitignore
const gitignorePath = path.join(__dirname, '..', '.gitignore')
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8')
  if (!gitignoreContent.includes('keys/')) {
    fs.appendFileSync(gitignorePath, '\n# RSA Keys (NEVER commit these)\nkeys/\n')
    console.log('✅ Added keys/ to .gitignore')
  }
}

console.log('\n🎯 Key generation complete!')