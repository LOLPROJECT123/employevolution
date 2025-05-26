
import { supabase } from '@/integrations/supabase/client';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

interface EmailNotification {
  to: string;
  templateId: string;
  variables: Record<string, string>;
  scheduledFor?: Date;
  priority: 'low' | 'normal' | 'high';
}

class EmailNotificationService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'job-application-confirmation',
        name: 'Job Application Confirmation',
        subject: 'Application Submitted: {{jobTitle}} at {{company}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Application Submitted Successfully!</h1>
            <p>Hi {{userName}},</p>
            <p>Your application for <strong>{{jobTitle}}</strong> at <strong>{{company}}</strong> has been submitted successfully.</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Application Details:</h3>
              <p><strong>Position:</strong> {{jobTitle}}</p>
              <p><strong>Company:</strong> {{company}}</p>
              <p><strong>Applied on:</strong> {{applicationDate}}</p>
              <p><strong>Application ID:</strong> {{applicationId}}</p>
            </div>
            <p>We'll keep track of your application and notify you of any updates.</p>
            <p>Good luck!</p>
            <p>Best regards,<br>The Emploevolution Team</p>
          </div>
        `,
        textContent: 'Your application for {{jobTitle}} at {{company}} has been submitted successfully.',
        variables: ['userName', 'jobTitle', 'company', 'applicationDate', 'applicationId']
      },
      {
        id: 'interview-reminder',
        name: 'Interview Reminder',
        subject: 'Reminder: Interview Tomorrow for {{jobTitle}}',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Interview Reminder</h1>
            <p>Hi {{userName}},</p>
            <p>This is a friendly reminder about your upcoming interview:</p>
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Interview Details:</h3>
              <p><strong>Position:</strong> {{jobTitle}}</p>
              <p><strong>Company:</strong> {{company}}</p>
              <p><strong>Date & Time:</strong> {{interviewDateTime}}</p>
              <p><strong>Location:</strong> {{location}}</p>
              <p><strong>Interviewer:</strong> {{interviewer}}</p>
            </div>
            <p>Make sure to:</p>
            <ul>
              <li>Review the job description</li>
              <li>Prepare questions about the role</li>
              <li>Arrive 10 minutes early</li>
              <li>Bring copies of your resume</li>
            </ul>
            <p>Best of luck!</p>
          </div>
        `,
        textContent: 'Interview reminder for {{jobTitle}} at {{company}} on {{interviewDateTime}}',
        variables: ['userName', 'jobTitle', 'company', 'interviewDateTime', 'location', 'interviewer']
      },
      {
        id: 'job-alert',
        name: 'Job Alert Notification',
        subject: '{{jobCount}} New Jobs Match Your Criteria',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>New Job Opportunities!</h1>
            <p>Hi {{userName}},</p>
            <p>We found {{jobCount}} new jobs that match your search criteria:</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Search:</strong> {{searchQuery}}</p>
              <p><strong>Location:</strong> {{location}}</p>
            </div>
            {{#jobList}}
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px;">
              <h3>{{title}}</h3>
              <p><strong>{{company}}</strong> • {{location}}</p>
              <p>{{salary}}</p>
              <a href="{{applyUrl}}" style="background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px;">View Job</a>
            </div>
            {{/jobList}}
            <p><a href="{{viewAllUrl}}">View all {{jobCount}} jobs</a></p>
          </div>
        `,
        textContent: 'Found {{jobCount}} new jobs matching your criteria. View them at {{viewAllUrl}}',
        variables: ['userName', 'jobCount', 'searchQuery', 'location', 'jobList', 'viewAllUrl']
      },
      {
        id: 'follow-up-reminder',
        name: 'Follow-up Reminder',
        subject: 'Time to Follow Up: {{jobTitle}} Application',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Follow-up Reminder</h1>
            <p>Hi {{userName}},</p>
            <p>It's been {{daysSinceApplication}} days since you applied for <strong>{{jobTitle}}</strong> at <strong>{{company}}</strong>.</p>
            <p>Consider following up with:</p>
            <ul>
              <li>A polite email to the hiring manager</li>
              <li>Connecting with employees on LinkedIn</li>
              <li>Checking the application status</li>
            </ul>
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Tip:</strong> A well-timed follow-up shows your continued interest and can help your application stand out.</p>
            </div>
            <p>Good luck!</p>
          </div>
        `,
        textContent: 'Time to follow up on your {{jobTitle}} application at {{company}} (applied {{daysSinceApplication}} days ago)',
        variables: ['userName', 'jobTitle', 'company', 'daysSinceApplication']
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async sendNotification(notification: EmailNotification): Promise<boolean> {
    try {
      const template = this.templates.get(notification.templateId);
      if (!template) {
        throw new Error(`Template ${notification.templateId} not found`);
      }

      const processedContent = this.processTemplate(template, notification.variables);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: notification.to,
          subject: processedContent.subject,
          html: processedContent.htmlContent,
          text: processedContent.textContent,
          priority: notification.priority,
          scheduledFor: notification.scheduledFor
        }
      });

      if (error) {
        console.error('Failed to send email:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email notification error:', error);
      return false;
    }
  }

  private processTemplate(template: EmailTemplate, variables: Record<string, string>): {
    subject: string;
    htmlContent: string;
    textContent: string;
  } {
    let subject = template.subject;
    let htmlContent = template.htmlContent;
    let textContent = template.textContent;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
      textContent = textContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, htmlContent, textContent };
  }

  async scheduleJobApplicationConfirmation(userEmail: string, applicationData: any): Promise<void> {
    await this.sendNotification({
      to: userEmail,
      templateId: 'job-application-confirmation',
      variables: {
        userName: applicationData.userName,
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        applicationDate: new Date().toLocaleDateString(),
        applicationId: applicationData.id
      },
      priority: 'normal'
    });
  }

  async scheduleInterviewReminder(userEmail: string, interviewData: any): Promise<void> {
    const reminderDate = new Date(interviewData.dateTime);
    reminderDate.setHours(reminderDate.getHours() - 24); // 24 hours before

    await this.sendNotification({
      to: userEmail,
      templateId: 'interview-reminder',
      variables: {
        userName: interviewData.userName,
        jobTitle: interviewData.jobTitle,
        company: interviewData.company,
        interviewDateTime: new Date(interviewData.dateTime).toLocaleString(),
        location: interviewData.location,
        interviewer: interviewData.interviewer
      },
      scheduledFor: reminderDate,
      priority: 'high'
    });
  }

  async sendJobAlert(userEmail: string, alertData: any): Promise<void> {
    await this.sendNotification({
      to: userEmail,
      templateId: 'job-alert',
      variables: {
        userName: alertData.userName,
        jobCount: alertData.jobs.length.toString(),
        searchQuery: alertData.searchQuery,
        location: alertData.location,
        jobList: alertData.jobs,
        viewAllUrl: `${window.location.origin}/jobs?alert=${alertData.alertId}`
      },
      priority: 'normal'
    });
  }

  async scheduleFollowUpReminder(userEmail: string, applicationData: any): Promise<void> {
    const followUpDate = new Date(applicationData.appliedDate);
    followUpDate.setDate(followUpDate.getDate() + 7); // 7 days after application

    await this.sendNotification({
      to: userEmail,
      templateId: 'follow-up-reminder',
      variables: {
        userName: applicationData.userName,
        jobTitle: applicationData.jobTitle,
        company: applicationData.company,
        daysSinceApplication: '7'
      },
      scheduledFor: followUpDate,
      priority: 'low'
    });
  }

  addCustomTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const emailNotificationService = new EmailNotificationService();
