# Message Queue Quick Reference Guide

## 🚀 **QUICK START**

### **1. Initialize Message Queue Services**
```javascript
import { advancedMessageQueueService } from './services/advancedMessageQueueService.js';
import { messageQueueIntegrationService } from './services/messageQueueIntegrationService.js';
import { messageQueueScalingService } from './services/messageQueueScalingService.js';

// Services are automatically initialized as singletons
// No manual initialization required
```

### **2. Publish Events**
```javascript
// Publish user registration event
await messageQueueIntegrationService.publishEvent(
  'USER_REGISTERED',
  {
    userId: 'user_123',
    email: 'user@example.com',
    registrationDate: new Date().toISOString()
  },
  {
    priority: 1,
    correlationId: 'user_123',
    publishedBy: 'auth_service'
  }
);

// Publish achievement unlock event
await messageQueueIntegrationService.publishEvent(
  'ACHIEVEMENT_UNLOCKED',
  {
    userId: 'user_123',
    achievementId: 'first_meal',
    achievementName: 'First Meal Logged'
  }
);
```

### **3. Subscribe to Events**
```javascript
// Subscribe to user notifications
const subscriptionId = await advancedMessageQueueService.subscribe(
  'user_notifications',
  async (payload, message) => {
    console.log('Received notification:', payload);
    await processNotification(payload);
  },
  {
    batchSize: 5,
    autoAck: true,
    retryOnFailure: true
  }
);
```

## 📊 **AVAILABLE EVENT TYPES**

### **User Events**
- `USER_REGISTERED` - User account created
- `USER_LOGIN` - User logged in
- `USER_LOGOUT` - User logged out
- `USER_PROFILE_UPDATED` - User profile modified

### **Gamification Events**
- `LEVEL_UP` - User reached new level
- `ACHIEVEMENT_UNLOCKED` - Achievement unlocked
- `QUEST_COMPLETED` - Quest completed
- `STREAK_UPDATED` - Streak updated
- `XP_EARNED` - XP points earned

### **Social Events**
- `FRIEND_REQUEST_SENT` - Friend request sent
- `FRIEND_REQUEST_ACCEPTED` - Friend request accepted
- `TEAM_JOINED` - User joined team
- `TEAM_LEFT` - User left team
- `CHALLENGE_CREATED` - Challenge created
- `CHALLENGE_COMPLETED` - Challenge completed

### **Nutrition Events**
- `MEAL_LOGGED` - Meal logged
- `GOAL_UPDATED` - Goal updated
- `PROGRESS_TRACKED` - Progress tracked

### **Recommendation Events**
- `RECOMMENDATION_GENERATED` - Recommendation generated
- `RECOMMENDATION_ACCEPTED` - Recommendation accepted
- `RECOMMENDATION_REJECTED` - Recommendation rejected

### **System Events**
- `SYSTEM_MAINTENANCE` - System maintenance
- `SYSTEM_ERROR` - System error
- `PERFORMANCE_ALERT` - Performance alert

## 🛠️ **QUEUE CONFIGURATION**

### **Available Queues**
- `user_notifications` - User-related events
- `achievement_updates` - Achievement events
- `social_events` - Social interaction events
- `gamification_events` - Gamification events
- `recommendation_updates` - Recommendation events
- `system_events` - System events
- `dead_letter` - Failed messages

### **Queue Options**
```javascript
const queueOptions = {
  maxSize: 10000,           // Maximum messages in queue
  defaultTTL: 604800000,    // 7 days TTL
  retryAttempts: 3,         // Max retry attempts
  retryDelay: 1000,         // Retry delay in ms
  visibilityTimeout: 30000, // Message visibility timeout
  batchSize: 10             // Batch processing size
};
```

## 📈 **MONITORING & ANALYTICS**

