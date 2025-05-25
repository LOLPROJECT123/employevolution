
import { JobApplication, ApplicationStatus, User } from '@/types/auth';
import { Job } from '@/types/job';

interface ApplicationNote {
  id: string;
  content: string;
  createdAt: string;
  type: 'general' | 'interview' | 'follow_up' | 'rejection';
}

interface EnhancedJobApplication extends Omit<JobApplication, 'notes'> {
  notes: ApplicationNote[];
  interview_date?: string;
  salary_offered?: number;
  next_action?: string;
  contact_person?: string;
  application_url?: string;
  resume_used?: string;
  cover_letter_used?: string;
}

class EnhancedApplicationService {
  private storageKey = 'enhanced_applications';
  private notesKey = 'application_notes';

  async submitApplication(
    job: Job, 
    userId: string, 
    resumeVersion?: string, 
    coverLetter?: string,
    notes?: string
  ): Promise<EnhancedJobApplication> {
    const application: EnhancedJobApplication = {
      id: `app-${Date.now()}`,
      user_id: userId,
      job_id: job.id,
      status: 'applied',
      applied_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      resume_version: resumeVersion,
      cover_letter: coverLetter,
      notes: notes ? [{
        id: `note-${Date.now()}`,
        content: notes,
        createdAt: new Date().toISOString(),
        type: 'general'
      }] : [],
      application_url: job.applyUrl
    };

    const applications = this.getApplications();
    applications.push(application);
    localStorage.setItem(this.storageKey, JSON.stringify(applications));

    return application;
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    notes?: string,
    interviewDate?: string,
    salaryOffered?: number
  ): Promise<void> {
    const applications = this.getApplications();
    const index = applications.findIndex(app => app.id === applicationId);
    
    if (index !== -1) {
      const application = applications[index];
      
      // Add status change note
      if (notes) {
        const newNote: ApplicationNote = {
          id: `note-${Date.now()}`,
          content: notes,
          createdAt: new Date().toISOString(),
          type: this.getNoteTypeFromStatus(status)
        };
        application.notes = [...(application.notes || []), newNote];
      }

      applications[index] = {
        ...application,
        status,
        updated_at: new Date().toISOString(),
        interview_date: interviewDate || application.interview_date,
        salary_offered: salaryOffered || application.salary_offered
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    }
  }

  private getNoteTypeFromStatus(status: ApplicationStatus): ApplicationNote['type'] {
    switch (status) {
      case 'phone_screen':
      case 'interview_scheduled':
      case 'interview_completed':
        return 'interview';
      case 'rejected':
        return 'rejection';
      default:
        return 'general';
    }
  }

  async addNote(applicationId: string, content: string, type: ApplicationNote['type'] = 'general'): Promise<void> {
    const applications = this.getApplications();
    const index = applications.findIndex(app => app.id === applicationId);
    
    if (index !== -1) {
      const newNote: ApplicationNote = {
        id: `note-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        type
      };
      
      applications[index].notes = [...(applications[index].notes || []), newNote];
      localStorage.setItem(this.storageKey, JSON.stringify(applications));
    }
  }

  getApplications(): EnhancedJobApplication[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getUserApplications(userId: string): EnhancedJobApplication[] {
    return this.getApplications().filter(app => app.user_id === userId);
  }

  getApplicationByJobId(userId: string, jobId: string): EnhancedJobApplication | null {
    const applications = this.getUserApplications(userId);
    return applications.find(app => app.job_id === jobId) || null;
  }

  getApplicationsPipeline(userId: string): Record<ApplicationStatus, EnhancedJobApplication[]> {
    const applications = this.getUserApplications(userId);
    const pipeline: Record<ApplicationStatus, EnhancedJobApplication[]> = {
      applied: [],
      phone_screen: [],
      interview_scheduled: [],
      interview_completed: [],
      offer_received: [],
      offer_accepted: [],
      rejected: [],
      withdrawn: []
    };

    applications.forEach(app => {
      pipeline[app.status].push(app);
    });

    return pipeline;
  }

  getApplicationMetrics(userId: string): {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseTime: number;
  } {
    const applications = this.getUserApplications(userId);
    const total = applications.length;
    
    if (total === 0) {
      return {
        totalApplications: 0,
        responseRate: 0,
        interviewRate: 0,
        offerRate: 0,
        avgResponseTime: 0
      };
    }

    const responded = applications.filter(app => 
      ['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    const interviewed = applications.filter(app => 
      ['interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    const offers = applications.filter(app => 
      ['offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    return {
      totalApplications: total,
      responseRate: (responded / total) * 100,
      interviewRate: (interviewed / total) * 100,
      offerRate: (offers / total) * 100,
      avgResponseTime: 3 // Mock average response time in days
    };
  }
}

export const enhancedApplicationService = new EnhancedApplicationService();
