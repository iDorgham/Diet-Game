/**
 * Social Features API Service
 * Frontend integration for social features backend APIs
 * 
 * Handles all social interactions including:
 * - Friend management
 * - Social feed
 * - Team challenges
 * - Mentorship system
 * - Notifications
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { APIError, handleAPIError } from './api';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_TIMEOUT = 10000; // 10 seconds

// Create axios instance for social APIs
const socialApiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/social`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
socialApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nutriquest-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
socialApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nutriquest-token');
      window.location.href = '/login';
    }
    return Promise.reject(handleAPIError(error));
  }
);

// ==================== TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface Friend {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastActive: string;
  mutualFriends: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  postType: 'general' | 'achievement' | 'progress' | 'meal' | 'workout' | 'challenge';
  privacy: 'public' | 'friends' | 'private';
  mediaUrls: string[];
  tags: string[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  likeCount: number;
  commentCount: number;
  shareCount: number;
  userLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  privacy: 'public' | 'private' | 'invite_only';
  maxMembers: number;
  currentMembers: number;
  avatarUrl?: string;
  createdAt: string;
  leader: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  userRole?: 'leader' | 'member';
  joinedAt?: string;
}

export interface MentorshipProfile {
  id: string;
  userId: string;
  profileType: 'mentor' | 'mentee' | 'both';
  bio?: string;
  specialties: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  availability: Record<string, any>;
  preferences: Record<string, any>;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface MentorshipRequest {
  id: string;
  mentorId: string;
  menteeId: string;
  message: string;
  goals: string[];
  durationWeeks: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
  mentor: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  mentee: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'post_liked' | 'post_commented' | 'mentorship_request' | 'team_invitation';
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// ==================== FRIEND SYSTEM API ====================

export class FriendAPI {
  /**
   * Send a friend request
   */
  static async sendFriendRequest(receiverId: string, message?: string): Promise<FriendRequest> {
    const response: AxiosResponse<ApiResponse<FriendRequest>> = await socialApiClient.post(
      '/friends/request',
      { receiverId, message }
    );
    return response.data.data;
  }

  /**
   * Accept a friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<{ success: boolean; friendshipId: string }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean; friendshipId: string }>> = 
      await socialApiClient.post(`/friends/accept/${requestId}`);
    return response.data.data;
  }

  /**
   * Reject a friend request
   */
  static async rejectFriendRequest(requestId: string): Promise<FriendRequest> {
    const response: AxiosResponse<ApiResponse<FriendRequest>> = await socialApiClient.post(
      `/friends/reject/${requestId}`
    );
    return response.data.data;
  }

  /**
   * Get user's friends list
   */
  static async getFriendsList(): Promise<Friend[]> {
    const response: AxiosResponse<ApiResponse<Friend[]>> = await socialApiClient.get('/friends');
    return response.data.data;
  }

  /**
   * Get friend suggestions
   */
  static async getFriendSuggestions(limit: number = 10): Promise<Friend[]> {
    const response: AxiosResponse<ApiResponse<Friend[]>> = await socialApiClient.get(
      `/friends/suggestions?limit=${limit}`
    );
    return response.data.data;
  }

  /**
   * Remove a friend
   */
  static async removeFriend(friendId: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await socialApiClient.delete(
      `/friends/${friendId}`
    );
    return response.data.data;
  }
}

// ==================== SOCIAL FEED API ====================

export class SocialFeedAPI {
  /**
   * Create a new post
   */
  static async createPost(postData: {
    content: string;
    postType?: 'general' | 'achievement' | 'progress' | 'meal' | 'workout' | 'challenge';
    privacy?: 'public' | 'friends' | 'private';
    mediaUrls?: string[];
    tags?: string[];
    location?: { name: string; coordinates: [number, number] };
  }): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await socialApiClient.post('/posts', postData);
    return response.data.data;
  }

  /**
   * Get personalized feed
   */
  static async getPersonalizedFeed(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const response: AxiosResponse<ApiResponse<Post[]>> = await socialApiClient.get(
      `/posts/feed?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  }

  /**
   * Like/unlike a post
   */
  static async togglePostLike(postId: string): Promise<{ liked: boolean }> {
    const response: AxiosResponse<ApiResponse<{ liked: boolean }>> = await socialApiClient.post(
      `/posts/${postId}/like`
    );
    return response.data.data;
  }

  /**
   * Add comment to post
   */
  static async addComment(postId: string, content: string, parentCommentId?: string): Promise<Comment> {
    const response: AxiosResponse<ApiResponse<Comment>> = await socialApiClient.post(
      `/posts/${postId}/comments`,
      { content, parentCommentId }
    );
    return response.data.data;
  }

  /**
   * Get comments for a post
   */
  static async getPostComments(postId: string, limit: number = 50, offset: number = 0): Promise<Comment[]> {
    const response: AxiosResponse<ApiResponse<Comment[]>> = await socialApiClient.get(
      `/posts/${postId}/comments?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  }
}

