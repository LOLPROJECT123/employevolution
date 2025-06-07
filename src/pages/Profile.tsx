import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
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
import EnhancedSettingsSection from '@/components/profile/EnhancedSettingsSection';
import EnhancedEqualEmploymentSection from '@/components/profile/EnhancedEqualEmploymentSection';
import EnhancedJobPreferencesSection from '@/components/profile/EnhancedJobPreferencesSection';
import EditWorkExperience from '@/components/profile/EditWorkExperience';
import EditEducation from '@/components/profile/EditEducation';
import EditProject from '@/components/profile/EditProject';
import ModernProjectsSection from '@/components/profile/ModernProjectsSection';
import { CheckCircle } from 'lucide-react';
import { useProfileAutoSave } from '@/hooks/useProfileAutoSave';

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
  date_of_birth?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_url?: string;
  job_status?: string;
  languages?: Language[];
  primary_language?: string;
}

interface WorkExperience {
  id: number;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  id: number;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

interface Project {
  id: number;
  name: string;
  url?: string;
  startDate: string;
  endDate: string;
  technologies?: string[];
  description: string;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');
  const [showToRecruiters, setShowToRecruiters] = useState(true);
  const [jobSearchActive, setJobSearchActive] = useState(true);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  
  // Modal state management
  const [isWorkExperienceModalOpen, setIsWorkExperienceModalOpen] = useState(false);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingWorkExperience, setEditingWorkExperience] = useState<WorkExperience | undefined>(undefined);
  const [editingEducation, setEditingEducation] = useState<Education | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  const [profile, setProfile] = useState<UserProfile>({
    user_id: user?.id || '',
    name: '',
    phone: '',
    location: '',
    date_of_birth: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    other_url: '',
    job_status: 'Actively looking',
    languages: [],
    primary_language: 'English'
  });

  // Auto-save hooks for different sections
  const contactAutoSave = useProfileAutoSave({
    phone: profile.phone,
    location: profile.location,
    dateOfBirth: profile.date_of_birth
  }, { section: 'contact' });

  const socialLinksAutoSave = useProfileAutoSave({
    linkedin: profile.linkedin_url,
    github: profile.github_url,
    portfolio: profile.portfolio_url,
    other: profile.other_url
  }, { section: 'socialLinks' });

  const skillsAutoSave = useProfileAutoSave(skills, { 
    section: 'skills',
    interval: 1000
  });

