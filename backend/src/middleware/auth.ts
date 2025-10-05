/**
 * Enhanced Authentication Middleware
 * JWT token validation, role-based access control, and security features
 */

import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from '@/config/environment';
import { logger } from '@/config/logger';
import { AppError } from './errorHandler';

// User roles and permissions
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM = 'premium',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export interface UserPermissions {
  canViewRecipes: boolean;
  canCreateTasks: boolean;
  canAccessAI: boolean;
  canViewAnalytics: boolean;
  canManageUsers: boolean;
  canModerateContent: boolean;
  canAccessAdminPanel: boolean;
  canManageSystem: boolean;
}

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
        permissions: UserPermissions;
        sessionId?: string;
        tokenVersion?: number;
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  sessionId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  jti: string; // JWT ID for token tracking
}

export interface RefreshTokenPayload {
  id: string;
  sessionId: string;
  tokenVersion: number;
  iat: number;
  exp: number;
  jti: string;
}

// Role-based permissions mapping
const getPermissions = (role: UserRole): UserPermissions => {
  switch (role) {
    case UserRole.GUEST:
      return {
        canViewRecipes: false,
        canCreateTasks: false,
        canAccessAI: false,
        canViewAnalytics: false,
        canManageUsers: false,
        canModerateContent: false,
        canAccessAdminPanel: false,
        canManageSystem: false
      };
    case UserRole.USER:
      return {
        canViewRecipes: true,
        canCreateTasks: true,
        canAccessAI: true,
        canViewAnalytics: false,
        canManageUsers: false,
        canModerateContent: false,
        canAccessAdminPanel: false,
        canManageSystem: false
      };
    case UserRole.PREMIUM:
      return {
        canViewRecipes: true,
        canCreateTasks: true,
        canAccessAI: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canModerateContent: false,
        canAccessAdminPanel: false,
        canManageSystem: false
      };
    case UserRole.MODERATOR:
      return {
        canViewRecipes: true,
        canCreateTasks: true,
        canAccessAI: true,
        canViewAnalytics: true,
        canManageUsers: false,
        canModerateContent: true,
        canAccessAdminPanel: false,
        canManageSystem: false
      };
    case UserRole.ADMIN:
      return {
        canViewRecipes: true,
        canCreateTasks: true,
        canAccessAI: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canModerateContent: true,
        canAccessAdminPanel: true,
        canManageSystem: false
      };
    case UserRole.SUPER_ADMIN:
      return {
        canViewRecipes: true,
        canCreateTasks: true,
        canAccessAI: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canModerateContent: true,
        canAccessAdminPanel: true,
        canManageSystem: true
      };
    default:
      return getPermissions(UserRole.GUEST);
  }
};

// Token blacklist for revoked tokens
const tokenBlacklist = new Set<string>();

// Session management
const activeSessions = new Map<string, {
  userId: string;
  lastActivity: Date;
  tokenVersion: number;
}>();

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

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      throw new AppError(
        'Token has been revoked',
        401,
        'TOKEN_REVOKED'
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    // Validate token version for security
    const session = activeSessions.get(decoded.sessionId);
    if (!session || session.tokenVersion !== decoded.tokenVersion) {
      throw new AppError(
        'Token version mismatch - please login again',
        401,
        'TOKEN_VERSION_MISMATCH'
      );
    }

    // Update last activity
    session.lastActivity = new Date();
    
    // Add user info to request with permissions
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
      permissions: getPermissions(decoded.role),
      sessionId: decoded.sessionId,
      tokenVersion: decoded.tokenVersion,
    };

    logger.debug('User authenticated', {
      userId: decoded.id,
      email: decoded.email,
      role: decoded.role,
      sessionId: decoded.sessionId,
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
      permissions: getPermissions(decoded.role),
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

// Enhanced token generation with security features
export const generateTokens = (user: {
  id: string;
  email: string;
  username: string;
  role: UserRole;
}): { accessToken: string; refreshToken: string; sessionId: string } => {
  const sessionId = crypto.randomUUID();
  const tokenVersion = Date.now();
  const jti = crypto.randomUUID();

  // Create session
  activeSessions.set(sessionId, {
    userId: user.id,
    lastActivity: new Date(),
    tokenVersion,
  });

  // Generate access token
  const accessToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      sessionId,
      tokenVersion,
      jti,
    } as JWTPayload,
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
      issuer: 'diet-game-api',
      audience: 'diet-game-client',
    } as SignOptions
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    {
      id: user.id,
      sessionId,
      tokenVersion,
      jti,
    } as RefreshTokenPayload,
    config.jwt.refreshSecret,
    {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'diet-game-api',
      audience: 'diet-game-client',
    } as SignOptions
  );

  return { accessToken, refreshToken, sessionId };
};

// Revoke token and session
export const revokeToken = (token: string, sessionId?: string): void => {
  tokenBlacklist.add(token);
  
  if (sessionId) {
    activeSessions.delete(sessionId);
  }
};

// Revoke all user sessions
export const revokeAllUserSessions = (userId: string): void => {
  for (const [sessionId, session] of activeSessions.entries()) {
    if (session.userId === userId) {
      activeSessions.delete(sessionId);
    }
  }
};

// Password hashing utilities
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptRounds);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Enhanced role-based access control
export const requireRole = (roles: UserRole[]) => {
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
      logger.warn('Access denied - insufficient role', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: roles,
        requestId: req.id,
      });
      
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

// Permission-based access control
export const requirePermission = (permission: keyof UserPermissions) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      ));
      return;
    }

    if (!req.user.permissions[permission]) {
      logger.warn('Access denied - insufficient permission', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        requestId: req.id,
      });
      
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

// Multi-permission access control
export const requireAnyPermission = (permissions: (keyof UserPermissions)[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      ));
      return;
    }

    const hasPermission = permissions.some(permission => req.user!.permissions[permission]);
    
    if (!hasPermission) {
      logger.warn('Access denied - insufficient permissions', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredPermissions: permissions,
        userPermissions: req.user.permissions,
        requestId: req.id,
      });
      
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
        permissions: getPermissions(decoded.role),
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
