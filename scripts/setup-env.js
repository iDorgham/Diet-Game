#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps configure environment variables for the Diet Game project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generateEncryptionKey() {
  return crypto.randomBytes(16).toString('hex');
}

function copyEnvFile(source, destination) {
  try {
    if (fs.existsSync(destination)) {
      log(`⚠️  ${destination} already exists. Skipping...`, 'yellow');
      return false;
    }
    
    fs.copyFileSync(source, destination);
    log(`✅ Created ${destination}`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error creating ${destination}: ${error.message}`, 'red');
    return false;
  }
}

function updateEnvFile(filePath, updates) {
  try {
    if (!fs.existsSync(filePath)) {
      log(`❌ File ${filePath} does not exist`, 'red');
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update each key-value pair
    Object.entries(updates).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value}`);
        log(`✅ Updated ${key}`, 'green');
      } else {
        log(`⚠️  Key ${key} not found in ${filePath}`, 'yellow');
      }
    });

    fs.writeFileSync(filePath, content);
    return true;
  } catch (error) {
    log(`❌ Error updating ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function main() {
  log('🚀 Diet Game Environment Setup', 'cyan');
  log('================================', 'cyan');
  
  // Generate secure secrets
  const jwtSecret = generateSecret(64);
  const jwtRefreshSecret = generateSecret(64);
  const sessionSecret = generateSecret(32);
  const encryptionKey = generateEncryptionKey();
  
  log('\n📋 Generated secure secrets:', 'blue');
  log(`JWT Secret: ${jwtSecret.substring(0, 20)}...`, 'green');
  log(`JWT Refresh Secret: ${jwtRefreshSecret.substring(0, 20)}...`, 'green');
  log(`Session Secret: ${sessionSecret.substring(0, 20)}...`, 'green');
  log(`Encryption Key: ${encryptionKey}`, 'green');
  
  // Setup backend environment
  log('\n🔧 Setting up backend environment...', 'blue');
  const backendEnvCreated = copyEnvFile(
    path.join(projectRoot, 'backend', 'env.setup'),
    path.join(projectRoot, 'backend', '.env')
  );
  
  if (backendEnvCreated) {
    updateEnvFile(path.join(projectRoot, 'backend', '.env'), {
      'JWT_SECRET': jwtSecret,
      'JWT_REFRESH_SECRET': jwtRefreshSecret,
      'SESSION_SECRET': sessionSecret,
      'ENCRYPTION_KEY': encryptionKey
    });
  }
  
  // Setup frontend environment
  log('\n🔧 Setting up frontend environment...', 'blue');
  const frontendEnvCreated = copyEnvFile(
    path.join(projectRoot, 'env.setup'),
    path.join(projectRoot, '.env')
  );
  
  // Create logs directory
  const logsDir = path.join(projectRoot, 'backend', 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    log('✅ Created logs directory', 'green');
  }
  
  // Create uploads directory
  const uploadsDir = path.join(projectRoot, 'backend', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    log('✅ Created uploads directory', 'green');
  }
  
  log('\n🎉 Environment setup complete!', 'green');
  log('\n📝 Next steps:', 'blue');
  log('1. Update API keys in backend/.env and .env files', 'yellow');
  log('2. Configure your database connection', 'yellow');
  log('3. Set up Firebase project and update credentials', 'yellow');
  log('4. Run: cd backend && npm run migrate', 'yellow');
  log('5. Run: cd backend && npm run seed', 'yellow');
  log('6. Start backend: cd backend && npm run dev', 'yellow');
  log('7. Start frontend: npm run dev', 'yellow');
  
  log('\n📖 See ENVIRONMENT_SETUP.md for detailed instructions', 'cyan');
}

// Run the setup
main();
