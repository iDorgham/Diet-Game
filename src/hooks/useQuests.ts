import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';

interface Quest {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'epic' | 'legendary';
  type: 'daily' | 'weekly' | 'monthly';
  xpReward: number;
  coinReward: number;
  progressTarget: number;
  timeLimit: number; // hours
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  startedAt?: Date;
  expiresAt: Date;
  requirements: Record<string, any>;
  isNew?: boolean;
}

interface UserQuest {
  questId: string;
  progress: number;
  isActive: boolean;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export const useQuests = (userId?: string) => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Subscribe to user quests
    const userQuestsRef = doc(db, 'userQuests', userId);
    const unsubscribeUserQuests = onSnapshot(
      userQuestsRef,
      (doc) => {
        if (doc.exists()) {
          const userQuests = doc.data().quests || [];
          
          // Subscribe to available quests
          const questsRef = collection(db, 'quests');
          const questsQuery = query(
            questsRef,
            where('isActive', '==', true),
            orderBy('type', 'asc'),
            orderBy('difficulty', 'asc')
          );
          
          const unsubscribeQuests = onSnapshot(
            questsQuery,
            (snapshot) => {
              const allQuests = snapshot.docs.map(doc => {
                const data = doc.data();
                const userQuest = userQuests.find(
                  (uq: UserQuest) => uq.questId === doc.id
                );
                
                return {
                  id: doc.id,
                  name: data.name,
                  description: data.description,
                  category: data.category,
                  difficulty: data.difficulty,
                  type: data.type,
                  xpReward: data.xpReward,
                  coinReward: data.coinReward,
                  progressTarget: data.progressTarget,
                  timeLimit: data.timeLimit,
                  isActive: userQuest?.isActive || false,
                  isCompleted: userQuest?.isCompleted || false,
                  progress: userQuest?.progress || 0,
                  startedAt: userQuest?.startedAt?.toDate(),
                  expiresAt: data.expiresAt?.toDate() || new Date(),
                  requirements: data.requirements || {},
                  isNew: !userQuest
                } as Quest;
              });
              
              setQuests(allQuests);
              setLoading(false);
              setError(null);
            },
            (err) => {
              console.error('Error fetching quests:', err);
              setError(err.message);
              setLoading(false);
            }
          );
          
          return unsubscribeQuests;
        } else {
          setLoading(false);
        }
      },
      (err) => {
        console.error('Error fetching user quests:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribeUserQuests();
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
