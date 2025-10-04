// Optimized gamification hooks with performance improvements
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import {
  getDemoUserProgress,
  getDemoAchievements,
  getDemoQuests,
  getDemoStreaks,
  getDemoLeaderboardEntries,
  DemoUserProgress,
  DemoAchievement,
  DemoQuest,
  DemoStreak,
  DemoLeaderboardEntry
} from '../services/demoData';

// Cache for demo data to prevent recreation
const demoDataCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Optimized User Progress Hook with caching
export const useOptimizedUserProgress = (userId?: string) => {
  const [userProgress, setUserProgress] = useState<DemoUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = `userProgress_${userId}`;
    const cached = demoDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setUserProgress(cached.data);
      setLoading(false);
      return;
    }

    // Simulate API call with debounced loading
    const timer = setTimeout(() => {
      try {
        const progress = getDemoUserProgress();
        
        // Cache the result
        demoDataCache.set(cacheKey, {
          data: progress,
          timestamp: Date.now()
        });
        
        setUserProgress(progress);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load user progress');
        setLoading(false);
      }
    }, 100); // Reduced delay

    return () => {
      clearTimeout(timer);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  // Memoized calculations
  const progressStats = useMemo(() => {
    if (!userProgress) return null;
    
    return {
      levelProgress: (userProgress.xp / userProgress.xpToNextLevel) * 100,
      totalStars: userProgress.stars,
      completionRate: (userProgress.achievementsUnlocked / 50) * 100, // Assuming 50 total achievements
      nextLevelXP: userProgress.xpToNextLevel - userProgress.xp
    };
  }, [userProgress]);

  return {
    userProgress,
    loading,
    error,
    progressStats
  };
};

// Optimized Achievements Hook with virtualization support
export const useOptimizedAchievements = (userId?: string, pageSize: number = 20) => {
  const [achievements, setAchievements] = useState<DemoAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const cacheKey = `achievements_${userId}`;
    const cached = demoDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAchievements(cached.data);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const achievementsData = getDemoAchievements();
        
        demoDataCache.set(cacheKey, {
          data: achievementsData,
          timestamp: Date.now()
        });
        
        setAchievements(achievementsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load achievements');
        setLoading(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [userId]);

  // Memoized filtered data
  const filteredAchievements = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return achievements.slice(startIndex, startIndex + pageSize);
  }, [achievements, currentPage, pageSize]);

  // Memoized filter functions
  const getAchievementsByCategory = useCallback((category: string) => {
    return achievements.filter(achievement => achievement.category === category);
  }, [achievements]);

  const getAchievementsByRarity = useCallback((rarity: string) => {
    return achievements.filter(achievement => achievement.rarity === rarity);
  }, [achievements]);

  const getUnlockedAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.isUnlocked);
  }, [achievements]);

  const getNewAchievements = useCallback(() => {
    return achievements.filter(achievement => achievement.isNew);
  }, [achievements]);

  // Memoized stats
  const achievementStats = useMemo(() => {
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
  }, [achievements]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const hasMore = useMemo(() => {
    return (currentPage + 1) * pageSize < achievements.length;
  }, [currentPage, pageSize, achievements.length]);

  return {
    achievements: filteredAchievements,
    allAchievements: achievements,
    loading,
    error,
    getAchievementsByCategory,
    getAchievementsByRarity,
    getUnlockedAchievements,
    getNewAchievements,
    getAchievementStats: () => achievementStats,
    loadMore,
    hasMore,
    currentPage,
    totalPages: Math.ceil(achievements.length / pageSize)
  };
};

