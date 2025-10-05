/**
 * Enhanced Recommendations Migration Script
 * Sets up advanced AI scoring and ML features for better recommendation accuracy
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const logger = require('../config/logger');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'diet_game',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

class EnhancedRecommendationsMigration {
  constructor() {
    this.pool = new Pool(dbConfig);
    this.migrationName = 'enhanced_recommendations';
    this.version = '007';
  }

  async run() {
    try {
      logger.info(`Starting ${this.migrationName} migration...`);
      
      // 1. Check if migration already exists
      await this.checkMigrationExists();
      
      // 2. Read and execute SQL migration
      await this.executeSQLMigration();
      
      // 3. Insert seed data
      await this.insertSeedData();
      
      // 4. Create indexes for performance
      await this.createPerformanceIndexes();
      
      // 5. Set up initial ML model data
      await this.setupInitialMLData();
      
      // 6. Record migration completion
      await this.recordMigration();
      
      logger.info(`${this.migrationName} migration completed successfully`);
      
    } catch (error) {
      logger.error(`Error in ${this.migrationName} migration:`, error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }

  async checkMigrationExists() {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM migrations 
        WHERE name = $1 AND version = $2
      )
    `;
    
    const result = await this.pool.query(query, [this.migrationName, this.version]);
    
    if (result.rows[0].exists) {
      throw new Error(`Migration ${this.migrationName} version ${this.version} already exists`);
    }
  }

  async executeSQLMigration() {
    const sqlPath = path.join(__dirname, '..', 'migrations', `${this.version}_enhanced_recommendations_schema.sql`);
    
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`SQL migration file not found: ${sqlPath}`);
    }
    
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL content by semicolons and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await this.pool.query(statement);
          logger.debug(`Executed SQL statement: ${statement.substring(0, 100)}...`);
        } catch (error) {
          logger.error(`Error executing SQL statement: ${statement.substring(0, 100)}...`, error);
          throw error;
        }
      }
    }
    
    logger.info('SQL migration executed successfully');
  }

  async insertSeedData() {
    logger.info('Inserting seed data for enhanced recommendations...');
    
    // Insert default ML model performance baseline
    const modelPerformanceQuery = `
      INSERT INTO ml_model_performance (
        model_version, algorithm_type, accuracy, precision_score, 
        recall_score, f1_score, training_samples, validation_samples
      ) VALUES 
      ('1.0', 'neural_network', 0.75, 0.72, 0.68, 0.70, 1000, 200),
      ('1.0', 'random_forest', 0.73, 0.70, 0.66, 0.68, 1000, 200),
      ('1.0', 'gradient_boosting', 0.77, 0.74, 0.70, 0.72, 1000, 200),
      ('1.0', 'collaborative_filtering', 0.70, 0.67, 0.63, 0.65, 1000, 200)
      ON CONFLICT DO NOTHING
    `;
    
    await this.pool.query(modelPerformanceQuery);
    
    // Insert default feature importance data
    const featureImportanceQuery = `
      INSERT INTO feature_importance (
        model_version, algorithm_type, feature_name, importance_score, feature_type
      ) VALUES 
      ('1.0', 'friend_recommendation', 'mutual_friends', 0.30, 'social'),
      ('1.0', 'friend_recommendation', 'common_interests', 0.25, 'content'),
      ('1.0', 'friend_recommendation', 'activity_level', 0.20, 'behavioral'),
      ('1.0', 'friend_recommendation', 'location', 0.15, 'geographic'),
      ('1.0', 'friend_recommendation', 'goals', 0.10, 'content'),
      ('1.0', 'team_recommendation', 'goal_alignment', 0.40, 'content'),
      ('1.0', 'team_recommendation', 'activity_compatibility', 0.30, 'behavioral'),
      ('1.0', 'team_recommendation', 'location_proximity', 0.20, 'geographic'),
      ('1.0', 'team_recommendation', 'team_availability', 0.10, 'social'),
      ('1.0', 'content_recommendation', 'interest_relevance', 0.40, 'content'),
      ('1.0', 'content_recommendation', 'friend_connection', 0.30, 'social'),
      ('1.0', 'content_recommendation', 'engagement_prediction', 0.20, 'behavioral'),
      ('1.0', 'content_recommendation', 'recency', 0.10, 'temporal'),
      ('1.0', 'mentorship_recommendation', 'goal_alignment', 0.40, 'content'),
      ('1.0', 'mentorship_recommendation', 'experience_match', 0.30, 'behavioral'),
      ('1.0', 'mentorship_recommendation', 'availability', 0.20, 'temporal'),
      ('1.0', 'mentorship_recommendation', 'rating', 0.10, 'social')
      ON CONFLICT DO NOTHING
    `;
    
    await this.pool.query(featureImportanceQuery);
    
    logger.info('Seed data inserted successfully');
  }

  async createPerformanceIndexes() {
    logger.info('Creating performance indexes...');
    
    const indexes = [
      // Composite indexes for common queries
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_feedback_user_type_created ON recommendation_feedback(user_id, recommendation_type, created_at)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_behavior_patterns_user_type_updated ON user_behavior_patterns(user_id, pattern_type, last_updated)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_interaction_patterns_user_target_type ON user_interaction_patterns(user_id, target_id, target_type)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_generation_user_type_created ON recommendation_generation_log(user_id, recommendation_type, created_at)',
      
      // Partial indexes for active data
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_cache_active ON recommendation_cache(user_id, recommendation_type) WHERE expires_at > NOW()',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_embeddings_latest ON user_embeddings(user_id, model_version) WHERE created_at > NOW() - INTERVAL \'30 days\'',
      
      // GIN indexes for JSONB columns
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_feedback_context_gin ON recommendation_feedback USING GIN (context)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_behavior_patterns_data_gin ON user_behavior_patterns USING GIN (pattern_data)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_generation_context_gin ON recommendation_generation_log USING GIN (context)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_recommendation_cache_data_gin ON recommendation_cache USING GIN (cached_data)',
      
      // Array indexes for embedding vectors
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_embeddings_vector_gin ON user_embeddings USING GIN (embedding_vector)',
      'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_item_embeddings_vector_gin ON item_embeddings USING GIN (embedding_vector)'
    ];
    
    for (const indexQuery of indexes) {
      try {
        await this.pool.query(indexQuery);
        logger.debug(`Created index: ${indexQuery.split(' ')[5]}`);
      } catch (error) {
        logger.warn(`Index creation failed (may already exist): ${error.message}`);
      }
    }
    
    logger.info('Performance indexes created successfully');
  }

  async setupInitialMLData() {
    logger.info('Setting up initial ML model data...');
    
    // Create initial user embeddings for existing users
    const usersQuery = 'SELECT id FROM users WHERE is_active = true LIMIT 100';
    const usersResult = await this.pool.query(usersQuery);
    
    if (usersResult.rows.length > 0) {
      const embeddingValues = usersResult.rows.map(user => {
        // Generate random initial embeddings (in real implementation, these would be learned)
        const embedding = Array.from({ length: 64 }, () => Math.random() * 2 - 1);
        return `('${user.id}', ARRAY[${embedding.join(',')}], 64, '1.0')`;
      }).join(',');
      
      const insertEmbeddingsQuery = `
        INSERT INTO user_embeddings (user_id, embedding_vector, embedding_dimension, model_version)
        VALUES ${embeddingValues}
        ON CONFLICT (user_id, model_version) DO NOTHING
      `;
      
      await this.pool.query(insertEmbeddingsQuery);
      logger.info(`Created initial embeddings for ${usersResult.rows.length} users`);
    }
    
    // Create initial behavior patterns for active users
    const behaviorPatternsQuery = `
      INSERT INTO user_behavior_patterns (user_id, pattern_type, pattern_data, confidence_score)
      SELECT 
        u.id,
        'default_behavior',
        jsonb_build_object(
          'posting_frequency', 0.5,
          'engagement_style', 'moderate',
          'interaction_preferences', '["likes", "comments"]',
          'activity_timing', 'evening',
          'content_preferences', '["fitness", "nutrition"]'
        ),
        0.5
      FROM users u
      WHERE u.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM user_behavior_patterns ubp 
        WHERE ubp.user_id = u.id AND ubp.pattern_type = 'default_behavior'
      )
      LIMIT 100
    `;
    
    const behaviorResult = await this.pool.query(behaviorPatternsQuery);
    logger.info(`Created initial behavior patterns for ${behaviorResult.rowCount} users`);
  }

  async recordMigration() {
    const query = `
      INSERT INTO migrations (name, version, executed_at, description)
      VALUES ($1, $2, NOW(), $3)
    `;
    
    const description = 'Enhanced AI scoring algorithms with ML features for better recommendation accuracy';
    
    await this.pool.query(query, [this.migrationName, this.version, description]);
    logger.info('Migration recorded successfully');
  }

  async rollback() {
    try {
      logger.info(`Rolling back ${this.migrationName} migration...`);
      
      // Drop tables in reverse order (respecting foreign key constraints)
      const dropTables = [
        'DROP TABLE IF EXISTS recommendation_ab_tests CASCADE',
        'DROP TABLE IF EXISTS feature_importance CASCADE',
        'DROP TABLE IF EXISTS recommendation_cache CASCADE',
        'DROP TABLE IF EXISTS algorithm_weights CASCADE',
        'DROP TABLE IF EXISTS user_interaction_patterns CASCADE',
        'DROP TABLE IF EXISTS recommendation_generation_log CASCADE',
        'DROP TABLE IF EXISTS item_embeddings CASCADE',
        'DROP TABLE IF EXISTS user_embeddings CASCADE',
        'DROP TABLE IF EXISTS ml_model_performance CASCADE',
        'DROP TABLE IF EXISTS user_behavior_patterns CASCADE',
        'DROP TABLE IF EXISTS recommendation_feedback CASCADE'
      ];
      
      for (const dropQuery of dropTables) {
        await this.pool.query(dropQuery);
        logger.debug(`Dropped table: ${dropQuery.split(' ')[4]}`);
      }
      
      // Drop views
      await this.pool.query('DROP VIEW IF EXISTS ml_model_performance_summary CASCADE');
      await this.pool.query('DROP VIEW IF EXISTS user_feedback_summary CASCADE');
      await this.pool.query('DROP VIEW IF EXISTS recommendation_performance_summary CASCADE');
      
      // Drop functions
      await this.pool.query('DROP FUNCTION IF EXISTS update_user_behavior_pattern(UUID, VARCHAR, JSONB, DECIMAL) CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS get_user_recommendation_stats(UUID) CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS clean_expired_recommendation_cache() CASCADE');
      await this.pool.query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE');
      
      // Remove migration record
      await this.pool.query('DELETE FROM migrations WHERE name = $1 AND version = $2', 
        [this.migrationName, this.version]);
      
      logger.info(`${this.migrationName} migration rolled back successfully`);
      
    } catch (error) {
      logger.error(`Error rolling back ${this.migrationName} migration:`, error);
      throw error;
    } finally {
      await this.pool.end();
    }
  }
}

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const migration = new EnhancedRecommendationsMigration();
  
  if (command === 'rollback') {
    migration.rollback()
      .then(() => {
        logger.info('Rollback completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Rollback failed:', error);
        process.exit(1);
      });
  } else {
    migration.run()
      .then(() => {
        logger.info('Migration completed');
        process.exit(0);
      })
      .catch((error) => {
        logger.error('Migration failed:', error);
        process.exit(1);
      });
  }
}

module.exports = EnhancedRecommendationsMigration;
