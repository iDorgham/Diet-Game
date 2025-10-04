-- Migration 002: Seed Data
-- Diet Game Gamification System
-- Created: Week 1 - Core Backend Development

-- =============================================
-- 1. DEFAULT ACHIEVEMENTS
-- =============================================

INSERT INTO achievements (name, description, category, rarity, icon, color, xp_reward, coin_reward, requirements) VALUES
-- Milestone Achievements
('First Steps', 'Complete your first nutrition log', 'milestone', 'common', '👶', '#10B981', 50, 100, '{"minLogs": 1}'),
('Getting Started', 'Log meals for 3 consecutive days', 'milestone', 'common', '🌱', '#10B981', 100, 200, '{"consecutiveDays": 3}'),
('Consistency King', 'Log meals for 7 consecutive days', 'milestone', 'uncommon', '👑', '#8B5CF6', 250, 500, '{"consecutiveDays": 7}'),
('Monthly Master', 'Log meals for 30 consecutive days', 'milestone', 'rare', '🏆', '#EF4444', 750, 1500, '{"consecutiveDays": 30}'),

-- Level Achievements
('Level 5', 'Reach level 5', 'level', 'common', '⭐', '#F59E0B', 100, 200, '{"minLevel": 5}'),
('Level 10', 'Reach level 10', 'level', 'uncommon', '🌟', '#8B5CF6', 250, 500, '{"minLevel": 10}'),
('Level 15', 'Reach level 15', 'level', 'rare', '💫', '#EF4444', 500, 1000, '{"minLevel": 15}'),
('Level 20', 'Reach level 20', 'level', 'epic', '🔥', '#DC2626', 1000, 2000, '{"minLevel": 20}'),
('Level 25', 'Reach level 25', 'level', 'legendary', '👑', '#8B5CF6', 2500, 5000, '{"minLevel": 25}'),

-- Streak Achievements
('Streak Starter', 'Maintain a 3-day streak', 'streak', 'common', '🔥', '#F59E0B', 75, 150, '{"minStreak": 3}'),
('Streak Master', 'Maintain a 7-day streak', 'streak', 'uncommon', '🔥🔥', '#EF4444', 200, 400, '{"minStreak": 7}'),
('Streak Legend', 'Maintain a 30-day streak', 'streak', 'epic', '🔥🔥🔥', '#DC2626', 1000, 2000, '{"minStreak": 30}'),
('Streak God', 'Maintain a 100-day streak', 'streak', 'legendary', '🔥🔥🔥🔥', '#8B5CF6', 5000, 10000, '{"minStreak": 100}'),

-- Quest Achievements
('Quest Novice', 'Complete 5 quests', 'quest', 'common', '📋', '#3B82F6', 150, 300, '{"minQuests": 5}'),
('Quest Champion', 'Complete 25 quests', 'quest', 'uncommon', '🏆', '#8B5CF6', 500, 1000, '{"minQuests": 25}'),
('Quest Master', 'Complete 50 quests', 'quest', 'rare', '👑', '#EF4444', 1000, 2000, '{"minQuests": 50}'),
('Quest Legend', 'Complete 100 quests', 'quest', 'epic', '🌟', '#DC2626', 2500, 5000, '{"minQuests": 100}'),

-- Economy Achievements
('Coin Collector', 'Earn 1,000 coins', 'economy', 'common', '💰', '#F59E0B', 100, 200, '{"minCoins": 1000}'),
('Wealthy Player', 'Earn 10,000 coins', 'economy', 'uncommon', '💰💰', '#8B5CF6', 500, 1000, '{"minCoins": 10000}'),
('Millionaire', 'Earn 100,000 coins', 'economy', 'rare', '💰💰💰', '#EF4444', 1500, 3000, '{"minCoins": 100000}'),
('Coin King', 'Earn 1,000,000 coins', 'economy', 'epic', '👑', '#DC2626', 5000, 10000, '{"minCoins": 1000000}'),

-- Social Achievements
('Social Butterfly', 'Add 5 friends', 'social', 'common', '👥', '#3B82F6', 100, 200, '{"minFriends": 5}'),
('Community Leader', 'Add 25 friends', 'social', 'uncommon', '👑', '#8B5CF6', 300, 600, '{"minFriends": 25}'),
('Social Influencer', 'Add 100 friends', 'social', 'rare', '🌟', '#EF4444', 750, 1500, '{"minFriends": 100}'),

