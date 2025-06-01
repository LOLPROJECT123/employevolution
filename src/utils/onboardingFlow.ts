
import { resumeFileService } from '@/services/resumeFileService';
import { profileService } from '@/services/profileService';
import { ErrorHandler } from './errorHandling';

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  validationFn?: (data: any) => Promise<{ isValid: boolean; errors: string[] }>;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  percentComplete: number;
  canProceed: boolean;
}

export class OnboardingFlowManager {
  private static readonly ONBOARDING_STEPS: Omit<OnboardingStep, 'isCompleted'>[] = [
    {
      id: 'resume_upload',
      name: 'Upload Resume',
      description: 'Upload your resume to get started',
      isRequired: true,
      validationFn: async (data) => {
        if (!data.resumeFile) {
          return { isValid: false, errors: ['Resume file is required'] };
        }
        return { isValid: true, errors: [] };
      }
    },
    {
      id: 'personal_info',
      name: 'Personal Information',
      description: 'Complete your personal details',
      isRequired: true,
      validationFn: async (data) => {
        const errors: string[] = [];
        if (!data.personalInfo?.name?.trim()) errors.push('Name is required');
        if (!data.personalInfo?.email?.trim()) errors.push('Email is required');
        if (!data.personalInfo?.phone?.trim()) errors.push('Phone is required');
        if (!data.personalInfo?.streetAddress?.trim()) errors.push('Street address is required');
        if (!data.personalInfo?.city?.trim()) errors.push('City is required');
        if (!data.personalInfo?.state?.trim()) errors.push('State is required');
        if (!data.personalInfo?.county?.trim()) errors.push('County is required');
        if (!data.personalInfo?.zipCode?.trim()) errors.push('ZIP code is required');
        
        return { isValid: errors.length === 0, errors };
      }
    },
    {
      id: 'work_experience',
      name: 'Work Experience',
      description: 'Add your work experience',
      isRequired: true,
      validationFn: async (data) => {
        if (!data.workExperiences || data.workExperiences.length === 0) {
          return { isValid: false, errors: ['At least one work experience is required'] };
        }
        return { isValid: true, errors: [] };
      }
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Add your education background',
      isRequired: true,
      validationFn: async (data) => {
        if (!data.education || data.education.length === 0) {
          return { isValid: false, errors: ['At least one education entry is required'] };
        }
        return { isValid: true, errors: [] };
      }
    },
    {
      id: 'skills',
      name: 'Skills',
      description: 'List your relevant skills',
      isRequired: true,
      validationFn: async (data) => {
        if (!data.skills || data.skills.length === 0) {
          return { isValid: false, errors: ['At least one skill is required'] };
        }
        return { isValid: true, errors: [] };
      }
    },
    {
      id: 'projects',
      name: 'Projects',
      description: 'Add your projects (optional)',
      isRequired: false
    },
    {
      id: 'social_links',
      name: 'Social Links',
      description: 'Add your professional social links (optional)',
      isRequired: false
    }
  ];

  static async getOnboardingProgress(userId: string, profileData?: any): Promise<OnboardingProgress> {
    try {
      const onboardingStatus = await resumeFileService.getOnboardingStatus(userId);
      const completedSteps: string[] = [];
      
      // Check resume upload
      if (onboardingStatus?.resume_uploaded) {
        completedSteps.push('resume_upload');
      }
      
      // Check other steps if profile data is provided
      if (profileData) {
        for (const step of this.ONBOARDING_STEPS.slice(1)) {
          if (step.validationFn) {
            const validation = await step.validationFn(profileData);
            if (validation.isValid) {
              completedSteps.push(step.id);
            }
          }
        }
      }
      
      const requiredSteps = this.ONBOARDING_STEPS.filter(step => step.isRequired);
      const completedRequiredSteps = completedSteps.filter(stepId => 
        requiredSteps.some(step => step.id === stepId)
      );
      
      return {
        currentStep: completedSteps.length,
        totalSteps: this.ONBOARDING_STEPS.length,
        completedSteps,
        percentComplete: Math.round((completedSteps.length / this.ONBOARDING_STEPS.length) * 100),
        canProceed: completedRequiredSteps.length === requiredSteps.length
      };
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Get Onboarding Progress', userId }
      );
      
      return {
        currentStep: 0,
        totalSteps: this.ONBOARDING_STEPS.length,
        completedSteps: [],
        percentComplete: 0,
        canProceed: false
      };
    }
  }

  static async validateStep(stepId: string, data: any): Promise<{ isValid: boolean; errors: string[] }> {
    const step = this.ONBOARDING_STEPS.find(s => s.id === stepId);
    
    if (!step) {
      return { isValid: false, errors: [`Unknown step: ${stepId}`] };
    }
    
    if (!step.validationFn) {
      return { isValid: true, errors: [] };
    }
    
    try {
      return await step.validationFn(data);
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Validate Onboarding Step', additionalInfo: { stepId } }
      );
      
      return { isValid: false, errors: ['Validation failed'] };
    }
  }

  static async completeOnboarding(userId: string, profileData: any): Promise<boolean> {
    try {
      const progress = await this.getOnboardingProgress(userId, profileData);
      
      if (!progress.canProceed) {
        return false;
      }
      
      // Save final profile data
      const saveSuccess = await ErrorHandler.withRetry(
        () => profileService.saveResumeData(userId, profileData),
        {
          maxAttempts: 3,
          delay: 1000,
          backoffMultiplier: 2
        },
        { operation: 'Complete Onboarding', userId }
      );
      
      if (saveSuccess) {
        await resumeFileService.updateOnboardingStatus(userId, {
          profile_completed: true,
          onboarding_completed: true
        });
      }
      
      return saveSuccess;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Complete Onboarding', userId }
      );
      return false;
    }
  }

  static getStepDetails(): OnboardingStep[] {
    return this.ONBOARDING_STEPS.map(step => ({
      ...step,
      isCompleted: false // This will be updated by getOnboardingProgress
    }));
  }

  static async handleResumeReUpload(userId: string, newResumeFile: File, parsedData: any): Promise<boolean> {
    try {
      // Save new resume file
      const success = await resumeFileService.saveResumeFile(userId, newResumeFile, parsedData);
      
      if (success) {
        // Reset profile completion status to allow re-completion
        await resumeFileService.updateOnboardingStatus(userId, {
          resume_uploaded: true,
          profile_completed: false,
          onboarding_completed: false
        });
      }
      
      return success;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Resume Re-upload', userId }
      );
      return false;
    }
  }
}
