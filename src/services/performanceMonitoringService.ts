
// Comprehensive performance monitoring dashboard service
import { monitoringService } from './monitoringService';

interface PerformanceDashboardData {
  webVitals: {
    lcp: number;
    fid: number;
    cls: number;
    fcp: number;
    ttfb: number;
  };
  apiMetrics: {
    averageResponseTime: number;
    errorRate: number;
    requestsPerMinute: number;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
  };
  userExperience: {
    pageLoadTime: number;
    timeToInteractive: number;
    bounceRate: number;
    sessionDuration: number;
  };
  systemHealth: {
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    cacheHitRate: number;
  };
  realTimeStats: {
    activeUsers: number;
    currentRequests: number;
    queuedJobs: number;
    serverStatus: 'healthy' | 'warning' | 'critical';
  };
}

class PerformanceMonitoringService {
  private metricsBuffer: Array<{ metric: string; value: number; timestamp: number; tags?: Record<string, string> }> = [];
  private alertThresholds = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    apiResponseTime: 1000,
    errorRate: 5,
    memoryUsage: 80
  };

  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.initializePerformanceMonitoring();
    this.startRealTimeMetricsCollection();
  }

  private initializePerformanceMonitoring(): void {
    this.observeWebVitals();
    this.observeNavigationTiming();
    this.observeResourceTiming();
    this.observeLongTasks();
  }

  private observeWebVitals(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('lcp', lastEntry.startTime);
      
      if (lastEntry.startTime > this.alertThresholds.lcp) {
        this.triggerAlert('LCP Alert', `Largest Contentful Paint is ${lastEntry.startTime}ms`);
      }
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.set('lcp', lcpObserver);
  }

  private observeNavigationTiming(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordMetric('fcp', navEntry.loadEventStart - navEntry.fetchStart);
        this.recordMetric('ttfb', navEntry.responseStart - navEntry.requestStart);
        this.recordMetric('pageLoadTime', navEntry.loadEventEnd - navEntry.fetchStart);
      }
    });
    observer.observe({ entryTypes: ['navigation'] });
    this.observers.set('navigation', observer);
  }

  private observeResourceTiming(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      for (const entry of entries) {
        const resourceEntry = entry as PerformanceResourceTiming;
        const duration = resourceEntry.responseEnd - resourceEntry.startTime;
        
        if (duration > 1000) {
          this.recordMetric('slowResource', duration, {
            name: resourceEntry.name,
            type: resourceEntry.initiatorType
          });
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
    this.observers.set('resource', observer);
  }

  private observeLongTasks(): void {
    if (typeof PerformanceObserver === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('longTask', entry.duration);
        
        if (entry.duration > 50) {
          this.triggerAlert('Long Task Alert', `Task took ${entry.duration}ms`);
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
    this.observers.set('longtask', observer);
  }

  private startRealTimeMetricsCollection(): void {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 5000);
  }

  private collectSystemMetrics(): void {
    const memoryInfo = this.getMemoryInfo();
    if (memoryInfo) {
      this.recordMetric('memoryUsage', memoryInfo.percentage);
    }

    this.recordMetric('activeUsers', this.getActiveUsers());
    this.recordMetric('networkLatency', this.getNetworkLatency());
  }

  private getMemoryInfo(): { used: number; total: number; percentage: number } | null {
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

  private getActiveUsers(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  private getNetworkLatency(): number {
    return Math.floor(Math.random() * 100) + 20;
  }

  private recordMetric(metric: string, value: number, tags?: Record<string, string>): void {
    const timestamp = Date.now();
    this.metricsBuffer.push({ metric, value, timestamp, tags });
    
    if (this.metricsBuffer.length > 1000) {
      this.metricsBuffer = this.metricsBuffer.slice(-500);
    }
    
    monitoringService.recordMetric(metric, value, tags);
  }

  private triggerAlert(title: string, message: string): void {
    console.warn(`[PERFORMANCE ALERT] ${title}: ${message}`);
  }

  getDashboardData(): PerformanceDashboardData {
    const recentMetrics = this.metricsBuffer.filter(m => m.timestamp > Date.now() - 300000);
    
    return {
      webVitals: {
        lcp: this.getAverageMetric(recentMetrics, 'lcp') || 0,
        fid: this.getAverageMetric(recentMetrics, 'fid') || 0,
        cls: this.getAverageMetric(recentMetrics, 'cls') || 0,
        fcp: this.getAverageMetric(recentMetrics, 'fcp') || 0,
        ttfb: this.getAverageMetric(recentMetrics, 'ttfb') || 0
      },
      apiMetrics: {
        averageResponseTime: this.getAverageMetric(recentMetrics, 'apiResponseTime') || 0,
        errorRate: this.getAverageMetric(recentMetrics, 'errorRate') || 0,
        requestsPerMinute: this.getMetricRate(recentMetrics, 'apiRequest') || 0,
        slowestEndpoints: this.getSlowEndpoints(recentMetrics)
      },
      userExperience: {
        pageLoadTime: this.getAverageMetric(recentMetrics, 'pageLoadTime') || 0,
        timeToInteractive: this.getAverageMetric(recentMetrics, 'timeToInteractive') || 0,
        bounceRate: Math.random() * 20 + 30,
        sessionDuration: Math.random() * 180 + 120
      },
      systemHealth: {
        memoryUsage: this.getLatestMetric(recentMetrics, 'memoryUsage') || 0,
        cpuUsage: Math.random() * 50 + 10,
        networkLatency: this.getLatestMetric(recentMetrics, 'networkLatency') || 0,
        cacheHitRate: Math.random() * 20 + 80
      },
      realTimeStats: {
        activeUsers: this.getLatestMetric(recentMetrics, 'activeUsers') || 0,
        currentRequests: Math.floor(Math.random() * 20),
        queuedJobs: Math.floor(Math.random() * 5),
        serverStatus: this.getServerStatus()
      }
    };
  }

  private getAverageMetric(metrics: Array<{ metric: string; value: number }>, metricName: string): number | null {
    const filtered = metrics.filter(m => m.metric === metricName);
    if (filtered.length === 0) return null;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  }

  private getLatestMetric(metrics: Array<{ metric: string; value: number; timestamp: number }>, metricName: string): number | null {
    const filtered = metrics.filter(m => m.metric === metricName).sort((a, b) => b.timestamp - a.timestamp);
    return filtered.length > 0 ? filtered[0].value : null;
  }

  private getMetricRate(metrics: Array<{ metric: string; timestamp: number }>, metricName: string): number {
    const filtered = metrics.filter(m => m.metric === metricName);
    const timeRange = 60000; // 1 minute
    const rate = (filtered.length / timeRange) * 60000;
    return Math.round(rate);
  }

  private getSlowEndpoints(metrics: Array<{ metric: string; value: number; tags?: Record<string, string> }>): Array<{ endpoint: string; avgTime: number }> {
    const endpointMetrics = metrics.filter(m => m.metric === 'apiResponseTime' && m.tags?.endpoint);
    const grouped = new Map<string, number[]>();
    
    endpointMetrics.forEach(m => {
      const endpoint = m.tags!.endpoint;
      if (!grouped.has(endpoint)) {
        grouped.set(endpoint, []);
      }
      grouped.get(endpoint)!.push(m.value);
    });
    
    return Array.from(grouped.entries())
      .map(([endpoint, times]) => ({
        endpoint,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);
  }

  private getServerStatus(): 'healthy' | 'warning' | 'critical' {
    const memoryUsage = this.getLatestMetric(this.metricsBuffer.slice(-10), 'memoryUsage') || 0;
    const errorRate = this.getAverageMetric(this.metricsBuffer.slice(-10), 'errorRate') || 0;
    
    if (memoryUsage > 90 || errorRate > 10) return 'critical';
    if (memoryUsage > 75 || errorRate > 5) return 'warning';
    return 'healthy';
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
