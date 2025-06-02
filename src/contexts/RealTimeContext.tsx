
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RealTimeService } from '@/services/realTimeService';
import { useLiveJobAlerts } from '@/hooks/useLiveJobAlerts';
import LiveChatSupport from '@/components/chat/LiveChatSupport';

interface RealTimeContextType {
  isConnected: boolean;
  showChat: () => void;
  hideChat: () => void;
  jobAlerts: ReturnType<typeof useLiveJobAlerts>;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(undefined);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const jobAlerts = useLiveJobAlerts();

  useEffect(() => {
    if (user) {
      setIsConnected(true);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    } else {
      setIsConnected(false);
      RealTimeService.cleanup();
    }

    return () => {
      if (!user) {
        RealTimeService.cleanup();
      }
    };
  }, [user]);

  const showChat = () => setIsChatOpen(true);
  const hideChat = () => setIsChatOpen(false);

  const contextValue: RealTimeContextType = {
    isConnected,
    showChat,
    hideChat,
    jobAlerts
  };

  return (
    <RealTimeContext.Provider value={contextValue}>
      {children}
      <LiveChatSupport 
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </RealTimeContext.Provider>
  );
};
