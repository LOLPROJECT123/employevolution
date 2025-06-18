
import { supabase } from '@/integrations/supabase/client';

export interface JobApplicationData {
  job_id?: string;
  external_job_id?: string;
  company_name: string;
  position_title: string;
  platform: string;
  application_url?: string;
  resume_used?: string;
  cover_letter_used?: string;
  notes?: string;
  status?: 'applied' | 'viewed' | 'interview' | 'rejected' | 'offer';
}

export interface ApplicationStats {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  applicationsByPlatform: Record<string, number>;
  responseRate: number;
  averageResponseTime: number;
  recentApplications: any[];
}

class ApplicationTrackingService {
  async trackApplication(userId: string, applicationData: JobApplicationData): Promise<string> {
    const { data, error } = await supabase
      .from('job_applications_tracking')
      .insert({
        user_id: userId,
        ...applicationData,
        application_date: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error tracking application:', error);
      throw error;
    }

    return data.id;
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
    if (interviewDate) updateData.interview_scheduled = interviewDate;
    if (salaryOffered) updateData.salary_offered = salaryOffered;

    const { error } = await supabase
      .from('job_applications_tracking')
      .update(updateData)
      .eq('id', applicationId);

    if (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  async getUserApplications(userId: string, limit?: number): Promise<any[]> {
    let query = supabase
      .from('job_applications_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('application_date', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user applications:', error);
      return [];
    }

    return data || [];
  }

  async getApplicationStats(userId: string): Promise<ApplicationStats> {
    const applications = await this.getUserApplications(userId);

    const stats: ApplicationStats = {
      totalApplications: applications.length,
      applicationsByStatus: {},
      applicationsByPlatform: {},
      responseRate: 0,
      averageResponseTime: 0,
      recentApplications: applications.slice(0, 5)
    };

    // Calculate status distribution
    applications.forEach(app => {
      stats.applicationsByStatus[app.status] = (stats.applicationsByStatus[app.status] || 0) + 1;
    });

    // Calculate platform distribution
    applications.forEach(app => {
      stats.applicationsByPlatform[app.platform] = (stats.applicationsByPlatform[app.platform] || 0) + 1;
    });

    // Calculate response rate
    const respondedApplications = applications.filter(app => 
      ['viewed', 'interview', 'rejected', 'offer'].includes(app.status)
    );
    stats.responseRate = applications.length > 0 ? (respondedApplications.length / applications.length) * 100 : 0;

    // Calculate average response time (in days)
    const responseTimes = respondedApplications
      .filter(app => app.updated_at !== app.application_date)
      .map(app => {
        const applied = new Date(app.application_date).getTime();
        const responded = new Date(app.updated_at).getTime();
        return (responded - applied) / (1000 * 60 * 60 * 24); // Convert to days
      });

    stats.averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return stats;
  }

  async setFollowUpDate(applicationId: string, followUpDate: string): Promise<void> {
    const { error } = await supabase
      .from('job_applications_tracking')
      .update({
        follow_up_date: followUpDate,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (error) {
      console.error('Error setting follow-up date:', error);
      throw error;
    }
  }

  async getApplicationsNeedingFollowUp(userId: string): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('job_applications_tracking')
      .select('*')
      .eq('user_id', userId)
      .lte('follow_up_date', today)
      .in('status', ['applied', 'viewed'])
      .order('follow_up_date', { ascending: true });

    if (error) {
      console.error('Error fetching follow-up applications:', error);
      return [];
    }

    return data || [];
  }

  async searchApplications(userId: string, query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('job_applications_tracking')
      .select('*')
      .eq('user_id', userId)
      .or(`company_name.ilike.%${query}%,position_title.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('application_date', { ascending: false });

    if (error) {
      console.error('Error searching applications:', error);
      return [];
    }

    return data || [];
  }
}

export const applicationTrackingService = new ApplicationTrackingService();
