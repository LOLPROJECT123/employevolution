
import { supabase } from '@/integrations/supabase/client';
import { parseResumeEnhanced } from '@/utils/enhancedResumeParser';

interface ExtractedProfileData {
  personal: {
    name?: string;
    phone?: string;
    email?: string;
    location?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
  };
  workExperiences: any[];
  education: any[];
  projects: any[];
  skills: string[];
  languages: any[];
}

class ResumeAutoImportService {
  async parseAndImportResume(file: File, userId: string): Promise<ExtractedProfileData> {
    try {
      console.log('Starting enhanced resume parsing and import...');
      
      // Parse resume with enhanced extraction
      const parsedData = await parseResumeEnhanced(file, {
        showToast: false,
        useOCR: true,
        extractContacts: true,
        extractSkills: true,
        extractLanguages: true
      });

      // Extract structured data
      const extractedData = this.extractStructuredData(parsedData);
      
      // Import to profile automatically
      await this.importToProfile(extractedData, userId);
      
      return extractedData;
    } catch (error) {
      console.error('Resume auto-import failed:', error);
      throw new Error(`Failed to parse and import resume: ${(error as Error).message}`);
    }
  }

  private extractStructuredData(parsedData: any): ExtractedProfileData {
    const data: ExtractedProfileData = {
      personal: {},
      workExperiences: [],
      education: [],
      projects: [],
      skills: [],
      languages: []
    };

    // Extract personal information
    if (parsedData.personalInfo) {
      data.personal = {
        name: parsedData.personalInfo.name,
        phone: this.extractPhone(parsedData.text),
        email: this.extractEmail(parsedData.text),
        location: parsedData.personalInfo.location,
        linkedinUrl: this.extractLinkedInUrl(parsedData.text),
        githubUrl: this.extractGitHubUrl(parsedData.text),
        portfolioUrl: this.extractPortfolioUrl(parsedData.text)
      };
    }

    // Extract work experiences
    if (parsedData.workExperience) {
      data.workExperiences = parsedData.workExperience.map((exp: any) => ({
        role: exp.position || exp.title,
        company: exp.company,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description
      }));
    }

    // Extract education
    if (parsedData.education) {
      data.education = parsedData.education.map((edu: any) => ({
        school: edu.institution || edu.school,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
        gpa: edu.gpa
      }));
    }

    // Extract projects
    if (parsedData.projects) {
      data.projects = parsedData.projects.map((proj: any) => ({
        name: proj.name || proj.title,
        url: proj.url || proj.link,
        startDate: proj.startDate,
        endDate: proj.endDate,
        technologies: proj.technologies || [],
        description: proj.description
      }));
    }

    // Extract skills
    if (parsedData.skills) {
      data.skills = Array.isArray(parsedData.skills) ? parsedData.skills : [];
    }

    // Extract languages
    if (parsedData.languages) {
      data.languages = parsedData.languages.map((lang: any) => ({
        language: typeof lang === 'string' ? lang : lang.language || lang.name,
        proficiency: lang.proficiency || 'Conversational'
      }));
    }

    return data;
  }

  private async importToProfile(data: ExtractedProfileData, userId: string): Promise<void> {
    try {
      // Update user profile
      if (data.personal && Object.keys(data.personal).length > 0) {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            name: data.personal.name,
            phone: data.personal.phone,
            location: data.personal.location,
            linkedin_url: data.personal.linkedinUrl,
            github_url: data.personal.githubUrl,
            portfolio_url: data.personal.portfolioUrl,
            updated_at: new Date().toISOString()
          });
      }

      // Import work experiences
      for (const exp of data.workExperiences) {
        await supabase
          .from('work_experiences')
          .insert({
            user_id: userId,
            role: exp.role,
            company: exp.company,
            location: exp.location,
            start_date: exp.startDate,
            end_date: exp.endDate,
            description: [exp.description]
          });
      }

      // Import education
      for (const edu of data.education) {
        await supabase
          .from('education')
          .insert({
            user_id: userId,
            school: edu.school,
            degree: edu.degree,
            field_of_study: edu.fieldOfStudy,
            start_date: edu.startDate,
            end_date: edu.endDate,
            gpa: edu.gpa
          });
      }

      // Import projects
      for (const proj of data.projects) {
        await supabase
          .from('projects')
          .insert({
            user_id: userId,
            name: proj.name,
            url: proj.url,
            start_date: proj.startDate,
            end_date: proj.endDate,
            technologies: proj.technologies,
            description: [proj.description]
          });
      }

      // Import skills
      for (const skill of data.skills) {
        await supabase
          .from('user_skills')
          .upsert({
            user_id: userId,
            skill: skill,
            category: 'general'
          });
      }

      // Import languages
      for (const lang of data.languages) {
        await supabase
          .from('user_languages')
          .upsert({
            user_id: userId,
            language: lang.language,
            proficiency: lang.proficiency
          });
      }

      console.log('Successfully imported resume data to profile');
    } catch (error) {
      console.error('Error importing to profile:', error);
      throw error;
    }
  }

  private extractPhone(text: string): string | undefined {
    const phoneRegex = /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
    const match = text.match(phoneRegex);
    return match ? match[0] : undefined;
  }

  private extractEmail(text: string): string | undefined {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const match = text.match(emailRegex);
    return match ? match[0] : undefined;
  }

  private extractLinkedInUrl(text: string): string | undefined {
    const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/g;
    const match = text.match(linkedinRegex);
    return match ? match[0] : undefined;
  }

  private extractGitHubUrl(text: string): string | undefined {
    const githubRegex = /https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+/g;
    const match = text.match(githubRegex);
    return match ? match[0] : undefined;
  }

  private extractPortfolioUrl(text: string): string | undefined {
    const urlRegex = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[/a-zA-Z0-9._~:/?#[\]@!$&'()*+,;=-]*/g;
    const urls = text.match(urlRegex) || [];
    
    // Filter out LinkedIn, GitHub, and common social media URLs
    const portfolioUrls = urls.filter(url => 
      !url.includes('linkedin.com') && 
      !url.includes('github.com') &&
      !url.includes('twitter.com') &&
      !url.includes('facebook.com') &&
      !url.includes('instagram.com')
    );
    
    return portfolioUrls.length > 0 ? portfolioUrls[0] : undefined;
  }
}

export const resumeAutoImportService = new ResumeAutoImportService();
