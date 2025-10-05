/**
 * Data Encryption and Security Middleware
 * Comprehensive encryption for data at rest and in transit
 */

import * as crypto from 'crypto';
import { config } from '../config/environment';
import { logger } from '../config/logger';
import { AppError } from './errorHandler';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits

// Derive encryption key from master key
const deriveKey = (password: string, salt: Buffer): Buffer => {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
};

// Generate random salt
const generateSalt = (): Buffer => {
  return crypto.randomBytes(SALT_LENGTH);
};

// Generate random IV
const generateIV = (): Buffer => {
  return crypto.randomBytes(IV_LENGTH);
};

// Encrypt data
export const encryptData = (data: string, masterKey?: string): string => {
  try {
    const key = masterKey || config.security.encryptionKey;
    const salt = generateSalt();
    const iv = generateIV();
    const derivedKey = deriveKey(key, salt);
    
    const cipher = crypto.createCipher(ENCRYPTION_ALGORITHM, derivedKey);
    cipher.setAAD(salt); // Additional authenticated data
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine salt + iv + tag + encrypted data
    const result = Buffer.concat([
      salt,
      iv,
      tag,
      Buffer.from(encrypted, 'hex')
    ]);
    
    return result.toString('base64');
  } catch (error) {
    logger.error('Data encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Encryption failed', 500, 'ENCRYPTION_ERROR');
  }
};

// Decrypt data
export const decryptData = (encryptedData: string, masterKey?: string): string => {
  try {
    const key = masterKey || config.security.encryptionKey;
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    
    const derivedKey = deriveKey(key, salt);
    
    const decipher = crypto.createDecipher(ENCRYPTION_ALGORITHM, derivedKey);
    decipher.setAAD(salt);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Data decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Decryption failed', 500, 'DECRYPTION_ERROR');
  }
};

// Hash sensitive data (one-way)
export const hashSensitiveData = (data: string, salt?: string): string => {
  try {
    const saltToUse = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, saltToUse, 100000, 64, 'sha512');
    return `${saltToUse}:${hash.toString('hex')}`;
  } catch (error) {
    logger.error('Data hashing failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Hashing failed', 500, 'HASHING_ERROR');
  }
};

// Verify hashed data
export const verifyHashedData = (data: string, hashedData: string): boolean => {
  try {
    const [salt, hash] = hashedData.split(':');
    if (!salt || !hash) {
      return false;
    }
    const newHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), newHash);
  } catch (error) {
    logger.error('Data verification failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
};

// Generate secure random token
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random string
export const generateSecureString = (length: number = 16): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    result += chars[randomBytes[i]! % chars.length];
  }
  
  return result;
};

