
import { profileService } from './profileService';
import { AddressValidator, AddressComponents } from '@/utils/addressValidation';
import { ProfileDataSync } from '@/utils/profileDataSync';
import { ErrorHandler, ProfileErrorHandler } from '@/utils/errorHandling';
import { OnboardingFlowManager } from '@/utils/onboardingFlow';
import { ProfileCompletionTracker } from '@/utils/profileCompletionTracker';
import { DataImportExport } from '@/utils/dataImportExport';
import { ParsedResume } from '@/types/resume';

export class EnhancedProfileService {
  // Enhanced save with validation and sync
  static async saveProfileWithValidation(userId: string, profileData: any): Promise<boolean> {
    try {
      // Validate address components
      if (profileData.personalInfo) {
        const addressComponents: AddressComponents = {
          streetAddress: profileData.personalInfo.streetAddress || '',
          city: profileData.personalInfo.city || '',
          state: profileData.personalInfo.state || '',
          county: profileData.personalInfo.county || '',
          zipCode: profileData.personalInfo.zipCode || ''
        };

        const addressValidation = AddressValidator.validateCompleteAddress(addressComponents);
        if (!addressValidation.isValid) {
          throw new Error(`Address validation failed: ${addressValidation.errors.join(', ')}`);
        }

        // Use standardized address if available
        if (addressValidation.standardizedAddress) {
          profileData.personalInfo = {
            ...profileData.personalInfo,
            ...addressValidation.standardizedAddress
          };
        }
      }

      // Sync data format for database
      const syncResult = ProfileDataSync.prepareProfileForDatabase(profileData);
      if (!syncResult.success) {
        throw new Error(`Data sync failed: ${syncResult.errors?.join(', ')}`);
      }

      // Save with retry mechanism
      const saveSuccess = await ProfileErrorHandler.handleProfileSaveError(
        new Error('Initial attempt'), // This will be replaced by the actual operation
        () => profileService.saveResumeData(userId, syncResult.data!)
      );

      if (saveSuccess) {
        // Update completion tracking
        await ProfileCompletionTracker.updateCompletionTracking(userId, profileData);
        
        // Create backup
        await DataImportExport.createBackup(syncResult.data!);
      }

      return saveSuccess;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Enhanced Profile Save', userId }
      );
      return false;
    }
  }

  // Enhanced load with format conversion
  static async loadProfileForUI(userId: string): Promise<any> {
    try {
      const userData = await profileService.loadUserData(userId);
      
      if (userData?.profile) {
        // Convert database format to UI format
        const uiData = {
          personalInfo: {
            name: userData.profile.name || '',
            email: '', // This should come from auth
            phone: userData.profile.phone || '',
            location: userData.profile.location || '',
            linkedin_url: userData.profile.linkedin_url || '',
            github_url: userData.profile.github_url || '',
            portfolio_url: userData.profile.portfolio_url || '',
            other_url: userData.profile.other_url || ''
          },
          workExperiences: userData.workExperiences || [],
          education: userData.education || [],
          projects: userData.projects || [],
          skills: userData.skills || [],
          languages: userData.languages || [],
          activities: userData.activities || [],
          socialLinks: {
            linkedin: userData.profile.linkedin_url || '',
            github: userData.profile.github_url || '',
            portfolio: userData.profile.portfolio_url || '',
            other: userData.profile.other_url || ''
          }
        };

        // Convert location to address components
        const syncResult = ProfileDataSync.prepareProfileForUI(uiData);
        return syncResult.success ? syncResult.data : uiData;
      }

      return null;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Enhanced Profile Load', userId }
      );
      return null;
    }
  }

  // Validate profile completion with detailed feedback
  static async validateProfileCompletionDetailed(userId: string, profileData: any) {
    try {
      // Get onboarding progress
      const progress = await OnboardingFlowManager.getOnboardingProgress(userId, profileData);
      
      // Get detailed completion analysis
      const completionItems = ProfileCompletionTracker.calculateDetailedCompletion(profileData);
      const qualityMetrics = ProfileCompletionTracker.calculateQualityMetrics(profileData);
      
      // Get next milestone
      const nextMilestone = ProfileCompletionTracker.getNextMilestone(qualityMetrics.completionScore);
      
      return {
        progress,
        completionItems,
        qualityMetrics,
        nextMilestone,
        isReadyForCompletion: progress.canProceed
      };
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Profile Completion Validation', userId }
      );
      
      return {
        progress: { currentStep: 0, totalSteps: 0, completedSteps: [], percentComplete: 0, canProceed: false },
        completionItems: [],
        qualityMetrics: { completionScore: 0, qualityScore: 0, strengthAreas: [], improvementAreas: [], recommendations: [] },
        nextMilestone: null,
        isReadyForCompletion: false
      };
    }
  }

  // Complete onboarding with all validations
  static async completeOnboardingWithValidation(userId: string, profileData: any): Promise<boolean> {
    try {
      // Validate completion requirements
      const validation = await this.validateProfileCompletionDetailed(userId, profileData);
      
      if (!validation.isReadyForCompletion) {
        const missingItems = validation.completionItems
          .filter(item => !item.isCompleted && item.priority === 'high')
          .map(item => item.description);
        
        throw new Error(`Profile completion requirements not met: ${missingItems.join(', ')}`);
      }

      // Complete onboarding through flow manager
      return await OnboardingFlowManager.completeOnboarding(userId, profileData);
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Complete Onboarding', userId }
      );
      return false;
    }
  }

  // Export profile data
  static async exportProfile(userId: string, format: 'json' | 'csv' = 'json') {
    try {
      const profileData = await this.loadProfileForUI(userId);
      
      if (!profileData) {
        throw new Error('No profile data found for export');
      }

      return await DataImportExport.exportProfileData(profileData, {
        format,
        includePersonalInfo: true,
        includeWorkExperience: true,
        includeEducation: true,
        includeSkills: true,
        includeProjects: true
      });
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Export Profile', userId }
      );
      
      return { success: false, error: 'Export failed' };
    }
  }

  // Import and merge profile data
  static async importAndMergeProfile(userId: string, fileContent: string, format: 'json' | 'csv'): Promise<boolean> {
    try {
      const importResult = await DataImportExport.importProfileData(fileContent, format);
      
      if (!importResult.success) {
        throw new Error(`Import failed: ${importResult.errors?.join(', ')}`);
      }

      // Load existing profile
      const existingProfile = await this.loadProfileForUI(userId);
      
      // Merge with imported data (existing data takes precedence)
      const mergedProfile = {
        ...importResult.data,
        ...existingProfile,
        // Merge arrays instead of replacing
        workExperiences: [
          ...(existingProfile?.workExperiences || []),
          ...(importResult.data?.workExperiences || [])
        ],
        education: [
          ...(existingProfile?.education || []),
          ...(importResult.data?.education || [])
        ],
        projects: [
          ...(existingProfile?.projects || []),
          ...(importResult.data?.projects || [])
        ],
        skills: Array.from(new Set([
          ...(existingProfile?.skills || []),
          ...(importResult.data?.skills || [])
        ])),
        languages: Array.from(new Set([
          ...(existingProfile?.languages || []),
          ...(importResult.data?.languages || [])
        ]))
      };

      // Save merged profile
      return await this.saveProfileWithValidation(userId, mergedProfile);
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Import Profile', userId }
      );
      return false;
    }
  }
}
