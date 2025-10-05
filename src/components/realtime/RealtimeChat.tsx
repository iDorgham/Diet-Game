/**
 * RealtimeChat Component
 * Real-time chat system for social features
 * Phase 13-14: Real-time Features
 */

import React, { useState, useEffect, useRef } from 'react';
import { useRealtimeService } from '../../hooks/useRealtimeService';
import { toast } from 'react-hot-toast';

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  chatRoom: string;
  chatType: string;
}

interface RealtimeChatProps {
  chatRoom: string;
  chatType?: 'general' | 'team' | 'challenge' | 'mentorship';
  currentUserId: string;
  currentUsername: string;
  onMessageSent?: (message: ChatMessage) => void;
  className?: string;
}

export const RealtimeChat: React.FC<RealtimeChatProps> = ({
  chatRoom,
  chatType = 'general',
  currentUserId,
  currentUsername,
  onMessageSent,
  className = ''
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeService = useRealtimeService();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Join chat room on mount
  useEffect(() => {
    if (realtimeService && chatRoom) {
      realtimeService.joinChatRoom(chatRoom, chatType);
      setIsConnected(true);
      
      // Request queued messages
      realtimeService.requestQueuedMessages();
    }

    return () => {
      if (realtimeService) {
        realtimeService.leaveChatRoom();
      }
    };
  }, [realtimeService, chatRoom, chatType]);

  // Set up event listeners
  useEffect(() => {
    if (!realtimeService) return;

    const handleMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      
      // Show notification for messages from other users
      if (message.userId !== currentUserId) {
        toast.success(`New message from ${message.username}`, {
          duration: 3000,
          position: 'top-right'
        });
      }
    };

    const handleUserJoined = (data: { userId: string; username: string }) => {
      setParticipants(prev => new Set([...prev, data.userId]));
      toast.info(`${data.username} joined the chat`, {
        duration: 2000,
        position: 'top-right'
      });
    };

    const handleUserLeft = (data: { userId: string; username: string }) => {
      setParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
      toast.info(`${data.username} left the chat`, {
        duration: 2000,
        position: 'top-right'
      });
    };

    const handleTyping = (data: { userId: string; username: string }) => {
      if (data.userId !== currentUserId) {
        setTypingUsers(prev => new Set([...prev, data.username]));
        
        // Clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.username);
            return newSet;
          });
        }, 3000);
      }
    };

    const handleConnectionStatus = (status: boolean) => {
      setIsConnected(status);
      if (!status) {
        toast.error('Chat connection lost. Attempting to reconnect...', {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        toast.success('Chat reconnected successfully', {
          duration: 2000,
          position: 'top-center'
        });
      }
    };

    // Subscribe to events
    realtimeService.subscribe('chat:message', handleMessage);
    realtimeService.subscribe('chat:user_joined', handleUserJoined);
    realtimeService.subscribe('chat:user_left', handleUserLeft);
    realtimeService.subscribe('chat:typing', handleTyping);
    realtimeService.subscribe('connection_status', handleConnectionStatus);

    return () => {
      realtimeService.unsubscribe('chat:message', handleMessage);
      realtimeService.unsubscribe('chat:user_joined', handleUserJoined);
      realtimeService.unsubscribe('chat:user_left', handleUserLeft);
      realtimeService.unsubscribe('chat:typing', handleTyping);
      realtimeService.unsubscribe('connection_status', handleConnectionStatus);
    };
  }, [realtimeService, currentUserId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !realtimeService || !isConnected) return;

    const message: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUserId,
      username: currentUsername,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      chatRoom,
      chatType
    };

    realtimeService.sendChatMessage(message);
    setNewMessage('');
    setIsTyping(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    onMessageSent?.(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping && realtimeService) {
      setIsTyping(true);
      realtimeService.sendTypingIndicator();
    }

    // Clear typing indicator after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getChatTypeIcon = () => {
    switch (chatType) {
      case 'team': return '👥';
      case 'challenge': return '🏆';
      case 'mentorship': return '🎓';
      default: return '💬';
    }
  };

  const getChatTypeColor = () => {
    switch (chatType) {
      case 'team': return 'bg-blue-100 text-blue-800';
      case 'challenge': return 'bg-yellow-100 text-yellow-800';
      case 'mentorship': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg shadow-lg ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getChatTypeIcon()}</span>
          <div>
            <h3 className="font-semibold text-gray-900">{chatRoom}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChatTypeColor()}`}>
                {chatType}
              </span>
              <span className="text-sm text-gray-500">
                {participants.size} participant{participants.size !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <span className="text-4xl mb-2 block">{getChatTypeIcon()}</span>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.userId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.userId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.userId !== currentUserId && (
                  <div className="text-xs font-medium mb-1 opacity-75">
                    {message.username}
                  </div>
                )}
                <div className="text-sm">{message.message}</div>
                <div
                  className={`text-xs mt-1 ${
                    message.userId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={2}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {!isConnected && (
          <div className="mt-2 text-sm text-red-500 text-center">
            Connection lost. Messages will be queued when reconnected.
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeChat;
