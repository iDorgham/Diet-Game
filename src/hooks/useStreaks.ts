import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Streak {
  id: string;
  name: string;
  description: string;
  category: string;
  currentCount: number;
  maxCount: number;
  isActive: boolean;
  isProtected: boolean;
  lastActivity: Date;
  protectionExpires?: Date;
  freezeTokensUsed: number;
  freezeTokensAvailable: number;
  milestonesReached: number[];
  totalXP: number;
  totalCoins: number;
}

export const useStreaks = (userId?: string) => {
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'userStreaks', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const userStreaks = data.streaks || [];
          
          const formattedStreaks = userStreaks.map((streak: any) => ({
            id: streak.id,
            name: streak.name,
            description: streak.description,
            category: streak.category,
            currentCount: streak.currentCount || 0,
            maxCount: streak.maxCount || 0,
            isActive: streak.isActive || false,
            isProtected: streak.isProtected || false,
            lastActivity: streak.lastActivity?.toDate() || new Date(),
            protectionExpires: streak.protectionExpires?.toDate(),
            freezeTokensUsed: streak.freezeTokensUsed || 0,
            freezeTokensAvailable: streak.freezeTokensAvailable || 0,
            milestonesReached: streak.milestonesReached || [],
            totalXP: streak.totalXP || 0,
            totalCoins: streak.totalCoins || 0
          }));
          
          setStreaks(formattedStreaks);
        } else {
          // Create default streaks for new user
          const defaultStreaks: Streak[] = [
            {
              id: 'daily_login',
              name: 'Daily Login',
              description: 'Consecutive days of app usage',
              category: 'engagement',
              currentCount: 0,
              maxCount: 0,
              isActive: false,
              isProtected: false,
              lastActivity: new Date(),
              freezeTokensUsed: 0,
              freezeTokensAvailable: 3,
              milestonesReached: [],
              totalXP: 0,
              totalCoins: 0
            },
            {
              id: 'meal_logging',
              name: 'Meal Logging',
              description: 'Consecutive days of logging all meals',
              category: 'nutrition',
              currentCount: 0,
              maxCount: 0,
              isActive: false,
              isProtected: false,
              lastActivity: new Date(),
              freezeTokensUsed: 0,
              freezeTokensAvailable: 2,
              milestonesReached: [],
              totalXP: 0,
              totalCoins: 0
            },
            {
              id: 'exercise',
              name: 'Exercise',
              description: 'Consecutive days of exercise logging',
              category: 'fitness',
              currentCount: 0,
              maxCount: 0,
              isActive: false,
              isProtected: false,
              lastActivity: new Date(),
              freezeTokensUsed: 0,
              freezeTokensAvailable: 1,
              milestonesReached: [],
              totalXP: 0,
              totalCoins: 0
            },
            {
              id: 'water_intake',
              name: 'Water Intake',
              description: 'Consecutive days of meeting water goals',
              category: 'health',
              currentCount: 0,
              maxCount: 0,
              isActive: false,
              isProtected: false,
              lastActivity: new Date(),
              freezeTokensUsed: 0,
              freezeTokensAvailable: 2,
              milestonesReached: [],
              totalXP: 0,
              totalCoins: 0
            }
          ];
          setStreaks(defaultStreaks);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching streaks:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
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
