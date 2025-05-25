interface StorageItem {
  id: string;
  data: any;
  timestamp: number;
  expiry?: number;
}

class DatabaseService {
  private storagePrefix = 'emploevolution_';

  // Generic storage methods
  set<T>(key: string, data: T, expiryHours?: number): void {
    const item: StorageItem = {
      id: key,
      data,
      timestamp: Date.now(),
      expiry: expiryHours ? Date.now() + (expiryHours * 60 * 60 * 1000) : undefined
    };

    try {
      localStorage.setItem(this.storagePrefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      this.cleanup();
      try {
        localStorage.setItem(this.storagePrefix + key, JSON.stringify(item));
      } catch (retryError) {
        console.error('Failed to save after cleanup:', retryError);
      }
    }
  }

  get<T>(key: string): T | null {
    try {
      const stored = localStorage.getItem(this.storagePrefix + key);
      if (!stored) return null;

      const item: StorageItem = JSON.parse(stored);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.error('Failed to retrieve from localStorage:', error);
      return null;
    }
  }

  remove(key: string): void {
    localStorage.removeItem(this.storagePrefix + key);
  }

  // Cleanup expired items and free space
  cleanup(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.storagePrefix)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const item: StorageItem = JSON.parse(stored);
            if (item.expiry && Date.now() > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Specific data management methods
  saveJobs(jobs: any[], cacheKey: string = 'jobs'): void {
    this.set(cacheKey, jobs, 1); // Cache for 1 hour
  }

  getJobs(cacheKey: string = 'jobs'): any[] {
    return this.get<any[]>(cacheKey) || [];
  }

  saveUserProfile(userId: string, profile: any): void {
    this.set(`user_profile_${userId}`, profile);
  }

  getUserProfile(userId: string): any {
    return this.get(`user_profile_${userId}`);
  }

  saveApplicationHistory(userId: string, applications: any[]): void {
    this.set(`applications_${userId}`, applications);
  }

  getApplicationHistory(userId: string): any[] {
    return this.get<any[]>(`applications_${userId}`) || [];
  }

  saveSearchHistory(userId: string, searches: any[]): void {
    // Keep only last 50 searches
    const limitedSearches = searches.slice(-50);
    this.set(`search_history_${userId}`, limitedSearches);
  }

  getSearchHistory(userId: string): any[] {
    return this.get<any[]>(`search_history_${userId}`) || [];
  }

  addToSearchHistory(userId: string, searchTerm: string, filters: any): void {
    const history = this.getSearchHistory(userId);
    const newSearch = {
      id: `search-${Date.now()}`,
      term: searchTerm,
      filters,
      timestamp: new Date().toISOString()
    };
    
    // Remove duplicate searches
    const filtered = history.filter(h => 
      h.term !== searchTerm || JSON.stringify(h.filters) !== JSON.stringify(filters)
    );
    
    filtered.push(newSearch);
    this.saveSearchHistory(userId, filtered);
  }

  // Application tracking
  trackApplicationMetrics(userId: string): any {
    const applications = this.getApplicationHistory(userId);
    const total = applications.length;
    const responses = applications.filter(app => 
      ['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;
    const interviews = applications.filter(app => 
      ['interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;
    const offers = applications.filter(app => 
      ['offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    return {
      totalApplications: total,
      responseRate: total > 0 ? (responses / total) * 100 : 0,
      interviewRate: total > 0 ? (interviews / total) * 100 : 0,
      offerRate: total > 0 ? (offers / total) * 100 : 0,
      averageResponseTime: this.calculateAverageResponseTime(applications)
    };
  }

  private calculateAverageResponseTime(applications: any[]): number {
    const respondedApps = applications.filter(app => 
      app.status !== 'applied' && app.updated_at !== app.applied_at
    );

    if (respondedApps.length === 0) return 0;

    const totalTime = respondedApps.reduce((sum, app) => {
      const applied = new Date(app.applied_at).getTime();
      const updated = new Date(app.updated_at).getTime();
      return sum + (updated - applied);
    }, 0);

    const avgMilliseconds = totalTime / respondedApps.length;
    return Math.round(avgMilliseconds / (1000 * 60 * 60 * 24)); // Convert to days
  }

  // Data export for backup
  exportUserData(userId: string): any {
    return {
      profile: this.getUserProfile(userId),
      applications: this.getApplicationHistory(userId),
      searchHistory: this.getSearchHistory(userId),
      exportDate: new Date().toISOString()
    };
  }

  // Import user data
  importUserData(userId: string, data: any): void {
    if (data.profile) this.saveUserProfile(userId, data.profile);
    if (data.applications) this.saveApplicationHistory(userId, data.applications);
    if (data.searchHistory) this.saveSearchHistory(userId, data.searchHistory);
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0;
    for (let key in localStorage) {
      if (key.startsWith(this.storagePrefix)) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }

    const maxStorage = 5 * 1024 * 1024; // 5MB typical limit
    return {
      used,
      available: maxStorage - used,
      percentage: (used / maxStorage) * 100
    };
  }
}

export const databaseService = new DatabaseService();
