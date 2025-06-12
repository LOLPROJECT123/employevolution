
import { supabase } from "@/integrations/supabase/client";
import { ParsedResume } from "@/types/resume";
import { toast } from "sonner";

export interface ImportOptions {
  replaceExisting?: boolean;
  mergeData?: boolean;
  skipConflicts?: boolean;
}

export interface ImportConflict {
  field: string;
  existing: any;
  incoming: any;
  section: string;
}

export interface ImportResult {
  success: boolean;
  conflicts?: ImportConflict[];
  imported: {
    personalInfo: boolean;
    workExperiences: number;
    education: number;
    projects: number;
    skills: number;
    languages: number;
  };
  error?: string;
}

class ResumeProfileImportService {
  async importResumeToProfile(
    userId: string, 
    parsedResume: ParsedResume, 
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const { replaceExisting = false, mergeData = true } = options;
    
    try {
      console.log('🔄 Starting resume data import to profile for user:', userId);
      
      const result: ImportResult = {
        success: false,
        imported: {
          personalInfo: false,
          workExperiences: 0,
          education: 0,
          projects: 0,
          skills: 0,
          languages: 0
        }
      };

      // Import personal information to user_profiles table (not profiles)
      if (parsedResume.personalInfo) {
        const personalSuccess = await this.importPersonalInfo(userId, parsedResume.personalInfo, replaceExisting);
        result.imported.personalInfo = personalSuccess;
      }

      // Import social links to user_profiles table
      if (parsedResume.socialLinks) {
        await this.importSocialLinks(userId, parsedResume.socialLinks, replaceExisting);
      }

      // Import work experiences
      if (parsedResume.workExperiences && parsedResume.workExperiences.length > 0) {
        const workCount = await this.importWorkExperiences(userId, parsedResume.workExperiences, replaceExisting);
        result.imported.workExperiences = workCount;
      }

      // Import education
      if (parsedResume.education && parsedResume.education.length > 0) {
        const eduCount = await this.importEducation(userId, parsedResume.education, replaceExisting);
        result.imported.education = eduCount;
      }

      // Import projects
      if (parsedResume.projects && parsedResume.projects.length > 0) {
        const projectCount = await this.importProjects(userId, parsedResume.projects, replaceExisting);
        result.imported.projects = projectCount;
      }

      // Import skills
      if (parsedResume.skills && parsedResume.skills.length > 0) {
        const skillsCount = await this.importSkills(userId, parsedResume.skills, replaceExisting);
        result.imported.skills = skillsCount;
      }

      // Import languages
      if (parsedResume.languages && parsedResume.languages.length > 0) {
        const langCount = await this.importLanguages(userId, parsedResume.languages, replaceExisting);
        result.imported.languages = langCount;
      }

      result.success = true;
      console.log('✅ Resume import completed successfully:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Resume import failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown import error',
        imported: {
          personalInfo: false,
          workExperiences: 0,
          education: 0,
          projects: 0,
          skills: 0,
          languages: 0
        }
      };
    }
  }

