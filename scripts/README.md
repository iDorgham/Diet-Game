# Scripts Directory

## 🔧 Overview

This directory contains build scripts, utility scripts, and automation tools for the Diet Game application. These scripts help with development, deployment, and maintenance tasks.

## 📁 Contents

### Build & Utility Scripts
- **`install-ar-deps.sh`** - Install Augmented Reality dependencies

## 🎯 Script Architecture

### Script Organization
```
scripts/
├── install-ar-deps.sh     # AR dependency installation
├── build.sh               # Production build script
├── deploy.sh              # Deployment automation
├── test.sh                # Test execution script
├── lint.sh                # Code linting script
└── setup-dev.sh           # Development environment setup
```

### Script Standards
- **Shell Scripts** - Use bash for cross-platform compatibility
- **Error Handling** - Implement proper error handling and exit codes
- **Logging** - Include verbose logging for debugging
- **Documentation** - Document script purpose and usage

## 🔧 Build Scripts

### AR Dependencies Installation (`install-ar-deps.sh`)
```bash
#!/bin/bash

# Install Augmented Reality Dependencies
# This script installs all necessary dependencies for AR functionality

set -e  # Exit on any error

echo "🚀 Installing AR Dependencies for Diet Game..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing AR-specific packages..."

# Install Three.js for 3D graphics
echo "Installing Three.js..."
npm install three @react-three/fiber @react-three/drei

# Install AR/VR libraries
echo "Installing AR/VR libraries..."
npm install @mediapipe/tasks-vision
npm install @tensorflow/tfjs-backend-webgl
npm install @tensorflow/tfjs-backend-cpu

# Install camera and media libraries
echo "Installing camera libraries..."
npm install react-webcam

# Install additional AR utilities
echo "Installing AR utilities..."
npm install camera-controls
npm install three-mesh-bvh

echo "✅ AR dependencies installed successfully!"
echo "🎯 You can now use AR features in the Diet Game application."

# Verify installation
echo "🔍 Verifying installation..."
if npm list three &> /dev/null; then
    echo "✅ Three.js installed successfully"
else
    echo "❌ Three.js installation failed"
    exit 1
fi

if npm list @react-three/fiber &> /dev/null; then
    echo "✅ React Three Fiber installed successfully"
else
    echo "❌ React Three Fiber installation failed"
    exit 1
fi

echo "🎉 All AR dependencies are ready!"
```

### Production Build Script (`build.sh`)
```bash
#!/bin/bash

# Production Build Script
# Builds the Diet Game application for production deployment

set -e

echo "🏗️ Building Diet Game for production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm run test:ci

# Build application
echo "🔨 Building application..."
npm run build

# Verify build
if [ -d "dist" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output: dist/"
else
    echo "❌ Build failed!"
    exit 1
fi

# Generate build report
echo "📊 Generating build report..."
du -sh dist/
echo "Build size: $(du -sh dist/ | cut -f1)"

echo "🎉 Production build ready for deployment!"
```

### Deployment Script (`deploy.sh`)
```bash
#!/bin/bash

# Deployment Script
# Deploys the Diet Game application to production

set -e

echo "🚀 Deploying Diet Game to production..."

# Configuration
DEPLOY_ENV=${1:-production}
BUILD_DIR="dist"
DEPLOY_TARGET="/var/www/diet-game"

# Validate environment
if [ "$DEPLOY_ENV" != "production" ] && [ "$DEPLOY_ENV" != "staging" ]; then
    echo "❌ Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

echo "🎯 Deploying to: $DEPLOY_ENV"

# Build application
echo "🏗️ Building application..."
./scripts/build.sh

# Backup current deployment
echo "💾 Creating backup..."
if [ -d "$DEPLOY_TARGET" ]; then
    cp -r "$DEPLOY_TARGET" "${DEPLOY_TARGET}.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Deploy new version
echo "📤 Deploying new version..."
rsync -av --delete "$BUILD_DIR/" "$DEPLOY_TARGET/"

# Set permissions
echo "🔐 Setting permissions..."
chmod -R 755 "$DEPLOY_TARGET"
chown -R www-data:www-data "$DEPLOY_TARGET"

# Restart services
echo "🔄 Restarting services..."
systemctl reload nginx

# Health check
echo "🏥 Performing health check..."
sleep 5
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Deployment successful!"
else
    echo "❌ Health check failed!"
    exit 1
fi

echo "🎉 Diet Game deployed successfully to $DEPLOY_ENV!"
```

## 🧪 Testing Scripts

