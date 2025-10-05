/**
 * Challenge Notification Test Suite
 * Tests the comprehensive challenge notification system
 */

import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { initializeWebSocket } from '../services/websocket.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

class ChallengeNotificationTester {
  constructor() {
    this.server = null;
    this.io = null;
    this.testResults = [];
    this.testUsers = [
      {
        id: 'test-user-1',
        username: 'testuser1',
        email: 'test1@example.com'
      },
      {
        id: 'test-user-2',
        username: 'testuser2',
        email: 'test2@example.com'
      },
      {
        id: 'test-user-3',
        username: 'testuser3',
        email: 'test3@example.com'
      }
    ];
  }

  /**
   * Setup test environment
   */
  async setup() {
    return new Promise((resolve) => {
      this.server = createServer();
      this.io = new Server(this.server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"]
        }
      });

      // Initialize WebSocket with our test server
      initializeWebSocket(this.io);

      this.server.listen(0, () => {
        const port = this.server.address().port;
        logger.info(`Challenge notification test server running on port ${port}`);
        resolve(port);
      });
    });
  }

  /**
   * Generate test JWT token
   */
  generateTestToken(user) {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Create test client connection
   */
  createTestClient(user) {
    return new Promise((resolve, reject) => {
      const client = require('socket.io-client');
      const token = this.generateTestToken(user);
      
      const socket = client(`http://localhost:${this.server.address().port}`, {
        auth: { token },
        transports: ['websocket']
      });

      socket.on('connect', () => {
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        reject(error);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Connection timeout'));
      }, 5000);
    });
  }

  /**
   * Test 1: Challenge Invitation Notification
   */
  async testChallengeInvitation() {
    logger.info('🧪 Running Test 1: Challenge Invitation Notification');
    
    try {
      const [inviter, invitee] = await Promise.all([
        this.createTestClient(this.testUsers[0]),
        this.createTestClient(this.testUsers[1])
      ]);
      
      return new Promise((resolve) => {
        let invitationReceived = false;
        
        invitee.on('challenge:invitation', (data) => {
          invitationReceived = true;
          this.testResults.push({
            test: 'Challenge Invitation',
            status: 'PASS',
            details: 'Challenge invitation received successfully',
            data: data
          });
        });

        // Send invitation
        setTimeout(() => {
          inviter.emit('challenge:invite', {
            targetUserId: this.testUsers[1].id,
            challengeId: 'test-challenge-123',
            challengeName: 'Test Challenge',
            challengeType: 'daily'
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!invitationReceived) {
            this.testResults.push({
              test: 'Challenge Invitation',
              status: 'FAIL',
              details: 'Challenge invitation not received'
            });
          }
          inviter.disconnect();
          invitee.disconnect();
          resolve(invitationReceived);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Invitation',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 2: Challenge Creation Notification
   */
  async testChallengeCreation() {
    logger.info('🧪 Running Test 2: Challenge Creation Notification');
    
    try {
      const [creator, participant1, participant2] = await Promise.all([
        this.createTestClient(this.testUsers[0]),
        this.createTestClient(this.testUsers[1]),
        this.createTestClient(this.testUsers[2])
      ]);
      
      return new Promise((resolve) => {
        let notificationsReceived = 0;
        const expectedNotifications = 2;
        
        const handleCreation = (data) => {
          notificationsReceived++;
          if (notificationsReceived === expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Creation',
              status: 'PASS',
              details: 'Challenge creation notifications received by all participants',
              data: { notificationCount: notificationsReceived }
            });
          }
        };

        participant1.on('challenge:created', handleCreation);
        participant2.on('challenge:created', handleCreation);

        // Create challenge
        setTimeout(() => {
          creator.emit('challenge:create', {
            challengeId: 'test-challenge-456',
            challengeName: 'Team Challenge',
            challengeType: 'weekly',
            participants: [this.testUsers[1].id, this.testUsers[2].id],
            description: 'A test challenge for the team',
            rewards: { coins: 100, xp: 500 }
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (notificationsReceived < expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Creation',
              status: 'FAIL',
              details: `Only ${notificationsReceived}/${expectedNotifications} notifications received`
            });
          }
          creator.disconnect();
          participant1.disconnect();
          participant2.disconnect();
          resolve(notificationsReceived === expectedNotifications);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Creation',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 3: Challenge Milestone Notification
   */
  async testChallengeMilestone() {
    logger.info('🧪 Running Test 3: Challenge Milestone Notification');
    
    try {
      const [participant1, participant2] = await Promise.all([
        this.createTestClient(this.testUsers[0]),
        this.createTestClient(this.testUsers[1])
      ]);
      
      return new Promise((resolve) => {
        let milestoneNotifications = 0;
        const expectedNotifications = 2;
        
        const handleMilestone = (data) => {
          milestoneNotifications++;
          if (milestoneNotifications === expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Milestone',
              status: 'PASS',
              details: 'Challenge milestone notifications received by all participants',
              data: { notificationCount: milestoneNotifications }
            });
          }
        };

        participant1.on('challenge:milestone_reached', handleMilestone);
        participant2.on('challenge:milestone_reached', handleMilestone);

        // Join challenge first
        setTimeout(() => {
          participant1.emit('challenge:join', { challengeId: 'test-challenge-789' });
          participant2.emit('challenge:join', { challengeId: 'test-challenge-789' });
        }, 500);

        // Send milestone notification
        setTimeout(() => {
          participant1.emit('challenge:milestone', {
            challengeId: 'test-challenge-789',
            milestoneType: 'progress',
            milestoneValue: 50,
            message: 'Halfway to the goal!'
          });
        }, 1500);

        // Check result after 3 seconds
        setTimeout(() => {
          if (milestoneNotifications < expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Milestone',
              status: 'FAIL',
              details: `Only ${milestoneNotifications}/${expectedNotifications} milestone notifications received`
            });
          }
          participant1.disconnect();
          participant2.disconnect();
          resolve(milestoneNotifications === expectedNotifications);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Milestone',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 4: Challenge Leaderboard Update
   */
  async testChallengeLeaderboard() {
    logger.info('🧪 Running Test 4: Challenge Leaderboard Update');
    
    try {
      const [participant1, participant2] = await Promise.all([
        this.createTestClient(this.testUsers[0]),
        this.createTestClient(this.testUsers[1])
      ]);
      
      return new Promise((resolve) => {
        let leaderboardNotifications = 0;
        const expectedNotifications = 2;
        
        const handleLeaderboard = (data) => {
          leaderboardNotifications++;
          if (leaderboardNotifications === expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Leaderboard',
              status: 'PASS',
              details: 'Challenge leaderboard update notifications received by all participants',
              data: { notificationCount: leaderboardNotifications }
            });
          }
        };

        participant1.on('challenge:leaderboard_updated', handleLeaderboard);
        participant2.on('challenge:leaderboard_updated', handleLeaderboard);

        // Join challenge first
        setTimeout(() => {
          participant1.emit('challenge:join', { challengeId: 'test-challenge-leaderboard' });
          participant2.emit('challenge:join', { challengeId: 'test-challenge-leaderboard' });
        }, 500);

        // Send leaderboard update
        setTimeout(() => {
          participant1.emit('challenge:leaderboard_update', {
            challengeId: 'test-challenge-leaderboard',
            leaderboard: [
              { userId: this.testUsers[0].id, username: 'testuser1', score: 100 },
              { userId: this.testUsers[1].id, username: 'testuser2', score: 80 }
            ]
          });
        }, 1500);

        // Check result after 3 seconds
        setTimeout(() => {
          if (leaderboardNotifications < expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Leaderboard',
              status: 'FAIL',
              details: `Only ${leaderboardNotifications}/${expectedNotifications} leaderboard notifications received`
            });
          }
          participant1.disconnect();
          participant2.disconnect();
          resolve(leaderboardNotifications === expectedNotifications);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Leaderboard',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 5: Challenge Achievement Notification
   */
  async testChallengeAchievement() {
    logger.info('🧪 Running Test 5: Challenge Achievement Notification');
    
    try {
      const [achiever, participant] = await Promise.all([
        this.createTestClient(this.testUsers[0]),
        this.createTestClient(this.testUsers[1])
      ]);
      
      return new Promise((resolve) => {
        let achievementNotifications = 0;
        const expectedNotifications = 2; // One for achiever, one for participant
        
        const handleAchievement = (data) => {
          achievementNotifications++;
          if (achievementNotifications === expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Achievement',
              status: 'PASS',
              details: 'Challenge achievement notifications received by all participants',
              data: { notificationCount: achievementNotifications }
            });
          }
        };

        achiever.on('challenge:achievement_unlocked', handleAchievement);
        participant.on('challenge:participant_achievement', handleAchievement);

        // Join challenge first
        setTimeout(() => {
          achiever.emit('challenge:join', { challengeId: 'test-challenge-achievement' });
          participant.emit('challenge:join', { challengeId: 'test-challenge-achievement' });
        }, 500);

        // Send achievement notification
        setTimeout(() => {
          achiever.emit('challenge:achievement', {
            challengeId: 'test-challenge-achievement',
            achievementType: 'first_place',
            achievementData: {
              title: 'First Place',
              description: 'Achieved first place in the challenge',
              reward: { coins: 200, xp: 1000 }
            }
          });
        }, 1500);

        // Check result after 3 seconds
        setTimeout(() => {
          if (achievementNotifications < expectedNotifications) {
            this.testResults.push({
              test: 'Challenge Achievement',
              status: 'FAIL',
              details: `Only ${achievementNotifications}/${expectedNotifications} achievement notifications received`
            });
          }
          achiever.disconnect();
          participant.disconnect();
          resolve(achievementNotifications === expectedNotifications);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Achievement',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 6: Challenge Reminder Notification
   */
  async testChallengeReminder() {
    logger.info('🧪 Running Test 6: Challenge Reminder Notification');
    
    try {
      const participant = await this.createTestClient(this.testUsers[0]);
      
      return new Promise((resolve) => {
        let reminderReceived = false;
        
        participant.on('challenge:reminder_set', (data) => {
          reminderReceived = true;
          this.testResults.push({
            test: 'Challenge Reminder',
            status: 'PASS',
            details: 'Challenge reminder set successfully',
            data: data
          });
        });

        // Request reminder
        setTimeout(() => {
          participant.emit('challenge:request_reminder', {
            challengeId: 'test-challenge-reminder',
            reminderType: 'daily'
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!reminderReceived) {
            this.testResults.push({
              test: 'Challenge Reminder',
              status: 'FAIL',
              details: 'Challenge reminder not set'
            });
          }
          participant.disconnect();
          resolve(reminderReceived);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Challenge Reminder',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    logger.info('🚀 Starting Challenge Notification Test Suite');
    
    const port = await this.setup();
    logger.info(`Test server running on port ${port}`);

    // Run all tests
    await this.testChallengeInvitation();
    await this.testChallengeCreation();
    await this.testChallengeMilestone();
    await this.testChallengeLeaderboard();
    await this.testChallengeAchievement();
    await this.testChallengeReminder();

    // Generate report
    this.generateReport();
    
    // Cleanup
    await this.cleanup();
  }

  /**
   * Generate test report
   */
  generateReport() {
    logger.info('\n📊 Challenge Notification Test Report');
    logger.info('=====================================');
    
    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;
    
    logger.info(`Total Tests: ${total}`);
    logger.info(`Passed: ${passed}`);
    logger.info(`Failed: ${failed}`);
    logger.info(`Success Rate: ${Math.round((passed / total) * 100)}%`);
    
    logger.info('\n📋 Detailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      logger.info(`${index + 1}. ${status} ${result.test}: ${result.details}`);
      if (result.data) {
        logger.info(`   Data: ${JSON.stringify(result.data, null, 2)}`);
      }
    });

    if (failed === 0) {
      logger.info('\n🎉 All challenge notification tests passed!');
    } else {
      logger.info(`\n⚠️  ${failed} test(s) failed. Please review the implementation.`);
    }
  }

  /**
   * Cleanup test environment
   */
  async cleanup() {
    return new Promise((resolve) => {
      if (this.io) {
        this.io.close();
      }
      if (this.server) {
        this.server.close(() => {
          logger.info('Challenge notification test server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export for use in other test files
export { ChallengeNotificationTester };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new ChallengeNotificationTester();
  tester.runAllTests().catch(error => {
    logger.error('Challenge notification test suite failed:', error);
    process.exit(1);
  });
}

export default ChallengeNotificationTester;
