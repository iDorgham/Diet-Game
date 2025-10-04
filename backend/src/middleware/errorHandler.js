// Error handling middleware
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import { logger } from '../utils/logger.js';

/**
 * Global error handler middleware
 */
export const errorHandler = (error, req, res, next) => {
  // Log the error
  logger.error('Unhandled error', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_ERROR';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errorCode = 'VALIDATION_ERROR';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized access';
    errorCode = 'UNAUTHORIZED';
  } else if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Access forbidden';
    errorCode = 'FORBIDDEN';
  } else if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    errorCode = 'NOT_FOUND';
  } else if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
    errorCode = 'CONFLICT';
  } else if (error.name === 'RateLimitError') {
    statusCode = 429;
    message = 'Too many requests';
    errorCode = 'RATE_LIMIT_EXCEEDED';
  } else if (error.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
    errorCode = 'DUPLICATE_RESOURCE';
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Invalid reference';
    errorCode = 'INVALID_REFERENCE';
  } else if (error.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field missing';
    errorCode = 'MISSING_REQUIRED_FIELD';
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    message,
    error: errorCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Include additional details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = error.message;
    errorResponse.stack = error.stack;
  }

  // Include validation errors if available
  if (error.errors) {
    errorResponse.errors = error.errors;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'APP_ERROR') {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
    this.name = 'RateLimitError';
  }
}
