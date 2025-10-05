/**
 * Fallback Service
 * Provides graceful degradation when WebSocket connections fail
 * Implements polling-based updates and offline functionality
 */

import { toast } from 'react-hot-toast';

export interface FallbackConfig {
  pollingInterval: number;
  maxPollingAttempts: number;
  retryDelay: number;
  enableOfflineMode: boolean;
  cacheExpiry: number;
}

export interface CachedData {
  data: any;
  timestamp: number;
  expiry: number;
}

export class FallbackService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;
  private pollingAttempts = 0;
  private config: FallbackConfig;
  private cache: Map<string, CachedData> = new Map();
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: Partial<FallbackConfig> = {}) {
    this.config = {
      pollingInterval: 30000, // 30 seconds
      maxPollingAttempts: 10,
      retryDelay: 5000, // 5 seconds
      enableOfflineMode: true,
      cacheExpiry: 300000, // 5 minutes
      ...config
    };
  }

  /**
   * Start polling for updates when WebSocket is unavailable
   */
  public startPolling(endpoints: string[]) {
    if (this.isPolling) {
      console.log('🔄 Polling already active');
      return;
    }

    this.isPolling = true;
    this.pollingAttempts = 0;
    
    console.log('🔄 Starting fallback polling for endpoints:', endpoints);
    toast.info('Using fallback updates while reconnecting...', { duration: 3000 });

    this.pollingInterval = setInterval(async () => {
      await this.pollEndpoints(endpoints);
    }, this.config.pollingInterval);
  }

  /**
   * Stop polling
   */
  public stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.isPolling = false;
    this.pollingAttempts = 0;
    console.log('🔄 Stopped fallback polling');
  }

  /**
   * Poll multiple endpoints for updates
   */
  private async pollEndpoints(endpoints: string[]) {
    if (this.pollingAttempts >= this.config.maxPollingAttempts) {
      console.warn('⚠️ Max polling attempts reached, stopping fallback polling');
      this.stopPolling();
      toast.error('Fallback updates failed. Please refresh the page.');
      return;
    }

    this.pollingAttempts++;

    try {
      const promises = endpoints.map(endpoint => this.pollEndpoint(endpoint));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`🔄 Polling completed: ${successful} successful, ${failed} failed`);
      
      if (successful > 0) {
        this.pollingAttempts = 0; // Reset on successful poll
      }
      
    } catch (error) {
      console.error('❌ Polling error:', error);
    }
  }

  /**
   * Poll a single endpoint
   */
  private async pollEndpoint(endpoint: string) {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nutriquest-token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the data
      this.cacheData(endpoint, data);
      
      // Emit to listeners
      this.emitToListeners(endpoint, data);
      
      console.log(`✅ Polled ${endpoint}:`, data);
      
    } catch (error) {
      console.error(`❌ Failed to poll ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Cache data with expiry
   */
  private cacheData(key: string, data: any) {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + this.config.cacheExpiry
    });
  }

  /**
   * Get cached data if not expired
   */
  public getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Clear expired cache entries
   */
  public clearExpiredCache() {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now > cached.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Subscribe to fallback updates
   */
  public subscribe(endpoint: string, listener: (data: any) => void) {
    if (!this.eventListeners.has(endpoint)) {
      this.eventListeners.set(endpoint, new Set());
    }
    this.eventListeners.get(endpoint)!.add(listener);
  }

  /**
   * Unsubscribe from fallback updates
   */
  public unsubscribe(endpoint: string, listener: (data: any) => void) {
    const listeners = this.eventListeners.get(endpoint);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit data to listeners
   */
  private emitToListeners(endpoint: string, data: any) {
    const listeners = this.eventListeners.get(endpoint);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in fallback listener:', error);
        }
      });
    }
  }

  /**
   * Get offline data from cache
   */
  public getOfflineData(endpoint: string): any | null {
    if (!this.config.enableOfflineMode) return null;
    return this.getCachedData(endpoint);
  }

  /**
   * Check if we have recent cached data
   */
  public hasRecentData(endpoint: string, maxAge: number = 300000): boolean {
    const cached = this.cache.get(endpoint);
    if (!cached) return false;
    
    return (Date.now() - cached.timestamp) < maxAge;
  }

  /**
   * Get polling status
   */
  public getPollingStatus() {
    return {
      isPolling: this.isPolling,
      attempts: this.pollingAttempts,
      maxAttempts: this.config.maxPollingAttempts,
      cacheSize: this.cache.size
    };
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<FallbackConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear all cache
   */
  public clearCache() {
    this.cache.clear();
    console.log('🧹 Cleared fallback cache');
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;
    
    for (const cached of this.cache.values()) {
      if (now > cached.expiry) {
        expired++;
      } else {
        valid++;
      }
    }
    
    return {
      total: this.cache.size,
      valid,
      expired,
      hitRate: this.cache.size > 0 ? (valid / this.cache.size) * 100 : 0
    };
  }
}

// Create singleton instance
export const fallbackService = new FallbackService();
