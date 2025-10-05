/**
 * Environment Configuration
 * Centralized configuration management for the Diet Game API
 */

import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  nodeEnv: string;
  port: number;
  database: {
    url: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  redis: {
    url: string;
    host: string;
    port: number;
    password?: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  firebase: {
    projectId: string;
    privateKeyId: string;
    privateKey: string;
    clientEmail: string;
    clientId: string;
    authUri: string;
    tokenUri: string;
  };
  externalApis: {
    grok: {
      apiKey: string;
      apiUrl: string;
    };
    usda: {
      apiKey: string;
    };
    edamam: {
      appId: string;
      appKey: string;
    };
    spoonacular: {
      apiKey: string;
    };
  };
  frontend: {
    url: string;
    corsOrigin: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    authMaxRequests: number;
    aiMaxRequests: number;
  };
  upload: {
    maxFileSize: number;
    uploadPath: string;
    allowedFileTypes: string[];
  };
  email: {
    smtp: {
      host: string;
      port: number;
      user: string;
      pass: string;
    };
    from: {
      email: string;
      name: string;
    };
  };
  logging: {
    level: string;
    file: string;
    maxSize: string;
    maxFiles: string;
  };
  monitoring: {
    sentry: {
      dsn?: string;
    };
    prometheus: {
      port: number;
    };
  };
  ws: {
    corsOrigin: string;
    pingTimeout: number;
    pingInterval: number;
  };
  cache: {
    ttl: number;
    maxKeys: number;
  };
  security: {
    bcryptRounds: number;
    sessionSecret: string;
    encryptionKey: string;
  };
  api: {
    docsPath: string;
    version: string;
    title: string;
    description: string;
    contactName: string;
    contactEmail: string;
    contactUrl: string;
  };
}

const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    url: process.env.DATABASE_URL || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'diet_game',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    clientId: process.env.FIREBASE_CLIENT_ID || '',
    authUri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
    tokenUri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  },
  
  externalApis: {
    grok: {
      apiKey: process.env.GROK_API_KEY || '',
      apiUrl: process.env.GROK_API_URL || 'https://api.grok.com/v1',
    },
    usda: {
      apiKey: process.env.USDA_API_KEY || '',
    },
    edamam: {
      appId: process.env.EDAMAM_APP_ID || '',
      appKey: process.env.EDAMAM_APP_KEY || '',
    },
    spoonacular: {
      apiKey: process.env.SPOONACULAR_API_KEY || '',
    },
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    authMaxRequests: parseInt(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS || '5', 10),
    aiMaxRequests: parseInt(process.env.RATE_LIMIT_AI_MAX_REQUESTS || '10', 10),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
  },
  
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    from: {
      email: process.env.FROM_EMAIL || 'noreply@dietgame.com',
      name: process.env.FROM_NAME || 'Diet Game',
    },
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '5',
  },
  
  monitoring: {
    sentry: {
      ...(process.env.SENTRY_DSN && { dsn: process.env.SENTRY_DSN }),
    },
    prometheus: {
      port: parseInt(process.env.PROMETHEUS_PORT || '9090', 10),
    },
  },
  
  ws: {
    corsOrigin: process.env.WS_CORS_ORIGIN || 'http://localhost:5173',
    pingTimeout: parseInt(process.env.WS_PING_TIMEOUT || '60000', 10),
    pingInterval: parseInt(process.env.WS_PING_INTERVAL || '25000', 10),
  },
  
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '10000', 10),
  },
  
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    encryptionKey: process.env.ENCRYPTION_KEY || 'your-32-character-encryption-key',
  },
  
  api: {
    docsPath: process.env.API_DOCS_PATH || '/api-docs',
    version: process.env.API_VERSION || 'v1',
    title: process.env.API_TITLE || 'Diet Game API',
    description: process.env.API_DESCRIPTION || 'Gamified Diet Planning API',
    contactName: process.env.API_CONTACT_NAME || 'API Support',
    contactEmail: process.env.API_CONTACT_EMAIL || 'support@dietgame.com',
    contactUrl: process.env.API_CONTACT_URL || 'https://dietgame.com/support',
  },
};

// Validation
const requiredEnvVars = [
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL',
  'REDIS_URL',
];

if (config.nodeEnv === 'production') {
  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  });
}

export { config };
export default config;
