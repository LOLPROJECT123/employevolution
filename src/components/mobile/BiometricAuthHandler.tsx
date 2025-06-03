
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealWebAuthService } from '@/services/realWebAuthService';
import { Fingerprint, Shield, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface BiometricAuthHandlerProps {
  onAuthenticated?: () => void;
  displayMode?: 'full' | 'compact';
  username?: string;
}

export const BiometricAuthHandler: React.FC<BiometricAuthHandlerProps> = ({ 
  onAuthenticated, 
  displayMode = 'full',
  username = 'user'
}) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [credentialInfo, setCredentialInfo] = useState<any[]>([]);

  useEffect(() => {
    checkBiometricSupport();
    checkBiometricEnabled();
  }, []);

  const checkBiometricSupport = async () => {
    const supported = await RealWebAuthService.isWebAuthnSupported();
    setIsSupported(supported);
    
    if (supported) {
      const available = await RealWebAuthService.isPlatformAuthenticatorAvailable();
      setIsAvailable(available);
    }
  };

  const checkBiometricEnabled = async () => {
    const enabled = await RealWebAuthService.isBiometricEnabledForUser();
    setIsEnabled(enabled);
    if (enabled) {
      const info = await RealWebAuthService.getCredentialInfo();
      setCredentialInfo(info);
    }
  };

  const handleEnableBiometric = async () => {
    try {
      const displayName = username || 'User';
      const result = await RealWebAuthService.enableBiometricForUser(username, displayName);
      
      if (result) {
        toast.success("Biometric authentication enabled successfully!");
        setIsEnabled(true);
        checkBiometricEnabled(); // Refresh credential info
      } else {
        toast.error("Failed to enable biometric authentication");
      }
    } catch (error) {
      console.error('Error enabling biometric auth:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAuthenticateWithBiometric = async () => {
    setIsAuthenticating(true);
    try {
      const result = await RealWebAuthService.authenticateWithBiometric();
      
      if (result.success) {
        toast.success("Authentication successful!");
        if (onAuthenticated) onAuthenticated();
      } else {
        toast.error(`Authentication failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisableBiometric = async () => {
    try {
      const result = await RealWebAuthService.disableBiometric();
      if (result) {
        toast.success("Biometric authentication disabled");
        setIsEnabled(false);
        setCredentialInfo([]);
      } else {
        toast.error("Failed to disable biometric authentication");
      }
    } catch (error) {
      console.error('Error disabling biometric auth:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (displayMode === 'compact') {
    return (
      <div>
        {isSupported && isAvailable && (
          isEnabled ? (
            <Button
              onClick={handleAuthenticateWithBiometric}
              disabled={isAuthenticating}
              variant="ghost"
              size="icon"
              title="Login with biometrics"
            >
              {isAuthenticating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
            </Button>
          ) : null
        )}
      </div>
    );
  }

  if (isSupported === null) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-10 w-10 mx-auto animate-spin text-gray-400" />
          <p className="mt-4">Checking biometric support...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            Biometric Authentication Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your browser does not support WebAuthn, which is required for biometric authentication. 
            Please try a modern browser like Chrome, Firefox, Safari, or Edge.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            No Biometric Authenticator Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Your device does not have a biometric authenticator (fingerprint, face recognition)
            or it is not available. This feature requires a device with biometric capabilities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Fingerprint className="h-5 w-5" />
          Biometric Authentication
        </CardTitle>
        <CardDescription>
          {isEnabled 
            ? "Securely login using your device's biometric sensors"
            : "Enable biometric authentication for quicker sign-ins"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className={`h-5 w-5 ${isEnabled ? 'text-green-500' : 'text-gray-400'}`} />
          <span>Status:</span>
          {isEnabled ? (
            <span className="font-medium text-green-600">Enabled</span>
          ) : (
            <span className="font-medium text-gray-600">Not Enabled</span>
          )}
        </div>

        {isEnabled && credentialInfo.length > 0 && (
          <div className="rounded-md bg-gray-50 p-3 mt-2">
            <p className="text-sm font-medium mb-2">Registered Authenticators:</p>
            <ul className="text-xs space-y-1">
              {credentialInfo.map((cred, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  {cred.type} authenticator ({cred.transports?.join(', ') || 'unknown'})
                </li>
              ))}
            </ul>
          </div>
        )}

        {isEnabled ? (
          <div className="space-y-3 pt-2">
            <Button 
              onClick={handleAuthenticateWithBiometric}
              disabled={isAuthenticating}
              className="w-full"
            >
              {isAuthenticating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Fingerprint className="mr-2 h-4 w-4" />
                  Authenticate with Biometrics
                </>
              )}
            </Button>
            <Button 
              onClick={handleDisableBiometric}
              variant="outline"
              className="w-full"
            >
              Disable Biometric Authentication
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleEnableBiometric}
            className="w-full"
          >
            <Shield className="mr-2 h-4 w-4" />
            Enable Biometric Authentication
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BiometricAuthHandler;
