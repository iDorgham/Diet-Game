/**
 * Input Validation and Sanitization Middleware
 * Comprehensive validation, sanitization, and security checks
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import { logger } from '@/config/logger';
import { AppError } from './errorHandler';

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('Invalid email format').max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  uuid: z.string().uuid('Invalid UUID format'),
  positiveInt: z.number().int().positive('Must be a positive integer'),
  nonNegativeInt: z.number().int().min(0, 'Must be a non-negative integer'),
  dateString: z.string().datetime('Invalid date format'),
  url: z.string().url('Invalid URL format'),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format'),
};

// XSS Protection
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize string inputs recursively
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        // Remove HTML tags and dangerous characters
        return DOMPurify.sanitize(obj, { 
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
          KEEP_CONTENT: true 
        });
      } else if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      } else if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
      }
      return obj;
    };

    // Sanitize request body, query, and params
    if (req.body) {
      req.body = sanitizeObject(req.body);
    }
    if (req.query) {
      req.query = sanitizeObject(req.query);
    }
    if (req.params) {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next(new AppError('Input sanitization failed', 400, 'SANITIZATION_ERROR'));
  }
};

// SQL Injection Protection
export const validateNoSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+['"]\s*=\s*['"])/i,
      /(UNION\s+SELECT)/i,
      /(DROP\s+TABLE)/i,
      /(DELETE\s+FROM)/i,
      /(INSERT\s+INTO)/i,
      /(UPDATE\s+SET)/i,
    ];

    const checkForSQLInjection = (obj: any, path: string = ''): void => {
      if (typeof obj === 'string') {
        for (const pattern of sqlPatterns) {
          if (pattern.test(obj)) {
            throw new AppError(
              `Potential SQL injection detected in ${path}`,
              400,
              'SQL_INJECTION_DETECTED'
            );
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkForSQLInjection(item, `${path}[${index}]`);
        });
      } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          checkForSQLInjection(value, path ? `${path}.${key}` : key);
        }
      }
    };

    checkForSQLInjection(req.body, 'body');
    checkForSQLInjection(req.query, 'query');
    checkForSQLInjection(req.params, 'params');

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      logger.error('SQL injection validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
      next(new AppError('Input validation failed', 400, 'VALIDATION_ERROR'));
    }
  }
};

// File Upload Validation
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      
      if (!files || files.length === 0) {
        return next();
      }

      // Check number of files
      if (options.maxFiles && files.length > options.maxFiles) {
        throw new AppError(
          `Too many files. Maximum allowed: ${options.maxFiles}`,
          400,
          'TOO_MANY_FILES'
        );
      }

      // Validate each file
      for (const file of files) {
        // Check file size
        if (options.maxSize && file.size > options.maxSize) {
          throw new AppError(
            `File ${file.originalname} is too large. Maximum size: ${options.maxSize} bytes`,
            400,
            'FILE_TOO_LARGE'
          );
        }

        // Check file type
        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
          throw new AppError(
            `File type ${file.mimetype} is not allowed`,
            400,
            'INVALID_FILE_TYPE'
          );
        }

        // Check for malicious file extensions
        const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        if (maliciousExtensions.includes(fileExtension)) {
          throw new AppError(
            `File extension ${fileExtension} is not allowed`,
            400,
            'MALICIOUS_FILE_EXTENSION'
          );
        }
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('File upload validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('File upload validation failed', 400, 'FILE_VALIDATION_ERROR'));
      }
    }
  };
};

// Request Size Validation
export const validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      
      if (contentLength > maxSize) {
        throw new AppError(
          `Request too large. Maximum size: ${maxSize} bytes`,
          413,
          'REQUEST_TOO_LARGE'
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Request size validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('Request size validation failed', 400, 'SIZE_VALIDATION_ERROR'));
      }
    }
  };
};

// Schema Validation Middleware
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        logger.warn('Schema validation failed', {
          errors,
          requestId: req.id,
          userId: req.user?.id,
        });

        throw new AppError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          { errors }
        );
      }

      // Replace request body with validated data
      req.body = result.data;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Schema validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('Schema validation failed', 400, 'SCHEMA_VALIDATION_ERROR'));
      }
    }
  };
};

// Query Parameter Validation
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.query);
      
      if (!result.success) {
        const errors = result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        throw new AppError(
          'Query validation failed',
          400,
          'QUERY_VALIDATION_ERROR',
          { errors }
        );
      }

      req.query = result.data;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Query validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('Query validation failed', 400, 'QUERY_VALIDATION_ERROR'));
      }
    }
  };
};

// Rate limiting per user (additional to IP-based rate limiting)
export const validateUserRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        return next(); // Skip if not authenticated
      }

      const userId = req.user.id;
      const now = Date.now();
      const userLimit = userRequests.get(userId);

      if (!userLimit || now > userLimit.resetTime) {
        // Reset or create new limit
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs,
        });
        return next();
      }

      if (userLimit.count >= maxRequests) {
        logger.warn('User rate limit exceeded', {
          userId,
          count: userLimit.count,
          maxRequests,
          requestId: req.id,
        });

        throw new AppError(
          'User rate limit exceeded',
          429,
          'USER_RATE_LIMIT_EXCEEDED'
        );
      }

      userLimit.count++;
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('User rate limit validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('Rate limit validation failed', 400, 'RATE_LIMIT_ERROR'));
      }
    }
  };
};

// Security headers validation
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check for suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-for',
      'x-real-ip',
      'x-originating-ip',
      'x-remote-ip',
      'x-remote-addr',
    ];

    for (const header of suspiciousHeaders) {
      const value = req.headers[header];
      if (value && typeof value === 'string') {
        // Validate IP format
        if (!validator.isIP(value)) {
          logger.warn('Suspicious header detected', {
            header,
            value,
            requestId: req.id,
            ip: req.ip,
          });
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Security headers validation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Comprehensive validation middleware stack
export const securityValidation = [
  validateRequestSize(),
  sanitizeInput,
  validateNoSQLInjection,
  validateSecurityHeaders,
];

export default {
  sanitizeInput,
  validateNoSQLInjection,
  validateFileUpload,
  validateRequestSize,
  validateSchema,
  validateQuery,
  validateUserRateLimit,
  validateSecurityHeaders,
  securityValidation,
  commonSchemas,
};
