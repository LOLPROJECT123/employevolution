
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

/**
 * Types of platforms the app can run on
 */
export enum PlatformType {
  WEB = 'web',
  ANDROID = 'android',
  IOS = 'ios',
  EXTENSION = 'extension'
}

/**
 * Check if the app is running in a mobile environment (Capacitor)
 */
export const isMobileApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running as a Chrome extension
 */
export const isChromeExtension = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).chrome !== 'undefined' && 
         typeof (window as any).chrome.runtime !== 'undefined' && 
         typeof (window as any).chrome.runtime.id !== 'undefined';
};

/**
 * Check if the current device has a mobile screen size
 */
export const isMobileScreenSize = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth < 768;
};

/**
 * Get the current platform the app is running on
 */
export const getCurrentPlatform = async (): Promise<PlatformType> => {
  if (isChromeExtension()) {
    return PlatformType.EXTENSION;
  }
  
  if (isMobileApp()) {
    try {
      const info = await Device.getInfo();
      if (info.platform === 'android') {
        return PlatformType.ANDROID;
      } else if (info.platform === 'ios') {
        return PlatformType.IOS;
      }
    } catch (error) {
      console.error('Error getting device info:', error);
    }
  }
  
  return PlatformType.WEB;
};

/**
 * Check if the app is running in a specific platform
 */
export const isPlatform = async (platform: PlatformType): Promise<boolean> => {
  const currentPlatform = await getCurrentPlatform();
  return currentPlatform === platform;
};
