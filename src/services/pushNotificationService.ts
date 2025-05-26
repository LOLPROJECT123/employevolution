interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

interface NotificationPermissionStatus {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.isSupported = this.checkSupport();
    this.init();
  }

  private checkSupport(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  private async init(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered:', this.registration);
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      throw new Error('Push notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission:', permission);
    return permission;
  }

  getPermissionStatus(): NotificationPermissionStatus {
    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      prompt: permission === 'default'
    };
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    if (Notification.permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'YOUR_VAPID_PUBLIC_KEY' // Replace with your actual VAPID public key
        )
      });

      this.subscription = subscription as any;
      console.log('Push subscription:', this.subscription);
      return this.subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await (this.subscription as any).unsubscribe();
      this.subscription = null;
      return result;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  showLocalNotification(payload: NotificationPayload): void {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.warn('Cannot show notification: not supported or permission not granted');
      return;
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge,
      tag: payload.tag,
      data: payload.data,
      requireInteraction: true,
      timestamp: Date.now()
    };

    new Notification(payload.title, options);
  }

  // Helper method to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
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

  // Job-specific notification methods
  notifyNewJobMatch(job: any): void {
    this.showLocalNotification({
      title: 'New Job Match Found!',
      body: `${job.title} at ${job.company} matches your preferences`,
      icon: '/favicon.ico',
      tag: 'job-match',
      data: { jobId: job.id, type: 'job-match' }
    });
  }

  notifyApplicationStatusChange(jobTitle: string, company: string, status: string): void {
    this.showLocalNotification({
      title: 'Application Status Update',
      body: `Your application for ${jobTitle} at ${company} is now ${status}`,
      icon: '/favicon.ico',
      tag: 'status-update',
      data: { type: 'status-update', status }
    });
  }

  notifyInterviewReminder(jobTitle: string, company: string, timeUntil: string): void {
    this.showLocalNotification({
      title: 'Interview Reminder',
      body: `Interview for ${jobTitle} at ${company} in ${timeUntil}`,
      icon: '/favicon.ico',
      tag: 'interview-reminder',
      data: { type: 'interview-reminder' }
    });
  }

  notifyFollowUpReminder(jobTitle: string, company: string): void {
    this.showLocalNotification({
      title: 'Follow-up Reminder',
      body: `Time to follow up on your application for ${jobTitle} at ${company}`,
      icon: '/favicon.ico',
      tag: 'follow-up',
      data: { type: 'follow-up' }
    });
  }

  // Get current subscription
  getCurrentSubscription(): PushSubscription | null {
    return this.subscription;
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return this.isSupported && Notification.permission === 'granted';
  }
}

export const pushNotificationService = new PushNotificationService();
