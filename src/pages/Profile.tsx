
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import ModernProfileHeader from '@/components/profile/ModernProfileHeader';
import ContactSection from '@/components/profile/ContactSection';
import ModernWorkExperienceSection from '@/components/profile/ModernWorkExperienceSection';
import ModernEducationSection from '@/components/profile/ModernEducationSection';
import SocialLinksSection from '@/components/profile/SocialLinksSection';
import SkillsSection from '@/components/profile/SkillsSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import MultiLanguageSelector from '@/components/profile/MultiLanguageSelector';
import ResumeVersionManager from '@/components/resume/ResumeVersionManager';

interface Language {
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Conversational' | 'Basic';
}

interface UserProfile {
  id?: string;
  user_id: string;
  name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_url?: string;
  job_status?: string;
  languages?: Language[];
  primary_language?: string;
}

const Profile = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [showToRecruiters, setShowToRecruiters] = useState(true);
  const [jobSearchActive, setJobSearchActive] = useState(true);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    name: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    other_url: '',
    job_status: 'Actively looking',
    languages: [],
    primary_language: 'English'
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserData();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const languagesData = data.languages as any;
        const languages: Language[] = Array.isArray(languagesData) 
          ? languagesData.map((lang: any) => ({
              language: lang.language || '',
              proficiency: lang.proficiency || 'Conversational'
            }))
          : [];

        setProfile({
          ...data,
          languages,
          primary_language: data.primary_language || 'English'
        });
      } else {
        // Set default values if no profile exists
        setProfile(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Failed to load your profile information.",
        variant: "destructive",
      });
    }
  };

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [workExp, edu, proj, skillsData] = await Promise.all([
        supabase.from('work_experiences').select('*').eq('user_id', user.id),
        supabase.from('education').select('*').eq('user_id', user.id),
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('user_skills').select('*').eq('user_id', user.id)
      ]);

      setWorkExperiences(workExp.data || []);
      setEducation(edu.data || []);
      setProjects(proj.data || []);
      setSkills((skillsData.data || []).map(s => s.skill));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const calculateCompletionPercentage = () => {
    const sections = [
      profile.name && profile.phone && profile.location,
      workExperiences.length > 0,
      education.length > 0,
      skills.length > 0,
      profile.linkedin_url || profile.github_url
    ];
    
    const completedSections = sections.filter(Boolean).length;
    return Math.round((completedSections / sections.length) * 100);
  };

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          ...updates,
        });

      if (error) throw error;

      setProfile(prev => ({ ...prev, ...updates }));
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error updating profile",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguagesChange = (languages: Language[]) => {
    handleProfileUpdate({ languages });
  };

  const handlePrimaryLanguageChange = (primaryLanguage: string) => {
    handleProfileUpdate({ primary_language: primaryLanguage });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className="text-gray-400">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Modern Profile Header */}
        <div className="mb-8">
          <ModernProfileHeader
            name={profile.name || ''}
            email={user.email || ''}
            jobStatus={profile.job_status || ''}
            completionPercentage={calculateCompletionPercentage()}
            showToRecruiters={showToRecruiters}
            onToggleShowToRecruiters={setShowToRecruiters}
            jobSearchActive={jobSearchActive}
            onToggleJobSearch={setJobSearchActive}
          />
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-900 border-gray-800 w-full justify-start p-1">
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="resume" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Resume
            </TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Experience
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Skills & Languages
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Job Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-6">
            <ContactSection
              data={{
                phone: profile.phone || '',
                location: profile.location || '',
                email: user.email || ''
              }}
              onEdit={() => {
                toast({
                  title: "Edit Contact",
                  description: "Contact editing modal would open here",
                });
              }}
            />
            
            <SocialLinksSection
              data={{
                linkedin: profile.linkedin_url || '',
                github: profile.github_url || '',
                portfolio: profile.portfolio_url || '',
                other: profile.other_url || ''
              }}
              onChange={(data) => {
                handleProfileUpdate({
                  linkedin_url: data.linkedin,
                  github_url: data.github,
                  portfolio_url: data.portfolio,
                  other_url: data.other
                });
              }}
            />
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <ResumeVersionManager />
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <ModernWorkExperienceSection
              data={workExperiences}
              onAdd={() => {
                toast({
                  title: "Add Experience",
                  description: "Work experience form would open here",
                });
              }}
              onEdit={(index) => {
                toast({
                  title: "Edit Experience",
                  description: `Edit experience ${index + 1}`,
                });
              }}
            />
            
            <ModernEducationSection
              data={education}
              onAdd={() => {
                toast({
                  title: "Add Education",
                  description: "Education form would open here",
                });
              }}
              onEdit={(index) => {
                toast({
                  title: "Edit Education",
                  description: `Edit education ${index + 1}`,
                });
              }}
            />
            
            <ProjectsSection
              data={projects}
              onChange={(data) => {
                setProjects(data);
              }}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillsSection
              data={skills}
              onChange={(data) => {
                setSkills(data);
              }}
            />
            
            <MultiLanguageSelector
              languages={profile.languages || []}
              onLanguagesChange={handleLanguagesChange}
              primaryLanguage={profile.primary_language}
              onPrimaryLanguageChange={handlePrimaryLanguageChange}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center text-white">
              <h3 className="text-xl font-semibold mb-4">Job Preferences</h3>
              <p className="text-gray-400">Job preferences settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
