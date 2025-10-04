/**
 * Authentication Middleware
 * JWT token validation and user authentication
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';
import { AppError } from './errorHandler';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export const validateAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(
        'Access token is required',
        401,
        'MISSING_TOKEN'
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      throw new AppError(
        'Access token is required',
        401,
        'MISSING_TOKEN'
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };

    logger.debug('User authenticated', {
      userId: decoded.id,
      email: decoded.email,
      requestId: req.id,
    });

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(
        'Invalid access token',
        401,
        'INVALID_TOKEN'
      ));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(
        'Access token has expired',
        401,
        'TOKEN_EXPIRED'
      ));
    } else {
      next(error);
    }
  }
};

export const validateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(
        'Refresh token is required',
        401,
        'MISSING_REFRESH_TOKEN'
      );
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JWTPayload;
    
    // Add user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(
        'Invalid refresh token',
        401,
        'INVALID_REFRESH_TOKEN'
      ));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(
        'Refresh token has expired',
        401,
        'REFRESH_TOKEN_EXPIRED'
      ));
    } else {
      next(error);
    }
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      ));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(
        'Insufficient permissions',
        403,
        'INSUFFICIENT_PERMISSIONS'
      ));
      return;
    }

    next();
  };
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      next();
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      next();
      return;
    }

    // Try to verify token, but don't fail if invalid
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role,
      };
    } catch (error) {
      // Token is invalid, but we continue without authentication
      logger.debug('Optional auth failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
    }

    next();
  } catch (error) {
    // Any other error, continue without authentication
    next();
  }
};
