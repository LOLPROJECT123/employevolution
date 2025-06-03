
import { useState, useEffect, useCallback } from 'react';

interface PendingAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from localStorage
    const saved = localStorage.getItem('pendingActions');
    if (saved) {
      setPendingActions(JSON.parse(saved));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheData = useCallback((key: string, data: any, expireHours = 24) => {
    const cacheItem = {
      data,
      timestamp: Date.now(),
      expireTime: Date.now() + (expireHours * 60 * 60 * 1000)
    };
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheItem));
  }, []);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    const cached = localStorage.getItem(`cache_${key}`);
    if (!cached) return null;

    try {
      const cacheItem = JSON.parse(cached);
      if (Date.now() > cacheItem.expireTime) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }
      return cacheItem.data;
    } catch {
      return null;
    }
  }, []);

  const addPendingAction = useCallback((type: string, data: any) => {
    const action: PendingAction = {
      id: Date.now().toString(),
      type,
      data,
      timestamp: Date.now()
    };

    const updated = [...pendingActions, action];
    setPendingActions(updated);
    localStorage.setItem('pendingActions', JSON.stringify(updated));
  }, [pendingActions]);

  const syncPendingActions = useCallback(async () => {
    if (!isOnline || pendingActions.length === 0) return;

    // Simulate syncing pending actions
    console.log('Syncing pending actions:', pendingActions);
    
    // Clear pending actions after sync
    setPendingActions([]);
    localStorage.removeItem('pendingActions');
  }, [isOnline, pendingActions]);

  return {
    isOnline,
    cacheData,
    getCachedData,
    addPendingAction,
    syncPendingActions,
    pendingActions
  };
};
