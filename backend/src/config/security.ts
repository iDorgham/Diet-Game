/**
 * Security Configuration
 * Centralized security settings and policies
 */

import { config } from './environment';

// Security configuration interface
export interface SecurityConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
    saltLength: number;
    rounds: number;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxLength: number;
    historyCount: number;
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    name: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    authMaxRequests: number;
    aiMaxRequests: number;
    uploadMaxRequests: number;
    strictWindowMs: number;
    strictMaxRequests: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };
  helmet: {
    contentSecurityPolicy: {
      directives: Record<string, string[]>;
    };
    crossOriginEmbedderPolicy: boolean;
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
    maxFiles: number;
    scanForMalware: boolean;
  };
  audit: {
    logLevel: 'low' | 'medium' | 'high' | 'all';
    retentionDays: number;
    alertThreshold: number;
  };
  gdpr: {
    dataRetentionDays: number;
    consentRequired: boolean;
    anonymizeOnDelete: boolean;
    allowDataExport: boolean;
  };
  monitoring: {
    enableRealTimeAlerts: boolean;
    alertChannels: string[];
    escalationLevels: {
      low: string[];
      medium: string[];
      high: string[];
      critical: string[];
    };
  };
}

// Security configuration
export const securityConfig: SecurityConfig = {
  jwt: {
    secret: config.jwt.secret,
    expiresIn: config.jwt.expiresIn,
    refreshSecret: config.jwt.refreshSecret,
    refreshExpiresIn: config.jwt.refreshExpiresIn,
    issuer: 'diet-game-api',
    audience: 'diet-game-client',
  },
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 32,
    rounds: 100000,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxLength: 128,
    historyCount: 5,
  },
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    sameSite: 'strict',
    name: 'diet_game_session',
  },
  rateLimit: {
    windowMs: config.rateLimit.windowMs,
    maxRequests: config.rateLimit.maxRequests,
    authMaxRequests: config.rateLimit.authMaxRequests,
    aiMaxRequests: config.rateLimit.aiMaxRequests,
    uploadMaxRequests: 50,
    strictWindowMs: 15 * 60 * 1000, // 15 minutes
    strictMaxRequests: 5,
  },
  cors: {
    origin: config.frontend.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Request-ID',
      'X-API-Key',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-Rate-Limit-Limit',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
    ],
    maxAge: 86400, // 24 hours
  },
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "ws:", "wss:", "https:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  },
  fileUpload: {
    maxSize: config.upload.maxFileSize,
    allowedTypes: config.upload.allowedFileTypes,
    maxFiles: 10,
    scanForMalware: true,
  },
  audit: {
    logLevel: 'all',
    retentionDays: 90,
    alertThreshold: 10,
  },
  gdpr: {
    dataRetentionDays: 2555, // 7 years
    consentRequired: true,
    anonymizeOnDelete: true,
    allowDataExport: true,
  },
  monitoring: {
    enableRealTimeAlerts: true,
    alertChannels: ['email', 'slack', 'webhook'],
    escalationLevels: {
      low: ['email'],
      medium: ['email', 'slack'],
      high: ['email', 'slack', 'webhook'],
      critical: ['email', 'slack', 'webhook', 'sms'],
    },
  },
};

// Security policies
export const securityPolicies = {
  // Password policy
  passwordPolicy: {
    minLength: securityConfig.password.minLength,
    maxLength: securityConfig.password.maxLength,
    requireUppercase: securityConfig.password.requireUppercase,
    requireLowercase: securityConfig.password.requireLowercase,
    requireNumbers: securityConfig.password.requireNumbers,
    requireSymbols: securityConfig.password.requireSymbols,
    forbiddenPasswords: [
      'password',
      '123456',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'user',
      'guest',
    ],
  },

  // Session policy
  sessionPolicy: {
    maxAge: securityConfig.session.maxAge,
    secure: securityConfig.session.secure,
    httpOnly: securityConfig.session.httpOnly,
    sameSite: securityConfig.session.sameSite,
    regenerateOnLogin: true,
    regenerateOnRoleChange: true,
  },

  // Rate limiting policy
  rateLimitPolicy: {
    general: {
      windowMs: securityConfig.rateLimit.windowMs,
      maxRequests: securityConfig.rateLimit.maxRequests,
    },
    authentication: {
      windowMs: securityConfig.rateLimit.windowMs,
      maxRequests: securityConfig.rateLimit.authMaxRequests,
    },
    ai: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: securityConfig.rateLimit.aiMaxRequests,
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: securityConfig.rateLimit.uploadMaxRequests,
    },
  },

  // Data protection policy
  dataProtectionPolicy: {
    encryption: {
      atRest: true,
      inTransit: true,
      keyRotation: 90, // days
    },
    anonymization: {
      enabled: true,
      method: 'k-anonymity',
      kValue: 3,
    },
    retention: {
      userData: securityConfig.gdpr.dataRetentionDays,
      auditLogs: securityConfig.audit.retentionDays,
      sessionData: 30, // days
    },
  },

  // Access control policy
  accessControlPolicy: {
    defaultRole: 'user',
    roleHierarchy: ['guest', 'user', 'premium', 'moderator', 'admin', 'super_admin'],
    permissionInheritance: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    maxConcurrentSessions: 5,
  },

  // Monitoring policy
  monitoringPolicy: {
    logAllRequests: true,
    logSensitiveData: false,
    realTimeAlerts: securityConfig.monitoring.enableRealTimeAlerts,
    alertThresholds: {
      failedLogins: 5,
      suspiciousActivity: 3,
      rateLimitExceeded: 10,
      dataAccess: 100,
    },
  },
};

// Security headers
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'X-Data-Protection': 'GDPR-Compliant',
  'X-Privacy-Policy': '/privacy-policy',
  'X-Cookie-Policy': '/cookie-policy',
  'X-Security-Policy': 'Comprehensive',
};

// Security validation functions
export const securityValidators = {
  // Validate password strength
  validatePassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const policy = securityPolicies.passwordPolicy;

    if (password.length < policy.minLength) {
      errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (password.length > policy.maxLength) {
      errors.push(`Password must be no more than ${policy.maxLength} characters long`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (policy.requireSymbols && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (policy.forbiddenPasswords.includes(password.toLowerCase())) {
      errors.push('Password is too common and not allowed');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  // Validate username format
  validateUsername: (username: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 50) {
      errors.push('Username must be no more than 50 characters long');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // Validate file upload
  validateFileUpload: (file: Express.Multer.File): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const policy = securityConfig.fileUpload;

    if (file.size > policy.maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${policy.maxSize} bytes`);
    }

    if (!policy.allowedTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    // Check for malicious file extensions
    const maliciousExtensions = ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (maliciousExtensions.includes(fileExtension)) {
      errors.push(`File extension ${fileExtension} is not allowed`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

export default {
  securityConfig,
  securityPolicies,
  securityHeaders,
  securityValidators,
};
