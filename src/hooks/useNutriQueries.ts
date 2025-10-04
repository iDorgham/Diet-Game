// React Query hooks following Level 303 requirements
// Advanced data fetching with caching, mutations, and real-time updates

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { NutriQuestAPI, queryKeys, mutationKeys, handleAPIError, retryRequest } from '../services/api';
import { useNutriStore, useNutriActions } from '../store/nutriStore';
import { UserProgress, UserProfile } from '../types';

// User Progress Hooks
export const useUserProgress = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.userProgress(userId),
    queryFn: () => retryRequest(() => NutriQuestAPI.getUserProgress(userId)),
    enabled: options?.enabled ?? true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch user progress:', error);
    },
  });
};

export const useUpdateUserProgress = (userId: string) => {
  const queryClient = useQueryClient();
  const { updateProgress } = useNutriActions();
  
  return useMutation({
    mutationKey: mutationKeys.updateProgress(userId),
    mutationFn: (updates: Partial<UserProgress>) => 
      retryRequest(() => NutriQuestAPI.updateUserProgress(userId, updates)),
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.userProgress(userId) });
      
      const previousProgress = queryClient.getQueryData<UserProgress>(
        queryKeys.userProgress(userId)
      );
      
      if (previousProgress) {
        queryClient.setQueryData(
          queryKeys.userProgress(userId),
          { ...previousProgress, ...updates }
        );
      }
      
      // Update Zustand store
      updateProgress(updates);
      
      return { previousProgress };
    },
    onError: (error, updates, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          queryKeys.userProgress(userId),
          context.previousProgress
        );
      }
      console.error('Failed to update user progress:', error);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress(userId) });
    },
  });
};

// User Profile Hooks
export const useUserProfile = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.userProfile(userId),
    queryFn: () => retryRequest(() => NutriQuestAPI.getUserProfile(userId)),
    enabled: options?.enabled ?? true,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    onError: (error) => {
      console.error('Failed to fetch user profile:', error);
    },
  });
};

export const useUpdateUserProfile = (userId: string) => {
  const queryClient = useQueryClient();
  const { updateProfile } = useNutriActions();
  
  return useMutation({
    mutationKey: mutationKeys.updateProfile(userId),
    mutationFn: (updates: Partial<UserProfile>) => 
      retryRequest(() => NutriQuestAPI.updateUserProfile(userId, updates)),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userProfile(userId) });
      
      const previousProfile = queryClient.getQueryData<UserProfile>(
        queryKeys.userProfile(userId)
      );
      
      if (previousProfile) {
        queryClient.setQueryData(
          queryKeys.userProfile(userId),
          { ...previousProfile, ...updates }
        );
      }
      
      updateProfile(updates);
      
      return { previousProfile };
    },
    onError: (error, updates, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.userProfile(userId),
          context.previousProfile
        );
      }
      console.error('Failed to update user profile:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userProfile(userId) });
    },
  });
};

// Task Management Hooks
export const useDailyTasks = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.dailyTasks(userId),
    queryFn: () => retryRequest(() => NutriQuestAPI.getDailyTasks(userId)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('Failed to fetch daily tasks:', error);
    },
  });
};

export const useCompleteTask = (userId: string) => {
  const queryClient = useQueryClient();
  const { completeTask } = useNutriActions();
  
  return useMutation({
    mutationKey: mutationKeys.completeTask(userId),
    mutationFn: (request: any) => 
      retryRequest(() => NutriQuestAPI.completeTask(userId, request)),
    onMutate: async (request) => {
      // Optimistic update in Zustand store
      await completeTask(request.taskId, request.taskType, request.streak);
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.userProgress(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dailyTasks(userId) });
      
      // Show success message
      if (data.levelUp) {
        console.log(`🎉 Level up! You're now level ${data.levelUp.newLevel}!`);
      }
      
      if (data.achievements?.length) {
        data.achievements.forEach(achievement => {
          console.log(`🏆 Achievement unlocked: ${achievement.name}`);
        });
      }
    },
    onError: (error) => {
      console.error('Failed to complete task:', error);
    },
  });
};

