
import { supabase } from "@/integrations/supabase/client";
import { ParsedResume } from "@/types/resume";

export interface DatabaseProfile {
  name?: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  other_url?: string;
  job_status?: string;
  profile_completion?: number;
}

export interface WorkExperience {
  id?: string;
  role: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  description?: string[];
}

export interface Education {
  id?: string;
  school: string;
  degree?: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface Project {
  id?: string;
  name: string;
  start_date?: string;
  end_date?: string;
  description?: string[];
  technologies?: string[];
  url?: string;
}

export interface ActivityLeadership {
  id?: string;
  organization: string;
  role?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

class ProfileService {
  async getUserProfile(userId: string): Promise<DatabaseProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  }

  async saveUserProfile(userId: string, profile: DatabaseProfile): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profile
      });
    
    if (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
    
    return true;
  }

  async saveResumeData(userId: string, resumeData: ParsedResume): Promise<boolean> {
    try {
      // Save profile data
      await this.saveUserProfile(userId, {
        name: resumeData.personalInfo.name,
        phone: resumeData.personalInfo.phone,
        location: resumeData.personalInfo.location,
        linkedin_url: resumeData.socialLinks.linkedin,
        github_url: resumeData.socialLinks.github,
        portfolio_url: resumeData.socialLinks.portfolio,
        other_url: resumeData.socialLinks.other
      });

      // Clear existing data and save new data
      await this.clearUserData(userId);

      // Save work experiences
      if (resumeData.workExperiences.length > 0) {
        const workExperiences = resumeData.workExperiences.map(exp => ({
          user_id: userId,
          role: exp.role,
          company: exp.company,
          location: exp.location,
          start_date: exp.startDate,
          end_date: exp.endDate,
          description: exp.description
        }));

        await supabase.from('work_experiences').insert(workExperiences);
      }

      // Save education
      if (resumeData.education.length > 0) {
        const education = resumeData.education.map(edu => ({
          user_id: userId,
          school: edu.school,
          degree: edu.degree,
          start_date: edu.startDate,
          end_date: edu.endDate
        }));

        await supabase.from('education').insert(education);
      }

      // Save projects
      if (resumeData.projects.length > 0) {
        const projects = resumeData.projects.map(proj => ({
          user_id: userId,
          name: proj.name,
          start_date: proj.startDate,
          end_date: proj.endDate,
          description: proj.description
        }));

        await supabase.from('projects').insert(projects);
      }

      // Save skills
      if (resumeData.skills.length > 0) {
        const skills = resumeData.skills.map(skill => ({
          user_id: userId,
          skill: skill,
          category: 'general'
        }));

        await supabase.from('user_skills').insert(skills);
      }

      // Save languages
      if (resumeData.languages.length > 0) {
        const languages = resumeData.languages.map(lang => ({
          user_id: userId,
          language: lang,
          proficiency: 'conversational'
        }));

        await supabase.from('user_languages').insert(languages);
      }

      return true;
    } catch (error) {
      console.error('Error saving resume data:', error);
      return false;
    }
  }

  private async clearUserData(userId: string): Promise<void> {
    await Promise.all([
      supabase.from('work_experiences').delete().eq('user_id', userId),
      supabase.from('education').delete().eq('user_id', userId),
      supabase.from('projects').delete().eq('user_id', userId),
      supabase.from('user_skills').delete().eq('user_id', userId),
      supabase.from('user_languages').delete().eq('user_id', userId),
      supabase.from('activities_leadership').delete().eq('user_id', userId)
    ]);
  }

  async loadUserData(userId: string): Promise<any> {
    const [profile, workExperiences, education, projects, skills, languages, activities] = await Promise.all([
      this.getUserProfile(userId),
      supabase.from('work_experiences').select('*').eq('user_id', userId),
      supabase.from('education').select('*').eq('user_id', userId),
      supabase.from('projects').select('*').eq('user_id', userId),
      supabase.from('user_skills').select('*').eq('user_id', userId),
      supabase.from('user_languages').select('*').eq('user_id', userId),
      supabase.from('activities_leadership').select('*').eq('user_id', userId)
    ]);

    return {
      profile: profile,
      workExperiences: workExperiences.data || [],
      education: education.data || [],
      projects: projects.data || [],
      skills: (skills.data || []).map(s => s.skill),
      languages: (languages.data || []).map(l => l.language),
      activities: activities.data || []
    };
  }
}

export const profileService = new ProfileService();
