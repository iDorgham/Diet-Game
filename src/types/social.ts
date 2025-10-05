/**
 * Social Features TypeScript Types
 * Comprehensive type definitions for all social features
 */

// ==================== BASE TYPES ====================

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastActive?: string;
}

// ==================== FRIEND SYSTEM TYPES ====================

export interface Friend extends BaseEntity {
  userId: string;
  friendId: string;
  user: User;
  friend: User;
  mutualFriends: number;
  friendshipDate: string;
}

export interface FriendRequest extends BaseEntity {
  senderId: string;
  receiverId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  sender: User;
  receiver: User;
}

export interface FriendSuggestion extends User {
  mutualFriends: number;
  commonInterests: string[];
  reason: 'mutual_friends' | 'common_interests' | 'location' | 'activity';
}

// ==================== SOCIAL FEED TYPES ====================

export type PostType = 'general' | 'achievement' | 'progress' | 'meal' | 'workout' | 'challenge';
export type PostPrivacy = 'public' | 'friends' | 'private';

export interface Post extends BaseEntity {
  userId: string;
  content: string;
  postType: PostType;
  privacy: PostPrivacy;
  mediaUrls: string[];
  tags: string[];
  location?: PostLocation;
  author: User;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  userLiked: boolean;
  userShared: boolean;
}

export interface PostLocation {
  name: string;
  coordinates: [number, number];
  address?: string;
}

export interface PostLike extends BaseEntity {
  postId: string;
  userId: string;
  user: User;
}

export interface PostComment extends BaseEntity {
  postId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  author: User;
  likeCount: number;
  userLiked: boolean;
  replies?: PostComment[];
}

export interface PostShare extends BaseEntity {
  postId: string;
  userId: string;
  user: User;
  message?: string;
}

// ==================== TEAM CHALLENGES TYPES ====================

export type TeamPrivacy = 'public' | 'private' | 'invite_only';
export type TeamRole = 'leader' | 'member';

export interface Team extends BaseEntity {
  name: string;
  description?: string;
  leaderId: string;
  privacy: TeamPrivacy;
  maxMembers: number;
  currentMembers: number;
  avatarUrl?: string;
  leader: User;
  userRole?: TeamRole;
  joinedAt?: string;
  isActive: boolean;
}

export interface TeamMember extends BaseEntity {
  teamId: string;
  userId: string;
  role: TeamRole;
  joinedAt: string;
  user: User;
  team: Team;
}

export interface TeamInvitation extends BaseEntity {
  teamId: string;
  inviterId: string;
  inviteeId: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: string;
  team: Team;
  inviter: User;
  invitee: User;
}

export interface TeamChallenge extends BaseEntity {
  teamId: string;
  title: string;
  description: string;
  challengeType: 'nutrition' | 'fitness' | 'wellness' | 'social';
  startDate: string;
  endDate: string;
  targetValue: number;
  currentValue: number;
  isActive: boolean;
  rewards: {
    xp: number;
    coins: number;
    badges: string[];
  };
  participants: TeamChallengeParticipant[];
}

export interface TeamChallengeParticipant extends BaseEntity {
  challengeId: string;
  userId: string;
  progress: number;
  lastUpdated: string;
  user: User;
}

// ==================== MENTORSHIP SYSTEM TYPES ====================

export type ProfileType = 'mentor' | 'mentee' | 'both';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface MentorshipProfile extends BaseEntity {
  userId: string;
  profileType: ProfileType;
  bio?: string;
  specialties: string[];
  experienceLevel: ExperienceLevel;
  availability: MentorshipAvailability;
  preferences: MentorshipPreferences;
  user: User;
  isActive: boolean;
}

export interface MentorshipAvailability {
  timezone: string;
  days: string[];
  hours: {
    start: string;
    end: string;
  };
  maxSessionsPerWeek: number;
  sessionDuration: number; // in minutes
}

export interface MentorshipPreferences {
  communicationStyle: 'formal' | 'casual' | 'mixed';
  sessionTypes: ('video' | 'audio' | 'text')[];
  focusAreas: string[];
  experienceLevel: ExperienceLevel;
  goals: string[];
}

export interface MentorshipRequest extends BaseEntity {
  mentorId: string;
  menteeId: string;
  message: string;
  goals: string[];
  durationWeeks: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  mentor: User;
  mentee: User;
  sessions?: MentorshipSession[];
}

export interface MentorshipSession extends BaseEntity {
  requestId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  feedback?: {
    rating: number;
    comment: string;
  };
  request: MentorshipRequest;
}

// ==================== NOTIFICATION TYPES ====================

