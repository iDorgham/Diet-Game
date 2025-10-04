#!/usr/bin/env node

// Database Testing Script for Diet Game
// Week 1: Core Backend Development

const { db } = require('../config/database');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility functions
const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const test = async (testName, testFunction) => {
  testResults.total++;
  try {
    await testFunction();
    log(`✅ ${testName}`, 'green');
    testResults.passed++;
  } catch (error) {
    log(`❌ ${testName}: ${error.message}`, 'red');
    testResults.failed++;
  }
};

// Test functions
const testDatabaseConnection = async () => {
  const health = await db.healthCheck();
  if (health.status !== 'healthy') {
    throw new Error(`Database health check failed: ${health.error}`);
  }
  log(`   Database: ${health.database}`, 'cyan');
  log(`   Environment: ${health.environment}`, 'cyan');
};

const testTableExistence = async () => {
  const requiredTables = [
    'users', 'user_profiles', 'user_sessions', 'user_progress',
    'achievements', 'user_achievements', 'quests', 'user_quests',
    'streaks', 'virtual_economy', 'shop_items', 'user_inventory',
    'leaderboard_entries', 'user_statistics', 'activity_logs'
  ];

  for (const table of requiredTables) {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [table]);
    
    if (!result.rows[0].exists) {
      throw new Error(`Table '${table}' does not exist`);
    }
  }
};

const testIndexes = async () => {
  const requiredIndexes = [
    'idx_users_email', 'idx_users_username', 'idx_user_progress_user_id',
    'idx_user_achievements_user_id', 'idx_user_quests_user_id',
    'idx_streaks_user_id', 'idx_virtual_economy_user_id'
  ];

  for (const index of requiredIndexes) {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM pg_indexes 
        WHERE indexname = $1
      );
    `, [index]);
    
    if (!result.rows[0].exists) {
      throw new Error(`Index '${index}' does not exist`);
    }
  }
};

const testSeedData = async () => {
  // Test achievements
  const achievementCount = await db.query('SELECT COUNT(*) FROM achievements');
  if (parseInt(achievementCount.rows[0].count) < 20) {
    throw new Error('Insufficient achievement seed data');
  }

  // Test quests
  const questCount = await db.query('SELECT COUNT(*) FROM quests');
  if (parseInt(questCount.rows[0].count) < 15) {
    throw new Error('Insufficient quest seed data');
  }

  // Test shop items
  const shopItemCount = await db.query('SELECT COUNT(*) FROM shop_items');
  if (parseInt(shopItemCount.rows[0].count) < 10) {
    throw new Error('Insufficient shop item seed data');
  }

  // Test sample users
  const userCount = await db.query('SELECT COUNT(*) FROM users');
  if (parseInt(userCount.rows[0].count) < 3) {
    throw new Error('Insufficient sample user data');
  }
};

const testUserProgress = async () => {
  const result = await db.query(`
    SELECT up.*, u.username 
    FROM user_progress up 
    JOIN users u ON up.user_id = u.id 
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No user progress data found');
  }

  const progress = result.rows[0];
  if (progress.level < 1 || progress.total_xp < 0 || progress.coins < 0) {
    throw new Error('Invalid user progress data');
  }
};

const testAchievements = async () => {
  const result = await db.query(`
    SELECT a.*, ua.user_id, ua.unlocked_at
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id
    WHERE a.rarity = 'common'
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No achievement data found');
  }

  const achievement = result.rows[0];
  if (!achievement.name || !achievement.description || !achievement.category) {
    throw new Error('Invalid achievement data');
  }
};

const testQuests = async () => {
  const result = await db.query(`
    SELECT q.*, uq.user_id, uq.progress, uq.is_active
    FROM quests q
    LEFT JOIN user_quests uq ON q.id = uq.quest_id
    WHERE q.type = 'daily'
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No quest data found');
  }

  const quest = result.rows[0];
  if (!quest.name || !quest.description || quest.xp_reward < 0) {
    throw new Error('Invalid quest data');
  }
};

const testStreaks = async () => {
  const result = await db.query(`
    SELECT s.*, u.username
    FROM streaks s
    JOIN users u ON s.user_id = u.id
    WHERE s.is_active = true
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No active streak data found');
  }

  const streak = result.rows[0];
  if (!streak.name || !streak.category || streak.current_count < 0) {
    throw new Error('Invalid streak data');
  }
};

const testVirtualEconomy = async () => {
  const result = await db.query(`
    SELECT ve.*, u.username
    FROM virtual_economy ve
    JOIN users u ON ve.user_id = u.id
    ORDER BY ve.created_at DESC
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No virtual economy transaction data found');
  }

  const transaction = result.rows[0];
  if (!transaction.transaction_type || !transaction.amount || !transaction.balance_after) {
    throw new Error('Invalid virtual economy transaction data');
  }
};

