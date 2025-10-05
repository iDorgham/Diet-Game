/**
 * Performance Monitoring Service
 * Based on RECOMMENDATIONS_PERFORMANCE_OPTIMIZATION.md
 * Comprehensive performance monitoring and analytics
 */

import { logger } from '../utils/logger.js';
import { CacheService } from './cache.js';

class PerformanceMonitoringService {
  constructor() {
    this.metrics = {
      apiResponseTime: [],
      cacheHitRate: 0,
      realtimeLatency: [],
      errorRate: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      databaseConnections: 0,
      activeUsers: 0
    };
    
    this.alertThresholds = {
      errorRate: 0.05, // 5%
      responseTime: 500, // 500ms
      cacheMissRate: 0.3, // 30%
      memoryUsage: 0.8, // 80%
      cpuUsage: 0.9 // 90%
    };
    
    this.alerts = [];
    this.isMonitoring = false;
    this.monitoringInterval = null;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs = 30000) {
    if (this.isMonitoring) {
      logger.warn('Performance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkAlerts();
      this.exportMetrics();
    }, intervalMs);

    logger.info('Performance monitoring started', { intervalMs });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring() {
    if (!this.isMonitoring) {
      logger.warn('Performance monitoring is not running');
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    logger.info('Performance monitoring stopped');
  }

  /**
   * Record API response time
   */
  recordApiResponseTime(duration, endpoint, method) {
    const metric = {
      duration,
      endpoint,
      method,
      timestamp: Date.now()
    };

    this.metrics.apiResponseTime.push(metric);
    
    // Keep only last 1000 entries
    if (this.metrics.apiResponseTime.length > 1000) {
      this.metrics.apiResponseTime.shift();
    }

    // Update average response time
    this.updateAverageResponseTime();
  }

  /**
   * Record cache hit/miss
   */
  recordCacheHit(hit, cacheKey, operation) {
    const total = this.metrics.cacheHitRate + (hit ? 1 : 0);
    this.metrics.cacheHitRate = total / (total + 1);

    logger.debug('Cache operation recorded', { 
      hit, 
      cacheKey, 
      operation,
      hitRate: this.metrics.cacheHitRate 
    });
  }

  /**
   * Record real-time latency
   */
  recordRealtimeLatency(latency, eventType, userId) {
    const metric = {
      latency,
      eventType,
      userId,
      timestamp: Date.now()
    };

    this.metrics.realtimeLatency.push(metric);
    
    // Keep only last 500 entries
    if (this.metrics.realtimeLatency.length > 500) {
      this.metrics.realtimeLatency.shift();
    }
  }

  /**
   * Record error
   */
  recordError(error, context, severity = 'medium') {
    const errorRecord = {
      message: error.message,
      stack: error.stack,
      context,
      severity,
      timestamp: Date.now()
    };

    // Update error rate
    this.updateErrorRate();

    // Log error
    logger.error('Error recorded', errorRecord);

    // Check if alert should be triggered
    if (this.shouldAlert(errorRecord)) {
      this.sendAlert(errorRecord);
    }
  }

  /**
   * Record throughput metrics
   */
  recordThroughput(requests, timeWindow) {
    this.metrics.throughput = requests / (timeWindow / 1000); // requests per second
  }

  /**
   * Update system resource usage
   */
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = memUsage.heapUsed / memUsage.heapTotal;
    
    // CPU usage would require additional monitoring tools
    // this.metrics.cpuUsage = getCpuUsage();
  }

  /**
   * Collect all metrics
   */
  async collectMetrics() {
    try {
      this.updateSystemMetrics();
      this.updateAverageResponseTime();
      this.updateErrorRate();
      
      // Collect cache statistics
      const cacheStats = await CacheService.getStats();
      if (cacheStats) {
        this.metrics.cacheStats = cacheStats;
      }

      logger.debug('Metrics collected', {
        responseTime: this.getAverageResponseTime(),
        cacheHitRate: this.metrics.cacheHitRate,
        errorRate: this.metrics.errorRate,
        throughput: this.metrics.throughput,
        memoryUsage: this.metrics.memoryUsage
      });
    } catch (error) {
      logger.error('Error collecting metrics', { error: error.message });
    }
  }

  /**
   * Check alert conditions
   */
  checkAlerts() {
    const alerts = [];

    // Check error rate
    if (this.metrics.errorRate > this.alertThresholds.errorRate) {
      alerts.push({
        type: 'HIGH_ERROR_RATE',
        message: `Error rate is ${(this.metrics.errorRate * 100).toFixed(2)}%, threshold is ${(this.alertThresholds.errorRate * 100)}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }

    // Check response time
    const avgResponseTime = this.getAverageResponseTime();
    if (avgResponseTime > this.alertThresholds.responseTime) {
      alerts.push({
        type: 'HIGH_RESPONSE_TIME',
        message: `Average response time is ${avgResponseTime}ms, threshold is ${this.alertThresholds.responseTime}ms`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }

    // Check cache hit rate
    if (this.metrics.cacheHitRate < (1 - this.alertThresholds.cacheMissRate)) {
      alerts.push({
        type: 'LOW_CACHE_HIT_RATE',
        message: `Cache hit rate is ${(this.metrics.cacheHitRate * 100).toFixed(2)}%, threshold is ${((1 - this.alertThresholds.cacheMissRate) * 100)}%`,
        severity: 'warning',
        timestamp: Date.now()
      });
    }

    // Check memory usage
    if (this.metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      alerts.push({
        type: 'HIGH_MEMORY_USAGE',
        message: `Memory usage is ${(this.metrics.memoryUsage * 100).toFixed(2)}%, threshold is ${(this.alertThresholds.memoryUsage * 100)}%`,
        severity: 'critical',
        timestamp: Date.now()
      });
    }

    // Send alerts
    alerts.forEach(alert => this.sendAlert(alert));
  }

  /**
   * Send alert
   */
  sendAlert(alert) {
    this.alerts.push(alert);
    
    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }

    // Log alert
    logger.warn('Performance alert triggered', alert);

    // Here you would integrate with your alerting system
    // e.g., send to Slack, email, PagerDuty, etc.
    this.notifyAlertingSystem(alert);
  }

  /**
   * Notify external alerting system
   */
  notifyAlertingSystem(alert) {
    // Implementation depends on your alerting system
    // Examples: Slack webhook, email service, PagerDuty API
    logger.info('Alert sent to external system', { alert });
  }

  /**
   * Update average response time
   */
  updateAverageResponseTime() {
    if (this.metrics.apiResponseTime.length === 0) return;
    
    const total = this.metrics.apiResponseTime.reduce((sum, metric) => sum + metric.duration, 0);
    this.metrics.averageResponseTime = total / this.metrics.apiResponseTime.length;
  }

  /**
   * Update error rate
   */
  updateErrorRate() {
    // This would typically be calculated based on total requests vs errors
    // For now, we'll use a simple approximation
    const recentErrors = this.alerts.filter(
      alert => Date.now() - alert.timestamp < 300000 // 5 minutes
    );
    
    // This is a simplified calculation - in practice you'd track total requests
    this.metrics.errorRate = recentErrors.length / 1000; // Assuming 1000 requests in 5 minutes
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    return this.metrics.averageResponseTime || 0;
  }

  /**
   * Get cache hit rate
   */
  getCacheHitRate() {
    return this.metrics.cacheHitRate;
  }

  /**
   * Get error rate
   */
  getErrorRate() {
    return this.metrics.errorRate;
  }

  /**
   * Get throughput
   */
  getThroughput() {
    return this.metrics.throughput;
  }

  /**
   * Get memory usage
   */
  getMemoryUsage() {
    return this.metrics.memoryUsage;
  }

  /**
   * Export metrics for monitoring systems
   */
  exportMetrics() {
    const exportedMetrics = {
      timestamp: new Date().toISOString(),
      responseTime: {
        average: this.getAverageResponseTime(),
        p50: this.getPercentile(50),
        p95: this.getPercentile(95),
        p99: this.getPercentile(99)
      },
      cache: {
        hitRate: this.getCacheHitRate(),
        missRate: 1 - this.getCacheHitRate()
      },
      errors: {
        rate: this.getErrorRate(),
        count: this.alerts.length
      },
      throughput: this.getThroughput(),
      system: {
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.metrics.cpuUsage
      },
      realtime: {
        averageLatency: this.getAverageRealtimeLatency(),
        activeConnections: this.metrics.activeUsers
      }
    };

    // Send to monitoring system (e.g., Prometheus, DataDog, CloudWatch)
    this.sendToMonitoringSystem(exportedMetrics);
    
    return exportedMetrics;
  }

  /**
   * Get percentile for response times
   */
  getPercentile(percentile) {
    if (this.metrics.apiResponseTime.length === 0) return 0;
    
    const sorted = this.metrics.apiResponseTime
      .map(m => m.duration)
      .sort((a, b) => a - b);
    
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  /**
   * Get average real-time latency
   */
  getAverageRealtimeLatency() {
    if (this.metrics.realtimeLatency.length === 0) return 0;
    
    const total = this.metrics.realtimeLatency.reduce((sum, metric) => sum + metric.latency, 0);
    return total / this.metrics.realtimeLatency.length;
  }

  /**
   * Send metrics to monitoring system
   */
  sendToMonitoringSystem(metrics) {
    // Implementation depends on your monitoring system
    // Examples: Prometheus pushgateway, DataDog API, CloudWatch
    logger.debug('Metrics sent to monitoring system', { metrics });
  }

  /**
   * Get performance dashboard data
   */
  getDashboardData() {
    return {
      current: {
        responseTime: this.getAverageResponseTime(),
        cacheHitRate: this.getCacheHitRate(),
        errorRate: this.getErrorRate(),
        throughput: this.getThroughput(),
        memoryUsage: this.getMemoryUsage()
      },
      trends: {
        responseTime: this.getResponseTimeTrend(),
        cacheHitRate: this.getCacheHitRateTrend(),
        errorRate: this.getErrorRateTrend()
      },
      alerts: this.getRecentAlerts(10),
      health: this.getSystemHealth()
    };
  }

  /**
   * Get response time trend
   */
  getResponseTimeTrend() {
    // Return last 10 data points for trend analysis
    const recent = this.metrics.apiResponseTime.slice(-10);
    return recent.map(metric => ({
      timestamp: metric.timestamp,
      duration: metric.duration
    }));
  }

  /**
   * Get cache hit rate trend
   */
  getCacheHitRateTrend() {
    // This would typically be calculated over time windows
    // For now, return current rate
    return [{
      timestamp: Date.now(),
      hitRate: this.getCacheHitRate()
    }];
  }

  /**
   * Get error rate trend
   */
  getErrorRateTrend() {
    // This would typically be calculated over time windows
    // For now, return current rate
    return [{
      timestamp: Date.now(),
      errorRate: this.getErrorRate()
    }];
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit = 10) {
    return this.alerts
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get system health status
   */
  getSystemHealth() {
    const health = {
      status: 'healthy',
      issues: [],
      score: 100
    };

    // Check various health indicators
    if (this.metrics.errorRate > this.alertThresholds.errorRate) {
      health.issues.push('High error rate');
      health.score -= 20;
    }

    if (this.getAverageResponseTime() > this.alertThresholds.responseTime) {
      health.issues.push('High response time');
      health.score -= 15;
    }

    if (this.metrics.cacheHitRate < (1 - this.alertThresholds.cacheMissRate)) {
      health.issues.push('Low cache hit rate');
      health.score -= 10;
    }

    if (this.metrics.memoryUsage > this.alertThresholds.memoryUsage) {
      health.issues.push('High memory usage');
      health.score -= 25;
    }

    // Determine overall status
    if (health.score < 50) {
      health.status = 'critical';
    } else if (health.score < 80) {
      health.status = 'warning';
    }

    return health;
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      apiResponseTime: [],
      cacheHitRate: 0,
      realtimeLatency: [],
      errorRate: 0,
      throughput: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      databaseConnections: 0,
      activeUsers: 0
    };
    
    this.alerts = [];
    
    logger.info('Performance metrics reset');
  }

  /**
   * Set alert thresholds
   */
  setAlertThresholds(thresholds) {
    this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    logger.info('Alert thresholds updated', { thresholds });
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      averageResponseTime: this.getAverageResponseTime(),
      isMonitoring: this.isMonitoring,
      alertThresholds: this.alertThresholds
    };
  }
}

// Export singleton instance
export const performanceMonitoringService = new PerformanceMonitoringService();
export default performanceMonitoringService;
