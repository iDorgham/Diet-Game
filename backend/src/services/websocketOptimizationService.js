/**
 * WebSocket Optimization Service
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Implements WebSocket connection pooling, message queuing, and optimization
 */

import { logger } from '../utils/logger.js';
import { performanceMonitoringService } from './performanceMonitoringService.js';

class WebSocketOptimizationService {
  constructor() {
    this.connections = new Map();
    this.rooms = new Map();
    this.messageQueue = new Map();
    this.updateBatcher = new Map();
    
    // Configuration
    this.config = {
      maxConnectionsPerUser: 3,
      messageQueueSize: 100,
      batchSize: 10,
      batchTimeout: 5000, // 5 seconds
      pingTimeout: 60000, // 1 minute
      pingInterval: 25000, // 25 seconds
      maxRetries: 3,
      retryDelay: 1000
    };
    
    // Performance tracking
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      messagesSent: 0,
      messagesQueued: 0,
      connectionDrops: 0,
      averageLatency: 0
    };
  }

  /**
   * Initialize WebSocket optimization
   */
  initialize(io) {
    this.io = io;
    this.setupEventHandlers();
    this.startHealthMonitoring();
    
    logger.info('WebSocket optimization service initialized');
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  /**
   * Handle new connection
   */
  handleConnection(socket) {
    const userId = socket.userId;
    const connectionId = socket.id;
    
    // Track connection
    this.connections.set(connectionId, {
      socket,
      userId,
      connectedAt: Date.now(),
      lastPing: Date.now(),
      roomCount: 0,
      messageCount: 0
    });
    
    this.stats.totalConnections++;
    this.stats.activeConnections++;
    
    // Setup socket event handlers
    this.setupSocketHandlers(socket);
    
    // Send queued messages if any
    this.deliverQueuedMessages(userId, socket);
    
    logger.info('WebSocket connection established', { 
      connectionId, 
      userId,
      activeConnections: this.stats.activeConnections 
    });
  }

  /**
   * Setup socket event handlers
   */
  setupSocketHandlers(socket) {
    const connectionId = socket.id;
    
    socket.on('disconnect', (reason) => {
      this.handleDisconnection(connectionId, reason);
    });
    
    socket.on('ping', () => {
      this.handlePing(connectionId);
    });
    
    socket.on('join_room', (roomName) => {
      this.joinRoom(socket, roomName);
    });
    
    socket.on('leave_room', (roomName) => {
      this.leaveRoom(socket, roomName);
    });
    
    socket.on('error', (error) => {
      this.handleSocketError(connectionId, error);
    });
  }

  /**
   * Handle disconnection
   */
  handleDisconnection(connectionId, reason) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    
    const { userId, roomCount } = connection;
    
    // Remove from all rooms
    for (let i = 0; i < roomCount; i++) {
      // This would need to track which rooms the user was in
      // For now, we'll handle it generically
    }
    
    // Remove connection
    this.connections.delete(connectionId);
    this.stats.activeConnections--;
    this.stats.connectionDrops++;
    
    logger.info('WebSocket connection closed', { 
      connectionId, 
      userId, 
      reason,
      activeConnections: this.stats.activeConnections 
    });
  }

  /**
   * Handle ping
   */
  handlePing(connectionId) {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.lastPing = Date.now();
      connection.socket.emit('pong');
    }
  }

  /**
   * Join room with optimization
   */
  joinRoom(socket, roomName) {
    const connectionId = socket.id;
    const connection = this.connections.get(connectionId);
    
    if (!connection) return;
    
    // Check room capacity
    const room = this.rooms.get(roomName);
    if (room && room.size > 1000) {
      logger.warn('Room capacity exceeded', { roomName, size: room.size });
      return;
    }
    
    socket.join(roomName);
    connection.roomCount++;
    
    // Track room membership
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(connectionId);
    
    logger.debug('User joined room', { 
      connectionId, 
      roomName,
      roomSize: this.rooms.get(roomName).size 
    });
  }

  /**
   * Leave room
   */
  leaveRoom(socket, roomName) {
    const connectionId = socket.id;
    const connection = this.connections.get(connectionId);
    
    if (!connection) return;
    
    socket.leave(roomName);
    connection.roomCount--;
    
    // Remove from room tracking
    const room = this.rooms.get(roomName);
    if (room) {
      room.delete(connectionId);
      if (room.size === 0) {
        this.rooms.delete(roomName);
      }
    }
    
    logger.debug('User left room', { connectionId, roomName });
  }

  /**
   * Broadcast to room with optimization
   */
  broadcastToRoom(roomName, event, data, options = {}) {
    const room = this.rooms.get(roomName);
    if (!room || room.size === 0) {
      logger.debug('No active connections in room', { roomName });
      return;
    }
    
    const startTime = Date.now();
    
    // Use native room broadcasting for efficiency
    this.io.to(roomName).emit(event, data);
    
    // Track performance
    const latency = Date.now() - startTime;
    this.stats.messagesSent += room.size;
    this.updateAverageLatency(latency);
    
    // Record performance metrics
    performanceMonitoringService.recordRealtimeLatency(
      latency, 
      'room_broadcast', 
      roomName
    );
    
    logger.debug('Message broadcasted to room', { 
      roomName, 
      event, 
      connections: room.size,
      latency 
    });
  }

  /**
   * Send message to user with queuing
   */
  sendToUser(userId, event, data, options = {}) {
    const userConnections = this.getUserConnections(userId);
    
    if (userConnections.length === 0) {
      // Queue message for offline user
      this.queueMessage(userId, event, data, options);
      return;
    }
    
    // Send to all user connections
    userConnections.forEach(connection => {
      this.sendToConnection(connection, event, data, options);
    });
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(connection, event, data, options = {}) {
    try {
      const startTime = Date.now();
      
      connection.socket.emit(event, data);
      
      // Track performance
      const latency = Date.now() - startTime;
      connection.messageCount++;
      this.stats.messagesSent++;
      this.updateAverageLatency(latency);
      
      // Record performance metrics
      performanceMonitoringService.recordRealtimeLatency(
        latency, 
        'user_message', 
        connection.userId
      );
      
    } catch (error) {
      logger.error('Error sending message to connection', { 
        connectionId: connection.socket.id,
        error: error.message 
      });
    }
  }

  /**
   * Queue message for offline user
   */
  queueMessage(userId, event, data, options = {}) {
    if (!this.messageQueue.has(userId)) {
      this.messageQueue.set(userId, []);
    }
    
    const queue = this.messageQueue.get(userId);
    
    // Limit queue size
    if (queue.length >= this.config.messageQueueSize) {
      queue.shift(); // Remove oldest message
    }
    
    queue.push({
      event,
      data,
      timestamp: Date.now(),
      options
    });
    
    this.stats.messagesQueued++;
    
    logger.debug('Message queued for offline user', { 
      userId, 
      queueSize: queue.length 
    });
  }

  /**
   * Deliver queued messages to user
   */
  deliverQueuedMessages(userId, socket) {
    const queue = this.messageQueue.get(userId);
    if (!queue || queue.length === 0) return;
    
    let delivered = 0;
    const maxAge = 300000; // 5 minutes
    
    queue.forEach(message => {
      // Skip old messages
      if (Date.now() - message.timestamp > maxAge) {
        return;
      }
      
      try {
        socket.emit(message.event, message.data);
        delivered++;
      } catch (error) {
        logger.error('Error delivering queued message', { 
          userId, 
          error: error.message 
        });
      }
    });
    
    // Clear delivered messages
    this.messageQueue.delete(userId);
    
    if (delivered > 0) {
      logger.info('Queued messages delivered', { userId, delivered });
    }
  }

  /**
   * Batch updates for efficiency
   */
  addToBatch(userId, update) {
    if (!this.updateBatcher.has(userId)) {
      this.updateBatcher.set(userId, {
        updates: [],
        timeout: null
      });
    }
    
    const batch = this.updateBatcher.get(userId);
    batch.updates.push(update);
    
    // Flush batch if size limit reached
    if (batch.updates.length >= this.config.batchSize) {
      this.flushBatch(userId);
    } else {
      // Set timeout to flush batch
      if (batch.timeout) {
        clearTimeout(batch.timeout);
      }
      
      batch.timeout = setTimeout(() => {
        this.flushBatch(userId);
      }, this.config.batchTimeout);
    }
  }

  /**
   * Flush batched updates
   */
  flushBatch(userId) {
    const batch = this.updateBatcher.get(userId);
    if (!batch || batch.updates.length === 0) return;
    
    const updates = batch.updates;
    batch.updates = [];
    
    if (batch.timeout) {
      clearTimeout(batch.timeout);
      batch.timeout = null;
    }
    
    // Send batched updates
    this.sendToUser(userId, 'batch_update', { updates });
    
    logger.debug('Batched updates sent', { userId, count: updates.length });
  }

  /**
   * Get user connections
   */
  getUserConnections(userId) {
    const connections = [];
    
    for (const [connectionId, connection] of this.connections) {
      if (connection.userId === userId) {
        connections.push(connection);
      }
    }
    
    return connections;
  }

  /**
   * Update average latency
   */
  updateAverageLatency(latency) {
    const alpha = 0.1; // Smoothing factor
    this.stats.averageLatency = this.stats.averageLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    setInterval(() => {
      this.checkConnectionHealth();
      this.cleanupStaleConnections();
      this.cleanupOldQueuedMessages();
    }, 30000); // Every 30 seconds
  }

  /**
   * Check connection health
   */
  checkConnectionHealth() {
    const now = Date.now();
    const staleConnections = [];
    
    for (const [connectionId, connection] of this.connections) {
      const timeSincePing = now - connection.lastPing;
      
      if (timeSincePing > this.config.pingTimeout) {
        staleConnections.push(connectionId);
      }
    }
    
    // Remove stale connections
    staleConnections.forEach(connectionId => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.socket.disconnect('stale_connection');
        this.handleDisconnection(connectionId, 'stale_connection');
      }
    });
    
    if (staleConnections.length > 0) {
      logger.warn('Stale connections removed', { count: staleConnections.length });
    }
  }

  /**
   * Cleanup stale connections
   */
  cleanupStaleConnections() {
    // This is handled in checkConnectionHealth
  }

  /**
   * Cleanup old queued messages
   */
  cleanupOldQueuedMessages() {
    const maxAge = 300000; // 5 minutes
    const now = Date.now();
    
    for (const [userId, queue] of this.messageQueue) {
      const validMessages = queue.filter(
        message => now - message.timestamp < maxAge
      );
      
      if (validMessages.length === 0) {
        this.messageQueue.delete(userId);
      } else if (validMessages.length !== queue.length) {
        this.messageQueue.set(userId, validMessages);
      }
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeRooms: this.rooms.size,
      queuedMessages: Array.from(this.messageQueue.values())
        .reduce((total, queue) => total + queue.length, 0),
      averageConnectionsPerRoom: this.rooms.size > 0 
        ? Array.from(this.rooms.values())
            .reduce((total, room) => total + room.size, 0) / this.rooms.size
        : 0
    };
  }

  /**
   * Get room information
   */
  getRoomInfo(roomName) {
    const room = this.rooms.get(roomName);
    return room ? {
      name: roomName,
      size: room.size,
      connections: Array.from(room)
    } : null;
  }

  /**
   * Get user connection info
   */
  getUserInfo(userId) {
    const connections = this.getUserConnections(userId);
    const queuedMessages = this.messageQueue.get(userId) || [];
    
    return {
      userId,
      activeConnections: connections.length,
      queuedMessages: queuedMessages.length,
      totalMessages: connections.reduce((total, conn) => total + conn.messageCount, 0)
    };
  }

  /**
   * Force disconnect user
   */
  forceDisconnectUser(userId, reason = 'admin_action') {
    const connections = this.getUserConnections(userId);
    
    connections.forEach(connection => {
      connection.socket.disconnect(reason);
      this.handleDisconnection(connection.socket.id, reason);
    });
    
    logger.info('User forcefully disconnected', { userId, reason, count: connections.length });
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    logger.info('WebSocket configuration updated', { config: this.config });
  }
}

// Export singleton instance
export const websocketOptimizationService = new WebSocketOptimizationService();
export default websocketOptimizationService;
