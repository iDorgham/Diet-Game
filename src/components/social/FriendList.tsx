/**
 * Friend List Component
 * Displays user's friends with online status and interaction options
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  MoreVertical, 
  Trash2, 
  UserCheck,
  Clock,
  MapPin
} from 'lucide-react';
import { useFriends, useRemoveFriend } from '../../hooks/useSocialQueries';
import { Friend } from '../../types/social';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

interface FriendListProps {
  onFriendSelect?: (friend: Friend) => void;
  showActions?: boolean;
  maxDisplay?: number;
}

const FriendList: React.FC<FriendListProps> = ({ 
  onFriendSelect, 
  showActions = true, 
  maxDisplay 
}) => {
  const { data: friends, isLoading, error } = useFriends();
  const removeFriendMutation = useRemoveFriend();
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const handleRemoveFriend = async () => {
    if (selectedFriend) {
      try {
        await removeFriendMutation.mutateAsync(selectedFriend.friendId);
        setShowRemoveModal(false);
        setSelectedFriend(null);
      } catch (error) {
        console.error('Failed to remove friend:', error);
      }
    }
  };

  const getOnlineStatus = (friend: Friend) => {
    if (friend.friend.isOnline) {
      return { status: 'online', color: 'bg-green-500', text: 'Online' };
    }
    
    const lastActive = new Date(friend.friend.lastActive || '');
    const now = new Date();
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      return { status: 'recent', color: 'bg-yellow-500', text: 'Recently active' };
    } else if (diffHours < 24) {
      return { status: 'today', color: 'bg-blue-500', text: 'Active today' };
    } else {
      return { status: 'offline', color: 'bg-gray-400', text: 'Offline' };
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Unknown';
    
    const date = new Date(lastActive);
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

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Friends</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
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
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load friends</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const displayFriends = maxDisplay ? friends?.slice(0, maxDisplay) : friends;
  const hasMore = maxDisplay && friends && friends.length > maxDisplay;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Friends</h3>
            <Badge variant="secondary">{friends?.length || 0}</Badge>
          </div>
          {showActions && (
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-1" />
              Add Friend
            </Button>
          )}
        </div>

        {!friends || friends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No friends yet</p>
            <p className="text-sm">Start connecting with other users!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {displayFriends?.map((friend) => {
                const onlineStatus = getOnlineStatus(friend);
                
                return (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={friend.friend.avatarUrl || '/default-avatar.png'}
                        alt={friend.friend.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${onlineStatus.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 truncate">
                          {friend.friend.displayName}
                        </p>
                        <Badge variant="outline" size="sm">
                          {friend.mutualFriends} mutual
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatLastActive(friend.friend.lastActive)}</span>
                      </div>
                    </div>
                    
                    {showActions && (
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onFriendSelect?.(friend)}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFriend(friend);
                            setShowRemoveModal(true);
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {hasMore && (
              <div className="text-center pt-2">
                <Button variant="outline" size="sm">
                  View All {friends?.length} Friends
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Remove Friend Modal */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title="Remove Friend"
      >
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={selectedFriend?.friend.avatarUrl || '/default-avatar.png'}
              alt={selectedFriend?.friend.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-medium">Remove {selectedFriend?.friend.displayName}?</p>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowRemoveModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveFriend}
              disabled={removeFriendMutation.isPending}
            >
              {removeFriendMutation.isPending ? 'Removing...' : 'Remove Friend'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FriendList;
