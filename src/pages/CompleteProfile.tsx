import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { resumeFileService } from '@/services/resumeFileService';
import { profileService } from '@/services/profileService';
import { ParsedResume } from '@/types/resume';
import { toast } from 'sonner';
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
  const [emailLoadError, setEmailLoadError] = useState<string | null>(null);
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
      
      // Get email with fallback options
      const userEmail = user.email || user.user_metadata?.email || '';
      const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
      
      if (!userEmail) {
        console.error('❌ No email found for user');
        setEmailLoadError('Unable to load your email from your account. Please contact support.');
        return;
      }
      
      console.log('✅ Using email:', userEmail, 'and name:', userName);
      
      // Set initial profile data with user info from auth
      setProfileData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: userName,
          email: userEmail,
        }
      }));

      // Load resume data if available
      const resumeFile = await resumeFileService.getCurrentResumeFile(user.id);
      if (resumeFile?.parsed_data) {
        console.log('📄 Loading resume data:', resumeFile.parsed_data);
        setProfileData(prev => ({
          personalInfo: {
            ...prev.personalInfo, // Keep the pre-populated name and email
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
    } catch (error) {
      console.error('❌ Error loading user data:', error);
      setEmailLoadError('Failed to load your profile data. Please refresh the page.');
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
    if (!user) return;
    
    // Add email validation check
    if (!profileData.personalInfo.email) {
      toast.error('Email is required. Please refresh the page or contact support if the issue persists.');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔄 Starting profile completion process...');
      
      // Combine address fields into location for database storage
      const combinedLocation = [
        profileData.personalInfo.streetAddress,
        profileData.personalInfo.city,
        profileData.personalInfo.state,
        profileData.personalInfo.county,
        profileData.personalInfo.zipCode
      ].filter(Boolean).join(', ');

      const profileDataForValidation = {
        ...profileData,
        personalInfo: {
          ...profileData.personalInfo,
          location: combinedLocation
        }
      };
      
      // Validate profile completion
      const validation = await profileService.validateProfileCompletion(profileDataForValidation);
      
      if (!validation.isComplete) {
        toast.error(`Please complete the following fields: ${validation.missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      console.log('✅ Profile validation passed');
      
      // Save profile data to database
      const success = await profileService.saveResumeData(user.id, profileDataForValidation as ParsedResume);
      
      if (!success) {
        toast.error('Failed to save profile. Please try again.');
        setLoading(false);
        return;
      }

      console.log('✅ Profile data saved successfully');
      
      // Update onboarding status to mark completion
      const onboardingUpdated = await resumeFileService.updateOnboardingStatus(user.id, {
        profile_completed: true,
        onboarding_completed: true
      });

      if (!onboardingUpdated) {
        console.error('Failed to update onboarding status');
        toast.error('Failed to complete onboarding. Please try again.');
        setLoading(false);
        return;
      }

      console.log('✅ Onboarding status updated successfully');
      
      toast.success('Profile completed successfully! Welcome to Streamline!');
      
      // Small delay to ensure all database operations complete
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Error completing profile. Please try again.');
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
            
            {emailLoadError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-700 text-sm">{emailLoadError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadUserData}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
            
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
                disabled={loading || !!emailLoadError}
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
              >
                {loading ? 'Completing Profile...' : 'Complete Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompleteProfile;
