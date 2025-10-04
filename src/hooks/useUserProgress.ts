import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

interface UserProgress {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  stars: number;
  totalXP: number;
  badgesUnlocked: number;
  achievementsUnlocked: number;
  questsCompleted: number;
  streaksActive: number;
  lastUpdated: Date;
}

export const useUserProgress = (userId?: string) => {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'userProgress', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setUserProgress({
            userId: doc.id,
            level: data.level || 1,
            xp: data.xp || 0,
            xpToNextLevel: data.xpToNextLevel || 100,
            stars: data.stars || 0,
            totalXP: data.totalXP || 0,
            badgesUnlocked: data.badgesUnlocked || 0,
            achievementsUnlocked: data.achievementsUnlocked || 0,
            questsCompleted: data.questsCompleted || 0,
            streaksActive: data.streaksActive || 0,
            lastUpdated: data.lastUpdated?.toDate() || new Date()
          });
        } else {
          // Create default progress for new user
          const defaultProgress: UserProgress = {
            userId,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            stars: 0,
            totalXP: 0,
            badgesUnlocked: 0,
            achievementsUnlocked: 0,
            questsCompleted: 0,
            streaksActive: 0,
            lastUpdated: new Date()
          };
          setUserProgress(defaultProgress);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching user progress:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return {
    userProgress,
    loading,
    error,
    refetch: () => {
      // Force refetch by updating the userId dependency
      setLoading(true);
    }
  };
};
