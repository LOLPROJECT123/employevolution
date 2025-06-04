
import { profileService } from './profileService';
import { ProfileDataSync } from '@/utils/profileDataSync';

export class SimpleProfileService {
  // Simplified save that bypasses complex validation for auto-save
  static async saveProfileData(userId: string, profileData: any): Promise<boolean> {
    try {
      console.log('💾 Simple profile save starting for user:', userId);
      
      // Convert UI format to database format
      const syncResult = ProfileDataSync.prepareProfileForDatabase(profileData);
      if (!syncResult.success) {
        console.error('❌ Data sync failed:', syncResult.errors);
        return false;
      }

      // Direct save to database using existing profileService with improved error handling
      try {
        const success = await profileService.saveResumeData(userId, syncResult.data!);
        
        if (success) {
          console.log('✅ Simple profile save completed successfully');
        } else {
          console.error('❌ Simple profile save failed - database operation failed');
        }
        
        return success;
      } catch (error) {
        console.error('❌ Simple profile save database error:', error);
        
        // If it's a conflict error, try to handle it gracefully
        if (error instanceof Error && error.message.includes('conflict')) {
          console.log('🔄 Retrying save after conflict...');
          // Try one more time - the UPSERT should handle the conflict
          return await profileService.saveResumeData(userId, syncResult.data!);
        }
        
        return false;
      }
    } catch (error) {
      console.error('❌ Simple profile save error:', error);
      return false;
    }
  }

  // Load profile data with proper format conversion
  static async loadProfileData(userId: string): Promise<any> {
    try {
      console.log('📋 Loading profile data for user:', userId);
      
      const userData = await profileService.loadUserData(userId);
      
      if (userData?.profile) {
        // Convert database format to UI format
        const syncResult = ProfileDataSync.prepareProfileForUI(userData);
        return syncResult.success ? syncResult.data : null;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to load profile data:', error);
      return null;
    }
  }
}
