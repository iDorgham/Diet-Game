/**
 * Friend Suggestions Component
 * Displays friend suggestions with reasons and add friend functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, 
  Users, 
  MapPin, 
  Heart, 
  Star,
  Clock,
  Check,
  X
} from 'lucide-react';
import { useFriendSuggestions, useSendFriendRequest } from '../../hooks/useSocialQueries';
import { FriendSuggestion } from '../../types/social';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface FriendSuggestionsProps {
  limit?: number;
  showReasons?: boolean;
  onFriendAdded?: (friend: FriendSuggestion) => void;
}

const FriendSuggestions: React.FC<FriendSuggestionsProps> = ({ 
  limit = 10, 
  showReasons = true,
  onFriendAdded 
}) => {
  const { data: suggestions, isLoading, error, refetch } = useFriendSuggestions(limit);
  const sendFriendRequestMutation = useSendFriendRequest();
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const handleSendFriendRequest = async (friend: FriendSuggestion) => {
    try {
      await sendFriendRequestMutation.mutateAsync({ 
        receiverId: friend.id,
        message: `Hi! I'd like to connect with you on NutriQuest.`
      });
      setSentRequests(prev => new Set(prev).add(friend.id));
      onFriendAdded?.(friend);
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'mutual_friends':
        return <Users className="h-4 w-4" />;
      case 'common_interests':
        return <Heart className="h-4 w-4" />;
      case 'location':
        return <MapPin className="h-4 w-4" />;
      case 'activity':
        return <Star className="h-4 w-4" />;
      default:
        return <UserPlus className="h-4 w-4" />;
    }
  };

  const getReasonText = (reason: string, friend: FriendSuggestion) => {
    switch (reason) {
      case 'mutual_friends':
        return `${friend.mutualFriends} mutual friends`;
      case 'common_interests':
        return `${friend.commonInterests.length} common interests`;
      case 'location':
        return 'Nearby location';
      case 'activity':
        return 'Similar activity level';
      default:
        return 'Suggested for you';
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'mutual_friends':
        return 'bg-blue-100 text-blue-800';
      case 'common_interests':
        return 'bg-pink-100 text-pink-800';
      case 'location':
        return 'bg-green-100 text-green-800';
      case 'activity':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <UserPlus className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold">Friend Suggestions</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load suggestions</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <UserPlus className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No friend suggestions available</p>
          <p className="text-sm">Check back later for new suggestions!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <UserPlus className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold">Friend Suggestions</h3>
          <Badge variant="secondary">{suggestions.length}</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {suggestions.map((friend) => {
            const isRequestSent = sentRequests.has(friend.id);
            
            return (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={friend.avatarUrl || '/default-avatar.png'}
                  alt={friend.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="font-medium text-gray-900 truncate">
                      {friend.displayName}
                    </p>
                    <Badge variant="outline" size="sm">
                      @{friend.username}
                    </Badge>
                  </div>
                  
                  {showReasons && (
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getReasonColor(friend.reason)}`}
                      >
                        <span className="flex items-center space-x-1">
                          {getReasonIcon(friend.reason)}
                          <span>{getReasonText(friend.reason, friend)}</span>
                        </span>
                      </Badge>
                    </div>
                  )}
                  
                  {friend.commonInterests.length > 0 && showReasons && (
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-xs text-gray-500">Interests:</span>
                      <div className="flex space-x-1">
                        {friend.commonInterests.slice(0, 3).map((interest, index) => (
                          <Badge key={index} variant="outline" size="sm" className="text-xs">
                            {interest}
                          </Badge>
                        ))}
                        {friend.commonInterests.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{friend.commonInterests.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {isRequestSent ? (
                    <div className="flex items-center space-x-1 text-green-600">
                      <Check className="h-4 w-4" />
                      <span className="text-sm">Sent</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleSendFriendRequest(friend)}
                      disabled={sendFriendRequestMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {suggestions.length >= limit && (
        <div className="text-center pt-4 border-t">
          <Button variant="outline" size="sm">
            View More Suggestions
          </Button>
        </div>
      )}
    </Card>
  );
};

export default FriendSuggestions;
