
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
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            // Transform notification to job alert format
            const alert: LiveJobAlert = {
              id: payload.new.id,
              job_data: payload.new.message,
              user_id: payload.new.user_id,
              created_at: payload.new.created_at,
              is_viewed: payload.new.is_read
            };
            callback(alert);
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
            table: 'notifications',
            filter: `type=eq.chat`
          },
          (payload) => {
            // Transform notification to chat message format
            const message: ChatMessage = {
              id: payload.new.id,
              user_id: payload.new.user_id,
              content: payload.new.message,
              created_at: payload.new.created_at,
              chat_room: roomId,
              message_type: 'text'
            };
            callback(message);
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

  // Send Chat Message
  static async sendChatMessage(roomId: string, userId: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: 'Chat Message',
        message: content,
        type: 'chat'
      });

    if (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Resume Collaboration - using existing tables
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
            table: 'resumes'
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

  static async updateResumeSection(resumeId: string, userId: string, section: string, changes: any): Promise<void> {
    const { error } = await supabase
      .from('resumes')
      .update({
        content: changes,
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId);

    if (error) {
      throw new Error(`Failed to update resume: ${error.message}`);
    }
  }

  static async resolveConflict(resumeId: string, conflictId: string, resolution: any): Promise<void> {
    // For now, just update the resume directly
    console.log('Resolving conflict:', conflictId, resolution);
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
