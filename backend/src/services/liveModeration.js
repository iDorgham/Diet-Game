// Live Moderation Service
// Phase 13-14: Real-time Features - Live Moderation System

import { logger } from '../utils/logger.js';

/**
 * Live Moderation Service
 * Handles real-time content moderation and reporting
 */
export class LiveModerationService {
  constructor() {
    this.reports = new Map(); // reportId -> report
    this.moderators = new Set(); // Set of moderator socket IDs
    this.autoModerationRules = new Map();
    this.blockedUsers = new Set();
    this.suspiciousActivities = new Map();
    this.initializeAutoModerationRules();
  }

  /**
   * Initialize automatic moderation rules
   */
  initializeAutoModerationRules() {
    // Spam detection
    this.autoModerationRules.set('spam', {
      type: 'spam',
      threshold: 5, // messages per minute
      action: 'warn',
      severity: 'medium'
    });

    // Inappropriate content
    this.autoModerationRules.set('inappropriate', {
      type: 'inappropriate',
      keywords: ['spam', 'scam', 'fake', 'hate', 'abuse'],
      action: 'block',
      severity: 'high'
    });

    // Rapid posting
    this.autoModerationRules.set('rapid_posting', {
      type: 'rapid_posting',
      threshold: 10, // posts per minute
      action: 'throttle',
      severity: 'low'
    });

    logger.info('Auto-moderation rules initialized', {
      ruleCount: this.autoModerationRules.size
    });
  }

  /**
   * Add moderator
   */
  addModerator(socketId) {
    this.moderators.add(socketId);
    logger.info('Moderator added', { socketId, totalModerators: this.moderators.size });
  }

  /**
   * Remove moderator
   */
  removeModerator(socketId) {
    this.moderators.delete(socketId);
    logger.info('Moderator removed', { socketId, totalModerators: this.moderators.size });
  }

  /**
   * Process content report
   */
  processReport(reportData) {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const report = {
      id: reportId,
      reporterId: reportData.reporterId,
      reportedUserId: reportData.reportedUserId,
      reportType: reportData.reportType,
      reason: reportData.reason,
      content: reportData.content,
      timestamp: new Date().toISOString(),
      status: 'pending',
      severity: this.calculateSeverity(reportData),
      autoModerationResult: this.runAutoModeration(reportData)
    };

    this.reports.set(reportId, report);

    // Auto-moderate if severity is high
    if (report.severity === 'high' || report.autoModerationResult.action === 'block') {
      this.handleAutoModeration(report);
    }

    // Notify moderators
    this.notifyModerators('new_report', report);

    logger.warn('Content report processed', {
      reportId,
      reportType: report.reportType,
      severity: report.severity,
      autoAction: report.autoModerationResult.action
    });

    return report;
  }

