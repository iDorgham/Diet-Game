# API Framework Setup - Diet Game Project

## 📋 Overview

This document provides a comprehensive guide to the API Framework Setup for the Diet Game project, following the Sprint 7-8: Gamification Engine requirements. The setup includes a modern TypeScript Express.js backend with comprehensive middleware, security, and monitoring.

## 🏗️ Architecture Overview

### Technology Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ with connection pooling
- **Cache**: Redis 6+ for session and data caching
- **Authentication**: JWT with refresh tokens
- **Real-time**: Socket.IO for WebSocket connections
- **Documentation**: OpenAPI/Swagger 3.0
- **Testing**: Jest with Supertest
- **Monitoring**: Winston logging + Sentry error tracking

### Project Structure
```
backend/
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Data models and schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript type definitions
│   ├── database/        # Database connection and migrations
│   └── server.ts        # Main server entry point
├── dist/                # Compiled JavaScript output
├── docs/                # API documentation
├── logs/                # Application logs
├── uploads/             # File uploads
├── tests/               # Test files
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── env.example          # Environment variables template
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env with your database, Redis, and API keys

# Build TypeScript
npm run build

# Start development server
npm run dev

# Or start production server
npm start
```

### Environment Configuration
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/diet_game
DB_HOST=localhost
DB_PORT=5432
DB_NAME=diet_game
DB_USER=username
DB_PASSWORD=password

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d

# External APIs
GROK_API_KEY=your-grok-api-key
USDA_API_KEY=your-usda-api-key
EDAMAM_APP_ID=your-edamam-app-id
EDAMAM_APP_KEY=your-edamam-app-key
```

## 🔧 Core Features

### 1. TypeScript Configuration
- **Strict Type Checking**: Full type safety with strict TypeScript configuration
- **Path Mapping**: Clean imports with `@/` aliases
- **ESM Support**: Modern ES modules with Node.js compatibility
- **Source Maps**: Debugging support in development

### 2. Express.js Server
- **Modern Setup**: Express.js with TypeScript and ES modules
- **Middleware Stack**: Comprehensive middleware for security, logging, and validation
- **Error Handling**: Global error handling with custom error types
- **Graceful Shutdown**: Proper server shutdown handling

### 3. Security Features
- **Helmet**: Security headers and protection
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: Multiple rate limiters for different endpoint types
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request validation with Zod schemas
- **SQL Injection Protection**: Parameterized queries and validation

### 4. Database Integration
- **PostgreSQL**: Primary database with connection pooling
- **Redis**: Caching and session storage
- **Migrations**: Database schema versioning
- **Seeding**: Development data population
- **Connection Management**: Proper connection handling and cleanup

### 5. Real-time Features
- **Socket.IO**: WebSocket server for real-time updates
- **Event Broadcasting**: Real-time gamification updates
- **Connection Management**: User connection tracking
- **Room Management**: Channel-based communication

### 6. API Documentation
- **OpenAPI/Swagger**: Interactive API documentation
- **Auto-generation**: Documentation from code comments
- **Type Safety**: TypeScript integration with Swagger
- **Testing Interface**: Built-in API testing tools

## 📊 API Endpoints

### Authentication & User Management
```typescript
POST   /api/v1/auth/register     # User registration
POST   /api/v1/auth/login        # User login
POST   /api/v1/auth/refresh      # Token refresh
POST   /api/v1/auth/logout       # User logout
GET    /api/v1/users/profile     # Get user profile
PUT    /api/v1/users/profile     # Update user profile
```

### Gamification System
```typescript
GET    /api/v1/gamification/progress    # Get user progress
POST   /api/v1/gamification/xp          # Award XP
GET    /api/v1/gamification/level       # Get user level
POST   /api/v1/gamification/level-up    # Level up user
```

### Achievement System
```typescript
GET    /api/v1/achievements             # Get all achievements
GET    /api/v1/achievements/user        # Get user achievements
POST   /api/v1/achievements/unlock      # Unlock achievement
GET    /api/v1/achievements/progress    # Get achievement progress
```

### Quest System
```typescript
GET    /api/v1/quests                   # Get available quests
POST   /api/v1/quests/start             # Start quest
POST   /api/v1/quests/complete          # Complete quest
GET    /api/v1/quests/user              # Get user quests
```

### Leaderboard System
```typescript
GET    /api/v1/leaderboard              # Get leaderboard
GET    /api/v1/leaderboard/user         # Get user ranking
GET    /api/v1/leaderboard/category     # Get category leaderboard
```

### Nutrition Tracking
```typescript
POST   /api/v1/nutrition/log            # Log food item
GET    /api/v1/nutrition/history        # Get nutrition history
GET    /api/v1/nutrition/analytics      # Get nutrition analytics
POST   /api/v1/nutrition/goals          # Set nutrition goals
```

### AI Coach Integration
```typescript
POST   /api/v1/ai-coach/chat            # Chat with AI coach
GET    /api/v1/ai-coach/history         # Get chat history
POST   /api/v1/ai-coach/recommendations # Get meal recommendations
POST   /api/v1/ai-coach/feedback        # Provide feedback
```

### Social Features
```typescript
GET    /api/v1/social/friends           # Get friends list
POST   /api/v1/social/friends/request   # Send friend request
POST   /api/v1/social/friends/accept    # Accept friend request
GET    /api/v1/social/feed              # Get social feed
POST   /api/v1/social/posts             # Create post
```

## 🛡️ Security Implementation

### Authentication Flow
1. **User Registration**: Secure password hashing with bcrypt
2. **Login**: JWT token generation with expiration
3. **Token Refresh**: Secure refresh token mechanism
4. **Middleware**: Request authentication validation
5. **Logout**: Token invalidation and cleanup

### Rate Limiting Strategy
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **AI API**: 10 requests per minute
- **File Upload**: 50 uploads per hour
- **Custom Limits**: Configurable per endpoint

### Input Validation
- **Zod Schemas**: Type-safe request validation
- **Sanitization**: Input cleaning and normalization
- **Type Checking**: Runtime type validation
- **Error Handling**: Detailed validation error messages

## 📈 Monitoring & Logging

### Logging Strategy
- **Winston Logger**: Structured logging with multiple transports
- **Log Levels**: Error, Warn, Info, HTTP, Debug
- **File Rotation**: Automatic log file rotation
- **Request Tracking**: Request ID correlation
- **Error Tracking**: Sentry integration for error monitoring

### Performance Monitoring
- **Response Times**: Request duration tracking
- **Memory Usage**: Process memory monitoring
- **Database Queries**: Query performance tracking
- **Cache Hit Rates**: Redis cache performance
- **WebSocket Connections**: Real-time connection monitoring

## 🧪 Testing Strategy

### Test Types
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing
- **Load Tests**: Performance and scalability testing

### Test Configuration
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
├── fixtures/         # Test data
└── helpers/          # Test utilities
```

