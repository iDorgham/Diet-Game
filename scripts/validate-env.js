#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are properly configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

function validateBackendEnv() {
  log('\n🔍 Validating Backend Environment...', 'blue');
  
  const envPath = path.join(projectRoot, 'backend', '.env');
  const env = parseEnvFile(envPath);
  
  if (!env) {
    log('❌ Backend .env file not found', 'red');
    return false;
  }
  
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'FIREBASE_PROJECT_ID'
  ];
  
  const optionalVars = [
    'GROK_API_KEY',
    'USDA_API_KEY',
    'EDAMAM_APP_ID',
    'EDAMAM_APP_KEY',
    'SPOONACULAR_API_KEY',
    'SENTRY_DSN'
  ];
  
  let allValid = true;
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-') || env[varName].includes('change-in-production')) {
      log(`❌ Required: ${varName}`, 'red');
      allValid = false;
    } else {
      log(`✅ Required: ${varName}`, 'green');
    }
  });
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-')) {
      log(`⚠️  Optional: ${varName} (not configured)`, 'yellow');
    } else {
      log(`✅ Optional: ${varName}`, 'green');
    }
  });
  
  return allValid;
}

function validateFrontendEnv() {
  log('\n🔍 Validating Frontend Environment...', 'blue');
  
  const envPath = path.join(projectRoot, '.env');
  const env = parseEnvFile(envPath);
  
  if (!env) {
    log('❌ Frontend .env file not found', 'red');
    return false;
  }
  
  const requiredVars = [
    'VITE_API_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_PROJECT_ID'
  ];
  
  const optionalVars = [
    'VITE_USDA_API_KEY',
    'VITE_EDAMAM_APP_ID',
    'VITE_EDAMAM_APP_KEY',
    'VITE_SPOONACULAR_API_KEY',
    'VITE_SENTRY_DSN',
    'VITE_GOOGLE_ANALYTICS_ID'
  ];
  
  let allValid = true;
  
  // Check required variables
  requiredVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-')) {
      log(`❌ Required: ${varName}`, 'red');
      allValid = false;
    } else {
      log(`✅ Required: ${varName}`, 'green');
    }
  });
  
  // Check optional variables
  optionalVars.forEach(varName => {
    if (!env[varName] || env[varName].includes('your-')) {
      log(`⚠️  Optional: ${varName} (not configured)`, 'yellow');
    } else {
      log(`✅ Optional: ${varName}`, 'green');
    }
  });
  
  return allValid;
}

function checkDirectories() {
  log('\n🔍 Checking Required Directories...', 'blue');
  
  const directories = [
    path.join(projectRoot, 'backend', 'logs'),
    path.join(projectRoot, 'backend', 'uploads')
  ];
  
  let allExist = true;
  
  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      log(`✅ Directory exists: ${path.relative(projectRoot, dir)}`, 'green');
    } else {
      log(`❌ Directory missing: ${path.relative(projectRoot, dir)}`, 'red');
      allExist = false;
    }
  });
  
  return allExist;
}

function main() {
  log('🔍 Diet Game Environment Validation', 'cyan');
  log('====================================', 'cyan');
  
  const backendValid = validateBackendEnv();
  const frontendValid = validateFrontendEnv();
  const directoriesExist = checkDirectories();
  
  log('\n📊 Validation Summary:', 'blue');
  log(`Backend Environment: ${backendValid ? '✅ Valid' : '❌ Invalid'}`, backendValid ? 'green' : 'red');
  log(`Frontend Environment: ${frontendValid ? '✅ Valid' : '❌ Invalid'}`, frontendValid ? 'green' : 'red');
  log(`Directories: ${directoriesExist ? '✅ All exist' : '❌ Missing'}`, directoriesExist ? 'green' : 'red');
  
  if (backendValid && frontendValid && directoriesExist) {
    log('\n🎉 All validations passed! Environment is ready.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some validations failed. Please check the issues above.', 'yellow');
    log('📖 See ENVIRONMENT_SETUP.md for setup instructions.', 'cyan');
    process.exit(1);
  }
}

// Run validation
main();
