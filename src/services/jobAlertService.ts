
import { JobAlert } from '@/types/auth';
import { Job, JobFilters } from '@/types/job';

class JobAlertService {
  private storageKey = 'job_alerts';

  async createAlert(
    userId: string,
    name: string,
    criteria: JobAlert['criteria'],
    frequency: JobAlert['frequency']
  ): Promise<JobAlert> {
    const alert: JobAlert = {
      id: `alert-${Date.now()}`,
      user_id: userId,
      name,
      criteria,
      frequency,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const alerts = this.getAlerts(userId);
    alerts.push(alert);
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(alerts));

    return alert;
  }

  getAlerts(userId: string): JobAlert[] {
    try {
      const stored = localStorage.getItem(`${this.storageKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  async updateAlert(userId: string, alertId: string, updates: Partial<JobAlert>): Promise<void> {
    const alerts = this.getAlerts(userId);
    const index = alerts.findIndex(alert => alert.id === alertId);
    
    if (index !== -1) {
      alerts[index] = { ...alerts[index], ...updates };
      localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(alerts));
    }
  }

  async deleteAlert(userId: string, alertId: string): Promise<void> {
    const alerts = this.getAlerts(userId);
    const filtered = alerts.filter(alert => alert.id !== alertId);
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(filtered));
  }

  async checkAlertsForNewJobs(userId: string, newJobs: Job[]): Promise<{ alert: JobAlert; matchingJobs: Job[] }[]> {
    const alerts = this.getAlerts(userId).filter(alert => alert.is_active);
    const matches: { alert: JobAlert; matchingJobs: Job[] }[] = [];

    for (const alert of alerts) {
      const matchingJobs = newJobs.filter(job => this.jobMatchesCriteria(job, alert.criteria));
      
      if (matchingJobs.length > 0) {
        matches.push({ alert, matchingJobs });
        
        // Update last triggered
        await this.updateAlert(userId, alert.id, {
          last_triggered: new Date().toISOString()
        });
      }
    }

    return matches;
  }

  private jobMatchesCriteria(job: Job, criteria: JobAlert['criteria']): boolean {
    // Check keywords
    if (criteria.keywords.length > 0) {
      const hasKeyword = criteria.keywords.some(keyword =>
        job.title.toLowerCase().includes(keyword.toLowerCase()) ||
        job.description.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // Check location
    if (criteria.location && !job.location.toLowerCase().includes(criteria.location.toLowerCase())) {
      return false;
    }

    // Check salary
    if (criteria.salary_min && job.salary.min < criteria.salary_min) {
      return false;
    }

    // Check remote
    if (criteria.remote && !job.remote) {
      return false;
    }

    // Check job types
    if (criteria.job_types && criteria.job_types.length > 0 && !criteria.job_types.includes(job.type)) {
      return false;
    }

    // Check companies
    if (criteria.companies && criteria.companies.length > 0) {
      const hasCompany = criteria.companies.some(company =>
        job.company.toLowerCase().includes(company.toLowerCase())
      );
      if (!hasCompany) return false;
    }

    return true;
  }

  async triggerNotification(userId: string, alert: JobAlert, jobs: Job[]): Promise<void> {
    // In a real app, this would send push notifications or emails
    console.log(`Job Alert: "${alert.name}" found ${jobs.length} new matching jobs`);
    
    // For now, we'll use browser notifications if available
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Job Alert: ${alert.name}`, {
        body: `Found ${jobs.length} new matching jobs`,
        icon: '/favicon.ico'
      });
    }
  }
}

export const jobAlertService = new JobAlertService();
