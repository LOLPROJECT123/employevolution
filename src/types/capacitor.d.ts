
declare global {
  interface Window {
    Capacitor?: {
      Plugins: {
        Camera?: any;
        Filesystem?: any;
        PushNotifications?: any;
        Haptics?: any;
        Device?: any;
      };
    };
  }
}

export {};
