// Redis caching service
// Sprint 7-8: Core Backend Development - Day 9 Task 9.2

import { createClient } from 'redis';
import { logger } from '../utils/logger.js';

let redisClient = null;

/**
 * Initialize Redis connection
 */
export async function initializeRedis() {
  try {
    // Get Redis URL from environment
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    // Skip Redis initialization if explicitly disabled
    if (process.env.REDIS_DISABLED === 'true') {
      logger.warn('⚠️ Redis is disabled via REDIS_DISABLED environment variable');
      return false;
    }

    const redisConfig = {
      url: redisUrl,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };

    redisClient = createClient(redisConfig);

    redisClient.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.warn('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('✅ Redis cache initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Failed to initialize Redis', { error: error.message });
    
    // In development mode, continue without Redis
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ Continuing without Redis cache in development mode');
      logger.info('💡 To enable Redis caching:');
      logger.info('   1. Install Redis: choco install redis-64');
      logger.info('   2. Start Redis server: redis-server');
      logger.info('   3. Set REDIS_URL=redis://localhost:6379 in your .env file');
      logger.info('   4. Or set REDIS_DISABLED=true to disable Redis completely');
      return false;
    }
    
    // In production, Redis is required
    throw error;
  }
}

/**
 * Cache service class
 */
export class CacheService {
  
