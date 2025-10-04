import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  color: string;
  xpReward: number;
  coinReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  target?: number;
  isNew?: boolean;
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: Date;
  isDisplayed: boolean;
  isNew: boolean;
}

export const useAchievements = (userId?: string) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Subscribe to user achievements
    const userAchievementsRef = doc(db, 'userAchievements', userId);
    const unsubscribeUserAchievements = onSnapshot(
      userAchievementsRef,
      (doc) => {
        if (doc.exists()) {
          const userAchievements = doc.data().achievements || [];
          
          // Subscribe to all achievements
          const achievementsRef = collection(db, 'achievements');
          const achievementsQuery = query(
            achievementsRef,
            orderBy('category', 'asc'),
            orderBy('rarity', 'asc')
          );
          
          const unsubscribeAchievements = onSnapshot(
            achievementsQuery,
            (snapshot) => {
              const allAchievements = snapshot.docs.map(doc => {
                const data = doc.data();
                const userAchievement = userAchievements.find(
                  (ua: UserAchievement) => ua.achievementId === doc.id
                );
                
                return {
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  category: data.category,
                  rarity: data.rarity,
                  icon: data.icon,
                  color: data.color,
                  xpReward: data.xpReward,
                  coinReward: data.coinReward,
                  isUnlocked: !!userAchievement,
                  unlockedAt: userAchievement?.unlockedAt?.toDate(),
                  progress: data.progress || 0,
                  target: data.target || 1,
                  isNew: userAchievement?.isNew || false
                } as Achievement;
              });
              
              setAchievements(allAchievements);
              setLoading(false);
              setError(null);
            },
            (err) => {
              console.error('Error fetching achievements:', err);
              setError(err.message);
              setLoading(false);
            }
          );
          
          return unsubscribeAchievements;
        } else {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching user achievements:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribeUserAchievements();
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
