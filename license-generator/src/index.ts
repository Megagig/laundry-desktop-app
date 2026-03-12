#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import { cryptoService } from './services/crypto.service.js'
import { databaseService } from './services/database.service.js'
import { cliService } from './services/cli.service.js'
import type { StoredLicense } from './services/database.service.js'

const program = new Command()

// CLI Header
function displayHeader() {
  console.log(chalk.blue.bold('\n🎫 LaundryPro License Generator'))
  console.log(chalk.gray('Internal tool for license generation and management'))
  console.log(chalk.red.bold('⚠️  FOR VENDOR USE ONLY - DO NOT DISTRIBUTE\n'))
}

// Initialize services
async function initializeServices(): Promise<void> {
  try {
    await databaseService.initialize()
  } catch (error) {
    console.error(chalk.red('Failed to initialize services:'), error)
    process.exit(1)
  }
}

// Cleanup services
async function cleanup(): Promise<void> {
  try {
    await databaseService.close()
  } catch (error) {
    console.error(chalk.red('Cleanup error:'), error)
  }
}

// Generate RSA key pair
async function generateKeys(): Promise<void> {
  displayHeader()
  
  try {
    const exists = await cryptoService.keyPairExists()
    
    if (exists) {
      const confirmed = await cliService.confirmAction(
        'RSA key pair already exists. Generate new keys? (This will overwrite existing keys)'
      )
      
      if (!confirmed) {
        cliService.displayInfo('Key generation cancelled.')
        return
      }
    }

    await cryptoService.generateKeyPair()
    cliService.displaySuccess('RSA key pair generated successfully!')
    
    const keyInfo = await cryptoService.getKeyInfo()
    if (keyInfo.exists) {
      console.log(chalk.cyan('\nKey Information:'))
      console.log(`  Public Key: ${keyInfo.publicKeyPath}`)
      console.log(`  Private Key: ${keyInfo.privateKeyPath}`)
      console.log(chalk.yellow('\n⚠️  CRITICAL SECURITY WARNINGS:'))
      console.log(chalk.yellow('   • Keep the private key secure and never share it'))
      console.log(chalk.yellow('   • Back up the private key in a secure location'))
      console.log(chalk.yellow('   • The public key should be embedded in the application'))
    }
    
  } catch (error) {
    cliService.displayError('Failed to generate keys', error as Error)
  }
}

// Generate single license
async function generateLicense(): Promise<void> {
  displayHeader()
  
  try {
    // Check if keys exist
    const keyExists = await cryptoService.keyPairExists()
    if (!keyExists) {
      cliService.displayError('RSA keys not found. Please run "npm run license:keys" first.')
      return
    }

    // Get license details from user
    const options = await cliService.promptLicenseGeneration()
    
    // Create license payload
    const payload = cliService.createLicensePayload(options)
    
    // Generate license key
    const licenseKey = await cryptoService.createLicenseKey(payload)
    
    // Store in database
    await databaseService.storeLicense(payload, licenseKey)
    
    // Display results
    cliService.displayLicenseInfo(payload, licenseKey)
    
  } catch (error) {
    cliService.displayError('Failed to generate license', error as Error)
  }
}

