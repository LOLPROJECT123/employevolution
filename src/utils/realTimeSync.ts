
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface SyncState {
  isConnected: boolean;
  lastSync: Date | null;
  pendingChanges: any[];
  conflicts: any[];
}

export class RealTimeSyncService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static syncStates: Map<string, SyncState> = new Map();
  private static syncCallbacks: Map<string, Function[]> = new Map();

  // Subscribe to real-time profile changes
  static subscribeToProfileChanges(userId: string, callback: (change: any) => void): () => void {
    const channelName = `profile_changes_${userId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_profiles',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleProfileChange(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'work_experiences',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleProfileChange(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'education',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleProfileChange(userId, payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_skills',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            this.handleProfileChange(userId, payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
      this.syncStates.set(userId, {
        isConnected: true,
        lastSync: new Date(),
        pendingChanges: [],
        conflicts: []
      });
    }

    // Add callback
    const callbacks = this.syncCallbacks.get(userId) || [];
    callbacks.push(callback);
    this.syncCallbacks.set(userId, callbacks);

    // Return unsubscribe function
    return () => {
      const currentCallbacks = this.syncCallbacks.get(userId) || [];
      const index = currentCallbacks.indexOf(callback);
      if (index > -1) {
        currentCallbacks.splice(index, 1);
        this.syncCallbacks.set(userId, currentCallbacks);
      }

      // If no more callbacks, unsubscribe from channel
      if (currentCallbacks.length === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
          this.syncStates.delete(userId);
          this.syncCallbacks.delete(userId);
        }
      }
    };
  }

  // Handle profile changes from real-time updates
  private static handleProfileChange(userId: string, payload: any): void {
    const callbacks = this.syncCallbacks.get(userId) || [];
    const syncState = this.syncStates.get(userId);

    if (syncState) {
      syncState.lastSync = new Date();
      this.syncStates.set(userId, syncState);
    }

    // Notify all callbacks
    callbacks.forEach(callback => {
      try {
        callback(payload);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }

  // Cross-tab synchronization using BroadcastChannel
  static enableCrossTabSync(userId: string): () => void {
    const channelName = `profile_sync_${userId}`;
    const broadcastChannel = new BroadcastChannel(channelName);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'profile_update') {
        // Handle cross-tab profile updates
        this.handleCrossTabUpdate(userId, event.data.payload);
      }
    };

    broadcastChannel.addEventListener('message', handleMessage);

    // Return cleanup function
    return () => {
      broadcastChannel.removeEventListener('message', handleMessage);
      broadcastChannel.close();
    };
  }

  // Handle cross-tab updates
  private static handleCrossTabUpdate(userId: string, payload: any): void {
    const callbacks = this.syncCallbacks.get(userId) || [];
    
    callbacks.forEach(callback => {
      try {
        callback({
          eventType: 'cross_tab_update',
          payload
        });
      } catch (error) {
        console.error('Error in cross-tab sync callback:', error);
      }
    });
  }

  // Broadcast change to other tabs
  static broadcastChange(userId: string, change: any): void {
    const channelName = `profile_sync_${userId}`;
    const broadcastChannel = new BroadcastChannel(channelName);
    
    broadcastChannel.postMessage({
      type: 'profile_update',
      payload: change,
      timestamp: new Date().toISOString()
    });
    
    broadcastChannel.close();
  }

  // Detect and resolve conflicts
  static detectConflicts(localData: any, remoteData: any): any[] {
    const conflicts: any[] = [];

    // Simple conflict detection based on updated_at timestamps
    Object.keys(localData).forEach(key => {
      const localValue = localData[key];
      const remoteValue = remoteData[key];

      if (localValue && remoteValue && 
          localValue.updated_at && remoteValue.updated_at) {
        const localTime = new Date(localValue.updated_at);
        const remoteTime = new Date(remoteValue.updated_at);

        if (Math.abs(localTime.getTime() - remoteTime.getTime()) < 1000 && 
            JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
          conflicts.push({
            field: key,
            localValue,
            remoteValue,
            timestamp: new Date()
          });
        }
      }
    });

    return conflicts;
  }

  // Get sync state for a user
  static getSyncState(userId: string): SyncState | null {
    return this.syncStates.get(userId) || null;
  }

  // Force sync for a user
  static async forceSync(userId: string): Promise<void> {
    const syncState = this.syncStates.get(userId);
    if (syncState) {
      syncState.lastSync = new Date();
      this.syncStates.set(userId, syncState);
    }

    // Trigger callbacks with force sync event
    const callbacks = this.syncCallbacks.get(userId) || [];
    callbacks.forEach(callback => {
      try {
        callback({
          eventType: 'force_sync',
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error in force sync callback:', error);
      }
    });
  }
}
