/**
 * Security Environment Setup Script
 * Generates secure environment variables for security features
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

function generateJWTSecret() {
  return crypto.randomBytes(64).toString('base64');
}

function generateEncryptionKey() {
  return crypto.randomBytes(32).toString('hex');
}

function setupSecurityEnvironment() {
  console.log('🔐 Setting up security environment variables...');
  
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', 'env.example');
  
  // Read existing .env file if it exists
  let existingEnv = '';
  if (fs.existsSync(envPath)) {
    existingEnv = fs.readFileSync(envPath, 'utf8');
  }
  
  // Generate security variables
  const securityVars = {
    // JWT Configuration
    JWT_SECRET: generateJWTSecret(),
    JWT_REFRESH_SECRET: generateJWTSecret(),
    JWT_EXPIRES_IN: '24h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    
    // Encryption Keys
    ENCRYPTION_KEY: generateEncryptionKey(),
    PII_ENCRYPTION_KEY: generateEncryptionKey(),
    HEALTH_ENCRYPTION_KEY: generateEncryptionKey(),
    FINANCIAL_ENCRYPTION_KEY: generateEncryptionKey(),
    
    // Session Configuration
    SESSION_SECRET: generateSecureKey(32),
    
    // Security Settings
    BCRYPT_ROUNDS: '12',
    
    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: '900000',
    RATE_LIMIT_MAX_REQUESTS: '100',
    RATE_LIMIT_AUTH_MAX_REQUESTS: '5',
    RATE_LIMIT_AI_MAX_REQUESTS: '10',
  };
  
  // Create security environment section
  const securitySection = `
# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# JWT Configuration
JWT_SECRET=${securityVars.JWT_SECRET}
JWT_REFRESH_SECRET=${securityVars.JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=${securityVars.JWT_EXPIRES_IN}
JWT_REFRESH_EXPIRES_IN=${securityVars.JWT_REFRESH_EXPIRES_IN}

# Encryption Keys
ENCRYPTION_KEY=${securityVars.ENCRYPTION_KEY}
PII_ENCRYPTION_KEY=${securityVars.PII_ENCRYPTION_KEY}
HEALTH_ENCRYPTION_KEY=${securityVars.HEALTH_ENCRYPTION_KEY}
FINANCIAL_ENCRYPTION_KEY=${securityVars.FINANCIAL_ENCRYPTION_KEY}

# Session Configuration
SESSION_SECRET=${securityVars.SESSION_SECRET}

# Security Settings
BCRYPT_ROUNDS=${securityVars.BCRYPT_ROUNDS}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=${securityVars.RATE_LIMIT_WINDOW_MS}
RATE_LIMIT_MAX_REQUESTS=${securityVars.RATE_LIMIT_MAX_REQUESTS}
RATE_LIMIT_AUTH_MAX_REQUESTS=${securityVars.RATE_LIMIT_AUTH_MAX_REQUESTS}
RATE_LIMIT_AI_MAX_REQUESTS=${securityVars.RATE_LIMIT_AI_MAX_REQUESTS}
`;
  
  // Update .env file
  let updatedEnv = existingEnv;
  
  // Remove existing security section if it exists
  updatedEnv = updatedEnv.replace(/# ============================================================================\n# SECURITY CONFIGURATION[\s\S]*?(?=\n# ============================================================================|\n[A-Z_]+=|$)/g, '');
  
  // Add new security section
  updatedEnv += securitySection;
  
  // Write updated .env file
  fs.writeFileSync(envPath, updatedEnv);
  
  // Update .env.example
  const exampleSecuritySection = `
# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Encryption Keys
ENCRYPTION_KEY=your-32-character-encryption-key
PII_ENCRYPTION_KEY=your-pii-encryption-key
HEALTH_ENCRYPTION_KEY=your-health-encryption-key
FINANCIAL_ENCRYPTION_KEY=your-financial-encryption-key

# Session Configuration
SESSION_SECRET=your-session-secret

# Security Settings
BCRYPT_ROUNDS=12

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_AUTH_MAX_REQUESTS=5
RATE_LIMIT_AI_MAX_REQUESTS=10
`;
  
  if (fs.existsSync(envExamplePath)) {
    let exampleEnv = fs.readFileSync(envExamplePath, 'utf8');
    exampleEnv = exampleEnv.replace(/# ============================================================================\n# SECURITY CONFIGURATION[\s\S]*?(?=\n# ============================================================================|\n[A-Z_]+=|$)/g, '');
    exampleEnv += exampleSecuritySection;
    fs.writeFileSync(envExamplePath, exampleEnv);
  }
  
  console.log('✅ Security environment variables generated!');
  console.log('📁 Updated files:');
  console.log('   - .env (with secure random keys)');
  console.log('   - .env.example (with placeholder values)');
  console.log('');
  console.log('🔒 Generated security keys:');
  console.log('   - JWT secrets (64-byte base64)');
  console.log('   - Encryption keys (32-byte hex)');
  console.log('   - Session secret (32-byte hex)');
  console.log('');
  console.log('⚠️  IMPORTANT: Keep these keys secure and never commit them to version control!');
}

// Run the setup
setupSecurityEnvironment();