// Verify license
async function verifyLicense(licenseKey?: string): Promise<void> {
  displayHeader()
  
  try {
    // Check if keys exist
    const keyExists = await cryptoService.keyPairExists()
    if (!keyExists) {
      cliService.displayError('RSA keys not found. Please run "npm run license:keys" first.')
      return
    }

    // Get license key if not provided
    if (!licenseKey) {
      const answer = await cliService.promptLicenseId('Enter license key to verify:')
      licenseKey = answer
    }

    // Parse and verify license
    const result = await cryptoService.parseLicenseKey(licenseKey)
    
    if (!result.valid) {
      cliService.displayError(`License verification failed: ${result.error}`)
      return
    }

    const payload = result.payload!
    
    // Display verification results
    console.log(chalk.green.bold('\n✅ License Verification Successful!\n'))
    
    console.log(chalk.cyan('License Details:'))
    console.log(`  License ID: ${chalk.white(payload.licenseId)}`)
    console.log(`  Machine ID: ${chalk.white(payload.machineId)}`)
    console.log(`  Issued To: ${chalk.white(payload.issuedTo)}`)
    console.log(`  Email: ${chalk.white(payload.email)}`)
    if (payload.company) {
      console.log(`  Company: ${chalk.white(payload.company)}`)
    }
    console.log(`  License Type: ${chalk.white(payload.licenseType)}`)
    console.log(`  Features: ${chalk.white(payload.features.join(', '))}`)
    console.log(`  Max Users: ${chalk.white(payload.maxUsers)}`)
    console.log(`  Product: ${chalk.white(payload.product)} v${chalk.white(payload.version)}`)
    console.log(`  Issued At: ${chalk.white(new Date(payload.issuedAt).toLocaleString())}`)
    
    if (payload.expiresAt) {
      const expiryDate = new Date(payload.expiresAt)
      const now = new Date()
      const isExpired = now > expiryDate
      const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      
      console.log(`  Expires At: ${chalk.white(expiryDate.toLocaleString())}`)
      
      if (isExpired) {
        console.log(`  Status: ${chalk.red('EXPIRED')} (${Math.abs(daysRemaining)} days ago)`)
      } else {
        console.log(`  Status: ${chalk.green('ACTIVE')} (${daysRemaining} days remaining)`)
      }
    } else {
      console.log(`  Expires At: ${chalk.white('Never (Lifetime)')}`)
      console.log(`  Status: ${chalk.green('ACTIVE (Lifetime)')}`)
    }

    // Check if license exists in database
    const storedLicense = await databaseService.getLicenseById(payload.licenseId)
    if (storedLicense) {
      console.log(chalk.cyan('\nDatabase Status:'))
      console.log(`  Stored: ${chalk.green('Yes')}`)
      console.log(`  Revoked: ${storedLicense.isRevoked ? chalk.red('Yes') : chalk.green('No')}`)
      if (storedLicense.isRevoked) {
        console.log(`  Revoked At: ${chalk.white(new Date(storedLicense.revokedAt!).toLocaleString())}`)
        console.log(`  Revocation Reason: ${chalk.white(storedLicense.revokedReason)}`)
      }
    } else {
      console.log(chalk.cyan('\nDatabase Status:'))
      console.log(`  Stored: ${chalk.yellow('No (External license)')}`)
    }
    
  } catch (error) {
    cliService.displayError('Failed to verify license', error as Error)
  }
}

// List all licenses
async function listLicenses(): Promise<void> {
  displayHeader()
  
  try {
    const licenses = await databaseService.getAllLicenses()
    const stats = await databaseService.getLicenseStats()
    
    // Display statistics
    console.log(chalk.cyan.bold('📊 License Statistics:\n'))
    console.log(`  Total Licenses: ${chalk.white(stats.total)}`)
    console.log(`  Active: ${chalk.green(stats.active)}`)
    console.log(`  Expired: ${chalk.yellow(stats.expired)}`)
    console.log(`  Revoked: ${chalk.red(stats.revoked)}`)
    
    if (Object.keys(stats.byType).length > 0) {
      console.log(chalk.cyan('\n  By Type:'))
      Object.entries(stats.byType).forEach(([type, count]) => {
        console.log(`    ${type}: ${chalk.white(count)}`)
      })
    }

    if (licenses.length === 0) {
      cliService.displayInfo('No licenses found in database.')
      return
    }

    // Display licenses
    console.log(chalk.cyan.bold('\n📋 All Licenses:\n'))
    
    licenses.forEach((license, index) => {
      const status = getStatusDisplay(license)
      const expiryInfo = getExpiryDisplay(license)
      
      console.log(`${chalk.gray(`${index + 1}.`)} ${chalk.white(license.issuedTo)} ${chalk.gray(`(${license.email})`)}`)
      console.log(`   License ID: ${chalk.gray(license.licenseId)}`)
      console.log(`   Machine ID: ${chalk.gray(license.machineId)}`)
      console.log(`   Type: ${chalk.white(license.licenseType)} | Users: ${chalk.white(license.maxUsers)} | ${status}`)
      console.log(`   ${expiryInfo}`)
      if (license.company) {
        console.log(`   Company: ${chalk.gray(license.company)}`)
      }
      console.log(`   Created: ${chalk.gray(new Date(license.createdAt).toLocaleString())}`)
      if (license.isRevoked) {
        console.log(`   ${chalk.red('Revoked:')} ${chalk.gray(license.revokedReason)} (${new Date(license.revokedAt!).toLocaleString()})`)
      }
      console.log()
    })
    
  } catch (error) {
    cliService.displayError('Failed to list licenses', error as Error)
  }
}

