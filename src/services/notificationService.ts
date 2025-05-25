
interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

class NotificationService {
  private permission: NotificationPermission = 'default';

  constructor() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission === 'granted';
  }

  async sendNotification(payload: NotificationPayload): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    try {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/favicon.ico',
        badge: payload.badge,
        tag: payload.tag,
        data: payload.data,
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        
        // Handle notification click based on data
        if (payload.data?.url) {
          window.location.href = payload.data.url;
        }
      };

      // Auto close after 10 seconds
      setTimeout(() => notification.close(), 10000);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  // Job alert notifications
  async notifyJobMatch(job: any, matchScore: number): Promise<void> {
    await this.sendNotification({
      title: `New Job Match: ${matchScore}%`,
      body: `${job.title} at ${job.company} matches your preferences`,
      tag: 'job-match',
      data: { jobId: job.id, url: `/jobs?job=${job.id}` }
    });
  }

  async notifyApplicationUpdate(status: string, jobTitle: string, company: string): Promise<void> {
    const statusMessages = {
      phone_screen: 'Phone screen scheduled',
      interview_scheduled: 'Interview scheduled',
      offer_received: 'Job offer received!',
      rejected: 'Application update'
    };

    await this.sendNotification({
      title: statusMessages[status as keyof typeof statusMessages] || 'Application Update',
      body: `${jobTitle} at ${company}`,
      tag: 'application-update',
      data: { url: '/applications' }
    });
  }

  async notifyBulkApplicationComplete(successful: number, total: number): Promise<void> {
    await this.sendNotification({
      title: 'Bulk Applications Complete',
      body: `Successfully applied to ${successful} of ${total} jobs`,
      tag: 'bulk-application',
      data: { url: '/applications' }
    });
  }

  // In-app notifications (toast-like)
  showInAppNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    // This would integrate with your toast system
    const event = new CustomEvent('show-notification', {
      detail: { message, type }
    });
    window.dispatchEvent(event);
  }

  // Schedule notifications for follow-ups
  scheduleFollowUpReminder(applicationId: string, followUpDate: Date): void {
    const now = new Date();
    const timeDiff = followUpDate.getTime() - now.getTime();

    if (timeDiff > 0) {
      setTimeout(async () => {
        await this.sendNotification({
          title: 'Follow-up Reminder',
          body: 'Time to follow up on your job application',
          tag: 'follow-up',
          data: { applicationId, url: '/applications' }
        });
      }, timeDiff);
    }
  }

  // Browser push notifications setup
  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.VITE_VAPID_PUBLIC_KEY || ''
        )
      });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const notificationService = new NotificationService();
