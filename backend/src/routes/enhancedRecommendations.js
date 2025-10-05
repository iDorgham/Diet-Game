/**
 * Enhanced Recommendations API Routes
 * Advanced AI-powered recommendation endpoints with ML scoring
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const enhancedRecommendationService = require('../services/enhancedRecommendationService');
const mlScoringService = require('../services/mlScoringService');
const logger = require('../config/logger');

/**
 * @route   GET /api/enhanced-recommendations/friends
 * @desc    Get enhanced friend recommendations with ML scoring
 * @access  Private
 */
router.get('/friends', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, algorithm = 'hybrid' } = req.query;
    
    logger.info(`Getting enhanced friend recommendations for user ${userId}`);
    
    // Get enhanced recommendations
    const recommendations = await enhancedRecommendationService.getEnhancedFriendSuggestions(
      userId, 
      parseInt(limit)
    );
    
    // Apply ML scoring if requested
    if (algorithm === 'ml' || algorithm === 'hybrid') {
      const mlScores = await mlScoringService.predictScores(
        userId, 
        recommendations, 
        {
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 18 ? 'afternoon' : 'evening',
          userMood: req.query.mood || 'neutral',
          userEnergy: req.query.energy || 'moderate',
          socialContext: req.query.context || 'general'
        }
      );
      
      // Merge ML scores with existing recommendations
      recommendations.forEach((rec, index) => {
        if (mlScores[index]) {
          rec.mlScore = mlScores[index].score;
          rec.mlConfidence = mlScores[index].confidence;
          rec.algorithm = 'ml_enhanced';
          
          // Update combined score with ML enhancement
          if (algorithm === 'hybrid') {
            rec.combinedScore = (rec.score * 0.6) + (rec.mlScore * 0.4);
          } else {
            rec.combinedScore = rec.mlScore;
          }
        }
      });
      
      // Re-sort by combined score
      recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        algorithm: algorithm,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
        modelVersion: mlScoringService.modelVersion
      }
    });
  } catch (error) {
    logger.error('Error getting enhanced friend recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced friend recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/teams
 * @desc    Get enhanced team recommendations with ML scoring
 * @access  Private
 */
router.get('/teams', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, challengeType, algorithm = 'hybrid' } = req.query;
    
    logger.info(`Getting enhanced team recommendations for user ${userId}`);
    
    // Get enhanced team recommendations
    const recommendations = await enhancedRecommendationService.getTeamRecommendations(
      userId, 
      challengeType
    );
    
    // Apply ML scoring
    if (algorithm === 'ml' || algorithm === 'hybrid') {
      const mlScores = await mlScoringService.predictScores(
        userId, 
        recommendations, 
        {
          challengeType: challengeType,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 18 ? 'afternoon' : 'evening',
          userMood: req.query.mood || 'neutral',
          userEnergy: req.query.energy || 'moderate'
        }
      );
      
      // Merge ML scores
      recommendations.forEach((rec, index) => {
        if (mlScores[index]) {
          rec.mlScore = mlScores[index].score;
          rec.mlConfidence = mlScores[index].confidence;
          rec.algorithm = 'ml_enhanced';
          
          if (algorithm === 'hybrid') {
            rec.combinedScore = (rec.totalScore * 0.6) + (rec.mlScore * 0.4);
          } else {
            rec.combinedScore = rec.mlScore;
          }
        }
      });
      
      recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, parseInt(limit)),
        algorithm: algorithm,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
        modelVersion: mlScoringService.modelVersion
      }
    });
  } catch (error) {
    logger.error('Error getting enhanced team recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced team recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/content
 * @desc    Get enhanced content recommendations with ML scoring
 * @access  Private
 */
router.get('/content', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, contentType, algorithm = 'hybrid' } = req.query;
    
    logger.info(`Getting enhanced content recommendations for user ${userId}`);
    
    // Get enhanced content recommendations
    const recommendations = await enhancedRecommendationService.getContentRecommendations(
      userId, 
      parseInt(limit)
    );
    
    // Apply ML scoring
    if (algorithm === 'ml' || algorithm === 'hybrid') {
      const mlScores = await mlScoringService.predictScores(
        userId, 
        recommendations, 
        {
          contentType: contentType,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 18 ? 'afternoon' : 'evening',
          userMood: req.query.mood || 'neutral',
          userEnergy: req.query.energy || 'moderate',
          socialContext: req.query.context || 'general'
        }
      );
      
      // Merge ML scores
      recommendations.forEach((rec, index) => {
        if (mlScores[index]) {
          rec.mlScore = mlScores[index].score;
          rec.mlConfidence = mlScores[index].confidence;
          rec.algorithm = 'ml_enhanced';
          
          if (algorithm === 'hybrid') {
            rec.combinedScore = (rec.relevanceScore * 0.6) + (rec.mlScore * 0.4);
          } else {
            rec.combinedScore = rec.mlScore;
          }
        }
      });
      
      recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations.slice(0, parseInt(limit)),
        algorithm: algorithm,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
        modelVersion: mlScoringService.modelVersion
      }
    });
  } catch (error) {
    logger.error('Error getting enhanced content recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced content recommendations',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/mentorship
 * @desc    Get enhanced mentorship recommendations with ML scoring
 * @access  Private
 */
router.get('/mentorship', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { role = 'mentee', algorithm = 'hybrid' } = req.query;
    
    logger.info(`Getting enhanced mentorship recommendations for user ${userId}`);
    
    // Get enhanced mentorship recommendations
    const recommendations = await enhancedRecommendationService.getMentorshipRecommendations(
      userId, 
      role
    );
    
    // Apply ML scoring
    if (algorithm === 'ml' || algorithm === 'hybrid') {
      const mlScores = await mlScoringService.predictScores(
        userId, 
        recommendations, 
        {
          role: role,
          timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                     new Date().getHours() < 18 ? 'afternoon' : 'evening',
          userMood: req.query.mood || 'neutral',
          userEnergy: req.query.energy || 'moderate'
        }
      );
      
      // Merge ML scores
      recommendations.forEach((rec, index) => {
        if (mlScores[index]) {
          rec.mlScore = mlScores[index].score;
          rec.mlConfidence = mlScores[index].confidence;
          rec.algorithm = 'ml_enhanced';
          
          if (algorithm === 'hybrid') {
            rec.combinedScore = (rec.compatibilityScore * 0.6) + (rec.mlScore * 0.4);
          } else {
            rec.combinedScore = rec.mlScore;
          }
        }
      });
      
      recommendations.sort((a, b) => b.combinedScore - a.combinedScore);
    }
    
    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        algorithm: algorithm,
        totalCount: recommendations.length,
        generatedAt: new Date().toISOString(),
        modelVersion: mlScoringService.modelVersion
      }
    });
  } catch (error) {
    logger.error('Error getting enhanced mentorship recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enhanced mentorship recommendations',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/enhanced-recommendations/feedback
 * @desc    Submit feedback for recommendation learning
 * @access  Private
 */
router.post('/feedback', auth, validation.validateRecommendationFeedback, async (req, res) => {
  try {
    const userId = req.user.id;
    const { recommendationId, recommendationType, feedback } = req.body;
    
    logger.info(`Processing recommendation feedback from user ${userId}`);
    
    // Submit feedback to both services for learning
    await Promise.all([
      enhancedRecommendationService.learnFromFeedback(userId, recommendationId, feedback),
      mlScoringService.updateModelWithFeedback(userId, recommendationId, feedback)
    ]);
    
    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        userId: userId,
        recommendationId: recommendationId,
        feedbackType: feedback.type,
        processedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error processing recommendation feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process feedback',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/performance
 * @desc    Get recommendation system performance metrics
 * @access  Private (Admin only)
 */
router.get('/performance', auth, async (req, res) => {
  try {
    // Check if user is admin (you would implement proper admin check)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const performanceMetrics = await Promise.all([
      enhancedRecommendationService.monitorPerformance(),
      mlScoringService.calculatePerformanceMetrics()
    ]);
    
    res.json({
      success: true,
      data: {
        enhancedRecommendations: performanceMetrics[0],
        mlScoring: performanceMetrics[1],
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/enhanced-recommendations/train
 * @desc    Trigger ML model training
 * @access  Private (Admin only)
 */
router.post('/train', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    logger.info('Triggering ML model training...');
    
    const trainingResult = await mlScoringService.trainModel();
    
    res.json({
      success: true,
      message: 'ML model training completed',
      data: trainingResult
    });
  } catch (error) {
    logger.error('Error training ML model:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to train ML model',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/insights
 * @desc    Get AI-powered insights and recommendations
 * @access  Private
 */
router.get('/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    logger.info(`Getting AI insights for user ${userId}`);
    
    const insights = await enhancedRecommendationService.generateSocialInsights(userId);
    
    res.json({
      success: true,
      data: {
        insights: insights,
        generatedAt: new Date().toISOString(),
        algorithmVersion: enhancedRecommendationService.algorithmVersion
      }
    });
  } catch (error) {
    logger.error('Error getting AI insights:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI insights',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/enhanced-recommendations/compare
 * @desc    Compare different recommendation algorithms
 * @access  Private
 */
router.get('/compare', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type = 'friends', limit = 5 } = req.query;
    
    logger.info(`Comparing recommendation algorithms for user ${userId}`);
    
    // Get recommendations from different algorithms
    const [basicRecs, enhancedRecs, mlRecs] = await Promise.all([
      // Basic recommendations (from original service)
      require('../services/socialRecommendationService').getEnhancedFriendSuggestions(userId, limit),
      
      // Enhanced recommendations
      enhancedRecommendationService.getEnhancedFriendSuggestions(userId, limit),
      
      // ML recommendations
      (async () => {
        const candidates = await enhancedRecommendationService.getEnhancedFriendSuggestions(userId, limit * 2);
        const mlScores = await mlScoringService.predictScores(userId, candidates);
        return candidates.map((rec, index) => ({
          ...rec,
          score: mlScores[index]?.score || 0,
          confidence: mlScores[index]?.confidence || 0,
          algorithm: 'ml'
        })).sort((a, b) => b.score - a.score).slice(0, limit);
      })()
    ]);
    
    res.json({
      success: true,
      data: {
        algorithms: {
          basic: {
            name: 'Basic Algorithm',
            recommendations: basicRecs,
            count: basicRecs.length
          },
          enhanced: {
            name: 'Enhanced Algorithm',
            recommendations: enhancedRecs,
            count: enhancedRecs.length
          },
          ml: {
            name: 'ML Algorithm',
            recommendations: mlRecs,
            count: mlRecs.length
          }
        },
        comparison: {
          averageScore: {
            basic: basicRecs.reduce((sum, rec) => sum + rec.score, 0) / basicRecs.length,
            enhanced: enhancedRecs.reduce((sum, rec) => sum + rec.combinedScore, 0) / enhancedRecs.length,
            ml: mlRecs.reduce((sum, rec) => sum + rec.score, 0) / mlRecs.length
          },
          averageConfidence: {
            basic: basicRecs.reduce((sum, rec) => sum + (rec.confidence || 0), 0) / basicRecs.length,
            enhanced: enhancedRecs.reduce((sum, rec) => sum + rec.confidence, 0) / enhancedRecs.length,
            ml: mlRecs.reduce((sum, rec) => sum + rec.confidence, 0) / mlRecs.length
          }
        },
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error comparing recommendation algorithms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare algorithms',
      error: error.message
    });
  }
});

module.exports = router;
