
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
  const [cachedData, setCachedData] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    loadPendingActions();
    loadCachedData();

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const syncInterval = setInterval(() => {
      if (navigator.onLine && pendingActions.length > 0) {
        syncPendingActions();
      }
    }, 30000);

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

  const loadCachedData = () => {
    try {
      const stored = localStorage.getItem('offlineCachedData');
      if (stored) {
        const data = JSON.parse(stored);
        setCachedData(new Map(Object.entries(data)));
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const savePendingActions = (actions: OfflineAction[]) => {
    try {
      localStorage.setItem('offlinePendingActions', JSON.stringify(actions));
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  };

  const saveCachedData = (data: Map<string, any>) => {
    try {
      const obj = Object.fromEntries(data);
      localStorage.setItem('offlineCachedData', JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  };

  const cacheData = (key: string, data: any) => {
    const newCachedData = new Map(cachedData);
    newCachedData.set(key, data);
    setCachedData(newCachedData);
    saveCachedData(newCachedData);
  };

  const getCachedData = (key: string) => {
    return cachedData.get(key);
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

    EnhancedMobileService.addToSyncQueue(type, table, data);

    if (isOnline) {
      syncPendingActions();
    }

    return action.id;
  };

  const addPendingAction = (actionType: string, data: any) => {
    return addOfflineAction('create', 'general_actions', { actionType, ...data });
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
          updateActionStatus(action.id, 'syncing');
          await performSyncOperation(action);
          updateActionStatus(action.id, 'completed');
          return { id: action.id, success: true };
        } catch (error) {
          console.error(`Failed to sync action ${action.id}:`, error);
          
          const updatedAction = {
            ...action,
            retries: action.retries + 1,
            status: action.retries >= 2 ? 'failed' as const : 'pending' as const
          };
          
          updateActionInList(updatedAction);
          return { id: action.id, success: false, error };
        }
      });

      const results = await Promise.allSettled(syncPromises);
      
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
      
      setTimeout(() => setSyncStatus('idle'), 2000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const performSyncOperation = async (action: OfflineAction) => {
    const { type, table, data } = action;
    
    // Import supabase dynamically
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Type-safe table operations using known table names
    const validTables = [
      'achievements', 'activities_leadership', 'api_usage_logs', 'application_events',
      'ats_integrations', 'audit_logs', 'career_paths', 'communications', 'contacts',
      'company_insights', 'conversion_events', 'cover_letters', 'document_usage',
      'education', 'email_logs', 'email_templates', 'encryption_keys',
      'follow_up_sequence_steps', 'follow_up_sequences', 'github_repositories',
      'interview_questions', 'interviews', 'job_alerts', 'job_applications',
      'job_preferences', 'job_recommendations', 'navigation_analytics',
      'notification_preferences', 'notifications', 'oauth_integrations',
      'peer_reviews', 'professional_development', 'profile_completion_tracking',
      'profiles', 'projects', 'push_subscriptions', 'rate_limits', 'reminders',
      'resume_versions', 'resumes', 'review_feedback', 'saved_jobs', 'saved_searches',
      'security_events', 'user_2fa', 'user_consents', 'user_documents',
      'user_languages', 'user_metrics', 'user_onboarding', 'user_profiles',
      'user_resume_files', 'user_skills'
    ];

    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    switch (type) {
      case 'create':
        const { error: createError } = await (supabase as any).from(table).insert(data);
        if (createError) throw createError;
        break;
        
      case 'update':
        const { error: updateError } = await (supabase as any)
          .from(table)
          .update(data)
          .eq('id', data.id);
        if (updateError) throw updateError;
        break;
        
      case 'delete':
        const { error: deleteError } = await (supabase as any)
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
    addPendingAction,
    syncPendingActions,
    clearFailedActions,
    retryFailedActions,
    getOfflineStats,
    cacheData,
    getCachedData
  };
};
