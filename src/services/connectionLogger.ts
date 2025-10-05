/**
 * Connection Logger Service
 * Comprehensive error handling and logging for connection issues and recovery attempts
 */

export interface ConnectionLogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: 'connection' | 'reconnection' | 'fallback' | 'health' | 'message';
  message: string;
  data?: any;
  userId?: string;
  sessionId?: string;
}

export interface ConnectionMetrics {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  reconnectionAttempts: number;
  averageReconnectionTime: number;
  fallbackActivations: number;
  messageQueueOverflows: number;
  healthCheckFailures: number;
}

export class ConnectionLogger {
  private logs: ConnectionLogEntry[] = [];
  private maxLogEntries = 1000;
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    successfulConnections: 0,
    failedConnections: 0,
    reconnectionAttempts: 0,
    averageReconnectionTime: 0,
    fallbackActivations: 0,
    messageQueueOverflows: 0,
    healthCheckFailures: 0
  };
  private sessionId: string;
  private userId: string | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadPersistedData();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPersistedData() {
    try {
      // Load logs from localStorage
      const storedLogs = localStorage.getItem('nutriquest-connection-logs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }

      // Load metrics from localStorage
      const storedMetrics = localStorage.getItem('nutriquest-connection-metrics');
      if (storedMetrics) {
        this.metrics = { ...this.metrics, ...JSON.parse(storedMetrics) };
      }
    } catch (error) {
      console.error('Failed to load persisted connection data:', error);
    }
  }

  private persistData() {
    try {
      // Persist logs (keep only recent ones)
      const recentLogs = this.logs.slice(-500); // Keep last 500 entries
      localStorage.setItem('nutriquest-connection-logs', JSON.stringify(recentLogs));

      // Persist metrics
      localStorage.setItem('nutriquest-connection-metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Failed to persist connection data:', error);
    }
  }

  private addLogEntry(
    level: ConnectionLogEntry['level'],
    category: ConnectionLogEntry['category'],
    message: string,
    data?: any
  ) {
    const entry: ConnectionLogEntry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    this.logs.push(entry);

    // Keep only recent logs
    if (this.logs.length > this.maxLogEntries) {
      this.logs = this.logs.slice(-this.maxLogEntries);
    }

    // Console logging based on level
    const logMethod = level === 'error' ? 'error' : 
                     level === 'warn' ? 'warn' : 
                     level === 'debug' ? 'debug' : 'log';
    
    console[logMethod](`[${category.toUpperCase()}] ${message}`, data || '');

    // Persist data periodically
    if (this.logs.length % 10 === 0) {
      this.persistData();
    }
  }

  public setUserId(userId: string) {
    this.userId = userId;
  }

  // Connection logging methods
  public logConnectionAttempt(url: string, config?: any) {
    this.addLogEntry('info', 'connection', `Attempting connection to ${url}`, config);
    this.metrics.totalConnections++;
  }

  public logConnectionSuccess(url: string, connectionTime: number) {
    this.addLogEntry('info', 'connection', `Successfully connected to ${url} in ${connectionTime}ms`);
    this.metrics.successfulConnections++;
  }

  public logConnectionFailure(url: string, error: any, attemptNumber: number) {
    this.addLogEntry('error', 'connection', `Connection failed to ${url} (attempt ${attemptNumber})`, {
      error: error.message || error,
      attemptNumber
    });
    this.metrics.failedConnections++;
  }

  public logDisconnection(reason: string, duration: number) {
    this.addLogEntry('warn', 'connection', `Disconnected: ${reason} (duration: ${duration}ms)`, {
      reason,
      duration
    });
  }

  // Reconnection logging methods
  public logReconnectionAttempt(attemptNumber: number, delay: number, reason?: string) {
    this.addLogEntry('info', 'reconnection', `Reconnection attempt ${attemptNumber} in ${delay}ms`, {
      attemptNumber,
      delay,
      reason
    });
    this.metrics.reconnectionAttempts++;
  }

  public logReconnectionSuccess(attemptNumber: number, totalTime: number) {
    this.addLogEntry('info', 'reconnection', `Reconnection successful after ${attemptNumber} attempts in ${totalTime}ms`, {
      attemptNumber,
      totalTime
    });
    
    // Update average reconnection time
    const currentAvg = this.metrics.averageReconnectionTime;
    const totalAttempts = this.metrics.reconnectionAttempts;
    this.metrics.averageReconnectionTime = (currentAvg * (totalAttempts - 1) + totalTime) / totalAttempts;
  }

  public logReconnectionFailure(maxAttempts: number, totalTime: number) {
    this.addLogEntry('error', 'reconnection', `Reconnection failed after ${maxAttempts} attempts in ${totalTime}ms`, {
      maxAttempts,
      totalTime
    });
  }

  // Fallback logging methods
  public logFallbackActivation(endpoints: string[]) {
    this.addLogEntry('warn', 'fallback', `Fallback mode activated for ${endpoints.length} endpoints`, {
      endpoints
    });
    this.metrics.fallbackActivations++;
  }

  public logFallbackDeactivation() {
    this.addLogEntry('info', 'fallback', 'Fallback mode deactivated');
  }

  public logFallbackPoll(endpoint: string, success: boolean, responseTime?: number) {
    this.addLogEntry('debug', 'fallback', `Fallback poll ${success ? 'successful' : 'failed'} for ${endpoint}`, {
      endpoint,
      success,
      responseTime
    });
  }

  // Health monitoring logging methods
  public logHealthCheck(latency: number, quality: string) {
    this.addLogEntry('debug', 'health', `Health check: ${latency}ms (${quality})`, {
      latency,
      quality
    });
  }

  public logHealthCheckFailure(reason: string) {
    this.addLogEntry('warn', 'health', `Health check failed: ${reason}`, { reason });
    this.metrics.healthCheckFailures++;
  }

  public logConnectionQualityChange(oldQuality: string, newQuality: string, latency: number) {
    this.addLogEntry('info', 'health', `Connection quality changed: ${oldQuality} → ${newQuality}`, {
      oldQuality,
      newQuality,
      latency
    });
  }

  // Message queue logging methods
  public logMessageQueued(eventType: string, queueSize: number) {
    this.addLogEntry('info', 'message', `Message queued: ${eventType} (queue size: ${queueSize})`, {
      eventType,
      queueSize
    });
  }

  public logMessageDelivered(eventType: string, queueSize: number) {
    this.addLogEntry('debug', 'message', `Queued message delivered: ${eventType} (remaining: ${queueSize})`, {
      eventType,
      queueSize
    });
  }

  public logMessageQueueOverflow(maxSize: number) {
    this.addLogEntry('error', 'message', `Message queue overflow (max size: ${maxSize})`, {
      maxSize
    });
    this.metrics.messageQueueOverflows++;
  }

  public logMessageQueueCleared(count: number) {
    this.addLogEntry('info', 'message', `Message queue cleared (${count} messages)`, {
      count
    });
  }

  // General logging methods
  public logInfo(category: ConnectionLogEntry['category'], message: string, data?: any) {
    this.addLogEntry('info', category, message, data);
  }

  public logWarning(category: ConnectionLogEntry['category'], message: string, data?: any) {
    this.addLogEntry('warn', category, message, data);
  }

  public logError(category: ConnectionLogEntry['category'], message: string, data?: any) {
    this.addLogEntry('error', category, message, data);
  }

  public logDebug(category: ConnectionLogEntry['category'], message: string, data?: any) {
    this.addLogEntry('debug', category, message, data);
  }

  // Data retrieval methods
  public getLogs(filter?: {
    level?: ConnectionLogEntry['level'];
    category?: ConnectionLogEntry['category'];
    since?: number;
    limit?: number;
  }): ConnectionLogEntry[] {
    let filteredLogs = [...this.logs];

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }
      if (filter.since) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.since!);
      }
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(-filter.limit);
      }
    }

    return filteredLogs;
  }

  public getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }

  public getRecentErrors(limit: number = 10): ConnectionLogEntry[] {
    return this.getLogs({ level: 'error', limit });
  }

  public getConnectionHistory(limit: number = 50): ConnectionLogEntry[] {
    return this.getLogs({ category: 'connection', limit });
  }

  public getReconnectionHistory(limit: number = 20): ConnectionLogEntry[] {
    return this.getLogs({ category: 'reconnection', limit });
  }

  // Utility methods
  public clearLogs() {
    this.logs = [];
    this.persistData();
  }

  public resetMetrics() {
    this.metrics = {
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      reconnectionAttempts: 0,
      averageReconnectionTime: 0,
      fallbackActivations: 0,
      messageQueueOverflows: 0,
      healthCheckFailures: 0
    };
    this.persistData();
  }

  public exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: Date.now(),
      logs: this.logs,
      metrics: this.metrics
    }, null, 2);
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
export const connectionLogger = new ConnectionLogger();
