
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RealTimeService, ChatMessage } from '@/services/realTimeService';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react';

interface LiveChatSupportProps {
  roomId?: string;
  isOpen: boolean;
  onToggle: () => void;
}

export const LiveChatSupport: React.FC<LiveChatSupportProps> = ({
  roomId = 'general_support',
  isOpen,
  onToggle
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !isOpen) return;

    const unsubscribe = RealTimeService.subscribeToChat(
      roomId,
      (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    );

    setIsConnected(true);
    loadChatHistory();

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [user, roomId, isOpen]);

  const loadChatHistory = async () => {
    // In a real implementation, this would load recent chat history
    setMessages([
      {
        id: '1',
        user_id: 'support_bot',
        content: 'Welcome to EmployEvolution support! How can I help you today?',
        created_at: new Date().toISOString(),
        chat_room: roomId,
        message_type: 'system'
      }
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage;
    setNewMessage('');

    try {
      await RealTimeService.sendChatMessage(roomId, user.id, messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add message locally if real-time fails
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        user_id: user.id,
        content: messageText,
        created_at: new Date().toISOString(),
        chat_room: roomId,
        message_type: 'text'
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId: string) => {
    if (userId === 'support_bot') return 'Support Bot';
    if (userId === user?.id) return 'You';
    return 'Support Agent';
  };

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 rounded-full h-12 w-12 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-sm">Live Support</CardTitle>
            {isConnected && (
              <Badge variant="secondary" className="h-5 text-xs">
                Online
              </Badge>
            )}
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
              <Minimize2 className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-3 space-y-3">
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.user_id === user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-2 ${
                    message.user_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : message.message_type === 'system'
                      ? 'bg-muted text-muted-foreground text-center text-sm'
                      : 'bg-muted'
                  }`}
                >
                  {message.user_id !== user?.id && message.message_type !== 'system' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-xs">
                          {getUserName(message.user_id).charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">
                        {getUserName(message.user_id)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-2 text-sm text-muted-foreground">
                  Support is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveChatSupport;