// Revoke license
async function revokeLicense(licenseId?: string): Promise<void> {
  displayHeader()
  
  try {
    // Get license ID if not provided
    if (!licenseId) {
      licenseId = await cliService.promptLicenseId('Enter license ID to revoke:')
    }

    // Check if license exists
    const license = await databaseService.getLicenseById(licenseId)
    if (!license) {
      cliService.displayError('License not found in database.')
      return
    }

    if (license.isRevoked) {
      cliService.displayWarning('License is already revoked.')
      console.log(`  Revoked At: ${new Date(license.revokedAt!).toLocaleString()}`)
      console.log(`  Reason: ${license.revokedReason}`)
      return
    }

    // Display license info
    console.log(chalk.cyan('\nLicense to revoke:'))
    console.log(`  Issued To: ${chalk.white(license.issuedTo)}`)
    console.log(`  Email: ${chalk.white(license.email)}`)
    console.log(`  Type: ${chalk.white(license.licenseType)}`)
    console.log(`  Machine ID: ${chalk.white(license.machineId)}`)

    // Confirm revocation
    const confirmed = await cliService.confirmAction('Are you sure you want to revoke this license?')
    if (!confirmed) {
      cliService.displayInfo('License revocation cancelled.')
      return
    }

    // Get revocation reason
    const reason = await cliService.promptRevocationReason()

    // Revoke license
    await databaseService.revokeLicense(licenseId, reason)
    
    cliService.displaySuccess(`License revoked successfully!`)
    console.log(`  License ID: ${licenseId}`)
    console.log(`  Reason: ${reason}`)
    console.log(`  Revoked At: ${new Date().toLocaleString()}`)
    
  } catch (error) {
    cliService.displayError('Failed to revoke license', error as Error)
  }
}

// Extend license
async function extendLicense(licenseId?: string, newExpiry?: string): Promise<void> {
  displayHeader()
  
  try {
    // Get license ID if not provided
    if (!licenseId) {
      licenseId = await cliService.promptLicenseId('Enter license ID to extend:')
    }

    // Check if license exists
    const license = await databaseService.getLicenseById(licenseId)
    if (!license) {
      cliService.displayError('License not found in database.')
      return
    }

    if (license.isRevoked) {
      cliService.displayError('Cannot extend a revoked license.')
      return
    }

    // Display current license info
    console.log(chalk.cyan('\nCurrent license:'))
    console.log(`  Issued To: ${chalk.white(license.issuedTo)}`)
    console.log(`  Email: ${chalk.white(license.email)}`)
    console.log(`  Type: ${chalk.white(license.licenseType)}`)
    console.log(`  Current Expiry: ${license.expiresAt ? chalk.white(new Date(license.expiresAt).toLocaleString()) : chalk.white('Never (Lifetime)')}`)

    // Get new expiry date if not provided
    if (!newExpiry) {
      newExpiry = await cliService.promptNewExpiryDate()
    }

    // Confirm extension
    const newExpiryDisplay = newExpiry ? new Date(newExpiry).toLocaleString() : 'Never (Lifetime)'
    const confirmed = await cliService.confirmAction(`Extend license expiry to: ${newExpiryDisplay}?`)
    if (!confirmed) {
      cliService.displayInfo('License extension cancelled.')
      return
    }

    // Extend license
    await databaseService.extendLicense(licenseId, newExpiry || '')
    
    cliService.displaySuccess('License extended successfully!')
    console.log(`  License ID: ${licenseId}`)
    console.log(`  New Expiry: ${newExpiryDisplay}`)
    
  } catch (error) {
    cliService.displayError('Failed to extend license', error as Error)
  }
}

