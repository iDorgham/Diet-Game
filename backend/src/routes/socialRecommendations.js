/**
 * Social Recommendations API Routes
 * AI-powered recommendations for social features
 */

const express = require('express');
const { body, query, param } = require('express-validator');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const socialRecommendationService = require('../services/socialRecommendationService');
const logger = require('../config/logger');

/**
 * @route   GET /api/social/recommendations/friends
 * @desc    Get AI-powered friend suggestions
 * @access  Private
 */
router.get('/friends', [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        
        const suggestions = await socialRecommendationService.getEnhancedFriendSuggestions(userId, limit);

        res.json({
            success: true,
            data: suggestions,
            message: 'Friend suggestions retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get friend suggestions:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve friend suggestions'
            }
        });
    }
});

/**
 * @route   GET /api/social/recommendations/teams
 * @desc    Get team formation recommendations
 * @access  Private
 */
router.get('/teams', [
    query('challengeType').optional().isString().withMessage('Challenge type must be a string'),
    query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const challengeType = req.query.challengeType;
        const limit = parseInt(req.query.limit) || 10;
        
        const recommendations = await socialRecommendationService.getTeamRecommendations(userId, challengeType);

        res.json({
            success: true,
            data: recommendations.slice(0, limit),
            message: 'Team recommendations retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get team recommendations:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve team recommendations'
            }
        });
    }
});

/**
 * @route   GET /api/social/recommendations/content
 * @desc    Get content recommendations for social feed
 * @access  Private
 */
router.get('/content', [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        
        const recommendations = await socialRecommendationService.getContentRecommendations(userId, limit);

        res.json({
            success: true,
            data: recommendations,
            message: 'Content recommendations retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get content recommendations:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve content recommendations'
            }
        });
    }
});

/**
 * @route   GET /api/social/recommendations/mentorship
 * @desc    Get mentorship matching recommendations
 * @access  Private
 */
router.get('/mentorship', [
    query('role').optional().isIn(['mentor', 'mentee']).withMessage('Role must be either mentor or mentee')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.query.role || 'mentee';
        
        const recommendations = await socialRecommendationService.getMentorshipRecommendations(userId, role);

        res.json({
            success: true,
            data: recommendations,
            message: 'Mentorship recommendations retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get mentorship recommendations:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve mentorship recommendations'
            }
        });
    }
});

/**
 * @route   GET /api/social/insights
 * @desc    Get social insights and analytics
 * @access  Private
 */
router.get('/insights', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const insights = await socialRecommendationService.generateSocialInsights(userId);

        res.json({
            success: true,
            data: insights,
            message: 'Social insights retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get social insights:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve social insights'
            }
        });
    }
});

/**
 * @route   POST /api/social/recommendations/feedback
 * @desc    Provide feedback on recommendations
 * @access  Private
 */
router.post('/feedback', [
    body('recommendationId').isUUID().withMessage('Recommendation ID must be a valid UUID'),
    body('type').isIn(['friend', 'team', 'content', 'mentorship']).withMessage('Type must be one of: friend, team, content, mentorship'),
    body('action').isIn(['accepted', 'rejected', 'ignored']).withMessage('Action must be one of: accepted, rejected, ignored'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('feedback').optional().isString().withMessage('Feedback must be a string')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { recommendationId, type, action, rating, feedback } = req.body;
        
        // Store feedback for improving recommendations
        const feedbackData = {
            userId,
            recommendationId,
            type,
            action,
            rating,
            feedback,
            timestamp: new Date()
        };
        
        // This would typically be stored in a database table for ML model training
        logger.info('Recommendation feedback received:', feedbackData);

        res.json({
            success: true,
            message: 'Feedback recorded successfully'
        });
    } catch (error) {
        logger.error('Error in record recommendation feedback:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to record feedback'
            }
        });
    }
});

/**
 * @route   GET /api/social/recommendations/performance
 * @desc    Get recommendation performance analytics
 * @access  Private
 */
router.get('/performance', [
    query('period').optional().isIn(['7d', '30d', '90d']).withMessage('Period must be one of: 7d, 30d, 90d')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const period = req.query.period || '30d';
        
        // This would typically query a recommendations_feedback table
        const performanceData = {
            totalRecommendations: 0,
            acceptedRecommendations: 0,
            rejectedRecommendations: 0,
            ignoredRecommendations: 0,
            averageRating: 0,
            acceptanceRate: 0,
            period: period
        };

        res.json({
            success: true,
            data: performanceData,
            message: 'Recommendation performance retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get recommendation performance:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve recommendation performance'
            }
        });
    }
});

/**
 * @route   POST /api/social/recommendations/refresh
 * @desc    Refresh recommendations for user
 * @access  Private
 */
router.post('/refresh', [
    body('types').optional().isArray().withMessage('Types must be an array'),
    body('types.*').optional().isIn(['friend', 'team', 'content', 'mentorship']).withMessage('Each type must be one of: friend, team, content, mentorship')
], validateRequest, auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const types = req.body.types || ['friend', 'team', 'content', 'mentorship'];
        
        // Clear cached recommendations and regenerate
        const results = {};
        
        for (const type of types) {
            switch (type) {
                case 'friend':
                    results.friends = await socialRecommendationService.getEnhancedFriendSuggestions(userId, 10);
                    break;
                case 'team':
                    results.teams = await socialRecommendationService.getTeamRecommendations(userId);
                    break;
                case 'content':
                    results.content = await socialRecommendationService.getContentRecommendations(userId, 20);
                    break;
                case 'mentorship':
                    results.mentorship = await socialRecommendationService.getMentorshipRecommendations(userId);
                    break;
            }
        }

        res.json({
            success: true,
            data: results,
            message: 'Recommendations refreshed successfully'
        });
    } catch (error) {
        logger.error('Error in refresh recommendations:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to refresh recommendations'
            }
        });
    }
});

module.exports = router;
