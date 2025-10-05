/**
 * Cache Service
 * Redis cache management and operations
 */

import { createClient, RedisClientType } from 'redis';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';

let redisClient: RedisClientType;

export const initializeRedis = async (): Promise<void> => {
  try {
    // Skip Redis initialization if no URL is provided
    if (!config.redis.url) {
      logger.warn('⚠️ Redis URL not configured, skipping Redis initialization');
      logger.info('💡 To enable Redis caching, set REDIS_URL in your environment variables');
      return;
    }

    redisClient = createClient({
      url: config.redis.url,
    });

    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
    logger.info('✅ Redis cache connected successfully');
  } catch (error) {
    logger.error('❌ Failed to connect to Redis:', error);
    
    // In development mode, continue without Redis
    if (config.nodeEnv === 'development') {
      logger.warn('⚠️ Continuing without Redis cache in development mode');
      logger.info('💡 To enable Redis caching:');
      logger.info('   1. Install Redis: https://redis.io/download');
      logger.info('   2. Start Redis server: redis-server');
      logger.info('   3. Set REDIS_URL in your .env file');
      return;
    }
    
    // In production, Redis is required
    throw error;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  if (!redisClient) {
    logger.warn('Redis client not initialized - caching disabled');
    return null;
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis client closed');
  }
};
