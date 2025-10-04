/**
 * Database Connection
 * PostgreSQL database connection and management
 */

import { Pool, PoolClient } from 'pg';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';

let pool: Pool;

export const initializeDatabase = async (): Promise<void> => {
  try {
    pool = new Pool({
      connectionString: config.database.url,
      host: config.database.host,
      port: config.database.port,
      database: config.database.name,
      user: config.database.user,
      password: config.database.password,
      ssl: config.database.ssl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to database:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

export const closeDatabase = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
};
