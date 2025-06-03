
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedMobileService } from '@/services/enhancedMobileService';
import { AdvancedGestureService } from '@/services/advancedGestureService';
import BiometricAuthHandler from '@/components/mobile/BiometricAuthHandler';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { 
  WifiOff, Wifi, Fingerprint, Camera, RefreshCw, 
  Smartphone, Database, Gesture, Bell, Check, X
} from 'lucide-react';
import { toast } from "sonner";

const AdvancedMobileFeatures: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [capabilities, setCapabilities] = useState<any>(null);
  const [documentScanResult, setDocumentScanResult] = useState<string | null>(null);
  const [isBiometricAuthenticated, setIsBiometricAuthenticated] = useState(false);
  const [isScanningDocument, setIsScanningDocument] = useState(false);
  const gestureAreaRef = useRef<HTMLDivElement>(null);
  const [gestureService, setGestureService] = useState<AdvancedGestureService | null>(null);
  const [lastGesture, setLastGesture] = useState<string | null>(null);
  
  const { isOnline, pendingActions, syncPendingActions, addOfflineAction } = useOfflineMode();
  const { isLoading: isDbLoading, error: dbError } = useIndexedDB(jobCacheDBConfig);

  // Initialize capabilities check
  useEffect(() => {
    setCapabilities(EnhancedMobileService.getOfflineCapabilities());
  }, []);

  // Set up gesture detection
  useEffect(() => {
    if (gestureAreaRef.current && !gestureService) {
      const service = new AdvancedGestureService(gestureAreaRef.current);
      
      service.on('swipe', (event) => {
        setLastGesture(`Swipe ${event.direction}`);
        toast(`Gesture detected: Swipe ${event.direction}`);
      });
      
      service.on('pinch', (event) => {
        setLastGesture(`Pinch (scale: ${event.scale?.toFixed(2)})`);
        toast(`Gesture detected: Pinch (scale: ${event.scale?.toFixed(2)})`);
      });
      
      service.on('tap', () => {
        setLastGesture('Tap');
      });
      
      service.on('longpress', () => {
        setLastGesture('Long press');
        toast(`Gesture detected: Long press`);
      });
      
      setGestureService(service);
      
      return () => {
        service.destroy();
      };
    }
  }, [gestureAreaRef.current]);

  const handleScanDocument = async () => {
    setIsScanningDocument(true);
    
    try {
      const result = await EnhancedMobileService.scanDocument();
      
      if (result.success && result.text) {
        setDocumentScanResult(result.text);
        toast.success("Document scanned successfully!");
      } else {
        toast.error(`Scan failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsScanningDocument(false);
    }
  };

  const handleSetupPushNotifications = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        toast.error("You need to be signed in to set up push notifications");
        return;
      }
      
      const result = await EnhancedMobileService.setupPushNotifications(data.user.id);
      
      if (result) {
        toast.success("Push notifications set up successfully!");
      } else {
        toast.error("Failed to set up push notifications");
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStoreOfflineData = () => {
    const testJob = {
      id: `job-${Date.now()}`,
      title: 'Senior Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'Full-time',
      description: 'Job created while offline',
      requirements: ['React', 'TypeScript'],
      posted: new Date().toISOString()
    };
    
    addOfflineAction('create', 'saved_jobs', testJob);
    toast.success("Job saved for offline sync!");
  };

  if (!capabilities) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-60">
          <RefreshCw className="h-12 w-12 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Advanced Mobile Features</CardTitle>
            <Badge variant={isOnline ? "outline" : "destructive"}>
              {isOnline ? (
                <Wifi className="h-4 w-4 mr-1" />
              ) : (
                <WifiOff className="h-4 w-4 mr-1" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
          <CardDescription>
            Explore advanced mobile capabilities powered by modern web standards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="biometric">Biometric</TabsTrigger>
              <TabsTrigger value="ocr">Document Scanner</TabsTrigger>
              <TabsTrigger value="offline">Offline Mode</TabsTrigger>
              <TabsTrigger value="gestures">Gestures</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertTitle>Mobile Web Capabilities</AlertTitle>
                <AlertDescription>
                  This demo showcases advanced mobile web features using modern APIs.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CapabilityCard
                  title="Biometric Authentication"
                  icon={<Fingerprint />}
                  available={capabilities.supportsBiometrics}
                  description="Secure login using device fingerprint or face recognition"
                />
                
                <CapabilityCard
                  title="Document Scanning"
                  icon={<Camera />}
                  available={capabilities.supportsCamera}
                  description="Scan documents and extract text with your camera"
                />
                
                <CapabilityCard
                  title="Offline Support"
                  icon={<Database />}
                  available={capabilities.supportsOfflineStorage}
                  description="Use the app offline with background sync"
                />
                
                <CapabilityCard
                  title="Push Notifications"
                  icon={<Bell />}
                  available={capabilities.supportsPush}
                  description="Receive instant updates even when app is closed"
                />
                
                <CapabilityCard
                  title="Advanced Gestures"
                  icon={<Gesture />}
                  available={true}
                  description="Rich interaction with swipe, pinch and other gestures"
                />
              </div>
            </TabsContent>
            
            {/* Biometric Tab */}
            <TabsContent value="biometric">
              <BiometricAuthHandler 
                onAuthenticated={() => setIsBiometricAuthenticated(true)}
              />
              
              {isBiometricAuthenticated && (
                <Alert className="mt-4 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Authentication Successful</AlertTitle>
                  <AlertDescription>
                    You've been authenticated using biometric credentials.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            {/* Document Scanner Tab */}
            <TabsContent value="ocr" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Camera className="h-12 w-12 mx-auto text-gray-400" />
                    <h3 className="text-lg font-medium">Document Scanner</h3>
                    <p className="text-sm text-gray-500">
                      Scan documents with your camera and extract text with OCR technology
                    </p>
                    
                    <Button 
                      onClick={handleScanDocument}
                      disabled={isScanningDocument || !capabilities.supportsCamera}
                      className="w-full"
                    >
                      {isScanningDocument ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Scanning...
                        </>
                      ) : (
                        <>Scan Document</>
                      )}
                    </Button>
                  </div>
                  
                  {documentScanResult && (
                    <div className="mt-6 border rounded p-4 bg-gray-50">
                      <h4 className="text-sm font-medium mb-2">Scanned Text:</h4>
                      <pre className="whitespace-pre-wrap text-xs">{documentScanResult}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Offline Mode Tab */}
            <TabsContent value="offline" className="space-y-4">
              <Alert>
                <Database className="h-4 w-4" />
                <AlertTitle>Offline Capabilities</AlertTitle>
                <AlertDescription>
                  JobLift works offline with automatic background synchronization when you're back online.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">IndexedDB Storage</h3>
                    <p className="text-sm text-gray-500">Local database for offline data storage</p>
                  </div>
                  <Badge variant={isDbLoading ? "secondary" : dbError ? "destructive" : "outline"}>
                    {isDbLoading ? "Loading..." : dbError ? "Error" : "Ready"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Sync Queue</h3>
                    <p className="text-sm text-gray-500">
                      {pendingActions.length} pending action(s) waiting to sync
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={syncPendingActions}
                    disabled={!isOnline || pendingActions.length === 0}
                  >
                    Sync Now
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleStoreOfflineData}>
                    Store Sample Offline Data
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button onClick={handleSetupPushNotifications} disabled={!capabilities.supportsPush}>
                    <Bell className="mr-2 h-4 w-4" />
                    Set Up Push Notifications
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Gestures Tab */}
            <TabsContent value="gestures">
              <div className="space-y-4">
                <Alert>
                  <Gesture className="h-4 w-4" />
                  <AlertTitle>Advanced Gestures</AlertTitle>
                  <AlertDescription>
                    Try different gestures in the area below: swipe (any direction), pinch, tap, long press.
                  </AlertDescription>
                </Alert>
                
                <div 
                  ref={gestureAreaRef}
                  className="h-64 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50"
                >
                  <div className="text-center">
                    <Gesture className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      {lastGesture ? `Last detected: ${lastGesture}` : 'Touch or swipe here'}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

interface CapabilityCardProps {
  title: string;
  icon: React.ReactNode;
  available: boolean;
  description: string;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({ title, icon, available, description }) => {
  return (
    <div className="border rounded-lg p-4 flex gap-4">
      <div className="text-gray-500 mt-1">{icon}</div>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{title}</h3>
          {available ? (
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              Available
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              <X className="h-3 w-3 mr-1" />
              Unavailable
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default AdvancedMobileFeatures;
