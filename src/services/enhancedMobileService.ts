
import { supabase } from '@/integrations/supabase/client';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface BiometricAuthResult {
  success: boolean;
  credential?: PublicKeyCredential;
  error?: string;
}

export interface OfflineSyncQueue {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: string;
  retries: number;
}

export class EnhancedMobileService {
  private static syncQueue: OfflineSyncQueue[] = [];
  private static isOnline = navigator.onLine;

  static async setupPushNotifications(userId: string): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications not supported');
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        return false;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(
          'BMqSvZdbF8R-n36_Sm9XGJ3Rn0Qbh9FNJhYqrFq_EsMm4WNNZjcfnrNqF2CSY3lR-9z9Qis7mWY-zHp-0bM_6fQ'
        )
      });

      // Save subscription to database
      await this.savePushSubscription(userId, subscription);
      
      // Also save to user profile for backward compatibility
      await supabase
        .from('user_profiles')
        .update({ 
          push_subscription: subscription.toJSON() 
        })
        .eq('user_id', userId);

      return true;
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      return false;
    }
  }

  private static async savePushSubscription(userId: string, subscription: any): Promise<void> {
    const subscriptionData = subscription.toJSON();
    
    await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.keys.p256dh,
      auth: subscriptionData.keys.auth,
      user_agent: navigator.userAgent,
      is_active: true
    });
  }

  private static urlB64ToUint8Array(base64String: string): Uint8Array {
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

  static async enableBiometricAuth(): Promise<BiometricAuthResult> {
    try {
      if (!window.PublicKeyCredential) {
        return { success: false, error: 'WebAuthn not supported' };
      }

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        return { success: false, error: 'Biometric authenticator not available' };
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "JobLift",
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode("user123"),
            name: "user@example.com",
            displayName: "User",
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000,
          attestation: "direct"
        }
      }) as PublicKeyCredential;

      return { success: true, credential };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      return { success: true, credential };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Authentication failed' };
    }
  }

  static setupOfflineSync(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Process any existing queue items
    this.processSyncQueue();
  }

  static addToSyncQueue(action: 'create' | 'update' | 'delete', table: string, data: any): void {
    const queueItem: OfflineSyncQueue = {
      id: crypto.randomUUID(),
      action,
      table,
      data,
      timestamp: new Date().toISOString(),
      retries: 0
    };

    this.syncQueue.push(queueItem);
    this.saveQueueToStorage();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private static async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    
    for (const item of queue) {
      try {
        await this.processQueueItem(item);
        this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
      } catch (error) {
        console.error('Error processing queue item:', error);
        item.retries += 1;
        
        // Remove failed items after 3 retries
        if (item.retries >= 3) {
          this.syncQueue = this.syncQueue.filter(q => q.id !== item.id);
        }
      }
    }

    this.saveQueueToStorage();
  }

  private static async processQueueItem(item: OfflineSyncQueue): Promise<void> {
    switch (item.action) {
      case 'create':
        await supabase.from(item.table).insert(item.data);
        break;
      case 'update':
        await supabase.from(item.table).update(item.data).eq('id', item.data.id);
        break;
      case 'delete':
        await supabase.from(item.table).delete().eq('id', item.data.id);
        break;
    }
  }

  private static saveQueueToStorage(): void {
    try {
      localStorage.setItem('offlineSyncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private static loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem('offlineSyncQueue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
      this.syncQueue = [];
    }
  }

  static async enableDocumentScanning(): Promise<boolean> {
    try {
      if (!('getUserMedia' in navigator.mediaDevices)) {
        return false;
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Stop the stream immediately (we just needed permission)
      stream.getTracks().forEach(track => track.stop());
      
      return true;
    } catch (error) {
      console.error('Error enabling document scanning:', error);
      return false;
    }
  }

  static async scanDocument(): Promise<{ success: boolean; text?: string; image?: string; error?: string }> {
    try {
      if (!('getUserMedia' in navigator.mediaDevices)) {
        return { success: false, error: 'Camera not supported' };
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      await new Promise(resolve => video.addEventListener('loadedmetadata', resolve));

      // Capture frame to canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Stop camera
      stream.getTracks().forEach(track => track.stop());

      // Get image data
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // In a real implementation, you would send this to an OCR service
      // For now, return mock extracted text
      const mockExtractedText = this.generateMockOCRText();

      return {
        success: true,
        text: mockExtractedText,
        image: imageData
      };
    } catch (error) {
      console.error('Error scanning document:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Scan failed' };
    }
  }

  private static generateMockOCRText(): string {
    // Mock OCR result for demonstration
    return `John Doe
Senior Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE
Software Engineer at TechCorp (2020-2023)
- Developed web applications using React and Node.js
- Led team of 5 developers on multiple projects
- Improved application performance by 40%

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2016-2020)

SKILLS
JavaScript, Python, React, Node.js, AWS, Docker`;
  }

  static getOfflineCapabilities() {
    return {
      isOnline: this.isOnline,
      queueLength: this.syncQueue.length,
      supportsPush: 'serviceWorker' in navigator && 'PushManager' in window,
      supportsCamera: 'getUserMedia' in (navigator.mediaDevices || {}),
      supportsBiometrics: 'credentials' in navigator && 'PublicKeyCredential' in window,
      supportsOfflineStorage: 'indexedDB' in window
    };
  }

  // Initialize the service
  static init(): void {
    this.loadQueueFromStorage();
    this.setupOfflineSync();
  }
}

// Initialize on import
EnhancedMobileService.init();
