
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Shield, Smartphone, Key } from "lucide-react";

interface MultiFactorAuthProps {
  onVerificationComplete: () => void;
  onCancel: () => void;
}

export const MultiFactorAuth: React.FC<MultiFactorAuthProps> = ({
  onVerificationComplete,
  onCancel
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');

  const handleSetupMFA = async () => {
    setIsVerifying(true);
    try {
      // In a real implementation, this would set up MFA with Supabase
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('verify');
      toast({
        title: "MFA Setup",
        description: "Check your authenticator app for the verification code.",
      });
    } catch (error) {
      toast({
        title: "Setup Failed",
        description: "Failed to set up multi-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    try {
      // In a real implementation, this would verify the MFA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "MFA Enabled",
        description: "Multi-factor authentication has been successfully enabled.",
      });
      onVerificationComplete();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  if (step === 'setup') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle>Enable Multi-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Step 1</p>
              <p className="text-sm text-blue-700">Install an authenticator app like Google Authenticator</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <Key className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">Step 2</p>
              <p className="text-sm text-green-700">Scan the QR code or enter the setup key</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-2">QR Code would appear here</p>
            <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center">
              <span className="text-gray-400 text-xs">QR Code</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSetupMFA} disabled={isVerifying} className="flex-1">
              {isVerifying ? 'Setting up...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Enter Verification Code</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="text-center text-lg tracking-widest"
            maxLength={6}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleVerifyCode} disabled={isVerifying || verificationCode.length !== 6} className="flex-1">
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
