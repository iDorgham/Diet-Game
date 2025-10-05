/**
 * Social Features React Query Hooks
 * Comprehensive hooks for all social API operations with caching and mutations
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  SocialAPI,
  socialQueryKeys,
  socialMutationKeys,
  Friend,
  FriendRequest,
  Post,
  Comment,
  Team,
  MentorshipProfile,
  MentorshipRequest,
  Notification,
  CreatePostForm,
  CreateTeamForm,
  CreateMentorshipProfileForm,
  SendMentorshipRequestForm,
} from '../services/socialApi';

// ==================== FRIEND SYSTEM HOOKS ====================

/**
 * Hook to get user's friends list
 */
export const useFriends = () => {
  return useQuery({
    queryKey: socialQueryKeys.friends(),
    queryFn: SocialAPI.friends.getFriendsList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to get friend suggestions
 */
export const useFriendSuggestions = (limit: number = 10) => {
  return useQuery({
    queryKey: socialQueryKeys.friendSuggestions(limit),
    queryFn: () => SocialAPI.friends.getFriendSuggestions(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

/**
 * Hook to send a friend request
 */
export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.sendFriendRequest(),
    mutationFn: ({ receiverId, message }: { receiverId: string; message?: string }) =>
      SocialAPI.friends.sendFriendRequest(receiverId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.friends() });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.friendSuggestions() });
      toast.success('Friend request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send friend request');
    },
  });
};

/**
 * Hook to accept a friend request
 */
export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.acceptFriendRequest(),
    mutationFn: (requestId: string) => SocialAPI.friends.acceptFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.friends() });
      toast.success('Friend request accepted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept friend request');
    },
  });
};

/**
 * Hook to reject a friend request
 */
export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.rejectFriendRequest(),
    mutationFn: (requestId: string) => SocialAPI.friends.rejectFriendRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.friends() });
      toast.success('Friend request rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject friend request');
    },
  });
};

/**
 * Hook to remove a friend
 */
export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.removeFriend(),
    mutationFn: (friendId: string) => SocialAPI.friends.removeFriend(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.friends() });
      toast.success('Friend removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove friend');
    },
  });
};

// ==================== SOCIAL FEED HOOKS ====================

/**
 * Hook to get personalized feed with infinite scrolling
 */
export const useSocialFeed = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: socialQueryKeys.feed(limit, 0),
    queryFn: ({ pageParam = 0 }) => SocialAPI.feed.getPersonalizedFeed(limit, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to create a new post
 */
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.createPost(),
    mutationFn: (postData: CreatePostForm) => SocialAPI.feed.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed() });
      toast.success('Post created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

/**
 * Hook to like/unlike a post
 */
export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.togglePostLike(),
    mutationFn: (postId: string) => SocialAPI.feed.togglePostLike(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update like');
    },
  });
};

/**
 * Hook to add a comment to a post
 */
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.addComment(),
    mutationFn: ({ postId, content, parentCommentId }: { 
      postId: string; 
      content: string; 
      parentCommentId?: string; 
    }) => SocialAPI.feed.addComment(postId, content, parentCommentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed() });
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.postComments(postId, 50, 0) });
      toast.success('Comment added successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

/**
 * Hook to get comments for a post
 */
export const usePostComments = (postId: string, limit: number = 50) => {
  return useQuery({
    queryKey: socialQueryKeys.postComments(postId, limit, 0),
    queryFn: () => SocialAPI.feed.getPostComments(postId, limit, 0),
    enabled: !!postId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== TEAM CHALLENGES HOOKS ====================

/**
 * Hook to get user's teams
 */
export const useUserTeams = () => {
  return useQuery({
    queryKey: socialQueryKeys.userTeams(),
    queryFn: SocialAPI.teams.getUserTeams,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to create a team
 */
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.createTeam(),
    mutationFn: (teamData: CreateTeamForm) => SocialAPI.teams.createTeam(teamData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.userTeams() });
      toast.success('Team created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create team');
    },
  });
};

/**
 * Hook to join a team
 */
export const useJoinTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.joinTeam(),
    mutationFn: (teamId: string) => SocialAPI.teams.joinTeam(teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.userTeams() });
      toast.success('Successfully joined the team!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to join team');
    },
  });
};

// ==================== MENTORSHIP SYSTEM HOOKS ====================

