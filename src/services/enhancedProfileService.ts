
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

  static async validateProfileCompletionDetailed(userId: string, profileData: any): Promise<any> {
    try {
      console.log('Validating profile completion for user:', userId);
      
      const completionItems = [
        {
          field: 'personalInfo.name',
          label: 'Full Name',
          description: 'Add your complete name',
          completed: !!(profileData?.personalInfo?.name || profileData?.full_name),
          priority: 'high'
        },
        {
          field: 'personalInfo.email',
          label: 'Email Address',
          description: 'Verify your email address',
          completed: !!(profileData?.personalInfo?.email || profileData?.email),
          priority: 'high'
        },
        {
          field: 'personalInfo.phone',
          label: 'Phone Number',
          description: 'Add your contact number',
          completed: !!(profileData?.personalInfo?.phone),
          priority: 'medium'
        },
        {
          field: 'workExperience',
          label: 'Work Experience',
          description: 'Add at least one work experience',
          completed: !!(profileData?.workExperience && profileData.workExperience.length > 0),
          priority: 'high'
        },
        {
          field: 'education',
          label: 'Education',
          description: 'Add your educational background',
          completed: !!(profileData?.education && profileData.education.length > 0),
          priority: 'medium'
        },
        {
          field: 'skills',
          label: 'Skills',
          description: 'Add your professional skills',
          completed: !!(profileData?.skills && profileData.skills.length > 0),
          priority: 'high'
        }
      ];

      const completedItems = completionItems.filter(item => item.completed);
      const totalSteps = completionItems.length;
      const completedSteps = completedItems.length;
      const percentComplete = Math.round((completedSteps / totalSteps) * 100);

      // Quality metrics calculation
      const highPriorityItems = completionItems.filter(item => item.priority === 'high');
      const completedHighPriority = highPriorityItems.filter(item => item.completed);
      const qualityScore = Math.round((completedHighPriority.length / highPriorityItems.length) * 100);

      const strengthAreas = completedItems.map(item => item.label);
      const improvementAreas = completionItems.filter(item => !item.completed).map(item => item.label);
      
      const recommendations = [];
      if (!profileData?.personalInfo?.phone) {
        recommendations.push('Add your phone number to improve recruiter contact');
      }
      if (!profileData?.skills || profileData.skills.length < 5) {
        recommendations.push('Add more skills to boost your profile visibility');
      }
      if (!profileData?.workExperience || profileData.workExperience.length === 0) {
        recommendations.push('Add work experience to showcase your background');
      }

      return {
        progress: {
          currentStep: completedSteps,
          totalSteps: totalSteps,
          completedSteps: completedItems.map(item => item.field),
          percentComplete: percentComplete,
          canProceed: completedSteps >= 3
        },
        completionItems,
        qualityMetrics: {
          completionScore: percentComplete,
          qualityScore: qualityScore,
          strengthAreas: strengthAreas,
          improvementAreas: improvementAreas,
          recommendations: recommendations
        },
        nextMilestone: completedSteps < totalSteps ? completionItems.find(item => !item.completed) : null,
        isReadyForCompletion: percentComplete >= 80
      };
    } catch (error) {
      console.error('Profile validation failed:', error);
      return {
        progress: { currentStep: 0, totalSteps: 6, completedSteps: [], percentComplete: 0, canProceed: false },
        completionItems: [],
        qualityMetrics: { completionScore: 0, qualityScore: 0, strengthAreas: [], improvementAreas: [], recommendations: [] },
        nextMilestone: null,
        isReadyForCompletion: false
      };
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
