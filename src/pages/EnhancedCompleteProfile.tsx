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

const EnhancedCompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Validation rules
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
      validate: (data: any) => data.personalInfo?.phone?.trim().length > 0,
      message: 'Phone number is required',
      severity: 'error' as const
    },
    {
      validate: (data: any) => data.personalInfo?.streetAddress?.trim().length > 0,
      message: 'Address is required',
      severity: 'error' as const
    },
    {
      validate: (data: any) => data.skills?.length >= 3,
      message: 'At least 3 skills recommended for better visibility',
      severity: 'warning' as const
    },
    {
      validate: (data: any) => data.workExperiences?.length > 0,
      message: 'Work experience helps employers understand your background',
      severity: 'info' as const
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
    }
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setInitialLoading(true);
    setError(null);
    
    try {
      console.log('📋 Loading user data for user:', user.id);
      console.log('📧 User email from auth:', user.email);
      console.log('👤 User metadata:', user.user_metadata);

      // Get email and name directly from authenticated user - this should always be available
      const userEmail = user.email || '';
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      
      console.log('✅ Setting initial email:', userEmail, 'and name:', userName);
      
      // Set initial profile data with user info from auth immediately
      const initialPersonalInfo = {
        name: userName,
        email: userEmail,
        phone: '',
        streetAddress: '',
        city: '',
        state: '',
        county: '',
        zipCode: ''
      };

      setProfileData(prev => ({
        ...prev,
        personalInfo: initialPersonalInfo
      }));

      console.log('📝 Initial profile data set with email:', userEmail);

      // Check for localStorage backup first
      const localStorageKey = `profile-draft-${user.id}`;
      const localBackup = localStorage.getItem(localStorageKey);
      
      if (localBackup) {
        try {
          const backupData = JSON.parse(localBackup);
          console.log('📱 Loading from localStorage backup');
          
          // Merge localStorage backup while preserving auth email and name
          setProfileData({
            ...backupData,
            personalInfo: {
              ...backupData.personalInfo,
              name: userName || backupData.personalInfo?.name || '',
              email: userEmail, // Always use auth email
            }
          });
        } catch (parseError) {
          console.warn('Failed to parse localStorage backup:', parseError);
        }
      }

      // Load existing profile data from database
      const existingProfile = await SimpleProfileService.loadProfileData(user.id);
      if (existingProfile) {
        console.log('📋 Loaded existing profile from database');
        
        // Merge database data while preserving auth email and name
        setProfileData({
          ...existingProfile,
          personalInfo: {
            ...existingProfile.personalInfo,
            name: userName || existingProfile.personalInfo?.name || '',
            email: userEmail, // Always prioritize auth email
          }
        });
        
        console.log('✅ Database profile merged, email should still be:', userEmail);
        
        // Clear localStorage backup since we have fresh data from server
        localStorage.removeItem(localStorageKey);
      } else {
        console.log('📄 No existing profile found in database, keeping auth-based profile data');
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setError('Failed to load your profile data. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  const updateSection = (section: string, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const calculateCompletionPercentage = () => {
    const sections = [
      profileData.personalInfo.name && 
      profileData.personalInfo.email && 
      profileData.personalInfo.phone &&
      profileData.personalInfo.streetAddress &&
      profileData.personalInfo.city &&
      profileData.personalInfo.state &&
      profileData.personalInfo.zipCode,
      profileData.education.length > 0,
      profileData.workExperiences.length > 0,
      profileData.projects.length > 0,
      profileData.skills.length > 0
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const handleSaveAndContinue = async () => {
    if (!user) return;
    
    // Validate before final save
    const validationResult = validate(profileData);
    
    if (!validationResult.isValid) {
      toast.error(`Please fix the following issues: ${validationResult.errors.join(', ')}`);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🚀 Completing profile...');
      
      // Use the standard profileService for final completion with all validations
      const success = await SimpleProfileService.saveProfileData(user.id, profileData);
      
      if (success) {
        // Update onboarding status
        const onboardingUpdated = await profileService.updateOnboardingStatus?.(user.id, {
          profile_completed: true,
          onboarding_completed: true
        });

        // Clear localStorage backup on successful completion
        localStorage.removeItem(`profile-draft-${user.id}`);
        toast.success('🎉 Profile completed successfully! Welcome to Streamline!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to complete profile');
      }
    } catch (error) {
      console.error('❌ Error completing profile:', error);
      toast.error('Error completing profile. Please try again.');
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