-- Special Achievements
('Early Bird', 'Log breakfast for 7 consecutive days', 'special', 'uncommon', '🌅', '#F59E0B', 200, 400, '{"mealType": "breakfast", "consecutiveDays": 7}'),
('Night Owl', 'Log dinner for 7 consecutive days', 'special', 'uncommon', '🌙', '#8B5CF6', 200, 400, '{"mealType": "dinner", "consecutiveDays": 7}'),
('Health Nut', 'Log healthy meals for 14 consecutive days', 'special', 'rare', '🥗', '#10B981', 500, 1000, '{"healthyMeals": 14, "consecutiveDays": 14}'),
('Recipe Explorer', 'Try 10 different recipes', 'special', 'uncommon', '🍳', '#F59E0B', 300, 600, '{"uniqueRecipes": 10}'),
('Cooking Master', 'Try 50 different recipes', 'special', 'rare', '👨‍🍳', '#8B5CF6', 1000, 2000, '{"uniqueRecipes": 50}');

-- =============================================
-- 2. DEFAULT QUESTS
-- =============================================

INSERT INTO quests (name, description, category, difficulty, type, xp_reward, coin_reward, progress_target, time_limit_hours, requirements) VALUES
-- Daily Quests
('Daily Nutrition Log', 'Log 3 meals today', 'nutrition', 'easy', 'daily', 150, 300, 3, 24, '{"mealTypes": ["breakfast", "lunch", "dinner"]}'),
('Morning Routine', 'Log breakfast before 10 AM', 'nutrition', 'easy', 'daily', 100, 200, 1, 24, '{"mealType": "breakfast", "timeLimit": "10:00"}'),
('Healthy Choice', 'Log a healthy meal today', 'nutrition', 'easy', 'daily', 125, 250, 1, 24, '{"healthScore": 8}'),
('Hydration Hero', 'Log 8 glasses of water today', 'health', 'easy', 'daily', 100, 200, 8, 24, '{"waterGlasses": 8}'),
('Exercise Log', 'Log 30 minutes of exercise', 'fitness', 'medium', 'daily', 200, 400, 30, 24, '{"exerciseMinutes": 30}'),
('Step Counter', 'Walk 10,000 steps today', 'fitness', 'medium', 'daily', 175, 350, 10000, 24, '{"steps": 10000}'),
('Social Check-in', 'Interact with 3 friends today', 'social', 'easy', 'daily', 100, 200, 3, 24, '{"interactions": 3}'),

-- Weekly Quests
('Weekly Streak', 'Maintain your nutrition streak for 7 days', 'consistency', 'medium', 'weekly', 500, 1000, 7, 168, '{"streakType": "nutrition", "days": 7}'),
('Recipe Explorer', 'Try 3 new recipes this week', 'cooking', 'hard', 'weekly', 750, 1500, 3, 168, '{"newRecipes": 3}'),
('Fitness Challenge', 'Exercise for 5 days this week', 'fitness', 'hard', 'weekly', 600, 1200, 5, 168, '{"exerciseDays": 5}'),
('Social Butterfly', 'Interact with 10 different friends this week', 'social', 'medium', 'weekly', 400, 800, 10, 168, '{"uniqueFriends": 10}'),
('Health Tracker', 'Log all meals for 5 consecutive days', 'nutrition', 'medium', 'weekly', 400, 800, 5, 168, '{"consecutiveDays": 5}'),
('Variety Seeker', 'Log meals from 5 different categories this week', 'nutrition', 'medium', 'weekly', 350, 700, 5, 168, '{"mealCategories": 5}'),

-- Monthly Quests
('Monthly Master', 'Maintain a 30-day nutrition streak', 'consistency', 'epic', 'monthly', 2000, 4000, 30, 720, '{"streakType": "nutrition", "days": 30}'),
('Recipe Master', 'Try 15 new recipes this month', 'cooking', 'epic', 'monthly', 1500, 3000, 15, 720, '{"newRecipes": 15}'),
('Fitness Legend', 'Exercise for 20 days this month', 'fitness', 'epic', 'monthly', 1200, 2400, 20, 720, '{"exerciseDays": 20}'),
('Social Influencer', 'Add 25 new friends this month', 'social', 'hard', 'monthly', 800, 1600, 25, 720, '{"newFriends": 25}'),
('Health Champion', 'Log healthy meals for 25 days this month', 'nutrition', 'hard', 'monthly', 1000, 2000, 25, 720, '{"healthyDays": 25}'),

