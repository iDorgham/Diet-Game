// XP System tests following docs/gamification/xp-system.md
// Testing EARS-GAM-001 through EARS-GAM-005

import { describe, it, expect, vi } from 'vitest';
import {
  calculateXPForNextLevel,
  checkAndApplyLevelUp,
  calculateStars,
  getNextStarThreshold,
  getScoreRemainingForNextStar,
  awardXPForTask,
  calculateXPProgress,
  XP_REWARDS,
  STAR_THRESHOLDS,
  STREAK_MULTIPLIERS,
} from '../utils/xp-system';

describe('XP System', () => {
  describe('EARS-GAM-002: Level Calculation', () => {
    it('should calculate XP required for next level correctly', () => {
      expect(calculateXPForNextLevel(1)).toBe(100);
      expect(calculateXPForNextLevel(2)).toBe(200);
      expect(calculateXPForNextLevel(5)).toBe(500);
      expect(calculateXPForNextLevel(10)).toBe(1000);
    });
  });

  describe('EARS-GAM-003: Level Up Logic', () => {
    it('should award bonus coins for level up', () => {
      const setMessage = vi.fn();
      const result = checkAndApplyLevelUp(
        { level: 1, currentXP: 50, coins: 100 },
        100, // Enough XP to level up
        setMessage
      );

      expect(result.level).toBe(2);
      expect(result.bonusCoins).toBe(50);
      expect(result.leveledUp).toBe(true);
      expect(setMessage).toHaveBeenCalledWith(
        '✨ Congratulations! You reached Level 2! (+50 Bonus Coins!)'
      );
    });

    it('should handle multiple level ups', () => {
      const setMessage = vi.fn();
      const result = checkAndApplyLevelUp(
        { level: 1, currentXP: 0, coins: 0 },
        350, // Enough XP for 3 level ups
        setMessage
      );

      expect(result.level).toBe(4);
      expect(result.bonusCoins).toBe(150); // 50 * 3 levels
      expect(result.leveledUp).toBe(true);
      expect(setMessage).toHaveBeenCalledTimes(3);
    });

    it('should not level up if insufficient XP', () => {
      const setMessage = vi.fn();
      const result = checkAndApplyLevelUp(
        { level: 1, currentXP: 50, coins: 100 },
        30, // Not enough XP to level up
        setMessage
      );

      expect(result.level).toBe(1);
      expect(result.currentXP).toBe(80);
      expect(result.bonusCoins).toBe(0);
      expect(result.leveledUp).toBe(false);
      expect(setMessage).not.toHaveBeenCalled();
    });
  });

  describe('EARS-GAM-001: XP Rewards', () => {
    it('should award correct XP for different task types', () => {
      expect(awardXPForTask('MEAL')).toBe(XP_REWARDS.MEAL);
      expect(awardXPForTask('SHOPPING')).toBe(XP_REWARDS.SHOPPING);
      expect(awardXPForTask('COOKING')).toBe(XP_REWARDS.COOKING);
      expect(awardXPForTask('EXERCISE')).toBe(XP_REWARDS.EXERCISE);
      expect(awardXPForTask('WATER')).toBe(XP_REWARDS.WATER);
      expect(awardXPForTask('DAILY_CHECKIN')).toBe(XP_REWARDS.DAILY_CHECKIN);
      expect(awardXPForTask('AI_CHAT')).toBe(XP_REWARDS.AI_CHAT);
    });

    it('should apply streak multipliers correctly', () => {
      expect(awardXPForTask('MEAL', 3)).toBe(Math.round(XP_REWARDS.MEAL * STREAK_MULTIPLIERS[3]));
      expect(awardXPForTask('MEAL', 7)).toBe(Math.round(XP_REWARDS.MEAL * STREAK_MULTIPLIERS[7]));
      expect(awardXPForTask('MEAL', 14)).toBe(Math.round(XP_REWARDS.MEAL * STREAK_MULTIPLIERS[14]));
      expect(awardXPForTask('MEAL', 30)).toBe(Math.round(XP_REWARDS.MEAL * STREAK_MULTIPLIERS[30]));
    });

    it('should handle unknown task types', () => {
      expect(awardXPForTask('UNKNOWN')).toBe(10); // Default value
    });
  });

  describe('Star Milestone System', () => {
    it('should calculate stars correctly', () => {
      expect(calculateStars(25)).toBe(0);
      expect(calculateStars(50)).toBe(1);
      expect(calculateStars(100)).toBe(1);
      expect(calculateStars(250)).toBe(2);
      expect(calculateStars(500)).toBe(2);
      expect(calculateStars(750)).toBe(3);
      expect(calculateStars(1000)).toBe(3);
      expect(calculateStars(2000)).toBe(4);
      expect(calculateStars(3000)).toBe(4);
      expect(calculateStars(5000)).toBe(5);
      expect(calculateStars(10000)).toBe(5);
    });

    it('should get next star threshold correctly', () => {
      expect(getNextStarThreshold(25)).toBe(STAR_THRESHOLDS[0]); // 50
      expect(getNextStarThreshold(50)).toBe(STAR_THRESHOLDS[1]); // 250
      expect(getNextStarThreshold(250)).toBe(STAR_THRESHOLDS[2]); // 750
      expect(getNextStarThreshold(5000)).toBe(null); // Max level
    });

    it('should calculate score remaining for next star', () => {
      expect(getScoreRemainingForNextStar(25)).toBe(25); // 50 - 25
      expect(getScoreRemainingForNextStar(50)).toBe(200); // 250 - 50
      expect(getScoreRemainingForNextStar(5000)).toBe(0); // Max level
    });
  });

  describe('EARS-GAM-005: Progress Calculation', () => {
    it('should calculate XP progress percentage correctly', () => {
      expect(calculateXPProgress(0, 1)).toBe(0);
      expect(calculateXPProgress(50, 1)).toBe(50);
      expect(calculateXPProgress(100, 1)).toBe(100);
      expect(calculateXPProgress(150, 1)).toBe(150); // Over 100% is allowed
    });

    it('should handle edge cases', () => {
      expect(calculateXPProgress(0, 0)).toBe(Infinity); // Division by zero
      expect(calculateXPProgress(-10, 1)).toBe(-10); // Negative XP
    });
  });

  describe('Constants Validation', () => {
    it('should have correct XP reward values', () => {
      expect(XP_REWARDS.MEAL).toBe(15);
      expect(XP_REWARDS.SHOPPING).toBe(20);
      expect(XP_REWARDS.COOKING).toBe(30);
      expect(XP_REWARDS.EXERCISE).toBe(40);
      expect(XP_REWARDS.WATER).toBe(15);
      expect(XP_REWARDS.DAILY_CHECKIN).toBe(20);
      expect(XP_REWARDS.AI_CHAT).toBe(10);
    });

    it('should have correct star thresholds', () => {
      expect(STAR_THRESHOLDS).toEqual([50, 250, 750, 2000, 5000]);
    });

    it('should have correct streak multipliers', () => {
      expect(STREAK_MULTIPLIERS[3]).toBe(1.2);
      expect(STREAK_MULTIPLIERS[7]).toBe(1.5);
      expect(STREAK_MULTIPLIERS[14]).toBe(2.0);
      expect(STREAK_MULTIPLIERS[30]).toBe(3.0);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete level progression', () => {
      const setMessage = vi.fn();
      let progress = { level: 1, currentXP: 0, coins: 0 };

      // Complete multiple tasks
      const tasks = [
        { type: 'MEAL', streak: 0 },
        { type: 'SHOPPING', streak: 0 },
        { type: 'COOKING', streak: 0 },
        { type: 'EXERCISE', streak: 0 },
      ];

      tasks.forEach(task => {
        const xpGained = awardXPForTask(task.type, task.streak);
        const result = checkAndApplyLevelUp(progress, xpGained, setMessage);
        progress = { ...progress, ...result };
      });

      expect(progress.level).toBeGreaterThan(1);
      expect(progress.bonusCoins).toBeGreaterThan(0);
    });

    it('should handle streak progression', () => {
      const baseXP = awardXPForTask('MEAL', 0);
      const streak3XP = awardXPForTask('MEAL', 3);
      const streak7XP = awardXPForTask('MEAL', 7);

      expect(streak3XP).toBeGreaterThan(baseXP);
      expect(streak7XP).toBeGreaterThan(streak3XP);
    });
  });
});
