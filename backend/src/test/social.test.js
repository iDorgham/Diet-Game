/**
 * Social Features API Tests
 * Sprint 9-10: Social Features APIs - Day 1 Task 1.4
 * 
 * Comprehensive tests for social features including:
 * - Friend management
 * - Social feed
 * - Team challenges
 * - Mentorship system
 */

import request from 'supertest';
import { app } from '../server.js';
import { db } from '../database/connection.js';
import { SocialService } from '../services/socialService.js';

describe('Social Features API Tests', () => {
    let authToken;
    let userId;
    let friendId;
    let teamId;
    let postId;

    beforeAll(async () => {
        // Create test users
        const userResult = await db.query(
            'INSERT INTO users (email, username, display_name) VALUES ($1, $2, $3) RETURNING *',
            ['testuser@example.com', 'testuser', 'Test User']
        );
        userId = userResult.rows[0].id;

        const friendResult = await db.query(
            'INSERT INTO users (email, username, display_name) VALUES ($1, $2, $3) RETURNING *',
            ['friend@example.com', 'friend', 'Friend User']
        );
        friendId = friendResult.rows[0].id;

        // Create user progress for gamification
        await db.query(
            'INSERT INTO user_progress (user_id) VALUES ($1)',
            [userId]
        );
        await db.query(
            'INSERT INTO user_progress (user_id) VALUES ($1)',
            [friendId]
        );

        // Mock auth token (in real implementation, this would be a valid JWT)
        authToken = 'mock-jwt-token';
    });

    afterAll(async () => {
        // Clean up test data
        await db.query('DELETE FROM user_progress WHERE user_id IN ($1, $2)', [userId, friendId]);
        await db.query('DELETE FROM users WHERE id IN ($1, $2)', [userId, friendId]);
    });

    describe('Friend System', () => {
        test('should send friend request', async () => {
            const response = await request(app)
                .post('/api/social/friends/request')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    receiverId: friendId,
                    message: 'Let\'s be friends!'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.sender_id).toBe(userId);
            expect(response.body.data.receiver_id).toBe(friendId);
        });

        test('should get friend suggestions', async () => {
            const response = await request(app)
                .get('/api/social/friends/suggestions')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should accept friend request', async () => {
            // First, get the friend request ID
            const requestResult = await db.query(
                'SELECT id FROM friend_requests WHERE sender_id = $1 AND receiver_id = $2',
                [userId, friendId]
            );
            const requestId = requestResult.rows[0].id;

            const response = await request(app)
                .post(`/api/social/friends/accept/${requestId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should get friends list', async () => {
            const response = await request(app)
                .get('/api/social/friends')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Social Feed', () => {
        test('should create a post', async () => {
            const response = await request(app)
                .post('/api/social/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'This is a test post!',
                    postType: 'general',
                    privacy: 'public',
                    tags: ['test', 'social']
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe('This is a test post!');
            postId = response.body.data.id;
        });

        test('should get personalized feed', async () => {
            const response = await request(app)
                .get('/api/social/posts/feed')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });

        test('should like a post', async () => {
            const response = await request(app)
                .post(`/api/social/posts/${postId}/like`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.liked).toBe(true);
        });

        test('should add comment to post', async () => {
            const response = await request(app)
                .post(`/api/social/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: 'Great post!'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.content).toBe('Great post!');
        });

        test('should get post comments', async () => {
            const response = await request(app)
                .get(`/api/social/posts/${postId}/comments`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Team Challenges', () => {
        test('should create a team', async () => {
            const response = await request(app)
                .post('/api/social/teams')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Test Team',
                    description: 'A test team for challenges',
                    privacy: 'public',
                    maxMembers: 10
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Test Team');
            teamId = response.body.data.id;
        });

        test('should join a team', async () => {
            const response = await request(app)
                .post(`/api/social/teams/${teamId}/join`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        test('should get user teams', async () => {
            const response = await request(app)
                .get('/api/social/teams')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Mentorship System', () => {
        test('should create mentorship profile', async () => {
            const response = await request(app)
                .post('/api/social/mentorship/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    profileType: 'mentor',
                    bio: 'I am an experienced nutrition coach',
                    specialties: ['nutrition', 'meal planning'],
                    experienceLevel: 'expert'
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.profile_type).toBe('mentor');
        });

        test('should send mentorship request', async () => {
            const response = await request(app)
                .post('/api/social/mentorship/request')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    mentorId: friendId,
                    message: 'I would like to learn from you',
                    goals: ['improve nutrition', 'meal planning'],
                    durationWeeks: 4
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.mentor_id).toBe(friendId);
        });
    });

    describe('Notifications', () => {
        test('should get user notifications', async () => {
            const response = await request(app)
                .get('/api/social/notifications')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid friend request', async () => {
            const response = await request(app)
                .post('/api/social/friends/request')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    receiverId: 'invalid-uuid'
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should handle invalid post creation', async () => {
            const response = await request(app)
                .post('/api/social/posts')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    content: '' // Empty content should fail
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        test('should handle unauthorized access', async () => {
            const response = await request(app)
                .get('/api/social/friends');

            expect(response.status).toBe(401);
        });
    });

    describe('Social Service Unit Tests', () => {
        test('should check friendship correctly', async () => {
            const isFriend = await SocialService.checkFriendship(userId, friendId);
            expect(isFriend).toBe(true);
        });

        test('should log activity correctly', async () => {
            await SocialService.logActivity(userId, 'test_activity', { test: 'data' });
            
            const result = await db.query(
                'SELECT * FROM user_activities WHERE user_id = $1 AND activity_type = $2',
                [userId, 'test_activity']
            );
            
            expect(result.rows.length).toBe(1);
            expect(result.rows[0].activity_data.test).toBe('data');
        });
    });
});
