import React from 'react';
import { performanceService } from '@/services/performanceService';
import { monitoringService } from '@/services/monitoringService';

export class PerformanceOptimizer {
  private static performanceObserver: PerformanceObserver | null = null;

  static initializeMonitoring() {
    // Monitor long tasks that block the main thread
    if ('PerformanceObserver' in window && !this.performanceObserver) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach(entry => {
          if (entry.entryType === 'longtask') {
            monitoringService.recordMetric('long_task_duration', entry.duration, {
              type: 'performance'
            });
            
            if (entry.duration > 100) {
              console.warn(`Long task detected: ${entry.duration}ms`);
            }
          }
          
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            monitoringService.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart);
          }
        });
      });

      try {
        this.performanceObserver.observe({ 
          entryTypes: ['longtask', 'navigation', 'paint']
        });
      } catch (error) {
        console.warn('Performance monitoring not supported:', error);
      }
    }
  }

  static measureComponentRender<T extends React.ComponentType<any>>(
    Component: T,
    componentName: string
  ): T {
    const MeasuredComponent = React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
      const timer = performanceService.startTimer(`render_${componentName}`);
      
      React.useEffect(() => {
        // Call timer to stop the measurement
        timer();
      });

      return React.createElement(Component, { ...props, ref });
    });

    MeasuredComponent.displayName = `Measured(${Component.displayName || Component.name || 'Component'})`;
    
    // Use type assertion through unknown to satisfy TypeScript
    return React.memo(MeasuredComponent) as unknown as T;
  }

  static optimizeListRender<T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    overscan: number = 5
  ) {
    const [scrollTop, setScrollTop] = React.useState(0);
    
    const visibleRange = performanceService.calculateVisibleRange(
      scrollTop,
      containerHeight,
      itemHeight,
      items.length,
      overscan
    );

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const offsetY = visibleRange.start * itemHeight;

    return {
      visibleItems,
      offsetY,
      setScrollTop,
      totalHeight: items.length * itemHeight
    };
  }

  static preloadCriticalResources() {
    performanceService.preloadCriticalResources();
  }

  static async getCoreWebVitals() {
    return await performanceService.getCoreWebVitals();
  }

  static getMemoryUsage() {
    return monitoringService.getMemoryInfo();
  }

  static cleanup() {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
  }
}

// Initialize monitoring when the module loads
if (typeof window !== 'undefined') {
  PerformanceOptimizer.initializeMonitoring();
}
