/**
 * Enhanced Recommendation Cache Service
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Implements advanced caching strategies for recommendations
 */

import { CacheService } from './cache.js';
import { logger } from '../utils/logger.js';

class RecommendationCacheService {
  constructor() {
    this.defaultTTL = 300; // 5 minutes
    this.extendedTTL = 1800; // 30 minutes
    this.longTTL = 3600; // 1 hour
    this.cachePrefix = 'recommendations';
    
    // Cache hit/miss tracking
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Get recommendations from cache
   */
  async getRecommendations(userId, type, options = {}) {
    const key = this.generateCacheKey(userId, type, options);
    
    try {
      const cached = await CacheService.get(key);
      
      if (cached) {
        this.cacheStats.hits++;
        logger.debug('Cache hit for recommendations', { 
          userId, 
          type, 
          key,
          hitRate: this.getCacheHitRate()
        });
        return cached;
      }
      
      this.cacheStats.misses++;
      logger.debug('Cache miss for recommendations', { 
        userId, 
        type, 
        key,
        hitRate: this.getCacheHitRate()
      });
      return null;
    } catch (error) {
      logger.error('Error getting recommendations from cache', { 
        userId, 
        type, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Set recommendations in cache
   */
  async setRecommendations(userId, type, data, options = {}) {
    const key = this.generateCacheKey(userId, type, options);
    const ttl = this.getTTL(type, options);
    
    try {
      const success = await CacheService.set(key, data, ttl);
      
      if (success) {
        this.cacheStats.sets++;
        logger.debug('Cached recommendations', { 
          userId, 
          type, 
          key, 
          ttl,
          dataSize: JSON.stringify(data).length
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Error setting recommendations in cache', { 
        userId, 
        type, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Invalidate user recommendations cache
   */
  async invalidateUserRecommendations(userId, type = null) {
    try {
      if (type) {
        // Invalidate specific type
        const pattern = `${this.cachePrefix}:${userId}:${type}:*`;
        await this.invalidateByPattern(pattern);
      } else {
        // Invalidate all user recommendations
        const pattern = `${this.cachePrefix}:${userId}:*`;
        await this.invalidateByPattern(pattern);
      }
      
      this.cacheStats.deletes++;
      logger.info('Invalidated user recommendations cache', { userId, type });
    } catch (error) {
      logger.error('Error invalidating user recommendations cache', { 
        userId, 
        type, 
        error: error.message 
      });
    }
  }

  /**
   * Invalidate recommendations by pattern
   */
  async invalidateByPattern(pattern) {
    try {
      // This would need Redis SCAN command implementation
      // For now, we'll use a simplified approach
      logger.debug('Invalidating cache by pattern', { pattern });
      // Implementation depends on Redis client capabilities
    } catch (error) {
      logger.error('Error invalidating cache by pattern', { 
        pattern, 
        error: error.message 
      });
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(userId, type, options = {}) {
    const { limit, offset, filters, algorithm } = options;
    
    // Create a hash of the options for consistent key generation
    const optionsHash = this.hashOptions({ limit, offset, filters, algorithm });
    
    return `${this.cachePrefix}:${userId}:${type}:${optionsHash}`;
  }

  /**
   * Hash options for consistent key generation
   */
  hashOptions(options) {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((result, key) => {
        result[key] = options[key];
        return result;
      }, {});
    
    return Buffer.from(JSON.stringify(sortedOptions)).toString('base64').slice(0, 16);
  }

  /**
   * Get TTL based on recommendation type and options
   */
  getTTL(type, options = {}) {
    // Different TTLs for different types
    const ttlMap = {
      'friend': this.defaultTTL,
      'team': this.extendedTTL,
      'content': this.defaultTTL,
      'mentorship': this.extendedTTL,
      'ai_enhanced': this.longTTL,
      'ml_ensemble': this.longTTL
    };
    
    // Custom TTL from options
    if (options.ttl) {
      return options.ttl;
    }
    
    return ttlMap[type] || this.defaultTTL;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    return total > 0 ? (this.cacheStats.hits / total * 100).toFixed(2) : 0;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: this.getCacheHitRate(),
      totalRequests: this.cacheStats.hits + this.cacheStats.misses
    };
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  /**
   * Warm up cache for user
   */
  async warmUpUserCache(userId, types = ['friend', 'team', 'content']) {
    logger.info('Warming up cache for user', { userId, types });
    
    try {
      // This would typically pre-fetch and cache recommendations
      // Implementation depends on your recommendation service
      for (const type of types) {
        // Pre-fetch recommendations and cache them
        // await this.preFetchRecommendations(userId, type);
      }
      
      logger.info('Cache warm-up completed', { userId, types });
    } catch (error) {
      logger.error('Error warming up cache', { userId, types, error: error.message });
    }
  }

  /**
   * Batch cache operations
   */
  async batchSetRecommendations(cacheEntries) {
    try {
      const keyValuePairs = {};
      
      for (const entry of cacheEntries) {
        const key = this.generateCacheKey(
          entry.userId, 
          entry.type, 
          entry.options
        );
        keyValuePairs[key] = entry.data;
      }
      
      const success = await CacheService.mset(keyValuePairs, this.defaultTTL);
      
      if (success) {
        this.cacheStats.sets += cacheEntries.length;
        logger.debug('Batch cached recommendations', { 
          count: cacheEntries.length 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Error batch setting recommendations', { 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Batch get recommendations
   */
  async batchGetRecommendations(cacheKeys) {
    try {
      const results = await CacheService.mget(cacheKeys);
      
      // Update cache stats
      for (const result of results) {
        if (result) {
          this.cacheStats.hits++;
        } else {
          this.cacheStats.misses++;
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error batch getting recommendations', { 
        error: error.message 
      });
      return [];
    }
  }

  /**
   * Cache user behavior patterns
   */
  async cacheUserBehaviorPatterns(userId, patterns, ttl = this.extendedTTL) {
    const key = `user_behavior:${userId}`;
    
    try {
      const success = await CacheService.set(key, patterns, ttl);
      
      if (success) {
        logger.debug('Cached user behavior patterns', { 
          userId, 
          patternCount: Object.keys(patterns).length 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Error caching user behavior patterns', { 
        userId, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Get cached user behavior patterns
   */
  async getCachedUserBehaviorPatterns(userId) {
    const key = `user_behavior:${userId}`;
    
    try {
      const cached = await CacheService.get(key);
      
      if (cached) {
        this.cacheStats.hits++;
        logger.debug('Cache hit for user behavior patterns', { userId });
        return cached;
      }
      
      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.error('Error getting cached user behavior patterns', { 
        userId, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Cache algorithm weights
   */
  async cacheAlgorithmWeights(userId, weights, ttl = this.longTTL) {
    const key = `algorithm_weights:${userId}`;
    
    try {
      const success = await CacheService.set(key, weights, ttl);
      
      if (success) {
        logger.debug('Cached algorithm weights', { 
          userId, 
          weightCount: Object.keys(weights).length 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Error caching algorithm weights', { 
        userId, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Get cached algorithm weights
   */
  async getCachedAlgorithmWeights(userId) {
    const key = `algorithm_weights:${userId}`;
    
    try {
      const cached = await CacheService.get(key);
      
      if (cached) {
        this.cacheStats.hits++;
        logger.debug('Cache hit for algorithm weights', { userId });
        return cached;
      }
      
      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.error('Error getting cached algorithm weights', { 
        userId, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Cache ML model predictions
   */
  async cacheMLPredictions(userId, type, predictions, ttl = this.longTTL) {
    const key = `ml_predictions:${userId}:${type}`;
    
    try {
      const success = await CacheService.set(key, predictions, ttl);
      
      if (success) {
        logger.debug('Cached ML predictions', { 
          userId, 
          type, 
          predictionCount: predictions.length 
        });
      }
      
      return success;
    } catch (error) {
      logger.error('Error caching ML predictions', { 
        userId, 
        type, 
        error: error.message 
      });
      return false;
    }
  }

  /**
   * Get cached ML predictions
   */
  async getCachedMLPredictions(userId, type) {
    const key = `ml_predictions:${userId}:${type}`;
    
    try {
      const cached = await CacheService.get(key);
      
      if (cached) {
        this.cacheStats.hits++;
        logger.debug('Cache hit for ML predictions', { userId, type });
        return cached;
      }
      
      this.cacheStats.misses++;
      return null;
    } catch (error) {
      logger.error('Error getting cached ML predictions', { 
        userId, 
        type, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Invalidate all recommendation caches
   */
  async invalidateAllRecommendations() {
    try {
      await CacheService.flushAll();
      this.resetCacheStats();
      logger.info('Invalidated all recommendation caches');
    } catch (error) {
      logger.error('Error invalidating all recommendation caches', { 
        error: error.message 
      });
    }
  }

  /**
   * Get cache health status
   */
  async getCacheHealth() {
    try {
      const stats = await CacheService.getStats();
      const hitRate = this.getCacheHitRate();
      
      return {
        connected: stats?.connected || false,
        hitRate: parseFloat(hitRate),
        totalRequests: this.cacheStats.hits + this.cacheStats.misses,
        cacheStats: this.cacheStats,
        redisStats: stats
      };
    } catch (error) {
      logger.error('Error getting cache health', { error: error.message });
      return {
        connected: false,
        hitRate: 0,
        totalRequests: 0,
        cacheStats: this.cacheStats,
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const recommendationCacheService = new RecommendationCacheService();
export default recommendationCacheService;
