/**
 * Frontend Performance Optimization Service
 * Phase 15 Performance Optimization
 * Advanced frontend optimizations, SSR, and performance monitoring
 */

import { logger } from '../utils/logger';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
}

interface OptimizationConfig {
  enableSSR: boolean;
  enableCodeSplitting: boolean;
  enableImageOptimization: boolean;
  enablePrefetching: boolean;
  enableServiceWorker: boolean;
  enableCompression: boolean;
  enableCaching: boolean;
  performanceBudget: {
    maxBundleSize: number;
    maxLoadTime: number;
    maxRenderTime: number;
  };
}

class PerformanceOptimizationService {
  private metrics: PerformanceMetrics;
  private config: OptimizationConfig;
  private performanceObserver: PerformanceObserver | null = null;
  private resourceTimings: PerformanceResourceTiming[] = [];
  private isInitialized = false;

  constructor() {
    this.metrics = {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      bundleSize: 0,
      memoryUsage: 0,
      renderTime: 0
    };

    this.config = {
      enableSSR: true,
      enableCodeSplitting: true,
      enableImageOptimization: true,
      enablePrefetching: true,
      enableServiceWorker: true,
      enableCompression: true,
      enableCaching: true,
      performanceBudget: {
        maxBundleSize: 1024 * 1024, // 1MB
        maxLoadTime: 2000, // 2 seconds
        maxRenderTime: 100 // 100ms
      }
    };

    this.initialize();
  }

  /**
   * Initialize performance optimization service
   */
  private initialize(): void {
    if (this.isInitialized) return;

    this.setupPerformanceObserver();
    this.setupResourceMonitoring();
    this.setupMemoryMonitoring();
    this.setupBundleAnalysis();
    this.setupImageOptimization();
    this.setupPrefetching();
    this.setupServiceWorker();

    this.isInitialized = true;
    logger.info('Performance optimization service initialized');
  }

