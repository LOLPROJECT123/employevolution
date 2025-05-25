interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PerformanceService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

  // Caching system
  setCache<T>(key: string, data: T, duration: number = this.defaultCacheDuration): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + duration
    });

    // Cleanup expired items periodically
    this.cleanupExpiredCache();
  }

  getCache<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      // Remove items matching pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Clear all cache
      this.cache.clear();
    }
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Performance monitoring
  private performanceMetrics = new Map<string, number[]>();

  startTimer(operation: string): () => number {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, duration: number): void {
    if (!this.performanceMetrics.has(operation)) {
      this.performanceMetrics.set(operation, []);
    }
    
    const metrics = this.performanceMetrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } {
    const metrics = this.performanceMetrics.get(operation) || [];
    
    if (metrics.length === 0) {
      return { avg: 0, min: 0, max: 0, count: 0 };
    }

    const sum = metrics.reduce((a, b) => a + b, 0);
    const avg = sum / metrics.length;
    const min = Math.min(...metrics);
    const max = Math.max(...metrics);

    return { avg, min, max, count: metrics.length };
  }

  // Image optimization
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';
    
    // If it's already optimized or a data URL, return as is
    if (url.includes('?w=') || url.startsWith('data:')) {
      return url;
    }

    // Add optimization parameters for common image services
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', '80'); // Quality
    params.append('f', 'webp'); // Format

    return `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
  }

  // Lazy loading helper
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    const defaultOptions = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };

    return new IntersectionObserver(callback, defaultOptions);
  }

  // Debounce function for search and other frequent operations
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Throttle function for scroll events
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Virtual scrolling for large lists
  calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 5
  ): { start: number; end: number } {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(totalItems, start + visibleCount + overscan * 2);

    return { start, end };
  }

  // Bundle size optimization helpers
  preloadCriticalResources(): void {
    // Preload critical CSS and JS
    const criticalResources = [
      '/src/index.css',
      '/src/main.tsx'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  // Memory management
  getMemoryUsage(): { used: number; total: number; percentage: number } | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
      };
    }
    return null;
  }

  // Service worker helpers
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Critical performance metrics
  getCoreWebVitals(): Promise<{
    LCP?: number;
    FID?: number;
    CLS?: number;
    FCP?: number;
    TTFB?: number;
  }> {
    return new Promise((resolve) => {
      const metrics: any = {};

      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.FCP = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      // Return metrics after a delay to collect data
      setTimeout(() => resolve(metrics), 3000);
    });
  }
}

export const performanceService = new PerformanceService();
