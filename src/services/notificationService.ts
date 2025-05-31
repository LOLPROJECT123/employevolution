
import { supabase } from '@/integrations/supabase/client';

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  job_match_alerts: boolean;
  interview_reminders: boolean;
  application_updates: boolean;
  profile_completion_reminders: boolean;
}

class NotificationService {
  async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }

    return data;
  }

  async updateNotificationPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<boolean> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences
      });

    if (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }

    return true;
  }

  async createNotification(userId: string, title: string, message: string, type: string = 'info', actionUrl?: string): Promise<boolean> {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl
      });

    if (error) {
      console.error('Error creating notification:', error);
      return false;
    }

    return true;
  }

  async requestPushPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  async sendPushNotification(title: string, message: string, actionUrl?: string): Promise<void> {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });

      if (actionUrl) {
        notification.onclick = () => {
          window.open(actionUrl, '_blank');
          notification.close();
        };
      }
    }
  }

  // Listen for real-time notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void) {
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
          // Also send browser push notification if enabled
          this.sendPushNotification(
            payload.new.title,
            payload.new.message,
            payload.new.action_url
          );
        }
      )
      .subscribe();

    return channel;
  }
}

export const notificationService = new NotificationService();
