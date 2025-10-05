/**
 * CDN Service
 * Phase 15 Performance Optimization
 * CloudFlare CDN integration with edge caching and optimization
 */

import { logger } from '../utils/logger.js';
import { performanceMonitoringService } from './performanceMonitoringService.js';

class CDNService {
  constructor() {
    this.cloudflareConfig = {
      apiToken: process.env.CLOUDFLARE_API_TOKEN,
      zoneId: process.env.CLOUDFLARE_ZONE_ID,
      baseUrl: 'https://api.cloudflare.com/client/v4',
      defaultTTL: 3600, // 1 hour
      maxTTL: 86400, // 24 hours
      minTTL: 300 // 5 minutes
    };
    
    this.cacheRules = {
      static: {
        ttl: 31536000, // 1 year
        cacheLevel: 'cache_everything',
        edgeCacheTtl: 31536000
      },
      api: {
        ttl: 300, // 5 minutes
        cacheLevel: 'bypass',
        edgeCacheTtl: 300
      },
      dynamic: {
        ttl: 1800, // 30 minutes
        cacheLevel: 'cache_everything',
        edgeCacheTtl: 1800
      },
      images: {
        ttl: 86400, // 24 hours
        cacheLevel: 'cache_everything',
        edgeCacheTtl: 86400
      }
    };
    
    this.purgeQueue = [];
    this.isInitialized = false;
    
    this.initialize();
  }

  /**
   * Initialize CDN service
   */
  async initialize() {
    try {
      if (!this.cloudflareConfig.apiToken || !this.cloudflareConfig.zoneId) {
        logger.warn('CloudFlare configuration missing, CDN features disabled');
        return;
      }
      
      // Test API connection
      await this.testConnection();
      
      // Set up cache rules
      await this.setupCacheRules();
      
      // Start purge queue processor
      this.startPurgeQueueProcessor();
      
      this.isInitialized = true;
      logger.info('CDN service initialized successfully');
      
    } catch (error) {
      logger.error('CDN service initialization failed', { error: error.message });
    }
  }

  /**
   * Test CloudFlare API connection
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API test failed: ${response.status}`);
      }
      
      const data = await response.json();
      logger.info('CloudFlare API connection successful', { 
        zone: data.result.name 
      });
      
    } catch (error) {
      logger.error('CloudFlare API connection failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Set up cache rules for different content types
   */
  async setupCacheRules() {
    try {
      for (const [ruleName, config] of Object.entries(this.cacheRules)) {
        await this.createCacheRule(ruleName, config);
      }
      
      logger.info('Cache rules set up successfully');
      
    } catch (error) {
      logger.error('Failed to set up cache rules', { error: error.message });
    }
  }

