
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingSync: number;
  syncInProgress: boolean;
  syncErrors: string[];
  cachedDataSize: number;
}

interface ConflictResolution {
  id: string;
  type: 'profile' | 'application' | 'job';
  localData: any;
  serverData: any;
  timestamp: Date;
}

const OfflineSyncIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    lastSync: null,
    pendingSync: 0,
    syncInProgress: false,
    syncErrors: [],
    cachedDataSize: 0
  });

  const [conflicts, setConflicts] = useState<ConflictResolution[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Monitor online status
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }));
      toast.success('Connection restored - syncing data...');
      performSync();
    };

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
      toast.info('Working offline - changes will sync when connection is restored');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initialize sync status
    loadSyncStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadSyncStatus = async () => {
    try {
      // Load from localStorage
      const storedStatus = localStorage.getItem('syncStatus');
      const storedConflicts = localStorage.getItem('syncConflicts');
      
      if (storedStatus) {
        const status = JSON.parse(storedStatus);
        setSyncStatus(prev => ({
          ...prev,
          ...status,
          lastSync: status.lastSync ? new Date(status.lastSync) : null
        }));
      }

      if (storedConflicts) {
        const conflictData = JSON.parse(storedConflicts);
        setConflicts(conflictData.map((c: any) => ({
          ...c,
          timestamp: new Date(c.timestamp)
        })));
      }

      // Calculate cached data size
      const cacheSize = await calculateCacheSize();
      setSyncStatus(prev => ({ ...prev, cachedDataSize: cacheSize }));

    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const calculateCacheSize = async (): Promise<number> => {
    try {
      let totalSize = 0;
      const cacheKeys = ['profileData', 'jobsCache', 'applicationsCache', 'offlineQueue'];
      
      cacheKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += new Blob([data]).size;
        }
      });

      return totalSize;
    } catch (error) {
      return 0;
    }
  };

  const performSync = async () => {
    if (!syncStatus.isOnline || syncStatus.syncInProgress) return;

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, syncErrors: [] }));

    try {
      // Get offline queue
      const offlineQueue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
      
      if (offlineQueue.length === 0) {
        setSyncStatus(prev => ({
          ...prev,
          syncInProgress: false,
          lastSync: new Date(),
          pendingSync: 0
        }));
        saveSyncStatus();
        return;
      }

      let synced = 0;
      const errors: string[] = [];

      for (const item of offlineQueue) {
        try {
          await syncItem(item);
          synced++;
        } catch (error) {
          console.error('Sync error for item:', item, error);
          errors.push(`Failed to sync ${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Remove synced items from queue
      const remainingQueue = offlineQueue.slice(synced);
      localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));

      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSync: new Date(),
        pendingSync: remainingQueue.length,
        syncErrors: errors
      }));

      if (synced > 0) {
        toast.success(`Synced ${synced} items successfully`);
      }

      if (errors.length > 0) {
        toast.error(`${errors.length} items failed to sync`);
      }

    } catch (error) {
      console.error('Sync operation failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        syncErrors: ['Sync operation failed']
      }));
      toast.error('Sync failed - will retry automatically');
    }

    saveSyncStatus();
  };

  const syncItem = async (item: any): Promise<void> => {
    // Mock sync implementation - replace with actual API calls
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% success rate
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 100);
    });
  };

  const saveSyncStatus = () => {
    localStorage.setItem('syncStatus', JSON.stringify({
      ...syncStatus,
      lastSync: syncStatus.lastSync?.toISOString()
    }));
  };

  const resolveConflict = (conflictId: string, useLocal: boolean) => {
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
    
    // Save resolution choice
    const updatedConflicts = conflicts.filter(c => c.id !== conflictId);
    localStorage.setItem('syncConflicts', JSON.stringify(updatedConflicts));
    
    toast.success(`Conflict resolved using ${useLocal ? 'local' : 'server'} data`);
  };

  const clearCache = async () => {
    try {
      const cacheKeys = ['profileData', 'jobsCache', 'applicationsCache'];
      cacheKeys.forEach(key => localStorage.removeItem(key));
      
      const newSize = await calculateCacheSize();
      setSyncStatus(prev => ({ ...prev, cachedDataSize: newSize }));
      
      toast.success('Cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatLastSync = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Main Status Indicator */}
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {syncStatus.isOnline ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">
                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                  </span>
                  
                  {syncStatus.syncInProgress && (
                    <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                  )}
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Last sync: {formatLastSync(syncStatus.lastSync)}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {syncStatus.pendingSync > 0 && (
                <Badge variant="outline" className="bg-yellow-50">
                  <Clock className="h-3 w-3 mr-1" />
                  {syncStatus.pendingSync} pending
                </Badge>
              )}
              
              {syncStatus.syncErrors.length > 0 && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {syncStatus.syncErrors.length} errors
                </Badge>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowDetails(!showDetails)}
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Sync Conflicts ({conflicts.length})</span>
              </div>
              
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="border rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium">
                    {conflict.type} conflict - {conflict.timestamp.toLocaleString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConflict(conflict.id, true)}
                    >
                      Use Local
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => resolveConflict(conflict.id, false)}
                    >
                      Use Server
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Information */}
      {showDetails && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">Connection Status</div>
                <div className="text-muted-foreground">
                  {syncStatus.isOnline ? 'Connected' : 'Offline'}
                </div>
              </div>
              
              <div>
                <div className="font-medium">Cached Data</div>
                <div className="text-muted-foreground">
                  {formatFileSize(syncStatus.cachedDataSize)}
                </div>
              </div>
              
              <div>
                <div className="font-medium">Pending Sync</div>
                <div className="text-muted-foreground">
                  {syncStatus.pendingSync} items
                </div>
              </div>
              
              <div>
                <div className="font-medium">Last Error</div>
                <div className="text-muted-foreground">
                  {syncStatus.syncErrors.length > 0 
                    ? syncStatus.syncErrors[syncStatus.syncErrors.length - 1]
                    : 'None'
                  }
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <Button
                size="sm"
                onClick={performSync}
                disabled={syncStatus.syncInProgress || !syncStatus.isOnline}
              >
                {syncStatus.syncInProgress ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={clearCache}
              >
                <Database className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OfflineSyncIndicator;
