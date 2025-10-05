/**
 * Team Recommendation Card Component
 * Specialized card for displaying team recommendations with compatibility details
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  MapPin, 
  Trophy, 
  Calendar,
  TrendingUp,
  Star,
  Clock
} from 'lucide-react';
import { TeamRecommendation } from '../../../types/socialRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Progress } from '../../ui/Progress';

interface TeamRecommendationCardProps {
  recommendation: TeamRecommendation;
  onAccept?: (recommendation: TeamRecommendation) => void;
  onReject?: (recommendation: TeamRecommendation) => void;
  onIgnore?: (recommendation: TeamRecommendation) => void;
  onFeedback?: (recommendation: TeamRecommendation, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function TeamRecommendationCard({
  recommendation,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false
}: TeamRecommendationCardProps) {
  const { team } = recommendation;

  const getCompatibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTeamTypeIcon = (type: string) => {
    switch (type) {
      case 'weight_loss':
        return <Target className="h-4 w-4" />;
      case 'muscle_gain':
        return <Trophy className="h-4 w-4" />;
      case 'endurance':
        return <TrendingUp className="h-4 w-4" />;
      case 'general_fitness':
        return <Star className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTeamTypeColor = (type: string) => {
    switch (type) {
      case 'weight_loss':
        return 'bg-red-100 text-red-800';
      case 'muscle_gain':
        return 'bg-blue-100 text-blue-800';
      case 'endurance':
        return 'bg-green-100 text-green-800';
      case 'general_fitness':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTeamSize = (current: number, max: number) => {
    return `${current}/${max} members`;
  };

  const getAvailabilityStatus = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return { status: 'Full', color: 'text-red-600' };
    if (percentage >= 75) return { status: 'Almost Full', color: 'text-yellow-600' };
    return { status: 'Open', color: 'text-green-600' };
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
      type="team"
    >
      {/* Custom content for team recommendations */}
      <div className="space-y-3">
        {/* Team Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getTeamTypeColor(team.challengeType)}`}>
              {getTeamTypeIcon(team.challengeType)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{team.name}</h3>
              <p className="text-sm text-gray-600">{team.description}</p>
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

        {/* Team Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span>Team Size</span>
              </span>
              <span className="font-medium">{formatTeamSize(recommendation.memberCount, team.maxMembers)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Trophy className="h-4 w-4" />
                <span>Active Challenges</span>
              </span>
              <span className="font-medium">{recommendation.challengeCount}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Created</span>
              </span>
              <span className="font-medium">
                {new Date(team.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-1 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Status</span>
              </span>
              <span className={`font-medium ${getAvailabilityStatus(recommendation.memberCount, team.maxMembers).color}`}>
                {getAvailabilityStatus(recommendation.memberCount, team.maxMembers).status}
              </span>
            </div>
          </div>
        </div>

        {/* Team Goals */}
        {team.goals && team.goals.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Team Goals:</h4>
            <div className="flex flex-wrap gap-1">
              {team.goals.slice(0, 4).map((goal, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {goal}
                </Badge>
              ))}
              {team.goals.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{team.goals.length - 4} more
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
                  <span>Activity Match</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.activityMatch * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.activityMatch * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>Location Match</span>
                </span>
                <div className="flex items-center space-x-2">
                  <Progress 
                    value={recommendation.locationMatch * 100} 
                    className="w-20 h-2"
                  />
                  <span className="text-xs font-medium">
                    {Math.round(recommendation.locationMatch * 100)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
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
            </div>
          </div>
        )}

        {/* Match Reason */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Why this team:</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
            {recommendation.matchReason}
          </p>
        </div>

        {/* Team Privacy */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Privacy:</span>
          <Badge 
            variant={team.privacy === 'public' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {team.privacy === 'public' ? 'Public' : 'Private'}
          </Badge>
        </div>
      </div>
    </RecommendationCard>
  );
}
