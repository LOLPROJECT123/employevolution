
import React from 'react';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { register as registerSW } from './utils/serviceWorkerRegistration';
import { EnhancedAnalyticsService } from './services/enhancedAnalyticsService';

// Initialize analytics and RUM
EnhancedAnalyticsService.initializeRUM();

// Register service worker for PWA functionality
registerSW({
  onSuccess: (registration) => {
    console.log('SW registered: ', registration);
  },
  onUpdate: (registration) => {
    console.log('SW updated: ', registration);
  },
});

createRoot(document.getElementById("root")!).render(<App />);
