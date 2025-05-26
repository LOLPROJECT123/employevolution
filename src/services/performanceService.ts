
import { cacheService } from './cacheService';
import { monitoringService } from './monitoringService';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class PerformanceService {
  private readonly defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

  // Caching system - now delegated to cacheService
  setCache<T>(key: string, data: T, duration: number = this.defaultCacheDuration): void {
    cacheService.set(key, data, duration);
  }

  getCache<T>(key: string): T | null {
    return cacheService.get<T>(key);
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      // This is a simplified version - in production you might want pattern matching
      cacheService.clear();
    } else {
      cacheService.clear();
    }
  }

  // Performance monitoring - now delegated to monitoringService
  startTimer(operation: string): () => number {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
      return duration;
    };
  }

  recordMetric(operation: string, duration: number): void {
    monitoringService.recordMetric(operation, duration);
  }

  getMetrics(operation: string): { avg: number; min: number; max: number; count: number } {
    const insights = monitoringService.getPerformanceInsights();
    // Return basic metrics - in production, you'd filter by operation
    return { avg: insights.averagePageLoad, min: 0, max: 0, count: 0 };
  }

  // Image optimization
  optimizeImageUrl(url: string, width?: number, height?: number): string {
    if (!url) return '';
    
    if (url.includes('?w=') || url.startsWith('data:')) {
      return url;
    }

    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', '80');
    params.append('f', 'webp');

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

  // Debounce function
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

  // Throttle function
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

  // Virtual scrolling
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
    return monitoringService.getMemoryInfo();
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

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metrics.FCP = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });

      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metrics.LCP = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metrics.CLS = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(metrics), 3000);
    });
  }
}

export const performanceService = new PerformanceService();
