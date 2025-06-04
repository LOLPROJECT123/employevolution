
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
    console.log('💾 Saving user profile for:', userId, profile);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profile,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error saving user profile:', error);
        return false;
      }
      
      console.log('✅ User profile saved successfully');
      return true;
    } catch (error) {
      console.error('Exception saving user profile:', error);
      return false;
    }
  }

  async updateOnboardingStatus(userId: string, updates: { profile_completed?: boolean; onboarding_completed?: boolean }): Promise<boolean> {
    try {
      console.log('🔄 Updating onboarding status for user:', userId, updates);
      
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating onboarding status:', error);
        return false;
      }

      console.log('✅ Onboarding status updated successfully');
      return true;
    } catch (error) {
      console.error('Error in updateOnboardingStatus:', error);
      return false;
    }
  }

  async saveResumeData(userId: string, resumeData: ParsedResume): Promise<boolean> {
    try {
      console.log('💾 Saving complete resume data for user:', userId);
      
      // Calculate profile completion percentage
      const completionScore = this.calculateProfileCompletion(resumeData);
      
      // Save profile data with completion score using UPSERT
      const profileSaved = await this.saveUserProfile(userId, {
        name: resumeData.personalInfo?.name || '',
        phone: resumeData.personalInfo?.phone || '',
        location: resumeData.personalInfo?.location || '',
        linkedin_url: resumeData.socialLinks?.linkedin || '',
        github_url: resumeData.socialLinks?.github || '',
        portfolio_url: resumeData.socialLinks?.portfolio || '',
        other_url: resumeData.socialLinks?.other || '',
        profile_completion: completionScore
      });

      if (!profileSaved) {
        console.error('Failed to save user profile');
        return false;
      }

      // Clear existing data and save new data
      await this.clearUserData(userId);

      // Save work experiences
      if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
        const workExperiences = resumeData.workExperiences.map(exp => ({
          user_id: userId,
          role: exp.role || '',
          company: exp.company || '',
          location: exp.location || '',
          start_date: exp.startDate || '',
          end_date: exp.endDate || '',
          description: exp.description || []
        }));

        const { error } = await supabase.from('work_experiences').insert(workExperiences);
        if (error) {
          console.error('Error saving work experiences:', error);
          return false;
        }
      }

      // Save education
      if (resumeData.education && resumeData.education.length > 0) {
        const education = resumeData.education.map(edu => ({
          user_id: userId,
          school: edu.school || '',
          degree: edu.degree || '',
          start_date: edu.startDate || '',
          end_date: edu.endDate || '',
          gpa: edu.gpa || ''
        }));

        const { error } = await supabase.from('education').insert(education);
        if (error) {
          console.error('Error saving education:', error);
          return false;
        }
      }

      // Save projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        const projects = resumeData.projects.map(proj => ({
          user_id: userId,
          name: proj.name || '',
          start_date: proj.startDate || '',
          end_date: proj.endDate || '',
          description: proj.description || [],
          technologies: proj.technologies || [],
          url: proj.url || ''
        }));

        const { error } = await supabase.from('projects').insert(projects);
        if (error) {
          console.error('Error saving projects:', error);
          return false;
        }
      }

      // Save activities
      if (resumeData.activities && resumeData.activities.length > 0) {
        const activities = resumeData.activities.map(activity => ({
          user_id: userId,
          organization: activity.organization || '',
          role: activity.role || '',
          start_date: activity.startDate || '',
          end_date: activity.endDate || '',
          description: activity.description || ''
        }));

        const { error } = await supabase.from('activities_leadership').insert(activities);
        if (error) {
          console.error('Error saving activities:', error);
          return false;
        }
      }

      // Save skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        const skills = resumeData.skills.map(skill => ({
          user_id: userId,
          skill: skill,
          category: 'general'
        }));

        const { error } = await supabase.from('user_skills').insert(skills);
        if (error) {
          console.error('Error saving skills:', error);
          return false;
        }
      }

      // Save languages
      if (resumeData.languages && resumeData.languages.length > 0) {
        const languages = resumeData.languages.map(lang => ({
          user_id: userId,
          language: lang,
          proficiency: 'conversational'
        }));

        const { error } = await supabase.from('user_languages').insert(languages);
        if (error) {
          console.error('Error saving languages:', error);
          return false;
        }
      }

      console.log('✅ All resume data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving resume data:', error);
      return false;
    }
  }

  private calculateProfileCompletion(resumeData: ParsedResume): number {
    let score = 0;
    const maxScore = 10;

    // Personal info (4 points) - now includes phone and complete address with county
    if (resumeData.personalInfo?.name?.trim()) score += 1;
    if (resumeData.personalInfo?.email?.trim()) score += 1;
    if (resumeData.personalInfo?.phone?.trim()) score += 1;
    if (resumeData.personalInfo?.location?.trim()) score += 1;

    // Experience (2 points)
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) score += 2;

    // Education (1 point)
    if (resumeData.education && resumeData.education.length > 0) score += 1;

    // Skills (1 point)
    if (resumeData.skills && resumeData.skills.length > 0) score += 1;

    // Projects (1 point)
    if (resumeData.projects && resumeData.projects.length > 0) score += 1;

    // Social links (1 point)
    if (resumeData.socialLinks?.linkedin || resumeData.socialLinks?.github) score += 1;

    return Math.round((score / maxScore) * 100);
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

  async validateProfileCompletion(profileData: any): Promise<{ isComplete: boolean; missingFields: string[] }> {
    const missingFields: string[] = [];
    
    // Required personal info - now includes separate address validation with county
    if (!profileData.personalInfo?.name?.trim()) missingFields.push('full name');
    if (!profileData.personalInfo?.email?.trim()) missingFields.push('email');
    if (!profileData.personalInfo?.phone?.trim()) missingFields.push('phone number');
    if (!profileData.personalInfo?.location?.trim()) missingFields.push('complete address');
    
    // Required sections
    if (!profileData.workExperiences || profileData.workExperiences.length === 0) {
      missingFields.push('work experience');
    }
    if (!profileData.education || profileData.education.length === 0) {
      missingFields.push('education');
    }
    if (!profileData.skills || profileData.skills.length === 0) {
      missingFields.push('skills');
    }

    return {
      isComplete: missingFields.length === 0,
      missingFields
    };
  }
}

export const profileService = new ProfileService();
