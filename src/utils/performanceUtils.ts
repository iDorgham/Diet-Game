// Performance utilities for the Diet Game gamification system

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      result[name] = {
        average: this.getAverageMetric(name),
        count: values.length,
        latest: values[values.length - 1] || 0
      };
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Monitor component render times
  monitorComponentRender(componentName: string) {
    return this.startTiming(`render_${componentName}`);
  }

  // Monitor data fetching
  monitorDataFetch(dataType: string) {
    return this.startTiming(`fetch_${dataType}`);
  }

  // Monitor user interactions
  monitorUserInteraction(action: string) {
    return this.startTiming(`interaction_${action}`);
  }
}

// Debounce utility with performance tracking
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: NodeJS.Timeout | null = null;
  const monitor = PerformanceMonitor.getInstance();

  return ((...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) {
        const endTiming = monitor.startTiming('debounced_function');
        func(...args);
        endTiming();
      }
    };

    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
    
    if (callNow) {
      const endTiming = monitor.startTiming('debounced_function_immediate');
      func(...args);
      endTiming();
    }
  }) as T;
}

// Throttle utility with performance tracking
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle: boolean;
  const monitor = PerformanceMonitor.getInstance();

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      const endTiming = monitor.startTiming('throttled_function');
      func(...args);
      endTiming();
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }) as T;
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
    };
  }
  
  return { used: 0, total: 0, percentage: 0 };
}

// FPS monitoring
export class FPSMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 0;
  private isRunning = false;
  private callback?: (fps: number) => void;

  start(callback?: (fps: number) => void): void {
    this.callback = callback;
    this.isRunning = true;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.measure();
  }

  stop(): void {
    this.isRunning = false;
  }

  getFPS(): number {
    return this.fps;
  }

  private measure = (): void => {
    if (!this.isRunning) return;

    this.frameCount++;
    const currentTime = performance.now();
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      if (this.callback) {
        this.callback(this.fps);
      }
    }
    
    requestAnimationFrame(this.measure);
  };
}

// Bundle size monitoring
export function getBundleSize(): {
  scripts: number;
  styles: number;
  total: number;
} {
  const scripts = Array.from(document.querySelectorAll('script[src]'))
    .reduce((total, script) => {
      const src = script.getAttribute('src');
      if (src && !src.includes('node_modules')) {
        // This is a rough estimate - in production you'd want to measure actual sizes
        return total + 10000; // Assume 10KB per script
      }
      return total;
    }, 0);

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .reduce((total, link) => {
      const href = link.getAttribute('href');
      if (href && !href.includes('node_modules')) {
        return total + 5000; // Assume 5KB per stylesheet
      }
      return total;
    }, 0);

  return {
    scripts,
    styles,
    total: scripts + styles
  };
}

// Cache management utilities
export class CacheManager {
  private static instance: CacheManager;
  private caches: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.caches.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const cached = this.caches.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.caches.delete(key);
      return null;
    }

    return cached.data;
  }

  has(key: string): boolean {
    const cached = this.caches.get(key);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.caches.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.caches.clear();
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, cached] of this.caches.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.caches.delete(key);
      }
    }
  }

  getStats(): {
    size: number;
    keys: string[];
    memoryUsage: number;
  } {
    return {
      size: this.caches.size,
      keys: Array.from(this.caches.keys()),
      memoryUsage: JSON.stringify(Array.from(this.caches.values())).length
    };
  }
}

// Performance optimization helpers
export const performanceHelpers = {
  // Check if element is in viewport
  isInViewport(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  },

  // Request Idle Callback polyfill
  requestIdleCallback(callback: (deadline: { didTimeout: boolean; timeRemaining: () => number }) => void): number {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(callback);
    }
    
    // Fallback for browsers that don't support requestIdleCallback
    return setTimeout(() => {
      callback({
        didTimeout: false,
        timeRemaining: () => 0
      });
    }, 1);
  },

  // Cancel Idle Callback
  cancelIdleCallback(id: number): void {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  },

  // Batch DOM updates
  batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  },

  // Measure element dimensions
  measureElement(element: Element): {
    width: number;
    height: number;
    top: number;
    left: number;
  } {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left
    };
  }
};

// Performance reporting
export function reportPerformanceMetrics(): void {
  const monitor = PerformanceMonitor.getInstance();
  const memory = getMemoryUsage();
  const bundle = getBundleSize();
  const cache = CacheManager.getInstance().getStats();

  console.group('🚀 Performance Metrics');
  console.table(monitor.getMetrics());
  console.log('Memory Usage:', memory);
  console.log('Bundle Size:', bundle);
  console.log('Cache Stats:', cache);
  console.groupEnd();
}

// Auto-report performance metrics in development
if (process.env.NODE_ENV === 'development') {
  setInterval(reportPerformanceMetrics, 30000); // Report every 30 seconds
}
