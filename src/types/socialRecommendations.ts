/**
 * Social Recommendations Types
 * TypeScript interfaces for AI-powered social recommendations and insights
 */

import { User, Post, Team, MentorshipProfile } from './social';

// Base recommendation interface
export interface BaseRecommendation {
  id: string;
  confidence: number;
  aiScore: number;
  reasoning: string;
  createdAt: string;
  expiresAt?: string;
}

// Friend recommendation types
export interface FriendRecommendation extends BaseRecommendation {
  user: User;
  mutualFriends: number;
  commonInterests: string[];
  locationSimilarity: number;
  activitySimilarity: number;
  goalsSimilarity: number;
  whyRecommended: string[];
  matchReasons: string[];
}

// Team recommendation types
export interface TeamRecommendation extends BaseRecommendation {
  team: Team;
  memberCount: number;
  challengeCount: number;
  goalAlignment: number;
  activityMatch: number;
  locationMatch: number;
  availabilityScore: number;
  matchReason: string;
  compatibilityScore: number;
}

// Content recommendation types
export interface ContentRecommendation extends BaseRecommendation {
  post: Post;
  relevanceScore: number;
  interestScore: number;
  friendBoost: number;
  engagementScore: number;
  recencyScore: number;
  whyRecommended: string;
  engagementPrediction: number;
  expectedLikes: number;
  expectedComments: number;
}

// Mentorship recommendation types
export interface MentorshipRecommendation extends BaseRecommendation {
  mentor: MentorshipProfile;
  goalAlignment: number;
  experienceMatch: number;
  availabilityScore: number;
  ratingScore: number;
  compatibilityScore: number;
  matchReasons: string[];
  expectedOutcome: number;
  estimatedDuration: number;
  successProbability: number;
}

// Social insights types
export interface EngagementTrend {
  trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';
  change: number;
  recentAverage: number;
  message: string;
  period: string;
}

export interface SocialGrowth {
  totalFriends: number;
  newFriends30d: number;
  newFriends7d: number;
  growthRate: number;
  message: string;
  trend: 'growing' | 'stable' | 'declining';
}

export interface ContentPerformance {
  totalPosts: number;
  averageLikes: number;
  averageComments: number;
  bestPostLikes: number;
  bestPostComments: number;
  engagementScore: number;
  message: string;
  topPerformingPost?: Post;
}

export interface NetworkAnalysis {
  networkSize: number;
  averageFriendsPerConnection: number;
  averagePostsPerConnection: number;
  averageLikesPerConnection: number;
  networkDensity: number;
  message: string;
  influentialConnections: User[];
}

export interface InsightRecommendation {
  type: 'content' | 'social' | 'engagement' | 'network';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SocialInsights {
  engagementTrends: EngagementTrend;
  socialGrowth: SocialGrowth;
  contentPerformance: ContentPerformance;
  networkAnalysis: NetworkAnalysis;
  recommendations: InsightRecommendation[];
  generatedAt: string;
  nextUpdateAt: string;
}

// Recommendation feedback types
export interface RecommendationFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  type: 'friend' | 'team' | 'content' | 'mentorship';
  action: 'accepted' | 'rejected' | 'ignored';
  rating?: number;
  feedback?: string;
  timestamp: string;
}

// Recommendation performance types
export interface RecommendationPerformance {
  totalRecommendations: number;
  acceptedRecommendations: number;
  rejectedRecommendations: number;
  ignoredRecommendations: number;
  averageRating: number;
  acceptanceRate: number;
  period: '7d' | '30d' | '90d';
  breakdown: {
    friends: RecommendationTypePerformance;
    teams: RecommendationTypePerformance;
    content: RecommendationTypePerformance;
    mentorship: RecommendationTypePerformance;
  };
}

export interface RecommendationTypePerformance {
  total: number;
  accepted: number;
  rejected: number;
  ignored: number;
  acceptanceRate: number;
  averageRating: number;
}

// API request/response types
export interface GetRecommendationsRequest {
  limit?: number;
  types?: ('friend' | 'team' | 'content' | 'mentorship')[];
  filters?: RecommendationFilters;
}

export interface RecommendationFilters {
  minConfidence?: number;
  maxAge?: number; // in hours
  includeTypes?: string[];
  excludeTypes?: string[];
}

