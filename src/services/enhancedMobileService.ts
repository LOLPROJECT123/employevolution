
import { supabase } from '@/integrations/supabase/client';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  type?: 'fingerprint' | 'face' | 'voice';
}

export interface DocumentScanResult {
  success: boolean;
  text?: string;
  confidence?: number;
  documentType?: string;
  error?: string;
}

export interface PushNotificationConfig {
  enabled: boolean;
  jobAlerts: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  networkingOpportunities: boolean;
}

export interface OfflineSyncData {
  lastSync: string;
  pendingActions: any[];
  cachedData: any;
  conflictResolution: 'server' | 'client' | 'merge';
}

export class EnhancedMobileService {
  // Biometric Authentication
  static async initializeBiometricAuth(): Promise<boolean> {
    try {
      // Check if biometric authentication is available
      if ('credentials' in navigator) {
        const available = await (navigator.credentials as any).get({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: "EmployEvolution" },
            user: {
              id: new Uint8Array(16),
              name: "user@example.com",
              displayName: "User"
            },
            pubKeyCredParams: [{ alg: -7, type: "public-key" }],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            }
          }
        });
        return !!available;
      }
      return false;
    } catch (error) {
      console.error('Biometric auth not available:', error);
      return false;
    }
  }

  static async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
    try {
      const credential = await (navigator.credentials as any).get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: "required"
        }
      });

      if (credential) {
        return {
          success: true,
          type: 'fingerprint' // Could be determined by credential type
        };
      }

      return {
        success: false,
        error: 'Authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Document Scanning
  static async scanDocument(imageFile: File): Promise<DocumentScanResult> {
    try {
      // Use OCR service or camera API
      const formData = new FormData();
      formData.append('image', imageFile);

      // Mock OCR processing
      const mockResult = {
        success: true,
        text: 'JOHN DOE\nSoftware Engineer\nExperience: 5 years\nSkills: React, Node.js, Python\nEmail: john.doe@example.com\nPhone: (555) 123-4567',
        confidence: 0.95,
        documentType: 'resume'
      };

      // In a real implementation, this would call an OCR service
      return mockResult;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scan failed'
      };
    }
  }

  static async parseDocumentText(text: string): Promise<any> {
    try {
      // Parse extracted text into structured data
      const lines = text.split('\n').filter(line => line.trim());
      const result: any = {};

      lines.forEach(line => {
        if (line.includes('@')) {
          result.email = line.trim();
        } else if (line.match(/\(\d{3}\)\s?\d{3}-\d{4}/)) {
          result.phone = line.trim();
        } else if (line.toLowerCase().includes('experience')) {
          const match = line.match(/(\d+)\s*years?/i);
          if (match) {
            result.experience = parseInt(match[1]);
          }
        } else if (line.toLowerCase().includes('skills')) {
          const skillsText = line.split(':')[1];
          if (skillsText) {
            result.skills = skillsText.split(',').map(skill => skill.trim());
          }
        }
      });

      return result;
    } catch (error) {
      console.error('Document parsing failed:', error);
      return {};
    }
  }

  // Push Notifications
  static async requestNotificationPermission(): Promise<boolean> {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Notification permission failed:', error);
      return false;
    }
  }

  static async subscribeToPushNotifications(userId: string): Promise<boolean> {
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(
            'BJ-your-vapid-public-key-here' // Replace with actual VAPID key
          )
        });

        // Save subscription to database
        await supabase.from('user_profiles').update({
          push_subscription: JSON.stringify(subscription)
        }).eq('user_id', userId);

        return true;
      }
      return false;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return false;
    }
  }

  static async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<boolean> {
    try {
      const { data: response } = await supabase.functions.invoke('notification-dispatcher', {
        body: {
          userId,
          notification: {
            title,
            body,
            data,
            timestamp: new Date().toISOString()
          }
        }
      });

      return response?.success || false;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }

  // Offline Sync
  static async initializeOfflineSync(userId: string): Promise<boolean> {
    try {
      // Set up service worker for background sync
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
        
        // Initialize IndexedDB for offline storage
        const dbRequest = indexedDB.open('employevolution-offline', 1);
        
        dbRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores
          if (!db.objectStoreNames.contains('jobs')) {
            db.createObjectStore('jobs', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('applications')) {
            db.createObjectStore('applications', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('syncQueue')) {
            db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          }
        };

        return new Promise((resolve) => {
          dbRequest.onsuccess = () => resolve(true);
          dbRequest.onerror = () => resolve(false);
        });
      }
      return false;
    } catch (error) {
      console.error('Offline sync initialization failed:', error);
      return false;
    }
  }

  static async syncOfflineData(userId: string): Promise<OfflineSyncData> {
    try {
      const db = await this.openOfflineDB();
      const syncQueue = await this.getFromIndexedDB(db, 'syncQueue');
      
      // Process pending actions
      for (const action of syncQueue) {
        try {
          await this.processSyncAction(action);
          await this.removeFromIndexedDB(db, 'syncQueue', action.id);
        } catch (error) {
          console.error('Sync action failed:', action, error);
        }
      }

      // Get latest data from server
      const { data: latestJobs } = await supabase
        .from('saved_jobs')
        .select('*')
        .eq('user_id', userId);

      const { data: latestApplications } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId);

      // Update local cache
      if (latestJobs) {
        await this.saveToIndexedDB(db, 'jobs', latestJobs);
      }
      if (latestApplications) {
        await this.saveToIndexedDB(db, 'applications', latestApplications);
      }

      return {
        lastSync: new Date().toISOString(),
        pendingActions: [],
        cachedData: {
          jobs: latestJobs?.length || 0,
          applications: latestApplications?.length || 0
        },
        conflictResolution: 'server'
      };
    } catch (error) {
      console.error('Offline sync failed:', error);
      return {
        lastSync: new Date().toISOString(),
        pendingActions: [],
        cachedData: {},
        conflictResolution: 'server'
      };
    }
  }

  static async queueOfflineAction(action: any): Promise<void> {
    try {
      const db = await this.openOfflineDB();
      await this.saveToIndexedDB(db, 'syncQueue', {
        ...action,
        timestamp: new Date().toISOString(),
        retryCount: 0
      });
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }

  // Camera Integration
  static async initializeCamera(): Promise<boolean> {
    try {
      if ('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false
        });
        
        // Stop the stream immediately after checking
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Camera initialization failed:', error);
      return false;
    }
  }

  static async captureDocument(): Promise<File | null> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob((blob) => {
              stream.getTracks().forEach(track => track.stop());
              if (blob) {
                const file = new File([blob], 'document.jpg', { type: 'image/jpeg' });
                resolve(file);
              } else {
                resolve(null);
              }
            }, 'image/jpeg', 0.9);
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.error('Document capture failed:', error);
      return null;
    }
  }

  // Utility methods
  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
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

  private static async openOfflineDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('employevolution-offline', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private static async saveToIndexedDB(db: IDBDatabase, storeName: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      
      if (Array.isArray(data)) {
        data.forEach(item => store.put(item));
      } else {
        store.put(data);
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  private static async getFromIndexedDB(db: IDBDatabase, storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private static async removeFromIndexedDB(db: IDBDatabase, storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private static async processSyncAction(action: any): Promise<void> {
    // Process different types of sync actions
    switch (action.type) {
      case 'save_job':
        await supabase.from('saved_jobs').insert(action.data);
        break;
      case 'apply_job':
        await supabase.from('job_applications').insert(action.data);
        break;
      case 'update_application':
        await supabase.from('job_applications').update(action.data).eq('id', action.id);
        break;
      default:
        console.warn('Unknown sync action type:', action.type);
    }
  }
}
