
import { AddressComponents, AddressValidator } from './addressValidation';
import { ParsedResume } from '@/types/resume';

export interface ProfileSyncResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

export class ProfileDataSync {
  // Convert UI address components to database location string
  static syncAddressToLocation(addressComponents: AddressComponents): string {
    const validation = AddressValidator.validateCompleteAddress(addressComponents);
    
    if (validation.isValid && validation.standardizedAddress) {
      return AddressValidator.combineAddressComponents(validation.standardizedAddress);
    }
    
    // Fallback to combining even if not fully valid
    return AddressValidator.combineAddressComponents(addressComponents);
  }

  // Convert database location string to UI address components
  static syncLocationToAddress(location: string): Partial<AddressComponents> {
    return AddressValidator.parseLocationString(location);
  }

  // Sync profile data between UI format and database format
  static prepareProfileForDatabase(profileData: any): ProfileSyncResult {
    try {
      const syncedData = { ...profileData };
      
      // Sync address components to location string
      if (profileData.personalInfo) {
        const addressComponents = {
          streetAddress: profileData.personalInfo.streetAddress || '',
          city: profileData.personalInfo.city || '',
          state: profileData.personalInfo.state || '',
          county: profileData.personalInfo.county || '',
          zipCode: profileData.personalInfo.zipCode || ''
        };
        
        syncedData.personalInfo = {
          ...profileData.personalInfo,
          location: this.syncAddressToLocation(addressComponents)
        };
      }
      
      return { success: true, data: syncedData };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Profile sync error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  // Prepare database data for UI display
  static prepareProfileForUI(databaseData: any): ProfileSyncResult {
    try {
      const syncedData = { ...databaseData };
      
      // Sync location string to address components
      if (databaseData.personalInfo?.location) {
        const addressComponents = this.syncLocationToAddress(databaseData.personalInfo.location);
        
        syncedData.personalInfo = {
          ...databaseData.personalInfo,
          streetAddress: addressComponents.streetAddress || '',
          city: addressComponents.city || '',
          state: addressComponents.state || '',
          county: addressComponents.county || '',
          zipCode: addressComponents.zipCode || ''
        };
      }
      
      return { success: true, data: syncedData };
    } catch (error) {
      return { 
        success: false, 
        errors: [`UI sync error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }

  // Migrate existing user data to new format
  static migrateUserProfile(oldProfile: any): ProfileSyncResult {
    try {
      const migratedProfile = { ...oldProfile };
      
      // If we have old location format but no separate address fields
      if (oldProfile.personalInfo?.location && !oldProfile.personalInfo?.streetAddress) {
        const addressComponents = this.syncLocationToAddress(oldProfile.personalInfo.location);
        migratedProfile.personalInfo = {
          ...oldProfile.personalInfo,
          ...addressComponents
        };
      }
      
      // If we have separate address fields but no combined location
      if (oldProfile.personalInfo?.streetAddress && !oldProfile.personalInfo?.location) {
        const addressComponents = {
          streetAddress: oldProfile.personalInfo.streetAddress || '',
          city: oldProfile.personalInfo.city || '',
          state: oldProfile.personalInfo.state || '',
          county: oldProfile.personalInfo.county || '',
          zipCode: oldProfile.personalInfo.zipCode || ''
        };
        
        migratedProfile.personalInfo.location = this.syncAddressToLocation(addressComponents);
      }
      
      return { success: true, data: migratedProfile };
    } catch (error) {
      return { 
        success: false, 
        errors: [`Migration error: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      };
    }
  }
}
