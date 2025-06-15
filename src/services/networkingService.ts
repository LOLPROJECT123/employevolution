
import { supabase } from '@/integrations/supabase/client';

export interface NetworkingContact {
  id: string;
  name: string;
  title?: string;
  company: string;
  linkedinUrl?: string;
  email?: string;
  connectionType: string;
  mutualConnections: number;
  schoolMatch?: string;
  lastContacted?: string;
  createdAt: string;
  updatedAt: string;
}

class NetworkingService {
  async scanLinkedInNetwork(companyName: string, userSchool: string): Promise<NetworkingContact[]> {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-network-scanner', {
        body: {
          companyName,
          userSchool,
          searchTypes: ['recruiters', 'employees', 'alumni'],
          maxResults: 50
        }
      });

      if (error) {
        throw new Error(`LinkedIn network scanning failed: ${error.message}`);
      }

      return data.contacts || [];
    } catch (error) {
      console.error('LinkedIn network scanning error:', error);
      throw error;
    }
  }

  async saveContact(contact: Omit<NetworkingContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('networking_contacts')
        .insert({
          user_id: userData.user.id,
          name: contact.name,
          title: contact.title,
          company: contact.company,
          linkedin_url: contact.linkedinUrl,
          email: contact.email,
          connection_type: contact.connectionType,
          mutual_connections: contact.mutualConnections,
          school_match: contact.schoolMatch,
          last_contacted: contact.lastContacted
        });

      if (error) {
        throw new Error(`Failed to save contact: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      throw error;
    }
  }

  async getContacts(): Promise<NetworkingContact[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('networking_contacts')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get contacts: ${error.message}`);
      }

      return data?.map(item => ({
        id: item.id,
        name: item.name,
        title: item.title,
        company: item.company,
        linkedinUrl: item.linkedin_url,
        email: item.email,
        connectionType: item.connection_type,
        mutualConnections: item.mutual_connections || 0,
        schoolMatch: item.school_match,
        lastContacted: item.last_contacted,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error getting contacts:', error);
      return [];
    }
  }

  async updateLastContacted(contactId: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('networking_contacts')
        .update({
          last_contacted: new Date().toISOString()
        })
        .eq('id', contactId)
        .eq('user_id', userData.user.id);

      if (error) {
        throw new Error(`Failed to update contact: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  }

  async generateOutreachEmail(contact: NetworkingContact, emailType: string, userProfile: any, jobDetails?: any): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-email-generator', {
        body: {
          contact,
          template: { type: emailType },
          userProfile,
          jobDetails,
          emailType
        }
      });

      if (error) {
        throw new Error(`Email generation failed: ${error.message}`);
      }

      return data.generatedEmail || '';
    } catch (error) {
      console.error('Email generation error:', error);
      throw error;
    }
  }
}

export const networkingService = new NetworkingService();
