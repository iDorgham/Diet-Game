/**
 * Diet Game API Server
 * Enhanced TypeScript Express.js server with comprehensive middleware and services
 * Following Sprint 7-8: Gamification Engine requirements
 */

import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer, Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import configuration
import { config } from './config/environment.js';
import { logger } from './config/logger.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { validateAuth } from './middleware/auth.js';
import { rateLimiter, authRateLimiter, aiRateLimiter, uploadRateLimiter } from './middleware/rateLimiter.js';
import { corsOptions } from './config/cors.js';
import { securityValidation, sanitizeInput, validateNoSQLInjection, validateSecurityHeaders } from './middleware/validation.js';
import { gdprCompliance, requireConsent } from './middleware/gdpr.js';
// import { securityAudit, auditAuthentication, auditAuthorization, detectSuspiciousActivity } from './middleware/securityAudit.js';
import { securityConfig, securityHeaders } from './config/security.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gamificationRoutes from './routes/gamification.js';
import achievementRoutes from './routes/achievements.js';
import questRoutes from './routes/quests.js';
import leaderboardRoutes from './routes/leaderboard.js';
import nutritionRoutes from './routes/nutrition.js';
import aiCoachRoutes from './routes/ai-coach.js';
import socialRoutes from './routes/social.js';
import securityRoutes from './routes/security.js';

// Import services
import { initializeDatabase } from './database/connection.js';
import { initializeRedis } from './services/cache.js';
import { initializeWebSocket } from './services/websocket.js';
import { initializeSentry } from './config/sentry.js';

// Load environment variables
dotenv.config();

class DietGameServer {
  private app: Application;
  private server: HttpServer;
  private io: SocketIOServer;
  private port: number;
  private swaggerSpecs: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.port = config.port;
    
    // Initialize Socket.IO
    this.io = new SocketIOServer(this.server, {
      cors: corsOptions,
      pingTimeout: config.ws.pingTimeout,
      pingInterval: config.ws.pingInterval,
    });

    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSwagger();
  }

  private initializeMiddleware(): void {
    // Enhanced security middleware with comprehensive protection
    this.app.use(helmet({
      contentSecurityPolicy: securityConfig.helmet.contentSecurityPolicy,
      crossOriginEmbedderPolicy: securityConfig.helmet.crossOriginEmbedderPolicy,
      hsts: securityConfig.helmet.hsts,
    }));

    // Add custom security headers
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      next();
    });

    // CORS middleware
    this.app.use(cors(corsOptions));

    // GDPR compliance middleware
    this.app.use(gdprCompliance);

    // Security audit logging
    // this.app.use(securityAudit);

    // Comprehensive input validation and sanitization
    this.app.use(securityValidation);

    // Suspicious activity detection
    // this.app.use(detectSuspiciousActivity);

    // Rate limiting with different tiers
    this.app.use('/api/', rateLimiter);
    this.app.use('/api/v1/auth/', authRateLimiter);
    this.app.use('/api/v1/ai-coach/', aiRateLimiter);
    this.app.use('/api/v1/upload/', uploadRateLimiter);

    // Body parsing middleware with security
    this.app.use(express.json({ 
      limit: securityConfig.fileUpload.maxSize,
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: securityConfig.fileUpload.maxSize 
    }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (config.nodeEnv !== 'test') {
      this.app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
    }
    this.app.use(requestLogger);

    // Request ID middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = req.headers['x-request-id'] as string || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      res.setHeader('X-Request-ID', req.id);
      next();
    });

    // Authentication and authorization audit
    // this.app.use(auditAuthentication);
    // this.app.use(auditAuthorization);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', this.healthCheck.bind(this));

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/users', validateAuth, userRoutes);
    this.app.use('/api/v1/gamification', validateAuth, gamificationRoutes);
    this.app.use('/api/v1/achievements', validateAuth, achievementRoutes);
    this.app.use('/api/v1/quests', validateAuth, questRoutes);
    this.app.use('/api/v1/leaderboard', validateAuth, leaderboardRoutes);
    this.app.use('/api/v1/nutrition', validateAuth, nutritionRoutes);
    this.app.use('/api/v1/ai-coach', validateAuth, aiCoachRoutes);
    this.app.use('/api/v1/social', validateAuth, socialRoutes);
    this.app.use('/api/v1/security', securityRoutes);

    // API documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(this.getSwaggerSpecs()));
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'ROUTE_NOT_FOUND',
          message: `Cannot ${req.method} ${req.originalUrl}`,
          details: 'The requested endpoint does not exist'
        },
        timestamp: new Date().toISOString(),
        requestId: req.id
      });
    });

    // Global error handler (must be last)
    this.app.use(errorHandler);
  }

  private initializeSwagger(): void {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: config.api.title,
          version: config.api.version,
          description: config.api.description,
          contact: {
            name: config.api.contactName,
            email: config.api.contactEmail,
            url: config.api.contactUrl,
          },
        },
        servers: [
          {
            url: `http://localhost:${this.port}/api/v1`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: ['./src/routes/*.ts', './src/models/*.ts'],
    };

    this.swaggerSpecs = swaggerJsdoc(swaggerOptions);
  }

  private getSwaggerSpecs() {
    return this.swaggerSpecs;
  }

  private healthCheck(req: Request, res: Response): void {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: config.nodeEnv,
      memory: process.memoryUsage(),
      pid: process.pid,
      requestId: req.id
    };

    res.status(200).json(healthData);
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize Sentry for error tracking
      if (config.monitoring.sentry.dsn) {
        initializeSentry();
        logger.info('✅ Sentry initialized');
      }

      // Initialize database
      await initializeDatabase();
      logger.info('✅ Database connected successfully');

      // Initialize Redis cache
      await initializeRedis();
      logger.info('✅ Redis cache connected successfully');

      // Initialize WebSocket
      initializeWebSocket(this.io);
      logger.info('✅ WebSocket server initialized');

    } catch (error) {
      logger.error('❌ Failed to initialize services:', error);
      throw error;
    }
  }

  public async start(): Promise<void> {
    try {
      // Initialize all services
      await this.initializeServices();

      // Start HTTP server
      this.server.listen(this.port, () => {
        logger.info(`🚀 Diet Game API server running on port ${this.port}`);
        logger.info(`📊 Health check: http://localhost:${this.port}/health`);
        logger.info(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
        logger.info(`🎮 Gamification API: http://localhost:${this.port}/api/v1/gamification`);
        logger.info(`🌍 Environment: ${config.nodeEnv}`);
        logger.info(`🔧 Node.js version: ${process.version}`);
      });

      // Graceful shutdown handlers
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully`);
      
      this.server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 30 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  }

  public getApp(): Application {
    return this.app;
  }

  public getServer(): HttpServer {
    return this.server;
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

// Create and start server
const server = new DietGameServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export { server };
export default server;
