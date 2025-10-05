/**
 * Social Features API Routes
 * Sprint 9-10: Social Features APIs - Day 1 Task 1.3
 * 
 * Handles all social features API endpoints including:
 * - Friend management
 * - Social feed
 * - Team challenges
 * - Mentorship system
 */

import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { SocialService } from '../services/socialService.js';
import { validateAuth } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(validateAuth);

// Apply rate limiting
router.use(rateLimiter);

// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid input data',
                details: errors.array()
            }
        });
    }
    next();
};

// ==================== FRIEND SYSTEM ROUTES ====================

/**
 * @route   POST /api/social/friends/request
 * @desc    Send a friend request
 * @access  Private
 */
router.post('/friends/request', [
    body('receiverId').isUUID().withMessage('Valid receiver ID is required'),
    body('message').optional().isString().isLength({ max: 500 }).withMessage('Message must be less than 500 characters')
], validateRequest, async (req, res) => {
    try {
        const { receiverId, message } = req.body;
        const senderId = req.user.id;

        if (senderId === receiverId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Cannot send friend request to yourself'
                }
            });
        }

        const friendRequest = await socialService.sendFriendRequest(senderId, receiverId, message);

        res.status(201).json({
            success: true,
            data: friendRequest,
            message: 'Friend request sent successfully'
        });
    } catch (error) {
        logger.error('Error in send friend request:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'FRIEND_REQUEST_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   POST /api/social/friends/accept/:requestId
 * @desc    Accept a friend request
 * @access  Private
 */
router.post('/friends/accept/:requestId', [
    param('requestId').isUUID().withMessage('Valid request ID is required')
], validateRequest, async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const result = await socialService.acceptFriendRequest(requestId, userId);

        res.json({
            success: true,
            data: result,
            message: 'Friend request accepted successfully'
        });
    } catch (error) {
        logger.error('Error in accept friend request:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'FRIEND_REQUEST_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   POST /api/social/friends/reject/:requestId
 * @desc    Reject a friend request
 * @access  Private
 */
router.post('/friends/reject/:requestId', [
    param('requestId').isUUID().withMessage('Valid request ID is required')
], validateRequest, async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const result = await socialService.rejectFriendRequest(requestId, userId);

        res.json({
            success: true,
            data: result,
            message: 'Friend request rejected successfully'
        });
    } catch (error) {
        logger.error('Error in reject friend request:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'FRIEND_REQUEST_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   GET /api/social/friends
 * @desc    Get user's friends list
 * @access  Private
 */
router.get('/friends', async (req, res) => {
    try {
        const userId = req.user.id;
        const friends = await socialService.getFriendsList(userId);

        res.json({
            success: true,
            data: friends,
            message: 'Friends list retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get friends list:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve friends list'
            }
        });
    }
});

/**
 * @route   GET /api/social/friends/suggestions
 * @desc    Get friend suggestions
 * @access  Private
 */
router.get('/friends/suggestions', [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const suggestions = await socialService.getFriendSuggestions(userId, limit);

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
 * @route   DELETE /api/social/friends/:friendId
 * @desc    Remove a friend
 * @access  Private
 */
router.delete('/friends/:friendId', [
    param('friendId').isUUID().withMessage('Valid friend ID is required')
], validateRequest, async (req, res) => {
    try {
        const { friendId } = req.params;
        const userId = req.user.id;

        const result = await socialService.removeFriend(userId, friendId);

        res.json({
            success: true,
            data: result,
            message: 'Friend removed successfully'
        });
    } catch (error) {
        logger.error('Error in remove friend:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'FRIEND_REMOVAL_ERROR',
                message: error.message
            }
        });
    }
});

// ==================== SOCIAL FEED ROUTES ====================

/**
 * @route   POST /api/social/posts
 * @desc    Create a new post
 * @access  Private
 */
router.post('/posts', [
    body('content').isString().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
    body('postType').optional().isIn(['general', 'achievement', 'progress', 'meal', 'workout', 'challenge']).withMessage('Invalid post type'),
    body('privacy').optional().isIn(['public', 'friends', 'private']).withMessage('Invalid privacy setting'),
    body('mediaUrls').optional().isArray().withMessage('Media URLs must be an array'),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
    body('location').optional().isObject().withMessage('Location must be an object')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const postData = req.body;

        const post = await socialService.createPost(userId, postData);

        res.status(201).json({
            success: true,
            data: post,
            message: 'Post created successfully'
        });
    } catch (error) {
        logger.error('Error in create post:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'POST_CREATION_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   GET /api/social/posts/feed
 * @desc    Get personalized feed
 * @access  Private
 */
router.get('/posts/feed', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const feed = await socialService.getPersonalizedFeed(userId, limit, offset);

        res.json({
            success: true,
            data: feed,
            message: 'Feed retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get feed:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve feed'
            }
        });
    }
});

/**
 * @route   POST /api/social/posts/:postId/like
 * @desc    Like/unlike a post
 * @access  Private
 */
router.post('/posts/:postId/like', [
    param('postId').isUUID().withMessage('Valid post ID is required')
], validateRequest, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id;

        const result = await socialService.togglePostLike(userId, postId);

        res.json({
            success: true,
            data: result,
            message: result.liked ? 'Post liked successfully' : 'Post unliked successfully'
        });
    } catch (error) {
        logger.error('Error in toggle post like:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'POST_LIKE_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   POST /api/social/posts/:postId/comments
 * @desc    Add comment to post
 * @access  Private
 */
router.post('/posts/:postId/comments', [
    param('postId').isUUID().withMessage('Valid post ID is required'),
    body('content').isString().isLength({ min: 1, max: 1000 }).withMessage('Content must be between 1 and 1000 characters'),
    body('parentCommentId').optional().isUUID().withMessage('Valid parent comment ID is required')
], validateRequest, async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;
        const userId = req.user.id;

        const comment = await socialService.addComment(userId, postId, content, parentCommentId);

        res.status(201).json({
            success: true,
            data: comment,
            message: 'Comment added successfully'
        });
    } catch (error) {
        logger.error('Error in add comment:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'COMMENT_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   GET /api/social/posts/:postId/comments
 * @desc    Get comments for a post
 * @access  Private
 */
router.get('/posts/:postId/comments', [
    param('postId').isUUID().withMessage('Valid post ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], validateRequest, async (req, res) => {
    try {
        const { postId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        const comments = await socialService.getPostComments(postId, limit, offset);

        res.json({
            success: true,
            data: comments,
            message: 'Comments retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get post comments:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve comments'
            }
        });
    }
});

// ==================== TEAM CHALLENGES ROUTES ====================

/**
 * @route   POST /api/social/teams
 * @desc    Create a team
 * @access  Private
 */
router.post('/teams', [
    body('name').isString().isLength({ min: 1, max: 100 }).withMessage('Team name must be between 1 and 100 characters'),
    body('description').optional().isString().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    body('privacy').optional().isIn(['public', 'private', 'invite_only']).withMessage('Invalid privacy setting'),
    body('maxMembers').optional().isInt({ min: 2, max: 50 }).withMessage('Max members must be between 2 and 50'),
    body('avatarUrl').optional().isURL().withMessage('Avatar URL must be valid')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const teamData = req.body;

        const team = await socialService.createTeam(userId, teamData);

        res.status(201).json({
            success: true,
            data: team,
            message: 'Team created successfully'
        });
    } catch (error) {
        logger.error('Error in create team:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'TEAM_CREATION_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   POST /api/social/teams/:teamId/join
 * @desc    Join a team
 * @access  Private
 */
router.post('/teams/:teamId/join', [
    param('teamId').isUUID().withMessage('Valid team ID is required')
], validateRequest, async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user.id;

        const result = await socialService.joinTeam(userId, teamId);

        res.json({
            success: true,
            data: result,
            message: 'Joined team successfully'
        });
    } catch (error) {
        logger.error('Error in join team:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'TEAM_JOIN_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   GET /api/social/teams
 * @desc    Get user's teams
 * @access  Private
 */
router.get('/teams', async (req, res) => {
    try {
        const userId = req.user.id;
        const teams = await socialService.getUserTeams(userId);

        res.json({
            success: true,
            data: teams,
            message: 'Teams retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get user teams:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve teams'
            }
        });
    }
});

// ==================== MENTORSHIP SYSTEM ROUTES ====================

/**
 * @route   POST /api/social/mentorship/profile
 * @desc    Create mentorship profile
 * @access  Private
 */
router.post('/mentorship/profile', [
    body('profileType').isIn(['mentor', 'mentee', 'both']).withMessage('Valid profile type is required'),
    body('bio').optional().isString().isLength({ max: 1000 }).withMessage('Bio must be less than 1000 characters'),
    body('specialties').optional().isArray().withMessage('Specialties must be an array'),
    body('experienceLevel').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Invalid experience level'),
    body('availability').optional().isObject().withMessage('Availability must be an object'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;

        const profile = await socialService.createMentorshipProfile(userId, profileData);

        res.status(201).json({
            success: true,
            data: profile,
            message: 'Mentorship profile created successfully'
        });
    } catch (error) {
        logger.error('Error in create mentorship profile:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'MENTORSHIP_PROFILE_ERROR',
                message: error.message
            }
        });
    }
});

/**
 * @route   POST /api/social/mentorship/request
 * @desc    Send mentorship request
 * @access  Private
 */
router.post('/mentorship/request', [
    body('mentorId').isUUID().withMessage('Valid mentor ID is required'),
    body('message').isString().isLength({ min: 1, max: 500 }).withMessage('Message must be between 1 and 500 characters'),
    body('goals').optional().isArray().withMessage('Goals must be an array'),
    body('durationWeeks').optional().isInt({ min: 1, max: 52 }).withMessage('Duration must be between 1 and 52 weeks')
], validateRequest, async (req, res) => {
    try {
        const { mentorId, message, goals, durationWeeks } = req.body;
        const menteeId = req.user.id;

        if (menteeId === mentorId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'Cannot send mentorship request to yourself'
                }
            });
        }

        const request = await socialService.sendMentorshipRequest(mentorId, menteeId, message, goals, durationWeeks);

        res.status(201).json({
            success: true,
            data: request,
            message: 'Mentorship request sent successfully'
        });
    } catch (error) {
        logger.error('Error in send mentorship request:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'MENTORSHIP_REQUEST_ERROR',
                message: error.message
            }
        });
    }
});

// ==================== NOTIFICATIONS ROUTES ====================

/**
 * @route   GET /api/social/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/notifications', [
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative')
], validateRequest, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const notifications = await socialService.getUserNotifications(userId, limit, offset);

        res.json({
            success: true,
            data: notifications,
            message: 'Notifications retrieved successfully'
        });
    } catch (error) {
        logger.error('Error in get notifications:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to retrieve notifications'
            }
        });
    }
});

/**
 * @route   PUT /api/social/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/notifications/:notificationId/read', [
    param('notificationId').isUUID().withMessage('Valid notification ID is required')
], validateRequest, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await socialService.markNotificationAsRead(notificationId, userId);

        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read'
        });
    } catch (error) {
        logger.error('Error in mark notification as read:', error);
        res.status(400).json({
            success: false,
            error: {
                code: 'NOTIFICATION_ERROR',
                message: error.message
            }
        });
    }
});

export default router;
