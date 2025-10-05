/**
 * Real-time Service
 * WebSocket integration for live recommendations and insights updates
 */

import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import { fallbackService, FallbackService } from './fallbackService';
import { connectionLogger, ConnectionLogger } from './connectionLogger';

// Real-time event types
export interface RealtimeEvent {
  type: string;
  data: any;
  timestamp: string;
  userId?: string;
}

export interface RecommendationUpdateEvent extends RealtimeEvent {
  type: 'recommendation:new' | 'recommendation:updated' | 'recommendation:removed';
  data: {
    recommendationId: string;
    recommendationType: 'friend' | 'team' | 'content' | 'mentorship';
    recommendation: any;
    reason?: string;
  };
}

export interface InsightUpdateEvent extends RealtimeEvent {
  type: 'insight:updated' | 'insight:new';
  data: {
    insightType: 'engagement' | 'growth' | 'content' | 'network';
    insights: any;
    changes?: any;
  };
}

export interface NotificationEvent extends RealtimeEvent {
  type: 'notification:new';
  data: {
    notificationId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    actionUrl?: string;
  };
}

export type AllRealtimeEvents = RecommendationUpdateEvent | InsightUpdateEvent | NotificationEvent;

// Connection state enum
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
  OFFLINE = 'offline'
}

// Message queue item interface
interface QueuedMessage {
  id: string;
  eventType: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Connection health metrics
interface ConnectionHealth {
  lastPing: number;
  latency: number;
  packetLoss: number;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'critical';
}

// Real-time service class
export class RealtimeService {
  private socket: Socket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseReconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private eventListeners: Map<string, Set<(event: AllRealtimeEvents) => void>> = new Map();
  private userId: string | null = null;
  private messageQueue: QueuedMessage[] = [];
  private connectionHealth: ConnectionHealth = {
    lastPing: 0,
    latency: 0,
    packetLoss: 0,
    connectionQuality: 'excellent'
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isOnline = true;
  private lastSuccessfulConnection = 0;
  private connectionStartTime = 0;
  private fallbackService: FallbackService;
  private fallbackEndpoints: string[] = [];
  private fallbackEnabled = true;
  private logger: ConnectionLogger;

  constructor() {
    this.fallbackService = fallbackService;
    this.logger = connectionLogger;
    this.initializeService();
    this.setupNetworkMonitoring();
    this.loadQueuedMessages();
    this.setupFallbackEndpoints();
  }

  private initializeService() {
    // Get WebSocket URL from environment
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    this.logger.logConnectionAttempt(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: false
    });
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: false, // We'll handle reconnection manually for better control
      reconnectionAttempts: 0,
      reconnectionDelay: 0,
      forceNew: true,
      upgrade: true,
      rememberUpgrade: true,
    });