  const languagesAutoSave = useProfileAutoSave(profile.languages, { section: 'languages' });

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
          primary_language: data.primary_language || 'English',
          date_of_birth: data.date_of_birth || ''
        });
      } else {
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

      // Transform database data to match component interfaces
      const transformedWorkExp = (workExp.data || []).map(exp => ({
        id: parseInt(exp.id),
        role: exp.role || '',
        company: exp.company || '',
        location: exp.location || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || '',
        description: Array.isArray(exp.description) ? exp.description.join('\n') : (exp.description || '')
      }));

      const transformedEducation = (edu.data || []).map(edu => ({
        id: parseInt(edu.id),
        school: edu.school || '',
        degree: edu.degree || '',
        startDate: edu.start_date || '',
        endDate: edu.end_date || ''
      }));

      const transformedProjects = (proj.data || []).map(project => ({
        id: parseInt(project.id),
        name: project.name || '',
        url: project.url || undefined,
        startDate: project.start_date || '',
        endDate: project.end_date || '',
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        description: Array.isArray(project.description) ? project.description.join('\n') : (project.description || '')
      }));

      setWorkExperiences(transformedWorkExp);
      setEducation(transformedEducation);
      setProjects(transformedProjects);
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
      const updateData: any = {
        user_id: user.id,
        ...profile,
        ...updates,
      };

      if (updateData.languages) {
        updateData.languages = JSON.parse(JSON.stringify(updateData.languages));
      }

      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData);

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

  const handleContactUpdate = (contactData: any) => {
    // Update local state - auto-save will handle the database update
    setProfile(prev => ({
      ...prev,
      phone: contactData.phone,
      location: contactData.location,
      date_of_birth: contactData.dateOfBirth
    }));
  };

  const handleSocialLinksUpdate = (socialData: any) => {
    // Update local state - auto-save will handle the database update
    setProfile(prev => ({
      ...prev,
      linkedin_url: socialData.linkedin,
      github_url: socialData.github,
      portfolio_url: socialData.portfolio,
      other_url: socialData.other
    }));
  };

  const handleLanguagesChange = (languages: Language[]) => {
    // Update local state - auto-save will handle the database update
    setProfile(prev => ({ ...prev, languages }));
  };

  const handlePrimaryLanguageChange = (primaryLanguage: string) => {
    handleProfileUpdate({ primary_language: primaryLanguage });
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setSkills(newSkills);
  };

  const handleAddWorkExperience = () => {
    setEditingWorkExperience(undefined);
    setIsWorkExperienceModalOpen(true);
  };

  const handleEditWorkExperience = (index: number) => {
    setEditingWorkExperience(workExperiences[index]);
    setIsWorkExperienceModalOpen(true);
  };

  const handleSaveWorkExperience = async (experienceData: WorkExperience) => {
    if (!user) return;

    try {
      const dbData = {
        user_id: user.id,
        role: experienceData.role,
        company: experienceData.company,
        location: experienceData.location,
        start_date: experienceData.startDate,
        end_date: experienceData.endDate,
        description: [experienceData.description] // Convert string to array
      };

      if (editingWorkExperience) {
        // Update existing
        console.log('Updating work experience with ID:', editingWorkExperience.id);
        const { error } = await supabase
          .from('work_experiences')
          .update(dbData)
          .eq('id', editingWorkExperience.id.toString());

        if (error) throw error;

        setWorkExperiences(prev => 
          prev.map(exp => exp.id === editingWorkExperience.id ? experienceData : exp)
        );
      } else {
        // Add new
        const { data, error } = await supabase
          .from('work_experiences')
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;

        const newExperience = {
          ...experienceData,
          id: parseInt(data.id)
        };

        setWorkExperiences(prev => [...prev, newExperience]);
      }

      toast({
        title: "Success",
        description: "Work experience saved successfully",
      });
    } catch (error) {
      console.error('Error saving work experience:', error);
      toast({
        title: "Error",
        description: "Failed to save work experience",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkExperience = async (id: number) => {
    if (!user) return;

    try {
      console.log('Deleting work experience with ID:', id);
      // Convert number to string for the database query
      const { error } = await supabase
        .from('work_experiences')
        .delete()
        .eq('id', id.toString());

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setWorkExperiences(prev => prev.filter(exp => exp.id !== id));

      toast({
        title: "Success",
        description: "Work experience deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting work experience:', error);
      toast({
        title: "Error",
        description: "Failed to delete work experience",
        variant: "destructive",
      });
    }
  };

  const handleAddEducation = () => {
    setEditingEducation(undefined);
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (index: number) => {
    setEditingEducation(education[index]);
    setIsEducationModalOpen(true);
  };

  const handleSaveEducation = async (educationData: Education) => {
    if (!user) return;

    try {
      const dbData = {
        user_id: user.id,
        school: educationData.school,
        degree: educationData.degree,
        start_date: educationData.startDate,
        end_date: educationData.endDate
      };

      if (editingEducation) {
        // Update existing - convert number to string for the database query
        console.log('Updating education with ID:', editingEducation.id);
        const { error } = await supabase
          .from('education')
          .update(dbData)
          .eq('id', editingEducation.id.toString());

        if (error) throw error;

        setEducation(prev => 
          prev.map(edu => edu.id === editingEducation.id ? educationData : edu)
        );
      } else {
        // Add new
        const { data, error } = await supabase
          .from('education')
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;

        const newEducation = {
          ...educationData,
          id: parseInt(data.id)
        };

        setEducation(prev => [...prev, newEducation]);
      }

      toast({
        title: "Success",
        description: "Education saved successfully",
      });
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error",
        description: "Failed to save education",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!user) return;

    try {
      console.log('Deleting education with ID:', id);
      // Convert number to string for the database query
      const { error } = await supabase
        .from('education')
        .delete()
        .eq('id', id.toString());

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setEducation(prev => prev.filter(edu => edu.id !== id));

      toast({
        title: "Success",
        description: "Education deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting education:', error);
      toast({
        title: "Error",
        description: "Failed to delete education",
        variant: "destructive",
      });
    }
  };

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (index: number) => {
    setEditingProject(projects[index]);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = async (projectData: Project) => {
    if (!user) return;

    try {
      const dbData = {
        user_id: user.id,
        name: projectData.name,
        url: projectData.url || null,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        technologies: projectData.technologies || [],
        description: [projectData.description] // Convert string to array
      };

      if (editingProject) {
        // Update existing
        console.log('Updating project with ID:', editingProject.id);
        const { error } = await supabase
          .from('projects')
          .update(dbData)
          .eq('id', editingProject.id.toString());

        if (error) throw error;

        setProjects(prev => 
          prev.map(proj => proj.id === editingProject.id ? projectData : proj)
        );
      } else {
        // Add new
        const { data, error } = await supabase
          .from('projects')
          .insert(dbData)
          .select()
          .single();

        if (error) throw error;

        const newProject = {
          ...projectData,
          id: parseInt(data.id)
        };

        setProjects(prev => [...prev, newProject]);
      }

      toast({
        title: "Success",
        description: "Project saved successfully",
      });
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!user) return;

    try {
      console.log('Deleting project with ID:', id);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id.toString());

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      setProjects(prev => prev.filter(proj => proj.id !== id));

      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} text-center`}>
          <h2 className="text-2xl font-bold mb-4">Please log in</h2>
          <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} w-full justify-start p-1 border`}>
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
            <TabsTrigger 
              value="employment" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Equal Employment
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-6">
            <ContactSection
              data={{
                phone: profile.phone || '',
                location: profile.location || '',
                email: user.email || '',
                dateOfBirth: profile.date_of_birth || ''
              }}
              onUpdate={handleContactUpdate}
            />
            
            <SocialLinksSection
              data={{
                linkedin: profile.linkedin_url || '',
                github: profile.github_url || '',
                portfolio: profile.portfolio_url || '',
                other: profile.other_url || ''
              }}
              onChange={handleSocialLinksUpdate}
            />
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <ResumeVersionManager />
          </TabsContent>

          <TabsContent value="experience" className="space-y-6">
            <ModernWorkExperienceSection
              data={workExperiences}
              onAdd={handleAddWorkExperience}
              onEdit={handleEditWorkExperience}
            />
            
            <ModernEducationSection
              data={education}
              onAdd={handleAddEducation}
              onEdit={handleEditEducation}
            />
            
            <ModernProjectsSection
              data={projects}
              onAdd={handleAddProject}
              onEdit={handleEditProject}
            />
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillsSection
              data={skills}
              onChange={handleSkillsChange}
            />
            
            <MultiLanguageSelector
              languages={profile.languages || []}
              onLanguagesChange={handleLanguagesChange}
              primaryLanguage={profile.primary_language}
              onPrimaryLanguageChange={handlePrimaryLanguageChange}
            />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <EnhancedJobPreferencesSection />
          </TabsContent>

          <TabsContent value="employment" className="space-y-6">
            <EnhancedEqualEmploymentSection />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <EnhancedSettingsSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Work Experience Modal */}
      <EditWorkExperience
        open={isWorkExperienceModalOpen}
        onClose={() => setIsWorkExperienceModalOpen(false)}
        experience={editingWorkExperience}
        onSave={handleSaveWorkExperience}
        onDelete={handleDeleteWorkExperience}
      />

      {/* Education Modal */}
      <EditEducation
        open={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        education={editingEducation}
        onSave={handleSaveEducation}
        onDelete={handleDeleteEducation}
      />

      {/* Project Modal */}
      <EditProject
        open={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        project={editingProject}
        onSave={handleSaveProject}
        onDelete={handleDeleteProject}
      />
    </div>
  );
};

export default Profile;
