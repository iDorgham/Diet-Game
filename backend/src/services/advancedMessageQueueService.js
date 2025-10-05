/**
 * Advanced Message Queue Service
 * Comprehensive message queuing with persistence, monitoring, and scaling
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import { performanceMonitoringService } from './performanceMonitoringService.js';
import { EventEmitter } from 'events';

class AdvancedMessageQueueService extends EventEmitter {
  constructor() {
    super();
    this.redis = null;
    this.queues = new Map();
    this.subscribers = new Map();
    this.deadLetterQueues = new Map();
    this.isInitialized = false;
    
    this.config = {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      },
      queues: {
        maxSize: 10000,
        defaultTTL: 7 * 24 * 60 * 60 * 1000, // 7 days
        retryAttempts: 3,
        retryDelay: 1000,
        visibilityTimeout: 30000, // 30 seconds
        batchSize: 10
      },
      monitoring: {
        metricsInterval: 30000, // 30 seconds
        healthCheckInterval: 10000, // 10 seconds
        cleanupInterval: 60 * 60 * 1000 // 1 hour
      }
    };
    
    this.metrics = {
      messagesPublished: 0,
      messagesConsumed: 0,
      messagesFailed: 0,
      messagesRetried: 0,
      deadLetterMessages: 0,
      averageProcessingTime: 0,
      queueDepths: new Map(),
      throughput: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize the message queue service
   */
  async initialize() {
    try {
      await this.connectRedis();
      await this.setupQueues();
      await this.startMonitoring();
      await this.startCleanup();
      
      this.isInitialized = true;
      logger.info('Advanced message queue service initialized');
      
    } catch (error) {
      logger.error('Failed to initialize message queue service', { error: error.message });
      throw error;
    }
  }

  /**
   * Connect to Redis
   */
  async connectRedis() {
    this.redis = new Redis({
      ...this.config.redis,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('connect', () => {
      logger.info('Redis connected for message queue');
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });

    this.redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    await this.redis.connect();
  }

  /**
   * Setup default queues
   */
  async setupQueues() {
    const defaultQueues = [
      'user_notifications',
      'achievement_updates',
      'social_events',
      'gamification_events',
      'recommendation_updates',
      'system_events',
      'dead_letter'
    ];

    for (const queueName of defaultQueues) {
      await this.createQueue(queueName);
    }
  }

  /**
   * Create a new queue
   */
  async createQueue(queueName, options = {}) {
    const queueConfig = {
      ...this.config.queues,
      ...options
    };

    this.queues.set(queueName, {
      name: queueName,
      config: queueConfig,
      subscribers: new Set(),
      deadLetterQueue: `${queueName}_dlq`,
      createdAt: Date.now()
    });

    // Create dead letter queue
    await this.createDeadLetterQueue(`${queueName}_dlq`);

    logger.info('Queue created', { queueName, config: queueConfig });
    return queueName;
  }

  /**
   * Create dead letter queue
   */
  async createDeadLetterQueue(queueName) {
    this.deadLetterQueues.set(queueName, {
      name: queueName,
      messages: [],
      createdAt: Date.now()
    });

    logger.info('Dead letter queue created', { queueName });
  }

  /**
   * Publish message to queue
   */
  async publish(queueName, message, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Message queue service not initialized');
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const messageData = {
      id: this.generateMessageId(),
      queueName,
      payload: message,
      timestamp: Date.now(),
      ttl: Date.now() + (options.ttl || queue.config.defaultTTL),
      retryCount: 0,
      maxRetries: options.maxRetries || queue.config.retryAttempts,
      priority: options.priority || 0,
      correlationId: options.correlationId,
      replyTo: options.replyTo,
      headers: options.headers || {},
      metadata: {
        publishedBy: options.publishedBy,
        publishedAt: new Date().toISOString(),
        version: '1.0'
      }
    };

    try {
      // Store message in Redis
      const messageKey = `mq:${queueName}:${messageData.id}`;
      await this.redis.setex(messageKey, Math.ceil(queue.config.defaultTTL / 1000), JSON.stringify(messageData));

      // Add to queue
      const queueKey = `mq:queue:${queueName}`;
      await this.redis.lpush(queueKey, messageData.id);

      // Update metrics
      this.metrics.messagesPublished++;
      this.updateQueueDepth(queueName);

      // Emit event
      this.emit('messagePublished', { queueName, messageId: messageData.id, message: messageData });

      logger.info('Message published', { 
        queueName, 
        messageId: messageData.id,
        priority: messageData.priority 
      });

      return messageData.id;

    } catch (error) {
      logger.error('Failed to publish message', { 
        queueName, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Subscribe to queue
   */
  async subscribe(queueName, handler, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Message queue service not initialized');
    }

    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} does not exist`);
    }

    const subscription = {
      id: this.generateSubscriptionId(),
      queueName,
      handler,
      options: {
        batchSize: options.batchSize || queue.config.batchSize,
        autoAck: options.autoAck !== false,
        retryOnFailure: options.retryOnFailure !== false,
        ...options
      },
      isActive: true,
      createdAt: Date.now()
    };

    queue.subscribers.add(subscription);
    this.subscribers.set(subscription.id, subscription);

    // Start consuming messages
    this.startConsuming(queueName, subscription);

    logger.info('Subscribed to queue', { 
      queueName, 
      subscriptionId: subscription.id 
    });

    return subscription.id;
  }

  /**
   * Unsubscribe from queue
   */
  async unsubscribe(subscriptionId) {
    const subscription = this.subscribers.get(subscriptionId);
    if (!subscription) {
      logger.warn('Subscription not found', { subscriptionId });
      return false;
    }

    subscription.isActive = false;
    this.subscribers.delete(subscriptionId);

    const queue = this.queues.get(subscription.queueName);
    if (queue) {
      queue.subscribers.delete(subscription);
    }

    logger.info('Unsubscribed from queue', { 
      queueName: subscription.queueName, 
      subscriptionId 
    });

    return true;
  }

  /**
   * Start consuming messages from queue
   */
  async startConsuming(queueName, subscription) {
    const queue = this.queues.get(queueName);
    if (!queue) return;

    const consumeMessages = async () => {
      if (!subscription.isActive) return;

      try {
        const messages = await this.getMessages(queueName, subscription.options.batchSize);
        
        if (messages.length > 0) {
          await this.processMessages(messages, subscription);
        }

        // Continue consuming
        setTimeout(consumeMessages, 100);

      } catch (error) {
        logger.error('Error consuming messages', { 
          queueName, 
          subscriptionId: subscription.id,
          error: error.message 
        });
        
        // Retry after delay
        setTimeout(consumeMessages, 1000);
      }
    };

    consumeMessages();
  }

  /**
   * Get messages from queue
   */
  async getMessages(queueName, batchSize = 1) {
    const queueKey = `mq:queue:${queueName}`;
    const messages = [];

    for (let i = 0; i < batchSize; i++) {
      const messageId = await this.redis.rpop(queueKey);
      if (!messageId) break;

      const messageKey = `mq:${queueName}:${messageId}`;
      const messageData = await this.redis.get(messageKey);
      
      if (messageData) {
        const message = JSON.parse(messageData);
        messages.push({ ...message, messageId });
      }
    }

    return messages;
  }

  /**
   * Process messages
   */
  async processMessages(messages, subscription) {
    const startTime = Date.now();

    for (const message of messages) {
      try {
        await this.processMessage(message, subscription);
        
        // Acknowledge message
        if (subscription.options.autoAck) {
          await this.acknowledgeMessage(message.queueName, message.messageId);
        }

        this.metrics.messagesConsumed++;

      } catch (error) {
        logger.error('Error processing message', { 
          messageId: message.messageId,
          error: error.message 
        });

        await this.handleMessageFailure(message, subscription, error);
      }
    }

    // Update processing time metrics
    const processingTime = Date.now() - startTime;
    this.updateAverageProcessingTime(processingTime);
  }

  /**
   * Process individual message
   */
  async processMessage(message, subscription) {
    const startTime = Date.now();

    try {
      await subscription.handler(message.payload, message);

      const processingTime = Date.now() - startTime;
      
      // Record performance metrics
      performanceMonitoringService.recordMetric('message.processing_time', processingTime, {
        queue: message.queueName,
        messageType: message.payload.type || 'unknown'
      });

      logger.debug('Message processed successfully', { 
        messageId: message.messageId,
        processingTime 
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Handle message processing failure
   */
  async handleMessageFailure(message, subscription, error) {
    this.metrics.messagesFailed++;

    if (subscription.options.retryOnFailure && message.retryCount < message.maxRetries) {
      // Retry message
      message.retryCount++;
      message.lastError = error.message;
      message.lastRetryAt = Date.now();

      // Exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, message.retryCount), 30000);
      
      setTimeout(async () => {
        await this.retryMessage(message);
      }, retryDelay);

      this.metrics.messagesRetried++;
      
      logger.info('Message scheduled for retry', { 
        messageId: message.messageId,
        retryCount: message.retryCount,
        retryDelay 
      });

    } else {
      // Send to dead letter queue
      await this.sendToDeadLetterQueue(message, error);
    }
  }

  /**
   * Retry message
   */
  async retryMessage(message) {
    try {
      const queueKey = `mq:queue:${message.queueName}`;
      await this.redis.lpush(queueKey, message.messageId);

      // Update message in Redis
      const messageKey = `mq:${message.queueName}:${message.messageId}`;
      await this.redis.setex(messageKey, Math.ceil((message.ttl - Date.now()) / 1000), JSON.stringify(message));

      logger.info('Message retried', { 
        messageId: message.messageId,
        retryCount: message.retryCount 
      });

    } catch (error) {
      logger.error('Failed to retry message', { 
        messageId: message.messageId,
        error: error.message 
      });
    }
  }

  /**
   * Send message to dead letter queue
   */
  async sendToDeadLetterQueue(message, error) {
    const dlqName = `${message.queueName}_dlq`;
    
    const dlqMessage = {
      ...message,
      originalQueue: message.queueName,
      failedAt: Date.now(),
      failureReason: error.message,
      stackTrace: error.stack
    };

    // Store in dead letter queue
    const dlqKey = `mq:dlq:${dlqName}`;
    await this.redis.lpush(dlqKey, JSON.stringify(dlqMessage));

    this.metrics.deadLetterMessages++;
    
    logger.warn('Message sent to dead letter queue', { 
      messageId: message.messageId,
      dlqName,
      failureReason: error.message 
    });

    this.emit('messageDeadLettered', { message, error, dlqName });
  }

  /**
   * Acknowledge message
   */
  async acknowledgeMessage(queueName, messageId) {
    const messageKey = `mq:${queueName}:${messageId}`;
    await this.redis.del(messageKey);
    
    logger.debug('Message acknowledged', { queueName, messageId });
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(queueName = null) {
    const stats = {
      queues: {},
      global: {
        totalMessages: 0,
        totalSubscribers: 0,
        messagesPublished: this.metrics.messagesPublished,
        messagesConsumed: this.metrics.messagesConsumed,
        messagesFailed: this.metrics.messagesFailed,
        messagesRetried: this.metrics.messagesRetried,
        deadLetterMessages: this.metrics.deadLetterMessages,
        averageProcessingTime: this.metrics.averageProcessingTime,
        throughput: this.metrics.throughput
      }
    };

    const queuesToCheck = queueName ? [queueName] : Array.from(this.queues.keys());

    for (const qName of queuesToCheck) {
      const queue = this.queues.get(qName);
      if (!queue) continue;

      const queueKey = `mq:queue:${qName}`;
      const queueLength = await this.redis.llen(queueKey);

      stats.queues[qName] = {
        name: qName,
        depth: queueLength,
        subscribers: queue.subscribers.size,
        config: queue.config,
        createdAt: queue.createdAt
      };

      stats.global.totalMessages += queueLength;
      stats.global.totalSubscribers += queue.subscribers.size;
    }

    return stats;
  }

  /**
   * Get dead letter queue messages
   */
  async getDeadLetterMessages(queueName, limit = 100) {
    const dlqName = `${queueName}_dlq`;
    const dlqKey = `mq:dlq:${dlqName}`;
    
    const messages = await this.redis.lrange(dlqKey, 0, limit - 1);
    return messages.map(msg => JSON.parse(msg));
  }

  /**
   * Replay dead letter messages
   */
  async replayDeadLetterMessages(queueName, messageIds = null) {
    const dlqName = `${queueName}_dlq`;
    const dlqKey = `mq:dlq:${dlqName}`;
    
    let messages;
    if (messageIds) {
      messages = [];
      for (const messageId of messageIds) {
        const message = await this.redis.lindex(dlqKey, 0);
        if (message) {
          const parsed = JSON.parse(message);
          if (parsed.messageId === messageId) {
            messages.push(parsed);
          }
        }
      }
    } else {
      const allMessages = await this.redis.lrange(dlqKey, 0, -1);
      messages = allMessages.map(msg => JSON.parse(msg));
    }

    let replayed = 0;
    for (const message of messages) {
      try {
        // Reset retry count and send back to original queue
        message.retryCount = 0;
        message.lastError = null;
        message.lastRetryAt = null;
        
        await this.publish(message.originalQueue, message.payload, {
          correlationId: message.correlationId,
          replyTo: message.replyTo,
          headers: message.headers
        });

        // Remove from dead letter queue
        await this.redis.lrem(dlqKey, 1, JSON.stringify(message));
        replayed++;

      } catch (error) {
        logger.error('Failed to replay message', { 
          messageId: message.messageId,
          error: error.message 
        });
      }
    }

    logger.info('Dead letter messages replayed', { 
      queueName, 
      replayed, 
      total: messages.length 
    });

    return replayed;
  }

  /**
   * Start monitoring
   */
  async startMonitoring() {
    // Metrics collection
    setInterval(async () => {
      await this.collectMetrics();
    }, this.config.monitoring.metricsInterval);

    // Health checks
    setInterval(async () => {
      await this.performHealthCheck();
    }, this.config.monitoring.healthCheckInterval);
  }

  /**
   * Collect metrics
   */
  async collectMetrics() {
    try {
      const stats = await this.getQueueStats();
      
      // Update throughput
      this.metrics.throughput = this.metrics.messagesConsumed / (this.config.monitoring.metricsInterval / 1000);
      
      // Record metrics
      performanceMonitoringService.recordMetric('message_queue.throughput', this.metrics.throughput);
      performanceMonitoringService.recordMetric('message_queue.total_messages', stats.global.totalMessages);
      performanceMonitoringService.recordMetric('message_queue.failed_messages', stats.global.messagesFailed);

      this.emit('metrics', this.metrics);

    } catch (error) {
      logger.error('Error collecting metrics', { error: error.message });
    }
  }

  /**
   * Perform health check
   */
  async performHealthCheck() {
    try {
      const isHealthy = await this.redis.ping() === 'PONG';
      
      if (!isHealthy) {
        this.emit('healthCheck', { status: 'unhealthy', reason: 'Redis connection failed' });
      }

    } catch (error) {
      this.emit('healthCheck', { status: 'unhealthy', reason: error.message });
    }
  }

  /**
   * Start cleanup process
   */
  async startCleanup() {
    setInterval(async () => {
      await this.cleanupExpiredMessages();
    }, this.config.monitoring.cleanupInterval);
  }

  /**
   * Cleanup expired messages
   */
  async cleanupExpiredMessages() {
    const now = Date.now();
    let cleaned = 0;

    for (const [queueName, queue] of this.queues) {
      const queueKey = `mq:queue:${queueName}`;
      const messageIds = await this.redis.lrange(queueKey, 0, -1);

      for (const messageId of messageIds) {
        const messageKey = `mq:${queueName}:${messageId}`;
        const messageData = await this.redis.get(messageKey);
        
        if (messageData) {
          const message = JSON.parse(messageData);
          if (message.ttl < now) {
            await this.redis.del(messageKey);
            await this.redis.lrem(queueKey, 1, messageId);
            cleaned++;
          }
        }
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up expired messages', { cleaned });
    }
  }

  /**
   * Update queue depth
   */
  updateQueueDepth(queueName) {
    // This would be updated in real-time in a production system
    const currentDepth = this.metrics.queueDepths.get(queueName) || 0;
    this.metrics.queueDepths.set(queueName, currentDepth + 1);
  }

  /**
   * Update average processing time
   */
  updateAverageProcessingTime(processingTime) {
    const currentAvg = this.metrics.averageProcessingTime;
    const count = this.metrics.messagesConsumed;
    
    this.metrics.averageProcessingTime = (currentAvg * (count - 1) + processingTime) / count;
  }

  /**
   * Generate message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate subscription ID
   */
  generateSubscriptionId() {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    try {
      const isRedisHealthy = await this.redis.ping() === 'PONG';
      const stats = await this.getQueueStats();
      
      return {
        status: isRedisHealthy ? 'healthy' : 'unhealthy',
        redis: isRedisHealthy,
        queues: Object.keys(stats.queues).length,
        totalMessages: stats.global.totalMessages,
        totalSubscribers: stats.global.totalSubscribers,
        metrics: this.metrics
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
    if (this.redis) {
      await this.redis.quit();
    }
    
    this.isInitialized = false;
    logger.info('Message queue service closed');
  }
}

// Export singleton instance
export const advancedMessageQueueService = new AdvancedMessageQueueService();
export default advancedMessageQueueService;
