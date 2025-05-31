
import { supabase } from '@/integrations/supabase/client';

export interface ResumeVersion {
  id: string;
  user_id: string;
  name: string;
  file_path?: string;
  file_content?: string;
  parsed_data?: any;
  is_active: boolean;
  version_number: number;
  created_at: string;
  updated_at: string;
}

class ResumeVersionService {
  async getResumeVersions(userId: string): Promise<ResumeVersion[]> {
    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resume versions:', error);
      return [];
    }

    return data || [];
  }

  async createResumeVersion(userId: string, resumeData: Partial<ResumeVersion>): Promise<ResumeVersion | null> {
    const existingVersions = await this.getResumeVersions(userId);
    const nextVersionNumber = Math.max(...existingVersions.map(v => v.version_number), 0) + 1;

    const { data, error } = await supabase
      .from('resume_versions')
      .insert({
        user_id: userId,
        version_number: nextVersionNumber,
        ...resumeData
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating resume version:', error);
      return null;
    }

    return data;
  }

  async setActiveResume(userId: string, resumeId: string): Promise<boolean> {
    // First, deactivate all resumes
    await supabase
      .from('resume_versions')
      .update({ is_active: false })
      .eq('user_id', userId);

    // Then activate the selected one
    const { error } = await supabase
      .from('resume_versions')
      .update({ is_active: true })
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting active resume:', error);
      return false;
    }

    return true;
  }

  async deleteResumeVersion(userId: string, resumeId: string): Promise<boolean> {
    const { error } = await supabase
      .from('resume_versions')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting resume version:', error);
      return false;
    }

    return true;
  }

  async getActiveResume(userId: string): Promise<ResumeVersion | null> {
    const { data, error } = await supabase
      .from('resume_versions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active resume:', error);
      return null;
    }

    return data;
  }
}

export const resumeVersionService = new ResumeVersionService();
