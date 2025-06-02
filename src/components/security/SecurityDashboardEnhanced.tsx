
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedAuthService } from '@/services/enhancedAuthService';
import { Shield, AlertTriangle, Key, Eye, Lock } from 'lucide-react';

export const SecurityDashboardEnhanced: React.FC = () => {
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    // Load security alerts and settings
    setSecurityAlerts([
      {
        id: '1',
        type: 'login_attempt',
        severity: 'medium',
        message: 'New login from unrecognized device',
        timestamp: new Date()
      }
    ]);
  };

  const handleEnable2FA = async () => {
    const result = await EnhancedAuthService.handleTwoFactorAuth('123456');
    setTwoFactorEnabled(result);
  };

  const handleEnableBiometric = async () => {
    const config = await EnhancedAuthService.setupBiometricAuth();
    setBiometricEnabled(config.enabled);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Two-Factor Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={twoFactorEnabled ? "default" : "destructive"}>
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              <Button size="sm" onClick={handleEnable2FA}>
                {twoFactorEnabled ? "Manage" : "Enable"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Biometric Auth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant={biometricEnabled ? "default" : "secondary"}>
                {biometricEnabled ? "Available" : "Not Available"}
              </Badge>
              <Button size="sm" onClick={handleEnableBiometric}>
                Setup
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge variant="default">1 Active</Badge>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {securityAlerts.map((alert) => (
            <Alert key={alert.id}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboardEnhanced;
