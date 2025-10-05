// Message Queue Service for Offline Users
// Phase 13-14: Real-time Features - Message Queuing System

import { logger } from '../utils/logger.js';

/**
 * Message Queue Service
 * Handles queuing and delivery of messages for offline users
 */
export class MessageQueueService {
  constructor() {
    this.queues = new Map(); // userId -> message[]
    this.maxQueueSize = 100; // Maximum messages per user
    this.messageTTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  }

  /**
   * Add message to user's queue
   */
  addMessage(userId, message) {
    if (!this.queues.has(userId)) {
      this.queues.set(userId, []);
    }

    const userQueue = this.queues.get(userId);
    
    // Check queue size limit
    if (userQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      userQueue.shift();
    }

    const queuedMessage = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      message,
      timestamp: new Date().toISOString(),
      ttl: Date.now() + this.messageTTL
    };

    userQueue.push(queuedMessage);
    
    logger.info('Message queued for offline user', { 
      userId, 
      messageId: queuedMessage.id,
      queueSize: userQueue.length 
    });

    return queuedMessage.id;
  }

  /**
   * Get all queued messages for user
   */
  getQueuedMessages(userId) {
    const userQueue = this.queues.get(userId) || [];
    
    // Filter out expired messages
    const validMessages = userQueue.filter(msg => msg.ttl > Date.now());
    
    // Update queue with only valid messages
    this.queues.set(userId, validMessages);
    
    logger.info('Retrieved queued messages', { 
      userId, 
      messageCount: validMessages.length 
    });

    return validMessages;
  }

  /**
   * Clear all queued messages for user
   */
  clearUserQueue(userId) {
    const userQueue = this.queues.get(userId) || [];
    this.queues.delete(userId);
    
    logger.info('Cleared user message queue', { 
      userId, 
      clearedCount: userQueue.length 
    });

    return userQueue.length;
  }

  /**
   * Remove specific message from queue
   */
  removeMessage(userId, messageId) {
    const userQueue = this.queues.get(userId) || [];
    const initialLength = userQueue.length;
    
    const filteredQueue = userQueue.filter(msg => msg.id !== messageId);
    this.queues.set(userId, filteredQueue);
    
    const removed = initialLength - filteredQueue.length;
    
    if (removed > 0) {
      logger.info('Removed message from queue', { 
        userId, 
        messageId, 
        removed 
      });
    }

    return removed;
  }

  /**
   * Get queue statistics
   */
  getQueueStats() {
    const stats = {
      totalUsers: this.queues.size,
      totalMessages: 0,
      averageMessagesPerUser: 0,
      oldestMessage: null,
      newestMessage: null
    };

    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    for (const [userId, messages] of this.queues) {
      stats.totalMessages += messages.length;
      
      for (const message of messages) {
        const timestamp = new Date(message.timestamp).getTime();
        if (timestamp < oldestTimestamp) {
          oldestTimestamp = timestamp;
          stats.oldestMessage = message;
        }
        if (timestamp > newestTimestamp) {
          newestTimestamp = timestamp;
          stats.newestMessage = message;
        }
      }
    }

    stats.averageMessagesPerUser = stats.totalUsers > 0 
      ? Math.round(stats.totalMessages / stats.totalUsers * 100) / 100 
      : 0;

    return stats;
  }

  /**
   * Clean up expired messages
   */
  cleanupExpiredMessages() {
    let totalCleaned = 0;
    const now = Date.now();

    for (const [userId, messages] of this.queues) {
      const validMessages = messages.filter(msg => msg.ttl > now);
      const cleaned = messages.length - validMessages.length;
      
      if (cleaned > 0) {
        this.queues.set(userId, validMessages);
        totalCleaned += cleaned;
      }

      // Remove empty queues
      if (validMessages.length === 0) {
        this.queues.delete(userId);
      }
    }

    if (totalCleaned > 0) {
      logger.info('Cleaned up expired messages', { 
        totalCleaned, 
        remainingQueues: this.queues.size 
      });
    }

    return totalCleaned;
  }

  /**
   * Get user's queue size
   */
  getUserQueueSize(userId) {
    const userQueue = this.queues.get(userId) || [];
    return userQueue.length;
  }

  /**
   * Check if user has queued messages
   */
  hasQueuedMessages(userId) {
    const userQueue = this.queues.get(userId) || [];
    return userQueue.length > 0;
  }

  /**
   * Get all users with queued messages
   */
  getUsersWithQueuedMessages() {
    const users = [];
    for (const [userId, messages] of this.queues) {
      if (messages.length > 0) {
        users.push({
          userId,
          messageCount: messages.length,
          oldestMessage: messages[0]?.timestamp,
          newestMessage: messages[messages.length - 1]?.timestamp
        });
      }
    }
    return users;
  }
}

// Singleton instance
export const messageQueueService = new MessageQueueService();

// Cleanup expired messages every hour
setInterval(() => {
  messageQueueService.cleanupExpiredMessages();
}, 60 * 60 * 1000);

export default messageQueueService;
