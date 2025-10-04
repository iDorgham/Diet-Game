// Advanced offline support following Level 404 requirements
// Service Worker integration with intelligent caching and sync

import React from 'react';
import { useNutriStore } from '../store/nutriStore';
import { ErrorTracker, PerformanceMonitor } from './monitoring';

interface OfflineAction {
  id: string;
  type: 'TASK_COMPLETE' | 'PROFILE_UPDATE' | 'PROGRESS_UPDATE';
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

class OfflineManager {
  private static instance: OfflineManager;
  private actionQueue: OfflineAction[] = [];
  private cache: Map<string, CacheEntry<any>> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;
  private readonly CACHE_VERSION = '1.0.0';
  private readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_QUEUE_SIZE = 100;

  private constructor() {
    this.initializeEventListeners();
    this.loadPersistedData();
    this.startPeriodicSync();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOffline();
    });

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingActions();
      }
    });
  }

  private loadPersistedData(): void {
    try {
      const persistedQueue = localStorage.getItem('nutriquest-offline-queue');
      if (persistedQueue) {
        this.actionQueue = JSON.parse(persistedQueue);
      }

      const persistedCache = localStorage.getItem('nutriquest-cache');
      if (persistedCache) {
        const cacheData = JSON.parse(persistedCache);
        this.cache = new Map(Object.entries(cacheData));
        this.cleanExpiredCache();
      }
    } catch (error) {
      console.error('Failed to load persisted offline data:', error);
      ErrorTracker.trackError(error as Error, { context: 'offline_data_load' });
    }
  }

  private persistData(): void {
    try {
      localStorage.setItem('nutriquest-offline-queue', JSON.stringify(this.actionQueue));
      localStorage.setItem('nutriquest-cache', JSON.stringify(Object.fromEntries(this.cache)));
    } catch (error) {
      console.error('Failed to persist offline data:', error);
      ErrorTracker.trackError(error as Error, { context: 'offline_data_persist' });
    }
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  private handleOnline(): void {
    console.log('🌐 Back online - syncing pending actions');
    ErrorTracker.trackUserAction('network_online');
    this.syncPendingActions();
  }

  private handleOffline(): void {
    console.log('📴 Gone offline - queuing actions');
    ErrorTracker.trackUserAction('network_offline');
  }

  // Queue management
  queueAction(type: OfflineAction['type'], payload: any): string {
    const action: OfflineAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
    };

    // Prevent queue overflow
    if (this.actionQueue.length >= this.MAX_QUEUE_SIZE) {
      const oldestAction = this.actionQueue.shift();
      console.warn('Queue overflow - removing oldest action:', oldestAction);
    }

    this.actionQueue.push(action);
    this.persistData();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncPendingActions();
    }

    return action.id;
  }

  private async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.actionQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    const actionsToSync = [...this.actionQueue];

    try {
      for (const action of actionsToSync) {
        await this.syncAction(action);
      }
    } catch (error) {
      console.error('Failed to sync pending actions:', error);
      ErrorTracker.trackError(error as Error, { context: 'offline_sync' });
    } finally {
      this.syncInProgress = false;
      this.persistData();
    }
  }

  private async syncAction(action: OfflineAction): Promise<void> {
    try {
      const duration = await PerformanceMonitor.measureAsync(
        `sync_${action.type}`,
        async () => {
          switch (action.type) {
            case 'TASK_COMPLETE':
              await this.syncTaskCompletion(action.payload);
              break;
            case 'PROFILE_UPDATE':
              await this.syncProfileUpdate(action.payload);
              break;
            case 'PROGRESS_UPDATE':
              await this.syncProgressUpdate(action.payload);
              break;
            default:
              throw new Error(`Unknown action type: ${action.type}`);
          }
        }
      );

      // Remove successfully synced action
      this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
      console.log(`✅ Synced action ${action.id} in ${duration.toFixed(2)}ms`);

    } catch (error) {
      action.retryCount++;
      console.error(`❌ Failed to sync action ${action.id}:`, error);

      if (action.retryCount >= action.maxRetries) {
        // Remove failed action after max retries
        this.actionQueue = this.actionQueue.filter(a => a.id !== action.id);
        ErrorTracker.trackError(error as Error, {
          context: 'offline_sync_failed',
          actionId: action.id,
          retryCount: action.retryCount,
        });
      }
    }
  }

  private async syncTaskCompletion(payload: any): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Synced task completion:', payload);
  }

  private async syncProfileUpdate(payload: any): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Synced profile update:', payload);
  }

  private async syncProgressUpdate(payload: any): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Synced progress update:', payload);
  }

  // Cache management
  setCache<T>(key: string, data: T, ttl: number = this.MAX_CACHE_AGE): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
      version: this.CACHE_VERSION,
    };
    this.cache.set(key, entry);
    this.persistData();
  }

  getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      this.persistData();
      return null;
    }

    return entry.data as T;
  }

  clearCache(): void {
    this.cache.clear();
    this.persistData();
  }

  // Status and monitoring
  getStatus() {
    return {
      isOnline: this.isOnline,
      queueSize: this.actionQueue.length,
      cacheSize: this.cache.size,
      syncInProgress: this.syncInProgress,
      oldestQueuedAction: this.actionQueue[0]?.timestamp || null,
    };
  }

  getQueueActions(): OfflineAction[] {
    return [...this.actionQueue];
  }

  clearQueue(): void {
    this.actionQueue = [];
    this.persistData();
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds when online
    setInterval(() => {
      if (this.isOnline && this.actionQueue.length > 0) {
        this.syncPendingActions();
      }
    }, 30000);
  }

  // Conflict resolution
  resolveConflict<T>(localData: T, serverData: T, strategy: 'local' | 'server' | 'merge'): T {
    switch (strategy) {
      case 'local':
        return localData;
      case 'server':
        return serverData;
      case 'merge':
        // Simple merge strategy - in production, implement proper conflict resolution
        return { ...serverData, ...localData };
      default:
        return serverData;
    }
  }
}

// Service Worker registration
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              console.log('New content available - please refresh');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      ErrorTracker.trackError(error as Error, { context: 'service_worker_registration' });
    }
  }
};

// Offline status hook
export const useOfflineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [offlineManager] = React.useState(() => OfflineManager.getInstance());

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    offlineManager,
    status: offlineManager.getStatus(),
  };
};

// Export singleton instance
export const offlineManager = OfflineManager.getInstance();
export default offlineManager;
