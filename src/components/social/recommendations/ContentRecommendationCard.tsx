/**
 * Content Recommendation Card Component
 * Specialized card for displaying content recommendations with engagement predictions
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share, 
  TrendingUp, 
  Eye,
  Clock,
  User,
  Hash,
  ThumbsUp,
  BarChart3
} from 'lucide-react';
import { ContentRecommendation } from '../../../types/socialRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';

interface ContentRecommendationCardProps {
  recommendation: ContentRecommendation;
  onAccept?: (recommendation: ContentRecommendation) => void;
  onReject?: (recommendation: ContentRecommendation) => void;
  onIgnore?: (recommendation: ContentRecommendation) => void;
  onFeedback?: (recommendation: ContentRecommendation, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function ContentRecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false
}: ContentRecommendationCardProps) {
  const { post } = recommendation;

  const getEngagementColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case 'achievement':
        return <TrendingUp className="h-4 w-4" />;
      case 'progress':
        return <BarChart3 className="h-4 w-4" />;
      case 'meal':
        return <Heart className="h-4 w-4" />;
      case 'workout':
        return <ThumbsUp className="h-4 w-4" />;
      case 'challenge':
        return <Hash className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
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
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <RecommendationCard
      recommendation={recommendation}
      onAccept={onAccept}
      onReject={onReject}
      onIgnore={onIgnore}
      onFeedback={onFeedback}
      showActions={showActions}
      compact={compact}
      type="content"
    >
      {/* Custom content for content recommendations */}
      <div className="space-y-3">
        {/* Post Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={post.user.avatarUrl || '/default-avatar.png'}
              alt={post.user.displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{post.user.displayName}</h4>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPostTypeColor(post.type)}`}
                >
                  <span className="flex items-center space-x-1">
                    {getPostTypeIcon(post.type)}
                    <span>{post.type}</span>
                  </span>
                </Badge>
              </div>
              <p className="text-xs text-gray-500">@{post.user.username} • {formatPostDate(post.createdAt)}</p>
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant="outline" 
              className={getEngagementColor(recommendation.engagementPrediction)}
            >
              {Math.round(recommendation.engagementPrediction * 100)}% engagement
            </Badge>
          </div>
        </div>

        {/* Post Content */}
        <div className="space-y-2">
          <p className="text-sm text-gray-800">
            {compact ? truncateText(post.content, 150) : post.content}
          </p>
          
          {/* Post Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Post Media */}
        {post.mediaUrl && (
          <div className="rounded-lg overflow-hidden bg-gray-100">
            <img
              src={post.mediaUrl}
              alt="Post media"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Current Engagement */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{post.likeCount || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentCount || 0}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Share className="h-4 w-4" />
              <span>{post.shareCount || 0}</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatPostDate(post.createdAt)}</span>
          </div>
        </div>

        {/* Recommendation Scores */}
        {!compact && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Why we recommend this:</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Interest Match</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.interestScore * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.interestScore * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Friend Connection</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.friendBoost * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.friendBoost * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>Engagement Score</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.engagementScore * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.engagementScore * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Recency</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.recencyScore * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.recencyScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Prediction */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Expected Engagement:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-gray-600">
                <Heart className="h-4 w-4" />
                <span>Expected Likes</span>
              </span>
              <span className="font-medium">{recommendation.expectedLikes}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span>Expected Comments</span>
              </span>
              <span className="font-medium">{recommendation.expectedComments}</span>
            </div>
          </div>
        </div>

        {/* Why Recommended */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Why recommended:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            {recommendation.whyRecommended}
          </p>
        </div>
      </div>
    </RecommendationCard>
  );
}