-- Special Quests
('New Year Resolution', 'Complete 10 daily quests in a row', 'special', 'legendary', 'special', 1000, 2000, 10, 240, '{"consecutiveQuests": 10}'),
('Weekend Warrior', 'Complete all weekend quests', 'special', 'rare', 'special', 500, 1000, 1, 48, '{"weekendQuests": "all"}'),
('Holiday Spirit', 'Log special holiday meals', 'special', 'uncommon', 'special', 300, 600, 1, 24, '{"holidayMeals": 1}');

-- =============================================
-- 3. DEFAULT SHOP ITEMS
-- =============================================

INSERT INTO shop_items (name, description, category, price, currency_type, item_type, item_data, is_premium) VALUES
-- Recipe Unlocks
('Basic Recipe Pack', 'Unlock 5 basic recipes', 'recipes', 500, 'coins', 'recipe', '{"recipeCount": 5, "tier": "basic"}', false),
('Premium Recipe Pack', 'Unlock 10 premium recipes', 'recipes', 1500, 'coins', 'recipe', '{"recipeCount": 10, "tier": "premium"}', false),
('Gourmet Recipe Pack', 'Unlock 5 gourmet recipes', 'recipes', 2500, 'coins', 'recipe', '{"recipeCount": 5, "tier": "gourmet"}', true),
('Seasonal Recipe Pack', 'Unlock seasonal recipes', 'recipes', 2000, 'coins', 'recipe', '{"recipeCount": 8, "tier": "seasonal"}', false),

-- Streak Protection
('Streak Protection (1 day)', 'Protect your streak for 24 hours', 'protection', 300, 'coins', 'protection', '{"duration": 24, "type": "streak"}', false),
('Streak Protection (3 days)', 'Protect your streak for 72 hours', 'protection', 800, 'coins', 'protection', '{"duration": 72, "type": "streak"}', false),
('Streak Protection (1 week)', 'Protect your streak for 7 days', 'protection', 1500, 'coins', 'protection', '{"duration": 168, "type": "streak"}', true),

-- XP and Coin Boosts
('XP Boost (1 hour)', 'Double XP for 1 hour', 'boost', 400, 'coins', 'boost', '{"multiplier": 2, "duration": 60, "type": "xp"}', false),
('XP Boost (3 hours)', 'Double XP for 3 hours', 'boost', 1000, 'coins', 'boost', '{"multiplier": 2, "duration": 180, "type": "xp"}', false),
('Coin Boost (1 hour)', 'Earn 50% more coins for 1 hour', 'boost', 500, 'coins', 'boost', '{"multiplier": 1.5, "duration": 60, "type": "coins"}', false),
('Coin Boost (3 hours)', 'Earn 50% more coins for 3 hours', 'boost', 1200, 'coins', 'boost', '{"multiplier": 1.5, "duration": 180, "type": "coins"}', false),

-- Avatar Customization
('Basic Avatar Frame', 'Simple avatar border', 'cosmetics', 200, 'coins', 'avatar', '{"frame": "basic", "rarity": "common"}', false),
('Premium Avatar Frame', 'Fancy avatar border', 'cosmetics', 800, 'coins', 'avatar', '{"frame": "premium", "rarity": "uncommon"}', false),
('Golden Avatar Frame', 'Golden avatar border', 'cosmetics', 2000, 'coins', 'avatar', '{"frame": "golden", "rarity": "rare"}', true),
('Diamond Avatar Frame', 'Diamond avatar border', 'cosmetics', 5000, 'coins', 'avatar', '{"frame": "diamond", "rarity": "epic"}', true),

