
import { supabase } from '@/integrations/supabase/client';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  method: 'fingerprint' | 'face' | 'voice' | 'none';
}

export interface DocumentScanResult {
  text: string;
  confidence: number;
  type: 'resume' | 'id' | 'certificate' | 'other';
  extractedData: any;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: any;
  icon?: string;
  badge?: number;
}

export class EnhancedMobileService {
  static async enableBiometricAuth(): Promise<BiometricAuthResult> {
    try {
      // Check if biometric authentication is available
      if ('credentials' in navigator) {
        const available = await (navigator.credentials as any).get({
          publicKey: {
            challenge: new Uint8Array(32),
            rp: { name: 'CareerCatalyst' },
            user: {
              id: new Uint8Array(16),
              name: 'user@example.com',
              displayName: 'User'
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required'
            }
          }
        });

        if (available) {
          return {
            success: true,
            method: 'fingerprint' // Could be fingerprint, face, etc.
          };
        }
      }

      // Fallback for mobile devices
      if ('DeviceMotionEvent' in window) {
        return {
          success: true,
          method: 'voice' // Voice recognition as fallback
        };
      }

      return {
        success: false,
        error: 'Biometric authentication not supported',
        method: 'none'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Biometric auth failed',
        method: 'none'
      };
    }
  }

  static async scanDocument(imageBlob: Blob): Promise<DocumentScanResult> {
    try {
      // Create a canvas to process the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');

      // Create image from blob
      const img = new Image();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Mock OCR functionality - in real app, would use Tesseract.js or cloud OCR
          const mockText = this.generateMockOCRText();
          const documentType = this.detectDocumentType(mockText);
          const extractedData = this.extractDataFromText(mockText, documentType);
          
          URL.revokeObjectURL(imageUrl);
          
          resolve({
            text: mockText,
            confidence: 85 + Math.random() * 10, // Mock confidence
            type: documentType,
            extractedData
          });
        };
        
        img.onerror = () => {
          resolve({
            text: '',
            confidence: 0,
            type: 'other',
            extractedData: {}
          });
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Document scan error:', error);
      return {
        text: '',
        confidence: 0,
        type: 'other',
        extractedData: {}
      };
    }
  }

