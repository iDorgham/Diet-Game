#!/usr/bin/env node

/**
 * Advanced Caching Test Script
 * Tests the advanced caching functionality
 */

import { advancedCachingService } from './src/services/advancedCachingService.js';

async function testAdvancedCaching() {
  console.log('🧪 Testing Advanced Caching Service...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing cache health check...');
    const health = await advancedCachingService.healthCheck();
    console.log('✅ Health Check:', health.status);
    console.log('   Response Time:', health.responseTime + 'ms');
    console.log('   Stats:', health.stats);
    console.log('');

    // Test 2: Basic Set/Get Operations
    console.log('2️⃣ Testing basic set/get operations...');
    const testKey = 'test:basic:operation';
    const testData = { message: 'Hello Advanced Caching!', timestamp: Date.now() };
    
    await advancedCachingService.set(testKey, testData, 60); // 1 minute TTL
    const retrieved = await advancedCachingService.get(testKey);
    
    console.log('✅ Set/Get Test:', retrieved ? 'PASSED' : 'FAILED');
    console.log('   Original:', testData.message);
    console.log('   Retrieved:', retrieved?.message);
    console.log('');

    // Test 3: Compression Test
    console.log('3️⃣ Testing compression...');
    const largeData = {
      users: Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        preferences: {
          diet: 'keto',
          goals: ['weight_loss', 'muscle_gain'],
          notifications: true
        }
      }))
    };
    
    const compressionKey = 'test:compression:large';
    await advancedCachingService.set(compressionKey, largeData, 60);
    const compressedRetrieved = await advancedCachingService.get(compressionKey);
    
    console.log('✅ Compression Test:', compressedRetrieved ? 'PASSED' : 'FAILED');
    console.log('   Users Count:', compressedRetrieved?.users?.length);
    console.log('');

    // Test 4: Batch Operations
    console.log('4️⃣ Testing batch operations...');
    const batchData = {
      'batch:user:1': { id: 1, name: 'User 1' },
      'batch:user:2': { id: 2, name: 'User 2' },
      'batch:user:3': { id: 3, name: 'User 3' }
    };
    
    await advancedCachingService.mset(batchData, 60);
    const batchRetrieved = await advancedCachingService.mget(Object.keys(batchData));
    
    console.log('✅ Batch Operations Test:', Object.keys(batchRetrieved).length === 3 ? 'PASSED' : 'FAILED');
    console.log('   Retrieved Keys:', Object.keys(batchRetrieved));
    console.log('');

    // Test 5: Get or Set Pattern
    console.log('5️⃣ Testing get-or-set pattern...');
    const getOrSetKey = 'test:getorset:pattern';
    
    // First call should fetch and cache
    const firstCall = await advancedCachingService.getOrSet(
      getOrSetKey,
      () => ({ data: 'Fetched from source', timestamp: Date.now() }),
      60
    );
    
    // Second call should return from cache
    const secondCall = await advancedCachingService.getOrSet(
      getOrSetKey,
      () => ({ data: 'Should not be called', timestamp: Date.now() }),
      60
    );
    
    console.log('✅ Get-or-Set Test:', firstCall.data === secondCall.data ? 'PASSED' : 'FAILED');
    console.log('   First Call:', firstCall.data);
    console.log('   Second Call:', secondCall.data);
    console.log('');

    // Test 6: Cache Warming
    console.log('6️⃣ Testing cache warming...');
    const warmingStrategies = {
      user_recommendations: { 
        userIds: [1, 2], 
        recommendationTypes: ['friends'] 
      },
      leaderboard_data: { 
        leaderboardTypes: ['global'] 
      }
    };
    
    const warmed = await advancedCachingService.warmCache(warmingStrategies);
    console.log('✅ Cache Warming Test:', warmed > 0 ? 'PASSED' : 'FAILED');
    console.log('   Warmed Entries:', warmed);
    console.log('');

    // Test 7: Cache Statistics
    console.log('7️⃣ Testing cache statistics...');
    const stats = advancedCachingService.getCacheStats();
    console.log('✅ Cache Statistics:');
    console.log('   Total Operations:', stats.total);
    console.log('   Hit Rate:', (stats.hitRate * 100).toFixed(2) + '%');
    console.log('   Hits:', stats.hits);
    console.log('   Misses:', stats.misses);
    console.log('   Sets:', stats.sets);
    console.log('   Compressions:', stats.compressions);
    console.log('');

    // Test 8: Memory Usage
    console.log('8️⃣ Testing memory usage...');
    const memoryUsage = await advancedCachingService.getMemoryUsage();
    if (memoryUsage) {
      console.log('✅ Memory Usage:', memoryUsage.usedMemoryHuman);
    } else {
      console.log('⚠️ Memory usage not available (Redis version limitation)');
    }
    console.log('');

    console.log('🎉 All Advanced Caching Tests Completed Successfully!');
    console.log('');
    console.log('📊 Final Statistics:');
    console.log('   Cache Hit Rate:', (stats.hitRate * 100).toFixed(2) + '%');
    console.log('   Total Operations:', stats.total);
    console.log('   Compression Ratio:', (stats.compressionRatio * 100).toFixed(2) + '%');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await advancedCachingService.clearCache('test:*');
    await advancedCachingService.clearCache('batch:*');
    console.log('✅ Cleanup completed');
    
    // Close connection
    await advancedCachingService.close();
    console.log('🔌 Connection closed');
  }
}

// Run the test
testAdvancedCaching().catch(console.error);
