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

class MonitoringService {
  private metrics = new Map<string, MetricData[]>();

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
}

export const monitoringService = new MonitoringService();
