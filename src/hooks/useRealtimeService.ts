/**
 * Enhanced Realtime Service Hook
 * Comprehensive hook for all real-time features
 * Phase 13-14: Real-time Features
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  realtimeService, 
  useRealtimeUpdates,
  ConnectionState,
  AllRealtimeEvents
} from '../services/realtimeService';

// Chat message interface
interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
  chatRoom: string;
  chatType: string;
}

// Challenge interfaces
interface ChallengeProgress {
  userId: string;
  username: string;
  challengeId: string;
  progress: number;
  score: number;
  timestamp: string;
}

interface ChallengeCompletion {
  userId: string;
  username: string;
  challengeId: string;
  finalScore: number;
  completionTime: number;
  timestamp: string;
}

// Analytics interfaces
interface AnalyticsData {
  timestamp: string;
  system: any;
  users: any;
  performance: any;
  gamification: any;
  social: any;
  nutrition: any;
}

// Moderation interfaces
interface ModerationReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reportType: string;
  reason: string;
  content: string;
  timestamp: string;
  status: string;
  severity: string;
}

/**
 * Enhanced realtime service hook with all features
 */
export function useRealtimeService() {
  const queryClient = useQueryClient();
  const { isConnected, connectionStatus } = useRealtimeUpdates();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const eventListeners = useRef<Map<string, Set<(event: any) => void>>>(new Map());

  // Subscribe to an event
  const subscribe = useCallback((eventType: string, handler: (event: any) => void) => {
    if (!eventListeners.current.has(eventType)) {
      eventListeners.current.set(eventType, new Set());
    }
    eventListeners.current.get(eventType)!.add(handler);

    // Subscribe to the real service
    realtimeService.subscribe(eventType, handler);

    return () => {
      const listeners = eventListeners.current.get(eventType);
      if (listeners) {
        listeners.delete(handler);
        if (listeners.size === 0) {
          eventListeners.current.delete(eventType);
        }
      }
      realtimeService.unsubscribe(eventType, handler);
    };
  }, []);

  // Unsubscribe from an event
  const unsubscribe = useCallback((eventType: string, handler: (event: any) => void) => {
    const listeners = eventListeners.current.get(eventType);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        eventListeners.current.delete(eventType);
      }
    }
    realtimeService.unsubscribe(eventType, handler);
  }, []);

  // ===== CHAT FUNCTIONALITY =====
  
  const joinChatRoom = useCallback((chatRoom: string, chatType: string = 'general') => {
    if (realtimeService && isConnected) {
      realtimeService.emit('chat:join', { chatRoom, chatType });
    }
  }, [isConnected]);

  const leaveChatRoom = useCallback(() => {
    if (realtimeService && isConnected) {
      realtimeService.emit('chat:leave');
    }
  }, [isConnected]);

  const sendChatMessage = useCallback((message: ChatMessage) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('chat:message', {
        message: message.message
      });
    }
  }, [isConnected]);

  const sendTypingIndicator = useCallback(() => {
    if (realtimeService && isConnected) {
      realtimeService.emit('chat:typing');
    }
  }, [isConnected]);

  // ===== CHALLENGE FUNCTIONALITY =====

  const joinChallenge = useCallback((challengeId: string) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('challenge:join', { challengeId });
    }
  }, [isConnected]);

  const leaveChallenge = useCallback((challengeId: string) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('challenge:leave', { challengeId });
    }
  }, [isConnected]);

  const updateChallengeProgress = useCallback((challengeId: string, progress: number, score: number) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('challenge:progress', {
        challengeId,
        progress,
        score
      });
    }
  }, [isConnected]);

  const completeChallenge = useCallback((challengeId: string, finalScore: number, completionTime: number) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('challenge:complete', {
        challengeId,
        finalScore,
        completionTime
      });
    }
  }, [isConnected]);

  // ===== ANALYTICS FUNCTIONALITY =====

  const subscribeToAnalytics = useCallback((analyticsType: string = 'general') => {
    if (realtimeService && isConnected) {
      realtimeService.emit('analytics:subscribe', { analyticsType });
    }
  }, [isConnected]);

  const unsubscribeFromAnalytics = useCallback((analyticsType: string = 'general') => {
    if (realtimeService && isConnected) {
      realtimeService.emit('analytics:unsubscribe', { analyticsType });
    }
  }, [isConnected]);

  // ===== MODERATION FUNCTIONALITY =====

  const reportContent = useCallback((reportData: {
    reportedUserId: string;
    reportType: string;
    reason: string;
    content: string;
  }) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('moderation:report', reportData);
    }
  }, [isConnected]);

  const joinModeration = useCallback(() => {
    if (realtimeService && isConnected) {
      realtimeService.emit('moderation:join');
    }
  }, [isConnected]);

  const resolveReport = useCallback((reportId: string, action: string, notes: string) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('moderation:resolve_report', {
        reportId,
        action,
        notes
      });
    }
  }, [isConnected]);

  // ===== MESSAGE QUEUE FUNCTIONALITY =====

  const requestQueuedMessages = useCallback(() => {
    if (realtimeService && isConnected) {
      realtimeService.emit('message_queue:request');
    }
  }, [isConnected]);

  // ===== ROOM MANAGEMENT =====

  const joinRoom = useCallback((roomName: string) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('join_room', roomName);
    }
  }, [isConnected]);

  const leaveRoom = useCallback((roomName: string) => {
    if (realtimeService && isConnected) {
      realtimeService.emit('leave_room', roomName);
    }
  }, [isConnected]);

  // ===== CONNECTION MANAGEMENT =====

  const connect = useCallback(() => {
    realtimeService.connect();
  }, []);

  const disconnect = useCallback(() => {
    realtimeService.disconnect();
  }, []);

  // ===== NOTIFICATION MANAGEMENT =====

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // ===== EVENT HANDLERS =====

  useEffect(() => {
    if (!realtimeService) return;

    // Handle notifications
    const handleNotification = (event: any) => {
      addNotification(event.data);
      toast.success(event.data.title, {
        duration: 5000,
        position: 'top-right'
      });
    };

    // Handle connection status changes
    const handleConnectionStatus = (status: boolean) => {
      if (!status) {
        toast.error('Connection lost. Attempting to reconnect...', {
          duration: 5000,
          position: 'top-center'
        });
      } else {
        toast.success('Reconnected successfully', {
          duration: 2000,
          position: 'top-center'
        });
      }
    };

    // Subscribe to global events
    realtimeService.subscribe('notification', handleNotification);
    realtimeService.subscribe('connection_status', handleConnectionStatus);

    return () => {
      realtimeService.unsubscribe('notification', handleNotification);
      realtimeService.unsubscribe('connection_status', handleConnectionStatus);
    };
  }, [addNotification]);

  // ===== CLEANUP =====

  useEffect(() => {
    return () => {
      // Clean up all event listeners
      eventListeners.current.forEach((listeners, eventType) => {
        listeners.forEach(handler => {
          realtimeService.unsubscribe(eventType, handler);
        });
      });
      eventListeners.current.clear();
    };
  }, []);

  return {
    // Connection status
    isConnected,
    connectionStatus,
    connect,
    disconnect,

    // Event management
    subscribe,
    unsubscribe,

    // Chat functionality
    joinChatRoom,
    leaveChatRoom,
    sendChatMessage,
    sendTypingIndicator,

    // Challenge functionality
    joinChallenge,
    leaveChallenge,
    updateChallengeProgress,
    completeChallenge,

    // Analytics functionality
    subscribeToAnalytics,
    unsubscribeFromAnalytics,

    // Moderation functionality
    reportContent,
    joinModeration,
    resolveReport,

    // Message queue functionality
    requestQueuedMessages,

    // Room management
    joinRoom,
    leaveRoom,

    // Notification management
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotifications,

    // Utility methods
    emit: realtimeService?.emit.bind(realtimeService),
    getConnectionHealth: realtimeService?.getConnectionHealth.bind(realtimeService),
    getQueuedMessages: realtimeService?.getQueuedMessages.bind(realtimeService)
  };
}

