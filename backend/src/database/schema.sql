-- Gamification Database Schema
-- Sprint 7-8: Core Backend Development - Day 1 Task 1.1

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (if not exists from main app)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- User Progress Table
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    current_xp INTEGER DEFAULT 0 CHECK (current_xp >= 0),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    coins INTEGER DEFAULT 0 CHECK (coins >= 0),
    score INTEGER DEFAULT 0 CHECK (score >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Achievements Table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon VARCHAR(100),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievements Table
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Streaks Table
CREATE TABLE streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    streak_type VARCHAR(50) NOT NULL,
    current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
    longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
    last_activity TIMESTAMP WITH TIME ZONE,
    bonus_multiplier DECIMAL(3,2) DEFAULT 1.00 CHECK (bonus_multiplier >= 1.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, streak_type)
);

-- Virtual Economy Tables
CREATE TABLE shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL,
    rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    icon VARCHAR(100),
    requirements JSONB DEFAULT '{}',
    effects JSONB DEFAULT '{}',
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    purchase_price INTEGER NOT NULL CHECK (purchase_price >= 0),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, item_id)
);

-- Quests Table
CREATE TABLE quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    time_limit INTEGER, -- in hours
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quest_id UUID NOT NULL REFERENCES quests(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quest_id)
);

-- XP Transactions Table (for audit trail)
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source VARCHAR(100) NOT NULL,
    source_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coin Transactions Table (for audit trail)
CREATE TABLE coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earned', 'spent')),
    source VARCHAR(100) NOT NULL,
    source_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_level ON user_progress(level);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(is_unlocked);
CREATE INDEX idx_streaks_user_id ON streaks(user_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_current ON streaks(current_streak);
CREATE INDEX idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX idx_user_quests_status ON user_quests(status);
CREATE INDEX idx_user_quests_expires ON user_quests(expires_at);
CREATE INDEX idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created ON xp_transactions(created_at);
CREATE INDEX idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX idx_coin_transactions_created ON coin_transactions(created_at);
CREATE INDEX idx_shop_items_category ON shop_items(category);
CREATE INDEX idx_shop_items_rarity ON shop_items(rarity);
CREATE INDEX idx_shop_items_available ON shop_items(is_available);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_achievements_updated_at BEFORE UPDATE ON user_achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shop_items_updated_at BEFORE UPDATE ON shop_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_quests_updated_at BEFORE UPDATE ON user_quests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
