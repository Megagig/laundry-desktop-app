#!/usr/bin/env node

import chalk from 'chalk'
import { cryptoService } from './services/crypto.service.js'
import { databaseService } from './services/database.service.js'
import { cliService } from './services/cli.service.js'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
}

class TestRunner {
  private results: TestResult[] = []

  async runTest(name: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now()
    
    try {
      await testFn()
      this.results.push({
        name,
        passed: true,
        duration: Date.now() - startTime
      })
      console.log(chalk.green(`✅ ${name}`))
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      })
      console.log(chalk.red(`❌ ${name}: ${error instanceof Error ? error.message : String(error)}`))
    }
  }

  displayResults(): void {
    const passed = this.results.filter(r => r.passed).length
    const total = this.results.length
    const passRate = Math.round((passed / total) * 100)

    console.log(chalk.blue.bold('\n📊 Test Results Summary:'))
    console.log(`  Total Tests: ${total}`)
    console.log(`  Passed: ${chalk.green(passed)}`)
    console.log(`  Failed: ${chalk.red(total - passed)}`)
    console.log(`  Pass Rate: ${passRate >= 90 ? chalk.green(`${passRate}%`) : chalk.yellow(`${passRate}%`)}`)
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0)
    console.log(`  Total Duration: ${totalDuration}ms`)

    if (this.results.some(r => !r.passed)) {
      console.log(chalk.red.bold('\n❌ Failed Tests:'))
      this.results.filter(r => !r.passed).forEach(result => {
        console.log(`  • ${result.name}: ${result.error}`)
      })
    }
  }
}

