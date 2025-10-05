/**
 * Advanced Performance Middleware
 * Phase 15 Performance Optimization
 * Request optimization, compression, and advanced caching
 */

import compression from 'compression';
import { performanceMonitoringService } from '../services/performanceMonitoringService.js';
import { advancedCachingService } from '../services/advancedCachingService.js';
import { logger } from '../utils/logger.js';

class AdvancedPerformanceMiddleware {
  constructor() {
    this.compressionOptions = {
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      }
    };
    
    this.cacheOptions = {
      ttl: 300, // 5 minutes default
      vary: ['Accept-Encoding', 'Authorization'],
      etag: true,
      lastModified: true
    };
  }

  /**
   * Request optimization middleware
   */
  requestOptimization() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Add performance tracking
      req.performanceStart = startTime;
      
      // Optimize request headers
      this.optimizeRequestHeaders(req);
      
      // Add request ID for tracing
      req.requestId = this.generateRequestId();
      
      // Set performance headers
      res.setHeader('X-Request-ID', req.requestId);
      res.setHeader('X-Response-Time', '0ms');
      
      // Override res.end to capture response time
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        res.setHeader('X-Response-Time', `${responseTime}ms`);
        
        // Record performance metrics
        performanceMonitoringService.recordMetric('request.duration', responseTime, {
          method: req.method,
          path: req.path,
          status: res.statusCode
        });
        
        originalEnd.call(this, chunk, encoding);
      };
      
      next();
    };
  }

  /**
   * Response compression middleware
   */
  responseCompression() {
    return compression(this.compressionOptions);
  }

  /**
   * Advanced caching middleware
   */
  advancedCaching(options = {}) {
    const cacheConfig = { ...this.cacheOptions, ...options };
    
    return async (req, res, next) => {
      // Skip caching for non-GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      // Skip caching for authenticated requests (unless specified)
      if (req.headers.authorization && !cacheConfig.allowAuthenticated) {
        return next();
      }
      
      try {
        const cacheKey = this.generateCacheKey(req, cacheConfig);
        const cachedResponse = await advancedCachingService.get(cacheKey);
        
        if (cachedResponse) {
          // Set cache headers
          this.setCacheHeaders(res, cacheConfig);
          
          // Set ETag if available
          if (cachedResponse.etag) {
            res.setHeader('ETag', cachedResponse.etag);
          }
          
          // Check if client has cached version
          if (req.headers['if-none-match'] === cachedResponse.etag) {
            res.status(304).end();
            return;
          }
          
          // Return cached response
          res.json(cachedResponse.data);
          return;
        }
        
        // Override res.json to cache response
        const originalJson = res.json;
        res.json = function(data) {
          // Cache the response
          const responseData = {
            data,
            etag: cacheConfig.etag ? generateETag(data) : null,
            timestamp: Date.now()
          };
          
          advancedCachingService.set(cacheKey, responseData, cacheConfig.ttl);
          
          // Set cache headers
          this.setCacheHeaders(res, cacheConfig);
          
          if (responseData.etag) {
            res.setHeader('ETag', responseData.etag);
          }
          
          originalJson.call(this, data);
        }.bind(this);
        
        next();
        
      } catch (error) {
        logger.error('Caching middleware error', { error: error.message });
        next();
      }
    };
  }

  /**
   * Request batching middleware
   */
  requestBatching(batchSize = 10, batchTimeout = 100) {
    const batchQueue = [];
    let batchTimer = null;
    
    return (req, res, next) => {
      // Only batch specific endpoints
      if (!this.shouldBatchRequest(req)) {
        return next();
      }
      
      // Add request to batch queue
      batchQueue.push({ req, res, next });
      
      // Process batch if it's full
      if (batchQueue.length >= batchSize) {
        this.processBatch(batchQueue.splice(0, batchSize));
      }
      
      // Set timer for batch timeout
      if (!batchTimer) {
        batchTimer = setTimeout(() => {
          if (batchQueue.length > 0) {
            this.processBatch(batchQueue.splice(0, batchQueue.length));
          }
          batchTimer = null;
        }, batchTimeout);
      }
    };
  }

  /**
   * Connection pooling middleware
   */
  connectionPooling() {
    return (req, res, next) => {
      // Add connection pool headers
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Keep-Alive', 'timeout=5, max=1000');
      
      next();
    };
  }

  /**
   * Rate limiting middleware
   */
  advancedRateLimiting(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      skipFailedRequests: false
    };
    
    const config = { ...defaultOptions, ...options };
    const requests = new Map();
    
    return (req, res, next) => {
      const key = this.getRateLimitKey(req);
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Clean up old entries
      if (requests.has(key)) {
        const userRequests = requests.get(key).filter(time => time > windowStart);
        requests.set(key, userRequests);
      } else {
        requests.set(key, []);
      }
      
      const userRequests = requests.get(key);
      
      if (userRequests.length >= config.max) {
        res.status(429).json({
          error: config.message,
          retryAfter: Math.ceil(config.windowMs / 1000)
        });
        return;
      }
      
      // Add current request
      userRequests.push(now);
      requests.set(key, userRequests);
      
      // Set rate limit headers
      if (config.standardHeaders) {
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - userRequests.length));
        res.setHeader('X-RateLimit-Reset', new Date(now + config.windowMs).toISOString());
      }
      
      next();
    };
  }

  /**
   * Optimize request headers
   */
  optimizeRequestHeaders(req) {
    // Remove unnecessary headers
    delete req.headers['x-forwarded-for'];
    delete req.headers['x-real-ip'];
    
    // Optimize content-type detection
    if (!req.headers['content-type'] && req.body) {
      req.headers['content-type'] = 'application/json';
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(req, cacheConfig) {
    const keyParts = [
      req.method,
      req.path,
      req.query ? JSON.stringify(req.query) : '',
      req.headers.authorization ? 'auth' : 'public'
    ];
    
    // Add vary headers
    if (cacheConfig.vary) {
      cacheConfig.vary.forEach(header => {
        if (req.headers[header.toLowerCase()]) {
          keyParts.push(`${header}:${req.headers[header.toLowerCase()]}`);
        }
      });
    }
    
    return keyParts.join('|');
  }

  /**
   * Set cache headers
   */
  setCacheHeaders(res, cacheConfig) {
    if (cacheConfig.ttl) {
      res.setHeader('Cache-Control', `public, max-age=${cacheConfig.ttl}`);
    }
    
    if (cacheConfig.lastModified) {
      res.setHeader('Last-Modified', new Date().toUTCString());
    }
  }

  /**
   * Should batch request
   */
  shouldBatchRequest(req) {
    // Only batch specific endpoints that can benefit from batching
    const batchableEndpoints = [
      '/api/v1/recommendations',
      '/api/v1/gamification/progress',
      '/api/v1/social/friends'
    ];
    
    return batchableEndpoints.some(endpoint => req.path.startsWith(endpoint));
  }

  /**
   * Process batch of requests
   */
  async processBatch(batch) {
    try {
      // Group requests by endpoint
      const groupedRequests = this.groupRequestsByEndpoint(batch);
      
      // Process each group
      for (const [endpoint, requests] of groupedRequests) {
        await this.processEndpointBatch(endpoint, requests);
      }
      
    } catch (error) {
      logger.error('Batch processing error', { error: error.message });
      
      // Fallback to individual processing
      batch.forEach(({ req, res, next }) => {
        next();
      });
    }
  }

  /**
   * Group requests by endpoint
   */
  groupRequestsByEndpoint(batch) {
    const groups = new Map();
    
    batch.forEach(({ req, res, next }) => {
      const endpoint = req.path;
      if (!groups.has(endpoint)) {
        groups.set(endpoint, []);
      }
      groups.get(endpoint).push({ req, res, next });
    });
    
    return groups;
  }

  /**
   * Process endpoint batch
   */
  async processEndpointBatch(endpoint, requests) {
    // In a real implementation, this would batch database queries or API calls
    logger.info(`Processing batch for ${endpoint}`, { count: requests.length });
    
    // For now, process individually
    requests.forEach(({ req, res, next }) => {
      next();
    });
  }

  /**
   * Get rate limit key
   */
  getRateLimitKey(req) {
    // Use IP address or user ID if authenticated
    return req.user?.id || req.ip || 'anonymous';
  }

  /**
   * Generate request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Generate ETag for response data
 */
function generateETag(data) {
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
  return `"${hash}"`;
}

// Export middleware functions
export const advancedPerformanceMiddleware = new AdvancedPerformanceMiddleware();

export const {
  requestOptimization,
  responseCompression,
  advancedCaching,
  requestBatching,
  connectionPooling,
  advancedRateLimiting
} = advancedPerformanceMiddleware;

export default advancedPerformanceMiddleware;