// Batch generate licenses
async function batchGenerate(): Promise<void> {
  displayHeader()
  
  try {
    // Check if keys exist
    const keyExists = await cryptoService.keyPairExists()
    if (!keyExists) {
      cliService.displayError('RSA keys not found. Please run "npm run license:keys" first.')
      return
    }

    // Get batch options
    const options = await cliService.promptBatchGeneration()
    
    // Confirm batch generation
    const confirmed = await cliService.confirmAction(
      `Generate ${options.count} ${options.licenseType} licenses?`
    )
    if (!confirmed) {
      cliService.displayInfo('Batch generation cancelled.')
      return
    }

    console.log(chalk.blue(`\n🔄 Generating ${options.count} licenses...\n`))
    
    const results = []
    
    for (let i = 1; i <= options.count; i++) {
      try {
        // Generate unique details for each license
        const machineId = cliService.generateMachineId()
        const customerName = `${options.prefix} ${i.toString().padStart(3, '0')}`
        const email = cliService.generateEmail(options.prefix || 'customer', i)
        
        // Create license payload
        const payload = cliService.createLicensePayload({
          machineId,
          issuedTo: customerName,
          email,
          licenseType: options.licenseType,
          features: options.features,
          maxUsers: options.maxUsers,
          expiryDays: options.expiryDays
        })
        
        // Generate license key
        const licenseKey = await cryptoService.createLicenseKey(payload)
        
        // Store in database
        await databaseService.storeLicense(payload, licenseKey)
        
        results.push({ payload, licenseKey })
        
        // Progress indicator
        if (i % 10 === 0 || i === options.count) {
          console.log(chalk.gray(`  Generated ${i}/${options.count} licenses...`))
        }
        
      } catch (error) {
        console.log(chalk.red(`  Failed to generate license ${i}: ${error instanceof Error ? error.message : String(error)}`))
      }
    }
    
    cliService.displaySuccess(`Batch generation complete! Generated ${results.length}/${options.count} licenses.`)
    
    // Export results to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `batch-licenses-${timestamp}.json`
    
    const exportData = {
      generatedAt: new Date().toISOString(),
      options,
      count: results.length,
      licenses: results.map(({ payload, licenseKey }) => ({
        licenseId: payload.licenseId,
        machineId: payload.machineId,
        issuedTo: payload.issuedTo,
        email: payload.email,
        licenseType: payload.licenseType,
        licenseKey
      }))
    }
    
    const fs = await import('fs')
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2))
    
    console.log(chalk.cyan(`\n📄 License details exported to: ${filename}`))
    console.log(chalk.gray('⚠️  Keep this file secure and do not share publicly.'))
    
  } catch (error) {
    cliService.displayError('Failed to generate batch licenses', error as Error)
  }
}

// Helper functions
function getStatusDisplay(license: StoredLicense): string {
  if (license.isRevoked) {
    return chalk.red('REVOKED')
  }
  
  if (license.expiresAt) {
    const now = new Date()
    const expiry = new Date(license.expiresAt)
    
    if (now > expiry) {
      return chalk.yellow('EXPIRED')
    }
  }
  
  return chalk.green('ACTIVE')
}

function getExpiryDisplay(license: StoredLicense): string {
  if (!license.expiresAt) {
    return `Expires: ${chalk.white('Never (Lifetime)')}`
  }
  
  const expiry = new Date(license.expiresAt)
  const now = new Date()
  const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
  
  if (daysRemaining < 0) {
    return `Expired: ${chalk.yellow(expiry.toLocaleDateString())} (${Math.abs(daysRemaining)} days ago)`
  } else {
    return `Expires: ${chalk.white(expiry.toLocaleDateString())} (${daysRemaining} days)`
  }
}

// CLI Commands
program
  .name('license-generator')
  .description('LaundryPro License Generator - Internal vendor tool')
  .version('1.0.0')

program
  .command('keys')
  .description('Generate RSA key pair for license signing')
  .action(async () => {
    await initializeServices()
    await generateKeys()
    await cleanup()
  })

program
  .command('generate')
  .description('Generate a new license interactively')
  .action(async () => {
    await initializeServices()
    await generateLicense()
    await cleanup()
  })

program
  .command('verify')
  .description('Verify a license key')
  .argument('[license-key]', 'License key to verify')
  .action(async (licenseKey) => {
    await initializeServices()
    await verifyLicense(licenseKey)
    await cleanup()
  })

program
  .command('list')
  .description('List all generated licenses')
  .action(async () => {
    await initializeServices()
    await listLicenses()
    await cleanup()
  })

program
  .command('revoke')
  .description('Revoke a license')
  .argument('[license-id]', 'License ID to revoke')
  .action(async (licenseId) => {
    await initializeServices()
    await revokeLicense(licenseId)
    await cleanup()
  })

program
  .command('extend')
  .description('Extend license expiry date')
  .argument('[license-id]', 'License ID to extend')
  .argument('[new-expiry]', 'New expiry date (YYYY-MM-DD)')
  .action(async (licenseId, newExpiry) => {
    await initializeServices()
    await extendLicense(licenseId, newExpiry)
    await cleanup()
  })

program
  .command('batch')
  .description('Generate multiple licenses in batch')
  .action(async () => {
    await initializeServices()
    await batchGenerate()
    await cleanup()
  })

// Handle process termination
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n\n⚠️  Shutting down...'))
  await cleanup()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await cleanup()
  process.exit(0)
})

// Parse command line arguments
program.parse()

// If no command provided, show help
if (!process.argv.slice(2).length) {
  displayHeader()
  program.outputHelp()
}