-- Migration 001: Initial Database Schema
-- Diet Game Gamification System
-- Created: Week 1 - Core Backend Development

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- 1. USER MANAGEMENT TABLES
-- =============================================

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

-- =============================================
-- 2. GAMIFICATION CORE TABLES
-- =============================================

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

-- =============================================
-- 3. VIRTUAL ECONOMY TABLES
-- =============================================

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

-- =============================================
-- 4. LEADERBOARD AND ANALYTICS TABLES
-- =============================================

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

-- =============================================
-- 5. INDEXES FOR PERFORMANCE
-- =============================================

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

-- Composite indexes for complex queries
CREATE INDEX idx_leaderboard_user_category_time ON leaderboard_entries(user_id, category, time_range);
CREATE INDEX idx_user_quests_user_active_expires ON user_quests(user_id, is_active, expires_at);
CREATE INDEX idx_user_achievements_user_unlocked ON user_achievements(user_id, unlocked_at);
CREATE INDEX idx_streaks_user_category_active ON streaks(user_id, category, is_active);
CREATE INDEX idx_virtual_economy_user_type_date ON virtual_economy(user_id, transaction_type, created_at);

-- =============================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =============================================

-- Function to update updated_at column
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

-- =============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- =============================================

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

-- Create RLS policies (will be configured with proper user context in application)
-- Note: These policies will be activated when the application sets the current_user_id

-- =============================================
-- 8. HELPFUL FUNCTIONS
-- =============================================

-- Function to calculate level from total XP
CREATE OR REPLACE FUNCTION calculate_level_from_xp(total_xp INTEGER)
RETURNS TABLE(level INTEGER, current_xp INTEGER, xp_for_next_level INTEGER, total_xp_required INTEGER) AS $$
DECLARE
    current_level INTEGER := 1;
    xp_required INTEGER := 100;
    xp_for_next INTEGER := 100;
    running_total INTEGER := 0;
BEGIN
    WHILE running_total + xp_for_next <= total_xp LOOP
        running_total := running_total + xp_for_next;
        current_level := current_level + 1;
        xp_for_next := FLOOR(xp_for_next * 1.5);
    END LOOP;
    
    RETURN QUERY SELECT 
        current_level,
        total_xp - running_total,
        xp_for_next,
        running_total + xp_for_next;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's current rank in leaderboard
CREATE OR REPLACE FUNCTION get_user_rank(user_uuid UUID, category_name VARCHAR, time_range_name VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    user_rank INTEGER;
BEGIN
    SELECT rank INTO user_rank
    FROM leaderboard_entries
    WHERE user_id = user_uuid 
    AND category = category_name 
    AND time_range = time_range_name;
    
    RETURN COALESCE(user_rank, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has achievement
CREATE OR REPLACE FUNCTION user_has_achievement(user_uuid UUID, achievement_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_achievements 
        WHERE user_id = user_uuid AND achievement_id = achievement_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log migration completion
INSERT INTO activity_logs (user_id, activity_type, activity_data) 
VALUES (NULL, 'migration', '{"migration": "001_initial_schema", "status": "completed", "timestamp": "' || NOW() || '"}');

COMMENT ON DATABASE dietgame_dev IS 'Diet Game Gamification System - Initial Schema Created';
