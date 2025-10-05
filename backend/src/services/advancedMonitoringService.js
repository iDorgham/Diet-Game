/**
 * Advanced Monitoring Service
 * Phase 15 Performance Optimization
 * APM, distributed tracing, and intelligent alerting
 */

import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

class AdvancedMonitoringService extends EventEmitter {
  constructor() {
    super();
    this.metrics = new Map();
    this.traces = new Map();
    this.alerts = [];
    this.anomalyDetector = new AnomalyDetector();
    this.performanceAnalyzer = new PerformanceAnalyzer();
    this.alertManager = new AlertManager();
    
    this.config = {
      metricsRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
      traceRetention: 24 * 60 * 60 * 1000, // 24 hours
      alertRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
      samplingRate: 0.1, // 10% sampling for traces
      batchSize: 100,
      flushInterval: 5000, // 5 seconds
      anomalyThreshold: 2.0, // 2 standard deviations
      performanceThresholds: {
        responseTime: 500, // ms
        errorRate: 0.05, // 5%
        throughput: 50, // requests per second
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.9 // 90%
      }
    };
    
    this.initialize();
  }

  /**
   * Initialize monitoring service
   */
  initialize() {
    // Start background processes
    this.startMetricsCollection();
    this.startAnomalyDetection();
    this.startPerformanceAnalysis();
    this.startAlertProcessing();
    
    logger.info('Advanced monitoring service initialized');
  }

  /**
   * Record performance metric
   */
  recordMetric(name, value, tags = {}, timestamp = Date.now()) {
    const metric = {
      name,
      value,
      tags,
      timestamp
    };
    
    // Store metric
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);
    
    // Emit metric event
    this.emit('metric', metric);
    
    // Check for alerts
    this.checkMetricAlerts(metric);
    
