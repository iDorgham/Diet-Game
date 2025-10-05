/**
 * Advanced Caching Service
 * Phase 15 Performance Optimization
 * Enhanced caching with clustering, compression, and intelligent strategies
 */

import Redis from 'ioredis';
import { performanceMonitoringService } from './performanceMonitoringService.js';
import { logger } from '../utils/logger.js';

class AdvancedCachingService {
  constructor() {
    this.cluster = null;
    this.compressionEnabled = true;
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      compressions: 0,
      decompressions: 0
    };
    
    this.initializeCluster();
    this.setupMonitoring();
  }

  /**
   * Initialize Redis cluster
   */
  async initializeCluster() {
    try {
      // For development, use single Redis instance
      // In production, this would be a Redis cluster
      this.cluster = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      });

      // Add cluster event listeners
      this.cluster.on('connect', () => {
        logger.info('Redis cluster connected');
      });

      this.cluster.on('error', (error) => {
        logger.error('Redis cluster error', { error: error.message });
      });

      this.cluster.on('close', () => {
        logger.warn('Redis cluster connection closed');
      });

      await this.cluster.connect();
      
    } catch (error) {
      logger.error('Failed to initialize Redis cluster', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup performance monitoring
   */
  setupMonitoring() {
    // Monitor cache performance every 30 seconds
    setInterval(() => {
      this.reportCacheMetrics();
    }, 30000);
  }

  /**
   * Get value from cache with compression support
   */
  async get(key, options = {}) {
    const startTime = Date.now();
    
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const value = await this.cluster.get(cacheKey);
      
      if (value === null) {
        this.cacheStats.misses++;
        performanceMonitoringService.recordCacheMiss(key, Date.now() - startTime);
        return null;
      }

      this.cacheStats.hits++;
      
      // Decompress if needed
      const decompressedValue = this.decompressValue(value, options);
      
      performanceMonitoringService.recordCacheHit(key, Date.now() - startTime);
      return decompressedValue;
      
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      this.cacheStats.misses++;
      return null;
    }
  }

  /**
   * Set value in cache with compression and TTL
   */
  async set(key, value, ttl = 3600, options = {}) {
    const startTime = Date.now();
    
    try {
      const cacheKey = this.buildCacheKey(key, options);
      
      // Compress value if needed
      const compressedValue = this.compressValue(value, options);
      
      // Set with TTL
      await this.cluster.setex(cacheKey, ttl, compressedValue);
      
      this.cacheStats.sets++;
      performanceMonitoringService.recordCacheSet(key, Date.now() - startTime);
      
      return true;
      
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key, options = {}) {
    try {
      const cacheKey = this.buildCacheKey(key, options);
      const result = await this.cluster.del(cacheKey);
      
      this.cacheStats.deletes++;
      return result > 0;
      
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget(keys, options = {}) {
    const startTime = Date.now();
    
    try {
      const cacheKeys = keys.map(key => this.buildCacheKey(key, options));
      const values = await this.cluster.mget(...cacheKeys);
      
      const results = {};
      keys.forEach((key, index) => {
        const value = values[index];
        if (value !== null) {
          results[key] = this.decompressValue(value, options);
          this.cacheStats.hits++;
        } else {
          this.cacheStats.misses++;
        }
      });
      
      performanceMonitoringService.recordBatchCacheOperation('mget', keys.length, Date.now() - startTime);
      return results;
      
    } catch (error) {
      logger.error('Cache mget error', { keys, error: error.message });
      return {};
    }
  }

  /**
   * Batch set multiple key-value pairs
   */
  async mset(keyValuePairs, ttl = 3600, options = {}) {
    const startTime = Date.now();
    
    try {
      const pipeline = this.cluster.pipeline();
      
      Object.entries(keyValuePairs).forEach(([key, value]) => {
        const cacheKey = this.buildCacheKey(key, options);
        const compressedValue = this.compressValue(value, options);
        pipeline.setex(cacheKey, ttl, compressedValue);
      });
      
      await pipeline.exec();
      
      this.cacheStats.sets += Object.keys(keyValuePairs).length;
      performanceMonitoringService.recordBatchCacheOperation('mset', Object.keys(keyValuePairs).length, Date.now() - startTime);
      
      return true;
      
    } catch (error) {
      logger.error('Cache mset error', { error: error.message });
      return false;
    }
  }

  /**
   * Get or set pattern with intelligent caching
   */
  async getOrSet(key, fetchFunction, ttl = 3600, options = {}) {
    // Try to get from cache first
    let value = await this.get(key, options);
    
    if (value !== null) {
      return value;
    }
    
    // Fetch from source
    try {
      value = await fetchFunction();
      
      // Set in cache for future requests
      await this.set(key, value, ttl, options);
      
      return value;
      
    } catch (error) {
      logger.error('Get or set fetch error', { key, error: error.message });
      throw error;
    }
  }

  /**
   * Warm cache with frequently accessed data
   */
  async warmCache(warmingStrategies) {
    logger.info('Starting cache warming', { strategies: Object.keys(warmingStrategies) });
    
    const startTime = Date.now();
    let totalWarmed = 0;
    
    for (const [strategy, config] of Object.entries(warmingStrategies)) {
      try {
        const warmed = await this.executeWarmingStrategy(strategy, config);
        totalWarmed += warmed;
        
        logger.info('Cache warming strategy completed', { 
          strategy, 
          warmed,
          duration: Date.now() - startTime 
        });
        
      } catch (error) {
        logger.error('Cache warming strategy failed', { 
          strategy, 
          error: error.message 
        });
      }
    }
    
    logger.info('Cache warming completed', { 
      totalWarmed, 
      duration: Date.now() - startTime 
    });
    
    return totalWarmed;
  }

  /**
   * Execute specific warming strategy
   */
  async executeWarmingStrategy(strategy, config) {
    switch (strategy) {
      case 'user_recommendations':
        return await this.warmUserRecommendations(config);
      case 'leaderboard_data':
        return await this.warmLeaderboardData(config);
      case 'achievement_data':
        return await this.warmAchievementData(config);
      case 'team_data':
        return await this.warmTeamData(config);
      default:
        logger.warn('Unknown warming strategy', { strategy });
        return 0;
    }
  }

  /**
   * Warm user recommendations cache
   */
  async warmUserRecommendations(config) {
    const { userIds, recommendationTypes } = config;
    let warmed = 0;
    
    for (const userId of userIds) {
      for (const type of recommendationTypes) {
        const key = `recommendations:${userId}:${type}`;
        const exists = await this.cluster.exists(key);
        
        if (!exists) {
          // In a real implementation, this would fetch from database
          const mockData = { userId, type, recommendations: [] };
          await this.set(key, mockData, 1800); // 30 minutes TTL
          warmed++;
        }
      }
    }
    
    return warmed;
  }

  /**
   * Warm leaderboard data cache
   */
  async warmLeaderboardData(config) {
    const { leaderboardTypes } = config;
    let warmed = 0;
    
    for (const type of leaderboardTypes) {
      const key = `leaderboard:${type}`;
      const exists = await this.cluster.exists(key);
      
      if (!exists) {
        const mockData = { type, rankings: [] };
        await this.set(key, mockData, 300); // 5 minutes TTL
        warmed++;
      }
    }
    
    return warmed;
  }

  /**
   * Warm achievement data cache
   */
  async warmAchievementData(config) {
    const { achievementTypes } = config;
    let warmed = 0;
    
    for (const type of achievementTypes) {
      const key = `achievements:${type}`;
      const exists = await this.cluster.exists(key);
      
      if (!exists) {
        const mockData = { type, achievements: [] };
        await this.set(key, mockData, 3600); // 1 hour TTL
        warmed++;
      }
    }
    
    return warmed;
  }

  /**
   * Warm team data cache
   */
  async warmTeamData(config) {
    const { teamIds } = config;
    let warmed = 0;
    
    for (const teamId of teamIds) {
      const key = `team:${teamId}`;
      const exists = await this.cluster.exists(key);
      
      if (!exists) {
        const mockData = { teamId, members: [], stats: {} };
        await this.set(key, mockData, 1800); // 30 minutes TTL
        warmed++;
      }
    }
    
    return warmed;
  }

  /**
   * Build cache key with namespace and options
   */
  buildCacheKey(key, options = {}) {
    const namespace = options.namespace || 'diet_game';
    const version = options.version || 'v1';
    const environment = process.env.NODE_ENV || 'development';
    
    return `${namespace}:${environment}:${version}:${key}`;
  }

  /**
   * Compress value if compression is enabled
   */
  compressValue(value, options = {}) {
    if (!this.compressionEnabled || options.skipCompression) {
      return JSON.stringify(value);
    }
    
    try {
      const jsonString = JSON.stringify(value);
      
      // Simple compression simulation (in production, use actual compression)
      if (jsonString.length > 1024) { // Only compress large values
        this.cacheStats.compressions++;
        return `compressed:${jsonString}`; // Simplified compression
      }
      
      return jsonString;
      
    } catch (error) {
      logger.error('Compression error', { error: error.message });
      return JSON.stringify(value);
    }
  }

  /**
   * Decompress value if it was compressed
   */
  decompressValue(value, options = {}) {
    try {
      if (typeof value === 'string' && value.startsWith('compressed:')) {
        this.cacheStats.decompressions++;
        const decompressed = value.substring(11); // Remove 'compressed:' prefix
        return JSON.parse(decompressed);
      }
      
      return JSON.parse(value);
      
    } catch (error) {
      logger.error('Decompression error', { error: error.message });
      return value;
    }
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? this.cacheStats.hits / total : 0;
    
    return {
      ...this.cacheStats,
      total,
      hitRate,
      compressionRatio: this.cacheStats.compressions / Math.max(this.cacheStats.sets, 1)
    };
  }

  /**
   * Report cache metrics to monitoring service
   */
  reportCacheMetrics() {
    const stats = this.getCacheStats();
    
    performanceMonitoringService.recordCacheMetrics({
      hitRate: stats.hitRate,
      totalOperations: stats.total,
      compressionRatio: stats.compressionRatio,
      operationsPerSecond: this.calculateOperationsPerSecond()
    });
  }

  /**
   * Calculate operations per second
   */
  calculateOperationsPerSecond() {
    // This would be calculated based on recent operations
    // For now, return a mock value
    return (this.cacheStats.hits + this.cacheStats.misses + this.cacheStats.sets) / 30; // 30-second window
  }

  /**
   * Clear cache by pattern
   */
  async clearCache(pattern = '*') {
    try {
      const keys = await this.cluster.keys(pattern);
      
      if (keys.length > 0) {
        await this.cluster.del(...keys);
        logger.info('Cache cleared', { pattern, keysCleared: keys.length });
      }
      
      return keys.length;
      
    } catch (error) {
      logger.error('Cache clear error', { pattern, error: error.message });
      return 0;
    }
  }

  /**
   * Get cache memory usage
   */
  async getMemoryUsage() {
    try {
      const info = await this.cluster.memory('usage');
      return {
        usedMemory: info,
        usedMemoryHuman: this.formatBytes(info)
      };
    } catch (error) {
      logger.error('Memory usage error', { error: error.message });
      return null;
    }
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      await this.cluster.ping();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        responseTime,
        stats: this.getCacheStats()
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Close connections
   */
  async close() {
    if (this.cluster) {
      await this.cluster.quit();
      logger.info('Redis cluster connection closed');
    }
  }
}

// Export singleton instance
export const advancedCachingService = new AdvancedCachingService();
export default advancedCachingService;
