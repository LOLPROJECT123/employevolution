
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedAuthService } from '@/services/enhancedAuthService';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, AlertTriangle, Eye, Lock, Activity } from 'lucide-react';

export const SecurityDashboardEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [securityAlerts, setSecurityAlerts] = useState<any[]>([]);
  const [biometricConfig, setBiometricConfig] = useState<any>(null);
  const [sessionValid, setSessionValid] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState<any>(null);

  useEffect(() => {
    loadSecurityData();
    validateCurrentSession();
  }, []);

  const loadSecurityData = async () => {
    // Load security alerts (would come from database in real app)
    setSecurityAlerts([
      {
        id: '1',
        type: 'login_attempt',
        severity: 'medium',
        message: 'New login from Chrome on Windows',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        type: 'profile_update',
        severity: 'low',
        message: 'Profile information updated',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]);
  };

  const validateCurrentSession = async () => {
    const isValid = await EnhancedAuthService.validateSession();
    setSessionValid(isValid);
  };

  const handlePasswordCheck = (password: string) => {
    const strength = EnhancedAuthService.validatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const setupBiometric = async () => {
    try {
      const config = await EnhancedAuthService.setupBiometricAuth();
      setBiometricConfig(config);
    } catch (error) {
      console.error('Biometric setup failed:', error);
    }
  };

  const createSecurityAlert = async () => {
    await EnhancedAuthService.handleSecurityAlert({
      type: 'suspicious_activity',
      severity: 'high',
      message: 'Manual security test alert',
      ipAddress: '127.0.0.1'
    });
    
    // Refresh alerts
    loadSecurityData();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Enhanced Security Dashboard</CardTitle>
            </div>
            <Badge variant={sessionValid ? "default" : "destructive"}>
              {sessionValid ? "Secure Session" : "Session Invalid"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">2FA Status</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Two-factor authentication enabled
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Biometric Auth</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {biometricConfig?.enabled ? 'Available' : 'Not configured'}
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Activity Monitor</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Real-time threat detection active
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={setupBiometric} variant="outline">
              Setup Biometric Auth
            </Button>
            <Button onClick={createSecurityAlert} variant="outline">
              Test Security Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Security Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {securityAlerts.map((alert) => (
            <Alert key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <div className="text-xs text-muted-foreground mt-1 space-x-2">
                      <span>Type: {alert.type}</span>
                      <span>•</span>
                      <span>{alert.timestamp.toLocaleString()}</span>
                      {alert.ipAddress && (
                        <>
                          <span>•</span>
                          <span>IP: {alert.ipAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'destructive' :
                    alert.severity === 'medium' ? 'default' :
                    'secondary'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* Password Strength Tester */}
      <Card>
        <CardHeader>
          <CardTitle>Password Strength Validator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Test password strength..."
              onChange={(e) => handlePasswordCheck(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          {passwordStrength && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Strength Score:</span>
                <Badge variant={passwordStrength.isStrong ? "default" : "destructive"}>
                  {passwordStrength.score}/5
                </Badge>
              </div>
              
              {passwordStrength.feedback.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium">Recommendations:</span>
                  {passwordStrength.feedback.map((feedback: string, index: number) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      • {feedback}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Biometric Configuration */}
      {biometricConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Biometric Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <Badge variant={biometricConfig.enabled ? "default" : "secondary"}>
                  {biometricConfig.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              
              <div>
                <span className="text-sm font-medium">Supported Methods:</span>
                <div className="flex space-x-2 mt-1">
                  {biometricConfig.supportedMethods.map((method: string) => (
                    <Badge key={method} variant="outline">{method}</Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Fallback Enabled:</span>
                <Badge variant={biometricConfig.fallbackEnabled ? "default" : "secondary"}>
                  {biometricConfig.fallbackEnabled ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboardEnhanced;
