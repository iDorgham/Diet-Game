// WebSocket service for real-time updates
// Sprint 7-8: Core Backend Development - Day 7 Task 7.1 & 7.2

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Initialize WebSocket server
 */
export function initializeWebSocket(io) {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.id;
      socket.user = decoded;
      
      logger.info('WebSocket user authenticated', { 
        userId: socket.userId, 
        socketId: socket.id 
      });
      
      next();
    } catch (error) {
      logger.warn('WebSocket authentication failed', { 
        error: error.message, 
        socketId: socket.id 
      });
      next(new Error('Authentication failed'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const userId = socket.userId;
    
    logger.info('WebSocket user connected', { 
      userId, 
      socketId: socket.id,
      ip: socket.handshake.address 
    });

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to gamification updates',
      userId,
      timestamp: new Date().toISOString()
    });

    // Handle user joining specific rooms
    socket.on('join_room', (roomName) => {
      socket.join(roomName);
      logger.info('User joined room', { userId, roomName, socketId: socket.id });
      
      socket.emit('room_joined', {
        room: roomName,
        message: `Joined room: ${roomName}`
      });
    });

    // Handle user leaving rooms
    socket.on('leave_room', (roomName) => {
      socket.leave(roomName);
      logger.info('User left room', { userId, roomName, socketId: socket.id });
      
      socket.emit('room_left', {
        room: roomName,
        message: `Left room: ${roomName}`
      });
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info('WebSocket user disconnected', { 
        userId, 
        socketId: socket.id, 
        reason 
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error', { 
        userId, 
        socketId: socket.id, 
        error: error.message 
      });
    });
  });

  // Set up periodic health checks
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    logger.debug('WebSocket health check', { 
      connectedSockets,
      timestamp: new Date().toISOString()
    });
  }, 30000); // Every 30 seconds

  logger.info('WebSocket server initialized');
}

/**
 * WebSocket event emitter class
 */
export class WebSocketEmitter {
  
