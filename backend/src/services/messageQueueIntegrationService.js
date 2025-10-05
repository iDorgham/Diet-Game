/**
 * Message Queue Integration Service
 * Integrates advanced message queuing with existing Diet Game services
 */

import { advancedMessageQueueService } from './advancedMessageQueueService.js';
import { logger } from '../utils/logger.js';
import { performanceMonitoringService } from './performanceMonitoringService.js';

class MessageQueueIntegrationService {
  constructor() {
    this.eventHandlers = new Map();
    this.isInitialized = false;
    this.subscriptions = new Map();
    
    this.eventTypes = {
      // User Events
      USER_REGISTERED: 'user.registered',
      USER_LOGIN: 'user.login',
      USER_LOGOUT: 'user.logout',
      USER_PROFILE_UPDATED: 'user.profile.updated',
      
      // Gamification Events
      LEVEL_UP: 'gamification.level_up',
      ACHIEVEMENT_UNLOCKED: 'gamification.achievement.unlocked',
      QUEST_COMPLETED: 'gamification.quest.completed',
      STREAK_UPDATED: 'gamification.streak.updated',
      XP_EARNED: 'gamification.xp.earned',
      
      // Social Events
      FRIEND_REQUEST_SENT: 'social.friend.request.sent',
      FRIEND_REQUEST_ACCEPTED: 'social.friend.request.accepted',
      TEAM_JOINED: 'social.team.joined',
      TEAM_LEFT: 'social.team.left',
      CHALLENGE_CREATED: 'social.challenge.created',
      CHALLENGE_COMPLETED: 'social.challenge.completed',
      
      // Nutrition Events
      MEAL_LOGGED: 'nutrition.meal.logged',
      GOAL_UPDATED: 'nutrition.goal.updated',
      PROGRESS_TRACKED: 'nutrition.progress.tracked',
      
      // Recommendation Events
      RECOMMENDATION_GENERATED: 'recommendation.generated',
      RECOMMENDATION_ACCEPTED: 'recommendation.accepted',
      RECOMMENDATION_REJECTED: 'recommendation.rejected',
      
      // System Events
      SYSTEM_MAINTENANCE: 'system.maintenance',
      SYSTEM_ERROR: 'system.error',
      PERFORMANCE_ALERT: 'system.performance.alert'
    };
    
    this.initialize();
  }