  /**
   * Create cache rule
   */
  async createCacheRule(ruleName, config) {
    try {
      const rule = {
        name: `Diet Game - ${ruleName}`,
        priority: this.getRulePriority(ruleName),
        status: 'active',
        action: 'cache',
        action_parameters: {
          cache: true,
          edge_ttl: {
            mode: 'override_origin',
            default: config.edgeCacheTtl
          }
        },
        expression: this.getRuleExpression(ruleName)
      };
      
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/rulesets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rule)
      });
      
      if (response.ok) {
        logger.info('Cache rule created', { ruleName });
      } else {
        logger.warn('Cache rule creation failed', { ruleName, status: response.status });
      }
      
    } catch (error) {
      logger.error('Cache rule creation error', { ruleName, error: error.message });
    }
  }

  /**
   * Get rule priority based on content type
   */
  getRulePriority(ruleName) {
    const priorities = {
      static: 1,
      images: 2,
      dynamic: 3,
      api: 4
    };
    
    return priorities[ruleName] || 5;
  }

  /**
   * Get rule expression for content type
   */
  getRuleExpression(ruleName) {
    const expressions = {
      static: '(http.request.uri.path matches "^/static/.*" or http.request.uri.path matches "^/assets/.*")',
      images: 'http.request.uri.path matches "^/images/.*"',
      dynamic: '(http.request.uri.path matches "^/api/v1/recommendations/.*" or http.request.uri.path matches "^/api/v1/leaderboard/.*")',
      api: 'http.request.uri.path matches "^/api/.*"'
    };
    
    return expressions[ruleName] || 'true';
  }

  /**
   * Purge cache for specific URLs
   */
  async purgeCache(urls, options = {}) {
    if (!this.isInitialized) {
      logger.warn('CDN service not initialized, skipping purge');
      return false;
    }
    
    try {
      const purgeData = {
        files: Array.isArray(urls) ? urls : [urls]
      };
      
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purgeData)
      });
      
      if (response.ok) {
        const result = await response.json();
        logger.info('Cache purged successfully', { 
          urls: purgeData.files,
          purgeId: result.result.id 
        });
        
        performanceMonitoringService.recordCDNPurge(urls, true);
        return true;
        
      } else {
        logger.error('Cache purge failed', { 
          urls: purgeData.files,
          status: response.status 
        });
        
        performanceMonitoringService.recordCDNPurge(urls, false);
        return false;
      }
      
    } catch (error) {
      logger.error('Cache purge error', { urls, error: error.message });
      performanceMonitoringService.recordCDNPurge(urls, false);
      return false;
    }
  }

  /**
   * Purge cache by tag
   */
  async purgeCacheByTag(tags) {
    if (!this.isInitialized) {
      logger.warn('CDN service not initialized, skipping tag purge');
      return false;
    }
    
    try {
      const purgeData = {
        tags: Array.isArray(tags) ? tags : [tags]
      };
      
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(purgeData)
      });
      
      if (response.ok) {
        const result = await response.json();
        logger.info('Cache purged by tag successfully', { 
          tags: purgeData.tags,
          purgeId: result.result.id 
        });
        
        return true;
        
      } else {
        logger.error('Cache purge by tag failed', { 
          tags: purgeData.tags,
          status: response.status 
        });
        return false;
      }
      
    } catch (error) {
      logger.error('Cache purge by tag error', { tags, error: error.message });
      return false;
    }
  }

  /**
   * Queue cache purge for batch processing
   */
  queuePurge(urls, priority = 'normal') {
    this.purgeQueue.push({
      urls: Array.isArray(urls) ? urls : [urls],
      priority,
      timestamp: Date.now()
    });
    
    logger.debug('Cache purge queued', { urls, priority });
  }

  /**
   * Start purge queue processor
   */
  startPurgeQueueProcessor() {
    setInterval(async () => {
      if (this.purgeQueue.length > 0) {
        await this.processPurgeQueue();
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Process purge queue
   */
  async processPurgeQueue() {
    if (this.purgeQueue.length === 0) return;
    
    // Sort by priority
    this.purgeQueue.sort((a, b) => {
      const priorityOrder = { high: 1, normal: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Process up to 10 items at a time
    const batch = this.purgeQueue.splice(0, 10);
    
    for (const item of batch) {
      try {
        await this.purgeCache(item.urls);
      } catch (error) {
        logger.error('Batch purge error', { 
          urls: item.urls, 
          error: error.message 
        });
      }
    }
  }

  /**
   * Get cache analytics
   */
  async getCacheAnalytics(options = {}) {
    if (!this.isInitialized) {
      return null;
    }
    
    try {
      const { startTime, endTime } = options;
      const params = new URLSearchParams();
      
      if (startTime) params.append('since', startTime);
      if (endTime) params.append('until', endTime);
      
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/analytics/dashboard?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return this.processAnalyticsData(data.result);
      } else {
        logger.error('Failed to get cache analytics', { status: response.status });
        return null;
      }
      
    } catch (error) {
      logger.error('Cache analytics error', { error: error.message });
      return null;
    }
  }

  /**
   * Process analytics data
   */
  processAnalyticsData(data) {
    return {
      requests: data.totals.requests.all,
      bandwidth: data.totals.bandwidth.all,
      cacheHitRate: data.totals.cache.all / data.totals.requests.all,
      threats: data.totals.threats.all,
      pageViews: data.totals.page_views.all,
      uniqueVisitors: data.totals.uniques.all
    };
  }

  /**
   * Optimize images with CloudFlare Image Resizing
   */
  async optimizeImage(imageUrl, options = {}) {
    if (!this.isInitialized) {
      return imageUrl;
    }
    
    try {
      const { width, height, quality = 85, format = 'auto' } = options;
      const params = new URLSearchParams();
      
      if (width) params.append('width', width);
      if (height) params.append('height', height);
      if (quality) params.append('quality', quality);
      if (format) params.append('format', format);
      
      const optimizedUrl = `${imageUrl}?${params.toString()}`;
      
      logger.debug('Image optimization applied', { 
        originalUrl: imageUrl, 
        optimizedUrl,
        options 
      });
      
      return optimizedUrl;
      
    } catch (error) {
      logger.error('Image optimization error', { imageUrl, error: error.message });
      return imageUrl;
    }
  }

  /**
   * Get CDN health status
   */
  async getHealthStatus() {
    try {
      if (!this.isInitialized) {
        return {
          status: 'disabled',
          message: 'CDN service not initialized'
        };
      }
      
      // Test API connection
      await this.testConnection();
      
      // Get basic analytics
      const analytics = await this.getCacheAnalytics({
        startTime: Date.now() - 3600000, // Last hour
        endTime: Date.now()
      });
      
      return {
        status: 'healthy',
        initialized: this.isInitialized,
        analytics: analytics,
        purgeQueueSize: this.purgeQueue.length
      };
      
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  /**
   * Set cache TTL for specific content type
   */
  async setCacheTTL(contentType, ttl) {
    try {
      if (this.cacheRules[contentType]) {
        this.cacheRules[contentType].ttl = ttl;
        this.cacheRules[contentType].edgeCacheTtl = ttl;
        
        logger.info('Cache TTL updated', { contentType, ttl });
        return true;
      } else {
        logger.warn('Unknown content type', { contentType });
        return false;
      }
      
    } catch (error) {
      logger.error('Cache TTL update error', { contentType, ttl, error: error.message });
      return false;
    }
  }

  /**
   * Get cache configuration
   */
  getCacheConfiguration() {
    return {
      rules: this.cacheRules,
      initialized: this.isInitialized,
      purgeQueueSize: this.purgeQueue.length
    };
  }

  /**
   * Clear all cache
   */
  async clearAllCache() {
    try {
      const response = await fetch(`${this.cloudflareConfig.baseUrl}/zones/${this.cloudflareConfig.zoneId}/purge_cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.cloudflareConfig.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ purge_everything: true })
      });
      
      if (response.ok) {
        logger.info('All cache cleared successfully');
        return true;
      } else {
        logger.error('Clear all cache failed', { status: response.status });
        return false;
      }
      
    } catch (error) {
      logger.error('Clear all cache error', { error: error.message });
      return false;
    }
  }
}

// Export singleton instance
export const cdnService = new CDNService();
export default cdnService;
