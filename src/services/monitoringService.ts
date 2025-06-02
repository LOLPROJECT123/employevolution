interface MetricData {
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  checks: {
    database: boolean;
    network: boolean;
    memory: boolean;
    cache: boolean;
  };
}

interface PerformanceInsights {
  averagePageLoad: number;
  errorRate: number;
  memoryUsage: number;
  topErrors: Array<{ message: string; count: number }>;
}

class MonitoringService {
  private metrics = new Map<string, MetricData[]>();
  private errors: Array<{ message: string; timestamp: number }> = [];

  recordMetric(name: string, value: number, tags?: Record<string, string>): void {
    const metric: MetricData = {
      value,
      timestamp: Date.now(),
      tags
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only last 100 entries per metric
    if (metrics.length > 100) {
      metrics.shift();
    }

    console.log(`Metric recorded: ${name} = ${value}`, tags);
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(name, duration, { type: 'timing' });
      return duration;
    };
  }

  getMetrics(name: string): MetricData[] {
    return this.metrics.get(name) || [];
  }

  getMemoryInfo(): MemoryInfo | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  recordError(error: string): void {
    this.errors.push({
      message: error,
      timestamp: Date.now()
    });

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  }

  async runHealthChecks(): Promise<HealthCheckResult> {
    const uptime = performance.now();
    
    // Simulate health checks
    const checks = {
      database: true, // In real app, test database connection
      network: navigator.onLine,
      memory: this.checkMemoryHealth(),
      cache: true // In real app, test cache service
    };

    const allHealthy = Object.values(checks).every(check => check);
    const status = allHealthy ? 'healthy' : 'degraded';

    return {
      status,
      uptime,
      checks
    };
  }

  getPerformanceInsights(): PerformanceInsights {
    const pageLoadMetrics = this.getMetrics('page_load_time');
    const averagePageLoad = pageLoadMetrics.length > 0 
      ? pageLoadMetrics.reduce((sum, metric) => sum + metric.value, 0) / pageLoadMetrics.length
      : 0;

    const errorCount = this.errors.length;
    const totalRequests = Math.max(pageLoadMetrics.length, 1);
    const errorRate = (errorCount / totalRequests) * 100;

    const memoryInfo = this.getMemoryInfo();
    const memoryUsage = memoryInfo 
      ? (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
      : 0;

    // Get top errors by frequency
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

  private checkMemoryHealth(): boolean {
    const memoryInfo = this.getMemoryInfo();
    if (!memoryInfo) return true;
    
    const usage = (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100;
    return usage < 90; // Consider unhealthy if using more than 90% of available memory
  }
}

export const monitoringService = new MonitoringService();