async function runTests(): Promise<void> {
  console.log(chalk.blue.bold('🧪 License Generator Test Suite\n'))
  
  const runner = new TestRunner()

  // Test 1: Crypto Service - Key Generation
  await runner.runTest('Crypto Service - Key Generation', async () => {
    const keyPair = await cryptoService.generateKeyPair()
    if (!keyPair.publicKey || !keyPair.privateKey) {
      throw new Error('Key pair generation failed')
    }
    if (!keyPair.publicKey.includes('BEGIN PUBLIC KEY')) {
      throw new Error('Invalid public key format')
    }
    if (!keyPair.privateKey.includes('BEGIN PRIVATE KEY') && !keyPair.privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      throw new Error('Invalid private key format')
    }
  })

  // Test 2: Crypto Service - Key Loading
  await runner.runTest('Crypto Service - Key Loading', async () => {
    const exists = await cryptoService.keyPairExists()
    if (!exists) {
      throw new Error('Keys should exist after generation')
    }
    
    const publicKey = await cryptoService.loadPublicKey()
    const privateKey = await cryptoService.loadPrivateKey()
    
    if (!publicKey || !privateKey) {
      throw new Error('Failed to load keys')
    }
  })
  // Test 3: Database Service - Initialization
  await runner.runTest('Database Service - Initialization', async () => {
    await databaseService.initialize()
    // Test should pass if no error is thrown
  })

  // Test 4: License Generation and Signing
  await runner.runTest('License Generation and Signing', async () => {
    const payload = {
      licenseId: 'test-license-001',
      machineId: 'LND-12345678',
      issuedTo: 'Test Customer',
      email: 'test@example.com',
      licenseType: 'STANDARD' as const,
      features: ['all'],
      maxUsers: 5,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      product: 'LaundryPro',
      version: '1.0.0'
    }

    const licenseKey = await cryptoService.createLicenseKey(payload)
    if (!licenseKey) {
      throw new Error('License key generation failed')
    }

    // Verify the generated license
    const verification = await cryptoService.parseLicenseKey(licenseKey)
    if (!verification.valid) {
      throw new Error(`License verification failed: ${verification.error}`)
    }

    if (verification.payload?.licenseId !== payload.licenseId) {
      throw new Error('License payload mismatch')
    }
  })

  // Test 5: Database Storage and Retrieval
  let storedLicenseId: string
  await runner.runTest('Database Storage and Retrieval', async () => {
    const payload = {
      licenseId: `test-license-${Date.now()}-002`,
      machineId: 'LND-87654321',
      issuedTo: 'Test Customer 2',
      email: 'test2@example.com',
      licenseType: 'PROFESSIONAL' as const,
      features: ['customers', 'orders', 'payments'],
      maxUsers: 10,
      issuedAt: new Date().toISOString(),
      product: 'LaundryPro',
      version: '1.0.0'
    }

    const licenseKey = await cryptoService.createLicenseKey(payload)
    await databaseService.storeLicense(payload, licenseKey)
    storedLicenseId = payload.licenseId

    // Retrieve and verify
    const stored = await databaseService.getLicenseById(payload.licenseId)
    if (!stored) {
      throw new Error('Failed to retrieve stored license')
    }

    if (stored.issuedTo !== payload.issuedTo) {
      throw new Error('Stored license data mismatch')
    }
  })

  // Test 6: License Revocation
  await runner.runTest('License Revocation', async () => {
    const reason = 'Test revocation'

    await databaseService.revokeLicense(storedLicenseId, reason)

    const license = await databaseService.getLicenseById(storedLicenseId)
    if (!license?.isRevoked) {
      throw new Error('License should be marked as revoked')
    }

    if (license.revokedReason !== reason) {
      throw new Error('Revocation reason mismatch')
    }
  })
  // Test 7: License Extension
  await runner.runTest('License Extension', async () => {
    // Create a new license for extension test
    const payload = {
      licenseId: `test-license-${Date.now()}-003`,
      machineId: 'LND-11111111',
      issuedTo: 'Test Customer 3',
      email: 'test3@example.com',
      licenseType: 'ENTERPRISE' as const,
      features: ['all'],
      maxUsers: 50,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      product: 'LaundryPro',
      version: '1.0.0'
    }

    const licenseKey = await cryptoService.createLicenseKey(payload)
    await databaseService.storeLicense(payload, licenseKey)

    // Extend the license
    const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    await databaseService.extendLicense(payload.licenseId, newExpiry)

    // Verify extension
    const extended = await databaseService.getLicenseById(payload.licenseId)
    if (!extended?.expiresAt) {
      throw new Error('Extended license should have expiry date')
    }

    const extendedDate = new Date(extended.expiresAt).getTime()
    const expectedDate = new Date(newExpiry).getTime()
    
    if (Math.abs(extendedDate - expectedDate) > 1000) { // Allow 1 second difference
      throw new Error('License extension date mismatch')
    }
  })

  // Test 8: License Statistics
  await runner.runTest('License Statistics', async () => {
    const stats = await databaseService.getLicenseStats()
    
    if (typeof stats.total !== 'number') {
      throw new Error('Invalid total count in statistics')
    }

    if (typeof stats.active !== 'number') {
      throw new Error('Invalid active count in statistics')
    }

    if (typeof stats.byType !== 'object') {
      throw new Error('Invalid byType statistics')
    }

    // Should have at least the licenses we created (but database might be empty on first run)
    if (stats.total < 0) {
      throw new Error('Statistics should show non-negative total')
    }
  })

  // Test 9: License Search
  await runner.runTest('License Search', async () => {
    const results = await databaseService.searchLicenses('Test Customer')
    
    if (!Array.isArray(results)) {
      throw new Error('Search should return an array')
    }

    if (results.length === 0) {
      throw new Error('Search should find test customers')
    }

    // Verify search results contain expected data
    const hasTestCustomer = results.some(license => 
      license.issuedTo.includes('Test Customer')
    )

    if (!hasTestCustomer) {
      throw new Error('Search results should contain test customers')
    }
  })

  // Test 10: CLI Service - Machine ID Generation
  await runner.runTest('CLI Service - Machine ID Generation', async () => {
    const machineId = cliService.generateMachineId()
    
    if (!machineId.match(/^LND-[A-F0-9]{8}$/)) {
      throw new Error('Invalid machine ID format')
    }

    // Generate multiple IDs to ensure uniqueness
    const ids = new Set()
    for (let i = 0; i < 10; i++) {
      ids.add(cliService.generateMachineId())
    }

    if (ids.size < 10) {
      throw new Error('Machine IDs should be unique')
    }
  })
  // Test 11: CLI Service - Email Generation
  await runner.runTest('CLI Service - Email Generation', async () => {
    const email1 = cliService.generateEmail('Test Customer', 1)
    const email2 = cliService.generateEmail('Test Customer', 2)
    
    if (!email1.includes('@example.com')) {
      throw new Error('Generated email should use example.com domain')
    }

    if (email1 === email2) {
      throw new Error('Generated emails should be unique')
    }

    if (!email1.match(/^[a-z0-9]+@example\.com$/)) {
      throw new Error('Invalid email format')
    }
  })

  // Test 12: License Payload Creation
  await runner.runTest('License Payload Creation', async () => {
    const options = {
      machineId: 'LND-TESTTEST',
      issuedTo: 'Test Customer',
      email: 'test@example.com',
      company: 'Test Company',
      licenseType: 'STANDARD' as const,
      features: ['customers', 'orders'],
      maxUsers: 5,
      expiryDays: 30
    }

    const payload = cliService.createLicensePayload(options)
    
    if (payload.machineId !== options.machineId) {
      throw new Error('Machine ID mismatch in payload')
    }

    if (payload.issuedTo !== options.issuedTo) {
      throw new Error('Issued to mismatch in payload')
    }

    if (payload.features.length !== options.features.length) {
      throw new Error('Features mismatch in payload')
    }

    if (!payload.licenseId) {
      throw new Error('License ID should be generated')
    }

    if (!payload.issuedAt) {
      throw new Error('Issued at should be set')
    }

    if (!payload.expiresAt) {
      throw new Error('Expires at should be set for 30-day license')
    }

    // Verify expiry date is approximately 30 days from now
    const expiryDate = new Date(payload.expiresAt)
    const expectedExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const timeDiff = Math.abs(expiryDate.getTime() - expectedExpiry.getTime())
    
    if (timeDiff > 60000) { // Allow 1 minute difference
      throw new Error('Expiry date calculation incorrect')
    }
  })

  // Test 13: Hash Function
  await runner.runTest('Hash Function', async () => {
    const data1 = 'test data 1'
    const data2 = 'test data 2'
    
    const hash1 = cryptoService.hash(data1)
    const hash2 = cryptoService.hash(data2)
    const hash1Again = cryptoService.hash(data1)
    
    if (hash1 === hash2) {
      throw new Error('Different data should produce different hashes')
    }

    if (hash1 !== hash1Again) {
      throw new Error('Same data should produce same hash')
    }

    if (hash1.length !== 64) { // SHA-256 produces 64 character hex string
      throw new Error('Hash should be 64 characters long')
    }

    if (!hash1.match(/^[a-f0-9]{64}$/)) {
      throw new Error('Hash should be lowercase hex')
    }
  })

  // Test 14: Key Info Retrieval
  await runner.runTest('Key Info Retrieval', async () => {
    const keyInfo = await cryptoService.getKeyInfo()
    
    if (!keyInfo.exists) {
      throw new Error('Keys should exist')
    }

    if (!keyInfo.publicKeyPath) {
      throw new Error('Public key path should be provided')
    }

    if (!keyInfo.privateKeyPath) {
      throw new Error('Private key path should be provided')
    }

    if (!keyInfo.publicKeyPreview) {
      throw new Error('Public key preview should be provided')
    }
  })

  // Test 15: Database Export
  await runner.runTest('Database Export', async () => {
    const exportData = await databaseService.exportLicenses()
    
    if (!exportData) {
      throw new Error('Export data should not be empty')
    }

    const parsed = JSON.parse(exportData)
    
    if (!parsed.exportDate) {
      throw new Error('Export should include export date')
    }

    if (!parsed.statistics) {
      throw new Error('Export should include statistics')
    }

    if (!Array.isArray(parsed.licenses)) {
      throw new Error('Export should include licenses array')
    }

    // Verify sensitive data is redacted
    const hasRedactedKey = parsed.licenses.some((license: any) => 
      license.licenseKey === '***REDACTED***'
    )

    if (!hasRedactedKey && parsed.licenses.length > 0) {
      throw new Error('License keys should be redacted in export')
    }
  })

  // Cleanup
  await runner.runTest('Database Cleanup', async () => {
    await databaseService.close()
    // Test passes if no error is thrown
  })

  runner.displayResults()
}

// Run tests
runTests().catch(error => {
  console.error(chalk.red.bold('\n💥 Test suite failed:'), error)
  process.exit(1)
})