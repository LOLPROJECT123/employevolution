
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { RealTimeService, ChatMessage } from '@/services/realTimeService';
import { MessageSquare, Send, Minimize2, X, Users } from 'lucide-react';

interface LiveChatSupportProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const LiveChatSupport: React.FC<LiveChatSupportProps> = ({
  isOpen,
  onToggle
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRoomId = 'general-support';

  useEffect(() => {
    if (!user || !isOpen) return;

    // Subscribe to chat messages
    const unsubscribeChat = RealTimeService.subscribeToChat(
      chatRoomId,
      (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
      }
    );

    // Subscribe to user presence in chat
    const unsubscribePresence = RealTimeService.subscribeToPresence(
      `chat_${chatRoomId}`,
      (presences) => {
        setOnlineUsers(presences.map(p => p.name));
      }
    );

    setIsConnected(true);

    return () => {
      unsubscribeChat();
      unsubscribePresence();
    };
  }, [user, isOpen, chatRoomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      await RealTimeService.sendChatMessage(chatRoomId, user.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full w-14 h-14 shadow-lg"
          size="lg"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Live Support</CardTitle>
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {onlineUsers.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{onlineUsers.length} online</span>
              <div className="flex -space-x-1">
                {onlineUsers.slice(0, 3).map((userName, index) => (
                  <Avatar key={index} className="h-4 w-4 border border-background">
                    <AvatarFallback className="text-[10px]">
                      {userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start a conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-2 rounded-lg text-sm ${
                      message.user_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={sendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveChatSupport;