    this.setupEventHandlers();
  }

  private setupNetworkMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network connection restored');
      if (this.connectionState === ConnectionState.OFFLINE) {
        this.attemptReconnection();
      }
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🌐 Network connection lost');
      this.setConnectionState(ConnectionState.OFFLINE);
      this.stopHeartbeat();
    });

    // Monitor page visibility for connection management
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseConnection();
      } else {
        this.resumeConnection();
      }
    });
  }

  private loadQueuedMessages() {
    try {
      const stored = localStorage.getItem('nutriquest-message-queue');
      if (stored) {
        this.messageQueue = JSON.parse(stored);
        console.log(`📦 Loaded ${this.messageQueue.length} queued messages`);
      }
    } catch (error) {
      console.error('Failed to load queued messages:', error);
      this.messageQueue = [];
    }
  }

  private saveQueuedMessages() {
    try {
      localStorage.setItem('nutriquest-message-queue', JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Failed to save queued messages:', error);
    }
  }

  private setupFallbackEndpoints() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    this.fallbackEndpoints = [
      `${baseUrl}/recommendations`,
      `${baseUrl}/insights`,
      `${baseUrl}/notifications`,
      `${baseUrl}/social/activity`
    ];
  }

  private startFallbackMode() {
    if (!this.fallbackEnabled) return;
    
    console.log('🔄 Starting fallback mode');
    this.logger.logFallbackActivation(this.fallbackEndpoints);
    this.fallbackService.startPolling(this.fallbackEndpoints);
    
    // Subscribe to fallback updates
    this.fallbackEndpoints.forEach(endpoint => {
      this.fallbackService.subscribe(endpoint, (data) => {
        this.handleFallbackUpdate(endpoint, data);
      });
    });
  }

  private stopFallbackMode() {
    console.log('🔄 Stopping fallback mode');
    this.logger.logFallbackDeactivation();
    this.fallbackService.stopPolling();
  }

  private handleFallbackUpdate(endpoint: string, data: any) {
    // Convert fallback data to real-time events
    if (endpoint.includes('recommendations')) {
      this.emitToListeners('recommendation', {
        type: 'recommendation:fallback_update',
        data,
        timestamp: new Date().toISOString()
      });
    } else if (endpoint.includes('insights')) {
      this.emitToListeners('insight', {
        type: 'insight:fallback_update',
        data,
        timestamp: new Date().toISOString()
      });
    } else if (endpoint.includes('notifications')) {
      this.emitToListeners('notification', {
        type: 'notification:fallback_update',
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('🔌 Connected to real-time service');
      const connectionTime = Date.now() - this.connectionStartTime;
      
      this.setConnectionState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
      this.lastSuccessfulConnection = Date.now();
      this.connectionStartTime = Date.now();
      
      // Log successful connection
      this.logger.logConnectionSuccess(this.socket.io.uri, connectionTime);
      
      // Stop fallback mode when connected
      this.stopFallbackMode();
      
      // Start heartbeat monitoring
      this.startHeartbeat();
      
      // Authenticate with user token
      this.authenticate();
      
      // Process queued messages
      this.processQueuedMessages();
      
      // Notify listeners of successful connection
      this.emitToListeners('connection', {
        type: 'connection:established',
        data: { timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from real-time service:', reason);
      const duration = this.connectionStartTime > 0 ? Date.now() - this.connectionStartTime : 0;
      
      this.setConnectionState(ConnectionState.DISCONNECTED);
      this.stopHeartbeat();
      
      // Log disconnection
      this.logger.logDisconnection(reason, duration);
      
      // Start fallback mode if enabled
      if (this.fallbackEnabled && this.isOnline) {
        this.startFallbackMode();
      }
      
      // Determine if we should attempt reconnection
      if (this.isOnline && this.shouldAttemptReconnection(reason)) {
        this.attemptReconnection();
      }
      
      // Notify listeners of disconnection
      this.emitToListeners('connection', {
        type: 'connection:lost',
        data: { reason, timestamp: new Date().toISOString() },
        timestamp: new Date().toISOString()
      });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error);
      this.setConnectionState(ConnectionState.FAILED);
      this.stopHeartbeat();
      
      if (this.isOnline) {
        this.attemptReconnection();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
      this.setConnectionState(ConnectionState.CONNECTED);
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
      this.setConnectionState(ConnectionState.RECONNECTING);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🔄 Reconnection error:', error);
      this.setConnectionState(ConnectionState.FAILED);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🔄 Reconnection failed after all attempts');
      this.setConnectionState(ConnectionState.FAILED);
      toast.error('Unable to reconnect to real-time updates. Please refresh the page.');
    });

    // Authentication events
    this.socket.on('authenticated', (data) => {
      console.log('✅ Real-time service authenticated:', data);
      this.userId = data.userId;
    });

    this.socket.on('authentication_error', (error) => {
      console.error('❌ Authentication error:', error);
      toast.error('Failed to authenticate real-time updates');
    });

    // Recommendation events
    this.socket.on('recommendation:new', (event: RecommendationUpdateEvent) => {
      this.handleRecommendationUpdate(event);
    });

    this.socket.on('recommendation:updated', (event: RecommendationUpdateEvent) => {
      this.handleRecommendationUpdate(event);
    });

    this.socket.on('recommendation:removed', (event: RecommendationUpdateEvent) => {
      this.handleRecommendationUpdate(event);
    });

    // Insight events
    this.socket.on('insight:updated', (event: InsightUpdateEvent) => {
      this.handleInsightUpdate(event);
    });

    this.socket.on('insight:new', (event: InsightUpdateEvent) => {
      this.handleInsightUpdate(event);
    });

    // Notification events
    this.socket.on('notification:new', (event: NotificationEvent) => {
      this.handleNotification(event);
    });

    // Health check events
    this.socket.on('ping', () => {
      this.socket?.emit('pong');
    });

    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });
  }

  private authenticate() {
    if (!this.socket || !this.isConnected) return;

    const token = localStorage.getItem('nutriquest-token');
    if (token) {
      this.socket.emit('authenticate', { token });
    }
  }

  private setConnectionState(state: ConnectionState) {
    if (this.connectionState !== state) {
      const previousState = this.connectionState;
      this.connectionState = state;
      
      console.log(`🔄 Connection state changed: ${previousState} → ${state}`);
      
      // Emit state change event
      this.emitToListeners('connection', {
        type: 'connection:state_changed',
        data: { 
          previousState, 
          currentState: state, 
          timestamp: new Date().toISOString() 
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  private shouldAttemptReconnection(reason: string): boolean {
    // Don't reconnect for certain reasons
    const noReconnectReasons = ['io server disconnect', 'io client disconnect'];
    return !noReconnectReasons.includes(reason) && this.isOnline;
  }

  private attemptReconnection() {
    if (!this.isOnline || this.connectionState === ConnectionState.CONNECTED) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      this.setConnectionState(ConnectionState.FAILED);
      this.logger.logReconnectionFailure(this.maxReconnectAttempts, Date.now() - this.lastSuccessfulConnection);
      toast.error('Unable to connect to real-time updates. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    this.setConnectionState(ConnectionState.RECONNECTING);
    
    // Calculate delay with exponential backoff and jitter
    const baseDelay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    const jitter = Math.random() * 0.1 * baseDelay; // 10% jitter
    const delay = baseDelay + jitter;
    
    console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    // Log reconnection attempt
    this.logger.logReconnectionAttempt(this.reconnectAttempts, delay);
    
    // Show user notification for reconnection attempts
    if (this.reconnectAttempts === 1) {
      toast.loading('Reconnecting to real-time updates...', { id: 'reconnecting' });
    }
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.socket && this.connectionState === ConnectionState.RECONNECTING) {
        this.socket.connect();
      }
    }, delay);
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
        const startTime = Date.now();
        this.socket.emit('ping', { timestamp: startTime });
        
        // Set up pong handler for this ping
        const pongHandler = (data: any) => {
          const latency = Date.now() - startTime;
          this.updateConnectionHealth(latency);
          this.socket?.off('pong', pongHandler);
        };
        
        this.socket.on('pong', pongHandler);
        
        // Timeout for pong response
        setTimeout(() => {
          this.socket?.off('pong', pongHandler);
          if (this.connectionState === ConnectionState.CONNECTED) {
            console.warn('⚠️ Heartbeat timeout - connection may be unstable');
            this.updateConnectionHealth(-1); // Indicate timeout
          }
        }, 5000);
      }
    }, 30000); // Heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private updateConnectionHealth(latency: number) {
    const now = Date.now();
    const oldQuality = this.connectionHealth.connectionQuality;
    this.connectionHealth.lastPing = now;
    
    if (latency > 0) {
      // Update latency with exponential moving average
      this.connectionHealth.latency = this.connectionHealth.latency === 0 
        ? latency 
        : (this.connectionHealth.latency * 0.8) + (latency * 0.2);
      
      // Determine connection quality based on latency
      if (latency < 100) {
        this.connectionHealth.connectionQuality = 'excellent';
      } else if (latency < 300) {
        this.connectionHealth.connectionQuality = 'good';
      } else if (latency < 1000) {
        this.connectionHealth.connectionQuality = 'poor';
      } else {
        this.connectionHealth.connectionQuality = 'critical';
      }
      
      // Log health check
      this.logger.logHealthCheck(latency, this.connectionHealth.connectionQuality);
      
      // Log quality change if significant
      if (oldQuality !== this.connectionHealth.connectionQuality) {
        this.logger.logConnectionQualityChange(oldQuality, this.connectionHealth.connectionQuality, latency);
      }
    } else {
      // Timeout occurred
      this.connectionHealth.packetLoss += 1;
      if (this.connectionHealth.packetLoss > 3) {
        this.connectionHealth.connectionQuality = 'critical';
        console.warn('⚠️ High packet loss detected - connection unstable');
        this.logger.logHealthCheckFailure('High packet loss detected');
      }
    }
    
    // Emit health update
    this.emitToListeners('connection', {
      type: 'connection:health_update',
      data: { 
        health: { ...this.connectionHealth },
        timestamp: new Date().toISOString() 
      },
      timestamp: new Date().toISOString()
    });
  }

  private pauseConnection() {
    if (this.connectionState === ConnectionState.CONNECTED) {
      console.log('⏸️ Pausing connection due to page visibility');
      this.stopHeartbeat();
    }
  }

  private resumeConnection() {
    if (this.connectionState === ConnectionState.CONNECTED) {
      console.log('▶️ Resuming connection due to page visibility');
      this.startHeartbeat();
    } else if (this.isOnline && this.connectionState === ConnectionState.DISCONNECTED) {
      this.attemptReconnection();
    }
  }

  private handleRecommendationUpdate(event: RecommendationUpdateEvent) {
    console.log('📊 Recommendation update:', event);
    
    // Emit to registered listeners
    this.emitToListeners('recommendation', event);
    
    // Show toast notification for new recommendations
    if (event.type === 'recommendation:new') {
      const { recommendationType, reason } = event.data;
      toast.success(`New ${recommendationType} recommendation! ${reason || ''}`, {
        duration: 4000,
        position: 'top-right',
      });
    }
  }

  private handleInsightUpdate(event: InsightUpdateEvent) {
    console.log('📈 Insight update:', event);
    
    // Emit to registered listeners
    this.emitToListeners('insight', event);
    
    // Show toast for significant insight changes
    if (event.data.changes && event.data.changes.significant) {
      toast.info(`Your ${event.data.insightType} insights have been updated`, {
        duration: 3000,
        position: 'top-right',
      });
    }
  }

  private handleNotification(event: NotificationEvent) {
    console.log('🔔 Notification:', event);
    
    // Emit to registered listeners
    this.emitToListeners('notification', event);
    
    // Show toast notification
    const { title, message, type } = event.data;
    const toastOptions = {
      duration: 5000,
      position: 'top-right' as const,
    };

    switch (type) {
      case 'success':
        toast.success(`${title}: ${message}`, toastOptions);
        break;
      case 'warning':
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      case 'error':
        toast.error(`${title}: ${message}`, toastOptions);
        break;
      default:
        toast(`${title}: ${message}`, toastOptions);
    }
  }

  private emitToListeners(eventType: string, event: AllRealtimeEvents) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  private queueMessage(eventType: string, data: any, maxRetries: number = 3) {
    const message: QueuedMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.messageQueue.push(message);
    this.saveQueuedMessages();
    
    console.log(`📦 Queued message: ${eventType} (${this.messageQueue.length} total queued)`);
    this.logger.logMessageQueued(eventType, this.messageQueue.length);
  }

  private processQueuedMessages() {
    if (this.messageQueue.length === 0) return;

    console.log(`📦 Processing ${this.messageQueue.length} queued messages`);
    
    const messagesToProcess = [...this.messageQueue];
    this.messageQueue = [];

    messagesToProcess.forEach(message => {
      try {
        if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
          this.socket.emit(message.eventType, message.data);
          console.log(`📤 Delivered queued message: ${message.eventType}`);
        } else {
          // Re-queue if still not connected
          message.retryCount++;
          if (message.retryCount < message.maxRetries) {
            this.messageQueue.push(message);
          } else {
            console.warn(`⚠️ Dropped queued message after ${message.maxRetries} retries: ${message.eventType}`);
          }
        }
      } catch (error) {
        console.error(`❌ Failed to process queued message ${message.eventType}:`, error);
        message.retryCount++;
        if (message.retryCount < message.maxRetries) {
          this.messageQueue.push(message);
        }
      }
    });

    this.saveQueuedMessages();
  }

  private clearQueuedMessages() {
    this.messageQueue = [];
    this.saveQueuedMessages();
    console.log('🧹 Cleared all queued messages');
  }

  // Public methods
  public connect(userId?: string) {
    if (userId) {
      this.userId = userId;
    }
    
    if (this.socket && this.connectionState !== ConnectionState.CONNECTED) {
      this.setConnectionState(ConnectionState.CONNECTING);
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.setConnectionState(ConnectionState.DISCONNECTED);
      this.stopHeartbeat();
      this.clearReconnectTimeout();
    }
  }

  public forceReconnect() {
    console.log('🔄 Force reconnecting...');
    this.reconnectAttempts = 0;
    this.disconnect();
    
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public subscribe(eventType: string, listener: (event: AllRealtimeEvents) => void) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  public unsubscribe(eventType: string, listener: (event: AllRealtimeEvents) => void) {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  public joinRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_room', roomName);
    }
  }

  public leaveRoom(roomName: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_room', roomName);
    }
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      userId: this.userId,
    };
  }

  public sendEvent(eventType: string, data: any, queueIfOffline: boolean = true) {
    if (this.socket && this.connectionState === ConnectionState.CONNECTED) {
      this.socket.emit(eventType, data);
    } else if (queueIfOffline) {
      this.queueMessage(eventType, data);
    } else {
      console.warn(`⚠️ Cannot send event ${eventType} - not connected and queuing disabled`);
    }
  }

  public getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  public getConnectionHealth(): ConnectionHealth {
    return { ...this.connectionHealth };
  }

  public getQueuedMessageCount(): number {
    return this.messageQueue.length;
  }

  public isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }

  public getConnectionStats() {
    return {
      state: this.connectionState,
      health: this.connectionHealth,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
      queuedMessages: this.messageQueue.length,
      isOnline: this.isOnline,
      lastSuccessfulConnection: this.lastSuccessfulConnection,
      connectionUptime: this.connectionStartTime > 0 ? Date.now() - this.connectionStartTime : 0,
      fallback: {
        enabled: this.fallbackEnabled,
        status: this.fallbackService.getPollingStatus(),
        cache: this.fallbackService.getCacheStats()
      }
    };
  }

  public clearQueuedMessages() {
    this.clearQueuedMessages();
  }

  public enableFallback(enabled: boolean = true) {
    this.fallbackEnabled = enabled;
    if (!enabled) {
      this.stopFallbackMode();
    }
  }

  public getFallbackData(endpoint: string) {
    return this.fallbackService.getOfflineData(endpoint);
  }

  public hasRecentFallbackData(endpoint: string, maxAge?: number) {
    return this.fallbackService.hasRecentData(endpoint, maxAge);
  }

  public clearFallbackCache() {
    this.fallbackService.clearCache();
  }

  public getLogger() {
    return this.logger;
  }

  public getConnectionLogs(filter?: any) {
    return this.logger.getLogs(filter);
  }

  public getConnectionMetrics() {
    return this.logger.getMetrics();
  }

  public exportConnectionLogs() {
    return this.logger.exportLogs();
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// React hook for real-time updates
export function useRealtimeUpdates() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  const [connectionHealth, setConnectionHealth] = useState<ConnectionHealth>({
    lastPing: 0,
    latency: 0,
    packetLoss: 0,
    connectionQuality: 'excellent'
  });
  const [connectionStats, setConnectionStats] = useState(realtimeService.getConnectionStats());

  useEffect(() => {
    // Update connection status
    const updateStatus = () => {
      const stats = realtimeService.getConnectionStats();
      setConnectionStats(stats);
      setConnectionState(stats.state);
      setConnectionHealth(stats.health);
    };

    // Handle connection events
    const handleConnectionEvent = (event: AllRealtimeEvents) => {
      if (event.type.startsWith('connection:')) {
        updateStatus();
      }
    };

    // Initial status
    updateStatus();

    // Subscribe to connection events
    realtimeService.subscribe('connection', handleConnectionEvent);

    // Set up periodic status updates
    const statusInterval = setInterval(updateStatus, 5000);

    return () => {
      clearInterval(statusInterval);
      realtimeService.unsubscribe('connection', handleConnectionEvent);
    };
  }, []);

  return {
    connectionState,
    connectionHealth,
    connectionStats,
    isConnected: connectionState === ConnectionState.CONNECTED,
    isReconnecting: connectionState === ConnectionState.RECONNECTING,
    isFailed: connectionState === ConnectionState.FAILED,
    isOffline: connectionState === ConnectionState.OFFLINE,
    realtimeService,
  };
}

