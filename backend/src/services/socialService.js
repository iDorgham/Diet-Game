/**
 * Social Features Service
 * Sprint 9-10: Social Features APIs - Day 1 Task 1.2
 * 
 * Handles all social features business logic including:
 * - Friend management
 * - Social feed
 * - Team challenges
 * - Mentorship system
 */

import { db } from '../database/connection.js';
import { GamificationService } from './gamification.js';
import { logger } from '../utils/logger.js';

class SocialService {
    constructor() {
        this.xpRewards = {
            SEND_FRIEND_REQUEST: 10,
            ACCEPT_FRIEND_REQUEST: 15,
            CREATE_POST: 20,
            LIKE_POST: 5,
            COMMENT_POST: 10,
            JOIN_TEAM: 25,
            COMPLETE_TEAM_CHALLENGE: 100,
            MENTOR_SESSION: 50,
            MENTEE_SESSION: 30
        };
    }

    // ==================== FRIEND SYSTEM ====================

    /**
     * Send a friend request
     */
    async sendFriendRequest(senderId, receiverId, message = null) {
        try {
            // Check if users are already friends
            const existingFriendship = await this.checkFriendship(senderId, receiverId);
            if (existingFriendship) {
                throw new Error('Users are already friends');
            }

            // Check if there's already a pending request
            const existingRequest = await db.query(
                'SELECT * FROM friend_requests WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) AND status = $3',
                [senderId, receiverId, 'pending']
            );

            if (existingRequest.rows.length > 0) {
                throw new Error('Friend request already exists');
            }

            // Create friend request
            const result = await db.query(
                'INSERT INTO friend_requests (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *',
                [senderId, receiverId, message]
            );

            // Award XP for sending friend request
            await GamificationService.awardXP(senderId, this.xpRewards.SEND_FRIEND_REQUEST, 'SEND_FRIEND_REQUEST');

            // Create notification for receiver
            await this.createNotification(receiverId, 'friend_request', 'New Friend Request', 
                'You have received a new friend request', { requestId: result.rows[0].id });

            logger.info(`Friend request sent from ${senderId} to ${receiverId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error sending friend request:', error);
            throw error;
        }
    }

    /**
     * Accept a friend request
     */
    async acceptFriendRequest(requestId, userId) {
        try {
            // Get the friend request
            const requestResult = await db.query(
                'SELECT * FROM friend_requests WHERE id = $1 AND receiver_id = $2 AND status = $3',
                [requestId, userId, 'pending']
            );

            if (requestResult.rows.length === 0) {
                throw new Error('Friend request not found or already processed');
            }

            const request = requestResult.rows[0];

            // Start transaction
            await db.query('BEGIN');

            try {
                // Update friend request status
                await db.query(
                    'UPDATE friend_requests SET status = $1, updated_at = NOW() WHERE id = $2',
                    ['accepted', requestId]
                );

                // Create friendship (ensure consistent ordering)
                const user1Id = request.sender_id < request.receiver_id ? request.sender_id : request.receiver_id;
                const user2Id = request.sender_id < request.receiver_id ? request.receiver_id : request.sender_id;

                await db.query(
                    'INSERT INTO friendships (user1_id, user2_id) VALUES ($1, $2)',
                    [user1Id, user2Id]
                );

                // Award XP to both users
                await GamificationService.awardXP(request.sender_id, this.xpRewards.ACCEPT_FRIEND_REQUEST, 'ACCEPT_FRIEND_REQUEST');
                await GamificationService.awardXP(request.receiver_id, this.xpRewards.ACCEPT_FRIEND_REQUEST, 'ACCEPT_FRIEND_REQUEST');

                // Create notifications
                await this.createNotification(request.sender_id, 'friend_accepted', 'Friend Request Accepted', 
                    'Your friend request has been accepted', { friendshipId: requestId });

                await db.query('COMMIT');
                logger.info(`Friend request ${requestId} accepted by ${userId}`);
                return { success: true, friendshipId: requestId };
            } catch (error) {
                await db.query('ROLLBACK');
                throw error;
            }
        } catch (error) {
            logger.error('Error accepting friend request:', error);
            throw error;
        }
    }

    /**
     * Reject a friend request
     */
    async rejectFriendRequest(requestId, userId) {
        try {
            const result = await db.query(
                'UPDATE friend_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND receiver_id = $3 AND status = $4 RETURNING *',
                ['rejected', requestId, userId, 'pending']
            );

            if (result.rows.length === 0) {
                throw new Error('Friend request not found or already processed');
            }

            logger.info(`Friend request ${requestId} rejected by ${userId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error rejecting friend request:', error);
            throw error;
        }
    }

    /**
     * Get user's friends list
     */
    async getFriendsList(userId) {
        try {
            const result = await db.query('SELECT * FROM get_user_friends($1)', [userId]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting friends list:', error);
            throw error;
        }
    }

    /**
     * Get friend suggestions
     */
    async getFriendSuggestions(userId, limit = 10) {
        try {
            const result = await db.query('SELECT * FROM get_friend_suggestions($1, $2)', [userId, limit]);
            return result.rows;
        } catch (error) {
            logger.error('Error getting friend suggestions:', error);
            throw error;
        }
    }

    /**
     * Remove a friend
     */
    async removeFriend(userId, friendId) {
        try {
            const result = await db.query(
                'DELETE FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1) RETURNING *',
                [userId, friendId]
            );

            if (result.rows.length === 0) {
                throw new Error('Friendship not found');
            }

            logger.info(`Friendship removed between ${userId} and ${friendId}`);
            return { success: true };
        } catch (error) {
            logger.error('Error removing friend:', error);
            throw error;
        }
    }

    /**
     * Check if two users are friends
     */
    async checkFriendship(userId1, userId2) {
        try {
            const result = await db.query(
                'SELECT * FROM friendships WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1)',
                [userId1, userId2]
            );
            return result.rows.length > 0;
        } catch (error) {
            logger.error('Error checking friendship:', error);
            throw error;
        }
    }

    // ==================== SOCIAL FEED ====================

    /**
     * Create a new post
     */
    async createPost(userId, postData) {
        try {
            const { content, postType = 'general', privacy = 'public', mediaUrls = [], tags = [], location = null } = postData;

            const result = await db.query(
                'INSERT INTO posts (user_id, content, post_type, privacy, media_urls, tags, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [userId, content, postType, privacy, JSON.stringify(mediaUrls), JSON.stringify(tags), location ? JSON.stringify(location) : null]
            );

            // Award XP for creating post
            await GamificationService.awardXP(userId, this.xpRewards.CREATE_POST, 'CREATE_POST');

            // Log activity
            await this.logActivity(userId, 'post_created', { postId: result.rows[0].id, postType });

            logger.info(`Post created by ${userId}: ${result.rows[0].id}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating post:', error);
            throw error;
        }
    }

    /**
     * Get personalized feed for user
     */
    async getPersonalizedFeed(userId, limit = 20, offset = 0) {
        try {
            // Get posts from friends and public posts
            const result = await db.query(`
                SELECT DISTINCT p.*, u.username, u.display_name, u.avatar_url,
                       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) as like_count,
                       (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) as comment_count,
                       (SELECT COUNT(*) FROM post_shares ps WHERE ps.post_id = p.id) as share_count,
                       EXISTS(SELECT 1 FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = $1) as user_liked
                FROM posts p
                JOIN users u ON p.user_id = u.id
                LEFT JOIN friendships f ON (
                    (f.user1_id = $1 AND f.user2_id = p.user_id) OR 
                    (f.user2_id = $1 AND f.user1_id = p.user_id)
                )
                WHERE p.privacy = 'public' OR (p.privacy = 'friends' AND f.id IS NOT NULL) OR p.user_id = $1
                ORDER BY p.created_at DESC
                LIMIT $2 OFFSET $3
            `, [userId, limit, offset]);

            return result.rows;
        } catch (error) {
            logger.error('Error getting personalized feed:', error);
            throw error;
        }
    }

    /**
     * Like/unlike a post
     */
    async togglePostLike(userId, postId) {
        try {
            // Check if user already liked the post
            const existingLike = await db.query(
                'SELECT * FROM post_likes WHERE post_id = $1 AND user_id = $2',
                [postId, userId]
            );

            if (existingLike.rows.length > 0) {
                // Unlike the post
                await db.query(
                    'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
                    [postId, userId]
                );
                return { liked: false };
            } else {
                // Like the post
                await db.query(
                    'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
                    [postId, userId]
                );

                // Award XP for liking
                await GamificationService.awardXP(userId, this.xpRewards.LIKE_POST, 'LIKE_POST');

                // Get post owner and create notification
                const postResult = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
                if (postResult.rows.length > 0 && postResult.rows[0].user_id !== userId) {
                    await this.createNotification(postResult.rows[0].user_id, 'post_liked', 'Post Liked', 
                        'Someone liked your post', { postId });
                }

                return { liked: true };
            }
        } catch (error) {
            logger.error('Error toggling post like:', error);
            throw error;
        }
    }

    /**
     * Add comment to post
     */
    async addComment(userId, postId, content, parentCommentId = null) {
        try {
            const result = await db.query(
                'INSERT INTO post_comments (post_id, user_id, content, parent_comment_id) VALUES ($1, $2, $3, $4) RETURNING *',
                [postId, userId, content, parentCommentId]
            );

            // Award XP for commenting
            await GamificationService.awardXP(userId, this.xpRewards.COMMENT_POST, 'COMMENT_POST');

            // Get post owner and create notification
            const postResult = await db.query('SELECT user_id FROM posts WHERE id = $1', [postId]);
            if (postResult.rows.length > 0 && postResult.rows[0].user_id !== userId) {
                await this.createNotification(postResult.rows[0].user_id, 'post_commented', 'Post Commented', 
                    'Someone commented on your post', { postId, commentId: result.rows[0].id });
            }

            logger.info(`Comment added to post ${postId} by ${userId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error adding comment:', error);
            throw error;
        }
    }

    /**
     * Get comments for a post
     */
    async getPostComments(postId, limit = 50, offset = 0) {
        try {
            const result = await db.query(`
                SELECT pc.*, u.username, u.display_name, u.avatar_url
                FROM post_comments pc
                JOIN users u ON pc.user_id = u.id
                WHERE pc.post_id = $1
                ORDER BY pc.created_at ASC
                LIMIT $2 OFFSET $3
            `, [postId, limit, offset]);

            return result.rows;
        } catch (error) {
            logger.error('Error getting post comments:', error);
            throw error;
        }
    }

    // ==================== TEAM CHALLENGES ====================

    /**
     * Create a team
     */
    async createTeam(userId, teamData) {
        try {
            const { name, description, privacy = 'public', maxMembers = 10, avatarUrl = null } = teamData;

            const result = await db.query(
                'INSERT INTO teams (name, description, leader_id, privacy, max_members, avatar_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, description, userId, privacy, maxMembers, avatarUrl]
            );

            // Add creator as team leader
            await db.query(
                'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3)',
                [result.rows[0].id, userId, 'leader']
            );

            // Award XP for creating team
            await GamificationService.awardXP(userId, this.xpRewards.JOIN_TEAM, 'CREATE_TEAM');

            logger.info(`Team created by ${userId}: ${result.rows[0].id}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating team:', error);
            throw error;
        }
    }

    /**
     * Join a team
     */
    async joinTeam(userId, teamId) {
        try {
            // Check if team exists and has space
            const teamResult = await db.query(
                'SELECT * FROM teams WHERE id = $1',
                [teamId]
            );

            if (teamResult.rows.length === 0) {
                throw new Error('Team not found');
            }

            const team = teamResult.rows[0];

            // Check current member count
            const memberCountResult = await db.query(
                'SELECT COUNT(*) as count FROM team_members WHERE team_id = $1',
                [teamId]
            );

            if (parseInt(memberCountResult.rows[0].count) >= team.max_members) {
                throw new Error('Team is full');
            }

            // Check if user is already a member
            const existingMember = await db.query(
                'SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2',
                [teamId, userId]
            );

            if (existingMember.rows.length > 0) {
                throw new Error('User is already a member of this team');
            }

            // Add user to team
            const result = await db.query(
                'INSERT INTO team_members (team_id, user_id, role) VALUES ($1, $2, $3) RETURNING *',
                [teamId, userId, 'member']
            );

            // Award XP for joining team
            await GamificationService.awardXP(userId, this.xpRewards.JOIN_TEAM, 'JOIN_TEAM');

            logger.info(`User ${userId} joined team ${teamId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error joining team:', error);
            throw error;
        }
    }

    /**
     * Get user's teams
     */
    async getUserTeams(userId) {
        try {
            const result = await db.query(`
                SELECT t.*, tm.role, tm.joined_at
                FROM teams t
                JOIN team_members tm ON t.id = tm.team_id
                WHERE tm.user_id = $1
                ORDER BY tm.joined_at DESC
            `, [userId]);

            return result.rows;
        } catch (error) {
            logger.error('Error getting user teams:', error);
            throw error;
        }
    }

    // ==================== MENTORSHIP SYSTEM ====================

    /**
     * Create mentorship profile
     */
    async createMentorshipProfile(userId, profileData) {
        try {
            const { profileType, bio, specialties = [], experienceLevel, availability = {}, preferences = {} } = profileData;

            const result = await db.query(
                'INSERT INTO mentorship_profiles (user_id, profile_type, bio, specialties, experience_level, availability, preferences) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [userId, profileType, bio, JSON.stringify(specialties), experienceLevel, JSON.stringify(availability), JSON.stringify(preferences)]
            );

            logger.info(`Mentorship profile created for ${userId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating mentorship profile:', error);
            throw error;
        }
    }

    /**
     * Send mentorship request
     */
    async sendMentorshipRequest(mentorId, menteeId, message, goals = [], durationWeeks = 4) {
        try {
            const result = await db.query(
                'INSERT INTO mentorship_requests (mentor_id, mentee_id, message, goals, duration_weeks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [mentorId, menteeId, message, JSON.stringify(goals), durationWeeks]
            );

            // Create notification for mentor
            await this.createNotification(mentorId, 'mentorship_request', 'New Mentorship Request', 
                'You have received a new mentorship request', { requestId: result.rows[0].id });

            logger.info(`Mentorship request sent from ${menteeId} to ${mentorId}`);
            return result.rows[0];
        } catch (error) {
            logger.error('Error sending mentorship request:', error);
            throw error;
        }
    }

    // ==================== UTILITY FUNCTIONS ====================

    /**
     * Create a notification
     */
    async createNotification(userId, type, title, message, data = {}) {
        try {
            const result = await db.query(
                'INSERT INTO social_notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [userId, type, title, message, JSON.stringify(data)]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Log user activity
     */
    async logActivity(userId, activityType, activityData = {}) {
        try {
            await db.query(
                'INSERT INTO user_activities (user_id, activity_type, activity_data) VALUES ($1, $2, $3)',
                [userId, activityType, JSON.stringify(activityData)]
            );
        } catch (error) {
            logger.error('Error logging activity:', error);
            // Don't throw error for logging failures
        }
    }

    /**
     * Get user notifications
     */
    async getUserNotifications(userId, limit = 20, offset = 0) {
        try {
            const result = await db.query(
                'SELECT * FROM social_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
                [userId, limit, offset]
            );
            return result.rows;
        } catch (error) {
            logger.error('Error getting user notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markNotificationAsRead(notificationId, userId) {
        try {
            const result = await db.query(
                'UPDATE social_notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
                [notificationId, userId]
            );
            return result.rows[0];
        } catch (error) {
            logger.error('Error marking notification as read:', error);
            throw error;
        }
    }
}

export { SocialService };
