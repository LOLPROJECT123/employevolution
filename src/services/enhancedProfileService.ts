
import { supabase } from '@/integrations/supabase/client';

export class EnhancedProfileService {
  static async saveProfileWithValidation(userId: string, data: any): Promise<boolean> {
    try {
      console.log('Saving profile with validation for user:', userId);
      
      // Validate data before saving
      if (!data.personalInfo?.name || !data.personalInfo?.email) {
        throw new Error('Required fields missing');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Profile save failed:', error);
      return false;
    }
  }

  static async loadProfileForUI(userId: string): Promise<any> {
    try {
      console.log('Loading profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Profile load failed:', error);
      return null;
    }
  }

  static async completeOnboardingWithValidation(userId: string, data: any): Promise<boolean> {
    try {
      console.log('Completing onboarding for user:', userId);
      
      // Mark profile as completed
      const profileData = {
        ...data,
        onboarding_completed: true,
        profile_completed: true,
        updated_at: new Date().toISOString()
      };

      const success = await this.saveProfileWithValidation(userId, profileData);
      
      if (success) {
        // Update user metadata
        await supabase.auth.updateUser({
          data: { onboarding_completed: true }
        });
      }

      return success;
    } catch (error) {
      console.error('Onboarding completion failed:', error);
      return false;
    }
  }
}
