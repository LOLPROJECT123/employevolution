
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { RealTimeService, UserPresence } from '@/services/realTimeService';
import { useAuth } from '@/contexts/AuthContext';
import { Users } from 'lucide-react';

interface PresenceIndicatorProps {
  roomId: string;
  currentPage?: string;
  showUserList?: boolean;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  roomId,
  currentPage,
  showUserList = true
}) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = RealTimeService.subscribeToPresence(
      roomId,
      (users) => {
        setActiveUsers(users.filter(u => u.user_id !== user.id));
      }
    );

    // Update user presence
    const updatePresence = () => {
      RealTimeService.updatePresence(roomId, {
        user_id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
        status: 'online',
        last_seen: new Date().toISOString(),
        current_page: currentPage
      });
    };

    updatePresence();
    
    // Update presence every 30 seconds
    const interval = setInterval(updatePresence, 30000);

    // Update on page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, roomId, currentPage]);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <Badge variant="outline" className="text-xs">
          {activeUsers.length} online
        </Badge>
      </div>
      
      {showUserList && (
        <div className="flex -space-x-2">
          {activeUsers.slice(0, 5).map((user, index) => (
            <div key={user.user_id} className="relative">
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarFallback className="text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div 
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${
                  user.status === 'online' ? 'bg-green-500' : 
                  user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
              />
            </div>
          ))}
          {activeUsers.length > 5 && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted border-2 border-background text-xs">
              +{activeUsers.length - 5}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresenceIndicator;
