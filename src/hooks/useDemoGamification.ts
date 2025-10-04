// Demo hooks for gamification components
// Uses demo data when Firebase is not available

import { useState, useEffect } from 'react';
import {
  getDemoUserProgress,
  getDemoAchievements,
  getDemoQuests,
  getDemoStreaks,
  getDemoLeaderboardEntries,
  getNewAchievements,
  getActiveQuests,
  getAvailableQuests,
  getActiveStreaks,
  getAtRiskStreaks,
  DemoUserProgress,
  DemoAchievement,
  DemoQuest,
  DemoStreak,
  DemoLeaderboardEntry
} from '../services/demoData';

// Demo User Progress Hook
export const useDemoUserProgress = (userId?: string) => {
  const [userProgress, setUserProgress] = useState<DemoUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const progress = getDemoUserProgress();
        setUserProgress(progress);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load user progress');
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [userId]);

  return {
    userProgress,
    loading,
    error
  };
};

// Demo Achievements Hook
export const useDemoAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<DemoAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const achievementsData = getDemoAchievements();
        setAchievements(achievementsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load achievements');
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userId]);

  const getAchievementsByCategory = (category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  };

  const getAchievementsByRarity = (rarity: string) => {
    return achievements.filter(achievement => achievement.rarity === rarity);
  };

  const getUnlockedAchievements = () => {
    return achievements.filter(achievement => achievement.isUnlocked);
  };

  const getLockedAchievements = () => {
    return achievements.filter(achievement => !achievement.isUnlocked);
  };

  const getNewAchievements = () => {
    return achievements.filter(achievement => achievement.isNew);
  };

  const getAchievementStats = () => {
    const total = achievements.length;
    const unlocked = achievements.filter(a => a.isUnlocked).length;
    const newAchievements = achievements.filter(a => a.isNew).length;
    
    const byCategory = achievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byRarity = achievements.reduce((acc, achievement) => {
      acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      unlocked,
      locked: total - unlocked,
      newAchievements,
      completionRate: total > 0 ? (unlocked / total) * 100 : 0,
      byCategory,
      byRarity
    };
  };

  return {
    achievements,
    loading,
    error,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUnlockedAchievements,
    getLockedAchievements,
    getNewAchievements,
    getAchievementStats
  };
};

// Demo Quests Hook
export const useDemoQuests = (userId?: string) => {
  const [quests, setQuests] = useState<DemoQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const questsData = getDemoQuests();
        setQuests(questsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load quests');
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [userId]);

  const getQuestsByType = (type: string) => {
    return quests.filter(quest => quest.type === type);
  };

  const getQuestsByCategory = (category: string) => {
    return quests.filter(quest => quest.category === category);
  };

  const getQuestsByDifficulty = (difficulty: string) => {
    return quests.filter(quest => quest.difficulty === difficulty);
  };

  const getActiveQuests = () => {
    return quests.filter(quest => quest.isActive && !quest.isCompleted);
  };

  const getCompletedQuests = () => {
    return quests.filter(quest => quest.isCompleted);
  };

  const getAvailableQuests = () => {
    return quests.filter(quest => !quest.isActive && !quest.isCompleted);
  };

  const getExpiredQuests = () => {
    const now = new Date();
    return quests.filter(quest => 
      quest.isActive && 
      !quest.isCompleted && 
      quest.expiresAt < now
    );
  };

  const getNewQuests = () => {
    return quests.filter(quest => quest.isNew);
  };

  const getQuestStats = () => {
    const total = quests.length;
    const active = quests.filter(q => q.isActive && !q.isCompleted).length;
    const completed = quests.filter(q => q.isCompleted).length;
    const available = quests.filter(q => !q.isActive && !q.isCompleted).length;
    const expired = getExpiredQuests().length;
    
    const byType = quests.reduce((acc, quest) => {
      acc[quest.type] = (acc[quest.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = quests.reduce((acc, quest) => {
      acc[quest.category] = (acc[quest.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byDifficulty = quests.reduce((acc, quest) => {
      acc[quest.difficulty] = (acc[quest.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      completed,
      available,
      expired,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      byType,
      byCategory,
      byDifficulty
    };
  };

  return {
    quests,
    loading,
    error,
    getQuestsByType,
    getQuestsByCategory,
    getQuestsByDifficulty,
    getActiveQuests,
    getCompletedQuests,
    getAvailableQuests,
    getExpiredQuests,
    getNewQuests,
    getQuestStats
  };
};

// Demo Streaks Hook
export const useDemoStreaks = (userId?: string) => {
  const [streaks, setStreaks] = useState<DemoStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const streaksData = getDemoStreaks();
        setStreaks(streaksData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load streaks');
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [userId]);

  const getStreaksByCategory = (category: string) => {
    return streaks.filter(streak => streak.category === category);
  };

  const getActiveStreaks = () => {
    return streaks.filter(streak => streak.isActive);
  };

  const getBrokenStreaks = () => {
    return streaks.filter(streak => !streak.isActive);
  };

  const getProtectedStreaks = () => {
    return streaks.filter(streak => streak.isProtected);
  };

  const getStreakStats = () => {
    const total = streaks.length;
    const active = streaks.filter(s => s.isActive).length;
    const broken = streaks.filter(s => !s.isActive).length;
    const protected_ = streaks.filter(s => s.isProtected).length;
    
    const totalDays = streaks.reduce((sum, streak) => sum + streak.currentCount, 0);
    const maxStreak = Math.max(...streaks.map(s => s.maxCount), 0);
    const averageStreak = total > 0 ? totalDays / total : 0;
    
    const byCategory = streaks.reduce((acc, streak) => {
      acc[streak.category] = (acc[streak.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalFreezeTokens = streaks.reduce((sum, streak) => sum + streak.freezeTokensAvailable, 0);
    const totalXP = streaks.reduce((sum, streak) => sum + streak.totalXP, 0);
    const totalCoins = streaks.reduce((sum, streak) => sum + streak.totalCoins, 0);

    return {
      total,
      active,
      broken,
      protected: protected_,
      totalDays,
      maxStreak,
      averageStreak,
      retentionRate: total > 0 ? (active / total) * 100 : 0,
      byCategory,
      totalFreezeTokens,
      totalXP,
      totalCoins
    };
  };

  const getAtRiskStreaks = () => {
    const now = Date.now();
    return streaks.filter(streak => {
      if (!streak.isActive) return false;
      
      const timeSinceLastActivity = now - streak.lastActivity.getTime();
      const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60);
      
      return hoursSinceLastActivity > 12; // At risk if no activity for 12+ hours
    });
  };

  return {
    streaks,
    loading,
    error,
    getStreaksByCategory,
    getActiveStreaks,
    getBrokenStreaks,
    getProtectedStreaks,
    getStreakStats,
    getAtRiskStreaks
  };
};

// Demo Leaderboard Hook
export const useDemoLeaderboard = (category: string = 'overall', timeRange: string = 'all_time') => {
  const [entries, setEntries] = useState<DemoLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const leaderboardData = getDemoLeaderboardEntries();
        setEntries(leaderboardData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [category, timeRange]);

  return {
    entries,
    loading,
    error
  };
};
