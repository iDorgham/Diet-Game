// Production monitoring and error tracking following Level 404 requirements
// Sentry integration with custom performance monitoring

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { useNutriStore } from '../store/nutriStore';

// Initialize Sentry for production monitoring
export const initializeMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN || 'https://demo@sentry.io/demo',
      environment: process.env.NODE_ENV,
      integrations: [
        new BrowserTracing({
          // Set sampling rate for performance monitoring
          tracingOrigins: ['localhost', /^https:\/\/api\.nutriquest\.demo/],
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      // Error Monitoring
      sampleRate: 1.0, // 100% of errors
      // Release tracking
      release: process.env.REACT_APP_VERSION || '1.0.0',
      // User context
      beforeSend(event) {
        // Add custom context
        const state = useNutriStore.getState();
        event.user = {
          id: 'demo-user-id',
          username: state.userProfile.userName,
          level: state.progress.level,
        };
        event.tags = {
          ...event.tags,
          dietType: state.userProfile.dietType,
          bodyType: state.userProfile.bodyType,
        };
        return event;
      },
    });
  }
};

// Custom error tracking
export class ErrorTracker {
  static trackError(error: Error, context?: Record<string, any>) {
    console.error('Error tracked:', error);
    
    Sentry.withScope((scope) => {
      if (context) {
        Object.keys(context).forEach(key => {
          scope.setContext(key, context[key]);
        });
      }
      Sentry.captureException(error);
    });
  }

  static trackUserAction(action: string, properties?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: action,
      category: 'user-action',
      level: 'info',
      data: properties,
    });
  }

  static trackPerformance(operation: string, duration: number, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Performance: ${operation}`,
      category: 'performance',
      level: 'info',
      data: {
        duration,
        ...metadata,
      },
    });
  }

  static trackBusinessMetric(metric: string, value: number, context?: Record<string, any>) {
    Sentry.addBreadcrumb({
      message: `Business Metric: ${metric}`,
      category: 'business',
      level: 'info',
      data: {
        metric,
        value,
        ...context,
      },
    });
  }
}

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  static endTimer(operation: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`Timer for operation "${operation}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operation);

    // Track performance
    ErrorTracker.trackPerformance(operation, duration, metadata);

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    this.startTimer(operation);
    return fn()
      .then(result => {
        this.endTimer(operation, { ...metadata, success: true });
        return result;
      })
      .catch(error => {
        this.endTimer(operation, { ...metadata, success: false, error: error.message });
        throw error;
      });
  }
}

// Business metrics tracking
export class BusinessMetrics {
  static trackTaskCompletion(taskType: string, rewards: any, streak: number) {
    ErrorTracker.trackBusinessMetric('task_completed', 1, {
      taskType,
      rewards,
      streak,
      timestamp: Date.now(),
    });
  }

  static trackLevelUp(newLevel: number, bonusCoins: number) {
    ErrorTracker.trackBusinessMetric('level_up', newLevel, {
      bonusCoins,
      timestamp: Date.now(),
    });
  }

  static trackUserEngagement(action: string, duration?: number) {
    ErrorTracker.trackBusinessMetric('user_engagement', 1, {
      action,
      duration,
      timestamp: Date.now(),
    });
  }

  static trackFeatureUsage(feature: string, context?: Record<string, any>) {
    ErrorTracker.trackBusinessMetric('feature_usage', 1, {
      feature,
      ...context,
      timestamp: Date.now(),
    });
  }
}

// Health check monitoring
export class HealthMonitor {
  private static healthChecks: Map<string, () => Promise<boolean>> = new Map();
  private static isHealthy = true;

  static registerHealthCheck(name: string, check: () => Promise<boolean>) {
    this.healthChecks.set(name, check);
  }

  static async runHealthChecks(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [name, check] of this.healthChecks) {
      try {
        results[name] = await check();
      } catch (error) {
        console.error(`Health check "${name}" failed:`, error);
        results[name] = false;
      }
    }

    this.isHealthy = Object.values(results).every(Boolean);
    return results;
  }

  static getHealthStatus(): boolean {
    return this.isHealthy;
  }

  static async startPeriodicHealthChecks(intervalMs: number = 60000) {
    setInterval(async () => {
      const results = await this.runHealthChecks();
      if (!this.isHealthy) {
        ErrorTracker.trackError(
          new Error('Health check failed'),
          { healthCheckResults: results }
        );
      }
    }, intervalMs);
  }
}

// Custom Sentry components
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    ErrorTracker.trackUserAction(action, properties);
  };

  const trackFeatureUsage = (feature: string, context?: Record<string, any>) => {
    BusinessMetrics.trackFeatureUsage(feature, context);
  };

  const measureOperation = <T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> => {
    return PerformanceMonitor.measureAsync(operation, fn, metadata);
  };

  return {
    trackUserAction,
    trackFeatureUsage,
    measureOperation,
  };
};

// Initialize health checks
export const initializeHealthChecks = () => {
  // API health check
  HealthMonitor.registerHealthCheck('api', async () => {
    try {
      const response = await fetch('/api/health', { 
        method: 'GET',
        timeout: 5000 
      });
      return response.ok;
    } catch {
      return false;
    }
  });

  // Local storage health check
  HealthMonitor.registerHealthCheck('localStorage', async () => {
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      return true;
    } catch {
      return false;
    }
  });

  // Network connectivity check
  HealthMonitor.registerHealthCheck('network', async () => {
    return navigator.onLine;
  });

  // Start periodic health checks
  HealthMonitor.startPeriodicHealthChecks();
};

export default {
  initializeMonitoring,
  ErrorTracker,
  PerformanceMonitor,
  BusinessMetrics,
  HealthMonitor,
  SentryErrorBoundary,
  usePerformanceMonitoring,
  initializeHealthChecks,
};
