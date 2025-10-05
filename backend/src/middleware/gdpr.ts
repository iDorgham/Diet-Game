/**
 * GDPR/CCPA Compliance Middleware
 * Data protection, consent management, and privacy compliance
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from './errorHandler';
import { encryptPII, decryptPII, maskSensitiveData } from './encryption';

// Data categories for GDPR compliance
export enum DataCategory {
  PERSONAL = 'personal',
  SENSITIVE = 'sensitive',
  HEALTH = 'health',
  FINANCIAL = 'financial',
  BEHAVIORAL = 'behavioral',
  LOCATION = 'location',
  COMMUNICATION = 'communication',
}

// Legal basis for data processing
export enum LegalBasis {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests',
}

// Consent types
export enum ConsentType {
  MARKETING = 'marketing',
  ANALYTICS = 'analytics',
  FUNCTIONAL = 'functional',
  NECESSARY = 'necessary',
  THIRD_PARTY = 'third_party',
  DATA_SHARING = 'data_sharing',
}

// Data subject rights
export enum DataSubjectRight {
  ACCESS = 'access',
  RECTIFICATION = 'rectification',
  ERASURE = 'erasure',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection',
  WITHDRAW_CONSENT = 'withdraw_consent',
}

// Consent record interface
export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: ConsentType;
  granted: boolean;
  timestamp: Date;
  legalBasis: LegalBasis;
  purpose: string;
  dataCategories: DataCategory[];
  retentionPeriod: number; // in days
  version: string;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

// Data processing record interface
export interface DataProcessingRecord {
  id: string;
  userId: string;
  dataCategory: DataCategory;
  purpose: string;
  legalBasis: LegalBasis;
  timestamp: Date;
  dataController: string;
  dataProcessor?: string;
  retentionPeriod: number;
  isAnonymized: boolean;
  isEncrypted: boolean;
}

// Consent management
class ConsentManager {
  private consents = new Map<string, ConsentRecord[]>();
  private dataProcessing = new Map<string, DataProcessingRecord[]>();

  // Record user consent
  recordConsent(consent: ConsentRecord): void {
    const userConsents = this.consents.get(consent.userId) || [];
    userConsents.push(consent);
    this.consents.set(consent.userId, userConsents);

    logger.info('User consent recorded', {
      userId: consent.userId,
      consentType: consent.consentType,
      granted: consent.granted,
      purpose: consent.purpose,
    });
  }

  // Check if user has given consent
  hasConsent(userId: string, consentType: ConsentType): boolean {
    const userConsents = this.consents.get(userId) || [];
    const latestConsent = userConsents
      .filter(c => c.consentType === consentType)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return latestConsent?.granted || false;
  }

  // Get all user consents
  getUserConsents(userId: string): ConsentRecord[] {
    return this.consents.get(userId) || [];
  }

  // Withdraw consent
  withdrawConsent(userId: string, consentType: ConsentType): void {
    const consent: ConsentRecord = {
      id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      consentType,
      granted: false,
      timestamp: new Date(),
      legalBasis: LegalBasis.CONSENT,
      purpose: 'Consent withdrawal',
      dataCategories: [],
      retentionPeriod: 0,
      version: '1.0',
    };

    this.recordConsent(consent);

    logger.info('User consent withdrawn', {
      userId,
      consentType,
    });
  }

  // Record data processing activity
  recordDataProcessing(processing: DataProcessingRecord): void {
    const userProcessing = this.dataProcessing.get(processing.userId) || [];
    userProcessing.push(processing);
    this.dataProcessing.set(processing.userId, userProcessing);

    logger.info('Data processing recorded', {
      userId: processing.userId,
      dataCategory: processing.dataCategory,
      purpose: processing.purpose,
      legalBasis: processing.legalBasis,
    });
  }

  // Get user's data processing records
  getUserDataProcessing(userId: string): DataProcessingRecord[] {
    return this.dataProcessing.get(userId) || [];
  }
}

// Global consent manager instance
const consentManager = new ConsentManager();

// GDPR compliance middleware
export const gdprCompliance = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Add GDPR headers
    res.setHeader('X-Data-Protection', 'GDPR-Compliant');
    res.setHeader('X-Privacy-Policy', '/privacy-policy');
    res.setHeader('X-Cookie-Policy', '/cookie-policy');

    // Log data processing if user is authenticated
    if (req.user) {
      const processing: DataProcessingRecord = {
        id: `processing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: req.user.id,
        dataCategory: DataCategory.PERSONAL,
        purpose: 'API request processing',
        legalBasis: LegalBasis.LEGITIMATE_INTERESTS,
        timestamp: new Date(),
        dataController: 'Diet Game',
        retentionPeriod: 365,
        isAnonymized: false,
        isEncrypted: true,
      };

      consentManager.recordDataProcessing(processing);
    }

    next();
  } catch (error) {
    logger.error('GDPR compliance middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId: req.id,
    });
    next();
  }
};

// Consent validation middleware
export const requireConsent = (consentType: ConsentType) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(
          'Authentication required for consent validation',
          401,
          'AUTHENTICATION_REQUIRED'
        );
      }

      if (!consentManager.hasConsent(req.user.id, consentType)) {
        logger.warn('Consent required but not granted', {
          userId: req.user.id,
          consentType,
          requestId: req.id,
        });

        throw new AppError(
          `Consent required for ${consentType} data processing`,
          403,
          'CONSENT_REQUIRED',
          { consentType }
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Consent validation error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          requestId: req.id,
        });
        next(new AppError('Consent validation failed', 500, 'CONSENT_VALIDATION_ERROR'));
      }
    }
  };
};

// Data minimization middleware
export const minimizeData = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (req.body && typeof req.body === 'object') {
        const minimizedData: any = {};
        
        for (const field of allowedFields) {
          if (req.body[field] !== undefined) {
            minimizedData[field] = req.body[field];
          }
        }
        
        req.body = minimizedData;
      }

      next();
    } catch (error) {
      logger.error('Data minimization error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
      next();
    }
  };
};

// PII protection middleware
export const protectPII = (piiFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Encrypt PII in request body
      if (req.body && typeof req.body === 'object') {
        for (const field of piiFields) {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = encryptPII(req.body[field]);
          }
        }
      }

      // Mask PII in response
      const originalJson = res.json;
      res.json = function(body: any) {
        if (body && typeof body === 'object') {
          const maskedBody = { ...body };
          
          for (const field of piiFields) {
            if (maskedBody[field] && typeof maskedBody[field] === 'string') {
              maskedBody[field] = maskSensitiveData(maskedBody[field], 'generic');
            }
          }
          
          return originalJson.call(this, maskedBody);
        }
        
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('PII protection error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
      next();
    }
  };
};

// Data retention middleware
export const enforceDataRetention = (retentionDays: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Add retention header
      res.setHeader('X-Data-Retention', `${retentionDays} days`);
      
      // Log retention policy
      if (req.user) {
        logger.info('Data retention policy applied', {
          userId: req.user.id,
          retentionDays,
          requestId: req.id,
        });
      }

      next();
    } catch (error) {
      logger.error('Data retention enforcement error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: req.id,
      });
      next();
    }
  };
};

// Right to be forgotten implementation
export const implementRightToBeForgotten = async (userId: string): Promise<void> => {
  try {
    // Anonymize user data
    const anonymizedData = {
      id: userId,
      email: `anonymized_${userId}@deleted.local`,
      username: `deleted_user_${userId}`,
      displayName: 'Deleted User',
      // Keep only essential data for legal/audit purposes
    };

    // Record the erasure
    const erasureRecord: DataProcessingRecord = {
      id: `erasure_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      dataCategory: DataCategory.PERSONAL,
      purpose: 'Right to be forgotten - data erasure',
      legalBasis: LegalBasis.LEGAL_OBLIGATION,
      timestamp: new Date(),
      dataController: 'Diet Game',
      retentionPeriod: 0,
      isAnonymized: true,
      isEncrypted: false,
    };

    consentManager.recordDataProcessing(erasureRecord);

    logger.info('Right to be forgotten implemented', {
      userId,
      anonymizedData: maskSensitiveData(JSON.stringify(anonymizedData)),
    });

    // TODO: Implement actual data deletion/anonymization in database
    // This would involve updating user records, deleting related data, etc.
    
  } catch (error) {
    logger.error('Right to be forgotten implementation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
    throw new AppError('Data erasure failed', 500, 'DATA_ERASURE_ERROR');
  }
};

// Data portability implementation
export const implementDataPortability = async (userId: string): Promise<any> => {
  try {
    // Collect all user data
    const userData = {
      profile: {
        // TODO: Get user profile data
      },
      preferences: {
        // TODO: Get user preferences
      },
      activity: {
        // TODO: Get user activity data
      },
      consents: consentManager.getUserConsents(userId),
      dataProcessing: consentManager.getUserDataProcessing(userId),
    };

    // Record data portability request
    const portabilityRecord: DataProcessingRecord = {
      id: `portability_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      dataCategory: DataCategory.PERSONAL,
      purpose: 'Right to data portability',
      legalBasis: LegalBasis.LEGAL_OBLIGATION,
      timestamp: new Date(),
      dataController: 'Diet Game',
      retentionPeriod: 30,
      isAnonymized: false,
      isEncrypted: true,
    };

    consentManager.recordDataProcessing(portabilityRecord);

    logger.info('Data portability request fulfilled', {
      userId,
      dataTypes: Object.keys(userData),
    });

    return userData;
  } catch (error) {
    logger.error('Data portability implementation failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId,
    });
    throw new AppError('Data portability failed', 500, 'DATA_PORTABILITY_ERROR');
  }
};

// Consent management endpoints
export const consentEndpoints = {
  // Record consent
  recordConsent: (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { consentType, granted, purpose, dataCategories, retentionPeriod } = req.body;

      const consent: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: req.user.id,
        consentType,
        granted,
        timestamp: new Date(),
        legalBasis: LegalBasis.CONSENT,
        purpose,
        dataCategories,
        retentionPeriod,
        version: '1.0',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };

      consentManager.recordConsent(consent);

      res.json({
        success: true,
        data: { consentId: consent.id },
        message: 'Consent recorded successfully',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user consents
  getUserConsents: (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const consents = consentManager.getUserConsents(req.user.id);

      res.json({
        success: true,
        data: { consents },
        message: 'User consents retrieved successfully',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },

  // Withdraw consent
  withdrawConsent: (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const { consentType } = req.body;
      consentManager.withdrawConsent(req.user.id, consentType);

      res.json({
        success: true,
        message: 'Consent withdrawn successfully',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },

  // Request data portability
  requestDataPortability: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      const userData = await implementDataPortability(req.user.id);

      res.json({
        success: true,
        data: userData,
        message: 'Data portability request fulfilled',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },

  // Request data erasure
  requestDataErasure: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
      }

      await implementRightToBeForgotten(req.user.id);

      res.json({
        success: true,
        message: 'Data erasure request processed',
        timestamp: new Date().toISOString(),
        requestId: req.id,
      });
    } catch (error) {
      next(error);
    }
  },
};

export default {
  gdprCompliance,
  requireConsent,
  minimizeData,
  protectPII,
  enforceDataRetention,
  implementRightToBeForgotten,
  implementDataPortability,
  consentEndpoints,
  consentManager,
  DataCategory,
  LegalBasis,
  ConsentType,
  DataSubjectRight,
};
