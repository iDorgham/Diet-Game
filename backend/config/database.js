// Database Configuration for Diet Game
// Week 1: Core Backend Development

const { Pool } = require('pg');
require('dotenv').config();

// Database configuration for different environments
const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME_DEV || 'dietgame_dev',
    user: process.env.DB_USER || 'dietgame_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    max: parseInt(process.env.DB_POOL_MAX) || 20, // Maximum number of clients in the pool
    min: parseInt(process.env.DB_POOL_MIN) || 2,  // Minimum number of clients in the pool
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) || 2000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME_TEST || 'dietgame_test',
    user: process.env.DB_USER || 'dietgame_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    max: 5, // Smaller pool for testing
    min: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME_PROD,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }, // Always use SSL in production
    max: parseInt(process.env.DB_POOL_MAX) || 20,
    min: parseInt(process.env.DB_POOL_MIN) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) || 2000,
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';

// Validate required environment variables for production
if (env === 'production') {
  const requiredVars = ['DB_HOST', 'DB_NAME_PROD', 'DB_USER', 'DB_PASSWORD'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingVars.join(', ')}`);
  }
}

// Create connection pool
const pool = new Pool(dbConfig[env]);

// Pool event handlers
pool.on('connect', (client) => {
  console.log(`📊 Database connected: ${client.database}@${client.host}:${client.port}`);
});

pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

pool.on('acquire', (client) => {
  console.log('🔗 Database client acquired from pool');
});

pool.on('remove', (client) => {
  console.log('🔌 Database client removed from pool');
});

// Database utility functions
class DatabaseService {
  constructor() {
    this.pool = pool;
  }

  // Execute a query with parameters
  async query(text, params = []) {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log(`📝 Query executed in ${duration}ms: ${text.substring(0, 50)}...`);
      return result;
    } catch (error) {
      console.error('❌ Database query error:', error);
      throw error;
    }
  }

  // Get a client from the pool for transactions
  async getClient() {
    return await this.pool.connect();
  }

  // Execute a transaction
  async transaction(callback) {
    const client = await this.getClient();
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

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as version');
      return {
        status: 'healthy',
        timestamp: result.rows[0].current_time,
        version: result.rows[0].version,
        environment: env,
        database: dbConfig[env].database
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        environment: env,
        database: dbConfig[env].database
      };
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const queries = [
        'SELECT COUNT(*) as user_count FROM users',
        'SELECT COUNT(*) as achievement_count FROM achievements',
        'SELECT COUNT(*) as quest_count FROM quests',
        'SELECT COUNT(*) as active_quests FROM user_quests WHERE is_active = true',
        'SELECT COUNT(*) as unlocked_achievements FROM user_achievements',
        'SELECT COUNT(*) as total_transactions FROM virtual_economy'
      ];

      const results = await Promise.all(queries.map(query => this.query(query)));
      
      return {
        users: parseInt(results[0].rows[0].user_count),
        achievements: parseInt(results[1].rows[0].achievement_count),
        quests: parseInt(results[2].rows[0].quest_count),
        activeQuests: parseInt(results[3].rows[0].active_quests),
        unlockedAchievements: parseInt(results[4].rows[0].unlocked_achievements),
        totalTransactions: parseInt(results[5].rows[0].total_transactions)
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }

  // Close the pool
  async close() {
    await this.pool.end();
    console.log('🔌 Database pool closed');
  }
}

// Create database service instance
const db = new DatabaseService();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, closing database connections...');
  await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, closing database connections...');
  await db.close();
  process.exit(0);
});

// Export pool and service
module.exports = {
  pool,
  db,
  dbConfig: dbConfig[env]
};
