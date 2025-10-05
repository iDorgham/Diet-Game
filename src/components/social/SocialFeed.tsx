/**
 * Social Feed Component
 * Displays personalized social feed with posts, interactions, and infinite scrolling
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  ThumbsUp,
  Smile,
  Trophy,
  BarChart3,
  Utensils,
  Dumbbell,
  Users,
  Clock,
  MapPin,
  Hash
} from 'lucide-react';
import { useSocialFeed, useTogglePostLike, useAddComment } from '../../hooks/useSocialQueries';
import { Post, Comment } from '../../types/social';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import PostCreator from './PostCreator';

interface SocialFeedProps {
  showPostCreator?: boolean;
  limit?: number;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ 
  showPostCreator = true, 
  limit = 20 
}) => {
  const { 
    data, 
    isLoading, 
    error, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useSocialFeed(limit);
  
  const toggleLikeMutation = useTogglePostLike();
  const addCommentMutation = useAddComment();
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const posts = data?.pages.flat() || [];

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      case 'progress':
        return <BarChart3 className="h-4 w-4" />;
      case 'meal':
        return <Utensils className="h-4 w-4" />;
      case 'workout':
        return <Dumbbell className="h-4 w-4" />;
      case 'challenge':
        return <Users className="h-4 w-4" />;
      default:
        return <Smile className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (postType: string) => {
    switch (postType) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800';
      case 'progress':
        return 'bg-green-100 text-green-800';
      case 'meal':
        return 'bg-orange-100 text-orange-800';
      case 'workout':
        return 'bg-purple-100 text-purple-800';
      case 'challenge':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleLike = async (post: Post) => {
    try {
      await toggleLikeMutation.mutateAsync(post.id);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim()) return;
    
    try {
      await addCommentMutation.mutateAsync({
        postId,
        content: commentText.trim(),
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleScroll = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop >=
      document.documentElement.offsetHeight - 1000
    ) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showPostCreator && <PostCreator compact />}
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">
          <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load feed</p>
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showPostCreator && (
        <PostCreator 
          onPostCreated={() => window.location.reload()} 
        />
      )}

      {posts.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No posts yet</h3>
          <p className="text-gray-500 mb-4">Be the first to share something with your friends!</p>
          <Button onClick={() => window.location.reload()}>
            Refresh Feed
          </Button>
        </Card>
      ) : (
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatarUrl || '/default-avatar.png'}
                      alt={post.author.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold text-gray-900">
                          {post.author.displayName}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getPostTypeColor(post.postType)}`}
                        >
                          {getPostTypeIcon(post.postType)}
                          <span className="ml-1 capitalize">{post.postType}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatPostDate(post.createdAt)}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <MapPin className="h-3 w-3" />
                            <span>{post.location.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                  
                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" size="sm">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Media */}
                {post.mediaUrls.length > 0 && (
                  <div className="mb-4">
                    <div className={`grid gap-2 ${
                      post.mediaUrls.length === 1 ? 'grid-cols-1' : 
                      post.mediaUrls.length === 2 ? 'grid-cols-2' : 
                      'grid-cols-2'
                    }`}>
                      {post.mediaUrls.slice(0, 4).map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Post media ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                    {post.mediaUrls.length > 4 && (
                      <p className="text-sm text-gray-500 mt-2">
                        +{post.mediaUrls.length - 4} more images
                      </p>
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLike(post)}
                      className={`flex items-center space-x-2 ${
                        post.userLiked ? 'text-red-500' : 'text-gray-500'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.userLiked ? 'fill-current' : ''}`} />
                      <span>{post.likeCount}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setShowComments(true);
                      }}
                      className="flex items-center space-x-2 text-gray-500"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>{post.commentCount}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-gray-500"
                    >
                      <Share className="h-4 w-4" />
                      <span>{post.shareCount}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      )}

      {/* Load More */}
      {isFetchingNextPage && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}

      {/* Comments Modal */}
      <Modal
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        title={`Comments (${selectedPost?.commentCount || 0})`}
        size="lg"
      >
        {selectedPost && (
          <div className="p-6">
            {/* Add Comment */}
            <div className="flex items-center space-x-3 mb-6">
              <img
                src="/default-avatar.png"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 flex space-x-2">
                <Input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(selectedPost.id);
                    }
                  }}
                />
                <Button
                  onClick={() => handleAddComment(selectedPost.id)}
                  disabled={!commentText.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              <p className="text-gray-500 text-center py-4">
                Comments will be loaded here
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SocialFeed;
