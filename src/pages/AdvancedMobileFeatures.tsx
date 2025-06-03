import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Smartphone, 
  Fingerprint, 
  Camera, 
  Wifi, 
  WifiOff, 
  Battery,
  Settings,
  Zap,
  Shield
} from 'lucide-react';
import { BiometricAuthHandler } from '@/components/mobile/BiometricAuthHandler';
import { AdvancedGestureService } from '@/services/advancedGestureService';
import { RealOCRService } from '@/services/realOCRService';
import { useIndexedDB } from '@/hooks/useIndexedDB';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdvancedMobileFeatures = () => {
  const [gestureHandler, setGestureHandler] = useState<AdvancedGestureService | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [scanResults, setScanResults] = useState<string>('');
  const [cacheStats, setCacheStats] = useState({ stored: 0, size: 0 });
  
  // Use the correct IndexedDB hook interface
  const indexedDB = useIndexedDB({
    name: 'JobCacheDB',
    version: 1,
    stores: [
      {
        name: 'jobs',
        keyPath: 'id',
        autoIncrement: false
      }
    ]
  });

  useEffect(() => {
    // Initialize gesture handling
    const container = document.getElementById('gesture-container');
    if (container) {
      const handler = AdvancedGestureService.enableRealGestures(container);
      setGestureHandler(handler);

      // Setup gesture listeners
      handler.on('swipe', (event) => {
        toast.success(`Swipe ${event.direction} detected!`);
      });

      handler.on('longpress', (event) => {
        toast.info('Long press detected!');
      });

      handler.on('pinch', (event) => {
        toast.info(`Pinch gesture: scale ${event.scale?.toFixed(2)}`);
      });
    }

    // Battery API
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
      });
    }

    // Network status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cache stats
    loadCacheStats();

    return () => {
      if (gestureHandler) {
        gestureHandler.destroy();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCacheStats = async () => {
    try {
      const jobs = await indexedDB.getAll('jobs');
      setCacheStats({
        stored: jobs.length,
        size: JSON.stringify(jobs).length
      });
    } catch (error) {
      console.error('Failed to load cache stats:', error);
    }
  };

  const handleDocumentScan = async () => {
    try {
      const result = await RealOCRService.scanDocument();
      if (result.success && result.text) {
        setScanResults(result.text);
        toast.success('Document scanned successfully!');
      } else {
        toast.error(result.error || 'Scan failed');
      }
    } catch (error) {
      toast.error('Camera access denied or not available');
    }
  };

  const cacheJobs = async () => {
    try {
      const mockJobs = [
        {
          id: 'job-1',
          title: 'Senior Developer',
          company: 'TechCorp',
          location: 'San Francisco',
          description: 'Exciting opportunity...',
          cached_at: new Date().toISOString()
        },
        {
          id: 'job-2',
          title: 'Product Manager',
          company: 'StartupXYZ',
          location: 'Remote',
          description: 'Lead product development...',
          cached_at: new Date().toISOString()
        }
      ];

      for (const job of mockJobs) {
        await indexedDB.add('jobs', job);
      }

      loadCacheStats();
      toast.success('Jobs cached successfully!');
    } catch (error) {
      toast.error('Failed to cache jobs');
    }
  };

  const clearCache = async () => {
    try {
      await indexedDB.clear('jobs');
      loadCacheStats();
      toast.success('Cache cleared!');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  // ... keep existing code (JSX return) the same
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Smartphone className="h-8 w-8" />
          Advanced Mobile Features
        </h1>
        <p className="text-muted-foreground mt-2">
          Experience cutting-edge mobile capabilities powered by modern web APIs
        </p>
      </div>

      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Device Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              <span>Battery Level</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={batteryLevel} className="w-24" />
              <span className="text-sm">{batteryLevel}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
              <span>Network Status</span>
            </div>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Biometric Authentication */}
      <BiometricAuthHandler />

      {/* Gesture Detection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Advanced Gesture Detection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            id="gesture-container"
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-32 bg-gray-50"
          >
            <p className="text-gray-600 mb-4">
              Try gestures in this area:
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Swipe (up, down, left, right)</p>
              <p>• Long press (hold for 500ms)</p>
              <p>• Pinch to zoom (two fingers)</p>
              <p>• Tap anywhere</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Scanning */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Document OCR Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleDocumentScan} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Scan Document
          </Button>
          
          {scanResults && (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Extracted Text:</h4>
              <pre className="text-sm whitespace-pre-wrap">{scanResults}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* IndexedDB Caching */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Local Data Caching
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Cached Jobs:</span>
            <Badge variant="outline">{cacheStats.stored} items</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Cache Size:</span>
            <Badge variant="outline">{(cacheStats.size / 1024).toFixed(1)} KB</Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={cacheJobs} variant="outline" className="flex-1">
              Cache Sample Jobs
            </Button>
            <Button onClick={clearCache} variant="outline" className="flex-1">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedMobileFeatures;
