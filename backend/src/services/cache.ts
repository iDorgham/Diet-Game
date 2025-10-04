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
    throw error;
  }
};

export const getRedisClient = (): RedisClientType => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis client closed');
  }
};
