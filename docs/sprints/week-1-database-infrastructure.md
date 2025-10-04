# Week 1: Database Infrastructure - Complete Implementation Guide

## 📋 Database Infrastructure Overview

**Objective**: Create a complete PostgreSQL database infrastructure that supports the existing frontend gamification system with proper schema, relationships, and performance optimization.

**Current State**: Frontend components exist with defined data structures
**Target State**: PostgreSQL database with complete gamification schema

---

## 🎯 Database Schema Design

### Core Data Structures Analysis

Based on the frontend components, we need to support:

1. **User Progress**: Level, XP, coins, score, recipes unlocked
2. **Achievements**: Name, description, category, rarity, rewards, progress tracking
3. **Quests**: Daily/weekly/monthly quests with progress, rewards, time limits
4. **Streaks**: Multiple streak types with protection, milestones, risk assessment
5. **Leaderboards**: Rankings by category and time range
6. **Virtual Economy**: Coin transactions, shop items, inventory

---

## 🗄️ Complete Database Schema

### 1. User Management Tables

```sql
-- Users table for authentication and basic info
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- User profiles with personal information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(100) NOT NULL,
    diet_type VARCHAR(50),
    body_type VARCHAR(50),
    weight VARCHAR(20),
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for JWT token management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Gamification Core Tables

```sql
-- User progress tracking (XP, level, coins, score)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    recipes_unlocked INTEGER DEFAULT 0,
    has_claimed_gift BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements definition table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
    icon VARCHAR(100),
    color VARCHAR(7), -- Hex color code
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    requirements JSONB, -- Flexible requirements structure
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements (unlocked achievements)
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    progress JSONB, -- Current progress towards achievement
    is_notified BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, achievement_id)
);

-- Quests definition table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'easy' CHECK (difficulty IN ('easy', 'medium', 'hard', 'epic', 'legendary')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
    xp_reward INTEGER DEFAULT 0,
    coin_reward INTEGER DEFAULT 0,
    progress_target INTEGER DEFAULT 1,
    time_limit_hours INTEGER DEFAULT 24,
    requirements JSONB, -- Quest requirements
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User quests (assigned and progress tracking)
CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_completed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Streaks tracking
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    current_count INTEGER DEFAULT 0,
    max_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_protected BOOLEAN DEFAULT FALSE,
    last_activity TIMESTAMP WITH TIME ZONE,
    protection_expires TIMESTAMP WITH TIME ZONE NULL,
    freeze_tokens_used INTEGER DEFAULT 0,
    freeze_tokens_available INTEGER DEFAULT 0,
    milestones_reached INTEGER[] DEFAULT '{}',
    total_xp INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category)
);
```

### 3. Virtual Economy Tables

```sql
-- Virtual economy transactions
CREATE TABLE virtual_economy (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'reward', 'bonus', 'purchase')),
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    description TEXT,
    source VARCHAR(100), -- What triggered the transaction
    metadata JSONB, -- Additional transaction data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shop items
CREATE TABLE shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    price INTEGER NOT NULL,
    currency_type VARCHAR(20) DEFAULT 'coins' CHECK (currency_type IN ('coins', 'xp', 'score')),
    item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('recipe', 'avatar', 'badge', 'boost', 'protection')),
    item_data JSONB, -- Item-specific data
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User inventory (purchased items)
CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(user_id, item_id)
);
```

### 4. Leaderboard and Analytics Tables

```sql
-- Leaderboard entries (denormalized for performance)
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    time_range VARCHAR(20) NOT NULL,
    rank INTEGER NOT NULL,
    score INTEGER NOT NULL,
    level INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    badges_count INTEGER DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, time_range)
);

-- User statistics for analytics
CREATE TABLE user_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stat_type VARCHAR(50) NOT NULL,
    stat_value INTEGER DEFAULT 0,
    stat_date DATE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stat_type, stat_date)
);

-- Activity logs for tracking user actions
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔧 Database Setup and Configuration

### 1. PostgreSQL Installation and Setup

