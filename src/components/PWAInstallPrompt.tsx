
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(event);
      
      // Show prompt after a delay to avoid being too aggressive
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // Show after 30 seconds
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
    } finally {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already installed or dismissed this session
  if (isInstalled || !showPrompt || !deferredPrompt || sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2 border-blue-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smartphone className="h-5 w-5 text-blue-600" />
              Install Streamline
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install our app for a better experience with offline access and push notifications!
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button onClick={handleInstallClick} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
            <Button variant="outline" onClick={handleDismiss}>
              Later
            </Button>
          </div>
          
          <div className="mt-3 text-xs text-muted-foreground">
            <ul className="space-y-1">
              <li>• Offline job browsing</li>
              <li>• Instant notifications</li>
              <li>• Faster loading</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
