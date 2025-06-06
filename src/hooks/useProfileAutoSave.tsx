
import { useCallback } from 'react';
import { useSimpleAutoSave } from './useSimpleAutoSave';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface ProfileAutoSaveOptions {
  section: string;
  interval?: number;
}

export function useProfileAutoSave<T>(
  data: T,
  options: ProfileAutoSaveOptions
) {
  const { user } = useAuth();
  
  const saveFunction = useCallback(async (dataToSave: T) => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      console.log(`🔄 Auto-saving ${options.section} section...`, dataToSave);
      
      switch (options.section) {
        case 'contact':
          const contactData = dataToSave as any;
          const { error: contactError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              phone: contactData.phone,
              location: contactData.location,
              date_of_birth: contactData.dateOfBirth,
              updated_at: new Date().toISOString()
            });
          
          if (contactError) throw contactError;
          break;

        case 'socialLinks':
          const socialData = dataToSave as any;
          const { error: socialError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              linkedin_url: socialData.linkedin,
              github_url: socialData.github,
              portfolio_url: socialData.portfolio,
              other_url: socialData.other,
              updated_at: new Date().toISOString()
            });
          
          if (socialError) throw socialError;
          break;

        case 'skills':
          const skillsData = dataToSave as string[];
          // Clear existing skills and insert new ones
          await supabase.from('user_skills').delete().eq('user_id', user.id);
          
          if (skillsData.length > 0) {
            const skillsToInsert = skillsData.map(skill => ({
              user_id: user.id,
              skill: skill,
              category: 'general'
            }));
            
            const { error: skillsError } = await supabase
              .from('user_skills')
              .insert(skillsToInsert);
            
            if (skillsError) throw skillsError;
          }
          break;

        case 'languages':
          const languagesData = dataToSave as any[];
          // Update profile with languages data
          const { error: langError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: user.id,
              languages: languagesData,
              updated_at: new Date().toISOString()
            });
          
          if (langError) throw langError;
          break;

        case 'jobPreferences':
          const prefData = dataToSave as any;
          const { error: prefError } = await supabase
            .from('enhanced_job_preferences')
            .upsert({
              user_id: user.id,
              ...prefData,
              updated_at: new Date().toISOString()
            });
          
          if (prefError) throw prefError;
          break;

        case 'equalEmployment':
          const eeData = dataToSave as any;
          const { error: eeError } = await supabase
            .from('equal_employment_data')
            .upsert({
              user_id: user.id,
              ...eeData,
              updated_at: new Date().toISOString()
            });
          
          if (eeError) throw eeError;
          break;

        case 'settings':
          const settingsData = dataToSave as any;
          const { error: settingsError } = await supabase
            .from('email_preferences')
            .upsert({
              user_id: user.id,
              ...settingsData,
              updated_at: new Date().toISOString()
            });
          
          if (settingsError) throw settingsError;
          break;

        default:
          throw new Error(`Unknown section: ${options.section}`);
      }

      return { success: true };
    } catch (error) {
      console.error(`❌ Auto-save failed for ${options.section}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Save failed' 
      };
    }
  }, [user, options.section]);

  return useSimpleAutoSave(data, {
    saveFunction,
    interval: options.interval || 2000, // 2 seconds
    localStorageKey: `profile-${options.section}-draft-${user?.id}`,
    onSaveSuccess: () => {
      console.log(`✅ ${options.section} auto-saved successfully`);
    },
    onSaveError: (error) => {
      toast({
        title: "Auto-save failed",
        description: `Failed to save ${options.section}: ${error}`,
        variant: "destructive",
      });
    }
  });
}
