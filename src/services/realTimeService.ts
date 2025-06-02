
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_page?: string;
}

export interface LiveJobAlert {
  id: string;
  job_data: any;
  user_id: string;
  created_at: string;
  is_viewed: boolean;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  chat_room: string;
  message_type: 'text' | 'system' | 'notification';
}

export class RealTimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();
  private static presence: Map<string, UserPresence> = new Map();
  private static callbacks: Map<string, Function[]> = new Map();

  // Live Job Alerts
  static subscribeToJobAlerts(userId: string, callback: (alert: LiveJobAlert) => void): () => void {
    const channelName = `job_alerts_${userId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'job_alerts_live',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            callback(payload.new as LiveJobAlert);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    const callbacks = this.callbacks.get(channelName) || [];
    callbacks.push(callback);
    this.callbacks.set(channelName, callbacks);

    return () => {
      const currentCallbacks = this.callbacks.get(channelName) || [];
      const index = currentCallbacks.indexOf(callback);
      if (index > -1) {
        currentCallbacks.splice(index, 1);
        this.callbacks.set(channelName, currentCallbacks);
      }

      if (currentCallbacks.length === 0) {
        const channel = this.channels.get(channelName);
        if (channel) {
          supabase.removeChannel(channel);
          this.channels.delete(channelName);
          this.callbacks.delete(channelName);
        }
      }
    };
  }

  // Real-time Resume Collaboration
  static subscribeToResumeChanges(resumeId: string, callback: (change: any) => void): () => void {
    const channelName = `resume_${resumeId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'resume_collaboration',
            filter: `resume_id=eq.${resumeId}`
          },
          (payload) => {
            callback(payload);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    const callbacks = this.callbacks.get(channelName) || [];
    callbacks.push(callback);
    this.callbacks.set(channelName, callbacks);

    return () => this.unsubscribeCallback(channelName, callback);
  }

  // Live Chat Support
  static subscribeToChat(roomId: string, callback: (message: ChatMessage) => void): () => void {
    const channelName = `chat_${roomId}`;
    
    if (!this.channels.has(channelName)) {
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `chat_room=eq.${roomId}`
          },
          (payload) => {
            callback(payload.new as ChatMessage);
          }
        )
        .subscribe();

      this.channels.set(channelName, channel);
    }

    const callbacks = this.callbacks.get(channelName) || [];
    callbacks.push(callback);
    this.callbacks.set(channelName, callbacks);

    return () => this.unsubscribeCallback(channelName, callback);
  }

  // User Presence
  static subscribeToPresence(roomId: string, callback: (presence: UserPresence[]) => void): () => void {
    const channelName = `presence_${roomId}`;
    
    const channel = supabase.channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as UserPresence[];
        callback(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe();

    this.channels.set(channelName, channel);

    return () => {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    };
  }

  static async updatePresence(roomId: string, userPresence: UserPresence): Promise<void> {
    const channelName = `presence_${roomId}`;
    const channel = this.channels.get(channelName);
    
    if (channel) {
      await channel.track(userPresence);
    }
  }

  // Send Chat Message
  static async sendChatMessage(roomId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        content,
        chat_room: roomId,
        message_type: 'text'
      });

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Resume Collaboration
  static async updateResumeSection(resumeId: string, userId: string, section: string, changes: any): Promise<void> {
    const { error } = await supabase
      .from('resume_collaboration')
      .insert({
        resume_id: resumeId,
        user_id: userId,
        section,
        changes,
        action: 'update'
      });

    if (error) {
      throw new Error(`Failed to update resume: ${error.message}`);
    }
  }

  // Conflict Resolution
  static async resolveConflict(resumeId: string, conflictId: string, resolution: any): Promise<void> {
    const { error } = await supabase
      .from('resume_conflicts')
      .update({ 
        status: 'resolved',
        resolution,
        resolved_at: new Date().toISOString()
      })
      .eq('id', conflictId);

    if (error) {
      throw new Error(`Failed to resolve conflict: ${error.message}`);
    }
  }

  private static unsubscribeCallback(channelName: string, callback: Function): void {
    const currentCallbacks = this.callbacks.get(channelName) || [];
    const index = currentCallbacks.indexOf(callback);
    if (index > -1) {
      currentCallbacks.splice(index, 1);
      this.callbacks.set(channelName, currentCallbacks);
    }

    if (currentCallbacks.length === 0) {
      const channel = this.channels.get(channelName);
      if (channel) {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
        this.callbacks.delete(channelName);
      }
    }
  }

  // Cleanup all channels
  static cleanup(): void {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    this.callbacks.clear();
    this.presence.clear();
  }
}
