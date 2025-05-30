
import { supabase } from "@/integrations/supabase/client";
import { ParsedResume } from "@/types/resume";

export interface ResumeFile {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_content: string;
  parsed_data: ParsedResume;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStatus {
  id: string;
  user_id: string;
  resume_uploaded: boolean;
  profile_completed: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

class ResumeFileService {
  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Save uploaded resume file
  async saveResumeFile(userId: string, file: File, parsedData: ParsedResume): Promise<boolean> {
    try {
      console.log('Saving resume file for user:', userId);
      
      // Convert file to base64
      const fileContent = await this.fileToBase64(file);
      
      // Mark all existing resumes as not current
      await supabase
        .from('user_resume_files')
        .update({ is_current: false })
        .eq('user_id', userId);

      // Insert new resume file with proper JSON casting
      const { error } = await supabase
        .from('user_resume_files')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_content: fileContent,
          parsed_data: parsedData as any, // Cast to any to satisfy JSON type
          is_current: true
        });

      if (error) {
        console.error('Error saving resume file:', error);
        return false;
      }

      // Update onboarding status
      await this.updateOnboardingStatus(userId, { resume_uploaded: true });
      
      console.log('Resume file saved successfully');
      return true;
    } catch (error) {
      console.error('Error in saveResumeFile:', error);
      return false;
    }
  }

  // Get current resume file
  async getCurrentResumeFile(userId: string): Promise<ResumeFile | null> {
    try {
      const { data, error } = await supabase
        .from('user_resume_files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current resume file:', error);
        return null;
      }

      // Cast parsed_data back to ParsedResume type with proper type conversion
      if (data) {
        return {
          ...data,
          parsed_data: data.parsed_data as unknown as ParsedResume
        } as ResumeFile;
      }

      return null;
    } catch (error) {
      console.error('Error in getCurrentResumeFile:', error);
      return null;
    }
  }

  // Get onboarding status
  async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching onboarding status:', error);
        return null;
      }

      // If no onboarding record exists, create one
      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: userId,
            resume_uploaded: false,
            profile_completed: false,
            onboarding_completed: false
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating onboarding record:', insertError);
          return null;
        }

        return newData;
      }

      return data;
    } catch (error) {
      console.error('Error in getOnboardingStatus:', error);
      return null;
    }
  }

  // Update onboarding status
  async updateOnboardingStatus(userId: string, updates: Partial<Omit<OnboardingStatus, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating onboarding status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateOnboardingStatus:', error);
      return false;
    }
  }

  // Check if profile is complete
  async checkProfileCompletion(userId: string, profileData: any): Promise<boolean> {
    const requiredFields = [
      'name',
      'email',
      'phone',
      'location'
    ];

    const isComplete = requiredFields.every(field => {
      const value = profileData[field];
      return value && value.trim() !== '';
    }) && 
    profileData.workExperiences?.length > 0 && 
    profileData.education?.length > 0 &&
    profileData.skills?.length > 0;

    // Update onboarding status if profile is complete
    if (isComplete) {
      await this.updateOnboardingStatus(userId, { 
        profile_completed: true,
        onboarding_completed: true 
      });
    }

    return isComplete;
  }
}

export const resumeFileService = new ResumeFileService();
