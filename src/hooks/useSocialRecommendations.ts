/**
 * Social Recommendations Hooks
 * React Query hooks for AI-powered social recommendations and insights
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { socialRecommendationsApi } from '../services/socialRecommendationsApi';
import {
  FriendRecommendation,
  TeamRecommendation,
  ContentRecommendation,
  MentorshipRecommendation,
  SocialInsights,
  RecommendationPerformance,
  GetFriendRecommendationsRequest,
  GetTeamRecommendationsRequest,
  GetContentRecommendationsRequest,
  GetMentorshipRecommendationsRequest,
  RefreshRecommendationsRequest,
  UseRecommendationsOptions,
  UseRecommendationsResult,
  UseSocialInsightsOptions,
  UseSocialInsightsResult
} from '../types/socialRecommendations';

// Query keys
const QUERY_KEYS = {
  friendRecommendations: ['social', 'recommendations', 'friends'] as const,
  teamRecommendations: ['social', 'recommendations', 'teams'] as const,
  contentRecommendations: ['social', 'recommendations', 'content'] as const,
  mentorshipRecommendations: ['social', 'recommendations', 'mentorship'] as const,
  socialInsights: ['social', 'insights'] as const,
  recommendationPerformance: ['social', 'recommendations', 'performance'] as const,
  allRecommendations: ['social', 'recommendations', 'all'] as const,
  recommendationSummary: ['social', 'recommendations', 'summary'] as const
};

/**
 * Hook for friend recommendations
 */
export function useFriendRecommendations(
  params: GetFriendRecommendationsRequest = {},
  options: UseRecommendationsOptions = {}
): UseRecommendationsResult<FriendRecommendation> {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.friendRecommendations, params],
    queryFn: () => socialRecommendationsApi.getFriendRecommendations(params),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    cacheTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch friend recommendations:', error);
      toast.error('Failed to load friend recommendations');
    }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRecommendations });
  };

  return {
    recommendations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    hasMore: false, // Implement pagination if needed
    loadMore: () => {}, // Implement pagination if needed
    refresh
  };
}

/**
 * Hook for team recommendations
 */
export function useTeamRecommendations(
  params: GetTeamRecommendationsRequest = {},
  options: UseRecommendationsOptions = {}
): UseRecommendationsResult<TeamRecommendation> {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.teamRecommendations, params],
    queryFn: () => socialRecommendationsApi.getTeamRecommendations(params),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
    staleTime: options.staleTime || 5 * 60 * 1000,
    cacheTime: options.cacheTime || 10 * 60 * 1000,
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch team recommendations:', error);
      toast.error('Failed to load team recommendations');
    }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamRecommendations });
  };

  return {
    recommendations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    hasMore: false,
    loadMore: () => {},
    refresh
  };
}

/**
 * Hook for content recommendations
 */
export function useContentRecommendations(
  params: GetContentRecommendationsRequest = {},
  options: UseRecommendationsOptions = {}
): UseRecommendationsResult<ContentRecommendation> {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.contentRecommendations, params],
    queryFn: () => socialRecommendationsApi.getContentRecommendations(params),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
    staleTime: options.staleTime || 2 * 60 * 1000, // 2 minutes for content
    cacheTime: options.cacheTime || 5 * 60 * 1000,
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch content recommendations:', error);
      toast.error('Failed to load content recommendations');
    }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contentRecommendations });
  };

  return {
    recommendations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    hasMore: false,
    loadMore: () => {},
    refresh
  };
}

/**
 * Hook for mentorship recommendations
 */
export function useMentorshipRecommendations(
  params: GetMentorshipRecommendationsRequest = {},
  options: UseRecommendationsOptions = {}
): UseRecommendationsResult<MentorshipRecommendation> {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...QUERY_KEYS.mentorshipRecommendations, params],
    queryFn: () => socialRecommendationsApi.getMentorshipRecommendations(params),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval,
    staleTime: options.staleTime || 10 * 60 * 1000, // 10 minutes for mentorship
    cacheTime: options.cacheTime || 20 * 60 * 1000,
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch mentorship recommendations:', error);
      toast.error('Failed to load mentorship recommendations');
    }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mentorshipRecommendations });
  };

  return {
    recommendations: query.data || [],
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    hasMore: false,
    loadMore: () => {},
    refresh
  };
}

/**
 * Hook for social insights
 */
export function useSocialInsights(
  options: UseSocialInsightsOptions = {}
): UseSocialInsightsResult {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.socialInsights,
    queryFn: () => socialRecommendationsApi.getSocialInsights(),
    enabled: options.enabled !== false,
    refetchInterval: options.refetchInterval || 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch social insights:', error);
      toast.error('Failed to load social insights');
    }
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.socialInsights });
  };

  return {
    insights: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch,
    refresh
  };
}

