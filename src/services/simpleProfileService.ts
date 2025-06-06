
import { profileService } from './profileService';
import { ProfileDataSync } from '@/utils/profileDataSync';
import { supabase } from '@/integrations/supabase/client';

export class SimpleProfileService {
  // Enhanced save with better error handling and retry logic
  static async saveProfileData(userId: string, profileData: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Enhanced profile save starting for user:', userId);
      console.log('📋 Raw profile data received:', JSON.stringify(profileData, null, 2));
      
      // Validate input data
      if (!userId) {
        const error = 'User ID is required for saving profile data';
        console.error('❌', error);
        return { success: false, error };
      }

      if (!profileData) {
        const error = 'Profile data is required for saving';
        console.error('❌', error);
        return { success: false, error };
      }

      // Convert UI format to database format with enhanced error handling
      const syncResult = ProfileDataSync.prepareProfileForDatabase(profileData);
      if (!syncResult.success) {
        const error = `Data validation failed: ${syncResult.errors?.join(', ') || 'Unknown validation error'}`;
        console.error('❌ Data sync failed:', syncResult.errors);
        return { success: false, error };
      }

      console.log('📤 Converted data for database:', JSON.stringify(syncResult.data, null, 2));

      // Enhanced save with retry mechanism and UPSERT logic
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Save attempt ${attempt}/${maxRetries}`);
          
          // Use UPSERT logic to handle unique constraint violations
          const success = await this.upsertProfileData(userId, syncResult.data!);
          
          if (success) {
            console.log('✅ Enhanced profile save completed successfully');
            return { success: true };
          } else {
            throw new Error('Database save operation returned false');
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`❌ Save attempt ${attempt} failed:`, lastError.message);
          console.warn('📋 Full error details:', lastError);
          
          // Check for specific error types
          if (lastError.message.includes('duplicate') || lastError.message.includes('unique_violation')) {
            console.log('🔄 Handling duplicate record conflict, trying UPSERT...');
          } else if (lastError.message.includes('network') || lastError.message.includes('timeout')) {
            console.log('🌐 Network issue detected, retrying...');
          } else if (lastError.message.includes('permission') || lastError.message.includes('unauthorized')) {
            console.error('🔒 Permission denied - aborting retries');
            return { success: false, error: 'Permission denied. Please refresh the page and try again.' };
          } else if (lastError.message.includes('ambiguous') || lastError.message.includes('syntax error')) {
            console.error('🔧 Database function error detected - aborting retries');
            return { success: false, error: 'Database configuration error. Please contact support.' };
          }
          
          // Wait before retry with exponential backoff
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
            console.log(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // All retries failed
      const finalError = lastError?.message || 'Unknown database error';
      console.error('❌ All save attempts failed:', finalError);
      console.error('📋 Last error object:', lastError);
      
      // Provide user-friendly error messages
      if (finalError.includes('network') || finalError.includes('timeout')) {
        return { success: false, error: 'Network connection issue. Please check your internet and try again.' };
      } else if (finalError.includes('duplicate') || finalError.includes('unique')) {
        return { success: false, error: 'Data conflict detected. Please refresh the page and try again.' };
      } else if (finalError.includes('ambiguous') || finalError.includes('syntax error')) {
        return { success: false, error: 'Database configuration error. Please contact support.' };
      } else {
        return { success: false, error: `Save failed: ${finalError}. Please try again or contact support.` };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Critical error in enhanced profile save:', errorMessage);
      console.error('📋 Full error object:', error);
      return { 
        success: false, 
        error: `Critical save error: ${errorMessage}. Please refresh the page and contact support if this persists.` 
      };
    }
  }

  // Updated method to handle UPSERT operations using database function
  private static async upsertProfileData(userId: string, profileData: any): Promise<boolean> {
    try {
      // Validate and format location data
      const locationData = this.formatLocationData(profileData.personalInfo);
      
      console.log('📤 Calling database function with validated data:', {
        userId,
        name: profileData.personalInfo?.name,
        phone: profileData.personalInfo?.phone,
        location: locationData,
        linkedin: profileData.socialLinks?.linkedin,
        github: profileData.socialLinks?.github,
        portfolio: profileData.socialLinks?.portfolio,
        other: profileData.socialLinks?.other
      });

      // Use our database function for robust UPSERT
      const { data, error } = await supabase
        .rpc('upsert_user_profile', {
          p_user_id: userId,
          p_name: profileData.personalInfo?.name || null,
          p_phone: profileData.personalInfo?.phone || null,
          p_location: locationData || null,
          p_linkedin_url: profileData.socialLinks?.linkedin || null,
          p_github_url: profileData.socialLinks?.github || null,
          p_portfolio_url: profileData.socialLinks?.portfolio || null,
          p_other_url: profileData.socialLinks?.other || null,
          p_profile_completion: this.calculateCompletionScore(profileData)
        });

      if (error) {
        console.error('❌ Database function profile save failed:', error);
        throw new Error(`Database function error: ${error.message}`);
      }

      console.log('✅ Database function returned data:', data);

      // Also save to the legacy profileService for backward compatibility
      try {
        await profileService.saveResumeData(userId, profileData);
        console.log('✅ Legacy profile service backup completed');
      } catch (legacyError) {
        console.warn('⚠️ Legacy profile service backup failed:', legacyError);
        // Don't fail the main operation for legacy backup issues
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error in upsertProfileData:', error);
      throw error;
    }
  }

  // Helper method to format location data properly
  private static formatLocationData(personalInfo: any): string | null {
    if (!personalInfo) return null;
    
    const addressParts = [
      personalInfo.streetAddress?.trim(),
      personalInfo.city?.trim(),
      personalInfo.state?.trim(),
      personalInfo.county?.trim(),
      personalInfo.zipCode?.trim()
    ].filter(Boolean);

    return addressParts.length > 0 ? addressParts.join(', ') : null;
  }

  // Calculate profile completion score
  private static calculateCompletionScore(profileData: any): number {
    const fields = [
      profileData.personalInfo?.name,
      profileData.personalInfo?.phone,
      profileData.personalInfo?.location,
      profileData.workExperiences?.length > 0,
      profileData.education?.length > 0,
      profileData.skills?.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return Math.round((completedFields / fields.length) * 100);
  }

  // Enhanced load with better error handling
  static async loadProfileData(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('📋 Enhanced loading profile data for user:', userId);
      
      if (!userId) {
        return { success: false, error: 'User ID is required for loading profile data' };
      }
      
      const userData = await profileService.loadUserData(userId);
      
      if (userData?.profile) {
        // Convert database format to UI format
        const syncResult = ProfileDataSync.prepareProfileForUI(userData);
        if (syncResult.success) {
          console.log('✅ Profile data loaded and converted successfully');
          return { success: true, data: syncResult.data };
        } else {
          console.error('❌ Failed to convert profile data:', syncResult.errors);
          return { success: false, error: `Data conversion failed: ${syncResult.errors?.join(', ')}` };
        }
      }

      console.log('📄 No profile data found in database');
      return { success: true, data: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Failed to load profile data:', errorMessage);
      return { 
        success: false, 
        error: `Failed to load profile: ${errorMessage}. Please refresh the page and try again.` 
      };
    }
  }

  // Database health check
  static async checkDatabaseHealth(): Promise<{ healthy: boolean; error?: string }> {
    try {
      console.log('🏥 Checking database health...');
      // Simple health check by attempting a basic query
      const { error } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ Database health check failed:', error);
        return { healthy: false, error: error.message };
      }
      
      console.log('✅ Database health check passed');
      return { healthy: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database health check failed:', errorMessage);
      return { healthy: false, error: errorMessage };
    }
  }

  // Enhanced method to check and fix consistency issues using database function
  static async checkAndFixConsistency(userId: string): Promise<{ success: boolean; statusFixed?: boolean; error?: string }> {
    try {
      console.log('🔧 Checking data consistency for user:', userId);
      
      const { data, error } = await supabase
        .rpc('check_and_fix_onboarding_consistency', {
          p_user_id: userId
        });
      
      if (error) {
        console.error('❌ Failed to check consistency:', error);
        return { success: false, error: error.message };
      }
      
      const result = data && data.length > 0 ? data[0] : null;
      if (result) {
        console.log('✅ Data consistency check completed:', result);
        return { 
          success: true, 
          statusFixed: result.status_fixed 
        };
      }
      
      console.log('✅ Data consistency check passed - no fixes needed');
      return { success: true, statusFixed: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error in consistency check:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  // Check if local profile meets completion requirements
  static validateLocalProfileCompletion(profileData: any): { isComplete: boolean; missingFields: string[] } {
    const requiredFields = [
      { field: 'personalInfo.name', value: profileData.personalInfo?.name?.trim() },
      { field: 'personalInfo.email', value: profileData.personalInfo?.email?.trim() },
      { field: 'personalInfo.phone', value: profileData.personalInfo?.phone?.trim() },
      { field: 'skills', value: profileData.skills?.length > 0 },
    ];

    const missingFields = requiredFields
      .filter(({ value }) => !value)
      .map(({ field }) => field);

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  }
}
