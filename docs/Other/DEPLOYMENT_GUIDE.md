# Diet Game - Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the Diet Game application across different environments, from development to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Build Process](#build-process)
5. [Deployment Options](#deployment-options)
6. [Environment Variables](#environment-variables)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18+ 
- npm or yarn
- Firebase CLI
- Docker (optional)
- Git

### Required Accounts
- Firebase project
- Vercel/Netlify account (for hosting)
- Sentry account (for error monitoring)

## Environment Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd diet-game
npm install
```

### 2. Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### 3. Install Vercel CLI (for Vercel deployment)
```bash
npm install -g vercel
vercel login
```

## Firebase Configuration

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "diet-game"
3. Enable Authentication (Anonymous)
4. Create Firestore database
5. Enable Storage (for user avatars)

### 2. Configure Firebase
```bash
# Initialize Firebase in project
firebase init

# Select services:
# - Firestore
# - Hosting
# - Functions (optional)
```

### 3. Firebase Security Rules

#### Firestore Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Progress data
    match /progress/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Completed tasks
    match /completedTasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Public tasks
    match /tasks/{taskId} {
      allow read: if true;
      allow write: if false; // Only admins can modify tasks
    }
    
    // Rate limiting
    match /rateLimits/{limitId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules
```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Build Process

### 1. Development Build
```bash
# Start development server
npm run dev

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### 2. Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 3. Build Optimization
```bash
# Analyze bundle size
npm run build -- --analyze

# Generate source maps for debugging
npm run build -- --sourcemap
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Deploy to Vercel
```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for automatic deployments
```

#### 2. Vercel Configuration
```json
// vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_FIREBASE_API_KEY": "@firebase-api-key",
    "VITE_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "VITE_FIREBASE_PROJECT_ID": "@firebase-project-id",
    "VITE_FIREBASE_STORAGE_BUCKET": "@firebase-storage-bucket",
    "VITE_FIREBASE_MESSAGING_SENDER_ID": "@firebase-messaging-sender-id",
    "VITE_FIREBASE_APP_ID": "@firebase-app-id",
    "VITE_GROK_API_KEY": "@grok-api-key"
  }
}
```

### Option 2: Netlify

#### 1. Deploy to Netlify
```bash
# Build the project
npm run build

# Deploy to Netlify
npx netlify deploy --prod --dir=dist
```

#### 2. Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_FIREBASE_API_KEY = "your-firebase-api-key"
  VITE_FIREBASE_AUTH_DOMAIN = "your-firebase-auth-domain"
  VITE_FIREBASE_PROJECT_ID = "your-firebase-project-id"
  VITE_FIREBASE_STORAGE_BUCKET = "your-firebase-storage-bucket"
  VITE_FIREBASE_MESSAGING_SENDER_ID = "your-firebase-messaging-sender-id"
  VITE_FIREBASE_APP_ID = "your-firebase-app-id"
  VITE_GROK_API_KEY = "your-grok-api-key"
```

### Option 3: Firebase Hosting

#### 1. Deploy to Firebase Hosting
```bash
# Build the project
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

#### 2. Firebase Hosting Configuration
```json
// firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Option 4: Docker Deployment

#### 1. Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  diet-game:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_FIREBASE_API_KEY=${FIREBASE_API_KEY}
      - VITE_FIREBASE_AUTH_DOMAIN=${FIREBASE_AUTH_DOMAIN}
      - VITE_FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - VITE_FIREBASE_STORAGE_BUCKET=${FIREBASE_STORAGE_BUCKET}
      - VITE_FIREBASE_MESSAGING_SENDER_ID=${FIREBASE_MESSAGING_SENDER_ID}
      - VITE_FIREBASE_APP_ID=${FIREBASE_APP_ID}
      - VITE_GROK_API_KEY=${GROK_API_KEY}
```

#### 3. Deploy with Docker
```bash
# Build and run
docker-compose up -d

# Or build and push to registry
docker build -t diet-game .
docker tag diet-game your-registry/diet-game:latest
docker push your-registry/diet-game:latest
```

## Environment Variables

### Required Variables
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# AI Services
VITE_GROK_API_KEY=your-grok-api-key

# Optional: Analytics
VITE_SENTRY_DSN=your-sentry-dsn
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### Environment-Specific Configuration

#### Development (.env.development)
```bash
VITE_APP_ENV=development
VITE_DEBUG=true
VITE_API_BASE_URL=http://localhost:3000
```

#### Production (.env.production)
```bash
VITE_APP_ENV=production
VITE_DEBUG=false
VITE_API_BASE_URL=https://api.dietgame.com
```

## Monitoring & Analytics

### 1. Sentry Error Monitoring
```typescript
// src/services/monitoring.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring
```typescript
// src/services/performance.ts
export const trackPerformance = (metric: string, value: number) => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('event', 'performance', {
      metric_name: metric,
      value: value
    });
  }
};
```

### 3. User Analytics
```typescript
// src/services/analytics.ts
export const trackUserAction = (action: string, properties?: any) => {
  if (import.meta.env.VITE_GOOGLE_ANALYTICS_ID) {
    gtag('event', action, properties);
  }
};
```

## CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Diet Game

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Firebase Connection Issues
```bash
# Check Firebase configuration
firebase projects:list
firebase use your-project-id
firebase deploy --only hosting
```

#### 3. Environment Variables Not Loading
```bash
# Check if variables are prefixed with VITE_
# Restart development server after adding new variables
npm run dev
```

#### 4. CORS Issues
```javascript
// Add to vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://your-api-domain.com',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

### Performance Optimization

#### 1. Bundle Analysis
```bash
# Install bundle analyzer
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... other plugins
    visualizer({
      filename: 'dist/stats.html',
      open: true
    })
  ]
});
```

#### 2. Code Splitting
```typescript
// Lazy load components
const HomePage = lazy(() => import('./pages/HomePage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
```

## Security Checklist

- [ ] Firebase security rules configured
- [ ] Environment variables secured
- [ ] HTTPS enabled in production
- [ ] Content Security Policy configured
- [ ] Rate limiting implemented
- [ ] Input validation on all forms
- [ ] Error messages don't expose sensitive data
- [ ] Dependencies updated regularly

## Post-Deployment

### 1. Health Checks
```bash
# Check if application is running
curl -f https://your-domain.com/health

# Check Firebase connectivity
curl -f https://your-domain.com/api/health
```

### 2. Performance Monitoring
- Monitor Core Web Vitals
- Track user engagement metrics
- Monitor error rates
- Check Firebase usage quotas

### 3. Backup Strategy
- Regular Firestore exports
- Environment variable backups
- Code repository backups
- Database snapshots

---

*This deployment guide is part of the Diet Game SDD documentation and should be updated as the application evolves.*
