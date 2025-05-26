
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  category: 'follow_up' | 'thank_you' | 'withdrawal' | 'networking' | 'referral_request' | 'interview_request' | 'custom';
  subject: string;
  body: string;
  variables: string[];
  is_default: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name: string;
  job_title?: string;
  linkedin_url?: string;
  contact_type: 'recruiter' | 'hiring_manager' | 'employee' | 'hr' | 'referral' | 'other';
  source?: string;
  notes?: string;
  last_contacted?: string;
  relationship_strength: 'new' | 'warm' | 'strong' | 'close';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Communication {
  id: string;
  user_id: string;
  contact_id?: string;
  application_id?: string;
  communication_type: 'email' | 'phone' | 'linkedin' | 'in_person' | 'video_call';
  direction: 'outbound' | 'inbound';
  subject?: string;
  content?: string;
  template_used?: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied' | 'bounced';
  scheduled_for?: string;
  sent_at?: string;
  response_received: boolean;
  follow_up_required: boolean;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUpSequence {
  id: string;
  user_id: string;
  name: string;
  trigger_event: 'application_submitted' | 'interview_completed' | 'no_response' | 'custom';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FollowUpSequenceStep {
  id: string;
  sequence_id: string;
  step_number: number;
  delay_days: number;
  template_id?: string;
  is_active: boolean;
  created_at: string;
}

class CommunicationService {
  // Email Template Management
  async createEmailTemplate(template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<EmailTemplate> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        ...template,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create email template: ${error.message}`);
    return data as EmailTemplate;
  }

  async getEmailTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch email templates: ${error.message}`);
    return data as EmailTemplate[];
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update email template: ${error.message}`);
  }

  async deleteEmailTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete email template: ${error.message}`);
  }

  // Contact Management
  async createContact(contact: Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contact,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create contact: ${error.message}`);
    return data as Contact;
  }

  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch contacts: ${error.message}`);
    return data as Contact[];
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update contact: ${error.message}`);
  }

  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete contact: ${error.message}`);
  }

  // Communication History
  async createCommunication(communication: Omit<Communication, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Communication> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('communications')
      .insert({
        ...communication,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create communication: ${error.message}`);
    return data as Communication;
  }

  async getCommunications(contactId?: string, applicationId?: string): Promise<Communication[]> {
    let query = supabase
      .from('communications')
      .select('*')
      .order('created_at', { ascending: false });

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }
    if (applicationId) {
      query = query.eq('application_id', applicationId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch communications: ${error.message}`);
    return data as Communication[];
  }

  async updateCommunication(id: string, updates: Partial<Communication>): Promise<void> {
    const { error } = await supabase
      .from('communications')
      .update(updates)
      .eq('id', id);

    if (error) throw new Error(`Failed to update communication: ${error.message}`);
  }

  // Follow-up Sequences
  async createFollowUpSequence(sequence: Omit<FollowUpSequence, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<FollowUpSequence> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('follow_up_sequences')
      .insert({
        ...sequence,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create follow-up sequence: ${error.message}`);
    return data as FollowUpSequence;
  }

  async getFollowUpSequences(): Promise<FollowUpSequence[]> {
    const { data, error } = await supabase
      .from('follow_up_sequences')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch follow-up sequences: ${error.message}`);
    return data as FollowUpSequence[];
  }

  // Template variable replacement
  replaceTemplateVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    return result;
  }

  // Default templates
  async createDefaultTemplates(): Promise<void> {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) throw new Error('User not authenticated');

    const defaultTemplates = [
      {
        name: 'Follow-up After Application',
        category: 'follow_up' as const,
        subject: 'Following up on my application for {{position}} at {{company}}',
        body: `Dear {{contact_name}},

I hope this email finds you well. I recently submitted my application for the {{position}} role at {{company}} and wanted to follow up to express my continued interest.

I am particularly excited about this opportunity because {{reason_for_interest}}. My background in {{relevant_experience}} aligns well with the requirements outlined in the job description.

I would welcome the opportunity to discuss how my skills and experience can contribute to your team. Would you be available for a brief call in the coming week?

Thank you for your time and consideration.

Best regards,
{{your_name}}`,
        variables: ['position', 'company', 'contact_name', 'reason_for_interest', 'relevant_experience', 'your_name'],
        is_default: true,
        usage_count: 0
      },
      {
        name: 'Thank You After Interview',
        category: 'thank_you' as const,
        subject: 'Thank you for the {{position}} interview',
        body: `Dear {{interviewer_name}},

Thank you for taking the time to meet with me today to discuss the {{position}} role at {{company}}. I enjoyed our conversation about {{discussion_topic}} and learning more about the team's goals.

Our discussion reinforced my enthusiasm for this opportunity. I'm particularly excited about {{specific_interest}} and believe my experience with {{relevant_skill}} would be valuable to your team.

Please let me know if you need any additional information from me. I look forward to hearing about the next steps.

Best regards,
{{your_name}}`,
        variables: ['position', 'interviewer_name', 'company', 'discussion_topic', 'specific_interest', 'relevant_skill', 'your_name'],
        is_default: true,
        usage_count: 0
      },
      {
        name: 'Networking Introduction',
        category: 'networking' as const,
        subject: 'Introduction and interest in {{company}}',
        body: `Hi {{contact_name}},

I hope this message finds you well. I came across your profile on {{platform}} and was impressed by your work at {{company}}.

I'm currently exploring opportunities in {{industry}} and would love to learn more about your experience at {{company}}. Your background in {{their_expertise}} particularly caught my attention.

Would you be open to a brief 15-minute conversation over coffee or a phone call? I'd be grateful for any insights you could share about the industry and your company.

Thank you for your time and consideration.

Best regards,
{{your_name}}`,
        variables: ['contact_name', 'platform', 'company', 'industry', 'their_expertise', 'your_name'],
        is_default: true,
        usage_count: 0
      }
    ];

    for (const template of defaultTemplates) {
      await this.createEmailTemplate(template);
    }
  }
}

export const communicationService = new CommunicationService();
