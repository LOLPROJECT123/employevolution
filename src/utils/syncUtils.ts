
import { supabase } from '@/integrations/supabase/client';
import { Job, JobApplicationStatus } from '@/types/job';

export interface SyncedData {
  jobs: Job[];
  applications: any[];
  lastSync: string;
}

export class SyncUtils {
  static async syncUserData(userId: string): Promise<SyncedData> {
    try {
      const [jobsResult, applicationsResult] = await Promise.all([
        supabase.from('saved_jobs').select('*').eq('user_id', userId),
        supabase.from('job_applications').select('*').eq('user_id', userId)
      ]);

      return {
        jobs: jobsResult.data?.map(job => job.job_data as Job) || [],
        applications: applicationsResult.data || [],
        lastSync: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error syncing user data:', error);
      throw error;
    }
  }

  static async updateApplicationStatus(
    userId: string, 
    jobId: string, 
    status: JobApplicationStatus
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status })
        .eq('user_id', userId)
        .eq('job_id', jobId);

      return !error;
    } catch (error) {
      console.error('Error updating application status:', error);
      return false;
    }
  }
}