-- Badges and Titles
('Health Nut Badge', 'Show off your healthy eating', 'badges', 1000, 'coins', 'badge', '{"badge": "health_nut", "rarity": "uncommon"}', false),
('Streak Master Badge', 'Display your streak mastery', 'badges', 1500, 'coins', 'badge', '{"badge": "streak_master", "rarity": "rare"}', false),
('Recipe Explorer Badge', 'Show your culinary adventures', 'badges', 1200, 'coins', 'badge', '{"badge": "recipe_explorer", "rarity": "uncommon"}', false),
('Social Butterfly Badge', 'Display your social skills', 'badges', 800, 'coins', 'badge', '{"badge": "social_butterfly", "rarity": "common"}', false),

-- Special Items
('Lucky Charm', 'Increases chance of bonus rewards', 'special', 1000, 'coins', 'boost', '{"type": "luck", "multiplier": 1.2, "duration": 1440}', true),
('Time Saver', 'Reduces quest completion time by 25%', 'special', 2000, 'coins', 'boost', '{"type": "time_reduction", "multiplier": 0.75, "duration": 1440}', true),
('Double Rewards', 'Double all rewards for 24 hours', 'special', 3000, 'coins', 'boost', '{"type": "double_rewards", "multiplier": 2, "duration": 1440}', true);

-- =============================================
-- 4. SAMPLE USER DATA (FOR DEVELOPMENT)
-- =============================================

-- Create sample users for development/testing
INSERT INTO users (id, email, username, password_hash, email_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'demo@dietgame.com', 'demo_user', '$2b$10$demo_hash_here', true, true),
('550e8400-e29b-41d4-a716-446655440001', 'test@dietgame.com', 'test_user', '$2b$10$demo_hash_here', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'admin@dietgame.com', 'admin_user', '$2b$10$demo_hash_here', true, true);

-- Create sample user profiles
INSERT INTO user_profiles (user_id, user_name, diet_type, body_type, weight, avatar_url, bio) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Demo User', 'Keto Diet', 'Mesomorph', '175 lbs', 'https://example.com/avatar1.jpg', 'Health enthusiast and recipe explorer'),
('550e8400-e29b-41d4-a716-446655440001', 'Test User', 'Mediterranean Diet', 'Ectomorph', '140 lbs', 'https://example.com/avatar2.jpg', 'Fitness focused and nutrition conscious'),
('550e8400-e29b-41d4-a716-446655440002', 'Admin User', 'Balanced Diet', 'Endomorph', '200 lbs', 'https://example.com/avatar3.jpg', 'System administrator and health coach');

-- Create sample user progress
INSERT INTO user_progress (user_id, level, current_xp, total_xp, coins, score, recipes_unlocked, has_claimed_gift) VALUES
('550e8400-e29b-41d4-a716-446655440000', 5, 250, 1250, 1000, 5000, 10, true),
('550e8400-e29b-41d4-a716-446655440001', 3, 150, 750, 500, 2500, 5, true),
('550e8400-e29b-41d4-a716-446655440002', 8, 400, 2000, 2000, 8000, 15, true);

-- Create sample streaks
INSERT INTO streaks (user_id, name, description, category, current_count, max_count, is_active, last_activity, freeze_tokens_available, total_xp, total_coins) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Nutrition Logging', 'Daily nutrition logging streak', 'nutrition', 7, 7, true, NOW() - INTERVAL '2 hours', 3, 500, 1000),
('550e8400-e29b-41d4-a716-446655440000', 'Exercise', 'Daily exercise streak', 'fitness', 5, 5, true, NOW() - INTERVAL '1 day', 2, 300, 600),
('550e8400-e29b-41d4-a716-446655440001', 'Nutrition Logging', 'Daily nutrition logging streak', 'nutrition', 3, 3, true, NOW() - INTERVAL '4 hours', 1, 200, 400),
('550e8400-e29b-41d4-a716-446655440002', 'Nutrition Logging', 'Daily nutrition logging streak', 'nutrition', 15, 15, true, NOW() - INTERVAL '1 hour', 5, 1000, 2000);

