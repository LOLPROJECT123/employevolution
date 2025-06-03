
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

      // Direct save to database using existing profileService
      const success = await profileService.saveResumeData(userId, syncResult.data!);
      
      if (success) {
        console.log('✅ Simple profile save completed successfully');
      } else {
        console.error('❌ Simple profile save failed');
      }
      
      return success;
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
