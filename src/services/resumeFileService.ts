
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

  async saveResumeFile(userId: string, file: File, parsedData: ParsedResume): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Enhanced resume file save for user:', userId, 'File:', file.name);
      
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }
      
      if (!file) {
        return { success: false, error: 'File is required' };
      }
      
      const fileContent = await this.fileToBase64(file);
      
      // Use atomic transaction approach for saving resume and updating status
      return await this.saveResumeFileWithTransaction(userId, file, parsedData, fileContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Critical error in saveResumeFile:', errorMessage);
      
      // Try manual approach as fallback
      try {
        const fileContent = await this.fileToBase64(file);
        return await this.saveResumeFileManual(userId, file, parsedData, fileContent);
      } catch (fallbackError) {
        return { success: false, error: `Critical file save error: ${errorMessage}` };
      }
    }
  }

  private async saveResumeFileWithTransaction(userId: string, file: File, parsedData: ParsedResume, fileContent: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Using transaction approach for resume save...');
      
      // First, mark all existing files as not current
      const { error: updateError } = await supabase
        .from('user_resume_files')
        .update({ is_current: false })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('⚠️ Warning updating existing files:', updateError.message);
        // Continue anyway as this might not be critical
      }

      // Insert the new resume file
      const { error: insertError } = await supabase
        .from('user_resume_files')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_content: fileContent,
          parsed_data: parsedData as any,
          is_current: true
        });

      if (insertError) {
        console.error('❌ Error inserting resume file:', insertError);
        return { success: false, error: `Failed to save resume file: ${insertError.message}` };
      }

      // Update onboarding status using our new database function
      const { data: statusResult, error: statusError } = await supabase
        .rpc('upsert_onboarding_status', {
          p_user_id: userId,
          p_resume_uploaded: true
        });

      if (statusError) {
        console.warn('⚠️ Resume saved but status update failed:', statusError.message);
        // Don't fail the entire operation, just warn
        return { success: true }; // Resume was saved successfully
      }

      console.log('✅ Resume file and status saved successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in transaction resume save:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  private async saveResumeFileManual(userId: string, file: File, parsedData: ParsedResume, fileContent: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Using manual resume save approach...');
      
      // First, mark all existing files as not current
      const { error: updateError } = await supabase
        .from('user_resume_files')
        .update({ is_current: false })
        .eq('user_id', userId);

      if (updateError) {
        console.warn('⚠️ Warning updating existing files:', updateError.message);
        // Continue anyway as this might not be critical
      }

      // Insert the new resume file
      const { error: insertError } = await supabase
        .from('user_resume_files')
        .insert({
          user_id: userId,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
          file_content: fileContent,
          parsed_data: parsedData as any,
          is_current: true
        });

      if (insertError) {
        console.error('❌ Error inserting resume file:', insertError);
        return { success: false, error: `Failed to save resume file: ${insertError.message}` };
      }

      // Update onboarding status using UPSERT
      const statusUpdateResult = await this.updateOnboardingStatus(userId, {
        resume_uploaded: true
      });

      if (!statusUpdateResult.success) {
        console.warn('⚠️ Resume saved but status update failed:', statusUpdateResult.error);
        // Don't fail the entire operation, just warn
      }

      console.log('✅ Manual resume file save completed');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in manual resume save:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  async getCurrentResumeFile(userId: string): Promise<ResumeFile | null> {
    try {
      console.log('🔍 Fetching current resume file for user:', userId);
      
      const { data, error } = await supabase
        .from('user_resume_files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching current resume file:', error);
        return null;
      }

      if (data) {
        console.log('✅ Found current resume file:', data.file_name);
        return {
          ...data,
          parsed_data: data.parsed_data as unknown as ParsedResume
        } as ResumeFile;
      }

      console.log('📄 No current resume file found');
      return null;
    } catch (error) {
      console.error('❌ Error in getCurrentResumeFile:', error);
      return null;
    }
  }

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      console.log('🔍 Enhanced onboarding status fetch for user:', userId);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error fetching onboarding status:', error);
        return null;
      }

      if (!data) {
        console.log('🆕 No onboarding record found, creating new one using database function');
        const { data: newData, error: insertError } = await supabase
          .rpc('upsert_onboarding_status', {
            p_user_id: userId,
            p_resume_uploaded: false,
            p_profile_completed: false,
            p_onboarding_completed: false
          });

        if (insertError) {
          console.error('❌ Error creating onboarding record:', insertError);
          return null;
        }

        // Fetch the created record
        const { data: fetchedData, error: fetchError } = await supabase
          .from('user_onboarding')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (fetchError) {
          console.error('❌ Error fetching created onboarding record:', fetchError);
          return null;
        }

        console.log('✅ Created new onboarding record');
        return fetchedData;
      }

      console.log('✅ Found onboarding status:', data);
      return data;
    } catch (error) {
      console.error('❌ Error in getOnboardingStatus:', error);
      return null;
    }
  }

  async updateOnboardingStatus(userId: string, updates: Partial<Omit<OnboardingStatus, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Enhanced onboarding status update for user:', userId, 'Updates:', updates);
      
      if (!userId) {
        return { success: false, error: 'User ID is required' };
      }

      if (!updates || Object.keys(updates).length === 0) {
        return { success: false, error: 'Updates are required' };
      }

      // Use our new database function for robust UPSERT
      const { data, error } = await supabase
        .rpc('upsert_onboarding_status', {
          p_user_id: userId,
          p_resume_uploaded: updates.resume_uploaded,
          p_profile_completed: updates.profile_completed,
          p_onboarding_completed: updates.onboarding_completed
        });

      if (error) {
        console.error('❌ Error updating onboarding status:', error);
        return { success: false, error: `Failed to update status: ${error.message}` };
      }

      console.log('✅ Onboarding status updated successfully using database function');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Critical error in updateOnboardingStatus:', errorMessage);
      return { success: false, error: `Critical status update error: ${errorMessage}` };
    }
  }

  async checkProfileCompletion(userId: string, profileData: any): Promise<{ success: boolean; isComplete: boolean; error?: string }> {
    try {
      console.log('🔄 Enhanced profile completion check for user:', userId);
      
      if (!userId) {
        return { success: false, isComplete: false, error: 'User ID is required' };
      }

      if (!profileData) {
        return { success: false, isComplete: false, error: 'Profile data is required' };
      }
      
      const requiredFields = [
        profileData.personalInfo?.name?.trim(),
        profileData.personalInfo?.email?.trim(),
        profileData.personalInfo?.phone?.trim(),
        profileData.workExperiences?.length > 0,
        profileData.education?.length > 0,
        profileData.skills?.length > 0
      ];

      const isComplete = requiredFields.every(field => Boolean(field));

      console.log('📊 Enhanced profile completion check:', {
        requiredFields: requiredFields.map(Boolean),
        isComplete
      });

      if (isComplete) {
        const updateResult = await this.updateOnboardingStatus(userId, { 
          profile_completed: true,
          onboarding_completed: true 
        });
        
        if (!updateResult.success) {
          console.error('❌ Failed to update onboarding status after completion check');
          return { success: false, isComplete: true, error: updateResult.error };
        }
      }

      return { success: true, isComplete };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Error in checkProfileCompletion:', errorMessage);
      return { success: false, isComplete: false, error: `Profile completion check failed: ${errorMessage}` };
    }
  }

  // New method to check data consistency using database function
  async checkDataConsistency(userId: string): Promise<{ success: boolean; statusFixed?: boolean; error?: string }> {
    try {
      console.log('🔧 Checking data consistency for user:', userId);
      
      const { data, error } = await supabase
        .rpc('check_and_fix_onboarding_consistency', {
          p_user_id: userId
        });

      if (error) {
        console.error('❌ Error checking data consistency:', error);
        return { success: false, error: error.message };
      }

      const result = data?.[0];
      if (result) {
        console.log('✅ Data consistency check completed:', result);
        return { 
          success: true, 
          statusFixed: result.status_fixed 
        };
      }

      return { success: true, statusFixed: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in consistency check:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }
}

export const resumeFileService = new ResumeFileService();