  /**
   * Get value from cache
   */
  static async get(key) {
    if (!redisClient) return null;
    
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error', { key, error: error.message });
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key, value, ttlSeconds = 300) {
    if (!redisClient) return false;
    
    try {
      const serializedValue = JSON.stringify(value);
      await redisClient.setEx(key, ttlSeconds, serializedValue);
      return true;
    } catch (error) {
      logger.error('Cache set error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  static async del(key) {
    if (!redisClient) return false;
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key) {
    if (!redisClient) return false;
    
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error', { key, error: error.message });
      return false;
    }
  }

  /**
   * Get multiple keys from cache
   */
  static async mget(keys) {
    if (!redisClient) return [];
    
    try {
      const values = await redisClient.mGet(keys);
      return values.map(value => value ? JSON.parse(value) : null);
    } catch (error) {
      logger.error('Cache mget error', { keys, error: error.message });
      return [];
    }
  }

  /**
   * Set multiple key-value pairs
   */
  static async mset(keyValuePairs, ttlSeconds = 300) {
    if (!redisClient) return false;
    
    try {
      const pipeline = redisClient.multi();
      
      for (const [key, value] of Object.entries(keyValuePairs)) {
        const serializedValue = JSON.stringify(value);
        pipeline.setEx(key, ttlSeconds, serializedValue);
      }
      
      await pipeline.exec();
      return true;
    } catch (error) {
      logger.error('Cache mset error', { error: error.message });
      return false;
    }
  }

  /**
   * Increment a numeric value in cache
   */
  static async incr(key, amount = 1) {
    if (!redisClient) return null;
    
    try {
      return await redisClient.incrBy(key, amount);
    } catch (error) {
      logger.error('Cache incr error', { key, amount, error: error.message });
      return null;
    }
  }

  /**
   * Decrement a numeric value in cache
   */
  static async decr(key, amount = 1) {
    if (!redisClient) return null;
    
    try {
      return await redisClient.decrBy(key, amount);
    } catch (error) {
      logger.error('Cache decr error', { key, amount, error: error.message });
      return null;
    }
  }

  /**
   * Set expiration for a key
   */
  static async expire(key, ttlSeconds) {
    if (!redisClient) return false;
    
    try {
      await redisClient.expire(key, ttlSeconds);
      return true;
    } catch (error) {
      logger.error('Cache expire error', { key, ttlSeconds, error: error.message });
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  static async ttl(key) {
    if (!redisClient) return -1;
    
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      logger.error('Cache ttl error', { key, error: error.message });
      return -1;
    }
  }

  /**
   * Clear all cache
   */
  static async flushAll() {
    if (!redisClient) return false;
    
    try {
      await redisClient.flushAll();
      logger.info('Cache flushed successfully');
      return true;
    } catch (error) {
      logger.error('Cache flush error', { error: error.message });
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats() {
    if (!redisClient) return null;
    
    try {
      const info = await redisClient.info('memory');
      const stats = await redisClient.info('stats');
      
      return {
        memory: info,
        stats: stats,
        connected: redisClient.isReady
      };
    } catch (error) {
      logger.error('Cache stats error', { error: error.message });
      return null;
    }
  }
}

/**
 * Gamification-specific cache helpers
 */
export class GamificationCache {
  
  /**
   * Cache user progress
   */
  static async cacheUserProgress(userId, progress, ttlSeconds = 300) {
    const key = `user_progress:${userId}`;
    return await CacheService.set(key, progress, ttlSeconds);
  }

  /**
   * Get cached user progress
   */
  static async getCachedUserProgress(userId) {
    const key = `user_progress:${userId}`;
    return await CacheService.get(key);
  }

  /**
   * Cache leaderboard
   */
  static async cacheLeaderboard(type, period, leaderboard, ttlSeconds = 600) {
    const key = `leaderboard:${type}:${period}`;
    return await CacheService.set(key, leaderboard, ttlSeconds);
  }

  /**
   * Get cached leaderboard
   */
  static async getCachedLeaderboard(type, period) {
    const key = `leaderboard:${type}:${period}`;
    return await CacheService.get(key);
  }

  /**
   * Cache achievements
   */
  static async cacheAchievements(userId, achievements, ttlSeconds = 1800) {
    const key = `achievements:${userId}`;
    return await CacheService.set(key, achievements, ttlSeconds);
  }

  /**
   * Get cached achievements
   */
  static async getCachedAchievements(userId) {
    const key = `achievements:${userId}`;
    return await CacheService.get(key);
  }

  /**
   * Cache quests
   */
  static async cacheQuests(userId, quests, ttlSeconds = 600) {
    const key = `quests:${userId}`;
    return await CacheService.set(key, quests, ttlSeconds);
  }

  /**
   * Get cached quests
   */
  static async getCachedQuests(userId) {
    const key = `quests:${userId}`;
    return await CacheService.get(key);
  }

  /**
   * Invalidate user cache
   */
  static async invalidateUserCache(userId) {
    const keys = [
      `user_progress:${userId}`,
      `achievements:${userId}`,
      `quests:${userId}`,
      `streaks:${userId}`
    ];
    
    for (const key of keys) {
      await CacheService.del(key);
    }
    
    logger.info('User cache invalidated', { userId });
  }

  /**
   * Invalidate leaderboard cache
   */
  static async invalidateLeaderboardCache() {
    const pattern = 'leaderboard:*';
    if (!redisClient) return;
    
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        logger.info('Leaderboard cache invalidated', { keysCount: keys.length });
      }
    } catch (error) {
      logger.error('Error invalidating leaderboard cache', { error: error.message });
    }
  }
}

/**
 * Cache warming strategies
 */
export class CacheWarmer {
  
  /**
   * Warm up user progress cache
   */
  static async warmUserProgress(userIds) {
    logger.info('Warming user progress cache', { userIdCount: userIds.length });
    
    // This would typically fetch from database and cache
    // Implementation depends on your data access patterns
  }

  /**
   * Warm up leaderboard cache
   */
  static async warmLeaderboards() {
    logger.info('Warming leaderboard cache');
    
    const types = ['xp', 'level', 'streak', 'achievements'];
    const periods = ['daily', 'weekly', 'monthly', 'all'];
    
    // This would typically fetch leaderboard data and cache it
    // Implementation depends on your leaderboard generation logic
  }

  /**
   * Warm up achievement cache
   */
  static async warmAchievements() {
    logger.info('Warming achievement cache');
    
    // This would typically fetch all achievements and cache them
    // Implementation depends on your achievement system
  }
}

/**
 * Close Redis connection
 */
export async function closeRedis() {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection', { error: error.message });
    }
  }
}

// Handle process termination
process.on('SIGINT', closeRedis);
process.on('SIGTERM', closeRedis);