/**
 * Hook for recommendation performance
 */
export function useRecommendationPerformance(
  period: '7d' | '30d' | '90d' = '30d'
) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.recommendationPerformance, period],
    queryFn: () => socialRecommendationsApi.getRecommendationPerformance(period),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    select: (data) => data.data,
    onError: (error: any) => {
      console.error('Failed to fetch recommendation performance:', error);
      toast.error('Failed to load recommendation performance');
    }
  });

  return {
    performance: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
}

/**
 * Hook for all recommendations
 */
export function useAllRecommendations(
  options: {
    friendsLimit?: number;
    teamsLimit?: number;
    contentLimit?: number;
    mentorshipLimit?: number;
  } = {}
) {
  const query = useQuery({
    queryKey: [...QUERY_KEYS.allRecommendations, options],
    queryFn: () => socialRecommendationsApi.getAllRecommendations(options),
    staleTime: 2 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    onError: (error: any) => {
      console.error('Failed to fetch all recommendations:', error);
      toast.error('Failed to load recommendations');
    }
  });

  return {
    data: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
}

/**
 * Hook for recommendation summary
 */
export function useRecommendationSummary() {
  const query = useQuery({
    queryKey: QUERY_KEYS.recommendationSummary,
    queryFn: () => socialRecommendationsApi.getRecommendationSummary(),
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    onError: (error: any) => {
      console.error('Failed to fetch recommendation summary:', error);
      toast.error('Failed to load recommendation summary');
    }
  });

  return {
    summary: query.data || null,
    loading: query.isLoading,
    error: query.error?.message || null,
    refetch: query.refetch
  };
}

/**
 * Hook for submitting recommendation feedback
 */
export function useSubmitRecommendationFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recommendationId,
      type,
      action,
      rating,
      feedback
    }: {
      recommendationId: string;
      type: 'friend' | 'team' | 'content' | 'mentorship';
      action: 'accepted' | 'rejected' | 'ignored';
      rating?: number;
      feedback?: string;
    }) =>
      socialRecommendationsApi.submitRecommendationFeedback(
        recommendationId,
        type,
        action,
        rating,
        feedback
      ),
    onSuccess: (data, variables) => {
      toast.success('Feedback submitted successfully');
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recommendationPerformance });
      
      // Invalidate the specific recommendation type
      switch (variables.type) {
        case 'friend':
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.friendRecommendations });
          break;
        case 'team':
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.teamRecommendations });
          break;
        case 'content':
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.contentRecommendations });
          break;
        case 'mentorship':
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.mentorshipRecommendations });
          break;
      }
    },
    onError: (error: any) => {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback');
    }
  });
}

/**
 * Hook for refreshing recommendations
 */
export function useRefreshRecommendations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RefreshRecommendationsRequest = {}) =>
      socialRecommendationsApi.refreshRecommendations(params),
    onSuccess: (data, variables) => {
      toast.success('Recommendations refreshed successfully');
      
      // Invalidate all recommendation queries
      queryClient.invalidateQueries({ queryKey: ['social', 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.socialInsights });
    },
    onError: (error: any) => {
      console.error('Failed to refresh recommendations:', error);
      toast.error('Failed to refresh recommendations');
    }
  });
}

/**
 * Hook for batch submitting feedback
 */
export function useBatchSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (feedbacks: Array<{
      recommendationId: string;
      type: 'friend' | 'team' | 'content' | 'mentorship';
      action: 'accepted' | 'rejected' | 'ignored';
      rating?: number;
      feedback?: string;
    }>) => socialRecommendationsApi.batchSubmitFeedback(feedbacks),
    onSuccess: () => {
      toast.success('Feedback submitted successfully');
      
      // Invalidate all recommendation queries
      queryClient.invalidateQueries({ queryKey: ['social', 'recommendations'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.recommendationPerformance });
    },
    onError: (error: any) => {
      console.error('Failed to submit batch feedback:', error);
      toast.error('Failed to submit feedback');
    }
  });
}

/**
 * Hook for getting recommendation statistics
 */
export function useRecommendationStats() {
  const { data: summary, loading, error } = useRecommendationSummary();
  const { performance, loading: performanceLoading } = useRecommendationPerformance();

  return {
    stats: {
      totalRecommendations: summary?.totalRecommendations || 0,
      byType: summary?.byType || {
        friends: 0,
        teams: 0,
        content: 0,
        mentorship: 0
      },
      performance: performance || null
    },
    loading: loading || performanceLoading,
    error: error || null
  };
}
