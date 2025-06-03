
import { useState, useEffect } from 'react';
import { EnhancedMobileService, OfflineSyncQueue } from '@/services/enhancedMobileService';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  retries: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([]);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // Load pending actions from localStorage
    loadPendingActions();

    // Set up online/offline event listeners
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic sync when online
    const syncInterval = setInterval(() => {
      if (navigator.onLine && pendingActions.length > 0) {
        syncPendingActions();
      }
    }, 30000); // Sync every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(syncInterval);
    };
  }, []);

  const loadPendingActions = () => {
    try {
      const stored = localStorage.getItem('offlinePendingActions');
      if (stored) {
        const actions: OfflineAction[] = JSON.parse(stored);
        setPendingActions(actions);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('offlinePendingActions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const addOfflineAction = (
    type: 'create' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
      status: 'pending'
    };

    const newActions = [...pendingActions, action];
    setPendingActions(newActions);
    savePendingActions(newActions);

    // Add to mobile service queue as well
    EnhancedMobileService.addToSyncQueue(type, table, data);

    // Try to sync immediately if online
    if (isOnline) {
      syncPendingActions();
    }

    return action.id;
  };

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0 || syncStatus === 'syncing') {
      return;
    }

    setSyncStatus('syncing');
    
    try {
      const actionsToSync = pendingActions.filter(action => 
        action.status === 'pending' || action.status === 'failed'
      );

      const syncPromises = actionsToSync.map(async (action) => {
        try {
          // Update action status to syncing
          updateActionStatus(action.id, 'syncing');

          // Perform the sync operation
          await performSyncOperation(action);

          // Mark as completed
          updateActionStatus(action.id, 'completed');
          
          return { id: action.id, success: true };
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          // Increment retry count
          const updatedAction = {
            ...action,
            retries: action.retries + 1,
            status: action.retries >= 2 ? 'failed' : 'pending' as const
          };
          
          updateActionInList(updatedAction);
          
          return { id: action.id, success: false, error };
        }
      });

      const results = await Promise.allSettled(syncPromises);
      
      // Remove completed actions
      const completedActionIds = results
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<any>).value.id);

      if (completedActionIds.length > 0) {
        const remainingActions = pendingActions.filter(
          action => !completedActionIds.includes(action.id)
        );
        setPendingActions(remainingActions);
        savePendingActions(remainingActions);
      }

      setSyncStatus('completed');
      setLastSyncTime(new Date().toISOString());
      
      // Reset to idle after a brief delay
      setTimeout(() => setSyncStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      // Reset to idle after error display
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const performSyncOperation = async (action: OfflineAction) => {
    const { type, table, data } = action;
    
    // Import supabase dynamically to avoid issues
    const { supabase } = await import('@/integrations/supabase/client');
    
    switch (type) {
      case 'create':
        const { error: createError } = await supabase.from(table).insert(data);
        if (createError) throw createError;
        break;
        
      case 'update':
        const { error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;
        
      case 'delete':
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);
        if (deleteError) throw deleteError;
        break;
        
      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  };

  const updateActionStatus = (actionId: string, status: OfflineAction['status']) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === actionId ? { ...action, status } : action
      )
    );
  };

  const updateActionInList = (updatedAction: OfflineAction) => {
    setPendingActions(prev => 
      prev.map(action => 
        action.id === updatedAction.id ? updatedAction : action
      )
    );
  };

  const clearFailedActions = () => {
    const remainingActions = pendingActions.filter(action => action.status !== 'failed');
    setPendingActions(remainingActions);
    savePendingActions(remainingActions);
  };

  const retryFailedActions = () => {
    const updatedActions = pendingActions.map(action => 
      action.status === 'failed' 
        ? { ...action, status: 'pending' as const, retries: 0 }
        : action
    );
    setPendingActions(updatedActions);
    savePendingActions(updatedActions);
    
    if (isOnline) {
      syncPendingActions();
    }
  };

  const getOfflineStats = () => {
    const pending = pendingActions.filter(a => a.status === 'pending').length;
    const syncing = pendingActions.filter(a => a.status === 'syncing').length;
    const failed = pendingActions.filter(a => a.status === 'failed').length;
    const completed = pendingActions.filter(a => a.status === 'completed').length;
    
    return { pending, syncing, failed, completed, total: pendingActions.length };
  };

  return {
    isOnline,
    pendingActions,
    syncStatus,
    lastSyncTime,
    addOfflineAction,
    syncPendingActions,
    clearFailedActions,
    retryFailedActions,
    getOfflineStats
  };
};
