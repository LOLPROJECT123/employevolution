
import { supabase } from '@/integrations/supabase/client';

interface BrowserUseConfig {
  headless: boolean;
  proxyRotation: boolean;
  rateLimiting: number;
  maxConcurrentSessions: number;
}

interface AutomationTask {
  id: string;
  type: 'job_scraping' | 'application_submission' | 'email_outreach' | 'linkedin_connect';
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: any;
  userId: string;
  createdAt: string;
  completedAt?: string;
}

interface JobScrapingResult {
  jobsFound: number;
  applicationsSubmitted: number;
  errors: string[];
  duration: number;
}

class BrowserUseService {
  private config: BrowserUseConfig = {
    headless: true,
    proxyRotation: true,
    rateLimiting: 3000,
    maxConcurrentSessions: 2
  };

  async initializeBrowserAgent(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'initialize',
          config: this.config,
          userId
        }
      });

      if (error) throw error;
      return data.sessionId;
    } catch (error) {
      console.error('Failed to initialize browser agent:', error);
      throw error;
    }
  }

  async startJobScrapingSession(
    sessionId: string,
    platforms: string[],
    searchCriteria: {
      query: string;
      location: string;
      remote?: boolean;
      salaryMin?: number;
      experienceLevel?: string;
    }
  ): Promise<AutomationTask> {
    const task: AutomationTask = {
      id: `scraping-${Date.now()}`,
      type: 'job_scraping',
      status: 'pending',
      data: { sessionId, platforms, searchCriteria },
      userId: sessionId,
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'scrape_jobs',
          sessionId,
          platforms,
          searchCriteria,
          taskId: task.id
        }
      });

      if (error) throw error;
      
      task.status = 'running';
      await this.saveTask(task);
      
      return task;
    } catch (error) {
      console.error('Failed to start job scraping:', error);
      task.status = 'failed';
      await this.saveTask(task);
      throw error;
    }
  }

  async startApplicationSubmission(
    sessionId: string,
    jobUrls: string[],
    userProfile: any,
    resumeContent: string,
    coverLetter?: string
  ): Promise<AutomationTask> {
    const task: AutomationTask = {
      id: `application-${Date.now()}`,
      type: 'application_submission',
      status: 'pending',
      data: { sessionId, jobUrls, userProfile, resumeContent, coverLetter },
      userId: sessionId,
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'submit_applications',
          sessionId,
          jobUrls,
          userProfile,
          resumeContent,
          coverLetter,
          taskId: task.id
        }
      });

      if (error) throw error;
      
      task.status = 'running';
      await this.saveTask(task);
      
      return task;
    } catch (error) {
      console.error('Failed to start application submission:', error);
      task.status = 'failed';
      await this.saveTask(task);
      throw error;
    }
  }

  async startEmailOutreach(
    sessionId: string,
    contacts: Array<{
      email: string;
      name: string;
      company: string;
      position?: string;
    }>,
    emailTemplate: string,
    personalizationData: any
  ): Promise<AutomationTask> {
    const task: AutomationTask = {
      id: `outreach-${Date.now()}`,
      type: 'email_outreach',
      status: 'pending',
      data: { sessionId, contacts, emailTemplate, personalizationData },
      userId: sessionId,
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'send_outreach_emails',
          sessionId,
          contacts,
          emailTemplate,
          personalizationData,
          taskId: task.id
        }
      });

      if (error) throw error;
      
      task.status = 'running';
      await this.saveTask(task);
      
      return task;
    } catch (error) {
      console.error('Failed to start email outreach:', error);
      task.status = 'failed';
      await this.saveTask(task);
      throw error;
    }
  }

  async startLinkedInConnect(
    sessionId: string,
    profiles: Array<{
      profileUrl: string;
      name: string;
      position: string;
      company: string;
    }>,
    messageTemplate: string
  ): Promise<AutomationTask> {
    const task: AutomationTask = {
      id: `linkedin-${Date.now()}`,
      type: 'linkedin_connect',
      status: 'pending',
      data: { sessionId, profiles, messageTemplate },
      userId: sessionId,
      createdAt: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'linkedin_connect',
          sessionId,
          profiles,
          messageTemplate,
          taskId: task.id
        }
      });

      if (error) throw error;
      
      task.status = 'running';
      await this.saveTask(task);
      
      return task;
    } catch (error) {
      console.error('Failed to start LinkedIn connections:', error);
      task.status = 'failed';
      await this.saveTask(task);
      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<AutomationTask | null> {
    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'get_task_status',
          taskId
        }
      });

      if (error) throw error;
      return data.task;
    } catch (error) {
      console.error('Failed to get task status:', error);
      return null;
    }
  }

  async stopTask(taskId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'stop_task',
          taskId
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to stop task:', error);
      throw error;
    }
  }

  async closeBrowserSession(sessionId: string): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('browser-automation', {
        body: {
          action: 'close_session',
          sessionId
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to close browser session:', error);
      throw error;
    }
  }

  private async saveTask(task: AutomationTask): Promise<void> {
    // Save task to local storage for now, can be moved to Supabase later
    const tasks = JSON.parse(localStorage.getItem('automation_tasks') || '[]');
    const existingIndex = tasks.findIndex((t: AutomationTask) => t.id === task.id);
    
    if (existingIndex >= 0) {
      tasks[existingIndex] = task;
    } else {
      tasks.push(task);
    }
    
    localStorage.setItem('automation_tasks', JSON.stringify(tasks));
  }

  async getAutomationMetrics(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    jobsScraped: number;
    applicationsSubmitted: number;
    emailsSent: number;
    connectionsRequested: number;
  }> {
    const tasks = JSON.parse(localStorage.getItem('automation_tasks') || '[]')
      .filter((task: AutomationTask) => task.userId === userId);

    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t: AutomationTask) => t.status === 'completed').length,
      failedTasks: tasks.filter((t: AutomationTask) => t.status === 'failed').length,
      jobsScraped: tasks
        .filter((t: AutomationTask) => t.type === 'job_scraping' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.data?.jobsFound || 0), 0),
      applicationsSubmitted: tasks
        .filter((t: AutomationTask) => t.type === 'application_submission' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.data?.applicationsSubmitted || 0), 0),
      emailsSent: tasks
        .filter((t: AutomationTask) => t.type === 'email_outreach' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.data?.emailsSent || 0), 0),
      connectionsRequested: tasks
        .filter((t: AutomationTask) => t.type === 'linkedin_connect' && t.status === 'completed')
        .reduce((sum, t) => sum + (t.data?.connectionsRequested || 0), 0)
    };
  }
}

export const browserUseService = new BrowserUseService();