  /**
   * Emit level up event to user
   */
  static emitLevelUp(io, userId, levelData) {
    const eventData = {
      type: 'level_up',
      data: levelData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('levelUp', eventData);
    
    logger.info('Level up event emitted', { 
      userId, 
      newLevel: levelData.newLevel,
      bonusCoins: levelData.bonusCoins 
    });
  }

  /**
   * Emit achievement unlock event to user
   */
  static emitAchievementUnlock(io, userId, achievements) {
    const eventData = {
      type: 'achievement_unlock',
      data: achievements,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('achievementsUnlocked', eventData);
    
    logger.info('Achievement unlock event emitted', { 
      userId, 
      achievementCount: achievements.length 
    });
  }

  /**
   * Emit progress update to user
   */
  static emitProgressUpdate(io, userId, progressData) {
    const eventData = {
      type: 'progress_update',
      data: progressData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('progressUpdate', eventData);
    
    logger.debug('Progress update event emitted', { 
      userId, 
      xpEarned: progressData.xpEarned 
    });
  }

  /**
   * Emit streak update to user
   */
  static emitStreakUpdate(io, userId, streakData) {
    const eventData = {
      type: 'streak_update',
      data: streakData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('streakUpdate', eventData);
    
    logger.info('Streak update event emitted', { 
      userId, 
      streakType: streakData.streakType,
      newStreak: streakData.newStreak 
    });
  }

  /**
   * Emit quest completion to user
   */
  static emitQuestCompletion(io, userId, questData) {
    const eventData = {
      type: 'quest_completion',
      data: questData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('questCompleted', eventData);
    
    logger.info('Quest completion event emitted', { 
      userId, 
      questId: questData.questId,
      rewards: questData.rewards 
    });
  }

  /**
   * Emit leaderboard update to all users
   */
  static emitLeaderboardUpdate(io, leaderboardData) {
    const eventData = {
      type: 'leaderboard_update',
      data: leaderboardData,
      timestamp: new Date().toISOString()
    };

    io.emit('leaderboardUpdate', eventData);
    
    logger.info('Leaderboard update event emitted', { 
      type: leaderboardData.type,
      period: leaderboardData.period 
    });
  }

  /**
   * Emit notification to user
   */
  static emitNotification(io, userId, notification) {
    const eventData = {
      type: 'notification',
      data: notification,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('notification', eventData);
    
    logger.info('Notification event emitted', { 
      userId, 
      notificationType: notification.type 
    });
  }

  /**
   * Emit system announcement to all users
   */
  static emitSystemAnnouncement(io, announcement) {
    const eventData = {
      type: 'system_announcement',
      data: announcement,
      timestamp: new Date().toISOString()
    };

    io.emit('systemAnnouncement', eventData);
    
    logger.info('System announcement event emitted', { 
      title: announcement.title 
    });
  }

  /**
   * Emit friend activity to user
   */
  static emitFriendActivity(io, userId, activityData) {
    const eventData = {
      type: 'friend_activity',
      data: activityData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('friendActivity', eventData);
    
    logger.debug('Friend activity event emitted', { 
      userId, 
      friendId: activityData.friendId,
      activityType: activityData.type 
    });
  }

  /**
   * Emit challenge invitation to user
   */
  static emitChallengeInvitation(io, userId, challengeData) {
    const eventData = {
      type: 'challenge_invitation',
      data: challengeData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('challengeInvitation', eventData);
    
    logger.info('Challenge invitation event emitted', { 
      userId, 
      challengeId: challengeData.challengeId,
      fromUserId: challengeData.fromUserId 
    });
  }

  /**
   * Emit event to specific room
   */
  static emitToRoom(io, roomName, eventName, data) {
    const eventData = {
      type: eventName,
      data,
      timestamp: new Date().toISOString()
    };

    io.to(roomName).emit(eventName, eventData);
    
    logger.debug('Event emitted to room', { 
      roomName, 
      eventName,
      dataKeys: Object.keys(data) 
    });
  }

  /**
   * Emit event to multiple users
   */
  static emitToUsers(io, userIds, eventName, data) {
    const eventData = {
      type: eventName,
      data,
      timestamp: new Date().toISOString()
    };

    userIds.forEach(userId => {
      io.to(`user_${userId}`).emit(eventName, eventData);
    });
    
    logger.debug('Event emitted to users', { 
      userIds, 
      eventName,
      userCount: userIds.length 
    });
  }

  /**
   * Get connected users count
   */
  static getConnectedUsersCount(io) {
    return io.sockets.sockets.size;
  }

  /**
   * Get user's socket connections
   */
  static getUserSockets(io, userId) {
    const userRoom = io.sockets.adapter.rooms.get(`user_${userId}`);
    return userRoom ? userRoom.size : 0;
  }

  /**
   * Check if user is connected
   */
  static isUserConnected(io, userId) {
    return this.getUserSockets(io, userId) > 0;
  }

  /**
   * Disconnect user's all connections
   */
  static disconnectUser(io, userId) {
    const sockets = Array.from(io.sockets.sockets.values())
      .filter(socket => socket.userId === userId);

    sockets.forEach(socket => {
      socket.disconnect(true);
    });

    logger.info('User disconnected from WebSocket', { 
      userId, 
      disconnectedSockets: sockets.length 
    });
  }
}

/**
 * WebSocket room management
 */
export class WebSocketRooms {
  
  /**
   * Create a custom room
   */
  static createRoom(io, roomName, description = '') {
    // Rooms are created automatically when users join
    logger.info('Room created', { roomName, description });
  }

  /**
   * Get room information
   */
  static getRoomInfo(io, roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    return {
      name: roomName,
      size: room ? room.size : 0,
      sockets: room ? Array.from(room) : []
    };
  }

  /**
   * Get all rooms
   */
  static getAllRooms(io) {
    const rooms = [];
    for (const [roomName, room] of io.sockets.adapter.rooms) {
      if (!roomName.startsWith('user_')) { // Exclude user-specific rooms
        rooms.push({
          name: roomName,
          size: room.size,
          sockets: Array.from(room)
        });
      }
    }
    return rooms;
  }

  /**
   * Delete a room
   */
  static deleteRoom(io, roomName) {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (room) {
      // Disconnect all sockets in the room
      room.forEach(socketId => {
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(roomName);
        }
      });
      
      logger.info('Room deleted', { roomName });
    }
  }
}

export default { initializeWebSocket, WebSocketEmitter, WebSocketRooms };
