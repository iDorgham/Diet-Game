// Gamification API Routes
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { GamificationService } from '../services/gamification.js';
import { validateAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication to all routes
router.use(validateAuth);

// Apply rate limiting
router.use(rateLimiter);

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

/**
 * GET /api/gamification/progress/:userId
 * Get user's gamification progress
 */
router.get('/progress/:userId', 
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    query('include').optional().isIn(['achievements', 'quests', 'streaks']).withMessage('Invalid include parameter')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { include } = req.query;
      
      logger.info('Fetching user progress', { userId, include });
      
      const progress = await GamificationService.getUserProgress(userId, include);
      
      res.json({
        success: true,
        data: progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching user progress', { error: error.message, userId: req.params.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user progress',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/gamification/complete-task
 * Complete a task and award XP/coins
 */
router.post('/complete-task',
  [
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('taskId').isString().notEmpty().withMessage('Task ID is required'),
    body('taskType').isString().notEmpty().withMessage('Task type is required'),
    body('difficulty').optional().isIn(['easy', 'medium', 'hard', 'expert']).withMessage('Invalid difficulty level'),
    body('completionData').optional().isObject().withMessage('Completion data must be an object'),
    body('timestamp').optional().isISO8601().withMessage('Invalid timestamp format')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, taskId, taskType, difficulty, completionData, timestamp } = req.body;
      
      logger.info('Completing task', { userId, taskId, taskType, difficulty });
      
      const result = await GamificationService.completeTask({
        userId,
        taskId,
        taskType,
        difficulty: difficulty || 'medium',
        completionData: completionData || {},
        timestamp: timestamp || new Date().toISOString()
      });
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error completing task', { error: error.message, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to complete task',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/gamification/level/:userId
 * Get user's current level and XP progress
 */
router.get('/level/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      
      const levelData = await GamificationService.getUserLevel(userId);
      
      res.json({
        success: true,
        data: levelData,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching user level', { error: error.message, userId: req.params.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user level',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/gamification/award-xp
 * Manually award XP to a user (admin function)
 */
router.post('/award-xp',
  [
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('amount').isInt({ min: 1, max: 10000 }).withMessage('XP amount must be between 1 and 10000'),
    body('source').isString().notEmpty().withMessage('Source is required'),
    body('description').optional().isString().withMessage('Description must be a string')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId, amount, source, description } = req.body;
      
      logger.info('Awarding XP', { userId, amount, source });
      
      const result = await GamificationService.awardXP(userId, amount, source, description);
      
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error awarding XP', { error: error.message, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to award XP',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/gamification/leaderboard
 * Get leaderboard data
 */
router.get('/leaderboard',
  [
    query('type').optional().isIn(['xp', 'level', 'streak', 'achievements']).withMessage('Invalid leaderboard type'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('period').optional().isIn(['daily', 'weekly', 'monthly', 'all']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { type = 'xp', limit = 10, period = 'all' } = req.query;
      
      const leaderboard = await GamificationService.getLeaderboard(type, parseInt(limit), period);
      
      res.json({
        success: true,
        data: leaderboard,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching leaderboard', { error: error.message, query: req.query });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leaderboard',
        error: error.message
      });
    }
  }
);

/**
 * GET /api/gamification/stats/:userId
 * Get user's gamification statistics
 */
router.get('/stats/:userId',
  [
    param('userId').isUUID().withMessage('Invalid user ID format'),
    query('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Invalid period')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const { period = 'week' } = req.query;
      
      const stats = await GamificationService.getUserStats(userId, period);
      
      res.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching user stats', { error: error.message, userId: req.params.userId });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics',
        error: error.message
      });
    }
  }
);

/**
 * POST /api/gamification/reset-progress
 * Reset user's gamification progress (admin function)
 */
router.post('/reset-progress',
  [
    body('userId').isUUID().withMessage('Invalid user ID format'),
    body('confirm').equals('RESET').withMessage('Confirmation required')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { userId } = req.body;
      
      logger.warn('Resetting user progress', { userId, adminId: req.user?.id });
      
      await GamificationService.resetUserProgress(userId);
      
      res.json({
        success: true,
        message: 'User progress reset successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error resetting user progress', { error: error.message, body: req.body });
      res.status(500).json({
        success: false,
        message: 'Failed to reset user progress',
        error: error.message
      });
    }
  }
);

export default router;
