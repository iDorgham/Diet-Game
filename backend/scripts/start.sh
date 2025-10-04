#!/bin/bash

# Diet Game Gamification Backend Startup Script
# Sprint 7-8: Core Backend Development

echo "🚀 Starting Diet Game Gamification Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Copying from env.example..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Check if PostgreSQL is running (optional check)
if command -v pg_isready &> /dev/null; then
    if ! pg_isready -h localhost -p 5432 &> /dev/null; then
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL before running the backend."
        echo "   You can continue without PostgreSQL for development, but some features won't work."
    fi
fi

# Check if Redis is running (optional check)
if command -v redis-cli &> /dev/null; then
    if ! redis-cli ping &> /dev/null; then
        echo "⚠️  Redis is not running. Caching features will be disabled."
        echo "   You can continue without Redis, but performance may be affected."
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Set environment
export NODE_ENV=${NODE_ENV:-development}

echo "🌍 Environment: $NODE_ENV"
echo "🔧 Starting server..."

# Start the server
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting in production mode..."
    npm start
else
    echo "🛠️  Starting in development mode..."
    npm run dev
fi
