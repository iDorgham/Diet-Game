/**
 * Mentorship Recommendation Card Component
 * Specialized card for displaying mentorship recommendations with compatibility details
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Target, 
  Clock, 
  TrendingUp, 
  User,
  Award,
  Calendar,
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { MentorshipRecommendation } from '../../../types/socialRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';

interface MentorshipRecommendationCardProps {
  recommendation: MentorshipRecommendation;
  onAccept?: (recommendation: MentorshipRecommendation) => void;
  onReject?: (recommendation: MentorshipRecommendation) => void;
  onIgnore?: (recommendation: MentorshipRecommendation) => void;
  onFeedback?: (recommendation: MentorshipRecommendation, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function MentorshipRecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false
}: MentorshipRecommendationCardProps) {
  const { mentor } = recommendation;

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-purple-100 text-purple-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getAvailabilityIcon = (availability: string) => {
    switch (availability) {
      case 'high':
        return <CheckCircle className="h-4 w-4" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4" />;
      case 'low':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDuration = (weeks: number) => {
    if (weeks < 4) return `${weeks} weeks`;
    if (weeks < 52) return `${Math.floor(weeks / 4)} months`;
    return `${Math.floor(weeks / 52)} years`;
  };

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 0.8) return 'text-green-600';
    if (probability >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
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
      type="mentorship"
    >
      {/* Custom content for mentorship recommendations */}
      <div className="space-y-3">
        {/* Mentor Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={mentor.avatarUrl || '/default-avatar.png'}
              alt={mentor.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{mentor.displayName}</h3>
              <p className="text-sm text-gray-600">@{mentor.username}</p>
              {mentor.bio && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{mentor.bio}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <Badge 
              variant="outline" 
              className={getCompatibilityColor(recommendation.compatibilityScore)}
            >
              {Math.round(recommendation.compatibilityScore * 100)}% match
            </Badge>
          </div>
        </div>

        {/* Mentor Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Award className="h-4 w-4" />
                <span>Experience</span>
              </span>
              <Badge 
                variant="outline" 
                className={getExperienceLevelColor(mentor.experienceLevel)}
              >
                {mentor.experienceLevel}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Star className="h-4 w-4" />
                <span>Rating</span>
              </span>
              <span className="font-medium">
                {mentor.rating ? `${mentor.rating.toFixed(1)}/5` : 'No rating'}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Availability</span>
              </span>
              <Badge 
                variant="outline" 
                className={getAvailabilityColor(mentor.availability)}
              >
                <span className="flex items-center space-x-1">
                  {getAvailabilityIcon(mentor.availability)}
                  <span>{mentor.availability}</span>
                </span>
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Est. Duration</span>
              </span>
              <span className="font-medium">
                {formatDuration(recommendation.estimatedDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        {mentor.specialties && mentor.specialties.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Specialties:</h4>
            <div className="flex flex-wrap gap-1">
              {mentor.specialties.slice(0, 5).map((specialty, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {mentor.specialties.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{mentor.specialties.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Compatibility Breakdown */}
        {!compact && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Compatibility Breakdown:</h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>Goal Alignment</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.goalAlignment * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.goalAlignment * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Experience Match</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.experienceMatch * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.experienceMatch * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Availability</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.availabilityScore * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.availabilityScore * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Star className="h-4 w-4" />
                  <span>Rating Score</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.ratingScore * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.ratingScore * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Prediction */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Success Prediction:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-gray-600">
                <TrendingUp className="h-4 w-4" />
                <span>Success Probability</span>
              </span>
              <span className={`font-medium ${getSuccessProbabilityColor(recommendation.successProbability)}`}>
                {Math.round(recommendation.successProbability * 100)}%
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center space-x-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Expected Outcome</span>
              </span>
              <span className="font-medium">
                {Math.round(recommendation.expectedOutcome * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Match Reasons */}
        {recommendation.matchReasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Why this mentor:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {recommendation.matchReasons.map((reason, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Mentorship Stats */}
        {mentor.totalSessions && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Mentorship Experience:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-medium">{mentor.totalSessions}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">
                  {mentor.successRate ? `${Math.round(mentor.successRate * 100)}%` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecommendationCard>
  );
}
