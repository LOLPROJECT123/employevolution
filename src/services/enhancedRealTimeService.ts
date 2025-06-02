
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ConflictResolutionService, ConflictData } from './conflictResolutionService';

export interface CollaborationState {
  documentId: string;
  activeUsers: string[];
  currentVersion: number;
  lastSyncTime: Date;
  pendingChanges: any[];
}

export interface PresenceData {
  user_id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_section?: string;
  cursor_position?: number;
}

export class EnhancedRealTimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static presenceHeartbeat: Map<string, NodeJS.Timeout> = new Map();
  private static collaborationStates: Map<string, CollaborationState> = new Map();

  // Enhanced conflict resolution
  static async handleConflictResolution(conflictData: ConflictData): Promise<any> {
    console.log('Handling conflict resolution:', conflictData);
    
    // Detect conflict type and apply appropriate resolution strategy
    const strategy = this.determineResolutionStrategy(conflictData);
    
    try {
      const resolvedData = await ConflictResolutionService.resolveConflict(conflictData, strategy);
      
      // Broadcast resolution to all connected clients
      await this.broadcastConflictResolution(conflictData.id, resolvedData);
      
      return resolvedData;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      throw error;
    }
  }

  private static determineResolutionStrategy(conflict: ConflictData) {
    switch (conflict.conflictType) {
      case 'concurrent_edit':
        return { type: 'merge' as const };
      case 'version_mismatch':
        return { type: 'override_remote' as const };
      default:
        return { type: 'manual' as const };
    }
  }

  private static async broadcastConflictResolution(conflictId: string, resolvedData: any) {
    const channels = Array.from(this.channels.values());
    
    for (const channel of channels) {
      await channel.send({
        type: 'broadcast',
        event: 'conflict_resolved',
        payload: { conflictId, resolvedData }
      });
    }
  }

  // Collaboration state synchronization
  static async syncCollaborationState(documentId: string, changes: any): Promise<void> {
    const currentState = this.collaborationStates.get(documentId);
    
    if (!currentState) {
      console.warn('No collaboration state found for document:', documentId);
      return;
    }

    // Update local state
    const updatedState: CollaborationState = {
      ...currentState,
      currentVersion: currentState.currentVersion + 1,
      lastSyncTime: new Date(),
      pendingChanges: [...currentState.pendingChanges, changes]
    };

    this.collaborationStates.set(documentId, updatedState);

    // Sync with other clients
    const channel = this.channels.get(`collaboration_${documentId}`);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'state_sync',
        payload: { documentId, state: updatedState, changes }
      });
    }

    // Persist to database
    await this.persistCollaborationState(documentId, updatedState);
  }

  private static async persistCollaborationState(documentId: string, state: CollaborationState) {
    try {
      const { error } = await supabase
        .from('collaboration_states')
        .upsert({
          document_id: documentId,
          state: state,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to persist collaboration state:', error);
      }
    } catch (error) {
      console.error('Error persisting collaboration state:', error);
    }
  }

  // Presence tracking with heartbeat
  static managePresenceHeartbeat(roomId: string, userData: PresenceData): () => void {
    const heartbeatKey = `${roomId}_${userData.user_id}`;
    
    // Clear existing heartbeat
    const existingHeartbeat = this.presenceHeartbeat.get(heartbeatKey);
    if (existingHeartbeat) {
      clearInterval(existingHeartbeat);
    }

    // Start new heartbeat
    const heartbeat = setInterval(async () => {
      try {
        await this.updatePresence(roomId, {
          ...userData,
          last_seen: new Date().toISOString()
        });
      } catch (error) {
        console.error('Heartbeat failed:', error);
        this.stopPresenceHeartbeat(heartbeatKey);
      }
    }, 30000); // 30 seconds

    this.presenceHeartbeat.set(heartbeatKey, heartbeat);

    // Return cleanup function
    return () => this.stopPresenceHeartbeat(heartbeatKey);
  }

  private static stopPresenceHeartbeat(heartbeatKey: string) {
    const heartbeat = this.presenceHeartbeat.get(heartbeatKey);
    if (heartbeat) {
      clearInterval(heartbeat);
      this.presenceHeartbeat.delete(heartbeatKey);
    }
  }

  private static async updatePresence(roomId: string, userData: PresenceData) {
    const channel = this.channels.get(`presence_${roomId}`);
    if (channel) {
      await channel.track(userData);
    }
  }

  // Live notification delivery
  static async deliverLiveNotification(userId: string, notification: any): Promise<void> {
    const userChannels = Array.from(this.channels.entries())
      .filter(([key]) => key.includes(userId));

    for (const [_, channel] of userChannels) {
      await channel.send({
        type: 'broadcast',
        event: 'live_notification',
        payload: notification
      });
    }

    // Also send push notification if available
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.pushManager) {
        await registration.showNotification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: notification.data
        });
      }
    }
  }

  // Initialize collaboration room
  static initializeCollaborationRoom(documentId: string, initialState: Partial<CollaborationState> = {}) {
    const state: CollaborationState = {
      documentId,
      activeUsers: [],
      currentVersion: 1,
      lastSyncTime: new Date(),
      pendingChanges: [],
      ...initialState
    };

    this.collaborationStates.set(documentId, state);
    
    // Set up channel for this document
    const channel = supabase.channel(`collaboration_${documentId}`)
      .on('broadcast', { event: 'state_sync' }, (payload) => {
        this.handleRemoteStateSync(payload);
      })
      .on('broadcast', { event: 'conflict_resolved' }, (payload) => {
        this.handleConflictResolved(payload);
      })
      .subscribe();

    this.channels.set(`collaboration_${documentId}`, channel);
  }

  private static handleRemoteStateSync(payload: any) {
    const { documentId, state, changes } = payload.payload;
    
    // Update local state
    this.collaborationStates.set(documentId, state);
    
    // Emit event for UI to handle
    window.dispatchEvent(new CustomEvent('collaboration-sync', { 
      detail: { documentId, state, changes } 
    }));
  }

  private static handleConflictResolved(payload: any) {
    const { conflictId, resolvedData } = payload.payload;
    
    // Emit event for UI to handle
    window.dispatchEvent(new CustomEvent('conflict-resolved', { 
      detail: { conflictId, resolvedData } 
    }));
  }

  // Cleanup
  static cleanup() {
    // Clear all heartbeats
    for (const heartbeat of this.presenceHeartbeat.values()) {
      clearInterval(heartbeat);
    }
    this.presenceHeartbeat.clear();

    // Clear channels
    for (const channel of this.channels.values()) {
      supabase.removeChannel(channel);
    }
    this.channels.clear();

    // Clear collaboration states
    this.collaborationStates.clear();
  }
}
