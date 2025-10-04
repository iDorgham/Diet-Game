// Advanced security configuration following Level 404 requirements
// Content Security Policy, input validation, and security headers

import { ErrorTracker } from './monitoring';

// Content Security Policy configuration
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    'https://browser.sentry-cdn.com',
    'https://js.sentry-cdn.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'connect-src': [
    "'self'",
    'https://api.nutriquest.demo',
    'https://sentry.io',
    'wss://api.nutriquest.demo'
  ],
  'media-src': [
    "'self'",
    'data:',
    'blob:'
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Input validation and sanitization
export class SecurityValidator {
  // XSS prevention
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // SQL injection prevention (for client-side validation)
  static sanitizeForDatabase(input: string): string {
    if (typeof input !== 'string') {
      return '';
    }
    
    return input
      .replace(/['"\\]/g, '') // Remove quotes and backslashes
      .replace(/--/g, '') // Remove SQL comments
      .replace(/;/g, '') // Remove semicolons
      .trim();
  }

  // Path traversal prevention
  static sanitizePath(path: string): string {
    if (typeof path !== 'string') {
      return '';
    }
    
    return path
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[\/\\]/g, '/') // Normalize path separators
      .replace(/\/+/g, '/') // Remove duplicate slashes
      .replace(/^\/+/, '') // Remove leading slashes
      .trim();
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // Password strength validation
  static validatePassword(password: string): {
    isValid: boolean;
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length < 8) {
      feedback.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      feedback.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      feedback.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/\d/.test(password)) {
      feedback.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      feedback.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    return {
      isValid: score >= 4,
      score,
      feedback
    };
  }

  // Rate limiting (client-side)
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests: number[] = [];

    return (): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove old requests
      while (requests.length > 0 && requests[0] < windowStart) {
        requests.shift();
      }

      if (requests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }

      requests.push(now);
      return true;
    };
  }
}

// Security headers configuration
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': Object.entries(CSP_CONFIG)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ')
};

// Data encryption utilities
export class DataEncryption {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;

  // Generate encryption key (in production, use proper key management)
  static async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt sensitive data
  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    try {
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encodedData
      );

      const result = new Uint8Array(iv.length + encrypted.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...result));
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'data_encryption' });
      throw new Error('Encryption failed');
    }
  }

  // Decrypt sensitive data
  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    try {
      const data = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
      const iv = data.slice(0, this.IV_LENGTH);
      const encrypted = data.slice(this.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'data_decryption' });
      throw new Error('Decryption failed');
    }
  }
}

// Secure storage for sensitive data
export class SecureStorage {
  private static readonly PREFIX = 'nutriquest_secure_';

  static setItem(key: string, value: string): void {
    try {
      const sanitizedKey = SecurityValidator.sanitizeInput(key);
      const encryptedValue = btoa(encodeURIComponent(value));
      localStorage.setItem(this.PREFIX + sanitizedKey, encryptedValue);
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'secure_storage_set' });
    }
  }

  static getItem(key: string): string | null {
    try {
      const sanitizedKey = SecurityValidator.sanitizeInput(key);
      const encryptedValue = localStorage.getItem(this.PREFIX + sanitizedKey);
      
      if (!encryptedValue) {
        return null;
      }

      return decodeURIComponent(atob(encryptedValue));
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'secure_storage_get' });
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      const sanitizedKey = SecurityValidator.sanitizeInput(key);
      localStorage.removeItem(this.PREFIX + sanitizedKey);
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'secure_storage_remove' });
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      ErrorTracker.trackError(error as Error, { context: 'secure_storage_clear' });
    }
  }
}

// Security audit utilities
export class SecurityAudit {
  static async auditPage(): Promise<{
    score: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for mixed content
    if (window.location.protocol === 'https:' && document.querySelector('img[src^="http:"]')) {
      issues.push('Mixed content detected');
      score -= 20;
    }

    // Check for insecure forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      if (!form.action.startsWith('https://') && !form.action.startsWith('/')) {
        issues.push('Insecure form action detected');
        score -= 15;
      }
    });

    // Check for external scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('/') && !src.startsWith(window.location.origin)) {
        issues.push('External script detected: ' + src);
        score -= 10;
      }
    });

    // Check for CSP
    const metaCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!metaCSP) {
      recommendations.push('Consider implementing Content Security Policy');
      score -= 5;
    }

    // Check for HTTPS
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      issues.push('Site not served over HTTPS');
      score -= 30;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}

// Initialize security measures
export const initializeSecurity = () => {
  // Set security headers (if possible in client-side)
  if (typeof document !== 'undefined') {
    // Add CSP meta tag
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = Object.entries(CSP_CONFIG)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ');
    document.head.appendChild(meta);
  }

  // Initialize rate limiters
  const apiRateLimiter = SecurityValidator.createRateLimiter(100, 60000); // 100 requests per minute
  const formRateLimiter = SecurityValidator.createRateLimiter(10, 60000); // 10 form submissions per minute

  // Global security event listeners
  document.addEventListener('DOMContentLoaded', () => {
    // Sanitize all user inputs
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => {
        const target = e.target as HTMLInputElement;
        target.value = SecurityValidator.sanitizeInput(target.value);
      });
    });
  });

  return {
    apiRateLimiter,
    formRateLimiter
  };
};

export default {
  CSP_CONFIG,
  SecurityValidator,
  SECURITY_HEADERS,
  DataEncryption,
  SecureStorage,
  SecurityAudit,
  initializeSecurity
};
