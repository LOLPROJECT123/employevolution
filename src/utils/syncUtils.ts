
import { Job, JobApplicationStatus } from '@/types/job';

export interface SyncStatus {
  lastSync: Date | null;
  isOnline: boolean;
  pendingChanges: number;
  syncInProgress: boolean;
}

export interface SyncableJobApplication {
  id: string;
  jobId: string;
  status: JobApplicationStatus;
  appliedAt: Date;
  lastModified: Date;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

class SyncUtilsService {
  private syncStatus: SyncStatus = {
    lastSync: null,
    isOnline: navigator.onLine,
    pendingChanges: 0,
    syncInProgress: false
  };

  private pendingApplications: SyncableJobApplication[] = [];

  constructor() {
    this.setupOnlineStatusListener();
    this.loadPendingChanges();
  }

  private setupOnlineStatusListener(): void {
    window.addEventListener('online', () => {
      this.syncStatus.isOnline = true;
      this.syncPendingChanges();
    });

    window.addEventListener('offline', () => {
      this.syncStatus.isOnline = false;
    });
  }

  private loadPendingChanges(): void {
    try {
      const stored = localStorage.getItem('pendingApplications');
      if (stored) {
        this.pendingApplications = JSON.parse(stored);
        this.syncStatus.pendingChanges = this.pendingApplications.length;
      }
    } catch (error) {
      console.error('Failed to load pending changes:', error);
    }
  }

  private savePendingChanges(): void {
    try {
      localStorage.setItem('pendingApplications', JSON.stringify(this.pendingApplications));
      this.syncStatus.pendingChanges = this.pendingApplications.length;
    } catch (error) {
      console.error('Failed to save pending changes:', error);
    }
  }

  addPendingApplication(application: Omit<SyncableJobApplication, 'syncStatus'>): void {
    const pendingApp: SyncableJobApplication = {
      ...application,
      syncStatus: 'pending'
    };

    const existingIndex = this.pendingApplications.findIndex(app => app.id === application.id);
    if (existingIndex >= 0) {
      this.pendingApplications[existingIndex] = pendingApp;
    } else {
      this.pendingApplications.push(pendingApp);
    }

    this.savePendingChanges();

    if (this.syncStatus.isOnline) {
      this.syncPendingChanges();
    }
  }

  async syncPendingChanges(): Promise<boolean> {
    if (this.syncStatus.syncInProgress || !this.syncStatus.isOnline || this.pendingApplications.length === 0) {
      return false;
    }

    this.syncStatus.syncInProgress = true;

    try {
      console.log(`Syncing ${this.pendingApplications.length} pending applications...`);

      // Simulate API sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark all as synced (in a real implementation, you'd sync with your backend)
      this.pendingApplications = this.pendingApplications.map(app => ({
        ...app,
        syncStatus: 'synced' as const
      }));

      // Clear synced applications
      this.pendingApplications = this.pendingApplications.filter(app => app.syncStatus !== 'synced');
      
      this.syncStatus.lastSync = new Date();
      this.savePendingChanges();

      console.log('Sync completed successfully');
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    } finally {
      this.syncStatus.syncInProgress = false;
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  getPendingApplications(): SyncableJobApplication[] {
    return [...this.pendingApplications];
  }

  clearPendingChanges(): void {
    this.pendingApplications = [];
    this.savePendingChanges();
  }

  // Check if application needs sync
  needsSync(applicationId: string): boolean {
    return this.pendingApplications.some(app => app.id === applicationId && app.syncStatus === 'pending');
  }

  // Force sync for specific application
  async forceSyncApplication(applicationId: string): Promise<boolean> {
    const app = this.pendingApplications.find(a => a.id === applicationId);
    if (!app) return false;

    try {
      // Simulate individual sync
      await new Promise(resolve => setTimeout(resolve, 500));
      
      app.syncStatus = 'synced';
      this.pendingApplications = this.pendingApplications.filter(a => a.id !== applicationId);
      this.savePendingChanges();
      
      return true;
    } catch (error) {
      console.error(`Failed to sync application ${applicationId}:`, error);
      return false;
    }
  }

  // Get offline capability status
  isOfflineCapable(): boolean {
    return 'serviceWorker' in navigator && 'caches' in window;
  }

  // Store job data for offline access
  async cacheJobData(jobs: Job[]): Promise<void> {
    if (!this.isOfflineCapable()) return;

    try {
      const cache = await caches.open('jobs-cache-v1');
      const jobsData = {
        timestamp: Date.now(),
        jobs: jobs
      };
      
      await cache.put('/api/jobs', new Response(JSON.stringify(jobsData)));
      console.log(`Cached ${jobs.length} jobs for offline access`);
    } catch (error) {
      console.error('Failed to cache job data:', error);
    }
  }

  // Retrieve cached job data
  async getCachedJobData(): Promise<Job[] | null> {
    if (!this.isOfflineCapable()) return null;

    try {
      const cache = await caches.open('jobs-cache-v1');
      const response = await cache.match('/api/jobs');
      
      if (response) {
        const data = await response.json();
        const cacheAge = Date.now() - data.timestamp;
        
        // Cache expires after 1 hour
        if (cacheAge < 60 * 60 * 1000) {
          console.log(`Retrieved ${data.jobs.length} jobs from cache`);
          return data.jobs;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to retrieve cached job data:', error);
      return null;
    }
  }
}

export const syncUtilsService = new SyncUtilsService();