// React hook for recommendation updates
export function useRecommendationUpdates() {
  const [updates, setUpdates] = useState<RecommendationUpdateEvent[]>([]);

  useEffect(() => {
    const handleUpdate = (event: AllRealtimeEvents) => {
      if (event.type.startsWith('recommendation:')) {
        setUpdates(prev => [event as RecommendationUpdateEvent, ...prev.slice(0, 9)]); // Keep last 10 updates
      }
    };

    realtimeService.subscribe('recommendation', handleUpdate);

    return () => {
      realtimeService.unsubscribe('recommendation', handleUpdate);
    };
  }, []);

  return updates;
}

// React hook for insight updates
export function useInsightUpdates() {
  const [updates, setUpdates] = useState<InsightUpdateEvent[]>([]);

  useEffect(() => {
    const handleUpdate = (event: AllRealtimeEvents) => {
      if (event.type.startsWith('insight:')) {
        setUpdates(prev => [event as InsightUpdateEvent, ...prev.slice(0, 9)]); // Keep last 10 updates
      }
    };

    realtimeService.subscribe('insight', handleUpdate);

    return () => {
      realtimeService.unsubscribe('insight', handleUpdate);
    };
  }, []);

  return updates;
}

// React hook for notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationEvent[]>([]);

  useEffect(() => {
    const handleNotification = (event: AllRealtimeEvents) => {
      if (event.type === 'notification:new') {
        setNotifications(prev => [event as NotificationEvent, ...prev.slice(0, 19)]); // Keep last 20 notifications
      }
    };

    realtimeService.subscribe('notification', handleNotification);

    return () => {
      realtimeService.unsubscribe('notification', handleNotification);
    };
  }, []);

  return notifications;
}
