import forge from 'node-forge'

/**
 * Cryptographic service for license signature verification
 * Uses RSA-2048 with SHA-256 for license validation
 */
export class CryptoService {
  // Public key embedded in application (private key kept secure by vendor)
  private readonly PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjrMrzCU+FUVaEmfCXtXe
luaVozH3R8sOeCrJtNEbdBEclrOZMmAyNdwKgXD7qdkEBRhh9zsmUOBGdvMyetkt
vJLO1l9WdxA4O35GijChaEPiBcFyh/r+zbjc54lwdNTnQbInrbzhJ7MWa70F9pqA
W2k1P0kPVP8HDDYSNh1QYJHZuGoFgGHqNeeA1veOHv7iOwooS5mKeiBMSfUFXBnn
mQylNGlIXbbPvQU2AeHFXg0Tq5Xh1ww6THm1EwmTQ/baMLBPYQhz/SFPkRKavZNI
Ne+mc+yrb/RfcTm9Vp666wrt1xMc3x+EY82U0zjo6z8atz5oiDrIBpWyrYJfhOsE
2QIDAQAB
-----END PUBLIC KEY-----`

  /**
   * Verify RSA signature of license data
   * @param data - The license payload as JSON string
   * @param signature - Base64 encoded signature
   * @returns Promise<boolean> - True if signature is valid
   */
  async verifySignature(data: string, signature: string): Promise<boolean> {
    try {
      // Load public key
      const publicKey = forge.pki.publicKeyFromPem(this.PUBLIC_KEY)
      
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
   * Verify complete license key structure and signature
   * @param licenseKey - Base64 encoded license key containing payload and signature
   * @returns Promise<{ valid: boolean, payload?: any, error?: string }>
   */
  async verifyLicenseKey(licenseKey: string): Promise<{
    valid: boolean
    payload?: any
    error?: string
  }> {
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
      const signatureValid = await this.verifySignature(decoded.payload, decoded.signature)
      
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
   * Hash data using SHA-256
   * @param data - Data to hash
   * @returns Hex encoded hash
   */
  hash(data: string): string {
    const md = forge.md.sha256.create()
    md.update(data, 'utf8')
    return md.digest().toHex()
  }

  /**
   * Get the embedded public key
   * @returns Public key in PEM format
   */
  getPublicKey(): string {
    return this.PUBLIC_KEY
  }

  /**
   * Encrypt data using AES-256-GCM (optional, for sensitive data)
   * @param data - Data to encrypt
   * @param password - Password for key derivation
   * @returns Base64 encoded encrypted data
   */
  encrypt(data: string, password: string): string {
    try {
      // Generate random salt and IV
      const salt = forge.random.getBytesSync(16)
      const iv = forge.random.getBytesSync(16)
      
      // Derive key using PBKDF2
      const key = forge.pkcs5.pbkdf2(password, salt, 100000, 32)
      
      // Create cipher
      const cipher = forge.cipher.createCipher('AES-GCM', key)
      cipher.start({ iv })
      cipher.update(forge.util.createBuffer(data, 'utf8'))
      cipher.finish()
      
      // Get auth tag
      const authTag = cipher.mode.tag.getBytes()
      
      // Combine salt, iv, authTag, and encrypted data
      const encrypted = {
        salt: forge.util.encode64(salt),
        iv: forge.util.encode64(iv),
        authTag: forge.util.encode64(authTag),
        data: forge.util.encode64(cipher.output.getBytes())
      }
      
      return Buffer.from(JSON.stringify(encrypted)).toString('base64')
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }

  /**
   * Decrypt data using AES-256-GCM (optional, for sensitive data)
   * @param encryptedData - Base64 encoded encrypted data
   * @param password - Password for key derivation
   * @returns Decrypted data
   */
  decrypt(encryptedData: string, password: string): string {
    try {
      // Parse encrypted data
      const decoded = JSON.parse(Buffer.from(encryptedData, 'base64').toString())
      const { salt, iv, authTag, data } = decoded
      
      // Derive key using PBKDF2
      const key = forge.pkcs5.pbkdf2(
        password,
        forge.util.decode64(salt),
        100000,
        32
      )
      
      // Create decipher
      const decipher = forge.cipher.createDecipher('AES-GCM', key)
      decipher.start({
        iv: forge.util.decode64(iv),
        tag: forge.util.createBuffer(forge.util.decode64(authTag))
      })
      
      decipher.update(forge.util.createBuffer(forge.util.decode64(data)))
      const success = decipher.finish()
      
      if (!success) {
        throw new Error('Authentication failed')
      }
      
      return decipher.output.toString('utf8')
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }
}

// Export singleton instance
export const cryptoService = new CryptoService()