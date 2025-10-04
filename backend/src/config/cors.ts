/**
 * CORS Configuration
 * Cross-Origin Resource Sharing setup for the Diet Game API
 */

import { config } from './environment';
import { CorsOptions } from 'cors';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.frontend.corsOrigin,
      config.frontend.url,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:5173',
      'http://localhost:5174',
    ];

    // In development, allow all localhost origins
    if (config.nodeEnv === 'development') {
      if (origin?.includes('localhost') || origin?.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject origin
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};
