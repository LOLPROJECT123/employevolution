import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SimpleProfileService } from '@/services/simpleProfileService';
import { profileService } from '@/services/profileService';
import { toast } from 'sonner';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useSimpleAutoSave } from '@/hooks/useSimpleAutoSave';
import { useEnhancedValidation } from '@/hooks/useEnhancedValidation';
import { ProfileFormSkeleton } from '@/components/ui/loading-skeleton';
import { EnhancedErrorDisplay } from '@/components/ui/enhanced-error-display';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import SocialLinksSection from '@/components/profile/SocialLinksSection';
import EducationSection from '@/components/profile/EducationSection';
import WorkExperienceSection from '@/components/profile/WorkExperienceSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import ActivitiesSection from '@/components/profile/ActivitiesSection';
import SkillsSection from '@/components/profile/SkillsSection';
import LanguagesSection from '@/components/profile/LanguagesSection';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const EnhancedCompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [databaseHealthy, setDatabaseHealthy] = useState(true);
  const [profileData, setProfileData] = useState<any>({
    personalInfo: { 
      name: '', 
      email: '', 
      phone: '', 
      streetAddress: '', 
      city: '', 
      state: '', 
      county: '',
      zipCode: '' 
    },
    socialLinks: { linkedin: '', github: '', portfolio: '', other: '' },
    education: [],
    workExperiences: [],
    projects: [],
    activities: [],
    skills: [],
    languages: []
  });

  // Enhanced validation rules
  const validationRules = [
    {
      validate: (data: any) => data.personalInfo?.name?.trim().length > 0,
      message: 'Name is required',
      severity: 'error' as const
    },
    {
      validate: (data: any) => data.personalInfo?.email?.includes('@'),
      message: 'Valid email is required',
      severity: 'error' as const
    },
    {
      validate: (data: any) => data.skills?.length >= 2,
      message: 'At least 2 skills recommended',
      severity: 'warning' as const
    }
  ];

  const { validate, isValidating } = useEnhancedValidation(validationRules, 1000);

  // Enhanced auto-save functionality with better error handling
  const { saveStatus, lastSaved, error: saveError } = useSimpleAutoSave(profileData, {
    saveFunction: async (data) => {
      if (!user) return { success: false, error: 'User not authenticated' };
      return await SimpleProfileService.saveProfileData(user.id, data);
    },
    interval: 3000,
    localStorageKey: user ? `profile-draft-${user.id}` : undefined,
    onSaveSuccess: () => {
      console.log('✅ Profile auto-saved successfully');
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save failed:', error);
      // Show more specific error message based on error type
      if (error.includes('network') || error.includes('timeout')) {
        toast.error('Connection issue - your changes are saved locally and will sync when connection is restored');
      } else if (error.includes('permission')) {
        toast.error('Permission denied - please refresh the page and sign in again');
      } else {
        toast.error(`Auto-save failed: ${error}`);
      }
    }
  });

  useEffect(() => {
    if (user) {
      checkDatabaseHealthAndLoadData();
    }
  }, [user]);

  // Enhanced database health check and data loading
  const checkDatabaseHealthAndLoadData = async () => {
    if (!user) return;
    
    setInitialLoading(true);
    setError(null);
    
    try {
      console.log('🏥 Checking database health...');
      const healthCheck = await SimpleProfileService.checkDatabaseHealth();
      setDatabaseHealthy(healthCheck.healthy);
      
      if (!healthCheck.healthy) {
        console.warn('⚠️ Database health check failed:', healthCheck.error);
        toast.warning('Database connection issues detected. Your changes will be saved locally.');
      }
      
      await loadUserData();
    } catch (error) {
      console.error('❌ Error during initialization:', error);
      setError('Failed to initialize profile page. Please refresh and try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  // Helper function to check if data has meaningful content
  const hasContent = (data: any) => {
    if (!data) return false;
    
    const personalInfoContent = data.personalInfo?.name?.trim() || 
                               data.personalInfo?.phone?.trim() || 
                               data.personalInfo?.streetAddress?.trim() ||
                               data.personalInfo?.city?.trim() ||
                               data.personalInfo?.state?.trim() ||
                               data.personalInfo?.county?.trim() ||
                               data.personalInfo?.zipCode?.trim();
    
    const hasArrayContent = (arr: any[]) => arr && arr.length > 0;
    
    return personalInfoContent ||
           hasArrayContent(data.education) ||
           hasArrayContent(data.workExperiences) ||
           hasArrayContent(data.projects) ||
           hasArrayContent(data.activities) ||
           hasArrayContent(data.skills) ||
           hasArrayContent(data.languages) ||
           data.socialLinks?.linkedin?.trim() ||
           data.socialLinks?.github?.trim() ||
           data.socialLinks?.portfolio?.trim() ||
           data.socialLinks?.other?.trim();
  };

  // Smart data merging - keeps the most complete version of each section
  const mergeProfileData = (localData: any, dbData: any, authData: any) => {
    const merged = {
      personalInfo: {
        // Always use auth email, prefer auth name, but merge other fields intelligently
        name: authData.name || localData?.personalInfo?.name || dbData?.personalInfo?.name || '',
        email: authData.email, // Always use auth email
        phone: localData?.personalInfo?.phone || dbData?.personalInfo?.phone || '',
        streetAddress: localData?.personalInfo?.streetAddress || dbData?.personalInfo?.streetAddress || '',
        city: localData?.personalInfo?.city || dbData?.personalInfo?.city || '',
        state: localData?.personalInfo?.state || dbData?.personalInfo?.state || '',
        county: localData?.personalInfo?.county || dbData?.personalInfo?.county || '',
        zipCode: localData?.personalInfo?.zipCode || dbData?.personalInfo?.zipCode || ''
      },
      socialLinks: {
        linkedin: localData?.socialLinks?.linkedin || dbData?.socialLinks?.linkedin || '',
        github: localData?.socialLinks?.github || dbData?.socialLinks?.github || '',
        portfolio: localData?.socialLinks?.portfolio || dbData?.socialLinks?.portfolio || '',
        other: localData?.socialLinks?.other || dbData?.socialLinks?.other || ''
      },
      // For arrays, prefer the version that has more content
      education: (localData?.education?.length > 0) ? localData.education : (dbData?.education || []),
      workExperiences: (localData?.workExperiences?.length > 0) ? localData.workExperiences : (dbData?.workExperiences || []),
      projects: (localData?.projects?.length > 0) ? localData.projects : (dbData?.projects || []),
      activities: (localData?.activities?.length > 0) ? localData.activities : (dbData?.activities || []),
      skills: (localData?.skills?.length > 0) ? localData.skills : (dbData?.skills || []),
      languages: (localData?.languages?.length > 0) ? localData.languages : (dbData?.languages || [])
    };

    return merged;
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      console.log('📋 Enhanced loading user data for user:', user.id);
      
      // Get email and name directly from authenticated user
      const userEmail = user.email || '';
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      
      const authData = {
        name: userName,
        email: userEmail
      };

      console.log('✅ Auth data:', authData);

      // Check for localStorage backup first with timestamp
      const localStorageKey = `profile-draft-${user.id}`;
      const localStorageTimestampKey = `profile-draft-timestamp-${user.id}`;
      const localBackup = localStorage.getItem(localStorageKey);
      const localTimestamp = localStorage.getItem(localStorageTimestampKey);
      
      let localData = null;
      let localTimestampDate: Date | null = null;
      
      if (localBackup) {
        try {
          localData = JSON.parse(localBackup);
          localTimestampDate = localTimestamp ? new Date(localTimestamp) : null;
          console.log('📱 Found localStorage backup from:', localTimestamp || 'unknown time');
          console.log('📱 localStorage has content:', hasContent(localData));
        } catch (parseError) {
          console.warn('Failed to parse localStorage backup:', parseError);
        }
      }

      // Load existing profile data from database only if database is healthy
      let dbData = null;
      let dbTimestampDate: Date | null = null;
      
      if (databaseHealthy) {
        try {
          const dbResult = await SimpleProfileService.loadProfileData(user.id);
          if (dbResult.success) {
            dbData = dbResult.data;
            // Estimate database timestamp (not perfect but reasonable approximation)
            dbTimestampDate = new Date(Date.now() - 60000); // Assume db data is at least 1 minute old
            console.log('📋 Database data loaded, has content:', hasContent(dbData));
          } else {
            console.warn('Failed to load database profile:', dbResult.error);
            toast.warning('Could not load your saved profile from server. Using local backup.');
          }
        } catch (error) {
          console.warn('Failed to load database profile:', error);
        }
      }

      // Enhanced merging: prioritize localStorage if it's newer or has more content
      let finalData;
      
      const localIsNewer = localTimestampDate && dbTimestampDate && localTimestampDate > dbTimestampDate;
      const localHasMoreContent = localData && hasContent(localData);
      const dbHasContent = dbData && hasContent(dbData);
      
      if (localHasMoreContent && (!dbHasContent || localIsNewer)) {
        console.log('🔄 Using localStorage data as primary source (newer or more complete)');
        finalData = mergeProfileData(localData, dbData, authData);
        toast.success('Restored your recent changes from local backup');
      } else if (dbHasContent) {
        console.log('🔄 Using database data as primary source');
        finalData = mergeProfileData(localData, dbData, authData);
      } else {
        console.log('🔄 Using auth data only (no existing content)');
        finalData = mergeProfileData(null, null, authData);
      }

      setProfileData(finalData);
      console.log('✅ Final merged profile data set');
      
      // Update localStorage with the merged data and current timestamp
      localStorage.setItem(localStorageKey, JSON.stringify(finalData));
      localStorage.setItem(localStorageTimestampKey, new Date().toISOString());
      
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setError('Failed to load your profile data. Please try again.');
      toast.error('Failed to load profile data. Please refresh the page.');
    }
  };

  const updateSection = (section: string, data: any) => {
    setProfileData(prev => {
      const updated = {
        ...prev,
        [section]: data
      };
      
      // Update localStorage timestamp when data changes
      if (user) {
        const timestampKey = `profile-draft-timestamp-${user.id}`;
        localStorage.setItem(timestampKey, new Date().toISOString());
      }
      
      return updated;
    });
  };

  const calculateCompletionPercentage = () => {
    const sections = [
      profileData.personalInfo.name && 
      profileData.personalInfo.email && 
      profileData.personalInfo.phone,
      profileData.education.length > 0,
      profileData.workExperiences.length > 0,
      profileData.skills.length > 0
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const handleManualSave = async () => {
    if (!user) return;
    
    setManualSaving(true);
    try {
      const result = await SimpleProfileService.saveProfileData(user.id, profileData);
      if (result.success) {
        toast.success('Profile saved successfully!');
      } else {
        toast.error(`Failed to save profile: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Manual save failed:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setManualSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!user) {
      console.error('❌ No user found');
      toast.error('User session not found. Please refresh and try again.');
      return;
    }
    
    console.log('🚀 Starting enhanced profile completion process for user:', user.id);
    
    // Basic validation - only check essential fields
    if (!profileData.personalInfo?.name?.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!profileData.personalInfo?.email?.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      console.log('💾 Attempting to save profile data...');
      
      const saveResult = await SimpleProfileService.saveProfileData(user.id, profileData);
      
      if (!saveResult.success) {
        console.error('❌ Profile save failed:', saveResult.error);
        toast.error(`Failed to save profile: ${saveResult.error || 'Unknown error'}`);
        return;
      }

      console.log('✅ Profile data saved successfully');

      // Update onboarding status with enhanced error handling
      console.log('🔄 Updating onboarding status...');
      const onboardingResult = await profileService.updateOnboardingStatus(user.id, {
        profile_completed: true,
        onboarding_completed: true
      });

      if (!onboardingResult) {
        console.error('❌ Failed to update onboarding status');
        toast.error('Profile saved but failed to complete onboarding. Please contact support.');
        return;
      }

      console.log('✅ Onboarding status updated successfully');

      // Clear localStorage backup only on successful completion
      const localStorageKey = `profile-draft-${user.id}`;
      const timestampKey = `profile-draft-timestamp-${user.id}`;
      localStorage.removeItem(localStorageKey);
      localStorage.removeItem(timestampKey);
      console.log('🗑️ Cleared localStorage backup after successful completion');
      
      toast.success('🎉 Profile completed successfully! Welcome to Streamline!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error completing profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (errorMessage.includes('onboarding')) {
        toast.error('Error setting up your account. Please try again or contact support.');
      } else if (errorMessage.includes('save') || errorMessage.includes('database')) {
        toast.error('Error saving your profile. Please check your connection and try again.');
      } else {
        toast.error(`Error completing profile: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = calculateCompletionPercentage();

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Loading Profile...</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileFormSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedErrorDisplay
                error={error}
                suggestions={[
                  'Check your internet connection',
                  'Refresh the page to try again',
                  'Clear your browser cache'
                ]}
                onRetry={checkDatabaseHealthAndLoadData}
                contextHelp="We're having trouble loading your profile data. This might be a temporary issue."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Build a profile that attracts opportunities • Auto-saved as you type • Data preserved when switching tabs
            </p>
            
            {!databaseHealthy && (
              <div className="flex items-center gap-2 text-amber-600 text-sm mb-4 p-2 bg-amber-50 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Connection issues detected - changes saved locally</span>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Progress value={completionPercentage} className="h-3 flex-1" />
                <span className="text-sm font-semibold ml-3 text-blue-600">
                  {completionPercentage}%
                </span>
              </div>
              {isValidating && (
                <p className="text-xs text-blue-600 animate-pulse">Validating...</p>
              )}
            </div>

            {/* Enhanced Manual Save Button with status indicators */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleManualSave}
                disabled={manualSaving || saveStatus === 'saving'}
                variant="outline"
                size="sm"
                className={`gap-2 ${
                  saveStatus === 'saved' ? 'border-green-500 text-green-600' : 
                  saveStatus === 'error' ? 'border-red-500 text-red-600' : ''
                }`}
              >
                {saveStatus === 'saved' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : saveStatus === 'error' ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {manualSaving ? 'Saving...' : 
                 saveStatus === 'saved' ? 'Saved!' :
                 saveStatus === 'error' ? 'Failed' : 'Save Draft'}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            <PersonalInfoSection 
              data={profileData.personalInfo}
              onChange={(data) => updateSection('personalInfo', data)}
            />
            
            <SocialLinksSection 
              data={profileData.socialLinks}
              onChange={(data) => updateSection('socialLinks', data)}
            />
            
            <EducationSection 
              data={profileData.education}
              onChange={(data) => updateSection('education', data)}
            />
            
            <WorkExperienceSection 
              data={profileData.workExperiences}
              onChange={(data) => updateSection('workExperiences', data)}
            />
            
            <ProjectsSection 
              data={profileData.projects}
              onChange={(data) => updateSection('projects', data)}
            />
            
            <ActivitiesSection 
              data={profileData.activities}
              onChange={(data) => updateSection('activities', data)}
            />
            
            <SkillsSection 
              data={profileData.skills}
              onChange={(data) => updateSection('skills', data)}
            />
            
            <LanguagesSection 
              data={profileData.languages}
              onChange={(data) => updateSection('languages', data)}
            />

            <div className="flex justify-end pt-6">
              <Button 
                onClick={handleSaveAndContinue}
                disabled={loading || saveStatus === 'saving'}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover-scale"
              >
                {loading ? 'Completing Profile...' : '🚀 Complete Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Auto-save indicator with better error display */}
      <AutoSaveIndicator 
        status={saveStatus} 
        lastSaved={lastSaved || undefined}
        error={saveError || undefined}
      />
    </div>
  );
};

export default EnhancedCompleteProfile;
