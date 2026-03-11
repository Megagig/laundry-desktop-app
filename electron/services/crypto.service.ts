import * as forge from 'node-forge'

export class CryptoService {
  // Public key for license verification (in production, this would be embedded securely)
  private readonly PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2K8QZ9X7QZ8X7QZ8X7QZ
8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7Q
Z8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7
QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X
7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8
X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ
8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7QZ8X7Q
QIDAQAB
-----END PUBLIC KEY-----`

  /**
   * Verify RSA signature using public key
   */
  async verifySignature(data: string, signature: string): Promise<boolean> {
    try {
      // Parse the public key
      const publicKey = forge.pki.publicKeyFromPem(this.PUBLIC_KEY)
      
      // Create message digest
      const md = forge.md.sha256.create()
      md.update(data, 'utf8')
      
      // Verify signature
      const signatureBytes = forge.util.decode64(signature)
      return publicKey.verify(md.digest().bytes(), signatureBytes)
      
    } catch (error) {
      console.error('Signature verification failed:', error)
      return false
    }
  }

  /**
   * Generate hash of data (for integrity checking)
   */
  generateHash(data: string): string {
    const md = forge.md.sha256.create()
    md.update(data, 'utf8')
    return forge.util.encode64(md.digest().bytes())
  }

  /**
   * Generate random string for license IDs
   */
  generateRandomString(length: number = 32): string {
    const bytes = forge.random.getBytesSync(length)
    return forge.util.encode64(bytes).substring(0, length)
  }
}

export const cryptoService = new CryptoService()