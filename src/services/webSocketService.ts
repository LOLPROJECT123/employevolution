
import { supabase } from '@/integrations/supabase/client';

export interface WebSocketConnection {
  id: string;
  socket: WebSocket;
  channel: string;
  isConnected: boolean;
  reconnectAttempts: number;
}

export class WebSocketService {
  private static connections: Map<string, WebSocketConnection> = new Map();
  private static maxReconnectAttempts = 5;
  private static reconnectDelay = 1000;

  static async createConnection(channel: string, onMessage: (data: any) => void): Promise<string> {
    const connectionId = `${channel}_${Date.now()}`;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');

      const wsUrl = `wss://pmcuyiwuobhqexbpkgnd.supabase.co/realtime/v1/websocket`;
      const socket = new WebSocket(`${wsUrl}?apikey=${supabase.supabaseKey}&vsn=1.0.0`);

      const connection: WebSocketConnection = {
        id: connectionId,
        socket,
        channel,
        isConnected: false,
        reconnectAttempts: 0
      };

      socket.onopen = () => {
        console.log(`WebSocket connected for channel: ${channel}`);
        connection.isConnected = true;
        connection.reconnectAttempts = 0;
        this.joinChannel(socket, channel, session.access_token);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        console.log(`WebSocket closed for channel: ${channel}`);
        connection.isConnected = false;
        this.handleReconnect(connectionId, channel, onMessage);
      };

      socket.onerror = (error) => {
        console.error(`WebSocket error for channel ${channel}:`, error);
      };

      this.connections.set(connectionId, connection);
      return connectionId;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      throw error;
    }
  }

  private static joinChannel(socket: WebSocket, channel: string, accessToken: string) {
    const joinMessage = {
      topic: channel,
      event: 'phx_join',
      payload: { access_token: accessToken },
      ref: Date.now().toString()
    };
    socket.send(JSON.stringify(joinMessage));
  }

  private static async handleReconnect(connectionId: string, channel: string, onMessage: (data: any) => void) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;

    if (connection.reconnectAttempts < this.maxReconnectAttempts) {
      connection.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, connection.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect to ${channel} (attempt ${connection.reconnectAttempts})`);
        this.createConnection(channel, onMessage);
      }, delay);
    } else {
      console.error(`Max reconnection attempts reached for channel: ${channel}`);
      this.connections.delete(connectionId);
    }
  }

  static sendMessage(connectionId: string, message: any): boolean {
    const connection = this.connections.get(connectionId);
    if (!connection || !connection.isConnected) {
      console.error('Connection not found or not connected:', connectionId);
      return false;
    }

    try {
      connection.socket.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  static closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.socket.close();
      this.connections.delete(connectionId);
    }
  }

  static closeAllConnections(): void {
    this.connections.forEach((connection, id) => {
      connection.socket.close();
    });
    this.connections.clear();
  }

  static getConnectionStatus(connectionId: string): boolean {
    const connection = this.connections.get(connectionId);
    return connection?.isConnected || false;
  }
}
