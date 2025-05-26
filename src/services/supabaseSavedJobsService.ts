
import { supabase } from '@/integrations/supabase/client';
import { Job } from '@/types/job';

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  job_data: Job;
  saved_at: string;
  notes?: string;
}

class SupabaseSavedJobsService {
  async saveJob(userId: string, job: Job, notes?: string): Promise<SavedJob> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: userId,
        job_id: job.id,
        job_data: job,
        notes: notes
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save job: ${error.message}`);
    }

    return data;
  }

  async unsaveJob(userId: string, jobId: string): Promise<void> {
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId);

    if (error) {
      throw new Error(`Failed to unsave job: ${error.message}`);
    }
  }

  async getSavedJobs(userId: string): Promise<SavedJob[]> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch saved jobs: ${error.message}`);
    }

    return data || [];
  }

  async getSavedJobIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch saved job IDs: ${error.message}`);
    }

    return data?.map(item => item.job_id) || [];
  }

  async isJobSaved(userId: string, jobId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to check if job is saved: ${error.message}`);
    }

    return !!data;
  }
}

export const supabaseSavedJobsService = new SupabaseSavedJobsService();
