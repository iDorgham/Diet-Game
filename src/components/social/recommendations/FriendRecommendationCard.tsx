/**
 * Friend Recommendation Card Component
 * Specialized card for displaying friend recommendations with detailed matching info
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  MapPin, 
  Heart, 
  Target, 
  UserPlus,
  TrendingUp,
  Star
} from 'lucide-react';
import { FriendRecommendation } from '../../../types/socialRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { AIScoringInsights } from './AIScoringInsights';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

interface FriendRecommendationCardProps {
  recommendation: FriendRecommendation;
  onAccept?: (recommendation: FriendRecommendation) => void;
  onReject?: (recommendation: FriendRecommendation) => void;
  onIgnore?: (recommendation: FriendRecommendation) => void;
  onFeedback?: (recommendation: FriendRecommendation, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function FriendRecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false
}: FriendRecommendationCardProps) {
  const { user } = recommendation;

  const getSimilarityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSimilarityIcon = (type: string) => {
    switch (type) {
      case 'mutual':
        return <Users className="h-4 w-4" />;
      case 'interests':
        return <Heart className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'activity':
        return <TrendingUp className="h-4 w-4" />;
      case 'goals':
        return <Target className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
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
      type="friend"
    >
      {/* Custom content for friend recommendations */}
      <div className="space-y-3">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <img
            src={user.avatarUrl || '/default-avatar.png'}
            alt={user.displayName}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user.displayName}</h3>
            <p className="text-sm text-gray-600">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Match Reasons */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Why we think you'd connect:</h4>
          <div className="flex flex-wrap gap-2">
            {recommendation.mutualFriends > 0 && (
              <Badge 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <Users className="h-3 w-3" />
                <span>{recommendation.mutualFriends} mutual friends</span>
              </Badge>
            )}
            
            {recommendation.commonInterests.length > 0 && (
              <Badge 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <Heart className="h-3 w-3" />
                <span>{recommendation.commonInterests.length} shared interests</span>
              </Badge>
            )}
            
            {recommendation.locationSimilarity > 0.7 && (
              <Badge 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <MapPin className="h-3 w-3" />
                <span>Nearby location</span>
              </Badge>
            )}
            
            {recommendation.activitySimilarity > 0.8 && (
              <Badge 
                variant="secondary" 
                className="flex items-center space-x-1"
              >
                <TrendingUp className="h-3 w-3" />
                <span>Similar activity level</span>
              </Badge>
            )}
          </div>
        </div>

        {/* AI Scoring Insights */}
        <AIScoringInsights 
          recommendation={recommendation} 
          compact={compact}
        />

        {/* Detailed Match Scores */}
        {!compact && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Match Details:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>Mutual Friends</span>
                </span>
                <Badge 
                  variant="outline" 
                  className={getSimilarityColor(recommendation.mutualFriends / 10)}
                >
                  {recommendation.mutualFriends}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>Common Interests</span>
                </span>
                <Badge 
                  variant="outline" 
                  className={getSimilarityColor(recommendation.commonInterests.length / 5)}
                >
                  {recommendation.commonInterests.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>Location</span>
                </span>
                <Badge 
                  variant="outline" 
                  className={getSimilarityColor(recommendation.locationSimilarity)}
                >
                  {Math.round(recommendation.locationSimilarity * 100)}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Activity</span>
                </span>
                <Badge 
                  variant="outline" 
                  className={getSimilarityColor(recommendation.activitySimilarity)}
                >
                  {Math.round(recommendation.activitySimilarity * 100)}%
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Common Interests */}
        {recommendation.commonInterests.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Shared Interests:</h4>
            <div className="flex flex-wrap gap-1">
              {recommendation.commonInterests.slice(0, 5).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {recommendation.commonInterests.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{recommendation.commonInterests.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Match Reasons */}
        {recommendation.matchReasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Why this match:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recommendation.matchReasons.map((reason, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </RecommendationCard>
  );
}
