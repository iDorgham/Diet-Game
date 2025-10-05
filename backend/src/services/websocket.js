// WebSocket service for real-time updates
// Sprint 7-8: Core Backend Development - Day 7 Task 7.1 & 7.2

import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';
import { messageQueueService } from './messageQueue.js';
import { realtimeAnalyticsService } from './realtimeAnalytics.js';
import { liveModerationService } from './liveModeration.js';

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

    // Initialize connection tracking
    socket.connectionStartTime = Date.now();
    socket.lastPing = Date.now();
    socket.reconnectAttempts = 0;
    socket.maxReconnectAttempts = 5;
    socket.reconnectDelay = 1000; // Start with 1 second
    socket.isReconnecting = false;

    // Join user-specific room
    socket.join(`user_${userId}`);

    // Send connection confirmation with reconnection info
    socket.emit('connected', {
      message: 'Connected to real-time updates',
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      reconnectConfig: {
        maxAttempts: socket.maxReconnectAttempts,
        baseDelay: socket.reconnectDelay,
        backoffMultiplier: 2
      }
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

    // ===== REAL-TIME CHAT SYSTEM =====
    socket.on('chat:join', (data) => {
      const { chatRoom, chatType = 'general' } = data;
      socket.join(`chat_${chatRoom}`);
      socket.chatRoom = chatRoom;
      socket.chatType = chatType;
      
      logger.info('User joined chat room', { userId, chatRoom, chatType });
      
      // Notify others in the room
      socket.to(`chat_${chatRoom}`).emit('chat:user_joined', {
        userId,
        username: socket.user?.username || 'Anonymous',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('chat:leave', () => {
      if (socket.chatRoom) {
        socket.leave(`chat_${socket.chatRoom}`);
        
        // Notify others in the room
        socket.to(`chat_${socket.chatRoom}`).emit('chat:user_left', {
          userId,
          username: socket.user?.username || 'Anonymous',
          timestamp: new Date().toISOString()
        });
        
        logger.info('User left chat room', { userId, chatRoom: socket.chatRoom });
        delete socket.chatRoom;
        delete socket.chatType;
      }
    });

    socket.on('chat:message', (data) => {
      if (!socket.chatRoom) {
        socket.emit('chat:error', { message: 'Not in a chat room' });
        return;
      }

      const message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        username: socket.user?.username || 'Anonymous',
        message: data.message,
        timestamp: new Date().toISOString(),
        chatRoom: socket.chatRoom,
        chatType: socket.chatType
      };

      // Broadcast to all users in the chat room
      io.to(`chat_${socket.chatRoom}`).emit('chat:message', message);
      
      logger.info('Chat message sent', { 
        userId, 
        chatRoom: socket.chatRoom, 
        messageId: message.id 
      });
    });

    // ===== LIVE CHALLENGE TRACKING =====
    socket.on('challenge:join', (data) => {
      const { challengeId } = data;
      socket.join(`challenge_${challengeId}`);
      socket.challengeId = challengeId;
      
      logger.info('User joined challenge', { userId, challengeId });
      
      // Notify challenge participants
      socket.to(`challenge_${challengeId}`).emit('challenge:participant_joined', {
        userId,
        username: socket.user?.username || 'Anonymous',
        challengeId,
        timestamp: new Date().toISOString()
      });
    });

    // ===== CHALLENGE NOTIFICATIONS =====
    
    // Handle challenge invitation
    socket.on('challenge:invite', (data) => {
      const { targetUserId, challengeId, challengeName, challengeType = 'daily' } = data;
      
      logger.info('Challenge invitation sent', { 
        fromUserId: userId, 
        targetUserId, 
        challengeId, 
        challengeName 
      });

      // Send invitation to target user
      io.to(`user_${targetUserId}`).emit('challenge:invitation', {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fromUserId: userId,
        fromUsername: socket.user?.username || 'Anonymous',
        targetUserId,
        challengeId,
        challengeName,
        challengeType,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

      // Confirm invitation sent to sender
      socket.emit('challenge:invitation_sent', {
        targetUserId,
        challengeId,
        challengeName,
        timestamp: new Date().toISOString()
      });
    });

    // Handle challenge invitation response
    socket.on('challenge:respond_invitation', (data) => {
      const { invitationId, response, challengeId } = data; // response: 'accept' or 'decline'
      
      logger.info('Challenge invitation response', { 
        userId, 
        invitationId, 
        response, 
        challengeId 
      });

      if (response === 'accept') {
        // Join the challenge
        socket.join(`challenge_${challengeId}`);
        socket.challengeId = challengeId;
        
        // Notify challenge participants
        io.to(`challenge_${challengeId}`).emit('challenge:participant_joined', {
          userId,
          username: socket.user?.username || 'Anonymous',
          challengeId,
          timestamp: new Date().toISOString()
        });

        // Confirm acceptance
        socket.emit('challenge:invitation_accepted', {
          invitationId,
          challengeId,
          timestamp: new Date().toISOString()
        });
      } else {
        // Notify challenge creator about decline
        socket.emit('challenge:invitation_declined', {
          invitationId,
          challengeId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Handle challenge creation notification
    socket.on('challenge:create', (data) => {
      const { challengeId, challengeName, challengeType, participants = [] } = data;
      
      logger.info('Challenge created', { 
        creatorId: userId, 
        challengeId, 
        challengeName, 
        challengeType,
        participantCount: participants.length 
      });

      // Notify all participants about new challenge
      participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('challenge:created', {
          id: `challenge_${challengeId}`,
          challengeId,
          challengeName,
          challengeType,
          creatorId: userId,
          creatorUsername: socket.user?.username || 'Anonymous',
          participantId,
          timestamp: new Date().toISOString(),
          startTime: data.startTime || new Date().toISOString(),
          endTime: data.endTime,
          description: data.description,
          rewards: data.rewards
        });
      });

      // Confirm creation to creator
      socket.emit('challenge:creation_confirmed', {
        challengeId,
        challengeName,
        participantCount: participants.length,
        timestamp: new Date().toISOString()
      });
    });

    // Handle challenge milestone notifications
    socket.on('challenge:milestone', (data) => {
      const { challengeId, milestoneType, milestoneValue, message } = data;
      
      logger.info('Challenge milestone reached', { 
        userId, 
        challengeId, 
        milestoneType, 
        milestoneValue 
      });

      // Notify all challenge participants
      io.to(`challenge_${challengeId}`).emit('challenge:milestone_reached', {
        challengeId,
        userId,
        username: socket.user?.username || 'Anonymous',
        milestoneType,
        milestoneValue,
        message,
        timestamp: new Date().toISOString()
      });
    });

    // Handle challenge leaderboard updates
    socket.on('challenge:leaderboard_update', (data) => {
      const { challengeId, leaderboard } = data;
      
      logger.info('Challenge leaderboard updated', { 
        challengeId, 
        participantCount: leaderboard.length 
      });

      // Broadcast leaderboard to all challenge participants
      io.to(`challenge_${challengeId}`).emit('challenge:leaderboard_updated', {
        challengeId,
        leaderboard,
        timestamp: new Date().toISOString()
      });
    });

    // Handle challenge reminder requests
    socket.on('challenge:request_reminder', (data) => {
      const { challengeId, reminderType = 'daily' } = data;
      
      logger.info('Challenge reminder requested', { 
        userId, 
        challengeId, 
        reminderType 
      });

      // Store reminder preference (would integrate with reminder service)
      socket.emit('challenge:reminder_set', {
        challengeId,
        reminderType,
        timestamp: new Date().toISOString()
      });
    });

    // Handle challenge achievement notifications
    socket.on('challenge:achievement', (data) => {
      const { challengeId, achievementType, achievementData } = data;
      
      logger.info('Challenge achievement unlocked', { 
        userId, 
        challengeId, 
        achievementType 
      });

      // Notify user about achievement
      socket.emit('challenge:achievement_unlocked', {
        challengeId,
        achievementType,
        achievementData,
        timestamp: new Date().toISOString()
      });

      // Notify challenge participants about achievement
      socket.to(`challenge_${challengeId}`).emit('challenge:participant_achievement', {
        challengeId,
        userId,
        username: socket.user?.username || 'Anonymous',
        achievementType,
        achievementData,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('challenge:progress', (data) => {
      if (!socket.challengeId) {
        socket.emit('challenge:error', { message: 'Not in a challenge' });
        return;
      }

      const progressUpdate = {
        userId,
        username: socket.user?.username || 'Anonymous',
        challengeId: socket.challengeId,
        progress: data.progress,
        score: data.score,
        timestamp: new Date().toISOString()
      };

      // Broadcast progress to all challenge participants
      io.to(`challenge_${socket.challengeId}`).emit('challenge:progress_update', progressUpdate);
      
      logger.info('Challenge progress updated', { 
        userId, 
        challengeId: socket.challengeId, 
        progress: data.progress 
      });
    });

    socket.on('challenge:complete', (data) => {
      if (!socket.challengeId) {
        socket.emit('challenge:error', { message: 'Not in a challenge' });
        return;
      }

      const completionData = {
        userId,
        username: socket.user?.username || 'Anonymous',
        challengeId: socket.challengeId,
        finalScore: data.finalScore,
        completionTime: data.completionTime,
        timestamp: new Date().toISOString()
      };

      // Broadcast completion to all challenge participants
      io.to(`challenge_${socket.challengeId}`).emit('challenge:completed', completionData);
      
      logger.info('Challenge completed', { 
        userId, 
        challengeId: socket.challengeId, 
        finalScore: data.finalScore 
      });
    });

    // ===== LIVE ANALYTICS =====
    socket.on('analytics:subscribe', (data) => {
      const { analyticsType = 'general' } = data;
      socket.join(`analytics_${analyticsType}`);
      socket.analyticsType = analyticsType;
      
      // Subscribe to analytics service
      realtimeAnalyticsService.subscribe(analyticsType, socket.id);
      
      // Send current metrics
      const currentMetrics = realtimeAnalyticsService.getMetrics(analyticsType);
      if (currentMetrics) {
        socket.emit('analytics:current_metrics', currentMetrics);
      }
      
      logger.info('User subscribed to analytics', { userId, analyticsType });
    });

    socket.on('analytics:unsubscribe', () => {
      if (socket.analyticsType) {
        socket.leave(`analytics_${socket.analyticsType}`);
        
        // Unsubscribe from analytics service
        realtimeAnalyticsService.unsubscribe(socket.analyticsType, socket.id);
        
        logger.info('User unsubscribed from analytics', { userId, analyticsType: socket.analyticsType });
        delete socket.analyticsType;
      }
    });

    // ===== LIVE MODERATION =====
    socket.on('moderation:report', (data) => {
      const reportData = {
        reporterId: userId,
        reportedUserId: data.reportedUserId,
        reportType: data.reportType,
        reason: data.reason,
        content: data.content,
        timestamp: new Date().toISOString()
      };

      // Process report through moderation service
      const report = liveModerationService.processReport(reportData);

      // Send to moderation room
      io.to('moderation_room').emit('moderation:new_report', report);
      
      logger.warn('Content reported', { 
        reportId: report.id,
        reporterId: userId, 
        reportedUserId: data.reportedUserId, 
        reportType: data.reportType,
        severity: report.severity
      });
    });

    // Handle moderator actions
    socket.on('moderation:resolve_report', (data) => {
      try {
        const report = liveModerationService.resolveReport(
          data.reportId, 
          userId, 
          data.action, 
          data.notes
        );
        
        // Notify all moderators
        io.to('moderation_room').emit('moderation:report_resolved', report);
        
        logger.info('Report resolved by moderator', {
          reportId: data.reportId,
          moderatorId: userId,
          action: data.action
        });
      } catch (error) {
        socket.emit('moderation:error', { message: error.message });
      }
    });

    // Handle moderator joining
    socket.on('moderation:join', () => {
      liveModerationService.addModerator(socket.id);
      socket.join('moderation_room');
      
      // Send current pending reports
      const pendingReports = liveModerationService.getPendingReports();
      socket.emit('moderation:pending_reports', pendingReports);
      
      logger.info('Moderator joined', { socketId: socket.id, userId });
    });

    // ===== MESSAGE QUEUING FOR OFFLINE USERS =====
    socket.on('message_queue:request', () => {
      const queuedMessages = messageQueueService.getQueuedMessages(userId);
      socket.emit('message_queue:response', {
        messages: queuedMessages,
        timestamp: new Date().toISOString()
      });
      
      // Clear the queue after delivering messages
      if (queuedMessages.length > 0) {
        messageQueueService.clearUserQueue(userId);
      }
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.lastPing = Date.now();
      socket.emit('pong', { 
        timestamp: new Date().toISOString(),
        serverTime: Date.now()
      });
    });

    // ===== RECONNECTION LOGIC =====
    
    // Handle reconnection attempt
    socket.on('reconnect_attempt', (data) => {
      const { attempt, delay, reason } = data;
      
      logger.info('Reconnection attempt received', {
        userId,
        socketId: socket.id,
        attempt,
        delay,
        reason
      });

      // Validate reconnection attempt
      if (attempt > socket.maxReconnectAttempts) {
        socket.emit('reconnect_failed', {
          message: 'Maximum reconnection attempts exceeded',
          maxAttempts: socket.maxReconnectAttempts,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update reconnection tracking
      socket.reconnectAttempts = attempt;
      socket.isReconnecting = true;

      // Send reconnection acknowledgment
      socket.emit('reconnect_acknowledged', {
        attempt,
        nextDelay: Math.min(delay * 2, 30000), // Max 30 seconds
        timestamp: new Date().toISOString()
      });
    });

    // Handle successful reconnection
    socket.on('reconnect_success', (data) => {
      const { previousSocketId, reconnectTime } = data;
      
      logger.info('Reconnection successful', {
        userId,
        newSocketId: socket.id,
        previousSocketId,
        reconnectTime,
        totalAttempts: socket.reconnectAttempts
      });

      // Reset reconnection state
      socket.reconnectAttempts = 0;
      socket.isReconnecting = false;
      socket.lastPing = Date.now();

      // Send reconnection success confirmation
      socket.emit('reconnect_confirmed', {
        message: 'Reconnection successful',
        newSocketId: socket.id,
        previousSocketId,
        timestamp: new Date().toISOString()
      });

      // Restore user state if needed
      restoreUserState(socket, userId);
    });

    // Handle reconnection failure
    socket.on('reconnect_failed', (data) => {
      const { reason, totalAttempts } = data;
      
      logger.warn('Reconnection failed', {
        userId,
        socketId: socket.id,
        reason,
        totalAttempts
      });

      // Mark as failed reconnection
      socket.isReconnecting = false;
      
      // Send failure notification
      socket.emit('reconnect_final_failure', {
        message: 'Reconnection failed after maximum attempts',
        reason,
        totalAttempts,
        timestamp: new Date().toISOString()
      });
    });

    // Handle connection health check
    socket.on('health_check', () => {
      const now = Date.now();
      const connectionDuration = now - socket.connectionStartTime;
      const timeSinceLastPing = now - socket.lastPing;
      
      socket.emit('health_status', {
        status: 'healthy',
        connectionDuration,
        timeSinceLastPing,
        reconnectAttempts: socket.reconnectAttempts,
        isReconnecting: socket.isReconnecting,
        timestamp: new Date().toISOString()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      const connectionDuration = Date.now() - socket.connectionStartTime;
      
      // Store user state for potential reconnection
      if (socket.chatRoom || socket.challengeId || socket.analyticsType) {
        storeUserState(userId, {
          chatRoom: socket.chatRoom,
          chatType: socket.chatType,
          challengeId: socket.challengeId,
          analyticsType: socket.analyticsType,
          isModerator: socket.rooms.has('moderation_room'),
          disconnectTime: Date.now(),
          disconnectReason: reason
        });
      }

      // Clean up chat room
      if (socket.chatRoom) {
        socket.to(`chat_${socket.chatRoom}`).emit('chat:user_left', {
          userId,
          username: socket.user?.username || 'Anonymous',
          timestamp: new Date().toISOString(),
          reason: reason === 'client namespace disconnect' ? 'reconnecting' : 'disconnected'
        });
      }

      // Clean up challenge room
      if (socket.challengeId) {
        socket.to(`challenge_${socket.challengeId}`).emit('challenge:participant_left', {
          userId,
          username: socket.user?.username || 'Anonymous',
          challengeId: socket.challengeId,
          timestamp: new Date().toISOString(),
          reason: reason === 'client namespace disconnect' ? 'reconnecting' : 'disconnected'
        });
      }

      // Clean up analytics subscription
      if (socket.analyticsType) {
        realtimeAnalyticsService.unsubscribe(socket.analyticsType, socket.id);
      }

      // Clean up moderation
      liveModerationService.removeModerator(socket.id);

      logger.info('WebSocket user disconnected', { 
        userId, 
        socketId: socket.id, 
        reason,
        connectionDuration,
        reconnectAttempts: socket.reconnectAttempts,
        isReconnecting: socket.isReconnecting
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

  // Start real-time analytics service
  realtimeAnalyticsService.start();

  // Set up analytics broadcasting
  setInterval(() => {
    const metrics = realtimeAnalyticsService.getMetrics('general');
    if (metrics) {
      io.to('analytics_general').emit('analytics:update', {
        type: 'analytics_update',
        data: metrics,
        timestamp: new Date().toISOString()
      });
    }
  }, 5000); // Every 5 seconds

  logger.info('WebSocket server initialized with enhanced real-time features');
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

  // ===== COMPREHENSIVE CHALLENGE NOTIFICATION EMITTERS =====

  /**
   * Emit challenge invitation notification
   */
  static emitChallengeInvitationNotification(io, targetUserId, invitationData) {
    const eventData = {
      type: 'challenge_invitation',
      data: {
        id: `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...invitationData,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      },
      timestamp: new Date().toISOString()
    };

    io.to(`user_${targetUserId}`).emit('challenge:invitation', eventData);
    
    logger.info('Challenge invitation notification emitted', { 
      targetUserId, 
      challengeId: invitationData.challengeId,
      fromUserId: invitationData.fromUserId 
    });
  }

  /**
   * Emit challenge creation notification
   */
  static emitChallengeCreationNotification(io, participantIds, challengeData) {
    const eventData = {
      type: 'challenge_created',
      data: {
        id: `challenge_${challengeData.challengeId}`,
        ...challengeData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    participantIds.forEach(participantId => {
      io.to(`user_${participantId}`).emit('challenge:created', eventData);
    });
    
    logger.info('Challenge creation notification emitted', { 
      challengeId: challengeData.challengeId,
      participantCount: participantIds.length,
      creatorId: challengeData.creatorId 
    });
  }

  /**
   * Emit challenge milestone notification
   */
  static emitChallengeMilestoneNotification(io, challengeId, milestoneData) {
    const eventData = {
      type: 'challenge_milestone',
      data: {
        challengeId,
        ...milestoneData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:milestone_reached', eventData);
    
    logger.info('Challenge milestone notification emitted', { 
      challengeId, 
      milestoneType: milestoneData.milestoneType,
      userId: milestoneData.userId 
    });
  }

  /**
   * Emit challenge leaderboard update notification
   */
  static emitChallengeLeaderboardNotification(io, challengeId, leaderboardData) {
    const eventData = {
      type: 'challenge_leaderboard_update',
      data: {
        challengeId,
        leaderboard: leaderboardData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:leaderboard_updated', eventData);
    
    logger.info('Challenge leaderboard notification emitted', { 
      challengeId, 
      participantCount: leaderboardData.length 
    });
  }

  /**
   * Emit challenge achievement notification
   */
  static emitChallengeAchievementNotification(io, userId, challengeId, achievementData) {
    const eventData = {
      type: 'challenge_achievement',
      data: {
        challengeId,
        userId,
        ...achievementData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    // Notify the user who achieved it
    io.to(`user_${userId}`).emit('challenge:achievement_unlocked', eventData);
    
    // Notify other challenge participants
    io.to(`challenge_${challengeId}`).emit('challenge:participant_achievement', eventData);
    
    logger.info('Challenge achievement notification emitted', { 
      userId, 
      challengeId, 
      achievementType: achievementData.achievementType 
    });
  }

  /**
   * Emit challenge reminder notification
   */
  static emitChallengeReminderNotification(io, userId, reminderData) {
    const eventData = {
      type: 'challenge_reminder',
      data: {
        ...reminderData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('challenge:reminder', eventData);
    
    logger.info('Challenge reminder notification emitted', { 
      userId, 
      challengeId: reminderData.challengeId,
      reminderType: reminderData.reminderType 
    });
  }

  /**
   * Emit challenge status change notification
   */
  static emitChallengeStatusNotification(io, challengeId, statusData) {
    const eventData = {
      type: 'challenge_status_change',
      data: {
        challengeId,
        ...statusData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:status_changed', eventData);
    
    logger.info('Challenge status notification emitted', { 
      challengeId, 
      newStatus: statusData.newStatus,
      reason: statusData.reason 
    });
  }

  /**
   * Emit challenge deadline warning notification
   */
  static emitChallengeDeadlineWarning(io, challengeId, warningData) {
    const eventData = {
      type: 'challenge_deadline_warning',
      data: {
        challengeId,
        ...warningData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:deadline_warning', eventData);
    
    logger.info('Challenge deadline warning emitted', { 
      challengeId, 
      timeRemaining: warningData.timeRemaining,
      warningType: warningData.warningType 
    });
  }

  /**
   * Emit challenge completion notification
   */
  static emitChallengeCompletionNotification(io, challengeId, completionData) {
    const eventData = {
      type: 'challenge_completion',
      data: {
        challengeId,
        ...completionData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:completed', eventData);
    
    logger.info('Challenge completion notification emitted', { 
      challengeId, 
      winnerId: completionData.winnerId,
      participantCount: completionData.participantCount 
    });
  }

  /**
   * Emit challenge reward notification
   */
  static emitChallengeRewardNotification(io, userId, rewardData) {
    const eventData = {
      type: 'challenge_reward',
      data: {
        userId,
        ...rewardData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('challenge:reward_earned', eventData);
    
    logger.info('Challenge reward notification emitted', { 
      userId, 
      challengeId: rewardData.challengeId,
      rewardType: rewardData.rewardType,
      rewardValue: rewardData.rewardValue 
    });
  }

  /**
   * Emit challenge team update notification
   */
  static emitChallengeTeamUpdateNotification(io, challengeId, teamUpdateData) {
    const eventData = {
      type: 'challenge_team_update',
      data: {
        challengeId,
        ...teamUpdateData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:team_updated', eventData);
    
    logger.info('Challenge team update notification emitted', { 
      challengeId, 
      updateType: teamUpdateData.updateType,
      affectedUserId: teamUpdateData.affectedUserId 
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

  // ===== NEW REAL-TIME FEATURE EMITTERS =====

  /**
   * Emit chat message to room
   */
  static emitChatMessage(io, chatRoom, message) {
    const eventData = {
      type: 'chat_message',
      data: message,
      timestamp: new Date().toISOString()
    };

    io.to(`chat_${chatRoom}`).emit('chat:message', eventData);
    
    logger.info('Chat message emitted', { 
      chatRoom, 
      messageId: message.id,
      userId: message.userId 
    });
  }

  /**
   * Emit challenge update to participants
   */
  static emitChallengeUpdate(io, challengeId, updateData) {
    const eventData = {
      type: 'challenge_update',
      data: updateData,
      timestamp: new Date().toISOString()
    };

    io.to(`challenge_${challengeId}`).emit('challenge:update', eventData);
    
    logger.info('Challenge update emitted', { 
      challengeId, 
      updateType: updateData.type 
    });
  }

  /**
   * Emit live analytics data
   */
  static emitAnalyticsUpdate(io, analyticsType, analyticsData) {
    const eventData = {
      type: 'analytics_update',
      data: analyticsData,
      timestamp: new Date().toISOString()
    };

    io.to(`analytics_${analyticsType}`).emit('analytics:update', eventData);
    
    logger.debug('Analytics update emitted', { 
      analyticsType, 
      dataKeys: Object.keys(analyticsData) 
    });
  }

  /**
   * Emit moderation alert
   */
  static emitModerationAlert(io, alertData) {
    const eventData = {
      type: 'moderation_alert',
      data: alertData,
      timestamp: new Date().toISOString()
    };

    io.to('moderation_room').emit('moderation:alert', eventData);
    
    logger.warn('Moderation alert emitted', { 
      alertType: alertData.type,
      severity: alertData.severity 
    });
  }

  /**
   * Emit live leaderboard update
   */
  static emitLiveLeaderboardUpdate(io, leaderboardType, leaderboardData) {
    const eventData = {
      type: 'live_leaderboard_update',
      data: {
        type: leaderboardType,
        leaderboard: leaderboardData,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    io.emit('leaderboard:live_update', eventData);
    
    logger.info('Live leaderboard update emitted', { 
      leaderboardType, 
      participantCount: leaderboardData.length 
    });
  }

  /**
   * Emit real-time nutrition tracking update
   */
  static emitNutritionUpdate(io, userId, nutritionData) {
    const eventData = {
      type: 'nutrition_update',
      data: nutritionData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('nutrition:update', eventData);
    
    logger.debug('Nutrition update emitted', { 
      userId, 
      calories: nutritionData.calories,
      macros: nutritionData.macros 
    });
  }

  /**
   * Emit AI coach response
   */
  static emitAICoachResponse(io, userId, responseData) {
    const eventData = {
      type: 'ai_coach_response',
      data: responseData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('ai:coach_response', eventData);
    
    logger.info('AI coach response emitted', { 
      userId, 
      responseType: responseData.type 
    });
  }

  /**
   * Emit social activity update
   */
  static emitSocialActivity(io, userId, activityData) {
    const eventData = {
      type: 'social_activity',
      data: activityData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('social:activity', eventData);
    
    logger.debug('Social activity emitted', { 
      userId, 
      activityType: activityData.type 
    });
  }

  /**
   * Emit system performance metrics
   */
  static emitPerformanceMetrics(io, metricsData) {
    const eventData = {
      type: 'performance_metrics',
      data: metricsData,
      timestamp: new Date().toISOString()
    };

    io.emit('system:performance_metrics', eventData);
    
    logger.debug('Performance metrics emitted', { 
      responseTime: metricsData.responseTime,
      memoryUsage: metricsData.memoryUsage 
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

  /**
   * Emit reconnection status to user
   */
  static emitReconnectionStatus(io, userId, status) {
    const eventData = {
      type: 'reconnection_status',
      data: status,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('reconnection:status', eventData);
    
    logger.info('Reconnection status emitted', { 
      userId, 
      status: status.type 
    });
  }

  /**
   * Emit connection health status
   */
  static emitConnectionHealth(io, userId, healthData) {
    const eventData = {
      type: 'connection_health',
      data: healthData,
      timestamp: new Date().toISOString()
    };

    io.to(`user_${userId}`).emit('connection:health', eventData);
    
    logger.debug('Connection health emitted', { 
      userId, 
      health: healthData.status 
    });
  }

  /**
   * Emit server maintenance notification
   */
  static emitServerMaintenance(io, maintenanceData) {
    const eventData = {
      type: 'server_maintenance',
      data: maintenanceData,
      timestamp: new Date().toISOString()
    };

    io.emit('server:maintenance', eventData);
    
    logger.info('Server maintenance notification emitted', { 
      type: maintenanceData.type,
      scheduledTime: maintenanceData.scheduledTime 
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

/**
 * User state management for reconnection
 */
const userStateStore = new Map();

/**
 * Store user state for reconnection
 */
function storeUserState(userId, state) {
  userStateStore.set(userId, {
    ...state,
    storedAt: Date.now(),
    ttl: Date.now() + (5 * 60 * 1000) // 5 minutes TTL
  });
  
  logger.debug('User state stored for reconnection', { 
    userId, 
    stateKeys: Object.keys(state) 
  });
}

/**
 * Restore user state after reconnection
 */
function restoreUserState(socket, userId) {
  const storedState = userStateStore.get(userId);
  
  if (!storedState || storedState.ttl < Date.now()) {
    // State expired or doesn't exist
    if (storedState) {
      userStateStore.delete(userId);
    }
    return;
  }

  const { chatRoom, chatType, challengeId, analyticsType, isModerator } = storedState;
  
  // Restore chat room
  if (chatRoom) {
    socket.join(`chat_${chatRoom}`);
    socket.chatRoom = chatRoom;
    socket.chatType = chatType;
    
    // Notify others in the room
    socket.to(`chat_${chatRoom}`).emit('chat:user_reconnected', {
      userId,
      username: socket.user?.username || 'Anonymous',
      timestamp: new Date().toISOString()
    });
  }

  // Restore challenge room
  if (challengeId) {
    socket.join(`challenge_${challengeId}`);
    socket.challengeId = challengeId;
    
    // Notify challenge participants
    socket.to(`challenge_${challengeId}`).emit('challenge:participant_reconnected', {
      userId,
      username: socket.user?.username || 'Anonymous',
      challengeId,
      timestamp: new Date().toISOString()
    });
  }

  // Restore analytics subscription
  if (analyticsType) {
    socket.join(`analytics_${analyticsType}`);
    socket.analyticsType = analyticsType;
    realtimeAnalyticsService.subscribe(analyticsType, socket.id);
  }

  // Restore moderation status
  if (isModerator) {
    socket.join('moderation_room');
    liveModerationService.addModerator(socket.id);
  }

  // Clean up stored state
  userStateStore.delete(userId);
  
  logger.info('User state restored after reconnection', { 
    userId, 
    socketId: socket.id,
    restoredFeatures: {
      chatRoom: !!chatRoom,
      challengeId: !!challengeId,
      analyticsType: !!analyticsType,
      isModerator
    }
  });
}

/**
 * Clean up expired user states
 */
function cleanupExpiredUserStates() {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [userId, state] of userStateStore) {
    if (state.ttl < now) {
      userStateStore.delete(userId);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.debug('Cleaned up expired user states', { cleanedCount });
  }
}

// Clean up expired states every 5 minutes
setInterval(cleanupExpiredUserStates, 5 * 60 * 1000);

export default { initializeWebSocket, WebSocketEmitter, WebSocketRooms };
