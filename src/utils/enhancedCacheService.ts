
import { cacheService } from '@/services/cacheService';
import { monitoringService } from '@/services/monitoringService';

interface CacheOptions {
  ttl?: number;
  refreshInBackground?: boolean;
  onStale?: (key: string) => Promise<any>;
}

export class EnhancedCacheService {
  private static backgroundRefreshTasks = new Map<string, Promise<any>>();

  static async getWithRefresh<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const timer = monitoringService.startTimer('cache_get_with_refresh');
    
    try {
      const cached = cacheService.get<T>(key);
      
      if (cached) {
        // If background refresh is enabled and we have a stale callback
        if (options.refreshInBackground && options.onStale) {
          this.maybeRefreshInBackground(key, fetcher, options);
        }
        return cached;
      }

      // Cache miss - fetch fresh data
      const fresh = await fetcher();
      cacheService.set(key, fresh, options.ttl);
      return fresh;
    } finally {
      timer();
    }
  }

  private static async maybeRefreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions
  ) {
    // Prevent multiple background refreshes for the same key
    if (this.backgroundRefreshTasks.has(key)) {
      return;
    }

    const refreshTask = (async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        const fresh = await fetcher();
        cacheService.set(key, fresh, options.ttl);
        options.onStale?.(key);
      } catch (error) {
        console.warn(`Background refresh failed for ${key}:`, error);
      } finally {
        this.backgroundRefreshTasks.delete(key);
      }
    })();

    this.backgroundRefreshTasks.set(key, refreshTask);
  }

  static warmCache(entries: Array<{ key: string; fetcher: () => Promise<any>; ttl?: number }>) {
    return Promise.allSettled(
      entries.map(async ({ key, fetcher, ttl }) => {
        try {
          const data = await fetcher();
          cacheService.set(key, data, ttl);
        } catch (error) {
          console.warn(`Cache warming failed for ${key}:`, error);
        }
      })
    );
  }

  static invalidatePattern(pattern: RegExp) {
    // This is a simplified implementation - in production you'd want proper pattern matching
    const stats = cacheService.getStats();
    console.log(`Invalidating cache entries matching pattern: ${pattern}`);
    cacheService.clear(); // For now, clear all - could be optimized
  }

  static getMemoryUsage() {
    return cacheService.getStats();
  }
}
