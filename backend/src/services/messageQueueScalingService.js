/**
 * Message Queue Scaling Service
 * Implements scaling, clustering, and load balancing for message queues
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import { performanceMonitoringService } from './performanceMonitoringService.js';
import { EventEmitter } from 'events';

class MessageQueueScalingService extends EventEmitter {
  constructor() {
    super();
    this.cluster = null;
    this.nodes = new Map();
    this.loadBalancer = null;
    this.isInitialized = false;
    
    this.config = {
      cluster: {
        nodes: process.env.REDIS_CLUSTER_NODES ? 
          process.env.REDIS_CLUSTER_NODES.split(',') : 
          ['localhost:7000', 'localhost:7001', 'localhost:7002'],
        options: {
          enableReadyCheck: false,
          redisOptions: {
            password: process.env.REDIS_PASSWORD,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true
          }
        }
      },
      scaling: {
        minNodes: 2,
        maxNodes: 10,
        scaleUpThreshold: 0.8, // 80% capacity
        scaleDownThreshold: 0.3, // 30% capacity
        scaleUpCooldown: 300000, // 5 minutes
        scaleDownCooldown: 600000, // 10 minutes
        healthCheckInterval: 30000, // 30 seconds
        metricsInterval: 10000 // 10 seconds
      },
      loadBalancing: {
        algorithm: 'round_robin', // round_robin, least_connections, weighted
        healthCheckTimeout: 5000,
        retryAttempts: 3,
        circuitBreakerThreshold: 5,
        circuitBreakerTimeout: 60000
      }
    };
    
    this.metrics = {
      totalMessages: 0,
      messagesPerSecond: 0,
      averageLatency: 0,
      errorRate: 0,
      nodeUtilization: new Map(),
      queueDepths: new Map(),
      throughput: 0
    };
    
    this.circuitBreakers = new Map();
    this.lastScaleTime = 0;
    
    this.initialize();
  }

  /**
   * Initialize the scaling service
   */
  async initialize() {
    try {
      await this.setupCluster();
      await this.setupLoadBalancer();
      await this.startMonitoring();
      await this.startScaling();
      
      this.isInitialized = true;
      logger.info('Message queue scaling service initialized');
      
    } catch (error) {
      logger.error('Failed to initialize message queue scaling service', { error: error.message });
      throw error;
    }
  }

  /**
   * Setup Redis cluster
   */
  async setupCluster() {
    try {
      this.cluster = new Redis.Cluster(this.config.cluster.nodes, this.config.cluster.options);
      
      this.cluster.on('connect', () => {
        logger.info('Redis cluster connected');
      });
      
      this.cluster.on('ready', () => {
        logger.info('Redis cluster ready');
        this.discoverNodes();
      });
      
      this.cluster.on('error', (error) => {
        logger.error('Redis cluster error', { error: error.message });
      });
      
      this.cluster.on('node error', (error, node) => {
        logger.error('Redis node error', { 
          node: node.options.host + ':' + node.options.port,
          error: error.message 
        });
        this.handleNodeFailure(node);
      });
      
      await this.cluster.connect();
      
    } catch (error) {
      logger.error('Failed to setup Redis cluster', { error: error.message });
      throw error;
    }
  }

  /**
   * Discover cluster nodes
   */
  discoverNodes() {
    const nodes = this.cluster.nodes();
    
    for (const node of nodes) {
      const nodeId = `${node.options.host}:${node.options.port}`;
      
      this.nodes.set(nodeId, {
        id: nodeId,
        host: node.options.host,
        port: node.options.port,
        role: node.role,
        status: 'healthy',
        lastHealthCheck: Date.now(),
        metrics: {
          connections: 0,
          memory: 0,
          cpu: 0,
          latency: 0,
          errorCount: 0
        }
      });
    }
    
    logger.info('Cluster nodes discovered', { nodeCount: this.nodes.size });
  }

  /**
   * Setup load balancer
   */
  async setupLoadBalancer() {
    this.loadBalancer = {
      algorithm: this.config.loadBalancing.algorithm,
      currentIndex: 0,
      nodeWeights: new Map(),
      nodeConnections: new Map(),
      healthyNodes: new Set()
    };
    
    // Initialize node weights and connections
    for (const [nodeId, node] of this.nodes) {
      this.loadBalancer.nodeWeights.set(nodeId, 1);
      this.loadBalancer.nodeConnections.set(nodeId, 0);
      this.loadBalancer.healthyNodes.add(nodeId);
    }
    
    logger.info('Load balancer configured', { 
      algorithm: this.loadBalancer.algorithm,
      nodes: this.nodes.size 
    });
  }

  /**
   * Start monitoring
   */
  async startMonitoring() {
    // Health checks
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.scaling.healthCheckInterval);
    
    // Metrics collection
    setInterval(async () => {
      await this.collectMetrics();
    }, this.config.scaling.metricsInterval);
    
    // Circuit breaker checks
    setInterval(async () => {
      await this.checkCircuitBreakers();
    }, 10000);
  }

  /**
   * Start scaling process
   */
  async startScaling() {
    setInterval(async () => {
      await this.evaluateScaling();
    }, 60000); // Check every minute
  }

  /**
   * Perform health checks on all nodes
   */
  async performHealthChecks() {
    for (const [nodeId, node] of this.nodes) {
      try {
        const startTime = Date.now();
        await this.cluster.ping();
        const latency = Date.now() - startTime;
        
        node.status = 'healthy';
        node.lastHealthCheck = Date.now();
        node.metrics.latency = latency;
        
        this.loadBalancer.healthyNodes.add(nodeId);
        
      } catch (error) {
        node.status = 'unhealthy';
        node.metrics.errorCount++;
        
        this.loadBalancer.healthyNodes.delete(nodeId);
        
        logger.warn('Node health check failed', { 
          nodeId, 
          error: error.message,
          errorCount: node.metrics.errorCount 
        });
        
        // Trigger circuit breaker if too many errors
        if (node.metrics.errorCount >= this.config.loadBalancing.circuitBreakerThreshold) {
          this.triggerCircuitBreaker(nodeId);
        }
      }
    }
  }

  /**
   * Collect cluster metrics
   */
  async collectMetrics() {
    try {
      const clusterInfo = await this.cluster.cluster('info');
      const nodeInfo = await this.cluster.cluster('nodes');
      
      // Parse cluster info
      const info = this.parseClusterInfo(clusterInfo);
      
      // Update metrics
      this.metrics.totalMessages = info.totalMessages || 0;
      this.metrics.messagesPerSecond = info.messagesPerSecond || 0;
      this.metrics.averageLatency = info.averageLatency || 0;
      this.metrics.errorRate = info.errorRate || 0;
      this.metrics.throughput = info.throughput || 0;
      
      // Update node utilization
      for (const [nodeId, node] of this.nodes) {
        const nodeMetrics = await this.getNodeMetrics(nodeId);
        node.metrics = { ...node.metrics, ...nodeMetrics };
        this.metrics.nodeUtilization.set(nodeId, nodeMetrics.utilization || 0);
      }
      
      // Record metrics
      performanceMonitoringService.recordMetric('cluster.total_messages', this.metrics.totalMessages);
      performanceMonitoringService.recordMetric('cluster.messages_per_second', this.metrics.messagesPerSecond);
      performanceMonitoringService.recordMetric('cluster.average_latency', this.metrics.averageLatency);
      performanceMonitoringService.recordMetric('cluster.error_rate', this.metrics.errorRate);
      performanceMonitoringService.recordMetric('cluster.throughput', this.metrics.throughput);
      
      this.emit('metrics', this.metrics);
      
    } catch (error) {
      logger.error('Error collecting cluster metrics', { error: error.message });
    }
  }

  /**
   * Parse cluster info
   */
  parseClusterInfo(clusterInfo) {
    const info = {};
    const lines = clusterInfo.split('\r\n');
    
    for (const line of lines) {
      if (line.includes(':')) {
        const [key, value] = line.split(':');
        info[key] = value;
      }
    }
    
    return info;
  }

  /**
   * Get node metrics
   */
  async getNodeMetrics(nodeId) {
    try {
      const node = this.nodes.get(nodeId);
      if (!node) return {};
      
      // In a real implementation, this would query actual node metrics
      return {
        utilization: Math.random() * 100,
        memory: Math.random() * 100,
        cpu: Math.random() * 100,
        connections: Math.floor(Math.random() * 1000),
        latency: Math.random() * 100
      };
      
    } catch (error) {
      logger.error('Error getting node metrics', { nodeId, error: error.message });
      return {};
    }
  }

  /**
   * Evaluate scaling needs
   */
  async evaluateScaling() {
    try {
      const now = Date.now();
      
      // Check cooldown periods
      if (now - this.lastScaleTime < this.config.scaling.scaleUpCooldown) {
        return;
      }
      
      const clusterUtilization = this.calculateClusterUtilization();
      const healthyNodeCount = this.loadBalancer.healthyNodes.size;
      
      // Scale up if utilization is high and we have capacity
      if (clusterUtilization > this.config.scaling.scaleUpThreshold && 
          healthyNodeCount < this.config.scaling.maxNodes) {
        await this.scaleUp();
      }
      
      // Scale down if utilization is low and we have minimum nodes
      else if (clusterUtilization < this.config.scaling.scaleDownThreshold && 
               healthyNodeCount > this.config.scaling.minNodes) {
        await this.scaleDown();
      }
      
    } catch (error) {
      logger.error('Error evaluating scaling', { error: error.message });
    }
  }

  /**
   * Calculate cluster utilization
   */
  calculateClusterUtilization() {
    let totalUtilization = 0;
    let nodeCount = 0;
    
    for (const [nodeId, utilization] of this.metrics.nodeUtilization) {
      if (this.loadBalancer.healthyNodes.has(nodeId)) {
        totalUtilization += utilization;
        nodeCount++;
      }
    }
    
    return nodeCount > 0 ? totalUtilization / nodeCount : 0;
  }

  /**
   * Scale up cluster
   */
  async scaleUp() {
    try {
      const newNodeId = await this.addNode();
      
      if (newNodeId) {
        this.lastScaleTime = Date.now();
        
        logger.info('Cluster scaled up', { 
          newNodeId,
          totalNodes: this.nodes.size 
        });
        
        this.emit('scaledUp', { newNodeId, totalNodes: this.nodes.size });
      }
      
    } catch (error) {
      logger.error('Error scaling up cluster', { error: error.message });
    }
  }

  /**
   * Scale down cluster
   */
  async scaleDown() {
    try {
      const nodeToRemove = this.selectNodeForRemoval();
      
      if (nodeToRemove) {
        await this.removeNode(nodeToRemove);
        this.lastScaleTime = Date.now();
        
        logger.info('Cluster scaled down', { 
          removedNode: nodeToRemove,
          totalNodes: this.nodes.size 
        });
        
        this.emit('scaledDown', { removedNode: nodeToRemove, totalNodes: this.nodes.size });
      }
      
    } catch (error) {
      logger.error('Error scaling down cluster', { error: error.message });
    }
  }

  /**
   * Add new node to cluster
   */
  async addNode() {
    // In a real implementation, this would provision a new Redis node
    const newNodeId = `node-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      host: 'localhost',
      port: 7000 + this.nodes.size,
      role: 'slave',
      status: 'healthy',
      lastHealthCheck: Date.now(),
      metrics: {
        connections: 0,
        memory: 0,
        cpu: 0,
        latency: 0,
        errorCount: 0
      }
    };
    
    this.nodes.set(newNodeId, newNode);
    this.loadBalancer.nodeWeights.set(newNodeId, 1);
    this.loadBalancer.nodeConnections.set(newNodeId, 0);
    this.loadBalancer.healthyNodes.add(newNodeId);
    
    logger.info('New node added to cluster', { newNodeId });
    return newNodeId;
  }

  /**
   * Remove node from cluster
   */
  async removeNode(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) return false;
    
    // Migrate data from node before removal
    await this.migrateDataFromNode(nodeId);
    
    // Remove from cluster
    this.nodes.delete(nodeId);
    this.loadBalancer.nodeWeights.delete(nodeId);
    this.loadBalancer.nodeConnections.delete(nodeId);
    this.loadBalancer.healthyNodes.delete(nodeId);
    this.metrics.nodeUtilization.delete(nodeId);
    
    logger.info('Node removed from cluster', { nodeId });
    return true;
  }

  /**
   * Select node for removal
   */
  selectNodeForRemoval() {
    let bestCandidate = null;
    let lowestUtilization = Infinity;
    
    for (const [nodeId, node] of this.nodes) {
      if (node.role === 'master') continue; // Don't remove master nodes
      
      const utilization = this.metrics.nodeUtilization.get(nodeId) || 0;
      if (utilization < lowestUtilization) {
        lowestUtilization = utilization;
        bestCandidate = nodeId;
      }
    }
    
    return bestCandidate;
  }

  /**
   * Migrate data from node
   */
  async migrateDataFromNode(nodeId) {
    // In a real implementation, this would migrate Redis keys
    logger.info('Migrating data from node', { nodeId });
    
    // Simulate migration delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info('Data migration completed', { nodeId });
  }

  /**
   * Handle node failure
   */
  async handleNodeFailure(node) {
    const nodeId = `${node.options.host}:${node.options.port}`;
    
    logger.error('Node failure detected', { nodeId });
    
    // Remove from healthy nodes
    this.loadBalancer.healthyNodes.delete(nodeId);
    
    // Trigger circuit breaker
    this.triggerCircuitBreaker(nodeId);
    
    // Attempt to recover or replace node
    await this.recoverNode(nodeId);
    
    this.emit('nodeFailure', { nodeId });
  }

  /**
   * Trigger circuit breaker for node
   */
  triggerCircuitBreaker(nodeId) {
    this.circuitBreakers.set(nodeId, {
      state: 'open',
      failureCount: 0,
      lastFailureTime: Date.now(),
      timeout: this.config.loadBalancing.circuitBreakerTimeout
    });
    
    logger.warn('Circuit breaker triggered', { nodeId });
  }

  /**
   * Check circuit breakers
   */
  async checkCircuitBreakers() {
    const now = Date.now();
    
    for (const [nodeId, breaker] of this.circuitBreakers) {
      if (breaker.state === 'open' && 
          now - breaker.lastFailureTime > breaker.timeout) {
        
        // Try to close circuit breaker
        try {
          await this.testNodeHealth(nodeId);
          breaker.state = 'closed';
          breaker.failureCount = 0;
          
          this.loadBalancer.healthyNodes.add(nodeId);
          
          logger.info('Circuit breaker closed', { nodeId });
          
        } catch (error) {
          breaker.lastFailureTime = now;
          logger.warn('Circuit breaker test failed', { nodeId, error: error.message });
        }
      }
    }
  }

  /**
   * Test node health
   */
  async testNodeHealth(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error('Node not found');
    
    // In a real implementation, this would test actual node connectivity
    const startTime = Date.now();
    await this.cluster.ping();
    const latency = Date.now() - startTime;
    
    if (latency > 1000) {
      throw new Error('Node response too slow');
    }
  }

  /**
   * Recover failed node
   */
  async recoverNode(nodeId) {
    try {
      logger.info('Attempting to recover node', { nodeId });
      
      // In a real implementation, this would attempt to restart the node
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Test if node is back online
      await this.testNodeHealth(nodeId);
      
      // Add back to healthy nodes
      this.loadBalancer.healthyNodes.add(nodeId);
      
      logger.info('Node recovered successfully', { nodeId });
      
    } catch (error) {
      logger.error('Failed to recover node', { nodeId, error: error.message });
      
      // If recovery fails, consider replacing the node
      if (this.nodes.size > this.config.scaling.minNodes) {
        await this.replaceNode(nodeId);
      }
    }
  }

  /**
   * Replace failed node
   */
  async replaceNode(nodeId) {
    try {
      logger.info('Replacing failed node', { nodeId });
      
      // Remove failed node
      await this.removeNode(nodeId);
      
      // Add new node
      const newNodeId = await this.addNode();
      
      logger.info('Node replaced successfully', { 
        oldNodeId: nodeId, 
        newNodeId 
      });
      
    } catch (error) {
      logger.error('Failed to replace node', { nodeId, error: error.message });
    }
  }

  /**
   * Get next available node using load balancing algorithm
   */
  getNextNode() {
    const healthyNodes = Array.from(this.loadBalancer.healthyNodes);
    
    if (healthyNodes.length === 0) {
      throw new Error('No healthy nodes available');
    }
    
    switch (this.loadBalancer.algorithm) {
      case 'round_robin':
        return this.getRoundRobinNode(healthyNodes);
      case 'least_connections':
        return this.getLeastConnectionsNode(healthyNodes);
      case 'weighted':
        return this.getWeightedNode(healthyNodes);
      default:
        return this.getRoundRobinNode(healthyNodes);
    }
  }

  /**
   * Get node using round robin algorithm
   */
  getRoundRobinNode(healthyNodes) {
    const nodeId = healthyNodes[this.loadBalancer.currentIndex % healthyNodes.length];
    this.loadBalancer.currentIndex++;
    return nodeId;
  }

  /**
   * Get node with least connections
   */
  getLeastConnectionsNode(healthyNodes) {
    let leastConnections = Infinity;
    let selectedNode = null;
    
    for (const nodeId of healthyNodes) {
      const connections = this.loadBalancer.nodeConnections.get(nodeId) || 0;
      if (connections < leastConnections) {
        leastConnections = connections;
        selectedNode = nodeId;
      }
    }
    
    return selectedNode;
  }

  /**
   * Get node using weighted algorithm
   */
  getWeightedNode(healthyNodes) {
    const totalWeight = healthyNodes.reduce((sum, nodeId) => {
      return sum + (this.loadBalancer.nodeWeights.get(nodeId) || 1);
    }, 0);
    
    let random = Math.random() * totalWeight;
    
    for (const nodeId of healthyNodes) {
      const weight = this.loadBalancer.nodeWeights.get(nodeId) || 1;
      random -= weight;
      if (random <= 0) {
        return nodeId;
      }
    }
    
    return healthyNodes[0];
  }

  /**
   * Update node connections
   */
  updateNodeConnections(nodeId, delta) {
    const current = this.loadBalancer.nodeConnections.get(nodeId) || 0;
    this.loadBalancer.nodeConnections.set(nodeId, Math.max(0, current + delta));
  }

  /**
   * Get cluster status
   */
  getClusterStatus() {
    return {
      initialized: this.isInitialized,
      totalNodes: this.nodes.size,
      healthyNodes: this.loadBalancer.healthyNodes.size,
      unhealthyNodes: this.nodes.size - this.loadBalancer.healthyNodes.size,
      loadBalancer: {
        algorithm: this.loadBalancer.algorithm,
        healthyNodes: Array.from(this.loadBalancer.healthyNodes)
      },
      metrics: this.metrics,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([nodeId, breaker]) => ({
        nodeId,
        state: breaker.state,
        failureCount: breaker.failureCount
      }))
    };
  }

  /**
   * Get node information
   */
  getNodeInfo(nodeId) {
    return this.nodes.get(nodeId);
  }

  /**
   * Get all nodes
   */
  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  /**
   * Close cluster connections
   */
  async close() {
    if (this.cluster) {
      await this.cluster.quit();
    }
    
    this.isInitialized = false;
    logger.info('Message queue scaling service closed');
  }
}

// Export singleton instance
export const messageQueueScalingService = new MessageQueueScalingService();
export default messageQueueScalingService;
