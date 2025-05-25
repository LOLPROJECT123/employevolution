
import { JobApplication, ApplicationStatus } from '@/types/auth';
import { Job } from '@/types/job';

class ApplicationService {
  private storageKey = 'job_applications';

  async submitApplication(job: Job, userId: string, resumeVersion?: string, coverLetter?: string): Promise<JobApplication> {
    const application: JobApplication = {
      id: `app-${Date.now()}`,
      user_id: userId,
      job_id: job.id,
      status: 'applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resume_version: resumeVersion,
      cover_letter: coverLetter
    };

    // Store in localStorage for now
    const applications = this.getApplications();
    applications.push(application);
    localStorage.setItem(this.storageKey, JSON.stringify(applications));

    return application;
  }

  async updateApplicationStatus(applicationId: string, status: ApplicationStatus, notes?: string): Promise<void> {
    const applications = this.getApplications();
    const index = applications.findIndex(app => app.id === applicationId);
    
    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        status,
        updated_at: new Date().toISOString(),
        notes: notes || applications[index].notes
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    }
  }

  getApplications(): JobApplication[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getUserApplications(userId: string): JobApplication[] {
    return this.getApplications().filter(app => app.user_id === userId);
  }

  getApplicationByJobId(userId: string, jobId: string): JobApplication | null {
    const applications = this.getUserApplications(userId);
    return applications.find(app => app.job_id === jobId) || null;
  }

  async addFollowUpReminder(applicationId: string, followUpDate: string): Promise<void> {
    const applications = this.getApplications();
    const index = applications.findIndex(app => app.id === applicationId);
    
    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        follow_up_date: followUpDate,
        updated_at: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    }
  }

  getApplicationStats(userId: string): {
    total: number;
    byStatus: Record<ApplicationStatus, number>;
    recentActivity: JobApplication[];
  } {
    const applications = this.getUserApplications(userId);
    
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<ApplicationStatus, number>);

    const recentActivity = applications
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    return {
      total: applications.length,
      byStatus,
      recentActivity
    };
  }
}

export const applicationService = new ApplicationService();
