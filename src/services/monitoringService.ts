interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorEvent {
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  userId?: string;
}

class MonitoringService {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private readonly maxMetrics = 1000;
  private readonly maxErrors = 500;

  // Performance monitoring
  startTimer(name: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
      return duration;
    };
  }

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
      tags
    });

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  // Error tracking
  recordError(error: Error, context?: Record<string, any>): void {
    const errorEvent: ErrorEvent = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add user context if available
    if (context?.userId) {
      errorEvent.userId = context.userId;
    }

    this.errors.push(errorEvent);

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error recorded:', errorEvent);
    }
  }

  // Health checks
  async runHealthChecks(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, boolean>;
    timestamp: number;
  }> {
    const checks: Record<string, boolean> = {};
    
    // Check local storage
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      checks.localStorage = true;
    } catch {
      checks.localStorage = false;
    }

    // Check network connectivity
    try {
      await fetch('/health', { method: 'HEAD' });
      checks.network = true;
    } catch {
      checks.network = false;
    }

    // Check performance
    const memoryInfo = this.getMemoryInfo();
    checks.memory = memoryInfo ? memoryInfo.percentage < 90 : true;

    // Calculate overall status
    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyChecks === totalChecks) {
      status = 'healthy';
    } else if (healthyChecks >= totalChecks * 0.7) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      timestamp: Date.now()
    };
  }

  // Memory monitoring
  getMemoryInfo(): { used: number; total: number; percentage: number } | null {
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

  // Core Web Vitals monitoring
  observeWebVitals(): void {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime, { type: 'web-vital' });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fid = (entry as any).processingStart - entry.startTime;
        this.recordMetric('fid', fid, { type: 'web-vital' });
      }
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.recordMetric('cls', clsValue, { type: 'web-vital' });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get performance insights
  getPerformanceInsights(): {
    averagePageLoad: number;
    errorRate: number;
    memoryUsage: number;
    topErrors: Array<{ message: string; count: number }>;
  } {
    const pageLoadMetrics = this.metrics.filter(m => m.name === 'pageLoad');
    const averagePageLoad = pageLoadMetrics.length > 0
      ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length
      : 0;

    const totalInteractions = this.metrics.length;
    const errorRate = totalInteractions > 0 ? (this.errors.length / totalInteractions) * 100 : 0;

    const memoryInfo = this.getMemoryInfo();
    const memoryUsage = memoryInfo ? memoryInfo.percentage : 0;

    // Count error frequencies
    const errorCounts = new Map<string, number>();
    this.errors.forEach(error => {
      const count = errorCounts.get(error.message) || 0;
      errorCounts.set(error.message, count + 1);
    });

    const topErrors = Array.from(errorCounts.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      averagePageLoad,
      errorRate,
      memoryUsage,
      topErrors
    };
  }

  // Export metrics for external monitoring
  exportMetrics(): {
    metrics: PerformanceMetric[];
    errors: ErrorEvent[];
    timestamp: number;
  } {
    return {
      metrics: [...this.metrics],
      errors: [...this.errors],
      timestamp: Date.now()
    };
  }
}

export const monitoringService = new MonitoringService();

// Initialize web vitals monitoring
if (typeof window !== 'undefined') {
  monitoringService.observeWebVitals();
}
