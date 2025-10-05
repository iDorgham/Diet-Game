/**
 * Recommendation Card Component
 * Displays individual recommendations with AI scoring and actions
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ThumbsUp,
  ThumbsDown,
  X,
  Star,
  Users, 
  MapPin,
  Heart,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BaseRecommendation } from '../../../types/socialRecommendations';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Progress } from '../../ui/Progress';

interface RecommendationCardProps<T extends BaseRecommendation> {
  recommendation: T;
  onAccept?: (recommendation: T) => void;
  onReject?: (recommendation: T) => void;
  onIgnore?: (recommendation: T) => void;
  onFeedback?: (recommendation: T, feedback: string) => void;
  showActions?: boolean;
  compact?: boolean;
  type: 'friend' | 'team' | 'content' | 'mentorship';
}

export function RecommendationCard<T extends BaseRecommendation>({
  recommendation,
  onAccept,
  onReject,
  onIgnore,
  onFeedback,
  showActions = true,
  compact = false,
  type
}: RecommendationCardProps<T>) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
    if (confidence >= 0.6) return <AlertCircle className="h-4 w-4" />;
    return <X className="h-4 w-4" />;
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'friend':
        return <Users className="h-5 w-5" />;
      case 'team':
        return <Target className="h-5 w-5" />;
      case 'content':
        return <Heart className="h-5 w-5" />;
      case 'mentorship':
        return <Star className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'friend':
        return 'bg-blue-100 text-blue-800';
      case 'team':
        return 'bg-green-100 text-green-800';
      case 'content':
        return 'bg-purple-100 text-purple-800';
      case 'mentorship':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAccept = () => {
    onAccept?.(recommendation);
  };

  const handleReject = () => {
    onReject?.(recommendation);
  };

  const handleIgnore = () => {
    onIgnore?.(recommendation);
  };

  const handleFeedback = () => {
    if (feedbackText.trim()) {
      onFeedback?.(recommendation, feedbackText);
      setFeedbackText('');
      setShowFeedback(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`p-4 hover:shadow-md transition-shadow ${compact ? 'p-3' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getTypeColor()}`}>
              {getTypeIcon()}
            </div>
            <div>
              <Badge variant="outline" className="text-xs">
                {type.charAt(0).toUpperCase() + type.slice(1)} Recommendation
              </Badge>
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getConfidenceColor(recommendation.confidence)}`}
                >
                  <span className="flex items-center space-x-1">
                    {getConfidenceIcon(recommendation.confidence)}
                    <span>{Math.round(recommendation.confidence * 100)}% match</span>
                  </span>
                </Badge>
                <span className="text-xs text-gray-500">
                  AI Score: {Math.round(recommendation.aiScore * 100)}
                </span>
              </div>
            </div>
          </div>
          
          {recommendation.expiresAt && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Expires {new Date(recommendation.expiresAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Content - This will be rendered by specific recommendation components */}
        <div className="mb-3">
          {/* Reasoning */}
          <div className="mb-2">
            <p className="text-sm text-gray-700">{recommendation.reasoning}</p>
          </div>

          {/* AI Score Progress */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>AI Confidence</span>
              <span>{Math.round(recommendation.confidence * 100)}%</span>
            </div>
            <Progress 
              value={recommendation.confidence * 100} 
              className="h-2"
            />
          </div>
        </div>

          {/* Actions */}
          {showActions && (
          <div className="flex items-center justify-between pt-3 border-t">
              <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleAccept}
                className="flex items-center space-x-1"
              >
                <ThumbsUp className="h-4 w-4" />
                <span>Accept</span>
              </Button>
              
                <Button
                  size="sm"
                  variant="outline"
                onClick={handleReject}
                className="flex items-center space-x-1"
              >
                <ThumbsDown className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleIgnore}
                className="flex items-center space-x-1"
              >
                <X className="h-4 w-4" />
                <span>Ignore</span>
              </Button>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFeedback(!showFeedback)}
              className="text-xs"
            >
              Feedback
                </Button>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t"
          >
            <div className="space-y-2">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your feedback about this recommendation..."
                className="w-full p-2 text-sm border rounded-md resize-none"
                rows={2}
              />
              <div className="flex items-center justify-end space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFeedback(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleFeedback}
                  disabled={!feedbackText.trim()}
                >
                  Submit
                </Button>
              </div>
            </div>
          </motion.div>
          )}
      </Card>
    </motion.div>
  );
}