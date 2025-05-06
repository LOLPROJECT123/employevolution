
// Utility functions to detect mobile app and Chrome extension environment

export const isMobileApp = (): boolean => {
  // Check if running in a mobile app context (Capacitor or Cordova)
  return (
    typeof window !== 'undefined' &&
    (window.hasOwnProperty('Capacitor') || 
     document.URL.includes('http://localhost') && (
       navigator.userAgent.match(/iPhone/i) ||
       navigator.userAgent.match(/iPad/i) ||
       navigator.userAgent.match(/Android/i)
     ))
  );
};

export const isChromeExtension = (): boolean => {
  // Check if running in a Chrome extension context
  return (
    typeof window !== 'undefined' &&
    window.chrome !== undefined &&
    window.chrome.runtime !== undefined &&
    typeof window.chrome.runtime.sendMessage === 'function'
  );
};

export const isIOS = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    (
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i)
    ) !== null
  );
};

export const isAndroid = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    navigator.userAgent.match(/Android/i) !== null
  );
};

export const isMobileSize = (): boolean => {
  return typeof window !== 'undefined' && window.innerWidth <= 768;
};
