/**
 * Database Migration Script
 * Runs all pending database migrations in order
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';

// Migration tracking table
const MIGRATIONS_TABLE = 'migrations';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface Migration {
  id: string;
  filename: string;
  executed_at: Date;
}

class DatabaseMigrator {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: config.database.url,
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
    });
  }

  async initialize(): Promise<void> {
    try {
      // First, try to create the database if it doesn't exist
      await this.ensureDatabaseExists();
      
      // Create migrations table if it doesn't exist
      await this.createMigrationsTable();
      logger.info('✅ Migration system initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize migration system:', error);
      throw error;
    }
  }

  private async ensureDatabaseExists(): Promise<void> {
    const adminPool = new Pool({
      host: config.database.host,
      port: config.database.port,
      database: 'postgres', // Connect to default postgres database
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
    });

    try {
      // Check if database exists
      const result = await adminPool.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [config.database.name]
      );

      if (result.rows.length === 0) {
        logger.info(`📦 Creating database: ${config.database.name}`);
        await adminPool.query(`CREATE DATABASE "${config.database.name}"`);
        logger.info(`✅ Database created: ${config.database.name}`);
      } else {
        logger.info(`✅ Database exists: ${config.database.name}`);
      }
    } finally {
      await adminPool.end();
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await this.pool.query(query);
  }

  async getExecutedMigrations(): Promise<Migration[]> {
    try {
      const result = await this.pool.query(
        `SELECT id, filename, executed_at FROM ${MIGRATIONS_TABLE} ORDER BY id`
      );
      logger.info(`📋 Retrieved ${result.rows.length} executed migrations from database`);
      return result.rows;
    } catch (error) {
      logger.error('Failed to get executed migrations:', error);
      return [];
    }
  }

  async getMigrationFiles(): Promise<string[]> {
    // Get the directory where this script is located
    const scriptDir = join(__dirname, '..', '..');
    const migrationsDir = join(scriptDir, 'migrations');
    
    logger.info(`Looking for migrations in: ${migrationsDir}`);
    
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    logger.info(`Found ${files.length} migration files: ${files.join(', ')}`);
    
    return files;
  }

  async executeMigration(filename: string): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if migration has already been executed
      const migrationId = filename.replace('.sql', '');
      const existingMigration = await client.query(
        `SELECT id FROM ${MIGRATIONS_TABLE} WHERE id = $1`,
        [migrationId]
      );
      
      if (existingMigration.rows.length > 0) {
        logger.info(`⏭️  Migration already executed: ${filename}`);
        await client.query('COMMIT');
        return;
      }
      
      // Read migration file
      const scriptDir = join(__dirname, '..', '..');
      const migrationPath = join(scriptDir, 'migrations', filename);
      const migrationSQL = readFileSync(migrationPath, 'utf8');
      
      // Execute migration
      await client.query(migrationSQL);
      
      // Record migration as executed
      await client.query(
        `INSERT INTO ${MIGRATIONS_TABLE} (id, filename) VALUES ($1, $2)`,
        [migrationId, filename]
      );
      
      await client.query('COMMIT');
      logger.info(`✅ Migration executed: ${filename}`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`❌ Migration failed: ${filename}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  async runMigrations(): Promise<void> {
    try {
      await this.initialize();
      
      const executedMigrations = await this.getExecutedMigrations();
      const executedFilenames = new Set(executedMigrations.map(m => m.filename));
      
      const migrationFiles = await this.getMigrationFiles();
      const pendingMigrations = migrationFiles.filter(file => !executedFilenames.has(file));
      
      if (pendingMigrations.length === 0) {
        logger.info('✅ No pending migrations');
        return;
      }
      
      logger.info(`📋 Found ${pendingMigrations.length} pending migrations`);
      
      // Check if we need to mark existing migrations as executed
      logger.info(`🔍 Checking migration state: executedMigrations.length=${executedMigrations.length}, migrationFiles.length=${migrationFiles.length}`);
      if (executedMigrations.length === 0 && migrationFiles.length > 0) {
        logger.info('🔍 No migration history found, checking for existing tables...');
        await this.markExistingMigrationsAsExecuted(migrationFiles);
        
        // Re-check for pending migrations after marking existing ones
        const updatedExecutedMigrations = await this.getExecutedMigrations();
        const updatedExecutedFilenames = new Set(updatedExecutedMigrations.map(m => m.filename));
        const updatedPendingMigrations = migrationFiles.filter(file => !updatedExecutedFilenames.has(file));
        
        logger.info(`📊 Migration status after marking existing ones:`);
        logger.info(`   Executed migrations: ${updatedExecutedMigrations.map(m => m.filename).join(', ')}`);
        logger.info(`   Pending migrations: ${updatedPendingMigrations.join(', ')}`);
        
        if (updatedPendingMigrations.length === 0) {
          logger.info('✅ All migrations already applied');
          return;
        }
        
        logger.info(`📋 Found ${updatedPendingMigrations.length} new pending migrations`);
        
        for (const filename of updatedPendingMigrations) {
          // Skip migrations that we know have already been applied
          if (filename === '001_initial_schema.sql' || filename === '002_seed_data.sql') {
            logger.info(`⏭️  Skipping already applied migration: ${filename}`);
            continue;
          }
          
          logger.info(`🔄 Running migration: ${filename}`);
          await this.executeMigration(filename);
        }
      } else {
        // Handle the case where some migrations are already executed but others are not
        // First, let's manually mark the first two migrations as executed if they haven't been marked yet
        await this.ensureFirstTwoMigrationsMarked();
        
        // Re-check for pending migrations
        const updatedExecutedMigrations = await this.getExecutedMigrations();
        const updatedExecutedFilenames = new Set(updatedExecutedMigrations.map(m => m.filename));
        const updatedPendingMigrations = migrationFiles.filter(file => !updatedExecutedFilenames.has(file));
        
        logger.info(`📊 Final migration status:`);
        logger.info(`   Executed migrations: ${updatedExecutedMigrations.map(m => m.filename).join(', ')}`);
        logger.info(`   Pending migrations: ${updatedPendingMigrations.join(', ')}`);
        
        for (const filename of updatedPendingMigrations) {
          logger.info(`🔄 Running migration: ${filename}`);
          await this.executeMigration(filename);
        }
      }
      
      logger.info('✅ All migrations completed successfully');
      
    } catch (error) {
      logger.error('❌ Migration process failed:', error);
      throw error;
    }
  }

  private async ensureFirstTwoMigrationsMarked(): Promise<void> {
    try {
      // Check if first two migrations are marked as executed
      const result = await this.pool.query(`
        SELECT id FROM ${MIGRATIONS_TABLE} 
        WHERE id IN ('001_initial_schema', '002_seed_data')
      `);
      
      const markedMigrations = result.rows.map(row => row.id);
      
      if (!markedMigrations.includes('001_initial_schema')) {
        logger.info('📝 Manually marking 001_initial_schema as executed');
        await this.pool.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (id, filename) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
          ['001_initial_schema', '001_initial_schema.sql']
        );
      }
      
      if (!markedMigrations.includes('002_seed_data')) {
        logger.info('📝 Manually marking 002_seed_data as executed');
        await this.pool.query(
          `INSERT INTO ${MIGRATIONS_TABLE} (id, filename) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
          ['002_seed_data', '002_seed_data.sql']
        );
      }
    } catch (error) {
      logger.error('❌ Failed to mark first two migrations as executed:', error);
      throw error;
    }
  }

  private async markExistingMigrationsAsExecuted(migrationFiles: string[]): Promise<void> {
    // Use the main pool instead of a separate connection to ensure consistency
    try {
      await this.pool.query('BEGIN');
      
      for (const filename of migrationFiles) {
        const migrationId = filename.replace('.sql', '');
        
        // Check if this migration has already been applied by looking for key tables/features
        let shouldMarkAsExecuted = false;
        
        if (filename === '001_initial_schema.sql') {
          // Check if users table exists
          const result = await this.pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'users'
            );
          `);
          shouldMarkAsExecuted = result.rows[0].exists;
        } else if (filename === '002_seed_data.sql') {
          // Check if there's seed data
          try {
            const result = await this.pool.query('SELECT COUNT(*) FROM achievements');
            shouldMarkAsExecuted = parseInt(result.rows[0].count) > 0;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '003_nutrition_tracking_schema.sql') {
          // Check if nutrition tables exist
          const result = await this.pool.query(`
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public' 
              AND table_name = 'food_items'
            );
          `);
          shouldMarkAsExecuted = result.rows[0].exists;
        } else if (filename === '004_nutrition_seed_data.sql') {
          // Check if nutrition seed data exists
          try {
            const result = await this.pool.query('SELECT COUNT(*) FROM food_items');
            shouldMarkAsExecuted = parseInt(result.rows[0].count) > 0;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '005_social_features_schema.sql') {
          // Check if social tables exist
          try {
            const result = await this.pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'user_follows'
              );
            `);
            shouldMarkAsExecuted = result.rows[0].exists;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '006_security_features_schema.sql') {
          // Check if security tables exist
          try {
            const result = await this.pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'security_audit_logs'
              );
            `);
            shouldMarkAsExecuted = result.rows[0].exists;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '006_social_recommendations_schema.sql') {
          // Check if social recommendation tables exist
          try {
            const result = await this.pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'social_recommendations'
              );
            `);
            shouldMarkAsExecuted = result.rows[0].exists;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '007_enhanced_recommendations_schema.sql') {
          // Check if enhanced recommendation tables exist
          try {
            const result = await this.pool.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'ai_recommendations'
              );
            `);
            shouldMarkAsExecuted = result.rows[0].exists;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        } else if (filename === '008_performance_optimization_indexes.sql') {
          // Check if performance indexes exist
          try {
            const result = await this.pool.query(`
              SELECT EXISTS (
                SELECT FROM pg_indexes 
                WHERE indexname = 'idx_users_email'
              );
            `);
            shouldMarkAsExecuted = result.rows[0].exists;
          } catch (error) {
            shouldMarkAsExecuted = false;
          }
        }
        
        if (shouldMarkAsExecuted) {
          const insertResult = await this.pool.query(
            `INSERT INTO ${MIGRATIONS_TABLE} (id, filename) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
            [migrationId, filename]
          );
          logger.info(`✅ Marked existing migration as executed: ${filename} (ID: ${migrationId})`);
        } else {
          logger.info(`⏭️  Skipping migration (not yet applied): ${filename}`);
        }
      }
      
      await this.pool.query('COMMIT');
      
    } catch (error) {
      await this.pool.query('ROLLBACK');
      logger.error('❌ Failed to mark existing migrations as executed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Main execution
async function main() {
  logger.info('🚀 Starting database migration process...');
  const migrator = new DatabaseMigrator();
  
  try {
    await migrator.runMigrations();
    logger.info('✅ Migration process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await migrator.close();
  }
}

// Run if called directly
// Check if this module is being run directly by comparing the resolved file paths
const currentFile = fileURLToPath(import.meta.url);
const mainFile = process.argv[1];

if (currentFile === mainFile) {
  main();
}

export { DatabaseMigrator };
