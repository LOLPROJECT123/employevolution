
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Shield, Smartphone, Key, Check, AlertTriangle } from 'lucide-react';

interface TwoFactorAuthProps {
  onSetupComplete: () => void;
  onVerifyComplete: (code: string) => void;
  mode: 'setup' | 'verify';
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onSetupComplete,
  onVerifyComplete,
  mode
}) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const generateQRCode = async () => {
    try {
      // In a real implementation, this would call your backend
      const mockSecret = 'JBSWY3DPEHPK3PXP';
      const appName = 'EmployEvolution';
      const userEmail = 'user@example.com';
      
      const qrUrl = `otpauth://totp/${appName}:${userEmail}?secret=${mockSecret}&issuer=${appName}`;
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`);
      setSecret(mockSecret);
      
      // Generate backup codes
      const codes = Array.from({ length: 8 }, () => 
        Math.random().toString(36).substring(2, 8).toUpperCase()
      );
      setBackupCodes(codes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // In a real implementation, this would verify with your backend
      setTimeout(() => {
        if (mode === 'setup') {
          onSetupComplete();
          toast({
            title: "2FA Enabled",
            description: "Two-factor authentication has been successfully enabled",
          });
        } else {
          onVerifyComplete(verificationCode);
          toast({
            title: "Verification Successful",
            description: "Access granted",
          });
        }
        setIsVerifying(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code",
        variant: "destructive"
      });
      setIsVerifying(false);
    }
  };

  if (mode === 'verify') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>
          
          <Button 
            onClick={verifyCode} 
            disabled={verificationCode.length !== 6 || isVerifying}
            className="w-full"
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code from your authenticator app
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!qrCodeUrl ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Secure your account with two-factor authentication
            </p>
            <Button onClick={generateQRCode}>
              Get Started
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">Step 1</Badge>
                <span className="text-sm font-medium">Scan QR Code</span>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <img src={qrCodeUrl} alt="QR Code" className="border rounded-lg" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your authenticator app
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or enter this secret manually: <code className="bg-muted px-1 rounded">{secret}</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">Step 2</Badge>
                <span className="text-sm font-medium">Enter Verification Code</span>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="setup-code">Verification Code</Label>
                <Input
                  id="setup-code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
              </div>
            </div>

            {backupCodes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">Step 3</Badge>
                  <span className="text-sm font-medium">Save Backup Codes</span>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Key className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">Backup Codes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-background p-2 rounded">
                        {code}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start space-x-2 mt-3">
                    <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      Save these backup codes in a secure location. Each code can only be used once.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={verifyCode} 
              disabled={verificationCode.length !== 6 || isVerifying}
              className="w-full"
            >
              {isVerifying ? "Setting up..." : "Complete Setup"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;
