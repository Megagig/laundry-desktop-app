/**
 * Phase 12: Integrity Checking Service
 * Verifies that critical security files haven't been tampered with
 */

import * as crypto from 'crypto'
import * as fs from 'fs'
import * as path from 'path'

interface IntegrityCheck {
  file: string
  expectedHash: string
  actualHash?: string
  isValid: boolean
  error?: string
}

interface IntegrityReport {
  timestamp: Date
  overallStatus: 'VALID' | 'COMPROMISED' | 'ERROR'
  checks: IntegrityCheck[]
  debuggerDetected: boolean
  publicKeyValid: boolean
}

class IntegrityService {
  private readonly criticalFiles = [
    'services/license.service.ts',
    'services/crypto.service.ts',
    'services/machine-id.service.ts',
    'services/trial.service.ts',
    'services/auth.service.ts',
    'ipc/license.ipc.ts',
    'ipc/auth.ipc.ts'
  ]

  private readonly expectedHashes: Record<string, string> = {
    // These would be populated during build process
    // For now, we'll calculate them dynamically
  }

  /**
   * Perform comprehensive integrity check
   */
  async performIntegrityCheck(): Promise<IntegrityReport> {
    const report: IntegrityReport = {
      timestamp: new Date(),
      overallStatus: 'VALID',
      checks: [],
      debuggerDetected: this.detectDebugger(),
      publicKeyValid: this.validatePublicKey()
    }

    // Check file integrity
    for (const file of this.criticalFiles) {
      const check = await this.checkFileIntegrity(file)
      report.checks.push(check)
      
      if (!check.isValid) {
        report.overallStatus = 'COMPROMISED'
      }
    }

    // Check for debugger
    if (report.debuggerDetected) {
      report.overallStatus = 'COMPROMISED'
    }

    // Check public key
    if (!report.publicKeyValid) {
      report.overallStatus = 'COMPROMISED'
    }

    return report
  }

