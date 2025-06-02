
import { supabase } from '@/integrations/supabase/client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'follow_up' | 'thank_you' | 'networking' | 'application';
  variables: string[];
}

export interface ScheduledEmail {
  id: string;
  templateId: string;
  recipientEmail: string;
  subject: string;
  content: string;
  scheduledAt: Date;
  status: 'pending' | 'sent' | 'failed';
}

export class EmailAutomationService {
  static async scheduleFollowUp(
    userId: string,
    recipientEmail: string,
    templateId: string,
    scheduledDate: Date,
    variables: Record<string, string> = {}
  ): Promise<void> {
    // Get template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (!template) {
      throw new Error('Email template not found');
    }

    // Replace variables in template
    let subject = template.subject;
    let content = template.body;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    // Mock implementation - log the scheduled email instead of using non-existent table
    console.log('Mock email automation: Scheduling email', {
      userId,
      templateId,
      recipientEmail,
      subject,
      content,
      scheduledAt: scheduledDate.toISOString(),
      status: 'pending'
    });
  }

  static async createTemplate(
    userId: string,
    template: Omit<EmailTemplate, 'id'>
  ): Promise<string> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        user_id: userId,
        name: template.name,
        subject: template.subject,
        body: template.body,
        category: template.category,
        variables: template.variables
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return data.id;
  }

  static async getTemplates(userId: string, category?: string): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', userId);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    // Transform database response to match EmailTemplate interface
    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category as 'follow_up' | 'thank_you' | 'networking' | 'application',
      variables: Array.isArray(template.variables) ? template.variables as string[] : []
    }));
  }

  static async getScheduledEmails(userId: string): Promise<ScheduledEmail[]> {
    // Mock implementation since email_automation table doesn't exist
    console.log('Mock email automation: Getting scheduled emails for user:', userId);
    
    return [
      {
        id: 'scheduled-1',
        templateId: 'template-1',
        recipientEmail: 'example@company.com',
        subject: 'Follow up on my application',
        content: 'Hello, I wanted to follow up...',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'pending'
      }
    ];
  }

  static getDefaultTemplates(): EmailTemplate[] {
    return [
      {
        id: 'follow_up_1',
        name: 'Application Follow-up (1 week)',
        subject: 'Following up on my {{position}} application',
        body: `Dear {{hiring_manager}},

I hope this email finds you well. I wanted to follow up on my application for the {{position}} role at {{company}} that I submitted on {{application_date}}.

I remain very interested in this opportunity and would welcome the chance to discuss how my experience in {{relevant_skills}} could contribute to your team.

Please let me know if you need any additional information from me.

Best regards,
{{your_name}}`,
        category: 'follow_up',
        variables: ['hiring_manager', 'position', 'company', 'application_date', 'relevant_skills', 'your_name']
      },
      {
        id: 'thank_you_interview',
        name: 'Post-Interview Thank You',
        subject: 'Thank you for the {{position}} interview',
        body: `Dear {{interviewer_name}},

Thank you for taking the time to interview me for the {{position}} role yesterday. I enjoyed our conversation about {{discussion_topic}} and learning more about {{company}}'s goals.

Our discussion reinforced my interest in the position and excitement about the opportunity to contribute to {{specific_project}}.

Please don't hesitate to contact me if you need any additional information.

Best regards,
{{your_name}}`,
        category: 'thank_you',
        variables: ['interviewer_name', 'position', 'discussion_topic', 'company', 'specific_project', 'your_name']
      },
      {
        id: 'networking_intro',
        name: 'LinkedIn Networking Introduction',
        subject: 'Connecting from {{mutual_connection}}',
        body: `Hi {{recipient_name}},

I hope you're doing well. {{mutual_connection}} suggested I reach out to you as someone who has great insights into {{industry/field}}.

I'm currently {{your_situation}} and would love to learn from your experience at {{their_company}}. Would you be open to a brief 15-minute coffee chat or phone call in the coming weeks?

I understand you're busy, so I'm happy to work around your schedule.

Thank you for considering!

Best,
{{your_name}}`,
        category: 'networking',
        variables: ['recipient_name', 'mutual_connection', 'industry/field', 'your_situation', 'their_company', 'your_name']
      }
    ];
  }

  static async sendImmediateEmail(
    userId: string,
    recipientEmail: string,
    subject: string,
    content: string
  ): Promise<void> {
    // This would integrate with an email service like SendGrid, Resend, etc.
    // For now, we'll just log it and mark as sent
    console.log('Sending email:', { recipientEmail, subject, content });

    // In a real implementation, you'd call an edge function
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: content,
        userId
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
  }

  static async cancelScheduledEmail(emailId: string): Promise<void> {
    // Mock implementation since email_automation table doesn't exist
    console.log('Mock email automation: Cancelling scheduled email:', emailId);
  }
}
