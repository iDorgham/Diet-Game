// Database connection and initialization
// Sprint 7-8: Core Backend Development - Day 1 Task 1.1

import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'diet_game_gamification',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    logger.info('Database connection successful', { timestamp: result.rows[0].now });
    return true;
  } catch (error) {
    logger.error('Database connection failed', { error: error.message });
    return false;
  }
}

// Initialize database schema
export async function initializeDatabase() {
  try {
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Cannot connect to database');
    }

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    const client = await pool.connect();
    try {
      await client.query(schema);
      logger.info('Database schema initialized successfully');
    } finally {
      client.release();
    }

    return true;
  } catch (error) {
    logger.error('Database initialization failed', { error: error.message });
    throw error;
  }
}

// Database query helper with error handling
export async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Database query executed', { 
      query: text.substring(0, 100) + '...', 
      duration: `${duration}ms`,
      rows: result.rowCount 
    });
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    logger.error('Database query failed', { 
      query: text.substring(0, 100) + '...', 
      duration: `${duration}ms`,
      error: error.message 
    });
    throw error;
  }
}

// Transaction helper
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Health check for database
export async function healthCheck() {
  try {
    const result = await query('SELECT 1 as health');
    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Graceful shutdown
export async function closeDatabase() {
  try {
    await pool.end();
    logger.info('Database connection pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error: error.message });
  }
}

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);
