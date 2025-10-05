/**
 * Express Type Extensions
 * Extended type definitions for Express Request and Response objects
 */

import { UserRole, UserPermissions } from '@/middleware/auth';

declare global {
  namespace Express {
    interface Request {
      // User authentication data
      user?: {
        id: string;
        email: string;
        username: string;
        role: UserRole;
        permissions: UserPermissions;
        sessionId?: string;
        tokenVersion?: number;
      };
      
      // Request tracking
      id: string;
      
      // Raw body for webhook processing
      rawBody?: Buffer;
      
      // Request metadata
      startTime?: number;
      requestId?: string;
    }
  }
}

export {};
