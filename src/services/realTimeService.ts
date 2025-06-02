
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
          const presence = presenceState[key][0];
          return {
            user_id: key,
            name: presence.name || 'Unknown',
            status: presence.status || 'online',
            last_seen: presence.last_seen || new Date().toISOString(),
            current_section: presence.current_section
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
}