  /**
   * Calculate report severity
   */
  calculateSeverity(reportData) {
    const highSeverityTypes = ['harassment', 'spam', 'inappropriate', 'hate_speech'];
    const mediumSeverityTypes = ['spam', 'misleading', 'off_topic'];
    
    if (highSeverityTypes.includes(reportData.reportType)) {
      return 'high';
    } else if (mediumSeverityTypes.includes(reportData.reportType)) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Run automatic moderation checks
   */
  runAutoModeration(reportData) {
    const result = {
      triggered: false,
      rule: null,
      action: 'none',
      confidence: 0
    };

    // Check spam patterns
    if (this.detectSpam(reportData.content)) {
      result.triggered = true;
      result.rule = 'spam';
      result.action = 'warn';
      result.confidence = 0.8;
    }

    // Check inappropriate content
    if (this.detectInappropriateContent(reportData.content)) {
      result.triggered = true;
      result.rule = 'inappropriate';
      result.action = 'block';
      result.confidence = 0.9;
    }

    return result;
  }

  /**
   * Detect spam patterns
   */
  detectSpam(content) {
    if (!content || typeof content !== 'string') return false;

    const spamPatterns = [
      /(.)\1{4,}/, // Repeated characters
      /(https?:\/\/[^\s]+){3,}/, // Multiple URLs
      /(free|win|click|now|urgent)/gi, // Spam keywords
      /[A-Z]{5,}/, // Excessive caps
      /.{100,}/ // Very long messages
    ];

    return spamPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect inappropriate content
   */
  detectInappropriateContent(content) {
    if (!content || typeof content !== 'string') return false;

    const inappropriateKeywords = [
      'hate', 'abuse', 'harassment', 'threat', 'violence',
      'discrimination', 'racism', 'sexism', 'homophobia'
    ];

    const lowerContent = content.toLowerCase();
    return inappropriateKeywords.some(keyword => lowerContent.includes(keyword));
  }

  /**
   * Handle automatic moderation action
   */
  handleAutoModeration(report) {
    const { autoModerationResult } = report;

    switch (autoModerationResult.action) {
      case 'block':
        this.blockUser(report.reportedUserId, 'Auto-moderation: Inappropriate content');
        break;
      case 'warn':
        this.warnUser(report.reportedUserId, 'Auto-moderation: Spam detected');
        break;
      case 'throttle':
        this.throttleUser(report.reportedUserId, 300000); // 5 minutes
        break;
    }

    report.status = 'auto_handled';
    report.autoAction = autoModerationResult.action;

    logger.info('Auto-moderation action taken', {
      reportId: report.id,
      action: autoModerationResult.action,
      userId: report.reportedUserId
    });
  }

  /**
   * Block user
   */
  blockUser(userId, reason) {
    this.blockedUsers.add(userId);
    
    logger.warn('User blocked', { userId, reason });
    
    return {
      userId,
      action: 'blocked',
      reason,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Warn user
   */
  warnUser(userId, reason) {
    logger.warn('User warned', { userId, reason });
    
    return {
      userId,
      action: 'warned',
      reason,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Throttle user
   */
  throttleUser(userId, duration) {
    const throttleUntil = Date.now() + duration;
    
    if (!this.suspiciousActivities.has(userId)) {
      this.suspiciousActivities.set(userId, {});
    }
    
    this.suspiciousActivities.get(userId).throttledUntil = throttleUntil;
    
    logger.warn('User throttled', { userId, duration, throttleUntil });
    
    return {
      userId,
      action: 'throttled',
      duration,
      throttleUntil: new Date(throttleUntil).toISOString()
    };
  }

  /**
   * Check if user is blocked
   */
  isUserBlocked(userId) {
    return this.blockedUsers.has(userId);
  }

  /**
   * Check if user is throttled
   */
  isUserThrottled(userId) {
    const userActivity = this.suspiciousActivities.get(userId);
    if (!userActivity || !userActivity.throttledUntil) {
      return false;
    }
    
    if (userActivity.throttledUntil < Date.now()) {
      // Throttle expired, remove it
      delete userActivity.throttledUntil;
      return false;
    }
    
    return true;
  }

  /**
   * Resolve report (moderator action)
   */
  resolveReport(reportId, moderatorId, action, notes = '') {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = 'resolved';
    report.resolvedBy = moderatorId;
    report.resolvedAt = new Date().toISOString();
    report.moderatorAction = action;
    report.moderatorNotes = notes;

    // Take action based on moderator decision
    switch (action) {
      case 'block_user':
        this.blockUser(report.reportedUserId, `Moderator action: ${notes}`);
        break;
      case 'warn_user':
        this.warnUser(report.reportedUserId, `Moderator action: ${notes}`);
        break;
      case 'dismiss':
        // No action needed
        break;
    }

    // Notify moderators of resolution
    this.notifyModerators('report_resolved', report);

    logger.info('Report resolved', {
      reportId,
      moderatorId,
      action,
      userId: report.reportedUserId
    });

    return report;
  }

  /**
   * Notify moderators
   */
  notifyModerators(eventType, data) {
    // This would be called by the WebSocket service to notify moderators
    logger.debug('Notifying moderators', {
      eventType,
      moderatorCount: this.moderators.size,
      dataKeys: Object.keys(data)
    });
  }

  /**
   * Get moderation statistics
   */
  getModerationStats() {
    const reports = Array.from(this.reports.values());
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentReports = reports.filter(report => 
      new Date(report.timestamp) > last24h
    );

    const stats = {
      totalReports: reports.length,
      reports24h: recentReports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      resolvedReports: reports.filter(r => r.status === 'resolved').length,
      autoHandledReports: reports.filter(r => r.status === 'auto_handled').length,
      blockedUsers: this.blockedUsers.size,
      activeModerators: this.moderators.size,
      reportsByType: this.getReportsByType(reports),
      reportsBySeverity: this.getReportsBySeverity(reports)
    };

    return stats;
  }

  /**
   * Get reports grouped by type
   */
  getReportsByType(reports) {
    const types = {};
    reports.forEach(report => {
      types[report.reportType] = (types[report.reportType] || 0) + 1;
    });
    return types;
  }

  /**
   * Get reports grouped by severity
   */
  getReportsBySeverity(reports) {
    const severities = { high: 0, medium: 0, low: 0 };
    reports.forEach(report => {
      severities[report.severity] = (severities[report.severity] || 0) + 1;
    });
    return severities;
  }

  /**
   * Get pending reports
   */
  getPendingReports() {
    return Array.from(this.reports.values())
      .filter(report => report.status === 'pending')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  /**
   * Get user moderation history
   */
  getUserModerationHistory(userId) {
    const userReports = Array.from(this.reports.values())
      .filter(report => report.reportedUserId === userId);

    return {
      userId,
      totalReports: userReports.length,
      reports: userReports,
      isBlocked: this.isUserBlocked(userId),
      isThrottled: this.isUserThrottled(userId)
    };
  }

  /**
   * Unblock user
   */
  unblockUser(userId, reason) {
    this.blockedUsers.delete(userId);
    
    logger.info('User unblocked', { userId, reason });
    
    return {
      userId,
      action: 'unblocked',
      reason,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get moderation service status
   */
  getStatus() {
    return {
      isActive: true,
      totalReports: this.reports.size,
      activeModerators: this.moderators.size,
      blockedUsers: this.blockedUsers.size,
      autoModerationRules: this.autoModerationRules.size,
      suspiciousActivities: this.suspiciousActivities.size
    };
  }
}

// Singleton instance
export const liveModerationService = new LiveModerationService();

export default liveModerationService;
