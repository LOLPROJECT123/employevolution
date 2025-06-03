
export interface WebAuthnCredential {
  id: string;
  type: string;
  rawId: ArrayBuffer;
  response: AuthenticatorResponse;
}

export interface BiometricAuthResult {
  success: boolean;
  credential?: WebAuthnCredential;
  error?: string;
}

export interface CredentialInfo {
  id: string;
  type: string;
  transports?: string[];
}

export class RealWebAuthService {
  static async isWebAuthnSupported(): Promise<boolean> {
    return !!(window.PublicKeyCredential && navigator.credentials);
  }

  static async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  static async isBiometricEnabledForUser(): Promise<boolean> {
    // Check localStorage for stored credentials
    const storedCredentials = localStorage.getItem('webauthn_credentials');
    return !!storedCredentials;
  }

  static async getCredentialInfo(): Promise<CredentialInfo[]> {
    const storedCredentials = localStorage.getItem('webauthn_credentials');
    if (!storedCredentials) return [];
    
    try {
      return JSON.parse(storedCredentials);
    } catch {
      return [];
    }
  }

  static async enableBiometricForUser(username: string, displayName: string): Promise<boolean> {
    try {
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
            id: new TextEncoder().encode(username),
            name: username,
            displayName: displayName,
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

      if (credential) {
        // Store credential info
        const credentialInfo: CredentialInfo = {
          id: credential.id,
          type: credential.type,
          transports: ['internal']
        };
        
        localStorage.setItem('webauthn_credentials', JSON.stringify([credentialInfo]));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
      return false;
    }
  }

  static async authenticateBiometric(): Promise<BiometricAuthResult> {
    try {
      const storedCredentials = await this.getCredentialInfo();
      if (storedCredentials.length === 0) {
        return { success: false, error: 'No stored credentials found' };
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: storedCredentials.map(cred => ({
            id: new TextEncoder().encode(cred.id),
            type: "public-key" as const,
            transports: cred.transports as AuthenticatorTransport[]
          })),
          timeout: 60000,
          userVerification: "required"
        }
      }) as PublicKeyCredential;

      if (credential) {
        return { 
          success: true, 
          credential: {
            id: credential.id,
            type: credential.type,
            rawId: credential.rawId,
            response: credential.response
          }
        };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      };
    }
  }

  static async disableBiometric(): Promise<boolean> {
    try {
      localStorage.removeItem('webauthn_credentials');
      return true;
    } catch {
      return false;
    }
  }
}