// Analytics Hooks
export const useUserAnalytics = (userId: string, period: 'week' | 'month' | 'year') => {
  return useQuery({
    queryKey: queryKeys.userAnalytics(userId, period),
    queryFn: () => retryRequest(() => NutriQuestAPI.getUserAnalytics(userId, period)),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    onError: (error) => {
      console.error('Failed to fetch user analytics:', error);
    },
  });
};

// Leaderboard Hooks
export const useLeaderboard = (limit: number = 10) => {
  return useQuery({
    queryKey: queryKeys.leaderboard(limit),
    queryFn: () => retryRequest(() => NutriQuestAPI.getLeaderboard(limit)),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    onError: (error) => {
      console.error('Failed to fetch leaderboard:', error);
    },
  });
};

// Infinite Leaderboard
export const useInfiniteLeaderboard = (limit: number = 10) => {
  return useInfiniteQuery({
    queryKey: [...queryKeys.leaderboard(limit), 'infinite'],
    queryFn: ({ pageParam = 0 }) => 
      retryRequest(() => NutriQuestAPI.getLeaderboard(limit, pageParam)),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length : undefined;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
};

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health(),
    queryFn: () => retryRequest(() => NutriQuestAPI.healthCheck()),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchInterval: 60 * 1000, // Check every minute
    onError: (error) => {
      console.error('Health check failed:', error);
    },
  });
};

// Real-time Sync Hook
export const useRealtimeSync = (userId: string) => {
  const queryClient = useQueryClient();
  const { isOnline, pendingUpdates, clearPendingUpdates } = useNutriStore();
  
  const syncPendingUpdates = useCallback(async () => {
    if (!isOnline || pendingUpdates.length === 0) return;
    
    try {
      // Process pending updates in batches
      const batchSize = 5;
      for (let i = 0; i < pendingUpdates.length; i += batchSize) {
        const batch = pendingUpdates.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (update) => {
            try {
              if (update.type === 'progress') {
                await NutriQuestAPI.updateUserProgress(userId, update.data);
              } else if (update.type === 'profile') {
                await NutriQuestAPI.updateUserProfile(userId, update.data);
              }
            } catch (error) {
              console.error(`Failed to sync update ${update.id}:`, error);
            }
          })
        );
      }
      
      clearPendingUpdates();
      console.log('✅ All pending updates synced successfully');
    } catch (error) {
      console.error('Failed to sync pending updates:', error);
    }
  }, [isOnline, pendingUpdates, userId, clearPendingUpdates]);
  
  // Sync when coming back online
  useEffect(() => {
    if (isOnline && pendingUpdates.length > 0) {
      syncPendingUpdates();
    }
  }, [isOnline, syncPendingUpdates]);
  
  // Periodic sync
  useEffect(() => {
    if (!isOnline) return;
    
    const interval = setInterval(() => {
      if (pendingUpdates.length > 0) {
        syncPendingUpdates();
      }
    }, 30 * 1000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [isOnline, pendingUpdates.length, syncPendingUpdates]);
  
  return { syncPendingUpdates };
};

// Combined User Data Hook
export const useUserData = (userId: string) => {
  const progressQuery = useUserProgress(userId);
  const profileQuery = useUserProfile(userId);
  const tasksQuery = useDailyTasks(userId);
  
  return {
    progress: progressQuery.data,
    profile: profileQuery.data,
    tasks: tasksQuery.data,
    isLoading: progressQuery.isLoading || profileQuery.isLoading || tasksQuery.isLoading,
    isError: progressQuery.isError || profileQuery.isError || tasksQuery.isError,
    error: progressQuery.error || profileQuery.error || tasksQuery.error,
    refetch: () => {
      progressQuery.refetch();
      profileQuery.refetch();
      tasksQuery.refetch();
    },
  };
};

// Prefetch Hook
export const usePrefetchUserData = (userId: string) => {
  const queryClient = useQueryClient();
  
  const prefetchUserData = useCallback(async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.userProgress(userId),
        queryFn: () => NutriQuestAPI.getUserProgress(userId),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.userProfile(userId),
        queryFn: () => NutriQuestAPI.getUserProfile(userId),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.dailyTasks(userId),
        queryFn: () => NutriQuestAPI.getDailyTasks(userId),
        staleTime: 2 * 60 * 1000,
      }),
    ]);
  }, [queryClient, userId]);
  
  return { prefetchUserData };
};
