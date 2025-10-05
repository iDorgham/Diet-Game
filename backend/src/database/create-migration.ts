/**
 * Create Migration Script
 * Creates a new migration file with timestamp
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function createMigrationFile(name: string): void {
  const timestamp = generateTimestamp();
  const filename = `${timestamp}_${name}.sql`;
  const migrationsDir = join(process.cwd(), 'migrations');
  
  // Ensure migrations directory exists
  if (!existsSync(migrationsDir)) {
    mkdirSync(migrationsDir, { recursive: true });
  }
  
  const filepath = join(migrationsDir, filename);
  
  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: ${name.replace(/_/g, ' ')}

-- Add your migration SQL here
-- Example:
-- CREATE TABLE example_table (
--     id SERIAL PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Remember to:
-- 1. Use transactions for complex migrations
-- 2. Add proper indexes
-- 3. Include rollback instructions in comments
-- 4. Test migrations on development data first
`;

  writeFileSync(filepath, template);
  console.log(`✅ Created migration: ${filename}`);
  console.log(`📁 Location: ${filepath}`);
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Please provide a migration name');
    console.log('Usage: npm run migrate:create <migration_name>');
    console.log('Example: npm run migrate:create add_user_preferences');
    process.exit(1);
  }
  
  const migrationName = args[0];
  
  // Validate migration name exists
  if (!migrationName) {
    console.error('❌ Migration name is required');
    process.exit(1);
  }
  
  // Validate migration name format
  if (!/^[a-z0-9_]+$/.test(migrationName)) {
    console.error('❌ Migration name must contain only lowercase letters, numbers, and underscores');
    process.exit(1);
  }
  
  createMigrationFile(migrationName);
}

// Run if called directly
if (require.main === module) {
  main();
}
