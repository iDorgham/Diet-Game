/**
 * Rate Limiting Middleware
 * Configurable rate limiting for different endpoint types
 */

import rateLimit from 'express-rate-limit';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';

// General API rate limiter
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.id,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  },
});

// Authentication rate limiter (stricter)
export const authRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.id,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many authentication attempts, please try again later.',
        retryAfter: Math.ceil(config.rateLimit.windowMs / 1000),
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  },
});

// AI API rate limiter (very strict)
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.rateLimit.aiMaxRequests,
  message: {
    success: false,
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI API rate limit exceeded, please try again later.',
      retryAfter: 60,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('AI rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.id,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'AI_RATE_LIMIT_EXCEEDED',
        message: 'AI API rate limit exceeded, please try again later.',
        retryAfter: 60,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  },
});

// Upload rate limiter
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // 50 uploads per hour
  message: {
    success: false,
    error: {
      code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
      message: 'Upload rate limit exceeded, please try again later.',
      retryAfter: 3600,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Upload rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.url,
      method: req.method,
      requestId: req.id,
    });
    
    res.status(429).json({
      success: false,
      error: {
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        message: 'Upload rate limit exceeded, please try again later.',
        retryAfter: 3600,
      },
      timestamp: new Date().toISOString(),
      requestId: req.id,
    });
  },
});

// Custom rate limiter factory
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  code: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        code: options.code,
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn('Custom rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
        requestId: req.id,
        rateLimitCode: options.code,
      });
      
      res.status(429).json({
        success: false,
        error: {
          code: options.code,
          message: options.message,
          retryAfter: Math.ceil(options.windowMs / 1000),
        },
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    },
  });
};