  /**
   * Initialize the integration service
   */
  async initialize() {
    try {
      await this.setupEventHandlers();
      await this.setupQueueSubscriptions();
      await this.setupEventRouting();
      
      this.isInitialized = true;
      logger.info('Message queue integration service initialized');
      
    } catch (error) {
      logger.error('Failed to initialize message queue integration service', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup event handlers for different event types
   */
  async setupEventHandlers() {
    // User event handlers
    this.eventHandlers.set(this.eventTypes.USER_REGISTERED, this.handleUserRegistered.bind(this));
    this.eventHandlers.set(this.eventTypes.USER_LOGIN, this.handleUserLogin.bind(this));
    this.eventHandlers.set(this.eventTypes.USER_LOGOUT, this.handleUserLogout.bind(this));
    this.eventHandlers.set(this.eventTypes.USER_PROFILE_UPDATED, this.handleUserProfileUpdated.bind(this));
    
    // Gamification event handlers
    this.eventHandlers.set(this.eventTypes.LEVEL_UP, this.handleLevelUp.bind(this));
    this.eventHandlers.set(this.eventTypes.ACHIEVEMENT_UNLOCKED, this.handleAchievementUnlocked.bind(this));
    this.eventHandlers.set(this.eventTypes.QUEST_COMPLETED, this.handleQuestCompleted.bind(this));
    this.eventHandlers.set(this.eventTypes.STREAK_UPDATED, this.handleStreakUpdated.bind(this));
    this.eventHandlers.set(this.eventTypes.XP_EARNED, this.handleXPEarned.bind(this));
    
    // Social event handlers
    this.eventHandlers.set(this.eventTypes.FRIEND_REQUEST_SENT, this.handleFriendRequestSent.bind(this));
    this.eventHandlers.set(this.eventTypes.FRIEND_REQUEST_ACCEPTED, this.handleFriendRequestAccepted.bind(this));
    this.eventHandlers.set(this.eventTypes.TEAM_JOINED, this.handleTeamJoined.bind(this));
    this.eventHandlers.set(this.eventTypes.TEAM_LEFT, this.handleTeamLeft.bind(this));
    this.eventHandlers.set(this.eventTypes.CHALLENGE_CREATED, this.handleChallengeCreated.bind(this));
    this.eventHandlers.set(this.eventTypes.CHALLENGE_COMPLETED, this.handleChallengeCompleted.bind(this));
    
    // Nutrition event handlers
    this.eventHandlers.set(this.eventTypes.MEAL_LOGGED, this.handleMealLogged.bind(this));
    this.eventHandlers.set(this.eventTypes.GOAL_UPDATED, this.handleGoalUpdated.bind(this));
    this.eventHandlers.set(this.eventTypes.PROGRESS_TRACKED, this.handleProgressTracked.bind(this));
    
    // Recommendation event handlers
    this.eventHandlers.set(this.eventTypes.RECOMMENDATION_GENERATED, this.handleRecommendationGenerated.bind(this));
    this.eventHandlers.set(this.eventTypes.RECOMMENDATION_ACCEPTED, this.handleRecommendationAccepted.bind(this));
    this.eventHandlers.set(this.eventTypes.RECOMMENDATION_REJECTED, this.handleRecommendationRejected.bind(this));
    
    // System event handlers
    this.eventHandlers.set(this.eventTypes.SYSTEM_MAINTENANCE, this.handleSystemMaintenance.bind(this));
    this.eventHandlers.set(this.eventTypes.SYSTEM_ERROR, this.handleSystemError.bind(this));
    this.eventHandlers.set(this.eventTypes.PERFORMANCE_ALERT, this.handlePerformanceAlert.bind(this));
  }

  /**
   * Setup queue subscriptions
   */
  async setupQueueSubscriptions() {
    const queues = [
      'user_notifications',
      'achievement_updates',
      'social_events',
      'gamification_events',
      'recommendation_updates',
      'system_events'
    ];

    for (const queueName of queues) {
      const subscriptionId = await advancedMessageQueueService.subscribe(
        queueName,
        this.handleMessage.bind(this),
        {
          batchSize: 5,
          autoAck: true,
          retryOnFailure: true
        }
      );
      
      this.subscriptions.set(queueName, subscriptionId);
    }
  }

  /**
   * Setup event routing
   */
  async setupEventRouting() {
    // Route events to appropriate queues based on event type
    this.eventRouting = {
      [this.eventTypes.USER_REGISTERED]: 'user_notifications',
      [this.eventTypes.USER_LOGIN]: 'user_notifications',
      [this.eventTypes.USER_LOGOUT]: 'user_notifications',
      [this.eventTypes.USER_PROFILE_UPDATED]: 'user_notifications',
      
      [this.eventTypes.LEVEL_UP]: 'gamification_events',
      [this.eventTypes.ACHIEVEMENT_UNLOCKED]: 'achievement_updates',
      [this.eventTypes.QUEST_COMPLETED]: 'gamification_events',
      [this.eventTypes.STREAK_UPDATED]: 'gamification_events',
      [this.eventTypes.XP_EARNED]: 'gamification_events',
      
      [this.eventTypes.FRIEND_REQUEST_SENT]: 'social_events',
      [this.eventTypes.FRIEND_REQUEST_ACCEPTED]: 'social_events',
      [this.eventTypes.TEAM_JOINED]: 'social_events',
      [this.eventTypes.TEAM_LEFT]: 'social_events',
      [this.eventTypes.CHALLENGE_CREATED]: 'social_events',
      [this.eventTypes.CHALLENGE_COMPLETED]: 'social_events',
      
      [this.eventTypes.MEAL_LOGGED]: 'user_notifications',
      [this.eventTypes.GOAL_UPDATED]: 'user_notifications',
      [this.eventTypes.PROGRESS_TRACKED]: 'user_notifications',
      
      [this.eventTypes.RECOMMENDATION_GENERATED]: 'recommendation_updates',
      [this.eventTypes.RECOMMENDATION_ACCEPTED]: 'recommendation_updates',
      [this.eventTypes.RECOMMENDATION_REJECTED]: 'recommendation_updates',
      
      [this.eventTypes.SYSTEM_MAINTENANCE]: 'system_events',
      [this.eventTypes.SYSTEM_ERROR]: 'system_events',
      [this.eventTypes.PERFORMANCE_ALERT]: 'system_events'
    };
  }

  /**
   * Publish event
   */
  async publishEvent(eventType, payload, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Message queue integration service not initialized');
    }

    const queueName = this.eventRouting[eventType];
    if (!queueName) {
      logger.warn('No queue routing found for event type', { eventType });
      return null;
    }

    const eventData = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      source: options.source || 'system',
      correlationId: options.correlationId,
      userId: options.userId,
      sessionId: options.sessionId
    };

    try {
      const messageId = await advancedMessageQueueService.publish(queueName, eventData, {
        priority: options.priority || 0,
        ttl: options.ttl,
        correlationId: options.correlationId,
        publishedBy: options.publishedBy || 'integration_service'
      });

      // Record event publishing metrics
      performanceMonitoringService.recordMetric('event.published', 1, {
        eventType,
        queue: queueName,
        source: eventData.source
      });

      logger.info('Event published', { 
        eventType, 
        queueName, 
        messageId,
        userId: options.userId 
      });

      return messageId;

    } catch (error) {
      logger.error('Failed to publish event', { 
        eventType, 
        queueName, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Handle incoming message
   */
  async handleMessage(payload, message) {
    try {
      const eventType = payload.type;
      const handler = this.eventHandlers.get(eventType);
      
      if (!handler) {
        logger.warn('No handler found for event type', { eventType });
        return;
      }

      await handler(payload, message);

      // Record message processing metrics
      performanceMonitoringService.recordMetric('event.processed', 1, {
        eventType,
        queue: message.queueName
      });

    } catch (error) {
      logger.error('Error handling message', { 
        eventType: payload.type,
        messageId: message.messageId,
        error: error.message 
      });
      throw error;
    }
  }

  // User Event Handlers
  async handleUserRegistered(payload, message) {
    logger.info('User registered event processed', { 
      userId: payload.payload.userId,
      email: payload.payload.email 
    });
    
    // Send welcome notification
    await this.sendNotification(payload.payload.userId, {
      type: 'welcome',
      title: 'Welcome to Diet Game!',
      message: 'Your account has been created successfully.'
    });
  }

  async handleUserLogin(payload, message) {
    logger.info('User login event processed', { userId: payload.payload.userId });
    
    // Update user activity
    await this.updateUserActivity(payload.payload.userId, 'login');
  }

  async handleUserLogout(payload, message) {
    logger.info('User logout event processed', { userId: payload.payload.userId });
    
    // Update user activity
    await this.updateUserActivity(payload.payload.userId, 'logout');
  }

  async handleUserProfileUpdated(payload, message) {
    logger.info('User profile updated event processed', { userId: payload.payload.userId });
    
    // Invalidate user cache
    await this.invalidateUserCache(payload.payload.userId);
  }

  // Gamification Event Handlers
  async handleLevelUp(payload, message) {
    const { userId, newLevel, xp } = payload.payload;
    
    logger.info('Level up event processed', { userId, newLevel, xp });
    
    // Send level up notification
    await this.sendNotification(userId, {
      type: 'level_up',
      title: 'Level Up!',
      message: `Congratulations! You've reached level ${newLevel}!`
    });
    
    // Update leaderboard
    await this.updateLeaderboard(userId, newLevel);
  }

  async handleAchievementUnlocked(payload, message) {
    const { userId, achievementId, achievementName } = payload.payload;
    
    logger.info('Achievement unlocked event processed', { userId, achievementId });
    
    // Send achievement notification
    await this.sendNotification(userId, {
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `You've unlocked: ${achievementName}`
    });
    
    // Update achievement cache
    await this.updateAchievementCache(userId, achievementId);
  }

  async handleQuestCompleted(payload, message) {
    const { userId, questId, questName, rewards } = payload.payload;
    
    logger.info('Quest completed event processed', { userId, questId });
    
    // Send quest completion notification
    await this.sendNotification(userId, {
      type: 'quest_completed',
      title: 'Quest Completed!',
      message: `You've completed: ${questName}`
    });
    
    // Process rewards
    await this.processRewards(userId, rewards);
  }

  async handleStreakUpdated(payload, message) {
    const { userId, streakType, currentStreak, isBroken } = payload.payload;
    
    logger.info('Streak updated event processed', { userId, streakType, currentStreak });
    
    if (isBroken) {
      await this.sendNotification(userId, {
        type: 'streak_broken',
        title: 'Streak Broken',
        message: `Your ${streakType} streak has been broken. Start a new one!`
      });
    } else {
      await this.sendNotification(userId, {
        type: 'streak_updated',
        title: 'Streak Updated',
        message: `Your ${streakType} streak is now ${currentStreak} days!`
      });
    }
  }

  async handleXPEarned(payload, message) {
    const { userId, xpAmount, source, totalXP } = payload.payload;
    
    logger.info('XP earned event processed', { userId, xpAmount, source });
    
    // Update XP cache
    await this.updateXPCache(userId, totalXP);
  }

  // Social Event Handlers
  async handleFriendRequestSent(payload, message) {
    const { fromUserId, toUserId } = payload.payload;
    
    logger.info('Friend request sent event processed', { fromUserId, toUserId });
    
    // Send notification to recipient
    await this.sendNotification(toUserId, {
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'You have a new friend request!'
    });
  }

  async handleFriendRequestAccepted(payload, message) {
    const { fromUserId, toUserId } = payload.payload;
    
    logger.info('Friend request accepted event processed', { fromUserId, toUserId });
    
    // Send notification to both users
    await this.sendNotification(fromUserId, {
      type: 'friend_accepted',
      title: 'Friend Request Accepted',
      message: 'Your friend request has been accepted!'
    });
    
    await this.sendNotification(toUserId, {
      type: 'friend_accepted',
      title: 'New Friend Added',
      message: 'You have a new friend!'
    });
  }

  async handleTeamJoined(payload, message) {
    const { userId, teamId, teamName } = payload.payload;
    
    logger.info('Team joined event processed', { userId, teamId });
    
    // Send notification
    await this.sendNotification(userId, {
      type: 'team_joined',
      title: 'Welcome to the Team!',
      message: `You've joined ${teamName}`
    });
    
    // Update team cache
    await this.updateTeamCache(teamId, userId);
  }

  async handleTeamLeft(payload, message) {
    const { userId, teamId, teamName } = payload.payload;
    
    logger.info('Team left event processed', { userId, teamId });
    
    // Update team cache
    await this.updateTeamCache(teamId, userId, 'remove');
  }

  async handleChallengeCreated(payload, message) {
    const { challengeId, creatorId, challengeName, participants } = payload.payload;
    
    logger.info('Challenge created event processed', { challengeId, creatorId });
    
    // Send notifications to participants
    for (const participantId of participants) {
      await this.sendNotification(participantId, {
        type: 'challenge_created',
        title: 'New Challenge!',
        message: `You've been invited to: ${challengeName}`
      });
    }
  }

  async handleChallengeCompleted(payload, message) {
    const { challengeId, winnerId, challengeName, participants } = payload.payload;
    
    logger.info('Challenge completed event processed', { challengeId, winnerId });
    
    // Send notifications to all participants
    for (const participantId of participants) {
      const isWinner = participantId === winnerId;
      await this.sendNotification(participantId, {
        type: 'challenge_completed',
        title: isWinner ? 'Challenge Won!' : 'Challenge Completed',
        message: isWinner ? 
          `Congratulations! You won: ${challengeName}` : 
          `Challenge completed: ${challengeName}`
      });
    }
  }

  // Nutrition Event Handlers
  async handleMealLogged(payload, message) {
    const { userId, mealType, calories, nutrients } = payload.payload;
    
    logger.info('Meal logged event processed', { userId, mealType, calories });
    
    // Update nutrition cache
    await this.updateNutritionCache(userId, { mealType, calories, nutrients });
    
    // Check if daily goal is reached
    await this.checkDailyGoal(userId);
  }

  async handleGoalUpdated(payload, message) {
    const { userId, goalType, newGoal, oldGoal } = payload.payload;
    
    logger.info('Goal updated event processed', { userId, goalType });
    
    // Update goal cache
    await this.updateGoalCache(userId, goalType, newGoal);
    
    // Send notification
    await this.sendNotification(userId, {
      type: 'goal_updated',
      title: 'Goal Updated',
      message: `Your ${goalType} goal has been updated`
    });
  }

  async handleProgressTracked(payload, message) {
    const { userId, progressType, progress, goal } = payload.payload;
    
    logger.info('Progress tracked event processed', { userId, progressType });
    
    // Update progress cache
    await this.updateProgressCache(userId, progressType, progress);
    
    // Check if goal is achieved
    if (progress >= goal) {
      await this.publishEvent(this.eventTypes.GOAL_ACHIEVED, {
        userId,
        goalType: progressType,
        achievedAt: new Date().toISOString()
      });
    }
  }

  // Recommendation Event Handlers
  async handleRecommendationGenerated(payload, message) {
    const { userId, recommendationType, recommendations } = payload.payload;
    
    logger.info('Recommendation generated event processed', { userId, recommendationType });
    
    // Update recommendation cache
    await this.updateRecommendationCache(userId, recommendationType, recommendations);
    
    // Send notification
    await this.sendNotification(userId, {
      type: 'recommendation',
      title: 'New Recommendations',
      message: `You have ${recommendations.length} new recommendations`
    });
  }

  async handleRecommendationAccepted(payload, message) {
    const { userId, recommendationId, recommendationType } = payload.payload;
    
    logger.info('Recommendation accepted event processed', { userId, recommendationId });
    
    // Update recommendation analytics
    await this.updateRecommendationAnalytics(recommendationId, 'accepted');
  }

  async handleRecommendationRejected(payload, message) {
    const { userId, recommendationId, recommendationType } = payload.payload;
    
    logger.info('Recommendation rejected event processed', { userId, recommendationId });
    
    // Update recommendation analytics
    await this.updateRecommendationAnalytics(recommendationId, 'rejected');
  }

  // System Event Handlers
  async handleSystemMaintenance(payload, message) {
    const { maintenanceType, scheduledAt, duration } = payload.payload;
    
    logger.info('System maintenance event processed', { maintenanceType, scheduledAt });
    
    // Send maintenance notification to all users
    await this.broadcastNotification({
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: `System maintenance scheduled for ${scheduledAt}`
    });
  }

  async handleSystemError(payload, message) {
    const { errorType, errorMessage, severity, affectedUsers } = payload.payload;
    
    logger.error('System error event processed', { errorType, errorMessage, severity });
    
    // Send error notification to affected users
    for (const userId of affectedUsers) {
      await this.sendNotification(userId, {
        type: 'system_error',
        title: 'System Issue',
        message: 'We are experiencing technical difficulties. Please try again later.'
      });
    }
  }

  async handlePerformanceAlert(payload, message) {
    const { alertType, metric, value, threshold } = payload.payload;
    
    logger.warn('Performance alert event processed', { alertType, metric, value, threshold });
    
    // Handle performance alerts (could trigger auto-scaling, etc.)
    await this.handlePerformanceIssue(alertType, metric, value, threshold);
  }

  // Helper Methods
  async sendNotification(userId, notification) {
    // In a real implementation, this would integrate with notification service
    logger.info('Notification sent', { userId, notification });
  }

  async updateUserActivity(userId, activity) {
    // In a real implementation, this would update user activity tracking
    logger.info('User activity updated', { userId, activity });
  }

  async invalidateUserCache(userId) {
    // In a real implementation, this would invalidate user cache
    logger.info('User cache invalidated', { userId });
  }

  async updateLeaderboard(userId, level) {
    // In a real implementation, this would update leaderboard
    logger.info('Leaderboard updated', { userId, level });
  }

  async updateAchievementCache(userId, achievementId) {
    // In a real implementation, this would update achievement cache
    logger.info('Achievement cache updated', { userId, achievementId });
  }

  async processRewards(userId, rewards) {
    // In a real implementation, this would process quest rewards
    logger.info('Rewards processed', { userId, rewards });
  }

  async updateXPCache(userId, totalXP) {
    // In a real implementation, this would update XP cache
    logger.info('XP cache updated', { userId, totalXP });
  }

  async updateTeamCache(teamId, userId, action = 'add') {
    // In a real implementation, this would update team cache
    logger.info('Team cache updated', { teamId, userId, action });
  }

  async updateNutritionCache(userId, nutritionData) {
    // In a real implementation, this would update nutrition cache
    logger.info('Nutrition cache updated', { userId, nutritionData });
  }

  async checkDailyGoal(userId) {
    // In a real implementation, this would check if daily goal is reached
    logger.info('Daily goal checked', { userId });
  }

  async updateGoalCache(userId, goalType, goal) {
    // In a real implementation, this would update goal cache
    logger.info('Goal cache updated', { userId, goalType, goal });
  }

  async updateProgressCache(userId, progressType, progress) {
    // In a real implementation, this would update progress cache
    logger.info('Progress cache updated', { userId, progressType, progress });
  }

  async updateRecommendationCache(userId, recommendationType, recommendations) {
    // In a real implementation, this would update recommendation cache
    logger.info('Recommendation cache updated', { userId, recommendationType });
  }

  async updateRecommendationAnalytics(recommendationId, action) {
    // In a real implementation, this would update recommendation analytics
    logger.info('Recommendation analytics updated', { recommendationId, action });
  }

  async broadcastNotification(notification) {
    // In a real implementation, this would broadcast to all users
    logger.info('Broadcast notification sent', { notification });
  }

  async handlePerformanceIssue(alertType, metric, value, threshold) {
    // In a real implementation, this would handle performance issues
    logger.info('Performance issue handled', { alertType, metric, value, threshold });
  }

  /**
   * Get integration service status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      eventTypes: Object.keys(this.eventTypes).length,
      eventHandlers: this.eventHandlers.size,
      subscriptions: this.subscriptions.size,
      eventRouting: Object.keys(this.eventRouting).length
    };
  }

  /**
   * Get event types
   */
  getEventTypes() {
    return this.eventTypes;
  }

  /**
   * Close service
   */
  async close() {
    // Unsubscribe from all queues
    for (const [queueName, subscriptionId] of this.subscriptions) {
      await advancedMessageQueueService.unsubscribe(subscriptionId);
    }
    
    this.subscriptions.clear();
    this.isInitialized = false;
    
    logger.info('Message queue integration service closed');
  }
}

// Export singleton instance
export const messageQueueIntegrationService = new MessageQueueIntegrationService();
export default messageQueueIntegrationService;
