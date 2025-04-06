
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f10a37c2e63f4030a98dc8d5440272f0',
  appName: 'employevolution',
  webDir: 'dist',
  server: {
    url: 'https://f10a37c2-e63f-4030-a98d-c8d5440272f0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
