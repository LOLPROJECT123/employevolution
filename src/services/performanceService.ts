
interface PerformanceTimer {
  (): void;
}

interface VisibleRange {
  start: number;
  end: number;
}

interface CoreWebVitals {
  fcp?: number;
  lcp?: number;
  fid?: number;
  cls?: number;
  ttfb?: number;
}

class PerformanceService {
  private timers = new Map<string, number>();

  startTimer(label: string): PerformanceTimer {
    const startTime = performance.now();
    this.timers.set(label, startTime);
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`${label}: ${duration.toFixed(2)}ms`);
      this.timers.delete(label);
      return duration;
    };
  }

  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>): Promise<ReturnType<T>> => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          resolve(func(...args));
        }, delay);
      });
    };
  }

  calculateVisibleRange(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 5
  ): VisibleRange {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      totalItems
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex
    };
  }

  preloadCriticalResources(): void {
    // Preload critical resources
    const criticalResources = [
      '/api/user-profile',
      '/api/job-preferences'
    ];

    criticalResources.forEach(url => {
      fetch(url, { method: 'HEAD' }).catch(() => {
        // Ignore preload errors
      });
    });
  }

  async getCoreWebVitals(): Promise<CoreWebVitals> {
    return new Promise((resolve) => {
      const vitals: CoreWebVitals = {};

      if ('web-vitals' in window) {
        // If web-vitals library is available
        resolve(vitals);
      } else {
        // Basic performance metrics
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          vitals.ttfb = navigation.responseStart - navigation.requestStart;
        }

        resolve(vitals);
      }
    });
  }
}

export const performanceService = new PerformanceService();