// ==================== TEAM CHALLENGES API ====================

export class TeamAPI {
  /**
   * Create a team
   */
  static async createTeam(teamData: {
    name: string;
    description?: string;
    privacy?: 'public' | 'private' | 'invite_only';
    maxMembers?: number;
    avatarUrl?: string;
  }): Promise<Team> {
    const response: AxiosResponse<ApiResponse<Team>> = await socialApiClient.post('/teams', teamData);
    return response.data.data;
  }

  /**
   * Join a team
   */
  static async joinTeam(teamId: string): Promise<{ success: boolean }> {
    const response: AxiosResponse<ApiResponse<{ success: boolean }>> = await socialApiClient.post(
      `/teams/${teamId}/join`
    );
    return response.data.data;
  }

  /**
   * Get user's teams
   */
  static async getUserTeams(): Promise<Team[]> {
    const response: AxiosResponse<ApiResponse<Team[]>> = await socialApiClient.get('/teams');
    return response.data.data;
  }
}

// ==================== MENTORSHIP SYSTEM API ====================

export class MentorshipAPI {
  /**
   * Create mentorship profile
   */
  static async createMentorshipProfile(profileData: {
    profileType: 'mentor' | 'mentee' | 'both';
    bio?: string;
    specialties?: string[];
    experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    availability?: Record<string, any>;
    preferences?: Record<string, any>;
  }): Promise<MentorshipProfile> {
    const response: AxiosResponse<ApiResponse<MentorshipProfile>> = await socialApiClient.post(
      '/mentorship/profile',
      profileData
    );
    return response.data.data;
  }

  /**
   * Send mentorship request
   */
  static async sendMentorshipRequest(requestData: {
    mentorId: string;
    message: string;
    goals?: string[];
    durationWeeks?: number;
  }): Promise<MentorshipRequest> {
    const response: AxiosResponse<ApiResponse<MentorshipRequest>> = await socialApiClient.post(
      '/mentorship/request',
      requestData
    );
    return response.data.data;
  }
}

// ==================== NOTIFICATIONS API ====================

export class NotificationAPI {
  /**
   * Get user notifications
   */
  static async getUserNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    const response: AxiosResponse<ApiResponse<Notification[]>> = await socialApiClient.get(
      `/notifications?limit=${limit}&offset=${offset}`
    );
    return response.data.data;
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(notificationId: string): Promise<Notification> {
    const response: AxiosResponse<ApiResponse<Notification>> = await socialApiClient.put(
      `/notifications/${notificationId}/read`
    );
    return response.data.data;
  }
}

// ==================== REACT QUERY KEYS ====================

export const socialQueryKeys = {
  // Friend system
  friends: () => ['social', 'friends'] as const,
  friendSuggestions: (limit: number) => ['social', 'friendSuggestions', limit] as const,
  
  // Social feed
  feed: (limit: number, offset: number) => ['social', 'feed', limit, offset] as const,
  postComments: (postId: string, limit: number, offset: number) => 
    ['social', 'postComments', postId, limit, offset] as const,
  
  // Teams
  userTeams: () => ['social', 'teams'] as const,
  
  // Mentorship
  mentorshipProfile: (userId: string) => ['social', 'mentorshipProfile', userId] as const,
  
  // Notifications
  notifications: (limit: number, offset: number) => ['social', 'notifications', limit, offset] as const,
} as const;

// ==================== MUTATION KEYS ====================

export const socialMutationKeys = {
  // Friend system
  sendFriendRequest: () => ['social', 'sendFriendRequest'] as const,
  acceptFriendRequest: () => ['social', 'acceptFriendRequest'] as const,
  rejectFriendRequest: () => ['social', 'rejectFriendRequest'] as const,
  removeFriend: () => ['social', 'removeFriend'] as const,
  
  // Social feed
  createPost: () => ['social', 'createPost'] as const,
  togglePostLike: () => ['social', 'togglePostLike'] as const,
  addComment: () => ['social', 'addComment'] as const,
  
  // Teams
  createTeam: () => ['social', 'createTeam'] as const,
  joinTeam: () => ['social', 'joinTeam'] as const,
  
  // Mentorship
  createMentorshipProfile: () => ['social', 'createMentorshipProfile'] as const,
  sendMentorshipRequest: () => ['social', 'sendMentorshipRequest'] as const,
  
  // Notifications
  markNotificationAsRead: () => ['social', 'markNotificationAsRead'] as const,
} as const;

// Export all APIs as a single object for convenience
export const SocialAPI = {
  friends: FriendAPI,
  feed: SocialFeedAPI,
  teams: TeamAPI,
  mentorship: MentorshipAPI,
  notifications: NotificationAPI,
};

export default SocialAPI;
