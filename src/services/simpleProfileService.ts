
import { profileService } from './profileService';
import { ProfileDataSync } from '@/utils/profileDataSync';

export class SimpleProfileService {
  // Enhanced save with better error handling and retry logic
  static async saveProfileData(userId: string, profileData: any): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('💾 Enhanced profile save starting for user:', userId);
      
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

      // Enhanced save with retry mechanism
      const maxRetries = 3;
      let lastError: Error | null = null;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🔄 Save attempt ${attempt}/${maxRetries}`);
          
          const success = await profileService.saveResumeData(userId, syncResult.data!);
          
          if (success) {
            console.log('✅ Enhanced profile save completed successfully');
            return { success: true };
          } else {
            throw new Error('Database save operation returned false');
          }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          console.warn(`❌ Save attempt ${attempt} failed:`, lastError.message);
          
          // Check for specific error types
          if (lastError.message.includes('conflict') || lastError.message.includes('unique_violation')) {
            console.log('🔄 Handling database conflict, retrying...');
          } else if (lastError.message.includes('network') || lastError.message.includes('timeout')) {
            console.log('🌐 Network issue detected, retrying...');
          } else if (lastError.message.includes('permission') || lastError.message.includes('unauthorized')) {
            console.error('🔒 Permission denied - aborting retries');
            return { success: false, error: 'Permission denied. Please refresh the page and try again.' };
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
      
      // Provide user-friendly error messages
      if (finalError.includes('network') || finalError.includes('timeout')) {
        return { success: false, error: 'Network connection issue. Please check your internet and try again.' };
      } else if (finalError.includes('conflict')) {
        return { success: false, error: 'Data conflict detected. Please refresh the page and try again.' };
      } else {
        return { success: false, error: 'Failed to save to database. Your data is saved locally and will sync when connection is restored.' };
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Critical error in enhanced profile save:', errorMessage);
      return { 
        success: false, 
        error: `Critical save error: ${errorMessage}. Please refresh the page and contact support if this persists.` 
      };
    }
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
      // Simple health check by attempting to load user profile
      const profileData = await profileService.getUserProfile('health-check');
      
      // If we get null, that's normal (no profile exists for health-check user)
      // If we get an error thrown, that indicates a database issue
      console.log('✅ Database health check passed');
      return { healthy: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Database health check failed:', errorMessage);
      return { healthy: false, error: errorMessage };
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