  private async importPersonalInfo(userId: string, personalInfo: any, replaceExisting: boolean): Promise<boolean> {
    try {
      // Check if user_profiles exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const profileData: any = {
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // Add personal info fields if they exist
      if (personalInfo.name) profileData.name = personalInfo.name;
      if (personalInfo.phone) profileData.phone = personalInfo.phone;
      if (personalInfo.location) profileData.location = personalInfo.location;
      if (personalInfo.dateOfBirth) profileData.date_of_birth = personalInfo.dateOfBirth;

      if (existingProfile) {
        // Update existing profile - only update fields that are provided
        const updateData: any = { updated_at: new Date().toISOString() };
        
        if (replaceExisting || !existingProfile.name) {
          if (personalInfo.name) updateData.name = personalInfo.name;
        }
        if (replaceExisting || !existingProfile.phone) {
          if (personalInfo.phone) updateData.phone = personalInfo.phone;
        }
        if (replaceExisting || !existingProfile.location) {
          if (personalInfo.location) updateData.location = personalInfo.location;
        }
        if (replaceExisting || !existingProfile.date_of_birth) {
          if (personalInfo.dateOfBirth) updateData.date_of_birth = personalInfo.dateOfBirth;
        }

        const { error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('user_profiles')
          .insert(profileData);
        
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to import personal info:', error);
      return false;
    }
  }

  private async importSocialLinks(userId: string, socialLinks: any, replaceExisting: boolean): Promise<boolean> {
    try {
      // Check if user_profiles exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const updateData: any = { updated_at: new Date().toISOString() };

      // Add social links if they exist
      if (replaceExisting || !existingProfile?.linkedin_url) {
        if (socialLinks.linkedin) updateData.linkedin_url = socialLinks.linkedin;
      }
      if (replaceExisting || !existingProfile?.github_url) {
        if (socialLinks.github) updateData.github_url = socialLinks.github;
      }
      if (replaceExisting || !existingProfile?.portfolio_url) {
        if (socialLinks.portfolio) updateData.portfolio_url = socialLinks.portfolio;
      }
      if (replaceExisting || !existingProfile?.other_url) {
        if (socialLinks.other) updateData.other_url = socialLinks.other;
      }

      if (existingProfile) {
        const { error } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Create new profile with social links
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            user_id: userId,
            ...updateData,
            created_at: new Date().toISOString()
          });
        
        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to import social links:', error);
      return false;
    }
  }

  private async importWorkExperiences(userId: string, experiences: any[], replaceExisting: boolean): Promise<number> {
    try {
      if (replaceExisting) {
        // Delete existing work experiences
        await supabase
          .from('work_experiences')
          .delete()
          .eq('user_id', userId);
      }

      let importedCount = 0;
      for (const exp of experiences) {
        const { error } = await supabase
          .from('work_experiences')
          .insert({
            user_id: userId,
            role: exp.role || '',
            company: exp.company || '',
            location: exp.location || '',
            start_date: exp.startDate || '',
            end_date: exp.endDate || '',
            description: Array.isArray(exp.description) ? exp.description : [exp.description].filter(Boolean)
          });

        if (!error) importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import work experiences:', error);
      return 0;
    }
  }

  private async importEducation(userId: string, education: any[], replaceExisting: boolean): Promise<number> {
    try {
      if (replaceExisting) {
        await supabase
          .from('education')
          .delete()
          .eq('user_id', userId);
      }

      let importedCount = 0;
      for (const edu of education) {
        const { error } = await supabase
          .from('education')
          .insert({
            user_id: userId,
            school: edu.school || '',
            degree: edu.degree || '',
            field_of_study: edu.fieldOfStudy || '',
            start_date: edu.startDate || '',
            end_date: edu.endDate || '',
            gpa: edu.gpa || ''
          });

        if (!error) importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import education:', error);
      return 0;
    }
  }

  private async importProjects(userId: string, projects: any[], replaceExisting: boolean): Promise<number> {
    try {
      if (replaceExisting) {
        await supabase
          .from('projects')
          .delete()
          .eq('user_id', userId);
      }

      let importedCount = 0;
      for (const project of projects) {
        const { error } = await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name: project.name || '',
            description: Array.isArray(project.description) ? project.description : [project.description].filter(Boolean),
            start_date: project.startDate || '',
            end_date: project.endDate || '',
            url: project.url || '',
            technologies: project.technologies || []
          });

        if (!error) importedCount++;
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import projects:', error);
      return 0;
    }
  }

  private async importSkills(userId: string, skills: string[], replaceExisting: boolean): Promise<number> {
    try {
      if (replaceExisting) {
        await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', userId);
      }

      let importedCount = 0;
      for (const skill of skills) {
        if (skill && skill.trim()) {
          const { error } = await supabase
            .from('user_skills')
            .insert({
              user_id: userId,
              skill: skill.trim(),
              proficiency: 'intermediate'
            });

          if (!error) importedCount++;
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import skills:', error);
      return 0;
    }
  }

  private async importLanguages(userId: string, languages: string[], replaceExisting: boolean): Promise<number> {
    try {
      if (replaceExisting) {
        await supabase
          .from('user_languages')
          .delete()
          .eq('user_id', userId);
      }

      let importedCount = 0;
      for (const language of languages) {
        if (language && language.trim()) {
          const { error } = await supabase
            .from('user_languages')
            .insert({
              user_id: userId,
              language: language.trim(),
              proficiency: 'conversational'
            });

          if (!error) importedCount++;
        }
      }

      return importedCount;
    } catch (error) {
      console.error('Failed to import languages:', error);
      return 0;
    }
  }
}

export const resumeProfileImportService = new ResumeProfileImportService();