const testLeaderboard = async () => {
  const result = await db.query(`
    SELECT le.*, u.username
    FROM leaderboard_entries le
    JOIN users u ON le.user_id = u.id
    WHERE le.category = 'overall'
    ORDER BY le.rank
    LIMIT 1
  `);
  
  if (result.rows.length === 0) {
    throw new Error('No leaderboard data found');
  }

  const entry = result.rows[0];
  if (entry.rank < 1 || entry.score < 0 || entry.level < 1) {
    throw new Error('Invalid leaderboard entry data');
  }
};

const testDatabaseFunctions = async () => {
  // Test level calculation function
  const levelResult = await db.query('SELECT * FROM calculate_level_from_xp(1250)');
  if (levelResult.rows.length === 0) {
    throw new Error('Level calculation function not working');
  }

  const levelData = levelResult.rows[0];
  if (levelData.level < 1 || levelData.current_xp < 0) {
    throw new Error('Invalid level calculation result');
  }
};

const testViews = async () => {
  const views = [
    'user_progress_view',
    'active_quests_view', 
    'user_achievements_view',
    'leaderboard_view'
  ];

  for (const view of views) {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.views 
        WHERE table_schema = 'public' 
        AND table_name = $1
      );
    `, [view]);
    
    if (!result.rows[0].exists) {
      throw new Error(`View '${view}' does not exist`);
    }
  }
};

const testRowLevelSecurity = async () => {
  const tablesWithRLS = [
    'users', 'user_profiles', 'user_progress', 'user_achievements',
    'user_quests', 'streaks', 'virtual_economy', 'user_inventory'
  ];

  for (const table of tablesWithRLS) {
    const result = await db.query(`
      SELECT relrowsecurity 
      FROM pg_class 
      WHERE relname = $1
    `, [table]);
    
    if (result.rows.length === 0 || !result.rows[0].relrowsecurity) {
      throw new Error(`Row Level Security not enabled on table '${table}'`);
    }
  }
};

const testPerformance = async () => {
  const startTime = Date.now();
  
  // Test a complex query
  await db.query(`
    SELECT 
      u.username,
      up.level,
      up.total_xp,
      up.coins,
      COUNT(ua.id) as achievement_count,
      COUNT(uq.id) as quest_count
    FROM users u
    JOIN user_progress up ON u.id = up.user_id
    LEFT JOIN user_achievements ua ON u.id = ua.user_id
    LEFT JOIN user_quests uq ON u.id = uq.user_id
    GROUP BY u.id, u.username, up.level, up.total_xp, up.coins
    ORDER BY up.total_xp DESC
    LIMIT 10
  `);
  
  const duration = Date.now() - startTime;
  if (duration > 1000) {
    throw new Error(`Query performance too slow: ${duration}ms`);
  }
  
  log(`   Query executed in ${duration}ms`, 'cyan');
};

const testDatabaseStats = async () => {
  const stats = await db.getStats();
  
  log(`   Users: ${stats.users}`, 'cyan');
  log(`   Achievements: ${stats.achievements}`, 'cyan');
  log(`   Quests: ${stats.quests}`, 'cyan');
  log(`   Active Quests: ${stats.activeQuests}`, 'cyan');
  log(`   Unlocked Achievements: ${stats.unlockedAchievements}`, 'cyan');
  log(`   Total Transactions: ${stats.totalTransactions}`, 'cyan');
  
  if (stats.users < 3 || stats.achievements < 20 || stats.quests < 15) {
    throw new Error('Insufficient data in database');
  }
};

// Main test runner
const runTests = async () => {
  log('🧪 Starting Database Tests', 'blue');
  log('========================', 'blue');
  
  await test('Database Connection', testDatabaseConnection);
  await test('Table Existence', testTableExistence);
  await test('Indexes', testIndexes);
  await test('Seed Data', testSeedData);
  await test('User Progress', testUserProgress);
  await test('Achievements', testAchievements);
  await test('Quests', testQuests);
  await test('Streaks', testStreaks);
  await test('Virtual Economy', testVirtualEconomy);
  await test('Leaderboard', testLeaderboard);
  await test('Database Functions', testDatabaseFunctions);
  await test('Views', testViews);
  await test('Row Level Security', testRowLevelSecurity);
  await test('Performance', testPerformance);
  await test('Database Statistics', testDatabaseStats);
  
  log('\n📊 Test Results', 'blue');
  log('===============', 'blue');
  log(`Total Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  
  if (testResults.failed === 0) {
    log('\n🎉 All tests passed! Database is ready for development.', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please check the database setup.', 'red');
    process.exit(1);
  }
};

// Handle errors
process.on('unhandledRejection', (error) => {
  log(`❌ Unhandled rejection: ${error.message}`, 'red');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  log(`❌ Uncaught exception: ${error.message}`, 'red');
  process.exit(1);
});

// Run tests
runTests().catch((error) => {
  log(`❌ Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
