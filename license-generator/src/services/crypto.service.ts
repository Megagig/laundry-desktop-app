import forge from 'node-forge'
import { promises as fs } from 'fs'
import path from 'path'

export interface KeyPair {
  publicKey: string
  privateKey: string
}

export interface LicensePayload {
  licenseId: string
  machineId: string
  issuedTo: string
  email: string
  company?: string
  licenseType: 'TRIAL' | 'STANDARD' | 'PROFESSIONAL' | 'ENTERPRISE'
  features: string[]
  maxUsers: number
  issuedAt: string
  expiresAt?: string
  product: string
  version: string
}

export interface SignedLicense {
  payload: string
  signature: string
}

/**
 * Cryptographic service for license generation and signing
 * Uses RSA-2048 with SHA-256 for secure license signing
 */
export class CryptoService {
  private readonly KEYS_DIR = path.join(process.cwd(), 'keys')
  private readonly PRIVATE_KEY_FILE = path.join(this.KEYS_DIR, 'rsa-private.pem')
  private readonly PUBLIC_KEY_FILE = path.join(this.KEYS_DIR, 'rsa-public.pem')

  /**
   * Generate RSA-2048 key pair for license signing
   */
  async generateKeyPair(): Promise<KeyPair> {
    console.log('🔐 Generating RSA-2048 key pair...')
    
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 })
    
    const publicKeyPem = forge.pki.publicKeyToPem(keyPair.publicKey)
    const privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey)
    
    // Ensure keys directory exists
    await fs.mkdir(this.KEYS_DIR, { recursive: true })
    
    // Save keys to files
    await fs.writeFile(this.PRIVATE_KEY_FILE, privateKeyPem, { mode: 0o600 })
    await fs.writeFile(this.PUBLIC_KEY_FILE, publicKeyPem, { mode: 0o644 })
    
    console.log('✅ Key pair generated and saved:')
    console.log(`   Private key: ${this.PRIVATE_KEY_FILE}`)
    console.log(`   Public key: ${this.PUBLIC_KEY_FILE}`)
    console.log('⚠️  CRITICAL: Keep private key secure and never distribute!')
    
    return {
      publicKey: publicKeyPem,
      privateKey: privateKeyPem
    }
  }

  /**
   * Load existing private key
   */
  async loadPrivateKey(): Promise<string> {
    try {
      const privateKeyPem = await fs.readFile(this.PRIVATE_KEY_FILE, 'utf8')
      return privateKeyPem
    } catch (error) {
      throw new Error(`Failed to load private key: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Load existing public key
   */
  async loadPublicKey(): Promise<string> {
    try {
      const publicKeyPem = await fs.readFile(this.PUBLIC_KEY_FILE, 'utf8')
      return publicKeyPem
    } catch (error) {
      throw new Error(`Failed to load public key: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Check if key pair exists
   */
  async keyPairExists(): Promise<boolean> {
    try {
      await fs.access(this.PRIVATE_KEY_FILE)
      await fs.access(this.PUBLIC_KEY_FILE)
      return true
    } catch {
      return false
    }
  }

  /**
   * Sign license payload with private key
   */
  async signLicense(payload: LicensePayload): Promise<SignedLicense> {
    try {
      // Load private key
      const privateKeyPem = await this.loadPrivateKey()
      const privateKey = forge.pki.privateKeyFromPem(privateKeyPem)
      
      // Convert payload to JSON string
      const payloadJson = JSON.stringify(payload, null, 0)
      
      // Create SHA-256 hash
      const md = forge.md.sha256.create()
      md.update(payloadJson, 'utf8')
      
      // Sign the hash
      const signature = privateKey.sign(md)
      const signatureBase64 = forge.util.encode64(signature)
      
      return {
        payload: payloadJson,
        signature: signatureBase64
      }
    } catch (error) {
      throw new Error(`License signing failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Verify license signature with public key
   */
  async verifyLicense(signedLicense: SignedLicense): Promise<boolean> {
    try {
      // Load public key
      const publicKeyPem = await this.loadPublicKey()
      const publicKey = forge.pki.publicKeyFromPem(publicKeyPem)
      
      // Create SHA-256 hash of payload
      const md = forge.md.sha256.create()
      md.update(signedLicense.payload, 'utf8')
      
      // Decode signature
      const signature = forge.util.decode64(signedLicense.signature)
      
      // Verify signature
      return publicKey.verify(md.digest().bytes(), signature)
    } catch (error) {
      console.error('License verification failed:', error)
      return false
    }
  }

  /**
   * Create license key (base64 encoded signed license)
   */
  async createLicenseKey(payload: LicensePayload): Promise<string> {
    const signedLicense = await this.signLicense(payload)
    
    const licenseData = {
      payload: signedLicense.payload,
      signature: signedLicense.signature
    }
    
    return Buffer.from(JSON.stringify(licenseData)).toString('base64')
  }

  /**
   * Parse and verify license key
   */
  async parseLicenseKey(licenseKey: string): Promise<{
    valid: boolean
    payload?: LicensePayload
    error?: string
  }> {
    try {
      // Decode base64
      const decoded = JSON.parse(Buffer.from(licenseKey, 'base64').toString())
      
      if (!decoded.payload || !decoded.signature) {
        return {
          valid: false,
          error: 'Invalid license key format'
        }
      }

      // Verify signature
      const isValid = await this.verifyLicense({
        payload: decoded.payload,
        signature: decoded.signature
      })

      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid license signature'
        }
      }

      // Parse payload
      const payload = JSON.parse(decoded.payload) as LicensePayload

      return {
        valid: true,
        payload
      }
    } catch (error) {
      return {
        valid: false,
        error: `License parsing failed: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * Get key pair information
   */
  async getKeyInfo(): Promise<{
    exists: boolean
    publicKeyPath?: string
    privateKeyPath?: string
    publicKeyPreview?: string
    error?: string
  }> {
    const exists = await this.keyPairExists()
    
    if (!exists) {
      return { exists: false }
    }

    try {
      const publicKey = await this.loadPublicKey()
      const lines = publicKey.split('\n')
      const preview = lines.slice(1, 3).join('\n') + '\n...'

      return {
        exists: true,
        publicKeyPath: this.PUBLIC_KEY_FILE,
        privateKeyPath: this.PRIVATE_KEY_FILE,
        publicKeyPreview: preview
      }
    } catch (error) {
      return {
        exists: false,
        error: `Failed to read key info: ${error instanceof Error ? error.message : String(error)}`
      }
    }
  }

  /**
   * Hash data using SHA-256
   */
  hash(data: string): string {
    const md = forge.md.sha256.create()
    md.update(data, 'utf8')
    return md.digest().toHex()
  }
}

export const cryptoService = new CryptoService()