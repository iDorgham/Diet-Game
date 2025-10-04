// Rate limiting middleware
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import rateLimit from 'express-rate-limit';
import { logger } from '../utils/logger.js';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      error: 'RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Strict rate limiter for sensitive operations
export const strictRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many sensitive requests from this IP, please try again later.',
    error: 'STRICT_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Strict rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many sensitive requests from this IP, please try again later.',
      error: 'STRICT_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Gamification-specific rate limiter
export const gamificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 gamification requests per minute
  message: {
    success: false,
    message: 'Too many gamification requests, please slow down.',
    error: 'GAMIFICATION_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Gamification rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many gamification requests, please slow down.',
      error: 'GAMIFICATION_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// Task completion rate limiter
export const taskCompletionRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 task completions per minute
  message: {
    success: false,
    message: 'Too many task completions, please slow down.',
    error: 'TASK_COMPLETION_RATE_LIMIT_EXCEEDED',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Task completion rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      taskId: req.body?.taskId
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many task completions, please slow down.',
      error: 'TASK_COMPLETION_RATE_LIMIT_EXCEEDED',
      retryAfter: '1 minute'
    });
  }
});

// User-specific rate limiter (based on user ID)
export const createUserRateLimiter = (windowMs = 15 * 60 * 1000, max = 50) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      return req.user?.id || req.ip;
    },
    message: {
      success: false,
      message: 'Too many requests for this user, please try again later.',
      error: 'USER_RATE_LIMIT_EXCEEDED',
      retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('User rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        userId: req.user?.id
      });
      
      res.status(429).json({
        success: false,
        message: 'Too many requests for this user, please try again later.',
        error: 'USER_RATE_LIMIT_EXCEEDED',
        retryAfter: `${Math.ceil(windowMs / 60000)} minutes`
      });
    }
  });
};

// Admin rate limiter (more lenient)
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.',
    error: 'ADMIN_RATE_LIMIT_EXCEEDED',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Admin rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      userId: req.user?.id
    });
    
    res.status(429).json({
      success: false,
      message: 'Too many admin requests from this IP, please try again later.',
      error: 'ADMIN_RATE_LIMIT_EXCEEDED',
      retryAfter: '15 minutes'
    });
  }
});

// Health check rate limiter (very lenient)
export const healthCheckRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 health checks per minute
  message: {
    success: false,
    message: 'Too many health check requests.',
    error: 'HEALTH_CHECK_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});
