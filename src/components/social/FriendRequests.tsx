/**
 * Friend Requests Component
 * Displays incoming and outgoing friend requests with accept/reject functionality
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  UserX, 
  Clock, 
  MessageCircle,
  Send,
  Inbox,
  Outbox
} from 'lucide-react';
import { 
  useAcceptFriendRequest, 
  useRejectFriendRequest 
} from '../../hooks/useSocialQueries';
import { FriendRequest } from '../../types/social';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';

interface FriendRequestsProps {
  incomingRequests?: FriendRequest[];
  outgoingRequests?: FriendRequest[];
  onRequestProcessed?: (request: FriendRequest) => void;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({ 
  incomingRequests = [],
  outgoingRequests = [],
  onRequestProcessed 
}) => {
  const acceptRequestMutation = useAcceptFriendRequest();
  const rejectRequestMutation = useRejectFriendRequest();
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  const handleAcceptRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));
    try {
      await acceptRequestMutation.mutateAsync(request.id);
      onRequestProcessed?.(request);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (request: FriendRequest) => {
    setProcessingRequests(prev => new Set(prev).add(request.id));
    try {
      await rejectRequestMutation.mutateAsync(request.id);
      onRequestProcessed?.(request);
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(request.id);
        return newSet;
      });
    }
  };

  const formatRequestDate = (dateString: string) => {
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

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600 border-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RequestItem: React.FC<{ 
    request: FriendRequest; 
    type: 'incoming' | 'outgoing';
  }> = ({ request, type }) => {
    const isProcessing = processingRequests.has(request.id);
    const user = type === 'incoming' ? request.sender : request.receiver;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
      >
        <img
          src={user.avatarUrl || '/default-avatar.png'}
          alt={user.displayName}
          className="w-12 h-12 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <p className="font-medium text-gray-900">{user.displayName}</p>
            <Badge variant="outline" size="sm">@{user.username}</Badge>
            {getRequestStatusBadge(request.status)}
          </div>
          
          {request.message && (
            <div className="flex items-start space-x-2 mb-2">
              <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600 italic">"{request.message}"</p>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatRequestDate(request.createdAt)}</span>
          </div>
        </div>
        
        {type === 'incoming' && request.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleRejectRequest(request)}
              disabled={isProcessing}
            >
              <UserX className="h-4 w-4 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => handleAcceptRequest(request)}
              disabled={isProcessing}
            >
              <UserCheck className="h-4 w-4 mr-1" />
              Accept
            </Button>
          </div>
        )}
        
        {type === 'outgoing' && request.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              <Send className="h-3 w-3 mr-1" />
              Sent
            </Badge>
          </div>
        )}
      </motion.div>
    );
  };

  const totalRequests = incomingRequests.length + outgoingRequests.length;

  if (totalRequests === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">
          <Inbox className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No friend requests</p>
          <p className="text-sm">You're all caught up!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Inbox className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold">Friend Requests</h3>
        <Badge variant="secondary">{totalRequests}</Badge>
      </div>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming" className="flex items-center space-x-2">
            <Inbox className="h-4 w-4" />
            <span>Incoming</span>
            {incomingRequests.length > 0 && (
              <Badge variant="destructive" size="sm">{incomingRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="flex items-center space-x-2">
            <Outbox className="h-4 w-4" />
            <span>Outgoing</span>
            {outgoingRequests.length > 0 && (
              <Badge variant="secondary" size="sm">{outgoingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-4">
          {incomingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Inbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No incoming requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {incomingRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    request={request}
                    type="incoming"
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="outgoing" className="mt-4">
          {outgoingRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Outbox className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No outgoing requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {outgoingRequests.map((request) => (
                  <RequestItem
                    key={request.id}
                    request={request}
                    type="outgoing"
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default FriendRequests;
