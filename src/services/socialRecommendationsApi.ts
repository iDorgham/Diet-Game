/**
 * Social Recommendations API Service
 * Frontend service for AI-powered social recommendations and insights
 */

import { apiClient } from './apiClient';
import {
  FriendRecommendation,
  TeamRecommendation,
  ContentRecommendation,
  MentorshipRecommendation,
  SocialInsights,
  RecommendationFeedback,
  RecommendationPerformance,
  GetFriendRecommendationsRequest,
  GetTeamRecommendationsRequest,
  GetContentRecommendationsRequest,
  GetMentorshipRecommendationsRequest,
  RefreshRecommendationsRequest,
  RecommendationsResponse,
  SocialInsightsResponse,
  RecommendationFeedbackResponse,
  RecommendationPerformanceResponse
} from '../types/socialRecommendations';

export class SocialRecommendationsAPI {
  private baseUrl = '/api/social/recommendations';

  /**
   * Get AI-powered friend suggestions
   */
  async getFriendRecommendations(
    params: GetFriendRecommendationsRequest = {}
  ): Promise<RecommendationsResponse<FriendRecommendation>> {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.includeReasons) queryParams.append('includeReasons', 'true');
    if (params.minMutualFriends) queryParams.append('minMutualFriends', params.minMutualFriends.toString());
    if (params.maxDistance) queryParams.append('maxDistance', params.maxDistance.toString());