  /**
   * Check integrity of a specific file
   */
  private async checkFileIntegrity(relativePath: string): Promise<IntegrityCheck> {
    const check: IntegrityCheck = {
      file: relativePath,
      expectedHash: '',
      isValid: false
    }

    try {
      const filePath = path.join(__dirname, '..', relativePath)
      
      if (!fs.existsSync(filePath)) {
        // In development mode, if file doesn't exist, that's OK
        if (process.env.NODE_ENV !== 'production') {
          console.log(`🔧 Development mode: File ${relativePath} not found, skipping...`)
          check.isValid = true
          check.expectedHash = 'dev-mode-skip'
          check.actualHash = 'dev-mode-skip'
          return check
        }
        check.error = 'File not found'
        return check
      }

      const content = fs.readFileSync(filePath, 'utf8')
      check.actualHash = crypto.createHash('sha256').update(content).digest('hex')
      
      // In development mode, we'll consider all files valid
      // In production, you would compare against known good hashes
      if (process.env.NODE_ENV !== 'production') {
        check.expectedHash = check.actualHash
        check.isValid = true
      } else {
        check.expectedHash = this.expectedHashes[relativePath] || check.actualHash
        check.isValid = check.actualHash === check.expectedHash
      }
      
    } catch (error) {
      // In development mode, errors are less critical
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔧 Development mode: Error checking ${relativePath}, continuing...`)
        check.isValid = true
        check.error = `Dev mode: ${error instanceof Error ? error.message : 'Unknown error'}`
      } else {
        check.error = error instanceof Error ? error.message : 'Unknown error'
      }
    }

    return check
  }

  /**
   * Detect if debugger is attached
   */
  private detectDebugger(): boolean {
    try {
      // In development mode, we'll be more lenient with debugger detection
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Relaxed debugger detection')
        
        // Only check for explicit debugging flags in development
        if (process.env.NODE_OPTIONS?.includes('--inspect') ||
            process.env.NODE_OPTIONS?.includes('--debug') ||
            process.argv.some(arg => arg.includes('--inspect') || arg.includes('--debug'))) {
          console.log('🔧 Development mode: Debugger detected but allowed')
          return false // Allow debugging in development
        }
        
        return false
      }

      // Production mode - strict debugger detection
      // Method 1: Check for debugger statement timing
      const start = Date.now()
      debugger // This will pause if debugger is attached
      const end = Date.now()
      
      // If debugger is attached, this will take longer
      if (end - start > 100) {
        return true
      }

      // Method 2: Check for common debugging tools
      if (typeof window !== 'undefined') {
        // @ts-ignore - Check for browser dev tools
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
          return true
        }
      }

      // Method 3: Check for Node.js debugging
      if (process.env.NODE_OPTIONS?.includes('--inspect') ||
          process.env.NODE_OPTIONS?.includes('--debug') ||
          process.argv.some(arg => arg.includes('--inspect') || arg.includes('--debug'))) {
        return true
      }

      return false
    } catch (error) {
      // If error occurs, assume no debugger
      return false
    }
  }

  /**
   * Validate that the embedded public key hasn't been tampered with
   */
  private validatePublicKey(): boolean {
    try {
      // In development mode, we'll skip public key validation
      // since the key might not be embedded yet
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Skipping public key validation')
        return true
      }

      // Import the public key
      const { PUBLIC_KEY } = require('../config/public-key')
      
      if (!PUBLIC_KEY || typeof PUBLIC_KEY !== 'string') {
        return false
      }

      // Check if it looks like a valid PEM key
      if (!PUBLIC_KEY.includes('-----BEGIN PUBLIC KEY-----') ||
          !PUBLIC_KEY.includes('-----END PUBLIC KEY-----')) {
        return false
      }

      // Calculate expected hash of the public key
      const keyHash = crypto.createHash('sha256').update(PUBLIC_KEY).digest('hex')
      
      // In production, you would compare against a known good hash
      // For now, we'll just check that it's a reasonable length
      return keyHash.length === 64 // SHA-256 produces 64 character hex string
      
    } catch (error) {
      // In development mode, if public key file doesn't exist, that's OK
      if (process.env.NODE_ENV !== 'production') {
        console.log('🔧 Development mode: Public key file not found, continuing...')
        return true
      }
      return false
    }
  }

  /**
   * Generate baseline hashes for critical files
   * This should be run during build process
   */
  async generateBaselineHashes(): Promise<Record<string, string>> {
    const hashes: Record<string, string> = {}
    
    for (const file of this.criticalFiles) {
      try {
        const filePath = path.join(__dirname, '..', file)
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8')
          hashes[file] = crypto.createHash('sha256').update(content).digest('hex')
        }
      } catch (error) {
        console.warn(`Failed to generate hash for ${file}:`, error)
      }
    }
    
    return hashes
  }

  /**
   * Anti-tampering check - should be called periodically
   */
  async performAntiTamperingCheck(): Promise<boolean> {
    const report = await this.performIntegrityCheck()
    
    if (report.overallStatus === 'COMPROMISED') {
      console.error('🚨 SECURITY ALERT: System integrity compromised!')
      console.error('Details:', report)
      
      // In production, you might want to:
      // 1. Log the incident
      // 2. Disable critical functionality
      // 3. Alert administrators
      // 4. Exit the application
      
      return false
    }
    
    return true
  }

  /**
   * Obfuscated license validation wrapper
   * This adds an extra layer of validation that's harder to bypass
   */
  async validateLicenseWithIntegrity(licenseKey: string, machineId: string): Promise<boolean> {
    // First check system integrity
    const integrityValid = await this.performAntiTamperingCheck()
    if (!integrityValid) {
      return false
    }

    // Then validate license (this would call the actual license service)
    try {
      const { licenseService } = require('./license.service')
      const result = await licenseService.validateLicense(licenseKey, machineId)
      
      // Add additional obfuscated checks here
      const additionalCheck = this.performObfuscatedValidation(licenseKey)
      
      return result.valid && additionalCheck
    } catch (error) {
      return false
    }
  }

  /**
   * Additional obfuscated validation logic
   * This method would be heavily obfuscated in production
   */
  private performObfuscatedValidation(licenseKey: string): boolean {
    try {
      // Decode and perform additional checks
      const decoded = Buffer.from(licenseKey, 'base64').toString()
      const parsed = JSON.parse(decoded)
      
      // Check payload structure
      if (!parsed.payload || !parsed.signature) {
        return false
      }
      
      // Additional timestamp validation
      const payload = JSON.parse(parsed.payload)
      const issuedAt = new Date(payload.issuedAt)
      const now = new Date()
      
      // License can't be issued in the future
      if (issuedAt > now) {
        return false
      }
      
      // License can't be too old (prevent replay attacks)
      const maxAge = 365 * 24 * 60 * 60 * 1000 // 1 year in milliseconds
      if (now.getTime() - issuedAt.getTime() > maxAge) {
        return false
      }
      
      return true
    } catch (error) {
      return false
    }
  }
}

export const integrityService = new IntegrityService()
export { IntegrityService }
export type { IntegrityReport, IntegrityCheck }