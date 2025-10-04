# Diet Game Backend - Database Infrastructure

## 📋 Overview

This directory contains the complete database infrastructure for the Diet Game gamification system. The database is designed to support all frontend gamification components with proper relationships, performance optimization, and security measures.

## 🗄️ Database Schema

### Core Tables

#### User Management
- **`users`** - User authentication and basic information
- **`user_profiles`** - Extended user profile data
- **`user_sessions`** - JWT token management

#### Gamification Core
- **`user_progress`** - XP, level, coins, and score tracking
- **`achievements`** - Achievement definitions and requirements
- **`user_achievements`** - User-unlocked achievements
- **`quests`** - Quest definitions (daily, weekly, monthly)
- **`user_quests`** - User quest progress and completion
- **`streaks`** - Streak tracking with protection mechanisms

#### Virtual Economy
- **`virtual_economy`** - Coin transactions and history
- **`shop_items`** - Items available for purchase
- **`user_inventory`** - User's purchased items

#### Analytics & Leaderboards
- **`leaderboard_entries`** - Denormalized leaderboard data
- **`user_statistics`** - User analytics and metrics
- **`activity_logs`** - User activity tracking

## 🚀 Quick Start

### Prerequisites
- PostgreSQL 14+ installed and running
- Node.js 18+ installed
- Basic knowledge of SQL and database administration

### 1. Database Setup

```bash
# Make setup script executable
chmod +x scripts/setup-database.sh

# Run database setup
./scripts/setup-database.sh
```

The setup script will:
- Create development, test, and production databases
- Create application user with proper permissions
- Run all migrations to create tables and indexes
- Load seed data for development
- Create environment configuration file

### 2. Verify Installation

```bash
# Run database tests
node scripts/test-database.js
```

### 3. Environment Configuration

Copy the generated `.env.database` file to your application's `.env`:

```bash
cp .env.database .env
```

## 📁 Directory Structure

```
backend/
├── config/
│   └── database.js          # Database configuration and connection pool
├── migrations/
│   ├── 001_initial_schema.sql   # Initial database schema
│   └── 002_seed_data.sql        # Seed data for development
├── scripts/
│   ├── setup-database.sh        # Database setup script
│   └── test-database.js         # Database testing script
└── README.md                    # This file
```

## 🔧 Configuration

### Environment Variables

```bash
# Database Connection
DB_HOST=localhost
DB_PORT=5432
DB_USER=dietgame_user
DB_PASSWORD=secure_password

# Database Names
DB_NAME_DEV=dietgame_dev
DB_NAME_TEST=dietgame_test
DB_NAME_PROD=dietgame_prod

# Connection Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=20
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# SSL Settings
DB_SSL=false
```

### Connection Pool Configuration

The database service uses connection pooling for optimal performance:

- **Development**: 2-20 connections
- **Test**: 1-5 connections  
- **Production**: 2-20 connections (configurable)

## 📊 Database Features

### Performance Optimization
- **Strategic Indexes**: Optimized for common query patterns
- **Composite Indexes**: For complex leaderboard and analytics queries
- **Connection Pooling**: Efficient connection management
- **Query Optimization**: Helper functions for common operations

### Security Features
- **Row Level Security (RLS)**: User data isolation
- **Encrypted Connections**: SSL/TLS support
- **Access Control**: Role-based permissions
- **Audit Logging**: Activity tracking

### Data Integrity
- **Foreign Key Constraints**: Referential integrity
- **Check Constraints**: Data validation
- **Unique Constraints**: Prevent duplicates
- **Triggers**: Automatic timestamp updates

## 🧪 Testing

### Database Tests

The test suite validates:
- Database connectivity and health
- Table and index existence
- Seed data integrity
- Data relationships
- Performance benchmarks
- Security policies

```bash
# Run all database tests
node scripts/test-database.js

# Expected output:
# ✅ Database Connection
# ✅ Table Existence  
# ✅ Indexes
# ✅ Seed Data
# ✅ User Progress
# ✅ Achievements
# ✅ Quests
# ✅ Streaks
# ✅ Virtual Economy
# ✅ Leaderboard
# ✅ Database Functions
# ✅ Views
# ✅ Row Level Security
# ✅ Performance
# ✅ Database Statistics
```

### Manual Testing

```sql
-- Test database connection
SELECT NOW() as current_time, version() as version;

-- Check table counts
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Test user progress view
SELECT * FROM user_progress_view LIMIT 5;

-- Test active quests view
SELECT * FROM active_quests_view LIMIT 5;
```

## 🔍 Monitoring

### Health Check

```javascript
const { db } = require('./config/database');

// Check database health
const health = await db.healthCheck();
console.log(health);
// Output: { status: 'healthy', timestamp: '...', version: '...', environment: 'development' }
```