## 🚀 Deployment

### Development
```bash
# Start development server with hot reload
npm run dev

# Start with debugging
npm run dev:debug
```

### Production
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 API Documentation

### Swagger UI
- **URL**: `http://localhost:3000/api-docs`
- **Interactive**: Test endpoints directly
- **Schema**: Complete API schema documentation
- **Examples**: Request/response examples

### OpenAPI Specification
- **Format**: OpenAPI 3.0
- **Auto-generation**: From code comments
- **Type Safety**: TypeScript integration
- **Validation**: Schema validation

## 🔧 Development Tools

### Scripts
```bash
# Development
npm run dev              # Start development server
npm run dev:debug        # Start with debugging

# Building
npm run build            # Build TypeScript
npm run type-check       # Type checking only

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Database
npm run migrate          # Run migrations
npm run migrate:create   # Create migration
npm run seed             # Seed database

# Code Quality
npm run lint             # ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Prettier formatting
npm run format:check     # Check formatting

# Documentation
npm run docs:generate    # Generate API docs
npm run docs:serve       # Serve documentation
```

### VS Code Configuration
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## 🎯 Sprint 7-8 Integration

### Gamification Engine APIs
The API framework is specifically designed to support the Sprint 7-8 gamification engine requirements:

1. **XP System**: Endpoints for XP calculation and leveling
2. **Achievement System**: Achievement management and unlocking
3. **Quest System**: Quest creation, tracking, and completion
4. **Streak System**: Daily activity tracking and bonuses
5. **Virtual Economy**: Coin system and shop functionality
6. **Real-time Updates**: WebSocket integration for live updates
7. **Performance**: Optimized for <200ms response times
8. **Security**: Comprehensive security measures

### Database Schema
```sql
-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Achievement system
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  rarity VARCHAR(50),
  xp_reward INTEGER,
  coin_reward INTEGER,
  requirements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  unlocked_at TIMESTAMP DEFAULT NOW(),
  progress JSONB
);
```

## 🔗 Integration Points

### Frontend Integration
- **API Client**: Axios-based HTTP client
- **Authentication**: JWT token management
- **Real-time**: Socket.IO client integration
- **Error Handling**: Centralized error management
- **Type Safety**: Shared TypeScript types

### External Services
- **Grok AI**: AI coach integration
- **USDA Database**: Nutrition data
- **Edamam API**: Recipe and nutrition analysis
- **Spoonacular**: Food database
- **Firebase**: Authentication and storage

### Monitoring & Analytics
- **Sentry**: Error tracking and performance monitoring
- **Winston**: Structured logging
- **Prometheus**: Metrics collection
- **Grafana**: Dashboard visualization

## 📋 Next Steps

### Immediate Actions
1. **Environment Setup**: Configure all environment variables
2. **Database Setup**: Run migrations and seed data
3. **API Testing**: Test all endpoints with Postman/curl
4. **Frontend Integration**: Connect frontend to API
5. **Documentation**: Review and update API documentation

### Sprint 7-8 Tasks
1. **Gamification APIs**: Implement all gamification endpoints
2. **Real-time Updates**: Set up WebSocket connections
3. **Performance Testing**: Load testing and optimization
4. **Security Testing**: Penetration testing and validation
5. **Documentation**: Complete API documentation

### Future Enhancements
1. **GraphQL**: Add GraphQL endpoint for complex queries
2. **Microservices**: Split into microservices architecture
3. **Event Sourcing**: Implement event-driven architecture
4. **CQRS**: Command Query Responsibility Segregation
5. **Advanced Caching**: Redis cluster and cache strategies

---

*This API Framework Setup provides a solid foundation for the Diet Game project's backend infrastructure, specifically designed to support the Sprint 7-8 gamification engine requirements with modern TypeScript, comprehensive security, and scalable architecture.*