export type NotificationType = 
  | 'friend_request'
  | 'friend_accepted'
  | 'friend_removed'
  | 'post_liked'
  | 'post_commented'
  | 'post_shared'
  | 'team_invitation'
  | 'team_joined'
  | 'team_left'
  | 'mentorship_request'
  | 'mentorship_accepted'
  | 'mentorship_session_scheduled'
  | 'challenge_completed'
  | 'achievement_unlocked'
  | 'level_up';

export interface Notification extends BaseEntity {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
}

export interface NotificationData {
  actorId?: string;
  actorName?: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, any>;
}

// ==================== ACTIVITY TYPES ====================

export type ActivityType = 
  | 'friend_request_sent'
  | 'friend_request_accepted'
  | 'post_created'
  | 'post_liked'
  | 'post_commented'
  | 'team_joined'
  | 'team_created'
  | 'mentorship_request_sent'
  | 'mentorship_session_completed'
  | 'challenge_completed';

export interface UserActivity extends BaseEntity {
  userId: string;
  activityType: ActivityType;
  activityData: Record<string, any>;
  visibility: 'public' | 'friends' | 'private';
  user: User;
}

// ==================== SEARCH AND FILTER TYPES ====================

export interface SocialSearchFilters {
  query?: string;
  type?: 'users' | 'teams' | 'posts';
  location?: {
    coordinates: [number, number];
    radius: number; // in kilometers
  };
  interests?: string[];
  experienceLevel?: ExperienceLevel;
  availability?: string[];
}

export interface SocialSearchResult {
  users: User[];
  teams: Team[];
  posts: Post[];
  total: number;
  hasMore: boolean;
}

// ==================== ANALYTICS TYPES ====================

export interface SocialAnalytics {
  friends: {
    total: number;
    newThisWeek: number;
    activeFriends: number;
  };
  posts: {
    total: number;
    thisWeek: number;
    averageLikes: number;
    averageComments: number;
  };
  teams: {
    total: number;
    active: number;
    challengesCompleted: number;
  };
  mentorship: {
    sessionsCompleted: number;
    averageRating: number;
    activeConnections: number;
  };
  engagement: {
    dailyActiveMinutes: number;
    weeklyActiveDays: number;
    socialScore: number;
  };
}

// ==================== FORM TYPES ====================

export interface CreatePostForm {
  content: string;
  postType: PostType;
  privacy: PostPrivacy;
  mediaUrls: string[];
  tags: string[];
  location?: PostLocation;
}

export interface CreateTeamForm {
  name: string;
  description?: string;
  privacy: TeamPrivacy;
  maxMembers: number;
  avatarUrl?: string;
}

export interface CreateMentorshipProfileForm {
  profileType: ProfileType;
  bio?: string;
  specialties: string[];
  experienceLevel: ExperienceLevel;
  availability: MentorshipAvailability;
  preferences: MentorshipPreferences;
}

export interface SendMentorshipRequestForm {
  mentorId: string;
  message: string;
  goals: string[];
  durationWeeks: number;
}

// ==================== STATE TYPES ====================

export interface SocialState {
  // Friend system
  friends: Friend[];
  friendRequests: FriendRequest[];
  friendSuggestions: FriendSuggestion[];
  
  // Social feed
  feed: Post[];
  feedLoading: boolean;
  feedHasMore: boolean;
  
  // Teams
  teams: Team[];
  teamInvitations: TeamInvitation[];
  
  // Mentorship
  mentorshipProfile?: MentorshipProfile;
  mentorshipRequests: MentorshipRequest[];
  
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  
  // UI state
  selectedTab: 'feed' | 'friends' | 'teams' | 'mentorship';
  searchQuery: string;
  searchFilters: SocialSearchFilters;
}

// ==================== API RESPONSE TYPES ====================

export interface SocialApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: number;
}

export interface PaginatedSocialResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  message: string;
}

// ==================== ERROR TYPES ====================

export interface SocialError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface SocialValidationError extends SocialError {
  field: string;
  value: any;
  constraint: string;
}

// ==================== WEBSOCKET TYPES ====================

export interface SocialWebSocketMessage {
  type: 'notification' | 'friend_request' | 'post_update' | 'team_update' | 'mentorship_update';
  data: any;
  timestamp: string;
}

export interface RealtimeNotification extends Notification {
  isRealtime: true;
}

// ==================== EXPORT ALL TYPES ====================

export type {
  // Re-export commonly used types
  User,
  Friend,
  FriendRequest,
  FriendSuggestion,
  Post,
  PostComment,
  PostLike,
  Team,
  TeamMember,
  TeamInvitation,
  TeamChallenge,
  MentorshipProfile,
  MentorshipRequest,
  MentorshipSession,
  Notification,
  UserActivity,
  SocialAnalytics,
  SocialState,
  SocialApiResponse,
  PaginatedSocialResponse,
  SocialError,
  SocialWebSocketMessage,
};
