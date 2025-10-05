/**
 * Security Audit Logging Middleware
 * Comprehensive security event logging and monitoring
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from './errorHandler';
import { maskSensitiveData } from './encryption';

// Security event types
export enum SecurityEventType {
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  AUTHORIZATION_SUCCESS = 'authorization_success',
  AUTHORIZATION_FAILURE = 'authorization_failure',
  TOKEN_GENERATED = 'token_generated',
  TOKEN_REVOKED = 'token_revoked',
  TOKEN_EXPIRED = 'token_expired',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET_REQUESTED = 'password_reset_requested',
  PASSWORD_RESET_COMPLETED = 'password_reset_completed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  DATA_DELETION = 'data_deletion',
  FILE_UPLOAD = 'file_upload',
  FILE_DOWNLOAD = 'file_download',
  API_ACCESS = 'api_access',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',
  PRIVILEGE_ESCALATION_ATTEMPT = 'privilege_escalation_attempt',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  MALICIOUS_FILE_UPLOAD = 'malicious_file_upload',
  UNUSUAL_LOCATION_ACCESS = 'unusual_location_access',
  UNUSUAL_TIME_ACCESS = 'unusual_time_access',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_WITHDRAWN = 'consent_withdrawn',
  DATA_EXPORT = 'data_export',
  DATA_ERASURE = 'data_erasure',
  SYSTEM_ERROR = 'system_error',
  CONFIGURATION_CHANGE = 'configuration_change',
}

// Security event severity levels
export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Security event interface
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  timestamp: Date;
  userId?: string | undefined;
  sessionId?: string | undefined;
  ipAddress: string;
  userAgent?: string | undefined;
  requestId?: string | undefined;
  endpoint?: string | undefined;
  method?: string | undefined;
  statusCode?: number | undefined;
  message: string;
  details?: any;
  riskScore?: number | undefined;
  location?: {
    country?: string | undefined;
    region?: string | undefined;
    city?: string | undefined;
    coordinates?: {
      lat: number;
      lng: number;
    } | undefined;
  } | undefined;
  device?: {
    type?: string | undefined;
    os?: string | undefined;
    browser?: string | undefined;
    version?: string | undefined;
  } | undefined;
}

// Security audit logger class
class SecurityAuditLogger {
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory

  // Log security event
  logEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Add to in-memory store
    this.events.push(securityEvent);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to application logger with appropriate level
    const logLevel = this.getLogLevel(securityEvent.severity);
    const logData = this.sanitizeLogData(securityEvent);

    logger[logLevel](`Security Event: ${securityEvent.type}`, logData);

    // TODO: Send to external security monitoring system
    // TODO: Store in database for long-term retention
    // TODO: Send alerts for critical events
  }

  // Get appropriate log level based on severity
  private getLogLevel(severity: SecurityEventSeverity): 'info' | 'warn' | 'error' {
    switch (severity) {
      case SecurityEventSeverity.LOW:
        return 'info';
      case SecurityEventSeverity.MEDIUM:
        return 'warn';
      case SecurityEventSeverity.HIGH:
      case SecurityEventSeverity.CRITICAL:
        return 'error';
      default:
        return 'info';
    }
  }

  // Sanitize log data to remove sensitive information
  private sanitizeLogData(event: SecurityEvent): any {
    const sanitized = { ...event };
    
    // Mask sensitive data in details
    if (sanitized.details) {
      sanitized.details = this.maskSensitiveFields(sanitized.details);
    }

    return sanitized;
  }

  // Mask sensitive fields in object
  private maskSensitiveFields(obj: any): any {
    if (typeof obj === 'string') {
      return maskSensitiveData(obj, 'generic');
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.maskSensitiveFields(item));
    } else if (obj && typeof obj === 'object') {
      const masked: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isSensitiveField(key)) {
          masked[key] = maskSensitiveData(String(value), 'generic');
        } else {
          masked[key] = this.maskSensitiveFields(value);
        }
      }
      return masked;
    }
    return obj;
  }

  // Check if field contains sensitive data
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      'password', 'token', 'secret', 'key', 'email', 'phone', 'ssn',
      'creditCard', 'bankAccount', 'address', 'name', 'username'
    ];
    
    return sensitiveFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  // Get recent security events
  getRecentEvents(limit: number = 100): SecurityEvent[] {
    return this.events.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: SecurityEventType, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.type === type)
      .slice(-limit);
  }

  // Get events by severity
  getEventsBySeverity(severity: SecurityEventSeverity, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.severity === severity)
      .slice(-limit);
  }

  // Get events for user
  getUserEvents(userId: string, limit: number = 100): SecurityEvent[] {
    return this.events
      .filter(event => event.userId === userId)
      .slice(-limit);
  }

  // Calculate risk score for user
  calculateUserRiskScore(userId: string): number {
    const userEvents = this.getUserEvents(userId, 1000);
    let riskScore = 0;

    for (const event of userEvents) {
      switch (event.severity) {
        case SecurityEventSeverity.LOW:
          riskScore += 1;
          break;
        case SecurityEventSeverity.MEDIUM:
          riskScore += 5;
          break;
        case SecurityEventSeverity.HIGH:
          riskScore += 10;
          break;
        case SecurityEventSeverity.CRITICAL:
          riskScore += 20;
          break;
      }
    }

    return Math.min(riskScore, 100); // Cap at 100
  }
}

// Global security audit logger instance
const securityAuditLogger = new SecurityAuditLogger();

// Security audit middleware
export const securityAudit = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Log API access
    securityAuditLogger.logEvent({
      type: SecurityEventType.API_ACCESS,
      severity: SecurityEventSeverity.LOW,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      requestId: req.id,
      endpoint: req.path,
      method: req.method,
      message: `API access to ${req.method} ${req.path}`,
      details: {
        query: req.query,
        headers: sanitizeHeaders(req.headers),
      },
    });

    // Monitor response
    const originalSend = res.send;
    res.send = function(body: any) {
      // Log response
      securityAuditLogger.logEvent({
        type: SecurityEventType.API_ACCESS,
        severity: res.statusCode >= 400 ? SecurityEventSeverity.MEDIUM : SecurityEventSeverity.LOW,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent'),
        requestId: req.id,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        message: `API response for ${req.method} ${req.path}`,
        details: {
          statusCode: res.statusCode,
          responseSize: body ? body.length : 0,
        },
      });

      return originalSend.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('Security audit middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Sanitize headers for logging
function sanitizeHeaders(headers: any): any {
  const sanitized: any = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
  
  for (const [key, value] of Object.entries(headers)) {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

// Authentication audit middleware
export const auditAuthentication = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const originalJson = res.json;
    res.json = function(body: any) {
      // Log authentication events
      if (req.path.includes('/auth/login') && res.statusCode === 200) {
        securityAuditLogger.logEvent({
          type: SecurityEventType.AUTHENTICATION_SUCCESS,
          severity: SecurityEventSeverity.LOW,
          userId: body.data?.user?.id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          message: 'User authentication successful',
          details: {
            username: body.data?.user?.username,
            loginMethod: 'password',
          },
        });
      } else if (req.path.includes('/auth/login') && res.statusCode >= 400) {
        securityAuditLogger.logEvent({
          type: SecurityEventType.AUTHENTICATION_FAILURE,
          severity: SecurityEventSeverity.MEDIUM,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          message: 'User authentication failed',
          details: {
            reason: body.message || 'Unknown error',
            email: req.body?.email ? maskSensitiveData(req.body.email, 'email') : undefined,
          },
        });
      }

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('Authentication audit middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Authorization audit middleware
export const auditAuthorization = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const originalJson = res.json;
    res.json = function(body: any) {
      // Log authorization failures
      if (res.statusCode === 403) {
        securityAuditLogger.logEvent({
          type: SecurityEventType.AUTHORIZATION_FAILURE,
          severity: SecurityEventSeverity.MEDIUM,
          userId: req.user?.id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          message: 'Authorization failed',
          details: {
            userRole: req.user?.role,
            requiredPermissions: body.details?.errors,
          },
        });
      } else if (res.statusCode === 401) {
        securityAuditLogger.logEvent({
          type: SecurityEventType.AUTHORIZATION_FAILURE,
          severity: SecurityEventSeverity.MEDIUM,
          userId: req.user?.id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          message: 'Authentication required',
          details: {
            reason: body.message || 'Missing or invalid token',
          },
        });
      }

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    logger.error('Authorization audit middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Data access audit middleware
export const auditDataAccess = (dataType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const originalJson = res.json;
      res.json = function(body: any) {
        // Log data access
        securityAuditLogger.logEvent({
          type: SecurityEventType.DATA_ACCESS,
          severity: SecurityEventSeverity.LOW,
          userId: req.user?.id,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent'),
          requestId: req.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          message: `Data access: ${dataType}`,
          details: {
            dataType,
            recordCount: Array.isArray(body.data) ? body.data.length : 1,
            filters: req.query,
          },
        });

        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Data access audit middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
      next();
    }
  };
};

// Suspicious activity detection
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i,
      /<script/i,
      /<\/script/i,
      /union.*select/i,
      /drop.*table/i,
      /delete.*from/i,
      /insert.*into/i,
      /update.*set/i,
    ];

    const checkSuspiciousContent = (obj: any, path: string = ''): void => {
      if (typeof obj === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(obj)) {
            securityAuditLogger.logEvent({
              type: SecurityEventType.SUSPICIOUS_ACTIVITY,
              severity: SecurityEventSeverity.HIGH,
              userId: req.user?.id,
              ipAddress: req.ip || 'unknown',
              userAgent: req.get('User-Agent'),
              requestId: req.id,
              endpoint: req.path,
              method: req.method,
              message: `Suspicious content detected in ${path}`,
              details: {
                pattern: pattern.toString(),
                content: maskSensitiveData(obj, 'generic'),
                path,
              },
              riskScore: 75,
            });
            break;
          }
        }
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkSuspiciousContent(item, `${path}[${index}]`);
        });
      } else if (obj && typeof obj === 'object') {
        for (const [key, value] of Object.entries(obj)) {
          checkSuspiciousContent(value, path ? `${path}.${key}` : key);
        }
      }
    };

    checkSuspiciousContent(req.body, 'body');
    checkSuspiciousContent(req.query, 'query');
    checkSuspiciousContent(req.params, 'params');

    next();
  } catch (error) {
    logger.error('Suspicious activity detection error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Security audit endpoints
export const securityAuditEndpoints = {
  // Get security events
  getSecurityEvents: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { type, severity, userId, limit = 100 } = req.query;
      
      let events: SecurityEvent[];
      
      if (type) {
        events = securityAuditLogger.getEventsByType(type as SecurityEventType, Number(limit));
      } else if (severity) {
        events = securityAuditLogger.getEventsBySeverity(severity as SecurityEventSeverity, Number(limit));
      } else if (userId) {
        events = securityAuditLogger.getUserEvents(userId as string, Number(limit));
      } else {
        events = securityAuditLogger.getRecentEvents(Number(limit));
      }

      res.json({
        success: true,
        data: { events },
        message: 'Security events retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user risk score
  getUserRiskScore: (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { userId } = req.params;
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
          timestamp: new Date().toISOString(),
          requestId: req.id,
        });
        return;
      }
      const riskScore = securityAuditLogger.calculateUserRiskScore(userId);

      res.json({
        success: true,
        data: { userId, riskScore },
        message: 'User risk score calculated successfully',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default {
  securityAudit,
  auditAuthentication,
  auditAuthorization,
  auditDataAccess,
  detectSuspiciousActivity,
  securityAuditEndpoints,
  securityAuditLogger,
  SecurityEventType,
  SecurityEventSeverity,
};
