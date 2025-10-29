// services/encryptionService.js
const crypto = require('crypto');


/**
 * EncryptionService provides symmetric AES-256-GCM encryption/decryption functionality.
 * 
 * This service handles secure text encryption using AES-256 in GCM mode, which provides
 * both confidentiality and authentication. The implementation includes:
 * - Automatic IV generation for each encryption operation
 * - Authentication tags to verify data integrity
 * - Secure key derivation from environment variables
 * - Combined output format containing ciphertext, IV, and auth tag
 * 
 * Security Considerations:
 * - Encryption key is derived from ENCRYPTION_KEY environment variable
 * - Uses cryptographically secure random IV for each encryption
 * - GCM mode provides built-in authentication against tampering
 * - Key should be managed via secure secret storage (AWS KMS, HashiCorp Vault, etc.)
 * 
 * The encrypted output format is: $ciphertext$IV$authTag$
 * 
 * @example
 * const service = new EncryptionService();
 * const encrypted = service.encrypt('sensitive data');
 * const decrypted = service.decrypt(encrypted);
 */
class EncryptionService {
  constructor() {
    // Store key in environment variable or AWS KMS, HashiCorp Vault
    this.algorithm = 'aes-256-gcm';
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);
  }

  /**
   * Encrypts the text with the aes-256-gcm algorithm
   * @param {string} text The text to be encrypted
   * @returns encrypted text
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    //console.log(iv)
    
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    encrypted = ('$' + encrypted + '$' + iv.toString('hex')+ '$' + authTag.toString('hex'));
    //console.log(encrypted);
    
    
    return encrypted
  }

  /**
   * Decrypts the text with the aes-256-gcm algorithm
   * @param {string} text The text to be encrypted
   * @returns encrypted text
   */
  decrypt(encryptedData) {
    const [fspare, data, hexstring, authtag] = encryptedData.split("$");
    const iv = Buffer.from(hexstring, 'hex');
    const authTag = Buffer.from(authtag, 'hex');
    //console.log(authtag)

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    //console.log(decrypted)
    
    decrypted += decipher.final('utf8');

    //console.log(decrypted)
    
    return decrypted;
  }
}

module.exports = new EncryptionService();