/**
 * Hook for real-time chat functionality
 */
export function useRealtimeChat(chatRoom: string, chatType: string = 'general') {
  const realtimeService = useRealtimeService();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (realtimeService && chatRoom) {
      realtimeService.joinChatRoom(chatRoom, chatType);
    }

    return () => {
      if (realtimeService) {
        realtimeService.leaveChatRoom();
      }
    };
  }, [realtimeService, chatRoom, chatType]);

  useEffect(() => {
    if (!realtimeService) return;

    const handleMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleUserJoined = (data: { userId: string; username: string }) => {
      setParticipants(prev => new Set([...prev, data.userId]));
    };

    const handleUserLeft = (data: { userId: string; username: string }) => {
      setParticipants(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    };

    const handleTyping = (data: { userId: string; username: string }) => {
      setTypingUsers(prev => new Set([...prev, data.username]));
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }, 3000);
    };

    realtimeService.subscribe('chat:message', handleMessage);
    realtimeService.subscribe('chat:user_joined', handleUserJoined);
    realtimeService.subscribe('chat:user_left', handleUserLeft);
    realtimeService.subscribe('chat:typing', handleTyping);

    return () => {
      realtimeService.unsubscribe('chat:message', handleMessage);
      realtimeService.unsubscribe('chat:user_joined', handleUserJoined);
      realtimeService.unsubscribe('chat:user_left', handleUserLeft);
      realtimeService.unsubscribe('chat:typing', handleTyping);
    };
  }, [realtimeService]);

  return {
    messages,
    participants,
    isTyping,
    typingUsers,
    sendMessage: realtimeService.sendChatMessage,
    sendTyping: realtimeService.sendTypingIndicator,
    isConnected: realtimeService.isConnected
  };
}

