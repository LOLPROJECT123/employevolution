
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeFileService } from '@/services/resumeFileService';
import { SimpleProfileService } from '@/services/simpleProfileService';
import { ParsedResume } from '@/types/resume';
import { toast } from 'sonner';
import { useSimpleAutoSave } from '@/hooks/useSimpleAutoSave';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import SocialLinksSection from '@/components/profile/SocialLinksSection';
import EducationSection from '@/components/profile/EducationSection';
import WorkExperienceSection from '@/components/profile/WorkExperienceSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import ActivitiesSection from '@/components/profile/ActivitiesSection';
import SkillsSection from '@/components/profile/SkillsSection';
import LanguagesSection from '@/components/profile/LanguagesSection';

const CompleteProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  // Enhanced auto-save with better error handling
  const autoSave = useSimpleAutoSave(profileData, {
    saveFunction: async (data) => {
      if (!user?.id) {
        return { success: false, error: 'User not authenticated' };
      }
      
      console.log('🔄 Auto-saving profile data...');
      const result = await SimpleProfileService.saveProfileData(user.id, data);
      
      if (!result.success) {
        console.error('❌ Auto-save failed:', result.error);
      }
      
      return result;
    },
    interval: 3000, // Save every 3 seconds
    localStorageKey: 'profile-draft-data',
    onSaveSuccess: () => {
      console.log('✅ Auto-save successful');
    },
    onSaveError: (error) => {
      console.warn('❌ Auto-save failed:', error);
    }
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Loading user data for:', user.id);
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

      // Load enhanced profile data using new service
      const profileResult = await SimpleProfileService.loadProfileData(user.id);
      if (profileResult.success && profileResult.data) {
        console.log('📄 Loading enhanced profile data:', profileResult.data);
        
        // Merge enhanced profile data while preserving the email and name from auth
        setProfileData(prev => ({
          ...profileResult.data,
          personalInfo: {
            ...profileResult.data.personalInfo,
            // Always prioritize auth email and name if available
            email: userEmail || profileResult.data.personalInfo?.email || '',
            name: userName || profileResult.data.personalInfo?.name || ''
          }
        }));
        
        console.log('✅ Enhanced profile data merged, email should still be:', userEmail);
      } else {
        // Fallback to resume data if enhanced profile loading fails
        const resumeFile = await resumeFileService.getCurrentResumeFile(user.id);
        if (resumeFile?.parsed_data) {
          console.log('📄 Loading resume data as fallback:', resumeFile.parsed_data);
          
          setProfileData(prev => ({
            personalInfo: {
              name: prev.personalInfo.name || resumeFile.parsed_data.personalInfo?.name || userName,
              email: prev.personalInfo.email || userEmail,
              phone: resumeFile.parsed_data.personalInfo?.phone || '',
              streetAddress: '',
              city: '',
              state: '',
              county: '',
              zipCode: '',
              ...(resumeFile.parsed_data.personalInfo?.location && {
                streetAddress: resumeFile.parsed_data.personalInfo.location.includes(',') 
                  ? resumeFile.parsed_data.personalInfo.location.split(',')[0]?.trim() || ''
                  : ''
              })
            },
            socialLinks: resumeFile.parsed_data.socialLinks || prev.socialLinks,
            education: resumeFile.parsed_data.education || [],
            workExperiences: resumeFile.parsed_data.workExperiences || [],
            projects: resumeFile.parsed_data.projects || [],
            activities: resumeFile.parsed_data.activities || [],
            skills: resumeFile.parsed_data.skills || [],
            languages: resumeFile.parsed_data.languages || []
          }));
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      toast.error('Failed to load your profile data. Please refresh the page.');
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
      profileData.personalInfo.county &&
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
    if (!user) {
      toast.error('You must be logged in to complete your profile.');
      return;
    }
    
    // Add email validation check
    if (!profileData.personalInfo.email) {
      toast.error('Email is required. Please refresh the page or contact support if the issue persists.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔄 Starting enhanced profile completion process...');
      console.log('📋 Current profile data:', JSON.stringify(profileData, null, 2));
      
      // Force save current data immediately using auto-save
      console.log('💾 Force saving current profile data...');
      await autoSave.forceSave();
      
      // Wait a moment for the save to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validate profile completion using the new service
      const validation = SimpleProfileService.validateLocalProfileCompletion(profileData);
      
      if (!validation.isComplete) {
        toast.error(`Please complete the following fields: ${validation.missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('✅ Enhanced profile validation passed');
      
      // Force another save to ensure latest data is in database
      console.log('💾 Final save before completion...');
      const finalSaveResult = await SimpleProfileService.saveProfileData(user.id, profileData);
      
      if (!finalSaveResult.success) {
        console.error('❌ Final save failed:', finalSaveResult.error);
        toast.error(`Failed to save profile: ${finalSaveResult.error}`);
        setLoading(false);
        return;
      }
      
      console.log('✅ Final save completed successfully');
      
      // Update onboarding status using the enhanced service
      const onboardingResult = await resumeFileService.updateOnboardingStatus(user.id, {
        profile_completed: true,
        onboarding_completed: true
      });

      if (!onboardingResult.success) {
        console.error('❌ Failed to update onboarding status:', onboardingResult.error);
        toast.error('Profile saved but failed to complete onboarding. Please try again.');
        setLoading(false);
        return;
      }

      console.log('✅ Enhanced onboarding status updated successfully');
      
      // Check and fix any data consistency issues
      const consistencyResult = await SimpleProfileService.checkAndFixConsistency(user.id);
      if (consistencyResult.success && consistencyResult.statusFixed) {
        console.log('🔧 Data consistency issues were detected and fixed');
      }
      
      toast.success('Profile completed successfully! Welcome to Streamline!');
      
      // Small delay to ensure all database operations complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error completing enhanced profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error completing profile: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Complete Your Profile
            </CardTitle>
            <p className="text-gray-600 mb-4">
              Review and complete your profile information to get started
            </p>
            
            <div className="space-y-2">
              <Progress value={completionPercentage} className="h-2" />
              <p className="text-sm text-gray-600">{completionPercentage}% Complete</p>
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
                disabled={loading}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Auto-save indicator with enhanced error display */}
        <AutoSaveIndicator 
          status={autoSave.saveStatus}
          lastSaved={autoSave.lastSaved}
          error={autoSave.error}
        />
      </div>
    </div>
  );
};

export default CompleteProfile;