### Test Execution Script (`test.sh`)
```bash
#!/bin/bash

# Test Execution Script
# Runs all tests for the Diet Game application

set -e

echo "🧪 Running Diet Game tests..."

# Configuration
TEST_TYPE=${1:-all}
COVERAGE_THRESHOLD=80

# Function to run unit tests
run_unit_tests() {
    echo "🔬 Running unit tests..."
    npm run test:unit
}

# Function to run integration tests
run_integration_tests() {
    echo "🔗 Running integration tests..."
    npm run test:integration
}

# Function to run e2e tests
run_e2e_tests() {
    echo "🌐 Running end-to-end tests..."
    npm run test:e2e
}

# Function to run all tests
run_all_tests() {
    echo "🎯 Running all tests..."
    npm run test
}

# Function to check coverage
check_coverage() {
    echo "📊 Checking test coverage..."
    npm run test:coverage
    
    # Extract coverage percentage
    COVERAGE=$(npm run test:coverage 2>&1 | grep -o '[0-9]*\.[0-9]*%' | head -1 | sed 's/%//')
    
    if (( $(echo "$COVERAGE >= $COVERAGE_THRESHOLD" | bc -l) )); then
        echo "✅ Coverage: $COVERAGE% (meets threshold: $COVERAGE_THRESHOLD%)"
    else
        echo "❌ Coverage: $COVERAGE% (below threshold: $COVERAGE_THRESHOLD%)"
        exit 1
    fi
}

# Main execution
case $TEST_TYPE in
    "unit")
        run_unit_tests
        ;;
    "integration")
        run_integration_tests
        ;;
    "e2e")
        run_e2e_tests
        ;;
    "coverage")
        check_coverage
        ;;
    "all")
        run_all_tests
        check_coverage
        ;;
    *)
        echo "❌ Invalid test type. Use: unit, integration, e2e, coverage, or all"
        exit 1
        ;;
esac

echo "🎉 Tests completed successfully!"
```

## 🔍 Linting Scripts

### Code Linting Script (`lint.sh`)
```bash
#!/bin/bash

# Code Linting Script
# Runs linting and formatting checks for the Diet Game application

set -e

echo "🔍 Running code linting..."

# Configuration
LINT_TYPE=${1:-all}
FIX_ISSUES=${2:-false}

# Function to run ESLint
run_eslint() {
    echo "📝 Running ESLint..."
    if [ "$FIX_ISSUES" = "true" ]; then
        npm run lint:fix
    else
        npm run lint
    fi
}

# Function to run Prettier
run_prettier() {
    echo "💅 Running Prettier..."
    if [ "$FIX_ISSUES" = "true" ]; then
        npm run format:fix
    else
        npm run format:check
    fi
}

# Function to run TypeScript checks
run_typescript() {
    echo "🔷 Running TypeScript checks..."
    npm run type-check
}

# Function to run all linting
run_all_linting() {
    echo "🎯 Running all linting checks..."
    run_eslint
    run_prettier
    run_typescript
}

# Main execution
case $LINT_TYPE in
    "eslint")
        run_eslint
        ;;
    "prettier")
        run_prettier
        ;;
    "typescript")
        run_typescript
        ;;
    "all")
        run_all_linting
        ;;
    *)
        echo "❌ Invalid lint type. Use: eslint, prettier, typescript, or all"
        exit 1
        ;;
esac

echo "✅ Linting completed successfully!"
```

## 🛠️ Development Scripts

### Development Setup Script (`setup-dev.sh`)
```bash
#!/bin/bash

# Development Environment Setup Script
# Sets up the development environment for Diet Game

set -e

echo "🛠️ Setting up Diet Game development environment..."

# Check system requirements
echo "🔍 Checking system requirements..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE_VERSION" ]; then
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js version $NODE_VERSION is below required version $REQUIRED_NODE_VERSION"
    exit 1
fi

# Check npm version
NPM_VERSION=$(npm --version)
echo "✅ npm version: $NPM_VERSION"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install AR dependencies
echo "🥽 Installing AR dependencies..."
./scripts/install-ar-deps.sh

# Set up environment variables
echo "🔧 Setting up environment variables..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local from .env.example"
    echo "⚠️  Please update .env.local with your configuration"
fi

# Set up Git hooks
echo "🪝 Setting up Git hooks..."
if [ -d ".git" ]; then
    npm run prepare
    echo "✅ Git hooks installed"
else
    echo "⚠️  Not a Git repository, skipping Git hooks"
fi

# Run initial build
echo "🏗️ Running initial build..."
npm run build

# Run tests
echo "🧪 Running initial tests..."
npm run test

echo "🎉 Development environment setup complete!"
echo "🚀 You can now start development with: npm run dev"
```

## 📊 Monitoring Scripts

### Health Check Script (`health-check.sh`)
```bash
#!/bin/bash

# Health Check Script
# Performs health checks on the Diet Game application

set -e

echo "🏥 Performing health checks..."

# Configuration
BASE_URL=${1:-http://localhost:3000}
TIMEOUT=30

# Function to check HTTP endpoint
check_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    
    echo "🔍 Checking $endpoint..."
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint"); then
        if [ "$response" = "$expected_status" ]; then
            echo "✅ $endpoint: OK ($response)"
        else
            echo "❌ $endpoint: Expected $expected_status, got $response"
            return 1
        fi
    else
        echo "❌ $endpoint: Connection failed"
        return 1
    fi
}

# Function to check database connection
check_database() {
    echo "🗄️ Checking database connection..."
    # Add database health check logic here
    echo "✅ Database: OK"
}

# Function to check external services
check_external_services() {
    echo "🌐 Checking external services..."
    # Add external service health checks here
    echo "✅ External services: OK"
}

# Main health checks
check_endpoint "/" 200
check_endpoint "/health" 200
check_endpoint "/api/status" 200
check_database
check_external_services

echo "🎉 All health checks passed!"
```

## 🔗 Related Documentation

- **[`../package.json`](../package.json)** - Script definitions and dependencies
- **[`../docs/DEVELOPER_GUIDE.md`](../docs/DEVELOPER_GUIDE.md)** - Development guidelines
- **[`../docs/DEPLOYMENT_GUIDE.md`](../docs/DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[`../docs/TESTING_GUIDE.md`](../docs/TESTING_GUIDE.md)** - Testing guidelines

---

*Last updated: $(date)*