/**
 * Hook to create mentorship profile
 */
export const useCreateMentorshipProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.createMentorshipProfile(),
    mutationFn: (profileData: CreateMentorshipProfileForm) => 
      SocialAPI.mentorship.createMentorshipProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.mentorshipProfile() });
      toast.success('Mentorship profile created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create mentorship profile');
    },
  });
};

/**
 * Hook to send mentorship request
 */
export const useSendMentorshipRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.sendMentorshipRequest(),
    mutationFn: (requestData: SendMentorshipRequestForm) => 
      SocialAPI.mentorship.sendMentorshipRequest(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.mentorshipProfile() });
      toast.success('Mentorship request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send mentorship request');
    },
  });
};

// ==================== NOTIFICATIONS HOOKS ====================

/**
 * Hook to get user notifications
 */
export const useNotifications = (limit: number = 20) => {
  return useQuery({
    queryKey: socialQueryKeys.notifications(limit, 0),
    queryFn: () => SocialAPI.notifications.getUserNotifications(limit, 0),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

/**
 * Hook to mark notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: socialMutationKeys.markNotificationAsRead(),
    mutationFn: (notificationId: string) => 
      SocialAPI.notifications.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.notifications() });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
};

// ==================== UTILITY HOOKS ====================

/**
 * Hook to get unread notification count
 */
export const useUnreadNotificationCount = () => {
  const { data: notifications } = useNotifications(100); // Get more notifications to count unread
  
  return {
    count: notifications?.filter(n => !n.isRead).length || 0,
    hasUnread: (notifications?.filter(n => !n.isRead).length || 0) > 0,
  };
};

/**
 * Hook to refresh all social data
 */
export const useRefreshSocialData = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['social'] });
    toast.success('Social data refreshed!');
  };
};

/**
 * Hook to get social activity summary
 */
export const useSocialActivitySummary = () => {
  const { data: friends } = useFriends();
  const { data: teams } = useUserTeams();
  const { data: notifications } = useNotifications();
  const { count: unreadCount } = useUnreadNotificationCount();

  return {
    friendsCount: friends?.length || 0,
    teamsCount: teams?.length || 0,
    notificationsCount: notifications?.length || 0,
    unreadNotificationsCount: unreadCount,
    isLoading: !friends || !teams || !notifications,
  };
};

// ==================== OPTIMISTIC UPDATES ====================

/**
 * Hook for optimistic post like updates
 */
export const useOptimisticPostLike = () => {
  const queryClient = useQueryClient();
  const toggleLike = useTogglePostLike();

  return useMutation({
    mutationFn: (postId: string) => SocialAPI.feed.togglePostLike(postId),
    onMutate: async (postId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: socialQueryKeys.feed() });

      // Snapshot previous value
      const previousFeed = queryClient.getQueryData(socialQueryKeys.feed(20, 0));

      // Optimistically update
      queryClient.setQueryData(socialQueryKeys.feed(20, 0), (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: Post[]) =>
            page.map((post: Post) =>
              post.id === postId
                ? {
                    ...post,
                    userLiked: !post.userLiked,
                    likeCount: post.userLiked ? post.likeCount - 1 : post.likeCount + 1,
                  }
                : post
            )
          ),
        };
      });

      return { previousFeed };
    },
    onError: (err, postId, context) => {
      // Revert optimistic update on error
      if (context?.previousFeed) {
        queryClient.setQueryData(socialQueryKeys.feed(20, 0), context.previousFeed);
      }
      toast.error('Failed to update like');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: socialQueryKeys.feed() });
    },
  });
};

export default {
  // Friend system
  useFriends,
  useFriendSuggestions,
  useSendFriendRequest,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useRemoveFriend,
  
  // Social feed
  useSocialFeed,
  useCreatePost,
  useTogglePostLike,
  useAddComment,
  usePostComments,
  
  // Teams
  useUserTeams,
  useCreateTeam,
  useJoinTeam,
  
  // Mentorship
  useCreateMentorshipProfile,
  useSendMentorshipRequest,
  
  // Notifications
  useNotifications,
  useMarkNotificationAsRead,
  useUnreadNotificationCount,
  
  // Utilities
  useRefreshSocialData,
  useSocialActivitySummary,
  useOptimisticPostLike,
};
