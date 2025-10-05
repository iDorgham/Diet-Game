// Main server entry point for Diet Game Gamification Backend
// Following Sprint 7-8: Core Backend Development

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Import routes
import gamificationRoutes from './routes/gamification.js';
import userRoutes from './routes/users.js';
import achievementRoutes from './routes/achievements.js';
import questRoutes from './routes/quests.js';
import leaderboardRoutes from './routes/leaderboard.js';
import socialRoutes from './routes/social.js';
import socialRecommendationRoutes from './routes/socialRecommendations.js';
import enhancedRecommendationRoutes from './routes/enhancedRecommendations.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { validateAuth } from './middleware/auth.js';

// Import services
import { initializeDatabase } from './database/connection.js';
import { initializeRedis } from './services/cache.js';
import { initializeWebSocket } from './services/websocket.js';

// Import advanced caching and performance services
import { advancedCachingService } from './services/advancedCachingService.js';
import { 
  requestOptimization, 
  responseCompression, 
  advancedCaching, 
  connectionPooling 
} from './middleware/advancedPerformanceMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Advanced performance middleware
app.use(requestOptimization());
app.use(responseCompression());
app.use(connectionPooling());

// Advanced caching middleware for API routes
app.use('/api/', advancedCaching({
  ttl: 300, // 5 minutes default
  allowAuthenticated: true,
  vary: ['Accept-Encoding', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Advanced cache health check endpoint
app.get('/health/cache', async (req, res) => {
  try {
    const cacheHealth = await advancedCachingService.healthCheck();
    const cacheStats = advancedCachingService.getCacheStats();
    
    res.status(200).json({
      status: 'healthy',
      cache: cacheHealth,
      stats: cacheStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Cache warming endpoint
app.post('/admin/cache/warm', async (req, res) => {
  try {
    const warmingStrategies = {
      user_recommendations: { 
        userIds: [1, 2, 3], 
        recommendationTypes: ['friends', 'teams'] 
      },
      leaderboard_data: { 
        leaderboardTypes: ['global', 'team'] 
      }
    };
    
    const warmed = await advancedCachingService.warmCache(warmingStrategies);
    
    res.status(200).json({
      success: true,
      warmed,
      strategies: Object.keys(warmingStrategies),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/gamification', gamificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/social/recommendations', socialRecommendationRoutes);
app.use('/api/enhanced-recommendations', enhancedRecommendationRoutes);

// WebSocket initialization
initializeWebSocket(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // Initialize Redis cache
    await initializeRedis();
    console.log('✅ Redis cache connected successfully');

    // Initialize advanced caching service
    console.log('🔄 Initializing advanced caching service...');
    await advancedCachingService.initializeCluster();
    console.log('✅ Advanced caching service initialized');

    // Warm cache with frequently accessed data
    console.log('🔥 Warming cache with initial data...');
    const warmingStrategies = {
      user_recommendations: { 
        userIds: [1, 2, 3], 
        recommendationTypes: ['friends', 'teams'] 
      },
      leaderboard_data: { 
        leaderboardTypes: ['global', 'team'] 
      }
    };
    
    const warmed = await advancedCachingService.warmCache(warmingStrategies);
    console.log(`✅ Cache warmed with ${warmed} entries`);

    // Start HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 Gamification API server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🗄️ Cache health: http://localhost:${PORT}/health/cache`);
      console.log(`🔥 Cache warming: POST http://localhost:${PORT}/admin/cache/warm`);
      console.log(`🎮 Gamification API: http://localhost:${PORT}/api/gamification`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Advanced caching: ENABLED`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, server, io };
