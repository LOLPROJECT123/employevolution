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
import { Save } from 'lucide-react';

const EnhancedCompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Simplified validation rules that are less strict
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

  // Simplified auto-save functionality
  const { saveStatus, lastSaved, error: saveError } = useSimpleAutoSave(profileData, {
    saveFunction: async (data) => {
      if (!user) return false;
      return await SimpleProfileService.saveProfileData(user.id, data);
    },
    interval: 3000,
    localStorageKey: user ? `profile-draft-${user.id}` : undefined,
    onSaveSuccess: () => {
      console.log('✅ Profile auto-saved successfully');
    },
    onSaveError: (error) => {
      console.error('❌ Auto-save failed:', error);
      toast.error('Auto-save failed - your changes are saved locally but not synced to the server');
    }
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

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
    
    setInitialLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading user data for user:', user.id);
      
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
      if (localBackup) {
        try {
          localData = JSON.parse(localBackup);
          console.log('📱 Found localStorage backup from:', localTimestamp || 'unknown time');
          console.log('📱 localStorage has content:', hasContent(localData));
        } catch (parseError) {
          console.warn('Failed to parse localStorage backup:', parseError);
        }
      }

      // Load existing profile data from database
      let dbData = null;
      try {
        dbData = await SimpleProfileService.loadProfileData(user.id);
        console.log('📋 Database data loaded, has content:', hasContent(dbData));
      } catch (error) {
        console.warn('Failed to load database profile:', error);
      }

      // Smart merging: prioritize localStorage if it has more content or is more recent
      let finalData;
      
      if (localData && hasContent(localData)) {
        console.log('🔄 Using localStorage data as primary source (has content)');
        finalData = mergeProfileData(localData, dbData, authData);
      } else if (dbData && hasContent(dbData)) {
        console.log('🔄 Using database data as primary source');
        finalData = mergeProfileData(null, dbData, authData);
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
    } finally {
      setInitialLoading(false);
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
      const success = await SimpleProfileService.saveProfileData(user.id, profileData);
      if (success) {
        toast.success('Profile saved successfully!');
      } else {
        toast.error('Failed to save profile. Please try again.');
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
    
    console.log('🚀 Starting profile completion process for user:', user.id);
    
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
      
      const success = await SimpleProfileService.saveProfileData(user.id, profileData);
      
      if (!success) {
        console.error('❌ Profile save failed');
        toast.error('Failed to save profile data. Please try again or contact support.');
        return;
      }

      console.log('✅ Profile data saved successfully');

      // Update onboarding status
      console.log('🔄 Updating onboarding status...');
      const onboardingUpdated = await profileService.updateOnboardingStatus(user.id, {
        profile_completed: true,
        onboarding_completed: true
      });

      if (!onboardingUpdated) {
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
                onRetry={loadUserData}
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

            {/* Manual Save Button */}
            <div className="flex justify-center mt-4">
              <Button
                onClick={handleManualSave}
                disabled={manualSaving || saveStatus === 'saving'}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {manualSaving ? 'Saving...' : 'Save Draft'}
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

      {/* Auto-save indicator */}
      <AutoSaveIndicator 
        status={saveStatus} 
        lastSaved={lastSaved || undefined}
        error={saveError || undefined}
      />
    </div>
  );
};

export default EnhancedCompleteProfile;
