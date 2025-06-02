
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'video_call_invite';
  timestamp: string;
  read: boolean;
  metadata?: any;
}

export interface VideoCallSession {
  id: string;
  participants: string[];
  status: 'scheduled' | 'active' | 'ended';
  scheduledTime?: string;
  startTime?: string;
  endTime?: string;
  recordingUrl?: string;
}

export class CommunicationService {
  static async sendMessage(message: Omit<Message, 'id' | 'timestamp' | 'read'>): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          ...message,
          timestamp: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Send real-time notification
      await supabase
        .channel('messages')
        .send({
          type: 'broadcast',
          event: 'new_message',
          payload: data
        });

      return { success: true, messageId: data.id };
    } catch (error) {
      console.error('Message send failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  static async initiateVideoCall(participants: string[], scheduledTime?: string): Promise<{
    success: boolean;
    sessionId?: string;
    joinUrl?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('create-video-call', {
        body: {
          participants,
          scheduledTime
        }
      });

      if (error) throw error;

      // Store session in database
      await supabase
        .from('video_call_sessions')
        .insert({
          id: data.sessionId,
          participants,
          status: scheduledTime ? 'scheduled' : 'active',
          scheduledTime,
          startTime: scheduledTime ? null : new Date().toISOString()
        });

      return {
        success: true,
        sessionId: data.sessionId,
        joinUrl: data.joinUrl
      };
    } catch (error) {
      console.error('Video call initiation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create video call'
      };
    }
  }

  static async findLinkedInContacts(searchQuery: {
    company?: string;
    title?: string;
    location?: string;
    industry?: string;
  }): Promise<{
    success: boolean;
    contacts?: Array<{
      id: string;
      name: string;
      title: string;
      company: string;
      profileUrl: string;
      mutualConnections: number;
    }>;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-contact-search', {
        body: searchQuery
      });

      if (error) throw error;

      return { success: true, contacts: data.contacts };
    } catch (error) {
      console.error('LinkedIn contact search failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Contact search failed'
      };
    }
  }

  static async automateEmailSequence(sequence: {
    templateIds: string[];
    recipientId: string;
    delayDays: number[];
    triggerEvent: 'application_submitted' | 'interview_scheduled' | 'custom';
  }): Promise<{ success: boolean; sequenceId?: string; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .insert({
          ...sequence,
          status: 'active',
          createdAt: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule emails
      await supabase.functions.invoke('schedule-email-sequence', {
        body: { sequenceId: data.id, sequence }
      });

      return { success: true, sequenceId: data.id };
    } catch (error) {
      console.error('Email automation setup failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to setup email automation'
      };
    }
  }

  static async getUnreadMessages(userId: string): Promise<{
    success: boolean;
    messages?: Message[];
    count?: number;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('receiverId', userId)
        .eq('read', false)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        messages: data,
        count: data.length
      };
    } catch (error) {
      console.error('Message retrieval failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get messages'
      };
    }
  }
}
