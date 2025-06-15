
import { supabase } from '@/integrations/supabase/client';

interface NetworkingContact {
  name: string;
  title: string;
  company: string;
  linkedinUrl: string;
  email?: string;
  connectionType: 'recruiter' | 'employee' | 'alumni';
  mutualConnections: number;
  schoolMatch?: string;
}

interface OutreachTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  category: 'referral' | 'coffee_chat' | 'networking' | 'follow_up';
  variables: string[];
}

class NetworkingAutomationService {
  async findRecruitersAndAlumni(companyName: string, userSchool: string): Promise<NetworkingContact[]> {
    try {
      console.log(`Finding recruiters and alumni for ${companyName}...`);
      
      const { data, error } = await supabase.functions.invoke('linkedin-network-scanner', {
        body: {
          companyName,
          userSchool,
          searchTypes: ['recruiters', 'alumni', 'employees'],
          maxResults: 50
        }
      });

      if (error) {
        throw new Error(`Network scanning failed: ${error.message}`);
      }

      return data.contacts || [];
    } catch (error) {
      console.error('Error finding recruiters and alumni:', error);
      throw error;
    }
  }

  async generateOutreachEmail(
    contact: NetworkingContact, 
    template: OutreachTemplate, 
    userProfile: any,
    jobDetails?: any
  ): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('ai-email-generator', {
        body: {
          contact,
          template,
          userProfile,
          jobDetails,
          emailType: template.category
        }
      });

      if (error) {
        throw new Error(`Email generation failed: ${error.message}`);
      }

      return data.generatedEmail;
    } catch (error) {
      console.error('Error generating outreach email:', error);
      throw error;
    }
  }

  async sendOutreachEmail(
    recipientEmail: string,
    subject: string,
    content: string,
    contactId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('send-outreach-email', {
        body: {
          to: recipientEmail,
          subject,
          content,
          contactId,
          emailType: 'outreach'
        }
      });

      if (error) {
        throw new Error(`Email sending failed: ${error.message}`);
      }

      // Log the outreach attempt
      await this.logOutreachAttempt(contactId, subject, content);

      return data.success;
    } catch (error) {
      console.error('Error sending outreach email:', error);
      return false;
    }
  }

  async getOutreachTemplates(): Promise<OutreachTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('category', 'outreach');

      if (error) {
        throw new Error(`Failed to get templates: ${error.message}`);
      }

      return data?.map(template => ({
        id: template.id,
        name: template.name,
        subject: template.subject,
        content: template.body,
        category: template.category,
        variables: template.variables || []
      })) || [];
    } catch (error) {
      console.error('Error getting outreach templates:', error);
      return [];
    }
  }

  async saveContact(contact: NetworkingContact, userId: string): Promise<void> {
    try {
      await supabase
        .from('contacts')
        .insert({
          user_id: userId,
          first_name: contact.name.split(' ')[0],
          last_name: contact.name.split(' ').slice(1).join(' '),
          email: contact.email,
          company_name: contact.company,
          job_title: contact.title,
          linkedin_url: contact.linkedinUrl,
          contact_type: contact.connectionType,
          source: 'automation',
          relationship_strength: 'new'
        });
    } catch (error) {
      console.error('Error saving contact:', error);
      throw error;
    }
  }

  private async logOutreachAttempt(contactId: string, subject: string, content: string): Promise<void> {
    try {
      await supabase
        .from('communications')
        .insert({
          contact_id: contactId,
          communication_type: 'email',
          direction: 'outbound',
          subject,
          content,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging outreach attempt:', error);
    }
  }
}

export const networkingAutomationService = new NetworkingAutomationService();