// Optimized Quests Hook
export const useOptimizedQuests = (userId?: string) => {
  const [quests, setQuests] = useState<DemoQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const cacheKey = `quests_${userId}`;
    const cached = demoDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setQuests(cached.data);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const questsData = getDemoQuests();
        
        demoDataCache.set(cacheKey, {
          data: questsData,
          timestamp: Date.now()
        });
        
        setQuests(questsData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load quests');
        setLoading(false);
      }
    }, 75);

    return () => clearTimeout(timer);
  }, [userId]);

  // Memoized filtered data
  const activeQuests = useMemo(() => {
    return quests.filter(quest => quest.isActive && !quest.isCompleted);
  }, [quests]);

  const availableQuests = useMemo(() => {
    return quests.filter(quest => !quest.isActive && !quest.isCompleted);
  }, [quests]);

  const completedQuests = useMemo(() => {
    return quests.filter(quest => quest.isCompleted);
  }, [quests]);

  const newQuests = useMemo(() => {
    return quests.filter(quest => quest.isNew);
  }, [quests]);

  // Memoized filter functions
  const getQuestsByType = useCallback((type: string) => {
    return quests.filter(quest => quest.type === type);
  }, [quests]);

  const getQuestsByCategory = useCallback((category: string) => {
    return quests.filter(quest => quest.category === category);
  }, [quests]);

  const getQuestsByDifficulty = useCallback((difficulty: string) => {
    return quests.filter(quest => quest.difficulty === difficulty);
  }, [quests]);

  return {
    quests,
    loading,
    error,
    getQuestsByType,
    getQuestsByCategory,
    getQuestsByDifficulty,
    getActiveQuests: () => activeQuests,
    getCompletedQuests: () => completedQuests,
    getAvailableQuests: () => availableQuests,
    getNewQuests: () => newQuests
  };
};

// Optimized Streaks Hook
export const useOptimizedStreaks = (userId?: string) => {
  const [streaks, setStreaks] = useState<DemoStreak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const cacheKey = `streaks_${userId}`;
    const cached = demoDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setStreaks(cached.data);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const streaksData = getDemoStreaks();
        
        demoDataCache.set(cacheKey, {
          data: streaksData,
          timestamp: Date.now()
        });
        
        setStreaks(streaksData);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load streaks');
        setLoading(false);
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [userId]);

  // Memoized filtered data
  const activeStreaks = useMemo(() => {
    return streaks.filter(streak => streak.isActive);
  }, [streaks]);

  const atRiskStreaks = useMemo(() => {
    const now = Date.now();
    return streaks.filter(streak => {
      if (!streak.isActive) return false;
      
      const timeSinceLastActivity = now - streak.lastActivity.getTime();
      const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60);
      
      return hoursSinceLastActivity > 12;
    });
  }, [streaks]);

  const protectedStreaks = useMemo(() => {
    return streaks.filter(streak => streak.isProtected);
  }, [streaks]);

  // Memoized filter functions
  const getStreaksByCategory = useCallback((category: string) => {
    return streaks.filter(streak => streak.category === category);
  }, [streaks]);

  return {
    streaks,
    loading,
    error,
    getStreaksByCategory,
    getActiveStreaks: () => activeStreaks,
    getAtRiskStreaks: () => atRiskStreaks,
    getProtectedStreaks: () => protectedStreaks
  };
};

// Optimized Leaderboard Hook with pagination
export const useOptimizedLeaderboard = (
  category: string = 'overall', 
  timeRange: string = 'all_time',
  pageSize: number = 50
) => {
  const [entries, setEntries] = useState<DemoLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Debounce category/timeRange changes
  const debouncedCategory = useDebounce(category, 300);
  const debouncedTimeRange = useDebounce(timeRange, 300);

  useEffect(() => {
    const cacheKey = `leaderboard_${debouncedCategory}_${debouncedTimeRange}`;
    const cached = demoDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setEntries(cached.data);
      setLoading(false);
      setCurrentPage(0);
      return;
    }

    const timer = setTimeout(() => {
      try {
        const leaderboardData = getDemoLeaderboardEntries();
        
        demoDataCache.set(cacheKey, {
          data: leaderboardData,
          timestamp: Date.now()
        });
        
        setEntries(leaderboardData);
        setLoading(false);
        setError(null);
        setCurrentPage(0);
      } catch (err) {
        setError('Failed to load leaderboard');
        setLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [debouncedCategory, debouncedTimeRange]);

  // Memoized paginated data
  const paginatedEntries = useMemo(() => {
    const startIndex = currentPage * pageSize;
    return entries.slice(startIndex, startIndex + pageSize);
  }, [entries, currentPage, pageSize]);

  const loadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const hasMore = useMemo(() => {
    return (currentPage + 1) * pageSize < entries.length;
  }, [currentPage, pageSize, entries.length]);

  return {
    entries: paginatedEntries,
    allEntries: entries,
    loading,
    error,
    loadMore,
    hasMore,
    currentPage,
    totalPages: Math.ceil(entries.length / pageSize)
  };
};

// Cache management utilities
export const clearGamificationCache = () => {
  demoDataCache.clear();
};

export const getCacheStats = () => {
  return {
    size: demoDataCache.size,
    keys: Array.from(demoDataCache.keys())
  };
};