/**
 * Hook for real-time analytics
 */
export function useRealtimeAnalytics(analyticsType: string = 'general') {
  const realtimeService = useRealtimeService();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (realtimeService) {
      realtimeService.subscribeToAnalytics(analyticsType);
    }

    return () => {
      if (realtimeService) {
        realtimeService.unsubscribeFromAnalytics(analyticsType);
      }
    };
  }, [realtimeService, analyticsType]);

  useEffect(() => {
    if (!realtimeService) return;

    const handleAnalyticsUpdate = (data: AnalyticsData) => {
      setAnalyticsData(data);
      setLastUpdate(new Date());
    };

    realtimeService.subscribe('analytics:update', handleAnalyticsUpdate);

    return () => {
      realtimeService.unsubscribe('analytics:update', handleAnalyticsUpdate);
    };
  }, [realtimeService]);

  return {
    analyticsData,
    lastUpdate,
    isConnected: realtimeService.isConnected
  };
}

/**
 * Hook for real-time challenges
 */
export function useRealtimeChallenge(challengeId: string) {
  const realtimeService = useRealtimeService();
  const [participants, setParticipants] = useState<Map<string, any>>(new Map());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (realtimeService && challengeId) {
      realtimeService.joinChallenge(challengeId);
    }

    return () => {
      if (realtimeService) {
        realtimeService.leaveChallenge(challengeId);
      }
    };
  }, [realtimeService, challengeId]);

  useEffect(() => {
    if (!realtimeService) return;

    const handleParticipantJoined = (data: any) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          newMap.set(data.userId, {
            userId: data.userId,
            username: data.username,
            progress: 0,
            score: 0,
            isCompleted: false
          });
          return newMap;
        });
      }
    };

    const handleProgressUpdate = (data: ChallengeProgress) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          const participant = newMap.get(data.userId);
          if (participant) {
            newMap.set(data.userId, {
              ...participant,
              progress: data.progress,
              score: data.score
            });
          }
          return newMap;
        });
      }
    };

    const handleChallengeCompleted = (data: ChallengeCompletion) => {
      if (data.challengeId === challengeId) {
        setParticipants(prev => {
          const newMap = new Map(prev);
          const participant = newMap.get(data.userId);
          if (participant) {
            newMap.set(data.userId, {
              ...participant,
              progress: 100,
              score: data.finalScore,
              isCompleted: true,
              completionTime: data.timestamp
            });
          }
          return newMap;
        });
      }
    };

    realtimeService.subscribe('challenge:participant_joined', handleParticipantJoined);
    realtimeService.subscribe('challenge:progress_update', handleProgressUpdate);
    realtimeService.subscribe('challenge:completed', handleChallengeCompleted);

    return () => {
      realtimeService.unsubscribe('challenge:participant_joined', handleParticipantJoined);
      realtimeService.unsubscribe('challenge:progress_update', handleProgressUpdate);
      realtimeService.unsubscribe('challenge:completed', handleChallengeCompleted);
    };
  }, [realtimeService, challengeId]);

  // Update leaderboard when participants change
  useEffect(() => {
    const participantsArray = Array.from(participants.values())
      .sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;
        return b.score - a.score;
      });
    
    setLeaderboard(participantsArray);
  }, [participants]);

  return {
    participants,
    leaderboard,
    updateProgress: realtimeService.updateChallengeProgress,
    completeChallenge: realtimeService.completeChallenge,
    isConnected: realtimeService.isConnected
  };
}

export default useRealtimeService;
