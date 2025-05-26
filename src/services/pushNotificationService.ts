
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
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
}

class PushNotificationService {
  private subscription: PushSubscription | null = null;
  private isSupported = false;
  private isPermissionGranted = false;

  constructor() {
    this.checkSupport();
    this.checkPermission();
  }

  private checkSupport(): void {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('Push notifications supported:', this.isSupported);
  }

  private checkPermission(): void {
    if (!this.isSupported) return;
    
    this.isPermissionGranted = Notification.permission === 'granted';
    console.log('Push notification permission:', Notification.permission);
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.isPermissionGranted = permission === 'granted';
      
      if (this.isPermissionGranted) {
        console.log('Push notification permission granted');
        await this.subscribeToPush();
      } else {
        console.log('Push notification permission denied');
      }

      return this.isPermissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  private async subscribeToPush(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key (in a real app, this would be from your server)
      const vapidPublicKey = 'BMqSvZs...'; // This would be your actual VAPID public key
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      this.subscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        }
      };

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);
      
      console.log('Push subscription successful:', this.subscription);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      // In a real implementation, this would send to your backend
      console.log('Sending subscription to server:', subscription);
      
      // Store locally for now
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  async scheduleJobAlert(alertData: {
    jobTitle: string;
    company: string;
    location: string;
    salary?: string;
    matchPercentage?: number;
  }): Promise<void> {
    if (!this.isPermissionGranted) {
      console.log('Push notifications not permitted');
      return;
    }

    const payload: NotificationPayload = {
      title: '🎯 New Job Match!',
      body: `${alertData.jobTitle} at ${alertData.company} - ${alertData.location}`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        type: 'job-alert',
        jobData: alertData,
        url: '/jobs'
      },
      actions: [
        {
          action: 'view',
          title: 'View Job',
          icon: '/icons/view.png'
        },
        {
          action: 'save',
          title: 'Save for Later',
          icon: '/icons/save.png'
        }
      ],
      requireInteraction: true,
      vibrate: [200, 100, 200]
    };

    await this.sendNotification(payload);
  }

  async scheduleInterviewReminder(reminderData: {
    jobTitle: string;
    company: string;
    interviewTime: Date;
    location: string;
  }): Promise<void> {
    if (!this.isPermissionGranted) return;

    const timeUntil = reminderData.interviewTime.getTime() - Date.now();
    const hoursUntil = Math.round(timeUntil / (1000 * 60 * 60));

    const payload: NotificationPayload = {
      title: '📅 Interview Reminder',
      body: `${reminderData.jobTitle} interview at ${reminderData.company} in ${hoursUntil} hours`,
      icon: '/favicon.ico',
      data: {
        type: 'interview-reminder',
        interviewData: reminderData,
        url: '/interviews'
      },
      actions: [
        {
          action: 'prepare',
          title: 'Review Prep',
          icon: '/icons/prepare.png'
        },
        {
          action: 'directions',
          title: 'Get Directions',
          icon: '/icons/directions.png'
        }
      ],
      requireInteraction: true,
      vibrate: [100, 50, 100, 50, 100]
    };

    await this.sendNotification(payload);
  }

  async scheduleFollowUpReminder(followUpData: {
    jobTitle: string;
    company: string;
    applicationDate: Date;
    followUpType: 'email' | 'linkedin' | 'phone';
  }): Promise<void> {
    if (!this.isPermissionGranted) return;

    const payload: NotificationPayload = {
      title: '📮 Follow-up Reminder',
      body: `Time to follow up on your ${followUpData.jobTitle} application at ${followUpData.company}`,
      icon: '/favicon.ico',
      data: {
        type: 'follow-up-reminder',
        followUpData,
        url: '/applications'
      },
      actions: [
        {
          action: 'compose',
          title: 'Send Follow-up',
          icon: '/icons/email.png'
        },
        {
          action: 'snooze',
          title: 'Remind Later',
          icon: '/icons/snooze.png'
        }
      ],
      vibrate: [150, 75, 150]
    };

    await this.sendNotification(payload);
  }

  async scheduleApplicationDeadline(deadlineData: {
    jobTitle: string;
    company: string;
    deadline: Date;
    hoursLeft: number;
  }): Promise<void> {
    if (!this.isPermissionGranted) return;

    const urgencyLevel = deadlineData.hoursLeft <= 24 ? 'urgent' : 'normal';
    const emoji = urgencyLevel === 'urgent' ? '🚨' : '⏰';

    const payload: NotificationPayload = {
      title: `${emoji} Application Deadline`,
      body: `${deadlineData.jobTitle} at ${deadlineData.company} - ${deadlineData.hoursLeft} hours left!`,
      icon: '/favicon.ico',
      data: {
        type: 'application-deadline',
        deadlineData,
        urgency: urgencyLevel,
        url: '/applications'
      },
      actions: [
        {
          action: 'apply',
          title: 'Apply Now',
          icon: '/icons/apply.png'
        },
        {
          action: 'remind',
          title: 'Remind in 1hr',
          icon: '/icons/remind.png'
        }
      ],
      requireInteraction: urgencyLevel === 'urgent',
      vibrate: urgencyLevel === 'urgent' ? [200, 100, 200, 100, 200] : [150, 100, 150]
    };

    await this.sendNotification(payload);
  }

  private async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      // For immediate notifications, use the Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon,
          badge: payload.badge,
          data: payload.data,
          requireInteraction: payload.requireInteraction,
          vibrate: payload.vibrate
        });
      }

      // For scheduled notifications or when the app is in background, use service worker
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(payload.title, payload);
      
      console.log('Notification sent:', payload);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  async scheduleBulkNotifications(notifications: Array<{
    type: 'job-alert' | 'interview-reminder' | 'follow-up' | 'deadline';
    data: any;
    scheduleFor: Date;
  }>): Promise<void> {
    for (const notification of notifications) {
      const delay = notification.scheduleFor.getTime() - Date.now();
      
      if (delay > 0) {
        setTimeout(async () => {
          switch (notification.type) {
            case 'job-alert':
              await this.scheduleJobAlert(notification.data);
              break;
            case 'interview-reminder':
              await this.scheduleInterviewReminder(notification.data);
              break;
            case 'follow-up':
              await this.scheduleFollowUpReminder(notification.data);
              break;
            case 'deadline':
              await this.scheduleApplicationDeadline(notification.data);
              break;
          }
        }, delay);
      }
    }
  }

  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        this.subscription = null;
        localStorage.removeItem('pushSubscription');
        console.log('Push subscription removed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  getSubscriptionStatus(): {
    isSupported: boolean;
    isPermissionGranted: boolean;
    isSubscribed: boolean;
  } {
    return {
      isSupported: this.isSupported,
      isPermissionGranted: this.isPermissionGranted,
      isSubscribed: this.subscription !== null
    };
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    
    return window.btoa(binary);
  }
}

export const pushNotificationService = new PushNotificationService();