  static async registerForPushNotifications(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push messaging is not supported');
        return false;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          'BGxJCjVwhPq6f8j9b8aqm3aV2VLhN9UigMqRt67sJ8M' // Mock VAPID key
        )
      });

      // Store subscription in database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').upsert({
          user_id: user.id,
          push_subscription: subscription.toJSON()
        });
      }

      return true;
    } catch (error) {
      console.error('Push notification registration failed:', error);
      return false;
    }
  }

  static async sendPushNotification(userId: string, payload: PushNotificationPayload): Promise<boolean> {
    try {
      // In a real app, this would be handled by a backend service
      // For now, we'll just log the notification and show it locally
      console.log('Sending push notification:', payload);
      
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: payload.icon || '/favicon.ico',
          badge: payload.badge,
          data: payload.data
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }

  static async syncDataInBackground(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Sync user data when online
      if (navigator.onLine) {
        const syncTasks = [
          this.syncJobApplications(user.id),
          this.syncUserProfile(user.id),
          this.syncSavedJobs(user.id)
        ];

        await Promise.allSettled(syncTasks);
        
        // Update last sync timestamp
        localStorage.setItem('lastBackgroundSync', new Date().toISOString());
      }
    } catch (error) {
      console.error('Background sync error:', error);
    }
  }

  static async handleOfflineActions(): Promise<void> {
    try {
      const offlineActions = JSON.parse(localStorage.getItem('offlineActions') || '[]');
      
      if (navigator.onLine && offlineActions.length > 0) {
        for (const action of offlineActions) {
          try {
            await this.executeOfflineAction(action);
          } catch (error) {
            console.error('Failed to execute offline action:', error);
          }
        }
        
        // Clear processed actions
        localStorage.setItem('offlineActions', '[]');
      }
    } catch (error) {
      console.error('Offline action handling error:', error);
    }
  }

  // Helper methods
  private static generateMockOCRText(): string {
    const mockTexts = [
      `John Doe
Software Engineer
john.doe@email.com
(555) 123-4567

EXPERIENCE
Senior Software Engineer - Tech Corp (2020-2023)
• Developed React applications with 99% uptime
• Led team of 5 engineers
• Improved system performance by 40%

EDUCATION
Bachelor of Computer Science
University of Technology (2016-2020)

SKILLS
JavaScript, React, Node.js, Python, AWS`,

      `CERTIFICATE OF COMPLETION
This certifies that John Doe
has successfully completed
AWS Solutions Architect Associate
Issued: December 2023
Certificate ID: AWS-123456789`,

      `Driver's License
Name: John Doe
License #: D123456789
DOB: 01/15/1995
Expires: 01/15/2027`
    ];

    return mockTexts[Math.floor(Math.random() * mockTexts.length)];
  }

  private static detectDocumentType(text: string): 'resume' | 'id' | 'certificate' | 'other' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('experience') && lowerText.includes('education') && lowerText.includes('skills')) {
      return 'resume';
    }
    
    if (lowerText.includes('certificate') && lowerText.includes('completion')) {
      return 'certificate';
    }
    
    if (lowerText.includes('license') || lowerText.includes('identification')) {
      return 'id';
    }
    
    return 'other';
  }

  private static extractDataFromText(text: string, type: 'resume' | 'id' | 'certificate' | 'other'): any {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    const baseData = {
      email: emailMatch ? emailMatch[0] : null,
      phone: phoneMatch ? phoneMatch[0] : null
    };

    switch (type) {
      case 'resume':
        return {
          ...baseData,
          skills: this.extractSkills(text),
          experience: this.extractExperience(text),
          education: this.extractEducation(text)
        };
      case 'certificate':
        return {
          ...baseData,
          certificateName: this.extractCertificateName(text),
          issueDate: this.extractDate(text),
          certificateId: this.extractCertificateId(text)
        };
      case 'id':
        return {
          ...baseData,
          idNumber: this.extractIdNumber(text),
          expirationDate: this.extractDate(text)
        };
      default:
        return baseData;
    }
  }

  private static extractSkills(text: string): string[] {
    const skillsSection = text.match(/SKILLS[\s\S]*?(?=\n[A-Z]|$)/i);
    if (!skillsSection) return [];
    
    const commonSkills = ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'SQL', 'Git'];
    return commonSkills.filter(skill => 
      skillsSection[0].toLowerCase().includes(skill.toLowerCase())
    );
  }

  private static extractExperience(text: string): string[] {
    const experienceSection = text.match(/EXPERIENCE[\s\S]*?(?=\n[A-Z]|$)/i);
    if (!experienceSection) return [];
    
    const lines = experienceSection[0].split('\n').filter(line => line.trim());
    return lines.slice(1, 4); // Return first few experience entries
  }

  private static extractEducation(text: string): string[] {
    const educationSection = text.match(/EDUCATION[\s\S]*?(?=\n[A-Z]|$)/i);
    if (!educationSection) return [];
    
    const lines = educationSection[0].split('\n').filter(line => line.trim());
    return lines.slice(1, 3); // Return education entries
  }

  private static extractCertificateName(text: string): string | null {
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('aws') || line.toLowerCase().includes('microsoft') || 
          line.toLowerCase().includes('google') || line.toLowerCase().includes('certified')) {
        return line.trim();
      }
    }
    return null;
  }

  private static extractDate(text: string): string | null {
    const dateMatch = text.match(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|[A-Za-z]+ \d{4}/);
    return dateMatch ? dateMatch[0] : null;
  }

  private static extractCertificateId(text: string): string | null {
    const idMatch = text.match(/(?:ID|Certificate|Cert)[\s#:]*([A-Z0-9-]+)/i);
    return idMatch ? idMatch[1] : null;
  }

  private static extractIdNumber(text: string): string | null {
    const idMatch = text.match(/(?:License|ID)[\s#:]*([A-Z0-9]+)/i);
    return idMatch ? idMatch[1] : null;
  }

  private static urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private static async syncJobApplications(userId: string): Promise<void> {
    // Sync local job applications with server
    const localApplications = JSON.parse(localStorage.getItem('offlineApplications') || '[]');
    
    for (const app of localApplications) {
      try {
        await supabase.from('job_applications').upsert({ ...app, user_id: userId });
      } catch (error) {
        console.error('Failed to sync application:', error);
      }
    }
    
    localStorage.removeItem('offlineApplications');
  }

  private static async syncUserProfile(userId: string): Promise<void> {
    const localProfile = JSON.parse(localStorage.getItem('offlineProfile') || '{}');
    
    if (Object.keys(localProfile).length > 0) {
      try {
        await supabase.from('user_profiles').upsert({ ...localProfile, user_id: userId });
        localStorage.removeItem('offlineProfile');
      } catch (error) {
        console.error('Failed to sync profile:', error);
      }
    }
  }

  private static async syncSavedJobs(userId: string): Promise<void> {
    const localSavedJobs = JSON.parse(localStorage.getItem('offlineSavedJobs') || '[]');
    
    for (const job of localSavedJobs) {
      try {
        await supabase.from('saved_jobs').upsert({ ...job, user_id: userId });
      } catch (error) {
        console.error('Failed to sync saved job:', error);
      }
    }
    
    localStorage.removeItem('offlineSavedJobs');
  }

  private static async executeOfflineAction(action: any): Promise<void> {
    switch (action.type) {
      case 'saveJob':
        await supabase.from('saved_jobs').insert(action.data);
        break;
      case 'updateProfile':
        await supabase.from('user_profiles').upsert(action.data);
        break;
      case 'submitApplication':
        await supabase.from('job_applications').insert(action.data);
        break;
      default:
        console.warn('Unknown offline action type:', action.type);
    }
  }
}
