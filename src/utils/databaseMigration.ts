
import { supabase } from '@/integrations/supabase/client';
import { AddressValidator } from './addressValidation';
import { ErrorHandler } from './errorHandling';

export interface MigrationResult {
  success: boolean;
  migratedCount: number;
  errors: string[];
}

export class DatabaseMigrationService {
  // Migrate existing profiles to include county field
  static async migrateUserAddresses(): Promise<MigrationResult> {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, location, name')
        .not('location', 'is', null);

      if (error) {
        return { success: false, migratedCount: 0, errors: [error.message] };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (const profile of profiles || []) {
        try {
          // Parse existing location
          const addressComponents = AddressValidator.parseLocationString(profile.location);
          
          // If county is missing, try to add default
          if (!addressComponents.county && addressComponents.city && addressComponents.state) {
            addressComponents.county = `${addressComponents.city} County`;
          }

          // Reconstruct location with county
          const updatedLocation = AddressValidator.combineAddressComponents(addressComponents as any);

          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ location: updatedLocation })
            .eq('id', profile.id);

          if (updateError) {
            errors.push(`Failed to update profile ${profile.id}: ${updateError.message}`);
          } else {
            migratedCount++;
          }
        } catch (profileError) {
          errors.push(`Error processing profile ${profile.id}: ${profileError}`);
        }
      }

      return {
        success: errors.length === 0,
        migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        migratedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Batch update existing profiles with missing data
  static async batchUpdateProfiles(updates: Array<{ user_id: string; data: any }>): Promise<MigrationResult> {
    const errors: string[] = [];
    let migratedCount = 0;

    for (const update of updates) {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: update.user_id,
            ...update.data,
            updated_at: new Date().toISOString()
          });

        if (error) {
          errors.push(`Failed to update profile ${update.user_id}: ${error.message}`);
        } else {
          migratedCount++;
        }
      } catch (updateError) {
        errors.push(`Error updating profile ${update.user_id}: ${updateError}`);
      }
    }

    return {
      success: errors.length === 0,
      migratedCount,
      errors
    };
  }

  // Migrate onboarding status for existing users
  static async initializeOnboardingForExistingUsers(): Promise<MigrationResult> {
    try {
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('user_id');

      if (error) {
        return { success: false, migratedCount: 0, errors: [error.message] };
      }

      const errors: string[] = [];
      let migratedCount = 0;

      for (const profile of profiles || []) {
        try {
          // Check if onboarding status exists
          const { data: existingStatus } = await supabase
            .from('user_onboarding')
            .select('id')
            .eq('user_id', profile.user_id)
            .maybeSingle();

          if (!existingStatus) {
            const { error: insertError } = await supabase
              .from('user_onboarding')
              .insert({
                user_id: profile.user_id,
                resume_uploaded: false,
                profile_completed: true, // Assume existing users have completed profiles
                onboarding_completed: true
              });

            if (insertError) {
              errors.push(`Failed to create onboarding for ${profile.user_id}: ${insertError.message}`);
            } else {
              migratedCount++;
            }
          }
        } catch (profileError) {
          errors.push(`Error processing user ${profile.user_id}: ${profileError}`);
        }
      }

      return {
        success: errors.length === 0,
        migratedCount,
        errors
      };
    } catch (error) {
      return {
        success: false,
        migratedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // Clean up duplicate records
  static async removeDuplicateRecords(tableName: string, userIdField: string = 'user_id'): Promise<MigrationResult> {
    try {
      // This would require custom SQL queries to identify and remove duplicates
      // For now, return success with instructions
      console.log(`Duplicate removal for ${tableName} should be handled via SQL migration`);
      
      return {
        success: true,
        migratedCount: 0,
        errors: ['Duplicate removal requires SQL migration - contact administrator']
      };
    } catch (error) {
      return {
        success: false,
        migratedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }
}