```bash
# Install PostgreSQL 14+ (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install PostgreSQL 14+ (macOS)
brew install postgresql@14
brew services start postgresql@14

# Install PostgreSQL 14+ (Windows)
# Download from https://www.postgresql.org/download/windows/
```

### 2. Database Creation and Configuration

```sql
-- Create database
CREATE DATABASE dietgame_dev;
CREATE DATABASE dietgame_test;
CREATE DATABASE dietgame_prod;

-- Create user with appropriate permissions
CREATE USER dietgame_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dietgame_dev TO dietgame_user;
GRANT ALL PRIVILEGES ON DATABASE dietgame_test TO dietgame_user;
GRANT ALL PRIVILEGES ON DATABASE dietgame_prod TO dietgame_user;

-- Connect to development database
\c dietgame_dev;
```

### 3. Connection Pooling Setup (PgBouncer)

```ini
# /etc/pgbouncer/pgbouncer.ini
[databases]
dietgame_dev = host=localhost port=5432 dbname=dietgame_dev
dietgame_test = host=localhost port=5432 dbname=dietgame_test
dietgame_prod = host=localhost port=5432 dbname=dietgame_prod

[pgbouncer]
listen_port = 6432
listen_addr = 127.0.0.1
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

---

## 📊 Indexes and Performance Optimization

### 1. Primary Indexes

```sql
-- User-related indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Gamification indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_level ON user_progress(level);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_active ON user_quests(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_quests_expires ON user_quests(expires_at);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_category ON streaks(user_id, category);
CREATE INDEX idx_streaks_active ON streaks(user_id, is_active) WHERE is_active = TRUE;

-- Virtual economy indexes
CREATE INDEX idx_virtual_economy_user_id ON virtual_economy(user_id);
CREATE INDEX idx_virtual_economy_created_at ON virtual_economy(created_at);
CREATE INDEX idx_virtual_economy_type ON virtual_economy(transaction_type);
CREATE INDEX idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX idx_user_inventory_item_id ON user_inventory(item_id);

-- Leaderboard and analytics indexes
CREATE INDEX idx_leaderboard_category_time ON leaderboard_entries(category, time_range);
CREATE INDEX idx_leaderboard_rank ON leaderboard_entries(category, time_range, rank);
CREATE INDEX idx_user_statistics_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_statistics_type_date ON user_statistics(stat_type, stat_date);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

### 2. Composite Indexes for Complex Queries

```sql
-- Leaderboard queries
CREATE INDEX idx_leaderboard_user_category_time ON leaderboard_entries(user_id, category, time_range);

-- Quest management
CREATE INDEX idx_user_quests_user_active_expires ON user_quests(user_id, is_active, expires_at);

-- Achievement progress
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at);

-- Streak management
CREATE INDEX idx_streaks_user_category_active ON streaks(user_id, category, is_active);

-- Virtual economy analytics
CREATE INDEX idx_virtual_economy_user_type_date ON virtual_economy(user_id, transaction_type, created_at);
```

---

## 🔒 Security and Access Control

### 1. Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_economy ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY user_own_data ON users FOR ALL TO dietgame_user USING (id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_profile_own_data ON user_profiles FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_progress_own_data ON user_progress FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_achievements_own_data ON user_achievements FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_quests_own_data ON user_quests FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY streaks_own_data ON streaks FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY virtual_economy_own_data ON virtual_economy FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_inventory_own_data ON user_inventory FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY user_statistics_own_data ON user_statistics FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY activity_logs_own_data ON activity_logs FOR ALL TO dietgame_user USING (user_id = current_setting('app.current_user_id')::uuid);

-- Leaderboard entries are readable by all users
CREATE POLICY leaderboard_readable ON leaderboard_entries FOR SELECT TO dietgame_user USING (true);
```

### 2. Database Encryption

```sql
-- Enable encryption at rest (PostgreSQL 14+)
-- This is typically configured at the database cluster level
-- Check with your database administrator for cluster-level encryption

-- Encrypt sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Example of encrypting sensitive data
-- UPDATE users SET password_hash = crypt(password_hash, gen_salt('bf'));
```

---

## 📈 Migration System

### 1. Migration Framework Setup

```bash
# Install migration tool (using node-migrate)
npm install -g node-migrate

# Initialize migration system
migrate init
```

### 2. Initial Migration Script

```sql
-- migrations/001_initial_schema.sql
-- This file contains all the table creation statements above

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quests_updated_at BEFORE UPDATE ON user_quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON shop_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Seed Data Migration

```sql
-- migrations/002_seed_data.sql

-- Insert default achievements
INSERT INTO achievements (name, description, category, rarity, icon, color, xp_reward, coin_reward, requirements) VALUES
('First Steps', 'Complete your first nutrition log', 'milestone', 'common', '👶', '#10B981', 50, 100, '{"minLogs": 1}'),
('Level 5', 'Reach level 5', 'level', 'common', '⭐', '#F59E0B', 100, 200, '{"minLevel": 5}'),
('Level 10', 'Reach level 10', 'level', 'uncommon', '🌟', '#8B5CF6', 250, 500, '{"minLevel": 10}'),
('Streak Master', 'Maintain a 7-day streak', 'streak', 'rare', '🔥', '#EF4444', 500, 1000, '{"minStreak": 7}'),
('Quest Champion', 'Complete 10 quests', 'quest', 'rare', '🏆', '#3B82F6', 750, 1500, '{"minQuests": 10}'),
('Coin Collector', 'Earn 10,000 coins', 'economy', 'epic', '💰', '#F59E0B', 1000, 2000, '{"minCoins": 10000}'),
('Legendary Player', 'Reach level 25', 'level', 'legendary', '👑', '#8B5CF6', 2500, 5000, '{"minLevel": 25}');

-- Insert default quests
INSERT INTO quests (name, description, category, difficulty, type, xp_reward, coin_reward, progress_target, time_limit_hours, requirements) VALUES
('Daily Nutrition Log', 'Log 3 meals today', 'nutrition', 'easy', 'daily', 150, 300, 3, 24, '{"mealTypes": ["breakfast", "lunch", "dinner"]}'),
('Weekly Streak', 'Maintain your nutrition streak for 7 days', 'consistency', 'medium', 'weekly', 500, 1000, 7, 168, '{"streakType": "nutrition"}'),
('Exercise Log', 'Log 30 minutes of exercise', 'fitness', 'medium', 'daily', 200, 400, 30, 24, '{"exerciseMinutes": 30}'),
('Social Engagement', 'Interact with 5 friends', 'social', 'easy', 'weekly', 300, 600, 5, 168, '{"interactions": 5}'),
('Recipe Master', 'Try 3 new recipes this week', 'cooking', 'hard', 'weekly', 750, 1500, 3, 168, '{"newRecipes": 3}');

-- Insert default shop items
INSERT INTO shop_items (name, description, category, price, currency_type, item_type, item_data) VALUES
('Recipe Unlock Pack', 'Unlock 5 premium recipes', 'recipes', 1000, 'coins', 'recipe', '{"recipeCount": 5}'),
('Streak Protection', 'Protect your streak for 24 hours', 'protection', 500, 'coins', 'protection', '{"duration": 24}'),
('XP Boost', 'Double XP for 1 hour', 'boost', 750, 'coins', 'boost', '{"multiplier": 2, "duration": 60}'),
('Premium Avatar', 'Exclusive avatar frame', 'cosmetics', 2000, 'coins', 'avatar', '{"frame": "premium"}'),
('Coin Multiplier', 'Earn 50% more coins for 2 hours', 'boost', 1000, 'coins', 'boost', '{"multiplier": 1.5, "duration": 120}');
```

---

## 🧪 Testing and Development Setup

### 1. Test Database Setup

```sql
-- Create test database with same schema
\c dietgame_test;

-- Run all migrations
\i migrations/001_initial_schema.sql
\i migrations/002_seed_data.sql

-- Create test data
INSERT INTO users (id, email, username, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'test@example.com', 'testuser', 'hashed_password'),
('550e8400-e29b-41d4-a716-446655440001', 'test2@example.com', 'testuser2', 'hashed_password');

INSERT INTO user_progress (user_id, level, current_xp, total_xp, coins, score) VALUES
('550e8400-e29b-41d4-a716-446655440000', 5, 250, 1250, 1000, 5000),
('550e8400-e29b-41d4-a716-446655440001', 3, 150, 750, 500, 2500);
```

### 2. Database Connection Configuration

```javascript
// config/database.js
const { Pool } = require('pg');

const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dietgame_dev',
    user: process.env.DB_USER || 'dietgame_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'dietgame_test',
    user: process.env.DB_USER || 'dietgame_user',
    password: process.env.DB_PASSWORD || 'secure_password',
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  }
};

const pool = new Pool(dbConfig[process.env.NODE_ENV || 'development']);

module.exports = pool;
```

---

## 📊 Monitoring and Maintenance

### 1. Database Monitoring Queries

```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('dietgame_dev'));

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_tup_read DESC;

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
```

### 2. Backup and Recovery

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"
DB_NAME="dietgame_prod"

# Create backup
pg_dump -h localhost -U dietgame_user -d $DB_NAME > $BACKUP_DIR/dietgame_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/dietgame_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "dietgame_*.sql.gz" -mtime +7 -delete

echo "Backup completed: dietgame_$DATE.sql.gz"
```

---

## 🚀 Implementation Checklist

### Database Setup (Day 1 - 4 hours)
- [ ] Install PostgreSQL 14+
- [ ] Create databases (dev, test, prod)
- [ ] Create user with appropriate permissions
- [ ] Configure connection pooling (PgBouncer)
- [ ] Set up monitoring and logging

### Schema Implementation (Day 1 - 6 hours)
- [ ] Create all tables with proper relationships
- [ ] Add indexes for performance optimization
- [ ] Implement Row Level Security (RLS)
- [ ] Set up triggers for updated_at timestamps
- [ ] Create database functions and procedures

### Migration System (Day 1 - 2 hours)
- [ ] Set up migration framework
- [ ] Create initial schema migration
- [ ] Create seed data migration
- [ ] Test migration rollback procedures
- [ ] Document migration procedures

### Security Implementation (Day 1 - 2 hours)
- [ ] Configure database encryption
- [ ] Set up access controls and permissions
- [ ] Implement audit logging
- [ ] Configure firewall rules
- [ ] Set up security monitoring

### Testing and Validation (Day 1 - 2 hours)
- [ ] Create test database with sample data
- [ ] Test all table relationships
- [ ] Validate index performance
- [ ] Test RLS policies
- [ ] Verify backup and recovery procedures

---

## 🎯 Success Criteria

### Technical Success
- [ ] All tables created with proper relationships
- [ ] Indexes optimized for common queries
- [ ] Migration scripts tested and documented
- [ ] Development data seeded successfully
- [ ] Security measures implemented and tested

### Performance Success
- [ ] Database queries < 100ms for simple operations
- [ ] Connection pooling configured and working
- [ ] Indexes provide optimal query performance
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured

### Integration Success
- [ ] Database schema supports all frontend data structures
- [ ] API endpoints can efficiently query the database
- [ ] Real-time updates can be implemented
- [ ] Analytics and reporting queries optimized
- [ ] Scalability considerations addressed

---

## 🔄 Next Steps

After completing the database infrastructure:

1. **API Framework Setup** - Create Express.js server with database integration
2. **Authentication System** - Implement JWT authentication with database storage
3. **Gamification APIs** - Build endpoints that use the database schema
4. **Performance Optimization** - Monitor and optimize database queries
5. **Real-time Features** - Implement WebSocket integration with database triggers

This database infrastructure provides a solid foundation for the complete gamification backend system and supports all the existing frontend components with proper data persistence, relationships, and performance optimization.
