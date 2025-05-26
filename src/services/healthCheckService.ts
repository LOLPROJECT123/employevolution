
interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  timestamp: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  uptime: number;
  version: string;
  timestamp: number;
}

class HealthCheckService {
  private startTime = Date.now();
  private version = '1.0.0';

  async performHealthCheck(): Promise<SystemHealth> {
    const checks: HealthCheck[] = [];

    // Database connectivity check
    checks.push(await this.checkDatabase());

    // Storage check
    checks.push(await this.checkStorage());

    // Memory check
    checks.push(await this.checkMemory());

    // Network connectivity check
    checks.push(await this.checkNetwork());

    // Cache service check
    checks.push(await this.checkCache());

    // Calculate overall status
    const failedChecks = checks.filter(check => check.status === 'fail').length;
    const warnChecks = checks.filter(check => check.status === 'warn').length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks === 0 && warnChecks === 0) {
      status = 'healthy';
    } else if (failedChecks === 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      checks,
      uptime: Date.now() - this.startTime,
      version: this.version,
      timestamp: Date.now()
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      // Simple query to check database connectivity
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        return {
          name: 'database',
          status: 'fail',
          message: `Database error: ${error.message}`,
          timestamp: Date.now()
        };
      }

      return {
        name: 'database',
        status: 'pass',
        message: 'Database connection successful',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        name: 'database',
        status: 'fail',
        message: `Database check failed: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  private async checkStorage(): Promise<HealthCheck> {
    try {
      const testKey = 'health-check-test';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);

      if (value !== 'test') {
        return {
          name: 'storage',
          status: 'fail',
          message: 'Local storage not working correctly',
          timestamp: Date.now()
        };
      }

      return {
        name: 'storage',
        status: 'pass',
        message: 'Local storage working correctly',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        name: 'storage',
        status: 'fail',
        message: `Storage check failed: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  private async checkMemory(): Promise<HealthCheck> {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usagePercentage = (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;

        if (usagePercentage > 90) {
          return {
            name: 'memory',
            status: 'fail',
            message: `High memory usage: ${usagePercentage.toFixed(1)}%`,
            timestamp: Date.now()
          };
        } else if (usagePercentage > 75) {
          return {
            name: 'memory',
            status: 'warn',
            message: `Elevated memory usage: ${usagePercentage.toFixed(1)}%`,
            timestamp: Date.now()
          };
        }

        return {
          name: 'memory',
          status: 'pass',
          message: `Memory usage: ${usagePercentage.toFixed(1)}%`,
          timestamp: Date.now()
        };
      }

      return {
        name: 'memory',
        status: 'pass',
        message: 'Memory monitoring not available',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        name: 'memory',
        status: 'warn',
        message: `Memory check failed: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  private async checkNetwork(): Promise<HealthCheck> {
    try {
      const start = Date.now();
      const response = await fetch(window.location.origin, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const latency = Date.now() - start;

      if (!response.ok) {
        return {
          name: 'network',
          status: 'fail',
          message: `Network request failed: ${response.status}`,
          timestamp: Date.now()
        };
      }

      if (latency > 5000) {
        return {
          name: 'network',
          status: 'warn',
          message: `High network latency: ${latency}ms`,
          timestamp: Date.now()
        };
      }

      return {
        name: 'network',
        status: 'pass',
        message: `Network latency: ${latency}ms`,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        name: 'network',
        status: 'fail',
        message: `Network check failed: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  private async checkCache(): Promise<HealthCheck> {
    try {
      const { cacheService } = await import('./cacheService');
      const stats = cacheService.getStats();

      if (stats.memory > 50 * 1024 * 1024) { // 50MB
        return {
          name: 'cache',
          status: 'warn',
          message: `Cache memory usage high: ${(stats.memory / 1024 / 1024).toFixed(1)}MB`,
          timestamp: Date.now()
        };
      }

      return {
        name: 'cache',
        status: 'pass',
        message: `Cache size: ${stats.size} items, hit rate: ${stats.hitRate.toFixed(1)}%`,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        name: 'cache',
        status: 'warn',
        message: `Cache check failed: ${error}`,
        timestamp: Date.now()
      };
    }
  }

  // Run health check periodically
  startPeriodicHealthChecks(intervalMs = 60000): () => void {
    const interval = setInterval(async () => {
      const health = await this.performHealthCheck();
      
      if (health.status === 'unhealthy') {
        console.error('System health check failed:', health);
      } else if (health.status === 'degraded') {
        console.warn('System health degraded:', health);
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }
}

export const healthCheckService = new HealthCheckService();
