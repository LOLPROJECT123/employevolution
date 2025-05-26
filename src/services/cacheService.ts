
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
  hits: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes
  private readonly maxCacheSize = 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      hits: 0
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    // Track cache hits
    item.hits++;
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Cache jobs data
  cacheJobs(jobs: any[], searchKey: string, ttl?: number): void {
    this.set(`jobs:${searchKey}`, jobs, ttl);
  }

  getCachedJobs(searchKey: string): any[] | null {
    return this.get<any[]>(`jobs:${searchKey}`);
  }

  // Cache user profile
  cacheUserProfile(userId: string, profile: any, ttl?: number): void {
    this.set(`profile:${userId}`, profile, ttl);
  }

  getCachedUserProfile(userId: string): any | null {
    return this.get(`profile:${userId}`);
  }

  // Cache application metrics
  cacheApplicationMetrics(userId: string, metrics: any, ttl?: number): void {
    this.set(`metrics:${userId}`, metrics, ttl);
  }

  getCachedApplicationMetrics(userId: string): any | null {
    return this.get(`metrics:${userId}`);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime) {
        oldestTime = item.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    hitRate: number;
    memory: number;
  } {
    let totalHits = 0;
    let totalRequests = 0;
    
    for (const item of this.cache.values()) {
      totalHits += item.hits;
      totalRequests += item.hits + 1; // +1 for the initial set
    }
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0,
      memory: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): number {
    let memory = 0;
    for (const [key, item] of this.cache.entries()) {
      memory += key.length * 2; // rough estimate for key
      memory += JSON.stringify(item.data).length * 2; // rough estimate for data
    }
    return memory;
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.clear();
  }
}

export const cacheService = new CacheService();