### Database Statistics

```javascript
// Get database statistics
const stats = await db.getStats();
console.log(stats);
// Output: { users: 3, achievements: 25, quests: 20, activeQuests: 5, ... }
```

### Performance Monitoring

```sql
-- Check slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;
```

## 🛠️ Maintenance

### Backup and Recovery

```bash
# Create backup
pg_dump -h localhost -U dietgame_user -d dietgame_dev > backup_$(date +%Y%m%d).sql

# Restore backup
psql -h localhost -U dietgame_user -d dietgame_dev < backup_20240101.sql
```

### Migration Management

```bash
# Run new migration
psql -h localhost -U dietgame_user -d dietgame_dev -f migrations/003_new_feature.sql

# Rollback migration (manual)
psql -h localhost -U dietgame_user -d dietgame_dev -f migrations/rollback_003.sql
```

### Database Cleanup

```sql
-- Clean up old activity logs (older than 90 days)
DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();

-- Update leaderboard entries
REFRESH MATERIALIZED VIEW leaderboard_entries;
```

## 🔒 Security

### Row Level Security

All user data tables have RLS enabled with policies that ensure users can only access their own data:

```sql
-- Example RLS policy
CREATE POLICY user_own_data ON user_progress 
FOR ALL TO dietgame_user 
USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Access Control

```sql
-- Grant permissions to application user
GRANT ALL PRIVILEGES ON DATABASE dietgame_dev TO dietgame_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dietgame_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dietgame_user;
```

### Data Encryption

- **At Rest**: Database-level encryption (configured at cluster level)
- **In Transit**: SSL/TLS connections
- **Sensitive Fields**: Password hashing with bcrypt

## 📈 Performance

### Query Optimization

The database includes several helper functions for common operations:

```sql
-- Calculate level from total XP
SELECT * FROM calculate_level_from_xp(1250);
-- Returns: { level: 5, current_xp: 250, xp_for_next_level: 375, total_xp_required: 1500 }

-- Get user rank in leaderboard
SELECT get_user_rank('user-uuid', 'overall', 'weekly');
-- Returns: rank number

-- Check if user has achievement
SELECT user_has_achievement('user-uuid', 'achievement-uuid');
-- Returns: true/false
```

### Index Strategy

- **Primary Keys**: UUID with gen_random_uuid()
- **Foreign Keys**: Indexed for join performance
- **Query Patterns**: Composite indexes for common queries
- **Partial Indexes**: For filtered queries (e.g., active records)

## 🚨 Troubleshooting

### Common Issues

#### Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check if port is listening
netstat -tlnp | grep 5432

# Test connection
psql -h localhost -p 5432 -U dietgame_user -d dietgame_dev
```

#### Permission Issues
```sql
-- Check user permissions
SELECT * FROM information_schema.role_table_grants 
WHERE grantee = 'dietgame_user';

-- Grant missing permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dietgame_user;
```

#### Performance Issues
```sql
-- Check for missing indexes
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;

-- Analyze table statistics
ANALYZE;
```

### Log Analysis

```bash
# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-14-main.log

# Check for errors
grep -i error /var/log/postgresql/postgresql-14-main.log
```

## 📚 API Integration

### Using the Database Service

```javascript
const { db } = require('./config/database');

// Simple query
const users = await db.query('SELECT * FROM users LIMIT 10');

// Parameterized query
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// Transaction
await db.transaction(async (client) => {
  await client.query('INSERT INTO user_progress ...');
  await client.query('INSERT INTO virtual_economy ...');
  await client.query('INSERT INTO activity_logs ...');
});
```

### Frontend Integration

The database schema is designed to support all existing frontend components:

- **XPDisplay**: Uses `user_progress` table
- **AchievementCard**: Uses `achievements` and `user_achievements` tables
- **QuestCard**: Uses `quests` and `user_quests` tables
- **StreakDisplay**: Uses `streaks` table
- **Leaderboard**: Uses `leaderboard_entries` table

## 🎯 Next Steps

After completing the database infrastructure:

1. **API Framework Setup** - Create Express.js server with database integration
2. **Authentication System** - Implement JWT authentication with database storage
3. **Gamification APIs** - Build endpoints that use the database schema
4. **Performance Optimization** - Monitor and optimize database queries
5. **Real-time Features** - Implement WebSocket integration with database triggers

## 📞 Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the test results for specific failures
3. Check PostgreSQL logs for error details
4. Verify environment configuration
5. Ensure all prerequisites are installed

---

**Database Infrastructure Status**: ✅ Complete and Ready for Development

This database infrastructure provides a solid foundation for the complete gamification backend system and supports all existing frontend components with proper data persistence, relationships, and performance optimization.