    const response = await apiClient.get(`${this.baseUrl}/friends?${queryParams}`);
    return response.data;
  }

  /**
   * Get team formation recommendations
   */
  async getTeamRecommendations(
    params: GetTeamRecommendationsRequest = {}
  ): Promise<RecommendationsResponse<TeamRecommendation>> {
    const queryParams = new URLSearchParams();
    
    if (params.challengeType) queryParams.append('challengeType', params.challengeType);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.minMembers) queryParams.append('minMembers', params.minMembers.toString());
    if (params.maxMembers) queryParams.append('maxMembers', params.maxMembers.toString());
    if (params.location) {
      queryParams.append('latitude', params.location.latitude.toString());
      queryParams.append('longitude', params.location.longitude.toString());
      queryParams.append('radius', params.location.radius.toString());
    }

    const response = await apiClient.get(`${this.baseUrl}/teams?${queryParams}`);
    return response.data;
  }

  /**
   * Get content recommendations for social feed
   */
  async getContentRecommendations(
    params: GetContentRecommendationsRequest = {}
  ): Promise<RecommendationsResponse<ContentRecommendation>> {
    const queryParams = new URLSearchParams();
    
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.contentType) queryParams.append('contentType', params.contentType.join(','));
    if (params.minEngagement) queryParams.append('minEngagement', params.minEngagement.toString());
    if (params.maxAge) queryParams.append('maxAge', params.maxAge.toString());
    if (params.includeFriends) queryParams.append('includeFriends', 'true');

    const response = await apiClient.get(`${this.baseUrl}/content?${queryParams}`);
    return response.data;
  }

  /**
   * Get mentorship matching recommendations
   */
  async getMentorshipRecommendations(
    params: GetMentorshipRecommendationsRequest = {}
  ): Promise<RecommendationsResponse<MentorshipRecommendation>> {
    const queryParams = new URLSearchParams();
    
    if (params.role) queryParams.append('role', params.role);
    if (params.specialties) queryParams.append('specialties', params.specialties.join(','));
    if (params.experienceLevel) queryParams.append('experienceLevel', params.experienceLevel);
    if (params.availability) queryParams.append('availability', params.availability);

    const response = await apiClient.get(`${this.baseUrl}/mentorship?${queryParams}`);
    return response.data;
  }

  /**
   * Get social insights and analytics
   */
  async getSocialInsights(): Promise<SocialInsightsResponse> {
    const response = await apiClient.get(`${this.baseUrl}/insights`);
    return response.data;
  }

  /**
   * Provide feedback on recommendations
   */
  async submitRecommendationFeedback(
    recommendationId: string,
    type: 'friend' | 'team' | 'content' | 'mentorship',
    action: 'accepted' | 'rejected' | 'ignored',
    rating?: number,
    feedback?: string
  ): Promise<RecommendationFeedbackResponse> {
    const response = await apiClient.post(`${this.baseUrl}/feedback`, {
      recommendationId,
      type,
      action,
      rating,
      feedback
    });
    return response.data;
  }

  /**
   * Get recommendation performance analytics
   */
  async getRecommendationPerformance(
    period: '7d' | '30d' | '90d' = '30d'
  ): Promise<RecommendationPerformanceResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('period', period);

    const response = await apiClient.get(`${this.baseUrl}/performance?${queryParams}`);
    return response.data;
  }

  /**
   * Refresh recommendations for user
   */
  async refreshRecommendations(
    params: RefreshRecommendationsRequest = {}
  ): Promise<{
    success: boolean;
    data: {
      friends?: FriendRecommendation[];
      teams?: TeamRecommendation[];
      content?: ContentRecommendation[];
      mentorship?: MentorshipRecommendation[];
    };
    message: string;
  }> {
    const response = await apiClient.post(`${this.baseUrl}/refresh`, params);
    return response.data;
  }

  /**
   * Get all recommendations at once
   */
  async getAllRecommendations(
    options: {
      friendsLimit?: number;
      teamsLimit?: number;
      contentLimit?: number;
      mentorshipLimit?: number;
    } = {}
  ): Promise<{
    friends: FriendRecommendation[];
    teams: TeamRecommendation[];
    content: ContentRecommendation[];
    mentorship: MentorshipRecommendation[];
    insights: SocialInsights;
  }> {
    const [
      friendsResponse,
      teamsResponse,
      contentResponse,
      mentorshipResponse,
      insightsResponse
    ] = await Promise.all([
      this.getFriendRecommendations({ limit: options.friendsLimit || 10 }),
      this.getTeamRecommendations({ limit: options.teamsLimit || 10 }),
      this.getContentRecommendations({ limit: options.contentLimit || 20 }),
      this.getMentorshipRecommendations(),
      this.getSocialInsights()
    ]);

    return {
      friends: friendsResponse.data,
      teams: teamsResponse.data,
      content: contentResponse.data,
      mentorship: mentorshipResponse.data,
      insights: insightsResponse.data
    };
  }

  /**
   * Batch submit feedback for multiple recommendations
   */
  async batchSubmitFeedback(
    feedbacks: Array<{
      recommendationId: string;
      type: 'friend' | 'team' | 'content' | 'mentorship';
      action: 'accepted' | 'rejected' | 'ignored';
      rating?: number;
      feedback?: string;
    }>
  ): Promise<RecommendationFeedbackResponse[]> {
    const promises = feedbacks.map(feedback =>
      this.submitRecommendationFeedback(
        feedback.recommendationId,
        feedback.type,
        feedback.action,
        feedback.rating,
        feedback.feedback
      )
    );

    return Promise.all(promises);
  }

  /**
   * Get personalized recommendation summary
   */
  async getRecommendationSummary(): Promise<{
    totalRecommendations: number;
    byType: {
      friends: number;
      teams: number;
      content: number;
      mentorship: number;
    };
    topRecommendations: {
      friends: FriendRecommendation[];
      teams: TeamRecommendation[];
      content: ContentRecommendation[];
      mentorship: MentorshipRecommendation[];
    };
    insights: SocialInsights;
  }> {
    const allRecommendations = await this.getAllRecommendations();

    return {
      totalRecommendations: 
        allRecommendations.friends.length +
        allRecommendations.teams.length +
        allRecommendations.content.length +
        allRecommendations.mentorship.length,
      byType: {
        friends: allRecommendations.friends.length,
        teams: allRecommendations.teams.length,
        content: allRecommendations.content.length,
        mentorship: allRecommendations.mentorship.length
      },
      topRecommendations: {
        friends: allRecommendations.friends.slice(0, 3),
        teams: allRecommendations.teams.slice(0, 3),
        content: allRecommendations.content.slice(0, 5),
        mentorship: allRecommendations.mentorship.slice(0, 3)
      },
      insights: allRecommendations.insights
    };
  }
}

// Export singleton instance
export const socialRecommendationsApi = new SocialRecommendationsAPI();
