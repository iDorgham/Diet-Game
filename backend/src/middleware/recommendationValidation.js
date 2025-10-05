/**
 * Recommendation Validation Middleware
 * Validation for enhanced recommendation API endpoints
 */

const Joi = require('joi');

/**
 * Validation schema for recommendation feedback
 */
const recommendationFeedbackSchema = Joi.object({
  recommendationId: Joi.string().uuid().required(),
  recommendationType: Joi.string().valid('friend', 'team', 'content', 'mentorship').required(),
  feedback: Joi.object({
    type: Joi.string().valid('positive', 'negative', 'neutral').required(),
    rating: Joi.number().min(1).max(5).optional(),
    reason: Joi.string().max(500).optional(),
    context: Joi.object({
      timeOfDay: Joi.string().valid('morning', 'afternoon', 'evening', 'night').optional(),
      userMood: Joi.string().valid('excellent', 'good', 'neutral', 'poor', 'terrible').optional(),
      userEnergy: Joi.string().valid('high', 'good', 'moderate', 'low', 'very_low').optional(),
      socialContext: Joi.string().optional()
    }).optional()
  }).required()
});

/**
 * Validation schema for recommendation parameters
 */
const recommendationParamsSchema = Joi.object({
  limit: Joi.number().min(1).max(100).optional(),
  algorithm: Joi.string().valid('basic', 'enhanced', 'ml', 'hybrid').optional(),
  challengeType: Joi.string().optional(),
  contentType: Joi.string().optional(),
  role: Joi.string().valid('mentor', 'mentee').optional(),
  mood: Joi.string().valid('excellent', 'good', 'neutral', 'poor', 'terrible').optional(),
  energy: Joi.string().valid('high', 'good', 'moderate', 'low', 'very_low').optional(),
  context: Joi.string().optional()
});

/**
 * Validate recommendation feedback
 */
const validateRecommendationFeedback = (req, res, next) => {
  const { error, value } = recommendationFeedbackSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};

/**
 * Validate recommendation parameters
 */
const validateRecommendationParams = (req, res, next) => {
  const { error, value } = recommendationParamsSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.query = value;
  next();
};

/**
 * Validate user context for recommendations
 */
const validateUserContext = (req, res, next) => {
  const contextSchema = Joi.object({
    timeOfDay: Joi.string().valid('morning', 'afternoon', 'evening', 'night').optional(),
    userMood: Joi.string().valid('excellent', 'good', 'neutral', 'poor', 'terrible').optional(),
    userEnergy: Joi.string().valid('high', 'good', 'moderate', 'low', 'very_low').optional(),
    socialContext: Joi.string().optional(),
    goalProgress: Joi.string().valid('excellent', 'good', 'neutral', 'poor', 'terrible').optional(),
    activityLevel: Joi.number().min(1).max(5).optional()
  });
  
  const { error, value } = contextSchema.validate(req.body.context || req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Context validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  if (req.body.context) {
    req.body.context = value;
  } else {
    req.query = { ...req.query, ...value };
  }
  
  next();
};

/**
 * Validate algorithm comparison parameters
 */
const validateComparisonParams = (req, res, next) => {
  const comparisonSchema = Joi.object({
    type: Joi.string().valid('friends', 'teams', 'content', 'mentorship').optional(),
    limit: Joi.number().min(1).max(20).optional(),
    includeMetrics: Joi.boolean().optional()
  });
  
  const { error, value } = comparisonSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Comparison validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.query = value;
  next();
};

/**
 * Validate ML training parameters
 */
const validateTrainingParams = (req, res, next) => {
  const trainingSchema = Joi.object({
    forceRetrain: Joi.boolean().optional(),
    algorithm: Joi.string().valid('neural_network', 'random_forest', 'gradient_boosting', 'collaborative_filtering', 'all').optional(),
    epochs: Joi.number().min(1).max(1000).optional(),
    learningRate: Joi.number().min(0.0001).max(0.1).optional(),
    batchSize: Joi.number().min(1).max(1000).optional()
  });
  
  const { error, value } = trainingSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Training validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.body = value;
  next();
};

/**
 * Validate performance monitoring parameters
 */
const validatePerformanceParams = (req, res, next) => {
  const performanceSchema = Joi.object({
    timeRange: Joi.string().valid('1h', '1d', '7d', '30d', '90d').optional(),
    algorithm: Joi.string().valid('all', 'enhanced', 'ml', 'hybrid').optional(),
    includeDetails: Joi.boolean().optional()
  });
  
  const { error, value } = performanceSchema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Performance validation error',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  
  req.query = value;
  next();
};

/**
 * Sanitize recommendation input
 */
const sanitizeRecommendationInput = (req, res, next) => {
  // Sanitize string inputs
  if (req.query.algorithm) {
    req.query.algorithm = req.query.algorithm.toLowerCase();
  }
  
  if (req.query.challengeType) {
    req.query.challengeType = req.query.challengeType.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  if (req.query.contentType) {
    req.query.contentType = req.query.contentType.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  if (req.query.role) {
    req.query.role = req.query.role.toLowerCase();
  }
  
  if (req.query.mood) {
    req.query.mood = req.query.mood.toLowerCase();
  }
  
  if (req.query.energy) {
    req.query.energy = req.query.energy.toLowerCase();
  }
  
  // Ensure numeric limits are within bounds
  if (req.query.limit) {
    req.query.limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
  }
  
  next();
};

/**
 * Rate limiting for recommendation requests
 */
const recommendationRateLimit = (req, res, next) => {
  // This would integrate with your rate limiting system
  // For now, just pass through
  next();
};

/**
 * Cache validation for recommendations
 */
const validateRecommendationCache = (req, res, next) => {
  // Check if request can use cached results
  const cacheableParams = ['limit', 'algorithm', 'challengeType', 'contentType', 'role'];
  const hasCacheableParams = cacheableParams.some(param => req.query[param]);
  
  if (hasCacheableParams) {
    req.useCache = true;
    req.cacheKey = `recommendations:${req.user.id}:${JSON.stringify(req.query)}`;
    req.cacheTTL = 300; // 5 minutes
  }
  
  next();
};

module.exports = {
  validateRecommendationFeedback,
  validateRecommendationParams,
  validateUserContext,
  validateComparisonParams,
  validateTrainingParams,
  validatePerformanceParams,
  sanitizeRecommendationInput,
  recommendationRateLimit,
  validateRecommendationCache
};
