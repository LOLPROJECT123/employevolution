
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface UserPresence {
  user_id: string;
  name: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_section?: string;
}

export interface NotificationPayload {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  chat_room: string;
  message_type: 'text' | 'system';
}

export interface LiveJobAlert {
  id: string;
  user_id: string;
  job_data: {
    title: string;
    company: string;
    location: string;
    salary?: string;
  };
  created_at: string;
  is_viewed: boolean;
}

export class RealTimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  static async subscribeToNotifications(
    userId: string,
    callback: (notification: NotificationPayload) => void
  ): Promise<RealtimeChannel> {
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new as NotificationPayload);
        }
      )
      .subscribe();

    this.channels.set(`notifications_${userId}`, channel);
    return channel;
  }

  static async subscribeToUserPresence(
    roomId: string,
    callback: (presences: UserPresence[]) => void
  ): Promise<RealtimeChannel> {
    const channel = supabase.channel(`presence_${roomId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const presences: UserPresence[] = Object.keys(presenceState).map(key => {
          const presence = presenceState[key][0] as any;
          return {
            user_id: key,
            name: presence?.name || 'Unknown',
            status: presence?.status || 'online',
            last_seen: presence?.last_seen || new Date().toISOString(),
            current_section: presence?.current_section
          };
        });
        callback(presences);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          await channel.track({
            user_id: 'current_user',
            name: 'Current User',
            status: 'online',
            last_seen: new Date().toISOString()
          });
        }
      });

    this.channels.set(`presence_${roomId}`, channel);
    return channel;
  }

  // Alias methods for backward compatibility
  static async subscribeToPresence(
    roomId: string,
    callback: (presences: UserPresence[]) => void
  ): Promise<RealtimeChannel> {
    return this.subscribeToUserPresence(roomId, callback);
  }

  static async updateUserPresence(
    roomId: string,
    userData: Partial<UserPresence>
  ): Promise<void> {
    const channel = this.channels.get(`presence_${roomId}`);
    if (channel) {
      await channel.track({
        ...userData,
        last_seen: new Date().toISOString()
      });
    }
  }

  // Alias method for backward compatibility
  static async updatePresence(
    roomId: string,
    userData: Partial<UserPresence>
  ): Promise<void> {
    return this.updateUserPresence(roomId, userData);
  }

  // Chat functionality
  static async subscribeToChat(
    roomId: string,
    callback: (message: ChatMessage) => void
  ): Promise<() => void> {
    const channel = supabase
      .channel(`chat_${roomId}`)
      .on('broadcast', { event: 'message' }, (payload) => {
        callback(payload.payload as ChatMessage);
      })
      .subscribe();

    this.channels.set(`chat_${roomId}`, channel);
    
    return () => {
      supabase.removeChannel(channel);
      this.channels.delete(`chat_${roomId}`);
    };
  }

  static async sendChatMessage(
    roomId: string,
    userId: string,
    content: string
  ): Promise<void> {
    const channel = this.channels.get(`chat_${roomId}`);
    if (channel) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
        chat_room: roomId,
        message_type: 'text'
      };

      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: message
      });
    }
  }

  // Job alerts functionality
  static subscribeToJobAlerts(
    userId: string,
    callback: (alert: LiveJobAlert) => void
  ): () => void {
    console.log('Mock: Subscribing to job alerts for user:', userId);
    
    // Mock implementation - in real app would use actual job alert system
    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const mockAlert: LiveJobAlert = {
          id: Date.now().toString(),
          user_id: userId,
          job_data: {
            title: 'Software Engineer',
            company: 'Tech Corp',
            location: 'Remote',
            salary: '$80,000 - $120,000'
          },
          created_at: new Date().toISOString(),
          is_viewed: false
        };
        callback(mockAlert);
      }
    }, 5000);

    return () => clearInterval(interval);
  }

  // Resume functionality
  static async subscribeToResumeChanges(
    resumeId: string,
    callback: (change: any) => void
  ): Promise<() => void> {
    console.log('Mock: Subscribing to resume changes for:', resumeId);
    
    // Mock implementation
    return () => {
      console.log('Mock: Unsubscribed from resume changes');
    };
  }

  static async updateResumeSection(
    resumeId: string,
    userId: string,
    section: string,
    data: any
  ): Promise<void> {
    console.log('Mock: Updating resume section:', { resumeId, userId, section, data });
  }

  static async resolveConflict(
    resumeId: string,
    conflictId: string,
    resolution: any
  ): Promise<void> {
    console.log('Mock: Resolving conflict:', { resumeId, conflictId, resolution });
  }

  static async unsubscribe(channelKey: string): Promise<void> {
    const channel = this.channels.get(channelKey);
    if (channel) {
      await supabase.removeChannel(channel);
      this.channels.delete(channelKey);
    }
  }

  static async unsubscribeAll(): Promise<void> {
    for (const [key, channel] of this.channels.entries()) {
      await supabase.removeChannel(channel);
      this.channels.delete(key);
    }
  }

  static async broadcastMessage(
    channelName: string,
    event: string,
    payload: any
  ): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload
      });
    }
  }

  static cleanup(): void {
    this.unsubscribeAll();
  }
}
