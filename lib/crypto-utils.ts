import crypto from 'crypto';
import { privateKeyToAccount } from 'viem/accounts';

// ===== Encryption Settings =====
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

/**
 * Lấy encryption key từ environment variable
 * CẢNH BÁO: Key này phải được giữ bí mật tuyệt đối!
 */
function getEncryptionKey(): string {
  const key = process.env.WALLET_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('WALLET_ENCRYPTION_KEY is not set in environment variables');
  }
  if (key.length < 32) {
    throw new Error('WALLET_ENCRYPTION_KEY must be at least 32 characters');
  }
  return key;
}

/**
 * Encrypt private key trước khi lưu vào database
 */
export function encryptPrivateKey(privateKey: string): string {
  try {
    const masterKey = getEncryptionKey();
    
    // Generate random salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    // Derive key from master key + salt
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const authTag = cipher.getAuthTag();
    
    // Combine: salt + iv + authTag + encrypted
    // Format: salt(64) + iv(16) + tag(16) + encrypted
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex')
    ]).toString('base64');
    
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt private key');
  }
}

/**
 * Decrypt private key từ database
 */
export function decryptPrivateKey(encryptedData: string): string {
  try {
    const masterKey = getEncryptionKey();
    
    // Decode base64
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = buffer.subarray(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + TAG_LENGTH
    );
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    // Derive key from master key + salt
    const key = crypto.pbkdf2Sync(
      masterKey,
      salt,
      ITERATIONS,
      KEY_LENGTH,
      'sha512'
    );
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt private key');
  }
}

/**
 * Validate private key format (Ethereum)
 */
export function isValidPrivateKey(privateKey: string): boolean {
  // Remove 0x prefix if present
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  
  // Check if it's 64 hex characters
  return /^[a-fA-F0-9]{64}$/.test(cleanKey);
}

/**
 * Format private key (add 0x prefix if needed)
 */
export function formatPrivateKey(privateKey: string): string {
  const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
  return `0x${cleanKey}`;
}

/**
 * Generate new Ethereum wallet (address + private key)
 * Uses crypto.randomBytes for secure random generation and viem for proper address derivation
 */
export function generateWallet(): { address: string; privateKey: string } {
  // Generate 32 random bytes for private key
  const privateKeyBytes = crypto.randomBytes(32);
  const privateKey = ('0x' + privateKeyBytes.toString('hex')) as `0x${string}`;
  
  // Use viem to properly derive Ethereum address from private key
  const account = privateKeyToAccount(privateKey);
  
  return {
    address: account.address.toLowerCase(),
    privateKey
  };
}
