import { supabase } from '@/integrations/supabase/client';
import { profileCompletionService, ProfileCompletionItem } from '@/services/profileCompletionService';

export interface ProfileCompletionProgress {
  overallPercentage: number;
  sectionsComplete: number;
  totalSections: number;
  sections: {
    contact: { complete: boolean; percentage: number; missingFields: string[] };
    experience: { complete: boolean; percentage: number; missingFields: string[] };
    skills: { complete: boolean; percentage: number; missingFields: string[] };
    preferences: { complete: boolean; percentage: number; missingFields: string[] };
    equalEmployment: { complete: boolean; percentage: number; missingFields: string[] };
    settings: { complete: boolean; percentage: number; missingFields: string[] };
  };
  canCompleteProfile: boolean;
}

export class EnhancedProfileCompletionService {
  async getDetailedProfileCompletion(userId: string): Promise<ProfileCompletionProgress> {
    try {
      // Fetch all user data
      const [profile, workExp, education, skills, jobPrefs, equalEmployment, notificationPrefs] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('work_experiences').select('*').eq('user_id', userId),
        supabase.from('education').select('*').eq('user_id', userId),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('job_preferences').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('equal_employment_data').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('notification_preferences').select('*').eq('user_id', userId).maybeSingle()
      ]);

      // Contact section requirements
      const contactComplete = !!(
        profile.data?.name?.trim() &&
        profile.data?.phone?.trim() &&
        profile.data?.location?.trim()
      );
      const contactMissing = [];
      if (!profile.data?.name?.trim()) contactMissing.push('Full Name');
      if (!profile.data?.phone?.trim()) contactMissing.push('Phone Number');
      if (!profile.data?.location?.trim()) contactMissing.push('Location');

      // Experience section requirements
      const hasWorkExp = (workExp.data?.length || 0) >= 1;
      const hasEducation = (education.data?.length || 0) >= 1;
      const experienceComplete = hasWorkExp && hasEducation;
      const experienceMissing = [];
      if (!hasWorkExp) experienceMissing.push('At least 1 work experience');
      if (!hasEducation) experienceMissing.push('At least 1 education entry');

      // Skills section requirements - changed from 3 to 1 skill requirement
      const hasSkills = (skills.data?.length || 0) >= 1;
      const profileLanguages = profile.data?.languages;
      const hasLanguages = Array.isArray(profileLanguages) && profileLanguages.length >= 1;
      const skillsComplete = hasSkills && hasLanguages;
      const skillsMissing = [];
      if (!hasSkills) skillsMissing.push('At least 1 skill');
      if (!hasLanguages) skillsMissing.push('At least 1 language');

      // Job preferences requirements
      const preferencesComplete = !!(
        jobPrefs.data?.work_model &&
        jobPrefs.data?.experience_level
      );
      const preferencesMissing = [];
      if (!jobPrefs.data?.work_model) preferencesMissing.push('Work Model');
      if (!jobPrefs.data?.experience_level) preferencesMissing.push('Experience Level');

      // Equal Employment requirements
      const equalEmploymentComplete = !!(
        equalEmployment.data?.ethnicity &&
        equalEmployment.data?.gender &&
        equalEmployment.data?.work_authorization
      );
      const equalEmploymentMissing = [];
      if (!equalEmployment.data?.ethnicity) equalEmploymentMissing.push('Ethnicity');
      if (!equalEmployment.data?.gender) equalEmploymentMissing.push('Gender');
      if (!equalEmployment.data?.work_authorization) equalEmploymentMissing.push('Work Authorization');

      // Settings requirements
      const settingsComplete = !!(
        notificationPrefs.data?.email_notifications !== undefined &&
        notificationPrefs.data?.job_match_alerts !== undefined
      );
      const settingsMissing = [];
      if (notificationPrefs.data?.email_notifications === undefined) settingsMissing.push('Email Notifications');
      if (notificationPrefs.data?.job_match_alerts === undefined) settingsMissing.push('Job Alerts');

      // Calculate percentages
      const contactPercentage = contactComplete ? 100 : Math.round((3 - contactMissing.length) / 3 * 100);
      const experiencePercentage = experienceComplete ? 100 : Math.round((2 - experienceMissing.length) / 2 * 100);
      const skillsPercentage = skillsComplete ? 100 : Math.round((2 - skillsMissing.length) / 2 * 100);
      const preferencesPercentage = preferencesComplete ? 100 : Math.round((2 - preferencesMissing.length) / 2 * 100);
      const equalEmploymentPercentage = equalEmploymentComplete ? 100 : Math.round((3 - equalEmploymentMissing.length) / 3 * 100);
      const settingsPercentage = settingsComplete ? 100 : Math.round((2 - settingsMissing.length) / 2 * 100);

      const sectionsComplete = [contactComplete, experienceComplete, skillsComplete, preferencesComplete, equalEmploymentComplete, settingsComplete].filter(Boolean).length;
      const overallPercentage = Math.round((contactPercentage + experiencePercentage + skillsPercentage + preferencesPercentage + equalEmploymentPercentage + settingsPercentage) / 6);

      return {
        overallPercentage,
        sectionsComplete,
        totalSections: 6,
        sections: {
          contact: { complete: contactComplete, percentage: contactPercentage, missingFields: contactMissing },
          experience: { complete: experienceComplete, percentage: experiencePercentage, missingFields: experienceMissing },
          skills: { complete: skillsComplete, percentage: skillsPercentage, missingFields: skillsMissing },
          preferences: { complete: preferencesComplete, percentage: preferencesPercentage, missingFields: preferencesMissing },
          equalEmployment: { complete: equalEmploymentComplete, percentage: equalEmploymentPercentage, missingFields: equalEmploymentMissing },
          settings: { complete: settingsComplete, percentage: settingsPercentage, missingFields: settingsMissing }
        },
        canCompleteProfile: contactComplete && experienceComplete && skillsComplete && preferencesComplete && equalEmploymentComplete && settingsComplete
      };
    } catch (error) {
      console.error('Error getting detailed profile completion:', error);
      return {
        overallPercentage: 0,
        sectionsComplete: 0,
        totalSections: 6,
        sections: {
          contact: { complete: false, percentage: 0, missingFields: ['Complete contact information'] },
          experience: { complete: false, percentage: 0, missingFields: ['Add work experience and education'] },
          skills: { complete: false, percentage: 0, missingFields: ['Add skills and languages'] },
          preferences: { complete: false, percentage: 0, missingFields: ['Set job preferences'] },
          equalEmployment: { complete: false, percentage: 0, missingFields: ['Complete equal employment information'] },
          settings: { complete: false, percentage: 0, missingFields: ['Configure notification settings'] }
        },
        canCompleteProfile: false
      };
    }
  }

  async updateProfileCompletionStatus(userId: string): Promise<void> {
    try {
      const progress = await this.getDetailedProfileCompletion(userId);
      
      await profileCompletionService.updateProfileCompletion(userId, {
        completion_percentage: progress.overallPercentage,
        missing_fields: Object.values(progress.sections)
          .filter(section => !section.complete)
          .map(section => section.missingFields)
          .flat()
      });
    } catch (error) {
      console.error('Error updating profile completion status:', error);
    }
  }
}

export const enhancedProfileCompletionService = new EnhancedProfileCompletionService();
