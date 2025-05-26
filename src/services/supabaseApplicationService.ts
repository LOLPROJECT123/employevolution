
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';

export interface ApplicationNote {
  id: string;
  content: string;
  created_at: string;
  type: 'general' | 'interview' | 'follow_up' | 'rejection';
}

export interface JobApplication {
  id: string;
  user_id: string;
  job_id: string;
  status: string;
  applied_at: string;
  updated_at: string;
  resume_version?: string;
  cover_letter?: string;
  notes?: string;
  follow_up_date?: string;
  interview_date?: string;
  salary_offered?: number;
  next_action?: string;
  contact_person?: string;
  application_url?: string;
}

class SupabaseApplicationService {
  async submitApplication(
    job: Job, 
    userId: string, 
    resumeVersion?: string, 
    coverLetter?: string,
    notes?: string
  ): Promise<JobApplication> {
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: userId,
        job_id: job.id,
        status: 'applied',
        resume_version: resumeVersion,
        cover_letter: coverLetter,
        notes: notes,
        application_url: job.applyUrl
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to submit application: ${error.message}`);
    }

    return data;
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: string, 
    notes?: string,
    interviewDate?: string,
    salaryOffered?: number
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    if (notes) updateData.notes = notes;
    if (interviewDate) updateData.interview_date = interviewDate;
    if (salaryOffered) updateData.salary_offered = salaryOffered;

    const { error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', applicationId);

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`);
    }
  }

  async getUserApplications(userId: string): Promise<JobApplication[]> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .order('applied_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`);
    }

    return data || [];
  }

  async getApplicationByJobId(userId: string, jobId: string): Promise<JobApplication | null> {
    const { data, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch application: ${error.message}`);
    }

    return data;
  }

  async getApplicationMetrics(userId: string): Promise<{
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseTime: number;
  }> {
    const applications = await this.getUserApplications(userId);
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

export const supabaseApplicationService = new SupabaseApplicationService();
