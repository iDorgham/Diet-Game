/**
 * Real-time Recommendations Hooks
 * Enhanced hooks that integrate real-time updates with existing recommendation hooks
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  useFriendRecommendations,
  useTeamRecommendations,
  useContentRecommendations,
  useMentorshipRecommendations,
  useSocialInsights
} from './useSocialRecommendations';
import { 
  realtimeService, 
  useRealtimeUpdates,
  useRecommendationUpdates,
  useInsightUpdates,
  RecommendationUpdateEvent,
  InsightUpdateEvent
} from '../services/realtimeService';
import { 
  FriendRecommendation,
  TeamRecommendation,
  ContentRecommendation,
  MentorshipRecommendation,
  SocialInsights
} from '../types/socialRecommendations';

// Enhanced friend recommendations with real-time updates
export function useRealtimeFriendRecommendations(
  params: any = {},
  options: any = {}
) {
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeUpdates();
  const recommendationUpdates = useRecommendationUpdates();
  
  const {
    recommendations,
    loading,
    error,
    refetch,
    refresh
  } = useFriendRecommendations(params, options);

  // Handle real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (event: RecommendationUpdateEvent) => {
      if (event.data.recommendationType === 'friend') {
        switch (event.type) {
          case 'recommendation:new':
            // Add new recommendation to cache
            queryClient.setQueryData(
              ['social', 'recommendations', 'friends', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: [event.data.recommendation, ...oldData.data]
                };
              }
            );
            break;
            
          case 'recommendation:updated':
            // Update existing recommendation
            queryClient.setQueryData(
              ['social', 'recommendations', 'friends', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((rec: FriendRecommendation) =>
                    rec.id === event.data.recommendationId
                      ? { ...rec, ...event.data.recommendation }
                      : rec
                  )
                };
              }
            );
            break;
            
          case 'recommendation:removed':
            // Remove recommendation from cache
            queryClient.setQueryData(
              ['social', 'recommendations', 'friends', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.filter(
                    (rec: FriendRecommendation) => rec.id !== event.data.recommendationId
                  )
                };
              }
            );
            break;
        }
      }
    };

    realtimeService.subscribe('recommendation', handleUpdate);

    return () => {
      realtimeService.unsubscribe('recommendation', handleUpdate);
    };
  }, [isConnected, params, queryClient]);

  return {
    recommendations,
    loading,
    error,
    refetch,
    refresh,
    isRealtimeConnected: isConnected,
    recentUpdates: recommendationUpdates.filter(
      update => update.data.recommendationType === 'friend'
    )
  };
}

// Enhanced team recommendations with real-time updates
export function useRealtimeTeamRecommendations(
  params: any = {},
  options: any = {}
) {
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeUpdates();
  const recommendationUpdates = useRecommendationUpdates();
  
  const {
    recommendations,
    loading,
    error,
    refetch,
    refresh
  } = useTeamRecommendations(params, options);

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (event: RecommendationUpdateEvent) => {
      if (event.data.recommendationType === 'team') {
        switch (event.type) {
          case 'recommendation:new':
            queryClient.setQueryData(
              ['social', 'recommendations', 'teams', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: [event.data.recommendation, ...oldData.data]
                };
              }
            );
            break;
            
          case 'recommendation:updated':
            queryClient.setQueryData(
              ['social', 'recommendations', 'teams', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((rec: TeamRecommendation) =>
                    rec.id === event.data.recommendationId
                      ? { ...rec, ...event.data.recommendation }
                      : rec
                  )
                };
              }
            );
            break;
            
          case 'recommendation:removed':
            queryClient.setQueryData(
              ['social', 'recommendations', 'teams', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.filter(
                    (rec: TeamRecommendation) => rec.id !== event.data.recommendationId
                  )
                };
              }
            );
            break;
        }
      }
    };

    realtimeService.subscribe('recommendation', handleUpdate);

    return () => {
      realtimeService.unsubscribe('recommendation', handleUpdate);
    };
  }, [isConnected, params, queryClient]);

  return {
    recommendations,
    loading,
    error,
    refetch,
    refresh,
    isRealtimeConnected: isConnected,
    recentUpdates: recommendationUpdates.filter(
      update => update.data.recommendationType === 'team'
    )
  };
}

// Enhanced content recommendations with real-time updates
export function useRealtimeContentRecommendations(
  params: any = {},
  options: any = {}
) {
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeUpdates();
  const recommendationUpdates = useRecommendationUpdates();
  
  const {
    recommendations,
    loading,
    error,
    refetch,
    refresh
  } = useContentRecommendations(params, options);

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (event: RecommendationUpdateEvent) => {
      if (event.data.recommendationType === 'content') {
        switch (event.type) {
          case 'recommendation:new':
            queryClient.setQueryData(
              ['social', 'recommendations', 'content', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: [event.data.recommendation, ...oldData.data]
                };
              }
            );
            break;
            
          case 'recommendation:updated':
            queryClient.setQueryData(
              ['social', 'recommendations', 'content', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((rec: ContentRecommendation) =>
                    rec.id === event.data.recommendationId
                      ? { ...rec, ...event.data.recommendation }
                      : rec
                  )
                };
              }
            );
            break;
            
          case 'recommendation:removed':
            queryClient.setQueryData(
              ['social', 'recommendations', 'content', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.filter(
                    (rec: ContentRecommendation) => rec.id !== event.data.recommendationId
                  )
                };
              }
            );
            break;
        }
      }
    };

    realtimeService.subscribe('recommendation', handleUpdate);

    return () => {
      realtimeService.unsubscribe('recommendation', handleUpdate);
    };
  }, [isConnected, params, queryClient]);

  return {
    recommendations,
    loading,
    error,
    refetch,
    refresh,
    isRealtimeConnected: isConnected,
    recentUpdates: recommendationUpdates.filter(
      update => update.data.recommendationType === 'content'
    )
  };
}

// Enhanced mentorship recommendations with real-time updates
export function useRealtimeMentorshipRecommendations(
  params: any = {},
  options: any = {}
) {
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeUpdates();
  const recommendationUpdates = useRecommendationUpdates();
  
  const {
    recommendations,
    loading,
    error,
    refetch,
    refresh
  } = useMentorshipRecommendations(params, options);

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (event: RecommendationUpdateEvent) => {
      if (event.data.recommendationType === 'mentorship') {
        switch (event.type) {
          case 'recommendation:new':
            queryClient.setQueryData(
              ['social', 'recommendations', 'mentorship', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: [event.data.recommendation, ...oldData.data]
                };
              }
            );
            break;
            
          case 'recommendation:updated':
            queryClient.setQueryData(
              ['social', 'recommendations', 'mentorship', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.map((rec: MentorshipRecommendation) =>
                    rec.id === event.data.recommendationId
                      ? { ...rec, ...event.data.recommendation }
                      : rec
                  )
                };
              }
            );
            break;
            
          case 'recommendation:removed':
            queryClient.setQueryData(
              ['social', 'recommendations', 'mentorship', params],
              (oldData: any) => {
                if (!oldData) return oldData;
                return {
                  ...oldData,
                  data: oldData.data.filter(
                    (rec: MentorshipRecommendation) => rec.id !== event.data.recommendationId
                  )
                };
              }
            );
            break;
        }
      }
    };

    realtimeService.subscribe('recommendation', handleUpdate);

    return () => {
      realtimeService.unsubscribe('recommendation', handleUpdate);
    };
  }, [isConnected, params, queryClient]);

  return {
    recommendations,
    loading,
    error,
    refetch,
    refresh,
    isRealtimeConnected: isConnected,
    recentUpdates: recommendationUpdates.filter(
      update => update.data.recommendationType === 'mentorship'
    )
  };
}

// Enhanced social insights with real-time updates
export function useRealtimeSocialInsights(options: any = {}) {
  const queryClient = useQueryClient();
  const { isConnected } = useRealtimeUpdates();
  const insightUpdates = useInsightUpdates();
  
  const {
    insights,
    loading,
    error,
    refetch,
    refresh
  } = useSocialInsights(options);

  useEffect(() => {
    if (!isConnected) return;

    const handleUpdate = (event: InsightUpdateEvent) => {
      switch (event.type) {
        case 'insight:updated':
        case 'insight:new':
          // Update insights cache
          queryClient.setQueryData(
            ['social', 'insights'],
            (oldData: any) => {
              if (!oldData) return oldData;
              return {
                ...oldData,
                data: {
                  ...oldData.data,
                  ...event.data.insights,
                  generatedAt: new Date().toISOString()
                }
              };
            }
          );
          break;
      }
    };

    realtimeService.subscribe('insight', handleUpdate);

    return () => {
      realtimeService.unsubscribe('insight', handleUpdate);
    };
  }, [isConnected, queryClient]);

  return {
    insights,
    loading,
    error,
    refetch,
    refresh,
    isRealtimeConnected: isConnected,
    recentUpdates: insightUpdates
  };
}

// Hook for managing real-time connection
export function useRealtimeConnection() {
  const { isConnected, connectionStatus } = useRealtimeUpdates();

  const connect = useCallback(() => {
    realtimeService.connect();
  }, []);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  const joinRecommendationRoom = useCallback((roomName: string) => {
    realtimeService.joinRoom(`recommendations_${roomName}`);
  }, []);

  const leaveRecommendationRoom = useCallback((roomName: string) => {
    realtimeService.leaveRoom(`recommendations_${roomName}`);
  }, []);

  return {
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    joinRecommendationRoom,
    leaveRecommendationRoom,
  };
}

// Hook for real-time notification management
export function useRealtimeNotifications() {
  const notifications = useRealtimeNotifications();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const markAsRead = useCallback((notificationId: string) => {
    // Remove from notifications list
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
