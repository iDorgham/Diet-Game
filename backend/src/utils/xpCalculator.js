// XP Calculation Engine
// Sprint 7-8: Core Backend Development - Day 2 Task 2.1

import { logger } from './logger.js';

export class XPCalculator {
  
  // Base XP values for different task types
  static readonly BASE_XP_VALUES = {
    MEAL_LOG: 15,
    EXERCISE_LOG: 25,
    WATER_LOG: 10,
    RECIPE_TRY: 20,
    GOAL_ACHIEVEMENT: 50,
    STREAK_MILESTONE: 100,
    COMMUNITY_INTERACTION: 5,
    AI_CHAT: 10,
    NUTRITION_TRACKING: 15,
    SHOPPING: 20,
    COOKING: 30,
    DAILY_CHECKIN: 20,
    WORKOUT: 40,
    HYDRATION: 15
  };

  // Difficulty multipliers
  static readonly DIFFICULTY_MULTIPLIERS = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0,
    expert: 3.0
  };

  // Streak bonus multipliers
  static readonly STREAK_MULTIPLIERS = {
    3: 1.2,    // 20% bonus for 3-day streak
    7: 1.5,    // 50% bonus for 7-day streak
    14: 2.0,   // 100% bonus for 14-day streak
    30: 3.0,   // 200% bonus for 30-day streak
    60: 4.0,   // 300% bonus for 60-day streak
    100: 5.0   // 400% bonus for 100-day streak
  };

  /**
   * Calculate XP for a task completion
   */
  static calculateXP({ taskType, difficulty, userLevel, streakDays, timeBonus = false, perfectScore = false }) {
    try {
      // Get base XP for task type
      let baseXP = this.BASE_XP_VALUES[taskType] || 10;
      
      // Apply difficulty multiplier
      const difficultyMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
      baseXP *= difficultyMultiplier;
      
      // Apply streak bonus
      const streakBonus = this.calculateStreakBonus(streakDays);
      baseXP *= streakBonus;
      
      // Apply time bonus (early completion)
      if (timeBonus) {
        baseXP *= 1.25; // 25% bonus for early completion
      }
      
      // Apply perfect score bonus
      if (perfectScore) {
        baseXP *= 1.5; // 50% bonus for perfect score
      }
      
      // Apply level scaling (higher levels get slightly less XP to maintain balance)
      const levelScaling = this.calculateLevelScaling(userLevel);
      baseXP *= levelScaling;
      
      // Round to nearest integer
      const finalXP = Math.round(baseXP);
      
      logger.debug('XP calculated', {
        taskType,
        difficulty,
        userLevel,
        streakDays,
        baseXP: this.BASE_XP_VALUES[taskType] || 10,
        difficultyMultiplier,
        streakBonus,
        levelScaling,
        finalXP
      });
      
      return finalXP;
    } catch (error) {
      logger.error('Error calculating XP', { error: error.message, taskType, difficulty });
      return 10; // Fallback XP
    }
  }

  /**
   * Calculate streak bonus multiplier
   */
  static calculateStreakBonus(streakDays) {
    if (streakDays >= 100) return this.STREAK_MULTIPLIERS[100];
    if (streakDays >= 60) return this.STREAK_MULTIPLIERS[60];
    if (streakDays >= 30) return this.STREAK_MULTIPLIERS[30];
    if (streakDays >= 14) return this.STREAK_MULTIPLIERS[14];
    if (streakDays >= 7) return this.STREAK_MULTIPLIERS[7];
    if (streakDays >= 3) return this.STREAK_MULTIPLIERS[3];
    return 1.0; // No bonus
  }

  /**
   * Calculate level scaling factor
   * Higher levels get slightly less XP to maintain game balance
   */
  static calculateLevelScaling(level) {
    // Scale factor: 1.0 at level 1, 0.8 at level 50, 0.6 at level 100
    return Math.max(0.6, 1 - (level * 0.008));
  }

  /**
   * Calculate XP for achievement unlock
   */
  static calculateAchievementXP(achievement) {
    const rarityMultipliers = {
      common: 1.0,
      rare: 2.0,
      epic: 5.0,
      legendary: 10.0
    };
    
    const baseXP = 50; // Base XP for any achievement
    const rarityMultiplier = rarityMultipliers[achievement.rarity] || 1.0;
    
    return Math.round(baseXP * rarityMultiplier);
  }

  /**
   * Calculate XP for level up bonus
   */
  static calculateLevelUpXP(level) {
    // Level up bonus increases with level
    return Math.round(level * 10 + 50);
  }

  /**
   * Calculate XP for streak milestone
   */
  static calculateStreakMilestoneXP(streakDays) {
    if (streakDays >= 100) return 500;
    if (streakDays >= 60) return 300;
    if (streakDays >= 30) return 200;
    if (streakDays >= 14) return 100;
    if (streakDays >= 7) return 50;
    return 0;
  }

  /**
   * Calculate XP for social interactions
   */
  static calculateSocialXP(interactionType, engagementLevel = 'medium') {
    const baseValues = {
      friend_request: 10,
      friend_accept: 15,
      challenge_created: 20,
      challenge_completed: 25,
      leaderboard_position: 30,
      community_post: 5,
      community_like: 2,
      community_comment: 3
    };
    
    const engagementMultipliers = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
      viral: 2.0
    };
    
    const baseXP = baseValues[interactionType] || 5;
    const engagementMultiplier = engagementMultipliers[engagementLevel] || 1.0;
    
    return Math.round(baseXP * engagementMultiplier);
  }

  /**
   * Calculate XP for quest completion
   */
  static calculateQuestXP(quest) {
    const difficultyMultipliers = {
      easy: 1.0,
      medium: 2.0,
      hard: 4.0,
      expert: 8.0
    };
    
    const typeMultipliers = {
      daily: 1.0,
      weekly: 3.0,
      monthly: 10.0,
      special: 5.0
    };
    
    const baseXP = 100; // Base XP for quest completion
    const difficultyMultiplier = difficultyMultipliers[quest.difficulty] || 1.0;
    const typeMultiplier = typeMultipliers[quest.type] || 1.0;
    
    return Math.round(baseXP * difficultyMultiplier * typeMultiplier);
  }

  /**
   * Validate XP calculation parameters
   */
  static validateXPParams({ taskType, difficulty, userLevel, streakDays }) {
    const errors = [];
    
    if (!taskType || typeof taskType !== 'string') {
      errors.push('Task type is required and must be a string');
    }
    
    if (difficulty && !this.DIFFICULTY_MULTIPLIERS[difficulty]) {
      errors.push(`Invalid difficulty level: ${difficulty}`);
    }
    
    if (userLevel && (typeof userLevel !== 'number' || userLevel < 1)) {
      errors.push('User level must be a positive number');
    }
    
    if (streakDays && (typeof streakDays !== 'number' || streakDays < 0)) {
      errors.push('Streak days must be a non-negative number');
    }
    
    return errors;
  }

  /**
   * Get XP breakdown for transparency
   */
  static getXPBreakdown({ taskType, difficulty, userLevel, streakDays, timeBonus, perfectScore }) {
    const baseXP = this.BASE_XP_VALUES[taskType] || 10;
    const difficultyMultiplier = this.DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
    const streakBonus = this.calculateStreakBonus(streakDays);
    const levelScaling = this.calculateLevelScaling(userLevel);
    
    let finalXP = baseXP * difficultyMultiplier * streakBonus * levelScaling;
    
    if (timeBonus) finalXP *= 1.25;
    if (perfectScore) finalXP *= 1.5;
    
    return {
      baseXP,
      difficultyMultiplier,
      streakBonus,
      levelScaling,
      timeBonus: timeBonus ? 1.25 : 1.0,
      perfectScore: perfectScore ? 1.5 : 1.0,
      finalXP: Math.round(finalXP)
    };
  }
}
