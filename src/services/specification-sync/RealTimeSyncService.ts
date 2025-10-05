import { WebSocketServer, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { SpecificationUpdate } from './SpecificationUpdater';

export interface WebSocketConnection {
  id: string;
  ws: WebSocket;
  userId: string;
  subscriptions: Set<string>;
  lastActivity: Date;
}

export interface UpdateCallback {
  (update: SpecificationUpdate): void;
}

export interface Subscription {
  id: string;
  userId: string;
  specId: string;
  callback: UpdateCallback;
  active: boolean;
  createdAt: Date;
}

export interface Conflict {
  id: string;
  type: 'content' | 'structure' | 'format';
  specPath: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolution: 'auto' | 'manual' | 'skip';
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Resolution {
  conflictId: string;
  resolution: 'accepted' | 'rejected' | 'modified';
  content: string;
  resolvedBy: string;
  resolvedAt: Date;
}

export class RealTimeSyncService extends EventEmitter {
  private wsServer: WebSocketServer;
  private connections: Map<string, WebSocketConnection> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private conflicts: Map<string, Conflict> = new Map();
  private isRunning = false;

  constructor(private options: SyncServiceOptions = {}) {
    super();
    this.options = {
      port: 8080,
      heartbeatInterval: 30000,
      maxConnections: 1000,
      ...options
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.wsServer = new WebSocketServer({ 
      port: this.options.port,
      maxPayload: 1024 * 1024 // 1MB max payload
    });

    this.setupWebSocketServer();
    this.startHeartbeat();
    this.isRunning = true;

    this.emit('started', { port: this.options.port });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Close all connections
    for (const connection of this.connections.values()) {
      connection.ws.close();
    }

    // Close WebSocket server
    this.wsServer.close();
    this.connections.clear();
    this.subscriptions.clear();
    this.isRunning = false;

    this.emit('stopped');
  }

  private setupWebSocketServer(): void {
    this.wsServer.on('connection', (ws, req) => {
      const connectionId = this.generateConnectionId();
      const userId = this.extractUserId(req);
      
      const connection: WebSocketConnection = {
        id: connectionId,
        ws,
        userId,
        subscriptions: new Set(),
        lastActivity: new Date()
      };

      this.connections.set(connectionId, connection);
      this.emit('connection', connection);

      // Handle messages
      ws.on('message', (data) => {
        this.handleMessage(connection, data);
      });

      // Handle disconnection
      ws.on('close', () => {
        this.handleDisconnection(connection);
      });

      // Handle errors
      ws.on('error', (error) => {
        this.emit('error', { connection, error });
      });

      // Send welcome message
      this.sendMessage(connection, {
        type: 'welcome',
        data: { connectionId, userId }
      });
    });
  }

  private handleMessage(connection: WebSocketConnection, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());
      connection.lastActivity = new Date();

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(connection, message.data);
          break;
        case 'unsubscribe':
          this.handleUnsubscribe(connection, message.data);
          break;
        case 'ping':
          this.handlePing(connection);
          break;
        case 'resolve_conflict':
          this.handleResolveConflict(connection, message.data);
          break;
        default:
          this.emit('unknown_message', { connection, message });
      }
    } catch (error) {
      this.emit('message_error', { connection, error });
    }
  }

  private handleSubscribe(connection: WebSocketConnection, data: any): void {
    const { specId } = data;
    
    if (!specId) {
      this.sendError(connection, 'Spec ID is required for subscription');
      return;
    }

    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      userId: connection.userId,
      specId,
      callback: (update) => this.sendUpdateToConnection(connection, update),
      active: true,
      createdAt: new Date()
    };

    this.subscriptions.set(subscription.id, subscription);
    connection.subscriptions.add(specId);

    this.sendMessage(connection, {
      type: 'subscribed',
      data: { subscriptionId: subscription.id, specId }
    });

    this.emit('subscription', { connection, subscription });
  }

  private handleUnsubscribe(connection: WebSocketConnection, data: any): void {
    const { specId } = data;
    
    if (!specId) {
      this.sendError(connection, 'Spec ID is required for unsubscription');
      return;
    }

    // Find and remove subscription
    for (const [subscriptionId, subscription] of this.subscriptions) {
      if (subscription.userId === connection.userId && subscription.specId === specId) {
        subscription.active = false;
        this.subscriptions.delete(subscriptionId);
        connection.subscriptions.delete(specId);
        
        this.sendMessage(connection, {
          type: 'unsubscribed',
          data: { subscriptionId, specId }
        });
        
        this.emit('unsubscription', { connection, subscription });
        break;
      }
    }
  }

  private handlePing(connection: WebSocketConnection): void {
    this.sendMessage(connection, {
      type: 'pong',
      data: { timestamp: new Date().toISOString() }
    });
  }

  private handleResolveConflict(connection: WebSocketConnection, data: any): void {
    const { conflictId, resolution, content } = data;
    
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      this.sendError(connection, 'Conflict not found');
      return;
    }

    const resolutionResult: Resolution = {
      conflictId,
      resolution,
      content,
      resolvedBy: connection.userId,
      resolvedAt: new Date()
    };

    conflict.resolvedAt = new Date();
    this.conflicts.delete(conflictId);

    this.emit('conflict_resolved', { connection, conflict, resolution: resolutionResult });
  }

  private handleDisconnection(connection: WebSocketConnection): void {
    // Remove all subscriptions for this connection
    for (const [subscriptionId, subscription] of this.subscriptions) {
      if (subscription.userId === connection.userId) {
        subscription.active = false;
        this.subscriptions.delete(subscriptionId);
      }
    }

    this.connections.delete(connection.id);
    this.emit('disconnection', connection);
  }

  async broadcastSpecificationUpdate(update: SpecificationUpdate): Promise<void> {
    const message = {
      type: 'specification_update',
      data: update,
      timestamp: new Date().toISOString()
    };

    // Find all subscriptions for this specification
    const relevantSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.active && sub.specId === update.specPath);

    // Send to all relevant connections
    for (const subscription of relevantSubscriptions) {
      const connection = this.findConnectionByUserId(subscription.userId);
      if (connection && connection.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(connection, message);
      }
    }

    this.emit('update_broadcast', { update, subscriptionCount: relevantSubscriptions.length });
  }

  async subscribeToSpecification(
    userId: string, 
    specId: string, 
    callback: UpdateCallback
  ): Promise<Subscription> {
    const subscription: Subscription = {
      id: this.generateSubscriptionId(),
      userId,
      specId,
      callback,
      active: true,
      createdAt: new Date()
    };

    this.subscriptions.set(subscription.id, subscription);
    this.emit('subscription_created', subscription);

    return subscription;
  }

  async createConflict(conflict: Omit<Conflict, 'id' | 'createdAt'>): Promise<Conflict> {
    const newConflict: Conflict = {
      ...conflict,
      id: this.generateConflictId(),
      createdAt: new Date()
    };

    this.conflicts.set(newConflict.id, newConflict);
    this.emit('conflict_created', newConflict);

    // Notify relevant users about the conflict
    await this.broadcastConflict(newConflict);

    return newConflict;
  }

  private async broadcastConflict(conflict: Conflict): Promise<void> {
    const message = {
      type: 'conflict_detected',
      data: conflict,
      timestamp: new Date().toISOString()
    };

    // Find connections that might be interested in this conflict
    const relevantConnections = Array.from(this.connections.values())
      .filter(conn => conn.subscriptions.has(conflict.specPath));

    for (const connection of relevantConnections) {
      if (connection.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(connection, message);
      }
    }
  }

  private sendMessage(connection: WebSocketConnection, message: any): void {
    if (connection.ws.readyState === WebSocket.OPEN) {
      connection.ws.send(JSON.stringify(message));
    }
  }

  private sendError(connection: WebSocketConnection, error: string): void {
    this.sendMessage(connection, {
      type: 'error',
      data: { error, timestamp: new Date().toISOString() }
    });
  }

  private sendUpdateToConnection(connection: WebSocketConnection, update: SpecificationUpdate): void {
    this.sendMessage(connection, {
      type: 'specification_update',
      data: update,
      timestamp: new Date().toISOString()
    });
  }

  private findConnectionByUserId(userId: string): WebSocketConnection | undefined {
    for (const connection of this.connections.values()) {
      if (connection.userId === userId) {
        return connection;
      }
    }
    return undefined;
  }

  private startHeartbeat(): void {
    setInterval(() => {
      const now = new Date();
      const timeout = this.options.heartbeatInterval * 2;

      for (const [connectionId, connection] of this.connections) {
        if (now.getTime() - connection.lastActivity.getTime() > timeout) {
          // Connection is stale, close it
          connection.ws.close();
          this.connections.delete(connectionId);
          this.emit('stale_connection', connection);
        } else {
          // Send ping to check if connection is alive
          this.sendMessage(connection, {
            type: 'ping',
            data: { timestamp: now.toISOString() }
          });
        }
      }
    }, this.options.heartbeatInterval);
  }

  private extractUserId(req: any): string {
    // Extract user ID from request headers or query parameters
    return req.headers['x-user-id'] || req.url?.split('userId=')[1] || 'anonymous';
  }

  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateConflictId(): string {
    return `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API methods
  getConnectionCount(): number {
    return this.connections.size;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getActiveConflicts(): Conflict[] {
    return Array.from(this.conflicts.values()).filter(conflict => !conflict.resolvedAt);
  }

  getConnectionStats(): any {
    return {
      totalConnections: this.connections.size,
      totalSubscriptions: this.subscriptions.size,
      activeConflicts: this.getActiveConflicts().length,
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }
}

export interface SyncServiceOptions {
  port?: number;
  heartbeatInterval?: number;
  maxConnections?: number;
}
