
import { supabase } from '@/integrations/supabase/client';

class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string | null = null;

  private constructor() {}

  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  private async getEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    // In production, this would be stored securely in environment variables
    // For now, we'll use a default key (should be replaced with proper key management)
    this.encryptionKey = 'your-secret-encryption-key-32-chars'; // 32 characters for AES-256
    return this.encryptionKey;
  }

  private async generateKey(): Promise<CryptoKey> {
    const key = await this.getEncryptionKey();
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key.padEnd(32, '0').slice(0, 32));
    
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );
  }

  async encrypt(plaintext: string): Promise<string> {
    if (!plaintext) return plaintext;

    try {
      const key = await this.generateKey();
      const encoder = new TextEncoder();
      const data = encoder.encode(plaintext);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return plaintext; // Fallback to plaintext in case of error
    }
  }

  async decrypt(encryptedText: string): Promise<string> {
    if (!encryptedText) return encryptedText;

    try {
      const key = await this.generateKey();
      const combined = new Uint8Array(
        atob(encryptedText).split('').map(c => c.charCodeAt(0))
      );

      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Fallback to encrypted text in case of error
    }
  }

  // Helper methods for common PII fields
  async encryptEmail(email: string): Promise<string> {
    return this.encrypt(email);
  }

  async decryptEmail(encryptedEmail: string): Promise<string> {
    return this.decrypt(encryptedEmail);
  }

  async encryptContent(content: string): Promise<string> {
    return this.encrypt(content);
  }

  async decryptContent(encryptedContent: string): Promise<string> {
    return this.decrypt(encryptedContent);
  }
}

export const encryptionService = EncryptionService.getInstance();
