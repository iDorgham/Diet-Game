/**
 * Security Migration Script
 * Runs the security features migration specifically
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'diet_game',
  user: process.env.DB_USER || 'username',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.DB_SSL === 'true',
});

async function runSecurityMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting security features migration...');
    
    // Read the security migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '006_security_features_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');
    
    console.log('✅ Security features migration completed successfully!');
    console.log('🔒 Security tables created:');
    console.log('   - user_sessions');
    console.log('   - token_blacklist');
    console.log('   - security_events');
    console.log('   - consent_records');
    console.log('   - data_processing_records');
    console.log('   - data_subject_requests');
    console.log('   - password_history');
    console.log('   - password_reset_tokens');
    console.log('   - user_2fa_settings');
    console.log('   - user_2fa_attempts');
    console.log('   - user_security_settings');
    console.log('   - security_policies');
    console.log('   - encrypted_data');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Security migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runSecurityMigration()
  .then(() => {
    console.log('🎉 Security migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  });
