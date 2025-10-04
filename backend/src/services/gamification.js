// Gamification Service - Core business logic
// Sprint 7-8: Core Backend Development - Day 2 Task 2.1 & 2.2

import { query, withTransaction } from '../database/connection.js';
import { XPCalculator } from '../utils/xpCalculator.js';
import { LevelingSystem } from '../utils/levelingSystem.js';
import { AchievementEngine } from '../utils/achievementEngine.js';
import { StreakManager } from '../utils/streakManager.js';
import { VirtualEconomy } from '../utils/virtualEconomy.js';
import { logger } from '../utils/logger.js';
import { io } from '../server.js';

export class GamificationService {
  
  /**
   * Get user's complete gamification progress
   */
  static async getUserProgress(userId, include = []) {
    try {
      // Get basic progress
      const progressResult = await query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [userId]
      );

      if (progressResult.rows.length === 0) {
        // Initialize new user progress
        await this.initializeUserProgress(userId);
        return await this.getUserProgress(userId, include);
      }

      const progress = progressResult.rows[0];
      const result = { progress };

      // Include additional data based on request
      if (include.includes('achievements')) {
        result.achievements = await this.getUserAchievements(userId);
      }

      if (include.includes('quests')) {
        result.quests = await this.getUserQuests(userId);
      }

      if (include.includes('streaks')) {
        result.streaks = await this.getUserStreaks(userId);
      }

      return result;
    } catch (error) {
      logger.error('Error getting user progress', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Initialize new user progress
   */
  static async initializeUserProgress(userId) {
    try {
      await query(
        `INSERT INTO user_progress (user_id, level, current_xp, total_xp, coins, score)
         VALUES ($1, 1, 0, 0, 100, 0)`,
        [userId]
      );

      // Initialize streaks
      await query(
        `INSERT INTO streaks (user_id, streak_type, current_streak, longest_streak, bonus_multiplier)
         VALUES 
         ($1, 'daily_login', 0, 0, 1.0),
         ($1, 'nutrition_tracking', 0, 0, 1.0),
         ($1, 'exercise', 0, 0, 1.0)`,
        [userId]
      );

      logger.info('Initialized user progress', { userId });
    } catch (error) {
      logger.error('Error initializing user progress', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Complete a task and award rewards
   */
  static async completeTask({ userId, taskId, taskType, difficulty, completionData, timestamp }) {
    try {
      return await withTransaction(async (client) => {
        // Calculate XP based on task
        const xpEarned = XPCalculator.calculateXP({
          taskType,
          difficulty,
          userLevel: await this.getUserLevel(userId),
          streakDays: await this.getUserStreakDays(userId, 'daily_login')
        });

        // Get current progress
        const progressResult = await client.query(
          'SELECT * FROM user_progress WHERE user_id = $1',
          [userId]
        );

        if (progressResult.rows.length === 0) {
          throw new Error('User progress not found');
        }

        const currentProgress = progressResult.rows[0];
        const newTotalXP = currentProgress.total_xp + xpEarned;
        const newCurrentXP = currentProgress.current_xp + xpEarned;

        // Check for level up
        const levelResult = LevelingSystem.processLevelUp({
          currentLevel: currentProgress.level,
          currentXP: newCurrentXP,
          totalXP: newTotalXP
        });

        // Calculate coin reward
        const coinReward = VirtualEconomy.calculateCoinReward(xpEarned, levelResult.bonusMultiplier);

        // Update user progress
        await client.query(
          `UPDATE user_progress 
           SET level = $1, current_xp = $2, total_xp = $3, coins = coins + $4, score = score + $5
           WHERE user_id = $6`,
          [
            levelResult.newLevel,
            levelResult.newCurrentXP,
            newTotalXP,
            coinReward + levelResult.bonusCoins,
            xpEarned,
            userId
          ]
        );

        // Record XP transaction
        await client.query(
          `INSERT INTO xp_transactions (user_id, amount, source, source_id, description)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, xpEarned, 'task_completion', taskId, `Completed ${taskType} task`]
        );

        // Record coin transaction
        await client.query(
          `INSERT INTO coin_transactions (user_id, amount, transaction_type, source, source_id, description)
           VALUES ($1, $2, 'earned', $3, $4, $5)`,
          [userId, coinReward + levelResult.bonusCoins, 'task_completion', taskId, `Reward for ${taskType} task`]
        );

        // Update streaks
        const streakUpdate = await StreakManager.updateStreak(userId, taskType, timestamp);

        // Check for new achievements
        const newAchievements = await AchievementEngine.checkAchievements(userId, {
          taskType,
          xpEarned,
          levelUp: levelResult.leveledUp
        });

        // Prepare response
        const result = {
          xpEarned,
          coinsEarned: coinReward + levelResult.bonusCoins,
          newLevel: levelResult.newLevel,
          leveledUp: levelResult.leveledUp,
          streakUpdate,
          newAchievements,
          nextLevelXP: LevelingSystem.getXPRequiredForNextLevel(levelResult.newLevel)
        };

        // Send real-time updates
        if (levelResult.leveledUp) {
          io.to(`user_${userId}`).emit('levelUp', {
            newLevel: levelResult.newLevel,
            bonusCoins: levelResult.bonusCoins
          });
        }

        if (newAchievements.length > 0) {
          io.to(`user_${userId}`).emit('achievementsUnlocked', newAchievements);
        }

        io.to(`user_${userId}`).emit('progressUpdate', {
          xpEarned,
          coinsEarned: coinReward + levelResult.bonusCoins,
          newTotalXP,
          newCurrentXP: levelResult.newCurrentXP
        });

        logger.info('Task completed successfully', { 
          userId, 
          taskId, 
          taskType, 
          xpEarned, 
          leveledUp: levelResult.leveledUp 
        });

        return result;
      });
    } catch (error) {
      logger.error('Error completing task', { error: error.message, userId, taskId });
      throw error;
    }
  }

  /**
   * Get user's current level and XP progress
   */
  static async getUserLevel(userId) {
    try {
      const result = await query(
        'SELECT level, current_xp, total_xp FROM user_progress WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        throw new Error('User progress not found');
      }

      const { level, current_xp, total_xp } = result.rows[0];
      const xpRequired = LevelingSystem.getXPRequiredForNextLevel(level);
      const progressPercentage = (current_xp / xpRequired) * 100;

      return {
        level,
        currentXP: current_xp,
        totalXP: total_xp,
        xpRequired,
        progressPercentage: Math.round(progressPercentage * 100) / 100
      };
    } catch (error) {
      logger.error('Error getting user level', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Manually award XP to a user
   */
  static async awardXP(userId, amount, source, description) {
    try {
      return await withTransaction(async (client) => {
        // Update user progress
        const result = await client.query(
          `UPDATE user_progress 
           SET current_xp = current_xp + $1, total_xp = total_xp + $1
           WHERE user_id = $2
           RETURNING level, current_xp, total_xp`,
          [amount, userId]
        );

        if (result.rows.length === 0) {
          throw new Error('User progress not found');
        }

        // Record transaction
        await client.query(
          `INSERT INTO xp_transactions (user_id, amount, source, description)
           VALUES ($1, $2, $3, $4)`,
          [userId, amount, source, description || `Manual XP award from ${source}`]
        );

        // Check for level up
        const levelResult = LevelingSystem.processLevelUp({
          currentLevel: result.rows[0].level,
          currentXP: result.rows[0].current_xp,
          totalXP: result.rows[0].total_xp
        });

        if (levelResult.leveledUp) {
          // Update level and award bonus coins
          await client.query(
            `UPDATE user_progress 
             SET level = $1, current_xp = $2, coins = coins + $3
             WHERE user_id = $4`,
            [levelResult.newLevel, levelResult.newCurrentXP, levelResult.bonusCoins, userId]
          );

          // Send real-time update
          io.to(`user_${userId}`).emit('levelUp', {
            newLevel: levelResult.newLevel,
            bonusCoins: levelResult.bonusCoins
          });
        }

        logger.info('XP awarded successfully', { userId, amount, source });

        return {
          xpAwarded: amount,
          newLevel: levelResult.newLevel,
          leveledUp: levelResult.leveledUp,
          bonusCoins: levelResult.bonusCoins
        };
      });
    } catch (error) {
      logger.error('Error awarding XP', { error: error.message, userId, amount });
      throw error;
    }
  }

  /**
   * Get leaderboard data
   */
  static async getLeaderboard(type = 'xp', limit = 10, period = 'all') {
    try {
      let queryText = '';
      let params = [limit];

      switch (type) {
        case 'xp':
          queryText = `
            SELECT u.id, u.username, u.display_name, up.level, up.total_xp, up.coins
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            WHERE u.is_active = true
            ORDER BY up.total_xp DESC
            LIMIT $1
          `;
          break;
        case 'level':
          queryText = `
            SELECT u.id, u.username, u.display_name, up.level, up.total_xp, up.coins
            FROM users u
            JOIN user_progress up ON u.id = up.user_id
            WHERE u.is_active = true
            ORDER BY up.level DESC, up.total_xp DESC
            LIMIT $1
          `;
          break;
        case 'streak':
          queryText = `
            SELECT u.id, u.username, u.display_name, s.current_streak, s.longest_streak
            FROM users u
            JOIN streaks s ON u.id = s.user_id
            WHERE u.is_active = true AND s.streak_type = 'daily_login'
            ORDER BY s.current_streak DESC
            LIMIT $1
          `;
          break;
        case 'achievements':
          queryText = `
            SELECT u.id, u.username, u.display_name, COUNT(ua.id) as achievement_count
            FROM users u
            LEFT JOIN user_achievements ua ON u.id = ua.user_id AND ua.is_unlocked = true
            WHERE u.is_active = true
            GROUP BY u.id, u.username, u.display_name
            ORDER BY achievement_count DESC
            LIMIT $1
          `;
          break;
        default:
          throw new Error('Invalid leaderboard type');
      }

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      logger.error('Error getting leaderboard', { error: error.message, type, limit });
      throw error;
    }
  }

  /**
   * Get user's gamification statistics
   */
  static async getUserStats(userId, period = 'week') {
    try {
      const stats = {};

      // XP statistics
      const xpStats = await query(
        `SELECT 
           COUNT(*) as total_transactions,
           SUM(amount) as total_xp_earned,
           AVG(amount) as avg_xp_per_transaction
         FROM xp_transactions 
         WHERE user_id = $1 
         AND created_at >= NOW() - INTERVAL '1 ${period}'`,
        [userId]
      );

      // Achievement statistics
      const achievementStats = await query(
        `SELECT 
           COUNT(*) as total_achievements,
           COUNT(CASE WHEN is_unlocked = true THEN 1 END) as unlocked_achievements
         FROM user_achievements 
         WHERE user_id = $1`,
        [userId]
      );

      // Streak statistics
      const streakStats = await query(
        `SELECT 
           streak_type,
           current_streak,
           longest_streak
         FROM streaks 
         WHERE user_id = $1`,
        [userId]
      );

      stats.xp = xpStats.rows[0];
      stats.achievements = achievementStats.rows[0];
      stats.streaks = streakStats.rows;

      return stats;
    } catch (error) {
      logger.error('Error getting user stats', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Reset user's gamification progress
   */
  static async resetUserProgress(userId) {
    try {
      return await withTransaction(async (client) => {
        // Reset user progress
        await client.query(
          `UPDATE user_progress 
           SET level = 1, current_xp = 0, total_xp = 0, coins = 100, score = 0
           WHERE user_id = $1`,
          [userId]
        );

        // Reset streaks
        await client.query(
          `UPDATE streaks 
           SET current_streak = 0, bonus_multiplier = 1.0
           WHERE user_id = $1`,
          [userId]
        );

        // Reset achievements
        await client.query(
          `UPDATE user_achievements 
           SET is_unlocked = false, unlocked_at = NULL, progress = '{}'
           WHERE user_id = $1`,
          [userId]
        );

        logger.warn('User progress reset', { userId });
      });
    } catch (error) {
      logger.error('Error resetting user progress', { error: error.message, userId });
      throw error;
    }
  }

  // Helper methods
  static async getUserAchievements(userId) {
    const result = await query(
      `SELECT a.*, ua.is_unlocked, ua.unlocked_at, ua.progress
       FROM achievements a
       LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = $1
       WHERE a.is_active = true
       ORDER BY a.rarity, a.name`,
      [userId]
    );
    return result.rows;
  }

  static async getUserQuests(userId) {
    const result = await query(
      `SELECT q.*, uq.status, uq.progress, uq.started_at, uq.completed_at, uq.expires_at
       FROM quests q
       LEFT JOIN user_quests uq ON q.id = uq.quest_id AND uq.user_id = $1
       WHERE q.is_active = true
       ORDER BY q.type, q.difficulty`,
      [userId]
    );
    return result.rows;
  }

  static async getUserStreaks(userId) {
    const result = await query(
      'SELECT * FROM streaks WHERE user_id = $1 ORDER BY streak_type',
      [userId]
    );
    return result.rows;
  }

  static async getUserStreakDays(userId, streakType) {
    const result = await query(
      'SELECT current_streak FROM streaks WHERE user_id = $1 AND streak_type = $2',
      [userId, streakType]
    );
    return result.rows.length > 0 ? result.rows[0].current_streak : 0;
  }
}
