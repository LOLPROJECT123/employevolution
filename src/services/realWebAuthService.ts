
export interface BiometricAuthOptions {
  allowCredentials?: PublicKeyCredentialDescriptor[];
  userVerification?: UserVerificationRequirement;
  timeout?: number;
}

export interface BiometricRegistrationOptions {
  username: string;
  displayName: string;
  userHandle?: Uint8Array;
}

export interface WebAuthnCredential {
  id: string;
  type: 'public-key';
  rawId: ArrayBuffer;
  response: AuthenticatorAttestationResponse | AuthenticatorAssertionResponse;
}

export class RealWebAuthService {
  private static readonly RP_NAME = 'JobLift';
  private static readonly RP_ID = window.location.hostname;

  static async isWebAuthnSupported(): Promise<boolean> {
    return !!(window.PublicKeyCredential && 
             navigator.credentials && 
             typeof navigator.credentials.create === 'function');
  }

  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!await this.isWebAuthnSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  static async registerBiometric(options: BiometricRegistrationOptions): Promise<WebAuthnCredential | null> {
    if (!await this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const userHandle = options.userHandle || new TextEncoder().encode(options.username);

      const createCredentialOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: this.RP_NAME,
            id: this.RP_ID,
          },
          user: {
            id: userHandle,
            name: options.username,
            displayName: options.displayName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "preferred"
          },
          timeout: 60000,
          attestation: "direct"
        }
      };

      const credential = await navigator.credentials.create(createCredentialOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Store credential info for future authentication
      await this.storeCredentialInfo(credential);

      return {
        id: credential.id,
        type: credential.type as 'public-key',
        rawId: credential.rawId,
        response: credential.response as AuthenticatorAttestationResponse
      };
    } catch (error) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  }

  static async authenticateBiometric(options: BiometricAuthOptions = {}): Promise<WebAuthnCredential | null> {
    if (!await this.isWebAuthnSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const allowCredentials = options.allowCredentials || await this.getStoredCredentials();

      const getCredentialOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          allowCredentials,
          userVerification: options.userVerification || "required",
          timeout: options.timeout || 60000,
        }
      };

      const credential = await navigator.credentials.get(getCredentialOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Authentication failed');
      }

      return {
        id: credential.id,
        type: credential.type as 'public-key',
        rawId: credential.rawId,
        response: credential.response as AuthenticatorAssertionResponse
      };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      throw error;
    }
  }

  private static async storeCredentialInfo(credential: PublicKeyCredential): Promise<void> {
    const credentialInfo = {
      id: credential.id,
      type: credential.type,
      transports: (credential.response as any).getTransports?.() || []
    };

    // Store in localStorage for this demo (in production, store in secure backend)
    const existingCredentials = JSON.parse(localStorage.getItem('webauthn_credentials') || '[]');
    existingCredentials.push(credentialInfo);
    localStorage.setItem('webauthn_credentials', JSON.stringify(existingCredentials));
  }

  private static async getStoredCredentials(): Promise<PublicKeyCredentialDescriptor[]> {
    const storedCredentials = JSON.parse(localStorage.getItem('webauthn_credentials') || '[]');
    
    return storedCredentials.map((cred: any) => ({
      id: this.base64urlToBuffer(cred.id),
      type: cred.type,
      transports: cred.transports
    }));
  }

  static async verifyCredential(credential: WebAuthnCredential): Promise<boolean> {
    try {
      // In a real implementation, this would verify the credential on the server
      // For this demo, we'll do basic client-side validation
      
      if (!credential.id || !credential.rawId || !credential.response) {
        return false;
      }

      // Check if this credential exists in our stored credentials
      const storedCredentials = JSON.parse(localStorage.getItem('webauthn_credentials') || '[]');
      const matchingCredential = storedCredentials.find((cred: any) => cred.id === credential.id);
      
      return !!matchingCredential;
    } catch (error) {
      console.error('Credential verification failed:', error);
      return false;
    }
  }

  static async enableBiometricForUser(username: string, displayName: string): Promise<boolean> {
    try {
      const credential = await this.registerBiometric({ username, displayName });
      return !!credential;
    } catch (error) {
      console.error('Failed to enable biometric authentication:', error);
      return false;
    }
  }

  static async isBiometricEnabledForUser(): Promise<boolean> {
    const storedCredentials = JSON.parse(localStorage.getItem('webauthn_credentials') || '[]');
    return storedCredentials.length > 0;
  }

  static async disableBiometric(): Promise<boolean> {
    try {
      localStorage.removeItem('webauthn_credentials');
      return true;
    } catch (error) {
      console.error('Failed to disable biometric authentication:', error);
      return false;
    }
  }

  // Utility functions for WebAuthn
  private static base64urlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64.padEnd(base64.length + padLength, '=');
    
    const binary = atob(padded);
    const buffer = new ArrayBuffer(binary.length);
    const bytes = new Uint8Array(buffer);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return buffer;
  }

  private static bufferToBase64url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  static async getCredentialInfo(): Promise<any[]> {
    return JSON.parse(localStorage.getItem('webauthn_credentials') || '[]');
  }
}