### **Get Queue Statistics**
```javascript
// Get all queue statistics
const stats = await advancedMessageQueueService.getQueueStats();
console.log('Queue Statistics:', stats);

// Get specific queue statistics
const userStats = await advancedMessageQueueService.getQueueStats('user_notifications');
console.log('User Notifications Stats:', userStats);
```

### **Get Cluster Status**
```javascript
const clusterStatus = messageQueueScalingService.getClusterStatus();
console.log('Cluster Status:', {
  totalNodes: clusterStatus.totalNodes,
  healthyNodes: clusterStatus.healthyNodes,
  unhealthyNodes: clusterStatus.unhealthyNodes,
  loadBalancer: clusterStatus.loadBalancer
});
```

### **Get Dead Letter Messages**
```javascript
// Get dead letter messages
const dlqMessages = await advancedMessageQueueService.getDeadLetterMessages(
  'user_notifications', 
  100 // limit
);
console.log('Dead Letter Messages:', dlqMessages);

// Replay dead letter messages
const replayed = await advancedMessageQueueService.replayDeadLetterMessages(
  'user_notifications'
);
console.log('Replayed Messages:', replayed);
```

## 🔧 **ADVANCED FEATURES**

### **Message Priority**
```javascript
// High priority message
await advancedMessageQueueService.publish('user_notifications', messageData, {
  priority: 1, // Higher number = higher priority
  ttl: 3600000,
  maxRetries: 3
});

// Low priority message
await advancedMessageQueueService.publish('user_notifications', messageData, {
  priority: 0, // Lower number = lower priority
  ttl: 86400000,
  maxRetries: 1
});
```

### **Batch Processing**
```javascript
// Subscribe with batch processing
await advancedMessageQueueService.subscribe(
  'user_notifications',
  async (payload, message) => {
    // Process batch of messages
    for (const msg of payload) {
      await processMessage(msg);
    }
  },
  {
    batchSize: 10, // Process up to 10 messages at once
    autoAck: true,
    retryOnFailure: true
  }
);
```

### **Message Correlation**
```javascript
// Publish with correlation ID
await messageQueueIntegrationService.publishEvent(
  'USER_REGISTERED',
  userData,
  {
    correlationId: 'user_123',
    replyTo: 'user_response_queue'
  }
);

// Handle correlated messages
await advancedMessageQueueService.subscribe(
  'user_response_queue',
  async (payload, message) => {
    if (message.correlationId === 'user_123') {
      // Handle response for specific user
      await handleUserResponse(payload);
    }
  }
);
```

## 🚨 **ERROR HANDLING**

### **Dead Letter Queue Management**
```javascript
// Check dead letter queue status
const dlqStats = await advancedMessageQueueService.getQueueStats('user_notifications_dlq');
console.log('Dead Letter Queue Stats:', dlqStats);

// Replay specific messages
const messageIds = ['msg_123', 'msg_456'];
const replayed = await advancedMessageQueueService.replayDeadLetterMessages(
  'user_notifications',
  messageIds
);
```

### **Circuit Breaker Status**
```javascript
const clusterStatus = messageQueueScalingService.getClusterStatus();
const circuitBreakers = clusterStatus.circuitBreakers;

circuitBreakers.forEach(breaker => {
  console.log(`Node ${breaker.nodeId}: ${breaker.state} (${breaker.failureCount} failures)`);
});
```

## 📊 **PERFORMANCE METRICS**

### **Key Metrics to Monitor**
- **Messages Published**: Total messages sent to queues
- **Messages Consumed**: Total messages processed successfully
- **Messages Failed**: Total messages that failed processing
- **Messages Retried**: Total messages retried after failure
- **Dead Letter Messages**: Messages moved to dead letter queue
- **Average Processing Time**: Mean time to process messages
- **Queue Depths**: Current number of messages in each queue
- **Node Utilization**: CPU and memory usage per node