  /**
   * Setup Performance Observer for Core Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // Observe Largest Contentful Paint
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
        
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          this.checkPerformanceBudget('largestContentfulPaint', lastEntry.startTime);
        }
      });
      this.performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Observe First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          this.checkPerformanceBudget('firstInputDelay', this.metrics.firstInputDelay);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Observe Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        
        this.metrics.cumulativeLayoutShift = clsValue;
        this.checkPerformanceBudget('cumulativeLayoutShift', clsValue);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      logger.error('Failed to setup performance observer', error);
    }
  }

  /**
   * Setup resource monitoring
   */
  private setupResourceMonitoring(): void {
    // Monitor resource loading times
    window.addEventListener('load', () => {
      this.measureLoadTime();
      this.analyzeResourceTimings();
    });

    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        this.metrics.loadTime = nav.loadEventEnd - nav.fetchStart;
        this.checkPerformanceBudget('loadTime', this.metrics.loadTime);
      }
    }
  }

  /**
   * Setup memory monitoring
   */
  private setupMemoryMonitoring(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      
      setInterval(() => {
        this.metrics.memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
        this.checkPerformanceBudget('memoryUsage', this.metrics.memoryUsage);
      }, 5000);
    }
  }

  /**
   * Setup bundle analysis
   */
  private setupBundleAnalysis(): void {
    // Analyze current bundle size
    if ('performance' in window && 'getEntriesByType' in performance) {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      const scriptEntries = resourceEntries.filter(entry => 
        entry.name.includes('.js') && !entry.name.includes('node_modules')
      );
      
      this.metrics.bundleSize = scriptEntries.reduce((total, entry) => {
        return total + (entry.transferSize || 0);
      }, 0);
      
      this.checkPerformanceBudget('bundleSize', this.metrics.bundleSize);
    }
  }

  /**
   * Setup image optimization
   */
  private setupImageOptimization(): void {
    if (!this.config.enableImageOptimization) return;

    // Lazy load images
    this.setupLazyLoading();
    
    // Optimize image formats
    this.setupImageFormatOptimization();
    
    // Setup responsive images
    this.setupResponsiveImages();
  }

  /**
   * Setup lazy loading for images
   */
  private setupLazyLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src || '';
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src || '';
      });
    }
  }

  /**
   * Setup image format optimization
   */
  private setupImageFormatOptimization(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Check if browser supports WebP
      if (this.supportsWebP()) {
        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        img.src = webpSrc;
      }
      
      // Check if browser supports AVIF
      if (this.supportsAVIF()) {
        const avifSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.avif');
        img.src = avifSrc;
      }
    });
  }

  /**
   * Setup responsive images
   */
  private setupResponsiveImages(): void {
    const images = document.querySelectorAll('img[data-sizes]');
    
    images.forEach(img => {
      const image = img as HTMLImageElement;
      const sizes = image.dataset.sizes;
      
      if (sizes && 'srcset' in image) {
        // Generate srcset based on device pixel ratio
        const srcset = this.generateSrcset(image.src, sizes);
        image.srcset = srcset;
      }
    });
  }

  /**
   * Setup prefetching
   */
  private setupPrefetching(): void {
    if (!this.config.enablePrefetching) return;

    // Prefetch critical resources
    this.prefetchCriticalResources();
    
    // Prefetch on hover
    this.setupHoverPrefetching();
    
    // Prefetch on viewport intersection
    this.setupViewportPrefetching();
  }

  /**
   * Prefetch critical resources
   */
  private prefetchCriticalResources(): void {
    const criticalResources = [
      '/api/v1/user/profile',
      '/api/v1/gamification/progress',
      '/api/v1/recommendations/friends'
    ];

    criticalResources.forEach(resource => {
      this.prefetchResource(resource);
    });
  }

  /**
   * Setup hover prefetching
   */
  private setupHoverPrefetching(): void {
    const links = document.querySelectorAll('a[data-prefetch]');
    
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = (link as HTMLAnchorElement).href;
        this.prefetchResource(href);
      });
    });
  }

  /**
   * Setup viewport prefetching
   */
  private setupViewportPrefetching(): void {
    if ('IntersectionObserver' in window) {
      const prefetchObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const prefetchUrl = element.dataset.prefetch;
            
            if (prefetchUrl) {
              this.prefetchResource(prefetchUrl);
              prefetchObserver.unobserve(element);
            }
          }
        });
      });

      const prefetchElements = document.querySelectorAll('[data-prefetch]');
      prefetchElements.forEach(el => prefetchObserver.observe(el));
    }
  }

  /**
   * Setup service worker
   */
  private setupServiceWorker(): void {
    if (!this.config.enableServiceWorker) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          logger.info('Service worker registered', registration);
        })
        .catch(error => {
          logger.error('Service worker registration failed', error);
        });
    }
  }

  /**
   * Measure load time
   */
  private measureLoadTime(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      
      if (navigationEntries.length > 0) {
        const nav = navigationEntries[0];
        this.metrics.loadTime = nav.loadEventEnd - nav.fetchStart;
        this.metrics.firstContentfulPaint = nav.domContentLoadedEventEnd - nav.fetchStart;
      }
    }
  }

  /**
   * Analyze resource timings
   */
  private analyzeResourceTimings(): void {
    if ('performance' in window && 'getEntriesByType' in performance) {
      this.resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Analyze slow resources
      const slowResources = this.resourceTimings.filter(resource => 
        resource.duration > 1000 // Resources taking more than 1 second
      );
      
      if (slowResources.length > 0) {
        logger.warn('Slow resources detected', slowResources);
        this.optimizeSlowResources(slowResources);
      }
    }
  }

  /**
   * Optimize slow resources
   */
  private optimizeSlowResources(slowResources: PerformanceResourceTiming[]): void {
    slowResources.forEach(resource => {
      // Implement optimization strategies
      if (resource.name.includes('.js')) {
        this.optimizeJavaScriptResource(resource);
      } else if (resource.name.includes('.css')) {
        this.optimizeCSSResource(resource);
      } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
        this.optimizeImageResource(resource);
      }
    });
  }

  /**
   * Optimize JavaScript resource
   */
  private optimizeJavaScriptResource(resource: PerformanceResourceTiming): void {
    // Implement code splitting for large JS files
    if (resource.transferSize && resource.transferSize > 100000) { // 100KB
      logger.info('Large JavaScript resource detected, consider code splitting', {
        url: resource.name,
        size: resource.transferSize
      });
    }
  }

  /**
   * Optimize CSS resource
   */
  private optimizeCSSResource(resource: PerformanceResourceTiming): void {
    // Implement critical CSS extraction
    if (resource.transferSize && resource.transferSize > 50000) { // 50KB
      logger.info('Large CSS resource detected, consider critical CSS extraction', {
        url: resource.name,
        size: resource.transferSize
      });
    }
  }

  /**
   * Optimize image resource
   */
  private optimizeImageResource(resource: PerformanceResourceTiming): void {
    // Implement image optimization
    if (resource.transferSize && resource.transferSize > 200000) { // 200KB
      logger.info('Large image resource detected, consider optimization', {
        url: resource.name,
        size: resource.transferSize
      });
    }
  }

  /**
   * Check performance budget
   */
  private checkPerformanceBudget(metric: string, value: number): void {
    const budget = this.config.performanceBudget;
    
    switch (metric) {
      case 'bundleSize':
        if (value > budget.maxBundleSize) {
          logger.warn('Bundle size exceeds budget', { metric, value, budget: budget.maxBundleSize });
        }
        break;
      case 'loadTime':
        if (value > budget.maxLoadTime) {
          logger.warn('Load time exceeds budget', { metric, value, budget: budget.maxLoadTime });
        }
        break;
      case 'renderTime':
        if (value > budget.maxRenderTime) {
          logger.warn('Render time exceeds budget', { metric, value, budget: budget.maxRenderTime });
        }
        break;
    }
  }

  /**
   * Prefetch resource
   */
  private prefetchResource(url: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Check if browser supports WebP
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Check if browser supports AVIF
   */
  private supportsAVIF(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  }

  /**
   * Generate srcset for responsive images
   */
  private generateSrcset(baseSrc: string, sizes: string): string {
    const srcset = [];
    const sizeArray = sizes.split(',');
    
    sizeArray.forEach(size => {
      const [width, descriptor] = size.trim().split(' ');
      const src = baseSrc.replace(/(\.[^.]+)$/, `_${width}$1`);
      srcset.push(`${src} ${descriptor}`);
    });
    
    return srcset.join(', ');
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): any {
    return {
      metrics: this.metrics,
      resourceTimings: this.resourceTimings,
      performanceScore: this.calculatePerformanceScore(),
      recommendations: this.generateRecommendations(),
      budgetStatus: this.checkBudgetStatus()
    };
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(): number {
    let score = 100;
    
    // Deduct points for poor metrics
    if (this.metrics.loadTime > 2000) score -= 20;
    if (this.metrics.largestContentfulPaint > 2500) score -= 20;
    if (this.metrics.firstInputDelay > 100) score -= 20;
    if (this.metrics.cumulativeLayoutShift > 0.1) score -= 20;
    if (this.metrics.bundleSize > this.config.performanceBudget.maxBundleSize) score -= 20;
    
    return Math.max(0, score);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations = [];
    
    if (this.metrics.loadTime > 2000) {
      recommendations.push('Consider implementing server-side rendering (SSR)');
      recommendations.push('Optimize critical rendering path');
    }
    
    if (this.metrics.bundleSize > this.config.performanceBudget.maxBundleSize) {
      recommendations.push('Implement code splitting and lazy loading');
      recommendations.push('Remove unused dependencies');
    }
    
    if (this.metrics.largestContentfulPaint > 2500) {
      recommendations.push('Optimize images and use modern formats');
      recommendations.push('Implement resource hints (preload, prefetch)');
    }
    
    if (this.metrics.firstInputDelay > 100) {
      recommendations.push('Reduce JavaScript execution time');
      recommendations.push('Implement web workers for heavy computations');
    }
    
    return recommendations;
  }

  /**
   * Check budget status
   */
  private checkBudgetStatus(): any {
    return {
      bundleSize: {
        current: this.metrics.bundleSize,
        budget: this.config.performanceBudget.maxBundleSize,
        status: this.metrics.bundleSize <= this.config.performanceBudget.maxBundleSize ? 'good' : 'exceeded'
      },
      loadTime: {
        current: this.metrics.loadTime,
        budget: this.config.performanceBudget.maxLoadTime,
        status: this.metrics.loadTime <= this.config.performanceBudget.maxLoadTime ? 'good' : 'exceeded'
      },
      renderTime: {
        current: this.metrics.renderTime,
        budget: this.config.performanceBudget.maxRenderTime,
        status: this.metrics.renderTime <= this.config.performanceBudget.maxRenderTime ? 'good' : 'exceeded'
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Performance optimization config updated', newConfig);
  }

  /**
   * Enable/disable specific optimizations
   */
  toggleOptimization(optimization: keyof OptimizationConfig, enabled: boolean): void {
    if (optimization in this.config) {
      (this.config as any)[optimization] = enabled;
      logger.info(`Optimization ${optimization} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    this.isInitialized = false;
    logger.info('Performance optimization service cleaned up');
  }
}

// Export singleton instance
export const performanceOptimizationService = new PerformanceOptimizationService();
export default performanceOptimizationService;