-- Create sample virtual economy transactions
INSERT INTO virtual_economy (user_id, transaction_type, amount, balance_after, description, source, metadata) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'earn', 100, 1000, 'Daily quest completion', 'quest_completion', '{"questId": "daily_nutrition", "xpEarned": 150}'),
('550e8400-e29b-41d4-a716-446655440000', 'earn', 200, 1200, 'Achievement unlocked', 'achievement', '{"achievementId": "first_steps", "xpEarned": 50}'),
('550e8400-e29b-41d4-a716-446655440000', 'spend', -300, 900, 'Recipe pack purchase', 'shop_purchase', '{"itemId": "basic_recipe_pack", "itemName": "Basic Recipe Pack"}'),
('550e8400-e29b-41d4-a716-446655440001', 'earn', 150, 500, 'Streak milestone', 'streak_milestone', '{"streakType": "nutrition", "days": 3}'),
('550e8400-e29b-41d4-a716-446655440002', 'earn', 500, 2000, 'Level up bonus', 'level_up', '{"newLevel": 8, "xpEarned": 400}');

-- Create sample leaderboard entries
INSERT INTO leaderboard_entries (user_id, category, time_range, rank, score, level, xp, badges_count) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'overall', 'weekly', 1, 8000, 8, 2000, 12),
('550e8400-e29b-41d4-a716-446655440000', 'overall', 'weekly', 2, 5000, 5, 1250, 8),
('550e8400-e29b-41d4-a716-446655440001', 'overall', 'weekly', 3, 2500, 3, 750, 4),
('550e8400-e29b-41d4-a716-446655440000', 'nutrition', 'weekly', 1, 3000, 5, 1250, 8),
('550e8400-e29b-41d4-a716-446655440002', 'nutrition', 'weekly', 2, 2500, 8, 2000, 12),
('550e8400-e29b-41d4-a716-446655440001', 'nutrition', 'weekly', 3, 1500, 3, 750, 4);

-- =============================================
-- 5. HELPFUL VIEWS FOR COMMON QUERIES
-- =============================================

-- View for user progress with calculated fields
CREATE OR REPLACE VIEW user_progress_view AS
SELECT 
    up.*,
    u.username,
    u.email,
    up_profile.user_name,
    up_profile.avatar_url,
    calculate_level_from_xp(up.total_xp).level as calculated_level,
    calculate_level_from_xp(up.total_xp).current_xp as calculated_current_xp,
    calculate_level_from_xp(up.total_xp).xp_for_next_level as xp_for_next_level
FROM user_progress up
JOIN users u ON up.user_id = u.id
LEFT JOIN user_profiles up_profile ON up.user_id = up_profile.user_id;

-- View for active quests with progress
CREATE OR REPLACE VIEW active_quests_view AS
SELECT 
    uq.*,
    q.name as quest_name,
    q.description as quest_description,
    q.category,
    q.difficulty,
    q.type,
    q.xp_reward,
    q.coin_reward,
    q.progress_target,
    q.time_limit_hours,
    u.username,
    ROUND((uq.progress::float / q.progress_target * 100), 2) as progress_percentage,
    CASE 
        WHEN uq.expires_at < NOW() THEN 'expired'
        WHEN uq.is_completed THEN 'completed'
        WHEN uq.progress >= q.progress_target THEN 'ready_to_complete'
        ELSE 'in_progress'
    END as status
FROM user_quests uq
JOIN quests q ON uq.quest_id = q.id
JOIN users u ON uq.user_id = u.id
WHERE uq.is_active = true;

-- View for user achievements with details
CREATE OR REPLACE VIEW user_achievements_view AS
SELECT 
    ua.*,
    a.name as achievement_name,
    a.description as achievement_description,
    a.category,
    a.rarity,
    a.icon,
    a.color,
    a.xp_reward,
    a.coin_reward,
    u.username
FROM user_achievements ua
JOIN achievements a ON ua.achievement_id = a.id
JOIN users u ON ua.user_id = u.id;

-- View for leaderboard with user details
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT 
    le.*,
    u.username,
    up_profile.user_name,
    up_profile.avatar_url,
    up.level,
    up.total_xp
FROM leaderboard_entries le
JOIN users u ON le.user_id = u.id
LEFT JOIN user_profiles up_profile ON le.user_id = up_profile.user_id
LEFT JOIN user_progress up ON le.user_id = up.user_id;

-- =============================================
-- SEED DATA COMPLETE
-- =============================================

-- Log seed data completion
INSERT INTO activity_logs (user_id, activity_type, activity_data) 
VALUES (NULL, 'migration', '{"migration": "002_seed_data", "status": "completed", "timestamp": "' || NOW() || '"}');

COMMENT ON DATABASE dietgame_dev IS 'Diet Game Gamification System - Seed Data Loaded';
