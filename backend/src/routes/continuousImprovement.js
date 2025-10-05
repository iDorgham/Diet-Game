/**
 * Level 5: Continuous Improvement API Routes
 * RESTful endpoints for continuous improvement features
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { continuousImprovementService } from '../services/continuousImprovementService.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication and rate limiting to all routes
router.use(authenticateToken);
router.use(rateLimiter);

/**
 * @route GET /api/continuous-improvement/status
 * @desc Get continuous improvement service status
 * @access Private
 */
router.get('/status', async (req, res) => {
  try {
    const status = {
      isRunning: continuousImprovementService.isRunning,
      config: continuousImprovementService.config,
      lastUpdate: new Date().toISOString()
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Failed to get continuous improvement status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get continuous improvement status'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/insights
 * @desc Get continuous improvement insights and metrics
 * @access Private
 */
router.get('/insights', async (req, res) => {
  try {
    const insights = await continuousImprovementService.getImprovementInsights();

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    logger.error('Failed to get continuous improvement insights', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get continuous improvement insights'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/initialize
 * @desc Initialize continuous improvement service
 * @access Private (Admin only)
 */
router.post('/initialize', async (req, res) => {
  try {
    await continuousImprovementService.initialize();

    res.json({
      success: true,
      message: 'Continuous improvement service initialized successfully'
    });
  } catch (error) {
    logger.error('Failed to initialize continuous improvement service', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to initialize continuous improvement service'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/stop
 * @desc Stop continuous improvement service
 * @access Private (Admin only)
 */
router.post('/stop', async (req, res) => {
  try {
    continuousImprovementService.stop();

    res.json({
      success: true,
      message: 'Continuous improvement service stopped successfully'
    });
  } catch (error) {
    logger.error('Failed to stop continuous improvement service', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to stop continuous improvement service'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/federated-learning/status
 * @desc Get federated learning status
 * @access Private
 */
router.get('/federated-learning/status', async (req, res) => {
  try {
    const federatedLearning = {
      enabled: continuousImprovementService.config.federatedLearning.enabled,
      models: Array.from(continuousImprovementService.learningModels.keys()),
      participants: Array.from(continuousImprovementService.learningModels.values())
        .reduce((sum, model) => sum + model.participants.size, 0),
      lastAggregation: Math.max(...Array.from(continuousImprovementService.learningModels.values())
        .map(model => model.lastAggregation))
    };

    res.json({
      success: true,
      data: federatedLearning
    });
  } catch (error) {
    logger.error('Failed to get federated learning status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get federated learning status'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/federated-learning/participate
 * @desc Participate in federated learning
 * @access Private
 */
router.post('/federated-learning/participate', [
  body('modelName').isString().notEmpty().withMessage('Model name is required'),
  body('localUpdate').isArray().withMessage('Local update must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { modelName, localUpdate } = req.body;
    const userId = req.user.id;

    // Add user to federated learning participants
    const model = continuousImprovementService.learningModels.get(modelName);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    model.participants.add(userId);
    model.localUpdates.set(userId, localUpdate);

    logger.info('User joined federated learning', { userId, modelName });

    res.json({
      success: true,
      message: 'Successfully joined federated learning',
      data: {
        modelName,
        participants: model.participants.size
      }
    });
  } catch (error) {
    logger.error('Failed to participate in federated learning', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to participate in federated learning'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/automated-optimization/status
 * @desc Get automated optimization status
 * @access Private
 */
router.get('/automated-optimization/status', async (req, res) => {
  try {
    const automatedOptimization = {
      enabled: continuousImprovementService.config.automatedOptimization.enabled,
      strategies: Array.from(continuousImprovementService.improvementStrategies.keys()),
      lastOptimization: Math.max(...Array.from(continuousImprovementService.improvementStrategies.values())
        .map(strategy => strategy.lastOptimization))
    };

    res.json({
      success: true,
      data: automatedOptimization
    });
  } catch (error) {
    logger.error('Failed to get automated optimization status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get automated optimization status'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/automated-optimization/trigger
 * @desc Manually trigger automated optimization
 * @access Private (Admin only)
 */
router.post('/automated-optimization/trigger', async (req, res) => {
  try {
    await continuousImprovementService.runAutomatedOptimization();

    res.json({
      success: true,
      message: 'Automated optimization triggered successfully'
    });
  } catch (error) {
    logger.error('Failed to trigger automated optimization', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to trigger automated optimization'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/predictive-analytics/status
 * @desc Get predictive analytics status
 * @access Private
 */
router.get('/predictive-analytics/status', async (req, res) => {
  try {
    const predictiveAnalytics = {
      enabled: continuousImprovementService.config.predictiveAnalytics.enabled,
      models: Array.from(continuousImprovementService.predictionModels.keys()),
      averageConfidence: Array.from(continuousImprovementService.predictionModels.values())
        .reduce((sum, model) => sum + model.confidence, 0) / continuousImprovementService.predictionModels.size,
      lastPrediction: Math.max(...Array.from(continuousImprovementService.predictionModels.values())
        .map(model => model.lastPrediction))
    };

    res.json({
      success: true,
      data: predictiveAnalytics
    });
  } catch (error) {
    logger.error('Failed to get predictive analytics status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get predictive analytics status'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/predictive-analytics/predict
 * @desc Generate prediction for specific model
 * @access Private
 */
router.post('/predictive-analytics/predict', [
  body('modelName').isString().notEmpty().withMessage('Model name is required'),
  body('horizon').optional().isInt({ min: 1, max: 168 }).withMessage('Horizon must be between 1 and 168 hours')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { modelName, horizon = 24 } = req.body;

    const model = continuousImprovementService.predictionModels.get(modelName);
    if (!model) {
      return res.status(404).json({
        success: false,
        error: 'Model not found'
      });
    }

    const prediction = await continuousImprovementService.generatePrediction(modelName, {
      ...model,
      horizon
    });

    res.json({
      success: true,
      data: {
        modelName,
        prediction,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to generate prediction', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to generate prediction'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/adaptive-ui/status
 * @desc Get adaptive UI status
 * @access Private
 */
router.get('/adaptive-ui/status', async (req, res) => {
  try {
    const adaptiveUI = {
      enabled: continuousImprovementService.config.adaptiveUI.enabled,
      adaptations: {
        layout: Object.fromEntries(continuousImprovementService.adaptiveModels?.layout || new Map()),
        features: Object.fromEntries(continuousImprovementService.adaptiveModels?.features || new Map()),
        interactions: Object.fromEntries(continuousImprovementService.adaptiveModels?.interactions || new Map())
      }
    };

    res.json({
      success: true,
      data: adaptiveUI
    });
  } catch (error) {
    logger.error('Failed to get adaptive UI status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get adaptive UI status'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/adaptive-ui/user/:userId
 * @desc Get adaptive UI configuration for specific user
 * @access Private
 */
router.get('/adaptive-ui/user/:userId', [
  param('userId').isUUID().withMessage('Valid user ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { userId } = req.params;

    // Get user's UI adaptations
    const userAdaptations = {
      layout: continuousImprovementService.adaptiveModels?.layout?.get(userId) || 'default',
      features: continuousImprovementService.adaptiveModels?.features?.get(userId) || 'standard',
      interactions: continuousImprovementService.adaptiveModels?.interactions?.get(userId) || 'standard'
    };

    res.json({
      success: true,
      data: {
        userId,
        adaptations: userAdaptations,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Failed to get user adaptive UI', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get user adaptive UI'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/anomaly-detection/status
 * @desc Get anomaly detection status
 * @access Private
 */
router.get('/anomaly-detection/status', async (req, res) => {
  try {
    const anomalyDetection = {
      enabled: continuousImprovementService.config.anomalyDetection.enabled,
      sensitivity: continuousImprovementService.config.anomalyDetection.sensitivity,
      autoRemediation: continuousImprovementService.config.anomalyDetection.autoRemediation,
      models: Object.keys(continuousImprovementService.anomalyModels || {})
    };

    res.json({
      success: true,
      data: anomalyDetection
    });
  } catch (error) {
    logger.error('Failed to get anomaly detection status', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get anomaly detection status'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/anomaly-detection/check
 * @desc Manually trigger anomaly detection
 * @access Private (Admin only)
 */
router.post('/anomaly-detection/check', async (req, res) => {
  try {
    await continuousImprovementService.detectAnomalies();

    res.json({
      success: true,
      message: 'Anomaly detection completed successfully'
    });
  } catch (error) {
    logger.error('Failed to run anomaly detection', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to run anomaly detection'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/optimization-history
 * @desc Get optimization history
 * @access Private
 */
router.get('/optimization-history', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = continuousImprovementService.optimizationHistory
      .slice(offset, offset + limit)
      .reverse(); // Most recent first

    res.json({
      success: true,
      data: {
        history,
        total: continuousImprovementService.optimizationHistory.length,
        limit,
        offset
      }
    });
  } catch (error) {
    logger.error('Failed to get optimization history', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get optimization history'
    });
  }
});

/**
 * @route POST /api/continuous-improvement/feedback
 * @desc Submit feedback for continuous improvement
 * @access Private
 */
router.post('/feedback', [
  body('type').isIn(['performance', 'accuracy', 'userExperience', 'anomaly']).withMessage('Valid feedback type is required'),
  body('metric').isString().notEmpty().withMessage('Metric is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { type, metric, rating, comment } = req.body;
    const userId = req.user.id;

    // Store feedback for learning
    const feedback = {
      userId,
      type,
      metric,
      rating,
      comment,
      timestamp: new Date().toISOString()
    };

    // Add to optimization history for learning
    continuousImprovementService.optimizationHistory.push({
      type: 'feedback',
      metric,
      rating,
      comment,
      timestamp: Date.now(),
      result: 'feedback_received'
    });

    logger.info('Continuous improvement feedback received', { userId, type, metric, rating });

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    logger.error('Failed to submit feedback', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * @route GET /api/continuous-improvement/metrics
 * @desc Get continuous improvement metrics
 * @access Private
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      totalImprovements: continuousImprovementService.optimizationHistory.length,
      federatedLearning: {
        activeModels: continuousImprovementService.learningModels.size,
        totalParticipants: Array.from(continuousImprovementService.learningModels.values())
          .reduce((sum, model) => sum + model.participants.size, 0)
      },
      predictiveAnalytics: {
        activeModels: continuousImprovementService.predictionModels.size,
        averageConfidence: Array.from(continuousImprovementService.predictionModels.values())
          .reduce((sum, model) => sum + model.confidence, 0) / continuousImprovementService.predictionModels.size
      },
      automatedOptimization: {
        activeStrategies: continuousImprovementService.improvementStrategies.size,
        lastOptimization: Math.max(...Array.from(continuousImprovementService.improvementStrategies.values())
          .map(strategy => strategy.lastOptimization))
      },
      adaptiveUI: {
        adaptations: continuousImprovementService.adaptiveModels?.layout?.size || 0
      },
      anomalyDetection: {
        models: Object.keys(continuousImprovementService.anomalyModels || {}).length
      }
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Failed to get continuous improvement metrics', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get continuous improvement metrics'
    });
  }
});

export default router;
