
import { Capacitor } from '@capacitor/core';

/**
 * Utility functions for mobile-specific features
 */

/**
 * Check if the app is running on a mobile device
 */
export const isMobileApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on iOS
 */
export const isIOS = (): boolean => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Get information about the current platform
 */
export const getPlatformInfo = () => {
  return {
    platform: Capacitor.getPlatform(),
    isNative: Capacitor.isNativePlatform(),
    isWeb: Capacitor.platform === 'web'
  };
};

/**
 * Check if app is running as a Chrome extension
 */
export const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id !== undefined;
};
