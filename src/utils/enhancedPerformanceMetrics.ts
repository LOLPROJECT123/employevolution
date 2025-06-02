
import { monitoringService } from '@/services/monitoringService';

interface DetailedMetrics {
  componentRenders: { [componentName: string]: number };
  apiCalls: { [endpoint: string]: { count: number; totalDuration: number; errors: number } };
  userInteractions: { [action: string]: number };
  formValidations: { [field: string]: { validations: number; errors: number } };
  cacheHits: { [key: string]: number };
  cacheMisses: { [key: string]: number };
}

export class EnhancedPerformanceMetrics {
  private static metrics: DetailedMetrics = {
    componentRenders: {},
    apiCalls: {},
    userInteractions: {},
    formValidations: {},
    cacheHits: {},
    cacheMisses: {}
  };

  // Track component render performance
  static trackComponentRender(componentName: string, renderTime: number): void {
    this.metrics.componentRenders[componentName] = 
      (this.metrics.componentRenders[componentName] || 0) + 1;
    
    monitoringService.recordMetric(`component_render_${componentName}`, renderTime, {
      type: 'performance',
      category: 'component'
    });
  }

  // Track API call performance
  static trackApiCall(endpoint: string, duration: number, success: boolean): void {
    if (!this.metrics.apiCalls[endpoint]) {
      this.metrics.apiCalls[endpoint] = { count: 0, totalDuration: 0, errors: 0 };
    }
    
    this.metrics.apiCalls[endpoint].count++;
    this.metrics.apiCalls[endpoint].totalDuration += duration;
    
    if (!success) {
      this.metrics.apiCalls[endpoint].errors++;
    }
    
    monitoringService.recordMetric(`api_call_${endpoint}`, duration, {
      type: 'api',
      success: success.toString()
    });
  }

  // Track user interactions
  static trackUserInteraction(action: string, metadata?: any): void {
    this.metrics.userInteractions[action] = 
      (this.metrics.userInteractions[action] || 0) + 1;
    
    monitoringService.recordMetric(`user_interaction_${action}`, 1, {
      type: 'interaction',
      ...metadata
    });
  }

  // Track form validation performance
  static trackFormValidation(field: string, validationTime: number, hasError: boolean): void {
    if (!this.metrics.formValidations[field]) {
      this.metrics.formValidations[field] = { validations: 0, errors: 0 };
    }
    
    this.metrics.formValidations[field].validations++;
    
    if (hasError) {
      this.metrics.formValidations[field].errors++;
    }
    
    monitoringService.recordMetric(`validation_${field}`, validationTime, {
      type: 'validation',
      hasError: hasError.toString()
    });
  }

  // Track cache performance
  static trackCacheHit(key: string): void {
    this.metrics.cacheHits[key] = (this.metrics.cacheHits[key] || 0) + 1;
    
    monitoringService.recordMetric('cache_hit', 1, {
      type: 'cache',
      key: key.substring(0, 20) // Limit key length for metrics
    });
  }

  static trackCacheMiss(key: string): void {
    this.metrics.cacheMisses[key] = (this.metrics.cacheMisses[key] || 0) + 1;
    
    monitoringService.recordMetric('cache_miss', 1, {
      type: 'cache',
      key: key.substring(0, 20)
    });
  }

  // Get comprehensive performance report
  static getPerformanceReport(): any {
    const totalRenders = Object.values(this.metrics.componentRenders)
      .reduce((sum, count) => sum + count, 0);
    
    const totalApiCalls = Object.values(this.metrics.apiCalls)
      .reduce((sum, api) => sum + api.count, 0);
    
    const totalCacheHits = Object.values(this.metrics.cacheHits)
      .reduce((sum, count) => sum + count, 0);
    
    const totalCacheMisses = Object.values(this.metrics.cacheMisses)
      .reduce((sum, count) => sum + count, 0);
    
    const cacheHitRate = totalCacheHits / (totalCacheHits + totalCacheMisses) * 100;

    return {
      summary: {
        totalRenders,
        totalApiCalls,
        cacheHitRate: Math.round(cacheHitRate),
        totalInteractions: Object.values(this.metrics.userInteractions)
          .reduce((sum, count) => sum + count, 0)
      },
      slowestComponents: Object.entries(this.metrics.componentRenders)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, renders: count })),
      slowestApis: Object.entries(this.metrics.apiCalls)
        .map(([endpoint, data]) => ({
          endpoint,
          averageTime: Math.round(data.totalDuration / data.count),
          errorRate: Math.round((data.errors / data.count) * 100)
        }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 5),
      mostValidatedFields: Object.entries(this.metrics.formValidations)
        .map(([field, data]) => ({
          field,
          validations: data.validations,
          errorRate: Math.round((data.errors / data.validations) * 100)
        }))
        .sort((a, b) => b.validations - a.validations)
        .slice(0, 5),
      topInteractions: Object.entries(this.metrics.userInteractions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count }))
    };
  }

  // Clear metrics (useful for testing)
  static clearMetrics(): void {
    this.metrics = {
      componentRenders: {},
      apiCalls: {},
      userInteractions: {},
      formValidations: {},
      cacheHits: {},
      cacheMisses: {}
    };
  }

  // Export metrics for analysis
  static exportMetrics(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      report: this.getPerformanceReport()
    }, null, 2);
  }
}
