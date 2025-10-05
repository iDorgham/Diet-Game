/**
 * Sentry Configuration
 * Error tracking and performance monitoring setup
 */

import * as Sentry from '@sentry/node';
import { config } from './environment';
import { logger } from './logger';

export const initializeSentry = (): void => {
  if (!config.monitoring.sentry.dsn) {
    logger.warn('Sentry DSN not provided, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn: config.monitoring.sentry.dsn,
    environment: config.nodeEnv,
    tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    profilesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    integrations: [
      // Enable HTTP calls tracing
      Sentry.httpIntegration(),
      // Enable Express.js tracing
      Sentry.expressIntegration(),
    ],
    beforeSend(event: any) {
      // Filter out certain errors in development
      if (config.nodeEnv === 'development') {
        // Don't send validation errors to Sentry in development
        if (event.exception?.values?.[0]?.type === 'ValidationError') {
          return null;
        }
      }
      return event;
    },
  });

  logger.info('Sentry initialized successfully');
};

export { Sentry };
