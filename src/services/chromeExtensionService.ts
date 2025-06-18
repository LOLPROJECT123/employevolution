
import { supabase } from '@/integrations/supabase/client';
import { ParsedResume } from '@/types/resume';

export interface ChromeExtensionData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  resumeUrl: string;
  resumeText: string;
}

export class ChromeExtensionService {
  async getUserResumeData(userId: string): Promise<ChromeExtensionData | null> {
    try {
      // Get user profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Get resume file data
      const { data: resumeFile } = await supabase
        .from('user_resume_files')
        .select('*')
        .eq('user_id', userId)
        .eq('is_current', true)
        .single();

      // Get work experiences
      const { data: workExperiences } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      // Get education
      const { data: education } = await supabase
        .from('education')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

      // Get skills
      const { data: skills } = await supabase
        .from('user_skills')
        .select('skill')
        .eq('user_id', userId);

      if (!profile && !resumeFile) {
        return null;
      }

      // Parse the resume data if it exists
      let parsedResumeData: ParsedResume | null = null;
      if (resumeFile?.parsed_data) {
        try {
          // Handle the Json type from Supabase
          parsedResumeData = typeof resumeFile.parsed_data === 'string' 
            ? JSON.parse(resumeFile.parsed_data) 
            : resumeFile.parsed_data as ParsedResume;
        } catch (error) {
          console.error('Error parsing resume data:', error);
        }
      }

      // Format data for Chrome extension
      const chromeData: ChromeExtensionData = {
        personalInfo: {
          name: profile?.name || '',
          email: '', // This comes from auth, not stored in profile
          phone: profile?.phone || '',
          location: profile?.location || ''
        },
        workExperience: (workExperiences || []).map(exp => ({
          company: exp.company,
          role: exp.role,
          startDate: exp.start_date || '',
          endDate: exp.end_date || '',
          description: Array.isArray(exp.description) 
            ? exp.description.join('\n') 
            : exp.description || ''
        })),
        education: (education || []).map(edu => ({
          school: edu.school,
          degree: edu.degree || '',
          fieldOfStudy: edu.field_of_study || '',
          startDate: edu.start_date || '',
          endDate: edu.end_date || ''
        })),
        skills: (skills || []).map(s => s.skill),
        resumeUrl: resumeFile?.file_name || '', // Use file_name instead of file_url
        resumeText: parsedResumeData?.personalInfo?.name ? 
          this.formatResumeText(parsedResumeData) : 
          resumeFile?.file_content || ''
      };

      return chromeData;

    } catch (error) {
      console.error('Error getting Chrome extension data:', error);
      return null;
    }
  }

  async getQuickFillData(userId: string) {
    const data = await this.getUserResumeData(userId);
    if (!data) return null;

    return {
      // Common form fields for job applications
      firstName: data.personalInfo.name.split(' ')[0] || '',
      lastName: data.personalInfo.name.split(' ').slice(1).join(' ') || '',
      fullName: data.personalInfo.name,
      email: data.personalInfo.email,
      phone: data.personalInfo.phone,
      location: data.personalInfo.location,
      
      // Latest work experience
      currentCompany: data.workExperience[0]?.company || '',
      currentRole: data.workExperience[0]?.role || '',
      
      // Latest education
      university: data.education[0]?.school || '',
      degree: data.education[0]?.degree || '',
      major: data.education[0]?.fieldOfStudy || '',
      
      // Skills as comma-separated string
      skills: data.skills.join(', '),
      
      // Resume file URL for upload
      resumeUrl: data.resumeUrl
    };
  }

  private formatResumeText(parsedData: ParsedResume): string {
    const sections: string[] = [];

    // Personal Info
    if (parsedData.personalInfo?.name) {
      sections.push(`Name: ${parsedData.personalInfo.name}`);
    }
    if (parsedData.personalInfo?.email) {
      sections.push(`Email: ${parsedData.personalInfo.email}`);
    }
    if (parsedData.personalInfo?.phone) {
      sections.push(`Phone: ${parsedData.personalInfo.phone}`);
    }

    // Work Experience
    if (parsedData.workExperiences?.length) {
      sections.push('\nWORK EXPERIENCE:');
      parsedData.workExperiences.forEach(exp => {
        sections.push(`${exp.role} at ${exp.company} (${exp.startDate} - ${exp.endDate || 'Present'})`);
        if (exp.description) {
          const desc = Array.isArray(exp.description) ? exp.description.join('\n') : exp.description;
          sections.push(desc);
        }
      });
    }

    // Education
    if (parsedData.education?.length) {
      sections.push('\nEDUCATION:');
      parsedData.education.forEach(edu => {
        sections.push(`${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`);
      });
    }

    // Skills
    if (parsedData.skills?.length) {
      sections.push('\nSKILLS:');
      sections.push(parsedData.skills.join(', '));
    }

    return sections.join('\n');
  }
}

export const chromeExtensionService = new ChromeExtensionService();
