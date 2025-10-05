/**
 * Load Testing Framework
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Comprehensive load testing for recommendations system
 */

import { performanceMonitoringService } from '../../src/services/performanceMonitoringService.js';
import { recommendationCacheService } from '../../src/services/recommendationCacheService.js';

class LoadTestingFramework {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
    this.config = {
      baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
      maxConcurrentUsers: 1000,
      testDuration: 300000, // 5 minutes
      rampUpTime: 60000, // 1 minute
      rampDownTime: 60000, // 1 minute
      requestTimeout: 30000, // 30 seconds
      retryAttempts: 3,
      retryDelay: 1000
    };
    
    this.scenarios = {
      recommendations: {
        weight: 70,
        endpoints: [
          '/api/v1/recommendations/friends',
          '/api/v1/recommendations/teams',
          '/api/v1/recommendations/content'
        ]
      },
      feedback: {
        weight: 20,
        endpoints: [
          '/api/v1/recommendations/feedback'
        ]
      },
      userProfile: {
        weight: 10,
        endpoints: [
          '/api/v1/users/profile',
          '/api/v1/users/stats'
        ]
      }
    };
  }

  /**
   * Run comprehensive load test
   */
  async runLoadTest(options = {}) {
    const config = { ...this.config, ...options };
    
    if (this.isRunning) {
      throw new Error('Load test is already running');
    }
    
    this.isRunning = true;
    this.testResults = [];
    
    logger.info('Starting load test', { config });
    
    try {
      // Phase 1: Ramp up
      await this.rampUpPhase(config);
      
      // Phase 2: Sustained load
      await this.sustainedLoadPhase(config);
      
      // Phase 3: Ramp down
      await this.rampDownPhase(config);
      
      // Generate report
      const report = this.generateReport();
      
      logger.info('Load test completed', { report });
      return report;
      
    } catch (error) {
      logger.error('Load test failed', { error: error.message });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Ramp up phase
   */
  async rampUpPhase(config) {
    const startTime = Date.now();
    const endTime = startTime + config.rampUpTime;
    const userIncrement = config.maxConcurrentUsers / (config.rampUpTime / 1000);
    
    logger.info('Starting ramp up phase', { 
      duration: config.rampUpTime,
      targetUsers: config.maxConcurrentUsers 
    });
    
    let currentUsers = 0;
    
    while (Date.now() < endTime && this.isRunning) {
      const newUsers = Math.min(
        Math.floor(userIncrement),
        config.maxConcurrentUsers - currentUsers
      );
      
      if (newUsers > 0) {
        await this.startUserSessions(newUsers, config);
        currentUsers += newUsers;
      }
      
      await this.sleep(1000); // Check every second
    }
    
    logger.info('Ramp up phase completed', { finalUsers: currentUsers });
  }

  /**
   * Sustained load phase
   */
  async sustainedLoadPhase(config) {
    const startTime = Date.now();
    const endTime = startTime + config.testDuration;
    
    logger.info('Starting sustained load phase', { 
      duration: config.testDuration,
      users: config.maxConcurrentUsers 
    });
    
    while (Date.now() < endTime && this.isRunning) {
      // Monitor system performance
      await this.monitorPerformance();
      
      // Adjust load if needed
      await this.adjustLoad(config);
      
      await this.sleep(5000); // Check every 5 seconds
    }
    
    logger.info('Sustained load phase completed');
  }

  /**
   * Ramp down phase
   */
  async rampDownPhase(config) {
    const startTime = Date.now();
    const endTime = startTime + config.rampDownTime;
    
    logger.info('Starting ramp down phase', { 
      duration: config.rampDownTime 
    });
    
    // Gradually reduce load
    const userDecrement = config.maxConcurrentUsers / (config.rampDownTime / 1000);
    let currentUsers = config.maxConcurrentUsers;
    
    while (Date.now() < endTime && this.isRunning && currentUsers > 0) {
      const usersToStop = Math.min(
        Math.floor(userDecrement),
        currentUsers
      );
      
      if (usersToStop > 0) {
        await this.stopUserSessions(usersToStop);
        currentUsers -= usersToStop;
      }
      
      await this.sleep(1000);
    }
    
    logger.info('Ramp down phase completed');
  }

  /**
   * Start user sessions
   */
  async startUserSessions(count, config) {
    const promises = [];
    
    for (let i = 0; i < count; i++) {
      promises.push(this.startUserSession(config));
    }
    
    await Promise.all(promises);
  }

  /**
   * Start individual user session
   */
  async startUserSession(config) {
    const userId = this.generateUserId();
    const session = {
      userId,
      startTime: Date.now(),
      requests: 0,
      errors: 0,
      totalResponseTime: 0,
      isActive: true
    };
    
    // Simulate user behavior
    this.simulateUserBehavior(session, config);
    
    return session;
  }

  /**
   * Simulate user behavior
   */
  async simulateUserBehavior(session, config) {
    while (session.isActive && this.isRunning) {
      try {
        // Select scenario based on weights
        const scenario = this.selectScenario();
        const endpoint = this.selectEndpoint(scenario);
        
        // Make request
        const result = await this.makeRequest(endpoint, session.userId, config);
        
        // Record result
        this.recordResult(session, result);
        
        // Wait between requests (simulate user thinking time)
        const waitTime = this.calculateWaitTime(scenario);
        await this.sleep(waitTime);
        
      } catch (error) {
        session.errors++;
        logger.error('User session error', { 
          userId: session.userId, 
          error: error.message 
        });
        
        // Wait before retry
        await this.sleep(config.retryDelay);
      }
    }
  }

  /**
   * Select scenario based on weights
   */
  selectScenario() {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const [name, scenario] of Object.entries(this.scenarios)) {
      cumulative += scenario.weight;
      if (random <= cumulative) {
        return scenario;
      }
    }
    
    return this.scenarios.recommendations; // Default fallback
  }

  /**
   * Select endpoint from scenario
   */
  selectEndpoint(scenario) {
    const endpoints = scenario.endpoints;
    const randomIndex = Math.floor(Math.random() * endpoints.length);
    return endpoints[randomIndex];
  }

  /**
   * Make HTTP request
   */
  async makeRequest(endpoint, userId, config) {
    const startTime = Date.now();
    const url = `${config.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.generateToken(userId)}`,
          'Content-Type': 'application/json'
        },
        timeout: config.requestTimeout
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: response.ok,
        status: response.status,
        responseTime,
        endpoint,
        userId
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        status: 0,
        responseTime,
        endpoint,
        userId,
        error: error.message
      };
    }
  }

  /**
   * Record test result
   */
  recordResult(session, result) {
    session.requests++;
    session.totalResponseTime += result.responseTime;
    
    if (!result.success) {
      session.errors++;
    }
    
    this.testResults.push({
      ...result,
      sessionId: session.userId,
      timestamp: Date.now()
    });
  }

  /**
   * Calculate wait time between requests
   */
  calculateWaitTime(scenario) {
    // Simulate realistic user behavior
    const baseWait = 2000; // 2 seconds
    const randomWait = Math.random() * 3000; // 0-3 seconds
    return baseWait + randomWait;
  }

  /**
   * Monitor system performance
   */
  async monitorPerformance() {
    try {
      const metrics = performanceMonitoringService.getMetrics();
      
      // Check for performance issues
      if (metrics.averageResponseTime > 1000) {
        logger.warn('High response time detected', { 
          responseTime: metrics.averageResponseTime 
        });
      }
      
      if (metrics.errorRate > 0.05) {
        logger.warn('High error rate detected', { 
          errorRate: metrics.errorRate 
        });
      }
      
      if (metrics.memoryUsage > 0.8) {
        logger.warn('High memory usage detected', { 
          memoryUsage: metrics.memoryUsage 
        });
      }
      
    } catch (error) {
      logger.error('Error monitoring performance', { error: error.message });
    }
  }

  /**
   * Adjust load based on performance
   */
  async adjustLoad(config) {
    // This could implement dynamic load adjustment
    // For now, we'll just log the current state
    const stats = this.getCurrentStats();
    logger.debug('Current load stats', stats);
  }

  /**
   * Stop user sessions
   */
  async stopUserSessions(count) {
    // In a real implementation, this would stop active user sessions
    logger.debug('Stopping user sessions', { count });
  }

  /**
   * Generate user ID
   */
  generateUserId() {
    return `test_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate test token
   */
  generateToken(userId) {
    // In a real implementation, this would generate a valid JWT token
    return `test_token_${userId}`;
  }

  /**
   * Get current test statistics
   */
  getCurrentStats() {
    const results = this.testResults;
    const totalRequests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = results.map(r => r.responseTime);
    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
      : 0;
    
    const p95ResponseTime = this.calculatePercentile(responseTimes, 95);
    const p99ResponseTime = this.calculatePercentile(responseTimes, 99);
    
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      averageResponseTime: avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      requestsPerSecond: this.calculateRPS()
    };
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Calculate requests per second
   */
  calculateRPS() {
    if (this.testResults.length === 0) return 0;
    
    const firstRequest = Math.min(...this.testResults.map(r => r.timestamp));
    const lastRequest = Math.max(...this.testResults.map(r => r.timestamp));
    const duration = (lastRequest - firstRequest) / 1000; // seconds
    
    return duration > 0 ? this.testResults.length / duration : 0;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const stats = this.getCurrentStats();
    const systemMetrics = performanceMonitoringService.getMetrics();
    
    const report = {
      testSummary: {
        duration: this.getTestDuration(),
        totalRequests: stats.totalRequests,
        successRate: stats.successRate,
        averageResponseTime: stats.averageResponseTime,
        p95ResponseTime: stats.p95ResponseTime,
        p99ResponseTime: stats.p99ResponseTime,
        requestsPerSecond: stats.requestsPerSecond
      },
      systemMetrics: {
        averageResponseTime: systemMetrics.averageResponseTime,
        cacheHitRate: systemMetrics.cacheHitRate,
        errorRate: systemMetrics.errorRate,
        memoryUsage: systemMetrics.memoryUsage,
        throughput: systemMetrics.throughput
      },
      endpointBreakdown: this.getEndpointBreakdown(),
      errorAnalysis: this.getErrorAnalysis(),
      recommendations: this.generateRecommendations(stats, systemMetrics)
    };
    
    return report;
  }

  /**
   * Get test duration
   */
  getTestDuration() {
    if (this.testResults.length === 0) return 0;
    
    const firstRequest = Math.min(...this.testResults.map(r => r.timestamp));
    const lastRequest = Math.max(...this.testResults.map(r => r.timestamp));
    return lastRequest - firstRequest;
  }

  /**
   * Get endpoint breakdown
   */
  getEndpointBreakdown() {
    const breakdown = {};
    
    this.testResults.forEach(result => {
      if (!breakdown[result.endpoint]) {
        breakdown[result.endpoint] = {
          totalRequests: 0,
          successfulRequests: 0,
          totalResponseTime: 0,
          errors: []
        };
      }
      
      const endpoint = breakdown[result.endpoint];
      endpoint.totalRequests++;
      endpoint.totalResponseTime += result.responseTime;
      
      if (result.success) {
        endpoint.successfulRequests++;
      } else {
        endpoint.errors.push(result.error);
      }
    });
    
    // Calculate averages
    Object.keys(breakdown).forEach(endpoint => {
      const data = breakdown[endpoint];
      data.averageResponseTime = data.totalResponseTime / data.totalRequests;
      data.successRate = data.successfulRequests / data.totalRequests;
    });
    
    return breakdown;
  }

  /**
   * Get error analysis
   */
  getErrorAnalysis() {
    const errors = this.testResults.filter(r => !r.success);
    const errorTypes = {};
    
    errors.forEach(error => {
      const type = error.status || 'network_error';
      if (!errorTypes[type]) {
        errorTypes[type] = 0;
      }
      errorTypes[type]++;
    });
    
    return {
      totalErrors: errors.length,
      errorTypes,
      errorRate: errors.length / this.testResults.length
    };
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations(stats, systemMetrics) {
    const recommendations = [];
    
    if (stats.averageResponseTime > 500) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Average response time is above 500ms. Consider implementing caching or optimizing database queries.',
        metric: 'response_time',
        current: stats.averageResponseTime,
        target: 500
      });
    }
    
    if (systemMetrics.cacheHitRate < 0.8) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: 'Cache hit rate is below 80%. Consider increasing cache TTL or improving cache keys.',
        metric: 'cache_hit_rate',
        current: systemMetrics.cacheHitRate,
        target: 0.8
      });
    }
    
    if (stats.successRate < 0.95) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: 'Success rate is below 95%. Investigate error causes and improve error handling.',
        metric: 'success_rate',
        current: stats.successRate,
        target: 0.95
      });
    }
    
    if (systemMetrics.memoryUsage > 0.8) {
      recommendations.push({
        type: 'resource',
        priority: 'high',
        message: 'Memory usage is above 80%. Consider optimizing memory usage or scaling resources.',
        metric: 'memory_usage',
        current: systemMetrics.memoryUsage,
        target: 0.8
      });
    }
    
    return recommendations;
  }

  /**
   * Stop load test
   */
  stopLoadTest() {
    this.isRunning = false;
    logger.info('Load test stopped by user');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const loadTestingFramework = new LoadTestingFramework();
export default loadTestingFramework;
