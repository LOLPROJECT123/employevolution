
import { useState, useEffect } from 'react';
import { useMobile } from '@/hooks/use-mobile';

interface CapacitorFeatures {
  camera: boolean;
  filesystem: boolean;
  notifications: boolean;
  haptics: boolean;
  device: boolean;
}

export const useCapacitorFeatures = () => {
  const isMobile = useMobile();
  const [features, setFeatures] = useState<CapacitorFeatures>({
    camera: false,
    filesystem: false,
    notifications: false,
    haptics: false,
    device: false
  });

  const [isCapacitorReady, setIsCapacitorReady] = useState(false);

  useEffect(() => {
    if (isMobile && window.Capacitor) {
      setIsCapacitorReady(true);
      
      // Check available features
      const checkFeatures = async () => {
        const availableFeatures: CapacitorFeatures = {
          camera: !!window.Capacitor?.Plugins?.Camera,
          filesystem: !!window.Capacitor?.Plugins?.Filesystem,
          notifications: !!window.Capacitor?.Plugins?.PushNotifications,
          haptics: !!window.Capacitor?.Plugins?.Haptics,
          device: !!window.Capacitor?.Plugins?.Device
        };
        
        setFeatures(availableFeatures);
      };

      checkFeatures();
    }
  }, [isMobile]);

  const takePhoto = async () => {
    if (!features.camera) return null;
    
    try {
      const image = await window.Capacitor.Plugins.Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: 'uri'
      });
      return image;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  };

  const requestNotificationPermission = async () => {
    if (!features.notifications) return false;
    
    try {
      const permission = await window.Capacitor.Plugins.PushNotifications.requestPermissions();
      return permission.receive === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  const getDeviceInfo = async () => {
    if (!features.device) return null;
    
    try {
      return await window.Capacitor.Plugins.Device.getInfo();
    } catch (error) {
      console.error('Device info error:', error);
      return null;
    }
  };

  const triggerHaptic = async (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!features.haptics) return;
    
    try {
      await window.Capacitor.Plugins.Haptics.impact({ style: type });
    } catch (error) {
      console.error('Haptic error:', error);
    }
  };

  const writeFile = async (path: string, data: string) => {
    if (!features.filesystem) return false;
    
    try {
      await window.Capacitor.Plugins.Filesystem.writeFile({
        path,
        data,
        directory: 'Documents'
      });
      return true;
    } catch (error) {
      console.error('File write error:', error);
      return false;
    }
  };

  return {
    isCapacitorReady,
    features,
    takePhoto,
    requestNotificationPermission,
    getDeviceInfo,
    triggerHaptic,
    writeFile
  };
};
