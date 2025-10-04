// Authentication middleware
// Sprint 7-8: Core Backend Development - Day 1 Task 1.2

import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Validate JWT token and extract user information
 */
export const validateAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        error: 'MISSING_TOKEN'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      logger.warn('Invalid JWT token', { error: jwtError.message });
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
        error: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
      } catch (jwtError) {
        // Token is invalid, but we continue without user
        req.user = null;
      }
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    logger.error('Optional authentication error', { error: error.message });
    req.user = null;
    next();
  }
};

/**
 * Admin role validation
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'AUTH_REQUIRED'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required',
      error: 'INSUFFICIENT_PRIVILEGES'
    });
  }

  next();
};

/**
 * User ID validation - ensure user can only access their own data
 */
export const validateUserAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'AUTH_REQUIRED'
    });
  }

  const requestedUserId = req.params.userId || req.body.userId;
  
  // Admin can access any user's data
  if (req.user.role === 'admin') {
    return next();
  }

  // Regular users can only access their own data
  if (req.user.id !== requestedUserId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - you can only access your own data',
      error: 'ACCESS_DENIED'
    });
  }

  next();
};

/**
 * Generate JWT token
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role || 'user'
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: 'diet-game-api',
    audience: 'diet-game-client'
  });
};

/**
 * Verify token and return user info
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};