export interface GetFriendRecommendationsRequest {
  limit?: number;
  includeReasons?: boolean;
  minMutualFriends?: number;
  maxDistance?: number; // in km
}

export interface GetTeamRecommendationsRequest {
  challengeType?: string;
  limit?: number;
  minMembers?: number;
  maxMembers?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
}

export interface GetContentRecommendationsRequest {
  limit?: number;
  contentType?: string[];
  minEngagement?: number;
  maxAge?: number; // in hours
  includeFriends?: boolean;
}

export interface GetMentorshipRecommendationsRequest {
  role?: 'mentor' | 'mentee';
  specialties?: string[];
  experienceLevel?: string;
  availability?: 'high' | 'medium' | 'low';
}

export interface RefreshRecommendationsRequest {
  types?: ('friend' | 'team' | 'content' | 'mentorship')[];
  forceRefresh?: boolean;
}

// API response types
export interface RecommendationsResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  metadata?: {
    total: number;
    generatedAt: string;
    expiresAt: string;
    algorithm: string;
    version: string;
  };
}

export interface SocialInsightsResponse {
  success: boolean;
  data: SocialInsights;
  message: string;
}

export interface RecommendationFeedbackResponse {
  success: boolean;
  message: string;
  data?: {
    feedbackId: string;
    impact: 'positive' | 'negative' | 'neutral';
    nextRecommendations: number;
  };
}

export interface RecommendationPerformanceResponse {
  success: boolean;
  data: RecommendationPerformance;
  message: string;
}

// Component props types
export interface RecommendationCardProps<T extends BaseRecommendation> {
  recommendation: T;
  onAccept?: (recommendation: T) => void;
  onReject?: (recommendation: T) => void;
  onIgnore?: (recommendation: T) => void;
  onFeedback?: (recommendation: T, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export interface RecommendationsListProps<T extends BaseRecommendation> {
  recommendations: T[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  emptyMessage?: string;
  showFilters?: boolean;
  onFilterChange?: (filters: RecommendationFilters) => void;
}

export interface SocialInsightsProps {
  insights: SocialInsights;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  showRecommendations?: boolean;
  onRecommendationClick?: (recommendation: InsightRecommendation) => void;
}

// Hook types
export interface UseRecommendationsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  cacheTime?: number;
}

export interface UseRecommendationsResult<T extends BaseRecommendation> {
  recommendations: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

export interface UseSocialInsightsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  autoRefresh?: boolean;
}

export interface UseSocialInsightsResult {
  insights: SocialInsights | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  refresh: () => void;
}

// State types
export interface RecommendationsState {
  friends: FriendRecommendation[];
  teams: TeamRecommendation[];
  content: ContentRecommendation[];
  mentorship: MentorshipRecommendation[];
  insights: SocialInsights | null;
  loading: {
    friends: boolean;
    teams: boolean;
    content: boolean;
    mentorship: boolean;
    insights: boolean;
  };
  error: {
    friends: string | null;
    teams: string | null;
    content: string | null;
    mentorship: string | null;
    insights: string | null;
  };
  lastUpdated: {
    friends: string | null;
    teams: string | null;
    content: string | null;
    mentorship: string | null;
    insights: string | null;
  };
  filters: RecommendationFilters;
  performance: RecommendationPerformance | null;
}

// Utility types
export type RecommendationType = 'friend' | 'team' | 'content' | 'mentorship';

export type RecommendationAction = 'accept' | 'reject' | 'ignore' | 'feedback';

export type InsightType = 'engagement' | 'growth' | 'content' | 'network';

export type TrendDirection = 'up' | 'down' | 'stable' | 'insufficient_data';

// Constants
export const RECOMMENDATION_TYPES = {
  FRIEND: 'friend',
  TEAM: 'team',
  CONTENT: 'content',
  MENTORSHIP: 'mentorship'
} as const;

export const RECOMMENDATION_ACTIONS = {
  ACCEPT: 'accept',
  REJECT: 'reject',
  IGNORE: 'ignore',
  FEEDBACK: 'feedback'
} as const;

export const INSIGHT_TYPES = {
  ENGAGEMENT: 'engagement',
  GROWTH: 'growth',
  CONTENT: 'content',
  NETWORK: 'network'
} as const;

export const TREND_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  STABLE: 'stable',
  INSUFFICIENT_DATA: 'insufficient_data'
} as const;
