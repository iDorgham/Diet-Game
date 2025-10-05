/**
 * WebSocket Reconnection Test Suite
 * Tests the reconnection logic implemented for Task 7.1
 */

import { Server } from 'socket.io';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { initializeWebSocket } from '../services/websocket.js';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

class WebSocketReconnectionTester {
  constructor() {
    this.server = null;
    this.io = null;
    this.testResults = [];
    this.testUser = {
      id: 'test-user-123',
      username: 'testuser',
      email: 'test@example.com'
    };
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
        logger.info(`Test server running on port ${port}`);
        resolve(port);
      });
    });
  }

  /**
   * Generate test JWT token
   */
  generateTestToken() {
    return jwt.sign(this.testUser, JWT_SECRET, { expiresIn: '1h' });
  }

  /**
   * Create test client connection
   */
  createTestClient() {
    return new Promise((resolve, reject) => {
      const client = require('socket.io-client');
      const token = this.generateTestToken();
      
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
   * Test 1: Basic connection and authentication
   */
  async testBasicConnection() {
    logger.info('🧪 Running Test 1: Basic Connection and Authentication');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        client.on('connected', (data) => {
          this.testResults.push({
            test: 'Basic Connection',
            status: 'PASS',
            details: 'Successfully connected and authenticated',
            data: data
          });
          client.disconnect();
          resolve(true);
        });

        // Timeout after 3 seconds
        setTimeout(() => {
          this.testResults.push({
            test: 'Basic Connection',
            status: 'FAIL',
            details: 'Connection timeout'
          });
          client.disconnect();
          resolve(false);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Basic Connection',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 2: Reconnection attempt handling
   */
  async testReconnectionAttempt() {
    logger.info('🧪 Running Test 2: Reconnection Attempt Handling');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        let reconnectAcknowledged = false;
        
        client.on('reconnect_acknowledged', (data) => {
          reconnectAcknowledged = true;
          this.testResults.push({
            test: 'Reconnection Attempt',
            status: 'PASS',
            details: 'Reconnection attempt acknowledged',
            data: data
          });
        });

        // Simulate reconnection attempt
        setTimeout(() => {
          client.emit('reconnect_attempt', {
            attempt: 1,
            delay: 1000,
            reason: 'network_error'
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!reconnectAcknowledged) {
            this.testResults.push({
              test: 'Reconnection Attempt',
              status: 'FAIL',
              details: 'Reconnection acknowledgment not received'
            });
          }
          client.disconnect();
          resolve(reconnectAcknowledged);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Reconnection Attempt',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 3: Successful reconnection
   */
  async testSuccessfulReconnection() {
    logger.info('🧪 Running Test 3: Successful Reconnection');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        let reconnectConfirmed = false;
        
        client.on('reconnect_confirmed', (data) => {
          reconnectConfirmed = true;
          this.testResults.push({
            test: 'Successful Reconnection',
            status: 'PASS',
            details: 'Reconnection confirmed successfully',
            data: data
          });
        });

        // Simulate successful reconnection
        setTimeout(() => {
          client.emit('reconnect_success', {
            previousSocketId: 'previous-socket-123',
            reconnectTime: Date.now()
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!reconnectConfirmed) {
            this.testResults.push({
              test: 'Successful Reconnection',
              status: 'FAIL',
              details: 'Reconnection confirmation not received'
            });
          }
          client.disconnect();
          resolve(reconnectConfirmed);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Successful Reconnection',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 4: Health check functionality
   */
  async testHealthCheck() {
    logger.info('🧪 Running Test 4: Health Check Functionality');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        let healthStatusReceived = false;
        
        client.on('health_status', (data) => {
          healthStatusReceived = true;
          this.testResults.push({
            test: 'Health Check',
            status: 'PASS',
            details: 'Health status received',
            data: data
          });
        });

        // Request health check
        setTimeout(() => {
          client.emit('health_check');
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!healthStatusReceived) {
            this.testResults.push({
              test: 'Health Check',
              status: 'FAIL',
              details: 'Health status not received'
            });
          }
          client.disconnect();
          resolve(healthStatusReceived);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Health Check',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 5: Ping/Pong functionality
   */
  async testPingPong() {
    logger.info('🧪 Running Test 5: Ping/Pong Functionality');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        let pongReceived = false;
        
        client.on('pong', (data) => {
          pongReceived = true;
          this.testResults.push({
            test: 'Ping/Pong',
            status: 'PASS',
            details: 'Pong received successfully',
            data: data
          });
        });

        // Send ping
        setTimeout(() => {
          client.emit('ping');
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!pongReceived) {
            this.testResults.push({
              test: 'Ping/Pong',
              status: 'FAIL',
              details: 'Pong not received'
            });
          }
          client.disconnect();
          resolve(pongReceived);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Ping/Pong',
        status: 'FAIL',
        details: error.message
      });
      return false;
    }
  }

  /**
   * Test 6: Maximum reconnection attempts
   */
  async testMaxReconnectionAttempts() {
    logger.info('🧪 Running Test 6: Maximum Reconnection Attempts');
    
    try {
      const client = await this.createTestClient();
      
      return new Promise((resolve) => {
        let maxAttemptsExceeded = false;
        
        client.on('reconnect_failed', (data) => {
          if (data.message.includes('Maximum reconnection attempts exceeded')) {
            maxAttemptsExceeded = true;
            this.testResults.push({
              test: 'Max Reconnection Attempts',
              status: 'PASS',
              details: 'Maximum attempts exceeded correctly handled',
              data: data
            });
          }
        });

        // Simulate exceeding max attempts
        setTimeout(() => {
          client.emit('reconnect_attempt', {
            attempt: 6, // Exceeds default max of 5
            delay: 1000,
            reason: 'network_error'
          });
        }, 1000);

        // Check result after 3 seconds
        setTimeout(() => {
          if (!maxAttemptsExceeded) {
            this.testResults.push({
              test: 'Max Reconnection Attempts',
              status: 'FAIL',
              details: 'Maximum attempts not properly handled'
            });
          }
          client.disconnect();
          resolve(maxAttemptsExceeded);
        }, 3000);
      });
    } catch (error) {
      this.testResults.push({
        test: 'Max Reconnection Attempts',
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
    logger.info('🚀 Starting WebSocket Reconnection Test Suite');
    
    const port = await this.setup();
    logger.info(`Test server running on port ${port}`);

    // Run all tests
    await this.testBasicConnection();
    await this.testReconnectionAttempt();
    await this.testSuccessfulReconnection();
    await this.testHealthCheck();
    await this.testPingPong();
    await this.testMaxReconnectionAttempts();

    // Generate report
    this.generateReport();
    
    // Cleanup
    await this.cleanup();
  }

  /**
   * Generate test report
   */
  generateReport() {
    logger.info('\n📊 WebSocket Reconnection Test Report');
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
      logger.info('\n🎉 All tests passed! Task 7.1 reconnection logic is working correctly.');
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
          logger.info('Test server closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

// Export for use in other test files
export { WebSocketReconnectionTester };

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tester = new WebSocketReconnectionTester();
  tester.runAllTests().catch(error => {
    logger.error('Test suite failed:', error);
    process.exit(1);
  });
}

export default WebSocketReconnectionTester;
