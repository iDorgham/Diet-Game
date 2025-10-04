// Request logging middleware
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import { logger } from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs incoming requests with timing and response information
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = generateRequestId();
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  
  // Log incoming request
  logger.info('Incoming Request', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    
    // Log response
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    logger[logLevel]('Request Completed', {
      requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id,
      contentLength: res.get('Content-Length') || 0,
      timestamp: new Date().toISOString()
    });

    // Call original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * API usage logging middleware
 * Logs API endpoint usage for analytics
 */
export const apiUsageLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Log API usage
    logger.info('API Usage', {
      endpoint: req.route?.path || req.url,
      method: req.method,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  });

  next();
};

/**
 * Error request logging middleware
 * Logs detailed information for failed requests
 */
export const errorRequestLogger = (error, req, res, next) => {
  const duration = Date.now() - (req.startTime || Date.now());
  
  logger.error('Request Error', {
    requestId: req.requestId,
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack,
    statusCode: res.statusCode || 500,
    duration: `${duration}ms`,
    ip: req.ip,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    body: req.body,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString()
  });

  next(error);
};

/**
 * Performance logging middleware
 * Logs slow requests for performance monitoring
 */
export const performanceLogger = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      if (duration > threshold) {
        logger.warn('Slow Request', {
          requestId: req.requestId,
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          threshold: `${threshold}ms`,
          statusCode: res.statusCode,
          userId: req.user?.id,
          ip: req.ip,
          timestamp: new Date().toISOString()
        });
      }
    });

    next();
  };
};

/**
 * Security logging middleware
 * Logs potentially suspicious requests
 */
export const securityLogger = (req, res, next) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union.*select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
    /exec\(/i // Command injection
  ];

  const url = req.url.toLowerCase();
  const userAgent = req.get('User-Agent')?.toLowerCase() || '';
  const body = JSON.stringify(req.body || {}).toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(userAgent) || pattern.test(body)) {
      logger.warn('Suspicious Request Detected', {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.body,
        pattern: pattern.toString(),
        userId: req.user?.id,
        timestamp: new Date().toISOString()
      });
      break;
    }
  }

  next();
};

/**
 * Database query logging middleware
 * Logs database operations for monitoring
 */
export const databaseLogger = (operation, table, duration, metadata = {}) => {
  logger.debug('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    ...metadata,
    timestamp: new Date().toISOString()
  });
};

/**
 * Gamification event logging middleware
 * Logs gamification-specific events
 */
export const gamificationLogger = (event, userId, data = {}) => {
  logger.info('Gamification Event', {
    event,
    userId,
    ...data,
    timestamp: new Date().toISOString()
  });
};
