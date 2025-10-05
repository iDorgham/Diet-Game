#!/usr/bin/env node

/**
 * Social Recommendations Migration Script
 * Migrates the database to include social recommendations and insights schema
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Social Recommendations Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'migrations', '006_social_recommendations_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    console.log('📊 Creating social recommendations schema...');
    await client.query(migrationSQL);
    
    // Verify the migration
    console.log('✅ Verifying migration...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'recommendation_feedback',
        'recommendation_performance', 
        'social_insights_cache',
        'recommendation_algorithm_versions',
        'user_recommendation_preferences',
        'recommendation_interactions'
      )
      ORDER BY table_name
    `);
    
    console.log('📋 Created tables:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Check functions
    const functions = await client.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN (
        'get_recommendation_performance_stats',
        'get_user_recommendation_preferences',
        'update_recommendation_performance',
        'cleanup_expired_insights_cache',
        'get_recommendation_interaction_analytics',
        'schedule_insights_cache_cleanup'
      )
      ORDER BY routine_name
    `);
    
    console.log('🔧 Created functions:');
    functions.rows.forEach(row => {
      console.log(`   ✓ ${row.routine_name}`);
    });
    
    // Check algorithm versions
    const algorithms = await client.query(`
      SELECT algorithm_name, version, is_active 
      FROM recommendation_algorithm_versions 
      ORDER BY algorithm_name
    `);
    
    console.log('🤖 Algorithm versions:');
    algorithms.rows.forEach(row => {
      console.log(`   ✓ ${row.algorithm_name} v${row.version} ${row.is_active ? '(active)' : '(inactive)'}`);
    });
    
    // Check user preferences
    const userPrefs = await client.query(`
      SELECT COUNT(*) as count 
      FROM user_recommendation_preferences
    `);
    
    console.log(`👥 User preferences created: ${userPrefs.rows[0].count}`);
    
    console.log('🎉 Social Recommendations Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Start the backend server: npm run dev');
    console.log('   2. Test the recommendation endpoints');
    console.log('   3. Configure recommendation algorithms if needed');
    console.log('   4. Set up scheduled cache cleanup');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error);