    // Cleanup old metrics
    this.cleanupOldMetrics(name);
  }

  /**
   * Start distributed trace
   */
  startTrace(operationName, traceId = null, parentSpanId = null) {
    const trace = {
      traceId: traceId || this.generateTraceId(),
      operationName,
      startTime: Date.now(),
      spans: [],
      tags: {},
      parentSpanId
    };
    
    this.traces.set(trace.traceId, trace);
    
    return trace.traceId;
  }

  /**
   * Start span within trace
   */
  startSpan(traceId, operationName, tags = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) {
      logger.warn('Trace not found', { traceId });
      return null;
    }
    
    const span = {
      spanId: this.generateSpanId(),
      operationName,
      startTime: Date.now(),
      tags,
      logs: []
    };
    
    trace.spans.push(span);
    
    return span.spanId;
  }

  /**
   * Finish span
   */
  finishSpan(traceId, spanId, tags = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const span = trace.spans.find(s => s.spanId === spanId);
    if (!span) return;
    
    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    Object.assign(span.tags, tags);
    
    // Record span metrics
    this.recordMetric('span.duration', span.duration, {
      operation: span.operationName,
      traceId
    });
    
    // Emit span event
    this.emit('span', { traceId, span });
  }

  /**
   * Finish trace
   */
  finishTrace(traceId, tags = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    trace.endTime = Date.now();
    trace.duration = trace.endTime - trace.startTime;
    Object.assign(trace.tags, tags);
    
    // Record trace metrics
    this.recordMetric('trace.duration', trace.duration, {
      operation: trace.operationName
    });
    
    this.recordMetric('trace.span_count', trace.spans.length, {
      operation: trace.operationName
    });
    
    // Emit trace event
    this.emit('trace', trace);
    
    // Cleanup old traces
    this.cleanupOldTraces();
  }

  /**
   * Add log to span
   */
  addSpanLog(traceId, spanId, message, fields = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const span = trace.spans.find(s => s.spanId === spanId);
    if (!span) return;
    
    span.logs.push({
      timestamp: Date.now(),
      message,
      fields
    });
  }

  /**
   * Record error
   */
  recordError(error, context = {}) {
    const errorData = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: Date.now(),
      context
    };
    
    // Record error metrics
    this.recordMetric('error.count', 1, {
      type: errorData.type,
      ...context
    });
    
    // Emit error event
    this.emit('error', errorData);
    
    // Check for error alerts
    this.checkErrorAlerts(errorData);
    
    return errorData.id;
  }

  /**
   * Record custom event
   */
  recordEvent(name, data = {}, tags = {}) {
    const event = {
      name,
      data,
      tags,
      timestamp: Date.now()
    };
    
    // Emit event
    this.emit('event', event);
    
    // Record event metrics
    this.recordMetric('event.count', 1, {
      event: name,
      ...tags
    });
  }

  /**
   * Get performance metrics
   */
  getMetrics(name = null, timeRange = null) {
    if (name) {
      const metrics = this.metrics.get(name) || [];
      return this.filterByTimeRange(metrics, timeRange);
    }
    
    const allMetrics = {};
    for (const [metricName, values] of this.metrics) {
      allMetrics[metricName] = this.filterByTimeRange(values, timeRange);
    }
    
    return allMetrics;
  }

  /**
   * Get traces
   */
  getTraces(operationName = null, timeRange = null) {
    const traces = Array.from(this.traces.values());
    
    let filteredTraces = traces;
    
    if (operationName) {
      filteredTraces = traces.filter(t => t.operationName === operationName);
    }
    
    if (timeRange) {
      filteredTraces = this.filterTracesByTimeRange(filteredTraces, timeRange);
    }
    
    return filteredTraces;
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(timeRange = null) {
    const summary = {
      responseTime: this.calculateMetricSummary('response_time', timeRange),
      errorRate: this.calculateErrorRate(timeRange),
      throughput: this.calculateThroughput(timeRange),
      memoryUsage: this.calculateMetricSummary('memory_usage', timeRange),
      cpuUsage: this.calculateMetricSummary('cpu_usage', timeRange),
      activeTraces: this.traces.size,
      totalErrors: this.calculateTotalErrors(timeRange)
    };
    
    return summary;
  }

  /**
   * Get anomaly detection results
   */
  getAnomalyResults() {
    return this.anomalyDetector.getResults();
  }

  /**
   * Get performance analysis
   */
  getPerformanceAnalysis() {
    return this.performanceAnalyzer.getAnalysis();
  }

  /**
   * Get alerts
   */
  getAlerts(status = null, timeRange = null) {
    let filteredAlerts = this.alerts;
    
    if (status) {
      filteredAlerts = filteredAlerts.filter(a => a.status === status);
    }
    
    if (timeRange) {
      filteredAlerts = this.filterAlertsByTimeRange(filteredAlerts, timeRange);
    }
    
    return filteredAlerts;
  }

  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000); // Every 10 seconds
  }

  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    // Memory usage
    const memUsage = process.memoryUsage();
    this.recordMetric('memory.heap_used', memUsage.heapUsed);
    this.recordMetric('memory.heap_total', memUsage.heapTotal);
    this.recordMetric('memory.external', memUsage.external);
    this.recordMetric('memory.rss', memUsage.rss);
    
    // CPU usage (simplified)
    const cpuUsage = process.cpuUsage();
    this.recordMetric('cpu.user', cpuUsage.user);
    this.recordMetric('cpu.system', cpuUsage.system);
    
    // Event loop lag
    const start = process.hrtime();
    setImmediate(() => {
      const delta = process.hrtime(start);
      const lag = delta[0] * 1000 + delta[1] / 1000000;
      this.recordMetric('event_loop.lag', lag);
    });
  }

  /**
   * Start anomaly detection
   */
  startAnomalyDetection() {
    setInterval(() => {
      this.detectAnomalies();
    }, 30000); // Every 30 seconds
  }

  /**
   * Detect anomalies
   */
  detectAnomalies() {
    const anomalies = this.anomalyDetector.detect(this.metrics);
    
    for (const anomaly of anomalies) {
      this.recordEvent('anomaly.detected', anomaly, {
        severity: anomaly.severity,
        metric: anomaly.metric
      });
      
      // Create alert for severe anomalies
      if (anomaly.severity === 'high') {
        this.createAlert({
          type: 'anomaly',
          severity: 'high',
          message: `Anomaly detected in ${anomaly.metric}`,
          data: anomaly
        });
      }
    }
  }

  /**
   * Start performance analysis
   */
  startPerformanceAnalysis() {
    setInterval(() => {
      this.analyzePerformance();
    }, 60000); // Every minute
  }

  /**
   * Analyze performance
   */
  analyzePerformance() {
    const analysis = this.performanceAnalyzer.analyze(this.metrics, this.traces);
    
    // Record analysis results
    this.recordEvent('performance.analysis', analysis, {
      timestamp: Date.now()
    });
    
    // Create alerts for performance issues
    if (analysis.issues.length > 0) {
      for (const issue of analysis.issues) {
        this.createAlert({
          type: 'performance',
          severity: issue.severity,
          message: issue.message,
          data: issue
        });
      }
    }
  }

  /**
   * Start alert processing
   */
  startAlertProcessing() {
    setInterval(() => {
      this.processAlerts();
    }, 5000); // Every 5 seconds
  }

  /**
   * Process alerts
   */
  processAlerts() {
    const activeAlerts = this.alerts.filter(a => a.status === 'active');
    
    for (const alert of activeAlerts) {
      this.alertManager.processAlert(alert);
    }
  }

  /**
   * Create alert
   */
  createAlert(alertData) {
    const alert = {
      id: this.generateAlertId(),
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      data: alertData.data,
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    this.alerts.push(alert);
    
    // Emit alert event
    this.emit('alert', alert);
    
    logger.warn('Alert created', alert);
    
    return alert.id;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId, userId = null) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.status = 'acknowledged';
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = Date.now();
    alert.updatedAt = Date.now();
    
    logger.info('Alert acknowledged', { alertId, userId });
    
    return true;
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId, userId = null, resolution = null) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;
    
    alert.status = 'resolved';
    alert.resolvedBy = userId;
    alert.resolvedAt = Date.now();
    alert.resolution = resolution;
    alert.updatedAt = Date.now();
    
    logger.info('Alert resolved', { alertId, userId, resolution });
    
    return true;
  }

  /**
   * Check metric alerts
   */
  checkMetricAlerts(metric) {
    const thresholds = this.config.performanceThresholds;
    
    switch (metric.name) {
      case 'response_time':
        if (metric.value > thresholds.responseTime) {
          this.createAlert({
            type: 'performance',
            severity: 'high',
            message: `Response time exceeded threshold: ${metric.value}ms > ${thresholds.responseTime}ms`,
            data: { metric, threshold: thresholds.responseTime }
          });
        }
        break;
        
      case 'error_rate':
        if (metric.value > thresholds.errorRate) {
          this.createAlert({
            type: 'reliability',
            severity: 'high',
            message: `Error rate exceeded threshold: ${metric.value} > ${thresholds.errorRate}`,
            data: { metric, threshold: thresholds.errorRate }
          });
        }
        break;
        
      case 'memory_usage':
        if (metric.value > thresholds.memoryUsage) {
          this.createAlert({
            type: 'resource',
            severity: 'medium',
            message: `Memory usage exceeded threshold: ${metric.value} > ${thresholds.memoryUsage}`,
            data: { metric, threshold: thresholds.memoryUsage }
          });
        }
        break;
    }
  }

  /**
   * Check error alerts
   */
  checkErrorAlerts(errorData) {
    // Check for error rate spikes
    const recentErrors = this.calculateTotalErrors({ start: Date.now() - 300000 }); // Last 5 minutes
    if (recentErrors > 10) {
      this.createAlert({
        type: 'reliability',
        severity: 'high',
        message: `High error rate detected: ${recentErrors} errors in last 5 minutes`,
        data: { errorCount: recentErrors, timeWindow: 300000 }
      });
    }
  }

  /**
   * Calculate metric summary
   */
  calculateMetricSummary(metricName, timeRange = null) {
    const metrics = this.getMetrics(metricName, timeRange);
    
    if (metrics.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, p95: 0, p99: 0 };
    }
    
    const values = metrics.map(m => m.value).sort((a, b) => a - b);
    
    return {
      count: values.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: this.calculatePercentile(values, 95),
      p99: this.calculatePercentile(values, 99)
    };
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(timeRange = null) {
    const totalRequests = this.calculateMetricSummary('request.count', timeRange);
    const totalErrors = this.calculateTotalErrors(timeRange);
    
    return totalRequests.count > 0 ? totalErrors / totalRequests.count : 0;
  }

  /**
   * Calculate throughput
   */
  calculateThroughput(timeRange = null) {
    const requests = this.getMetrics('request.count', timeRange);
    
    if (requests.length === 0) return 0;
    
    const timeSpan = timeRange ? timeRange.end - timeRange.start : Date.now() - requests[0].timestamp;
    const totalRequests = requests.reduce((sum, req) => sum + req.value, 0);
    
    return timeSpan > 0 ? (totalRequests / timeSpan) * 1000 : 0; // requests per second
  }

  /**
   * Calculate total errors
   */
  calculateTotalErrors(timeRange = null) {
    const errors = this.getMetrics('error.count', timeRange);
    return errors.reduce((sum, error) => sum + error.value, 0);
  }

  /**
   * Calculate percentile
   */
  calculatePercentile(values, percentile) {
    if (values.length === 0) return 0;
    
    const index = Math.ceil((percentile / 100) * values.length) - 1;
    return values[index] || 0;
  }

  /**
   * Filter by time range
   */
  filterByTimeRange(metrics, timeRange) {
    if (!timeRange) return metrics;
    
    return metrics.filter(m => 
      m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
    );
  }

  /**
   * Filter traces by time range
   */
  filterTracesByTimeRange(traces, timeRange) {
    if (!timeRange) return traces;
    
    return traces.filter(t => 
      t.startTime >= timeRange.start && t.startTime <= timeRange.end
    );
  }

  /**
   * Filter alerts by time range
   */
  filterAlertsByTimeRange(alerts, timeRange) {
    if (!timeRange) return alerts;
    
    return alerts.filter(a => 
      a.createdAt >= timeRange.start && a.createdAt <= timeRange.end
    );
  }

  /**
   * Cleanup old metrics
   */
  cleanupOldMetrics(metricName) {
    const metrics = this.metrics.get(metricName);
    if (!metrics) return;
    
    const cutoff = Date.now() - this.config.metricsRetention;
    const filtered = metrics.filter(m => m.timestamp > cutoff);
    
    this.metrics.set(metricName, filtered);
  }

  /**
   * Cleanup old traces
   */
  cleanupOldTraces() {
    const cutoff = Date.now() - this.config.traceRetention;
    
    for (const [traceId, trace] of this.traces) {
      if (trace.startTime < cutoff) {
        this.traces.delete(traceId);
      }
    }
  }

  /**
   * Generate trace ID
   */
  generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate span ID
   */
  generateSpanId() {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate error ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert ID
   */
  generateAlertId() {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Anomaly Detector
 */
class AnomalyDetector {
  constructor() {
    this.results = [];
    this.threshold = 2.0; // 2 standard deviations
  }

  detect(metrics) {
    const anomalies = [];
    
    for (const [metricName, values] of metrics) {
      if (values.length < 10) continue; // Need enough data
      
      const recent = values.slice(-10); // Last 10 values
      const historical = values.slice(-100, -10); // Previous 90 values
      
      if (historical.length < 10) continue;
      
      const historicalMean = this.calculateMean(historical);
      const historicalStd = this.calculateStandardDeviation(historical, historicalMean);
      
      for (const value of recent) {
        const zScore = Math.abs((value.value - historicalMean) / historicalStd);
        
        if (zScore > this.threshold) {
          anomalies.push({
            metric: metricName,
            value: value.value,
            expected: historicalMean,
            zScore,
            severity: zScore > 3 ? 'high' : 'medium',
            timestamp: value.timestamp
          });
        }
      }
    }
    
    this.results = anomalies;
    return anomalies;
  }

  calculateMean(values) {
    return values.reduce((sum, v) => sum + v.value, 0) / values.length;
  }

  calculateStandardDeviation(values, mean) {
    const variance = values.reduce((sum, v) => sum + Math.pow(v.value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  getResults() {
    return this.results;
  }
}

/**
 * Performance Analyzer
 */
class PerformanceAnalyzer {
  constructor() {
    this.analysis = {
      issues: [],
      recommendations: [],
      trends: {}
    };
  }

  analyze(metrics, traces) {
    this.analysis = {
      issues: [],
      recommendations: [],
      trends: {}
    };
    
    this.analyzeResponseTime(metrics);
    this.analyzeErrorRate(metrics);
    this.analyzeThroughput(metrics);
    this.analyzeResourceUsage(metrics);
    this.analyzeTracePerformance(traces);
    
    return this.analysis;
  }

  analyzeResponseTime(metrics) {
    const responseTimeMetrics = metrics.get('response_time') || [];
    
    if (responseTimeMetrics.length === 0) return;
    
    const recent = responseTimeMetrics.slice(-20);
    const avgResponseTime = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    
    if (avgResponseTime > 500) {
      this.analysis.issues.push({
        type: 'performance',
        severity: 'high',
        message: `Average response time is ${avgResponseTime.toFixed(2)}ms, above 500ms threshold`,
        metric: 'response_time',
        value: avgResponseTime
      });
      
      this.analysis.recommendations.push({
        type: 'optimization',
        message: 'Consider implementing caching or optimizing database queries',
        priority: 'high'
      });
    }
  }

  analyzeErrorRate(metrics) {
    const errorMetrics = metrics.get('error.count') || [];
    const requestMetrics = metrics.get('request.count') || [];
    
    if (errorMetrics.length === 0 || requestMetrics.length === 0) return;
    
    const recentErrors = errorMetrics.slice(-10).reduce((sum, m) => sum + m.value, 0);
    const recentRequests = requestMetrics.slice(-10).reduce((sum, m) => sum + m.value, 0);
    
    const errorRate = recentRequests > 0 ? recentErrors / recentRequests : 0;
    
    if (errorRate > 0.05) {
      this.analysis.issues.push({
        type: 'reliability',
        severity: 'high',
        message: `Error rate is ${(errorRate * 100).toFixed(2)}%, above 5% threshold`,
        metric: 'error_rate',
        value: errorRate
      });
    }
  }

  analyzeThroughput(metrics) {
    const requestMetrics = metrics.get('request.count') || [];
    
    if (requestMetrics.length === 0) return;
    
    const recent = requestMetrics.slice(-10);
    const throughput = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    
    if (throughput < 50) {
      this.analysis.issues.push({
        type: 'scalability',
        severity: 'medium',
        message: `Throughput is ${throughput.toFixed(2)} requests/second, below 50 RPS threshold`,
        metric: 'throughput',
        value: throughput
      });
    }
  }

  analyzeResourceUsage(metrics) {
    const memoryMetrics = metrics.get('memory.heap_used') || [];
    
    if (memoryMetrics.length === 0) return;
    
    const recent = memoryMetrics.slice(-10);
    const avgMemory = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    
    // Assuming 1GB heap limit
    const memoryUsage = avgMemory / (1024 * 1024 * 1024);
    
    if (memoryUsage > 0.8) {
      this.analysis.issues.push({
        type: 'resource',
        severity: 'medium',
        message: `Memory usage is ${(memoryUsage * 100).toFixed(2)}%, above 80% threshold`,
        metric: 'memory_usage',
        value: memoryUsage
      });
    }
  }

  analyzeTracePerformance(traces) {
    const traceArray = Array.from(traces.values());
    
    if (traceArray.length === 0) return;
    
    const recentTraces = traceArray.filter(t => Date.now() - t.startTime < 300000); // Last 5 minutes
    const avgTraceDuration = recentTraces.reduce((sum, t) => sum + t.duration, 0) / recentTraces.length;
    
    if (avgTraceDuration > 1000) {
      this.analysis.issues.push({
        type: 'performance',
        severity: 'medium',
        message: `Average trace duration is ${avgTraceDuration.toFixed(2)}ms, above 1000ms threshold`,
        metric: 'trace_duration',
        value: avgTraceDuration
      });
    }
  }

  getAnalysis() {
    return this.analysis;
  }
}

/**
 * Alert Manager
 */
class AlertManager {
  constructor() {
    this.notificationChannels = [];
  }

  processAlert(alert) {
    // Send notifications based on alert severity
    switch (alert.severity) {
      case 'high':
        this.sendImmediateNotification(alert);
        break;
      case 'medium':
        this.sendDelayedNotification(alert);
        break;
      case 'low':
        this.logAlert(alert);
        break;
    }
  }

  sendImmediateNotification(alert) {
    // In a real implementation, this would send to Slack, email, etc.
    logger.error('HIGH PRIORITY ALERT', alert);
  }

  sendDelayedNotification(alert) {
    // In a real implementation, this would send to a notification queue
    logger.warn('MEDIUM PRIORITY ALERT', alert);
  }

  logAlert(alert) {
    logger.info('LOW PRIORITY ALERT', alert);
  }
}

// Export singleton instance
export const advancedMonitoringService = new AdvancedMonitoringService();
export default advancedMonitoringService;

