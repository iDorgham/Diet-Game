# Redis Setup Guide for Diet Game Backend

This guide will help you set up Redis for the Diet Game backend to enable caching functionality and resolve connection issues.

## 🚀 Quick Setup

### 1. Install Redis on Windows

#### Option A: Using Chocolatey (Recommended)
```bash
# Install Chocolatey if you don't have it
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Redis
choco install redis-64
```

#### Option B: Manual Download
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Extract the files to `C:\Redis`
3. Add `C:\Redis` to your system PATH

### 2. Start Redis Server

```bash
# Start Redis server (default port 6379)
redis-server

# Or start with custom config
redis-server --port 6379 --maxmemory 256mb
```

### 3. Configure Environment Variables

Create or update your `.env` file in the backend directory:

```bash
# Copy the example file
cp env.example .env
```

Then update the Redis configuration in your `.env` file:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 4. Test Redis Connection

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Test with your backend
npm run dev
```

## 🔧 Configuration Options

### Redis URL Format
```env
# Basic connection
REDIS_URL=redis://localhost:6379

# With password
REDIS_URL=redis://:password@localhost:6379

# With database number
REDIS_URL=redis://localhost:6379/0

# With all options
REDIS_URL=redis://:password@localhost:6379/0
```

### Environment Variables
```env
# Individual Redis settings (used if REDIS_URL is not set)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_here
REDIS_DB=0
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Redis Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
- Make sure Redis server is running: `redis-server`
- Check if port 6379 is available: `netstat -an | findstr 6379`
- Try starting Redis on a different port: `redis-server --port 6380`

#### 2. Redis Not Found
```
'redis-server' is not recognized as an internal or external command
```

**Solution:**
- Install Redis using Chocolatey: `choco install redis-64`
- Or add Redis to your PATH environment variable
- Or use the full path to redis-server

#### 3. Permission Issues
```
Error: Permission denied
```

**Solution:**
- Run PowerShell as Administrator
- Check Redis installation permissions
- Ensure Redis data directory is writable

### Redis Server Management

#### Start Redis as Windows Service
```bash
# Install Redis as a service
redis-server --service-install --service-name Redis

# Start the service
redis-server --service-start --service-name Redis

# Stop the service
redis-server --service-stop --service-name Redis

# Uninstall the service
redis-server --service-uninstall --service-name Redis
```

#### Redis Configuration File
Create `redis.conf` in your Redis directory:

```conf
# Redis configuration for Diet Game
port 6379
bind 127.0.0.1
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

Start Redis with config:
```bash
redis-server redis.conf
```

## 📊 Monitoring Redis

### Redis CLI Commands
```bash
# Connect to Redis CLI
redis-cli

# Check Redis info
INFO

# Monitor Redis commands in real-time
MONITOR

# Check memory usage
INFO memory

# List all keys
KEYS *

# Check Redis performance
redis-benchmark -q -n 1000
```

### Redis Desktop Manager
For a GUI interface, consider installing Redis Desktop Manager:
- Download from: https://github.com/uglide/RedisDesktopManager
- Connect to `localhost:6379`

## 🚀 Production Considerations

### Security
```env
# Use strong passwords in production
REDIS_PASSWORD=your_strong_password_here

# Bind to specific interfaces
bind 127.0.0.1

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
```

### Performance
```env
# Set appropriate memory limits
maxmemory 512mb
maxmemory-policy allkeys-lru

# Enable persistence
save 900 1
save 300 10
save 60 10000
```

### High Availability
Consider Redis Cluster or Redis Sentinel for production environments.

## ✅ Verification

After setup, verify everything works:

1. **Redis Server Running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Backend Connects:**
   ```bash
   npm run dev
   # Should show: ✅ Redis cache connected successfully
   ```

3. **Cache Functions:**
   - Check the `/health` endpoint
   - Verify cache operations in logs
   - Test gamification features (they use caching)

## 🆘 Getting Help

If you encounter issues:

1. Check the Redis logs
2. Verify environment variables
3. Test Redis connection manually
4. Check backend logs for specific error messages
5. Ensure Redis server is running and accessible

## 📚 Additional Resources

- [Redis Official Documentation](https://redis.io/documentation)
- [Redis Windows Installation](https://github.com/microsoftarchive/redis/releases)
- [Redis Configuration](https://redis.io/topics/config)
- [Redis Commands](https://redis.io/commands)