// Encrypt PII (Personally Identifiable Information)
export const encryptPII = (data: string): string => {
  try {
    // Use a separate key for PII encryption
    const piiKey = process.env.PII_ENCRYPTION_KEY || config.security.encryptionKey;
    return encryptData(data, piiKey);
  } catch (error) {
    logger.error('PII encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('PII encryption failed', 500, 'PII_ENCRYPTION_ERROR');
  }
};

// Decrypt PII
export const decryptPII = (encryptedData: string): string => {
  try {
    const piiKey = process.env.PII_ENCRYPTION_KEY || config.security.encryptionKey;
    return decryptData(encryptedData, piiKey);
  } catch (error) {
    logger.error('PII decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('PII decryption failed', 500, 'PII_DECRYPTION_ERROR');
  }
};

// Encrypt health data (HIPAA compliance)
export const encryptHealthData = (data: string): string => {
  try {
    const healthKey = process.env.HEALTH_ENCRYPTION_KEY || config.security.encryptionKey;
    return encryptData(data, healthKey);
  } catch (error) {
    logger.error('Health data encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Health data encryption failed', 500, 'HEALTH_ENCRYPTION_ERROR');
  }
};

// Decrypt health data
export const decryptHealthData = (encryptedData: string): string => {
  try {
    const healthKey = process.env.HEALTH_ENCRYPTION_KEY || config.security.encryptionKey;
    return decryptData(encryptedData, healthKey);
  } catch (error) {
    logger.error('Health data decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Health data decryption failed', 500, 'HEALTH_DECRYPTION_ERROR');
  }
};

// Encrypt financial data
export const encryptFinancialData = (data: string): string => {
  try {
    const financialKey = process.env.FINANCIAL_ENCRYPTION_KEY || config.security.encryptionKey;
    return encryptData(data, financialKey);
  } catch (error) {
    logger.error('Financial data encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Financial data encryption failed', 500, 'FINANCIAL_ENCRYPTION_ERROR');
  }
};

// Decrypt financial data
export const decryptFinancialData = (encryptedData: string): string => {
  try {
    const financialKey = process.env.FINANCIAL_ENCRYPTION_KEY || config.security.encryptionKey;
    return decryptData(encryptedData, financialKey);
  } catch (error) {
    logger.error('Financial data decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Financial data decryption failed', 500, 'FINANCIAL_DECRYPTION_ERROR');
  }
};

// Mask sensitive data for logging
export const maskSensitiveData = (data: string, type: 'email' | 'phone' | 'ssn' | 'credit_card' | 'generic' = 'generic'): string => {
  try {
    switch (type) {
      case 'email':
        const [localPart, domain] = data.split('@');
        if (!localPart || !domain) {
          return '***@***';
        }
        if (localPart.length <= 2) {
          return `${localPart[0]}*@${domain}`;
        }
        return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
      
      case 'phone':
        if (data.length <= 4) {
          return '*'.repeat(data.length);
        }
        return `${data.substring(0, 2)}${'*'.repeat(data.length - 4)}${data.substring(data.length - 2)}`;
      
      case 'ssn':
        return `***-**-${data.substring(data.length - 4)}`;
      
      case 'credit_card':
        if (data.length <= 4) {
          return '*'.repeat(data.length);
        }
        return `${'*'.repeat(data.length - 4)}${data.substring(data.length - 4)}`;
      
      case 'generic':
      default:
        if (data.length <= 4) {
          return '*'.repeat(data.length);
        }
        return `${data.substring(0, 2)}${'*'.repeat(data.length - 4)}${data.substring(data.length - 2)}`;
    }
  } catch (error) {
    logger.error('Data masking failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return '*'.repeat(data.length);
  }
};

// Encrypt object fields
export const encryptObjectFields = (obj: any, fields: string[], encryptionType: 'pii' | 'health' | 'financial' | 'generic' = 'generic'): any => {
  try {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        switch (encryptionType) {
          case 'pii':
            result[field] = encryptPII(result[field]);
            break;
          case 'health':
            result[field] = encryptHealthData(result[field]);
            break;
          case 'financial':
            result[field] = encryptFinancialData(result[field]);
            break;
          case 'generic':
          default:
            result[field] = encryptData(result[field]);
            break;
        }
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Object field encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fields,
      encryptionType,
    });
    throw new AppError('Object field encryption failed', 500, 'OBJECT_ENCRYPTION_ERROR');
  }
};

// Decrypt object fields
export const decryptObjectFields = (obj: any, fields: string[], encryptionType: 'pii' | 'health' | 'financial' | 'generic' = 'generic'): any => {
  try {
    const result = { ...obj };
    
    for (const field of fields) {
      if (result[field] && typeof result[field] === 'string') {
        switch (encryptionType) {
          case 'pii':
            result[field] = decryptPII(result[field]);
            break;
          case 'health':
            result[field] = decryptHealthData(result[field]);
            break;
          case 'financial':
            result[field] = decryptFinancialData(result[field]);
            break;
          case 'generic':
          default:
            result[field] = decryptData(result[field]);
            break;
        }
      }
    }
    
    return result;
  } catch (error) {
    logger.error('Object field decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      fields,
      encryptionType,
    });
    throw new AppError('Object field decryption failed', 500, 'OBJECT_DECRYPTION_ERROR');
  }
};

// Generate encryption key pair for asymmetric encryption
export const generateKeyPair = (): { publicKey: string; privateKey: string } => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    
    return { publicKey, privateKey };
  } catch (error) {
    logger.error('Key pair generation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Key pair generation failed', 500, 'KEY_GENERATION_ERROR');
  }
};

// Asymmetric encryption
export const encryptWithPublicKey = (data: string, publicKey: string): string => {
  try {
    const buffer = Buffer.from(data, 'utf8');
    const encrypted = crypto.publicEncrypt(publicKey, buffer);
    return encrypted.toString('base64');
  } catch (error) {
    logger.error('Asymmetric encryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Asymmetric encryption failed', 500, 'ASYMMETRIC_ENCRYPTION_ERROR');
  }
};

// Asymmetric decryption
export const decryptWithPrivateKey = (encryptedData: string, privateKey: string): string => {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt(privateKey, buffer);
    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Asymmetric decryption failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw new AppError('Asymmetric decryption failed', 500, 'ASYMMETRIC_DECRYPTION_ERROR');
  }
};

export default {
  encryptData,
  decryptData,
  hashSensitiveData,
  verifyHashedData,
  generateSecureToken,
  generateSecureString,
  encryptPII,
  decryptPII,
  encryptHealthData,
  decryptHealthData,
  encryptFinancialData,
  decryptFinancialData,
  maskSensitiveData,
  encryptObjectFields,
  decryptObjectFields,
  generateKeyPair,
  encryptWithPublicKey,
  decryptWithPrivateKey,
};
