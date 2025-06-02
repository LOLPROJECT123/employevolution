
import { useState, useEffect } from 'react';
import { databaseService } from '@/services/databaseService';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  table: string;
  data: any;
  timestamp: number;
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending actions from storage
    loadPendingActions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadPendingActions = () => {
    const stored = databaseService.get<OfflineAction[]>('pending_actions') || [];
    setPendingActions(stored);
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    databaseService.set('pending_actions', actions);
    setPendingActions(actions);
  };

  const addPendingAction = (action: Omit<OfflineAction, 'id' | 'timestamp'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };

    const updated = [...pendingActions, newAction];
    savePendingActions(updated);
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    console.log(`Syncing ${pendingActions.length} pending actions...`);

    const failedActions: OfflineAction[] = [];

    for (const action of pendingActions) {
      try {
        await executeAction(action);
        console.log(`Synced action: ${action.type} ${action.table}`);
      } catch (error) {
        console.error(`Failed to sync action:`, error);
        failedActions.push(action);
      }
    }

    savePendingActions(failedActions);
  };

  const executeAction = async (action: OfflineAction): Promise<void> => {
    // This would integrate with your API/Supabase
    // For demo purposes, just logging
    console.log('Executing offline action:', action);

    // In a real implementation:
    // switch (action.type) {
    //   case 'CREATE':
    //     await supabase.from(action.table).insert(action.data);
    //     break;
    //   case 'UPDATE':
    //     await supabase.from(action.table).update(action.data).eq('id', action.data.id);
    //     break;
    //   case 'DELETE':
    //     await supabase.from(action.table).delete().eq('id', action.data.id);
    //     break;
    // }
  };

  const cacheData = (key: string, data: any, expiryHours = 24) => {
    databaseService.set(`offline_${key}`, data, expiryHours);
  };

  const getCachedData = <T>(key: string): T | null => {
    return databaseService.get<T>(`offline_${key}`);
  };

  const clearCache = () => {
    // Clear all offline cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('emploevolution_offline_')) {
        localStorage.removeItem(key);
      }
    });
  };

  return {
    isOnline,
    pendingActions: pendingActions.length,
    addPendingAction,
    syncPendingActions,
    cacheData,
    getCachedData,
    clearCache,
  };
};
