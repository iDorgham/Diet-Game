// Advanced state management following Level 303 requirements
// Zustand store with persistence and real-time sync

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { subscribeWithSelector } from 'zustand/middleware';
import { UserProgress, UserProfile, HeaderStatus } from '../types';
import { 
  calculateXPForNextLevel, 
  checkAndApplyLevelUp, 
  calculateStars,
  awardXPForTask 
} from '../utils/xp-system';

interface NutriState {
  // User Data
  progress: UserProgress;
  userProfile: UserProfile;
  headerStatus: HeaderStatus;
  
  // App State
  isOnline: boolean;
  lastSyncTime: number;
  pendingUpdates: Array<{
    id: string;
    type: 'progress' | 'profile';
    data: any;
    timestamp: number;
  }>;
  
  // UI State
  activePage: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  updateProgress: (updates: Partial<UserProgress>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  completeTask: (taskId: number, taskType: string, streak: number) => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  addPendingUpdate: (update: any) => void;
  clearPendingUpdates: () => void;
  setActivePage: (page: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed Values
  getXPProgress: () => number;
  getStars: () => number;
  getNextStarThreshold: () => number | null;
  getScoreRemainingForNextStar: () => number;
}

export const useNutriStore = create<NutriState>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // Initial State
        progress: {
          score: 3500,
          coins: 2000,
          recipesUnlocked: 10,
          hasClaimedGift: false,
          level: 3,
          currentXP: 150,
        },
        userProfile: {
          userName: 'Yasser',
          dietType: 'Keto Diet',
          bodyType: 'Mesomorph',
          weight: '175 lbs',
        },
        headerStatus: {
          currentDayTime: { day: 'Sat', time: '12:01 AM' },
          daysUntilNextPlan: 2,
          dietType: 'Keto Diet',
          nextCookingTime: { isPending: true, timeString: '2h 30m', minutesRemaining: 150 },
          nextWorkoutTime: { isPending: true, timeString: '5h 15m' },
        },
        
        // App State
        isOnline: true,
        lastSyncTime: Date.now(),
        pendingUpdates: [],
        
        // UI State
        activePage: 'Home',
        isLoading: false,
        error: null,
        
        // Actions
        updateProgress: (updates) => set((state) => {
          Object.assign(state.progress, updates);
          state.lastSyncTime = Date.now();
        }),
        
        updateProfile: (updates) => set((state) => {
          Object.assign(state.userProfile, updates);
          state.lastSyncTime = Date.now();
        }),
        
        completeTask: async (taskId, taskType, streak) => {
          const state = get();
          set((draft) => {
            draft.isLoading = true;
            draft.error = null;
          });
          
          try {
            // Calculate rewards
            const xpReward = awardXPForTask(taskType, streak);
            const scoreReward = Math.floor(xpReward * 0.5); // 50% of XP as score
            const coinReward = Math.floor(xpReward * 0.3); // 30% of XP as coins
            
            // Update progress
            const newProgress = {
              ...state.progress,
              score: state.progress.score + scoreReward,
              coins: state.progress.coins + coinReward,
              currentXP: state.progress.currentXP + xpReward,
            };
            
            // Check for level up
            const levelUpResult = checkAndApplyLevelUp(
              newProgress,
              xpReward,
              (message) => {
                // Handle level up message
                console.log(message);
              }
            );
            
            set((draft) => {
              draft.progress = levelUpResult;
              draft.isLoading = false;
            });
            
            // Add to pending updates for sync
            get().addPendingUpdate({
              id: `task-${taskId}-${Date.now()}`,
              type: 'progress',
              data: levelUpResult,
              timestamp: Date.now(),
            });
            
          } catch (error) {
            set((draft) => {
              draft.isLoading = false;
              draft.error = error instanceof Error ? error.message : 'Task completion failed';
            });
          }
        },
        
        setOnlineStatus: (isOnline) => set((state) => {
          state.isOnline = isOnline;
          if (isOnline && state.pendingUpdates.length > 0) {
            // Trigger sync when coming back online
            console.log('Back online, syncing pending updates...');
          }
        }),
        
        addPendingUpdate: (update) => set((state) => {
          state.pendingUpdates.push(update);
        }),
        
        clearPendingUpdates: () => set((state) => {
          state.pendingUpdates = [];
        }),
        
        setActivePage: (page) => set((state) => {
          state.activePage = page;
        }),
        
        setLoading: (loading) => set((state) => {
          state.isLoading = loading;
        }),
        
        setError: (error) => set((state) => {
          state.error = error;
        }),
        
        // Computed Values
        getXPProgress: () => {
          const { progress } = get();
          return (progress.currentXP / calculateXPForNextLevel(progress.level)) * 100;
        },
        
        getStars: () => {
          const { progress } = get();
          return calculateStars(progress.score);
        },
        
        getNextStarThreshold: () => {
          const { progress } = get();
          const stars = calculateStars(progress.score);
          const thresholds = [50, 250, 750, 2000, 5000];
          return stars < thresholds.length ? thresholds[stars] : null;
        },
        
        getScoreRemainingForNextStar: () => {
          const { progress } = get();
          const nextThreshold = get().getNextStarThreshold();
          return nextThreshold ? nextThreshold - progress.score : 0;
        },
      })),
      {
        name: 'nutriquest-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          progress: state.progress,
          userProfile: state.userProfile,
          headerStatus: state.headerStatus,
          lastSyncTime: state.lastSyncTime,
        }),
      }
    )
  )
);

// Selectors for optimized re-renders
export const useProgress = () => useNutriStore((state) => state.progress);
export const useUserProfile = () => useNutriStore((state) => state.userProfile);
export const useHeaderStatus = () => useNutriStore((state) => state.headerStatus);
export const useOnlineStatus = () => useNutriStore((state) => state.isOnline);
export const usePendingUpdates = () => useNutriStore((state) => state.pendingUpdates);
export const useAppState = () => useNutriStore((state) => ({
  activePage: state.activePage,
  isLoading: state.isLoading,
  error: state.error,
}));

// Computed selectors
export const useXPProgress = () => useNutriStore((state) => state.getXPProgress());
export const useStars = () => useNutriStore((state) => state.getStars());
export const useNextStarThreshold = () => useNutriStore((state) => state.getNextStarThreshold());
export const useScoreRemainingForNextStar = () => useNutriStore((state) => state.getScoreRemainingForNextStar());

// Action selectors
export const useNutriActions = () => useNutriStore((state) => ({
  updateProgress: state.updateProgress,
  updateProfile: state.updateProfile,
  completeTask: state.completeTask,
  setOnlineStatus: state.setOnlineStatus,
  addPendingUpdate: state.addPendingUpdate,
  clearPendingUpdates: state.clearPendingUpdates,
  setActivePage: state.setActivePage,
  setLoading: state.setLoading,
  setError: state.setError,
}));

// Subscribe to specific changes
export const subscribeToProgress = (callback: (progress: UserProgress) => void) => {
  return useNutriStore.subscribe(
    (state) => state.progress,
    callback,
    {
      equalityFn: (a, b) => JSON.stringify(a) === JSON.stringify(b),
    }
  );
};

export const subscribeToOnlineStatus = (callback: (isOnline: boolean) => void) => {
  return useNutriStore.subscribe(
    (state) => state.isOnline,
    callback
  );
};