### **Performance Targets**
- **Message Throughput**: 10,000+ messages/second
- **Message Latency**: < 50ms average processing time
- **Reliability**: 99.9% message delivery success rate
- **Dead Letter Rate**: < 0.1% of total messages
- **Failover Time**: < 1 second

## 🔧 **CONFIGURATION**

### **Environment Variables**
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Redis Cluster Configuration
REDIS_CLUSTER_NODES=localhost:7000,localhost:7001,localhost:7002

# Message Queue Configuration
MQ_MAX_QUEUE_SIZE=10000
MQ_DEFAULT_TTL=604800000
MQ_RETRY_ATTEMPTS=3
MQ_BATCH_SIZE=10
```

### **Scaling Configuration**
```javascript
const scalingConfig = {
  minNodes: 2,
  maxNodes: 10,
  scaleUpThreshold: 0.8,
  scaleDownThreshold: 0.3,
  scaleUpCooldown: 300000,
  scaleDownCooldown: 600000
};
```

### **Load Balancing Configuration**
```javascript
const loadBalancingConfig = {
  algorithm: 'round_robin', // round_robin, least_connections, weighted
  healthCheckTimeout: 5000,
  retryAttempts: 3,
  circuitBreakerThreshold: 5,
  circuitBreakerTimeout: 60000
};
```

## 🎯 **BEST PRACTICES**

### **Event Publishing**
1. **Use appropriate event types** for different scenarios
2. **Set reasonable priorities** for message processing
3. **Include correlation IDs** for tracking related events
4. **Set appropriate TTL** based on message importance
5. **Handle publishing errors** gracefully

### **Event Handling**
1. **Implement idempotent handlers** to handle duplicate messages
2. **Use batch processing** for high-volume events
3. **Handle errors gracefully** and log appropriately
4. **Acknowledge messages** only after successful processing
5. **Monitor processing time** and optimize slow handlers

### **Monitoring**
1. **Monitor queue depths** to detect backlogs
2. **Track error rates** and investigate failures
3. **Monitor dead letter queues** regularly
4. **Set up alerts** for critical metrics
5. **Review performance metrics** regularly

## 🚀 **TROUBLESHOOTING**

### **Common Issues**

#### **High Queue Depth**
```javascript
// Check queue depth
const stats = await advancedMessageQueueService.getQueueStats('user_notifications');
if (stats.queues.user_notifications.depth > 1000) {
  console.log('High queue depth detected');
  // Consider scaling up or optimizing handlers
}
```

#### **High Error Rate**
```javascript
// Check error rate
const stats = await advancedMessageQueueService.getQueueStats();
const errorRate = stats.global.messagesFailed / stats.global.messagesPublished;
if (errorRate > 0.05) {
  console.log('High error rate detected:', errorRate);
  // Investigate failed messages
}
```

#### **Node Failures**
```javascript
// Check node health
const clusterStatus = messageQueueScalingService.getClusterStatus();
if (clusterStatus.unhealthyNodes > 0) {
  console.log('Unhealthy nodes detected:', clusterStatus.unhealthyNodes);
  // Check circuit breaker status
}
```

### **Recovery Procedures**

#### **Replay Dead Letter Messages**
```javascript
// Replay all dead letter messages
const replayed = await advancedMessageQueueService.replayDeadLetterMessages('user_notifications');
console.log('Replayed messages:', replayed);
```

#### **Scale Up Cluster**
```javascript
// Manual scale up (usually automatic)
const newNodeId = await messageQueueScalingService.addNode();
console.log('New node added:', newNodeId);
```

#### **Reset Circuit Breaker**
```javascript
// Circuit breakers reset automatically after timeout
// Monitor circuit breaker status
const clusterStatus = messageQueueScalingService.getClusterStatus();
console.log('Circuit breakers:', clusterStatus.circuitBreakers);
```

---

**🚀 Message Queue System - Ready for Production!**

The message queuing system provides reliable, scalable, and high-performance event processing for the Diet Game application.
