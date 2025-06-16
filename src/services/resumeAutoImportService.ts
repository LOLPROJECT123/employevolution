import { supabase } from '@/integrations/supabase/client';
import { parseResumeEnhanced } from '@/utils/enhancedResumeParser';

interface EnhancedParsingOptions {
  extractSkills: boolean;
  extractExperience: boolean;
  extractEducation: boolean;
  extractProjects: boolean;
  detectKeywords: boolean;
  enhancedParsing: boolean;
}

interface ImportedResumeData {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  workExperience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    location?: string;
    description: string[];
  }>;
  education: Array<{
    school: string;
    degree?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills: Array<{
    skill: string;
    category: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
  }>;
}

class ResumeAutoImportService {
  async importFromFile(file: File): Promise<ImportedResumeData> {
    console.log('Starting resume import from file:', file.name);
    
    try {
      const parsedData = await parseResumeEnhanced(file, {
        showToast: false,
        useOCR: true
      });
      
      const importedData: ImportedResumeData = {
        personalInfo: {
          name: parsedData.personalInfo?.name || '',
          email: parsedData.personalInfo?.email || '',
          phone: parsedData.personalInfo?.phone || '',
          location: parsedData.personalInfo?.location || '',
          linkedin: parsedData.socialLinks?.linkedin || '',
          github: parsedData.socialLinks?.github || '',
          portfolio: parsedData.socialLinks?.portfolio || ''
        },
        workExperience: parsedData.workExperiences?.map(exp => ({
          company: exp.company || '',
          role: exp.role || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || 'Present',
          location: exp.location || '',
          description: Array.isArray(exp.description) ? exp.description : [exp.description || '']
        })) || [],
        education: parsedData.education?.map(edu => ({
          school: edu.school || '',
          degree: edu.degree || '',
          fieldOfStudy: edu.fieldOfStudy || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          gpa: edu.gpa || ''
        })) || [],
        skills: parsedData.skills?.map(skill => ({
          skill: skill,
          category: 'general'
        })) || [],
        projects: parsedData.projects?.map(project => ({
          name: project.name || '',
          description: project.description || '',
          technologies: project.technologies || [],
          url: project.url || '',
          github: project.github || ''
        })) || []
      };

      console.log('Resume import completed successfully');
      return importedData;
    } catch (error) {
      console.error('Error importing resume:', error);
      throw new Error('Failed to import resume data');
    }
  }

  async saveToProfile(userId: string, importedData: ImportedResumeData): Promise<void> {
    try {
      console.log('Saving imported resume data to profile for user:', userId);

      // Save personal info
      if (importedData.personalInfo) {
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: userId,
            name: importedData.personalInfo.name,
            phone: importedData.personalInfo.phone,
            location: importedData.personalInfo.location,
            linkedin_url: importedData.personalInfo.linkedin,
            github_url: importedData.personalInfo.github,
            portfolio_url: importedData.personalInfo.portfolio,
            updated_at: new Date().toISOString()
          });
      }

      // Save work experience
      if (importedData.workExperience?.length > 0) {
        // First, delete existing work experience
        await supabase
          .from('work_experiences')
          .delete()
          .eq('user_id', userId);

        // Insert new work experience
        const workExperienceData = importedData.workExperience.map(exp => ({
          user_id: userId,
          company: exp.company,
          role: exp.role,
          location: exp.location,
          start_date: exp.startDate,
          end_date: exp.endDate,
          description: exp.description
        }));

        await supabase
          .from('work_experiences')
          .insert(workExperienceData);
      }

      // Save education
      if (importedData.education?.length > 0) {
        // First, delete existing education
        await supabase
          .from('education')
          .delete()
          .eq('user_id', userId);

        // Insert new education
        const educationData = importedData.education.map(edu => ({
          user_id: userId,
          school: edu.school,
          degree: edu.degree,
          field_of_study: edu.fieldOfStudy,
          start_date: edu.startDate,
          end_date: edu.endDate,
          gpa: edu.gpa
        }));

        await supabase
          .from('education')
          .insert(educationData);
      }

      // Save skills
      if (importedData.skills?.length > 0) {
        // First, delete existing skills
        await supabase
          .from('user_skills')
          .delete()
          .eq('user_id', userId);

        // Insert new skills
        const skillsData = importedData.skills.map(skill => ({
          user_id: userId,
          skill: skill.skill,
          category: skill.category
        }));

        await supabase
          .from('user_skills')
          .insert(skillsData);
      }

      console.log('Resume data saved to profile successfully');
    } catch (error) {
      console.error('Error saving imported resume data:', error);
      throw new Error('Failed to save resume data to profile');
    }
  }

  detectFileType(file: File): 'pdf' | 'docx' | 'txt' | 'unsupported' {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return 'pdf';
    } else if (
      fileType.includes('wordprocessingml') || 
      fileType.includes('msword') ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      return 'docx';
    } else if (fileType.includes('text') || fileName.endsWith('.txt')) {
      return 'txt';
    }

    return 'unsupported';
  }

  extractKeywords(text: string): string[] {
    const commonSkills = [
      'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue',
      'node.js', 'express', 'mongodb', 'postgresql', 'mysql', 'redis',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'git', 'github',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
      'agile', 'scrum', 'kanban', 'jira', 'confluence'
    ];

    const textLower = text.toLowerCase();
    const foundSkills = commonSkills.filter(skill => {
      const variations = [skill, skill.replace('.', ''), skill.replace(' ', '')];
      return variations.some(variation => textLower.includes(variation));
    });

    return [...new Set(foundSkills)];
  }

  async processLinkedInProfile(profileData: any): Promise<ImportedResumeData> {
    try {
      const importedData: ImportedResumeData = {
        personalInfo: {
          name: profileData.firstName && profileData.lastName ? 
            `${profileData.firstName} ${profileData.lastName}` : '',
          email: profileData.emailAddress || '',
          location: profileData.location?.name || '',
          linkedin: profileData.publicProfileUrl || ''
        },
        workExperience: profileData.positions?.values?.map((position: any) => ({
          company: position.company?.name || '',
          role: position.title || '',
          startDate: this.formatLinkedInDate(position.startDate),
          endDate: position.isCurrent ? 'Present' : this.formatLinkedInDate(position.endDate),
          location: position.location?.name || '',
          description: position.summary ? [position.summary] : []
        })) || [],
        education: profileData.educations?.values?.map((education: any) => ({
          school: education.schoolName || '',
          degree: education.degree || '',
          fieldOfStudy: education.fieldOfStudy || '',
          startDate: this.formatLinkedInDate(education.startDate),
          endDate: this.formatLinkedInDate(education.endDate)
        })) || [],
        skills: profileData.skills?.values?.map((skill: any) => ({
          skill: skill.skill?.name || '',
          category: 'general'
        })) || [],
        projects: []
      };

      return importedData;
    } catch (error) {
      console.error('Error processing LinkedIn profile:', error);
      throw new Error('Failed to process LinkedIn profile data');
    }
  }

  private formatLinkedInDate(dateObj: any): string {
    if (!dateObj) return '';
    
    const year = dateObj.year || '';
    const month = dateObj.month ? String(dateObj.month).padStart(2, '0') : '01';
    
    return year ? `${year}-${month}` : '';
  }

  async generateResumeInsights(importedData: ImportedResumeData): Promise<{
    completeness: number;
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    let completeness = 0;
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const improvements: string[] = [];

    // Check completeness
    if (importedData.personalInfo.name) completeness += 10;
    if (importedData.personalInfo.email) completeness += 10;
    if (importedData.personalInfo.phone) completeness += 5;
    if (importedData.personalInfo.location) completeness += 5;
    if (importedData.personalInfo.linkedin) completeness += 5;
    if (importedData.workExperience.length > 0) completeness += 25;
    if (importedData.education.length > 0) completeness += 15;
    if (importedData.skills.length > 0) completeness += 15;
    if (importedData.projects.length > 0) completeness += 10;

    // Generate suggestions
    if (!importedData.personalInfo.name) suggestions.push('Add your full name');
    if (!importedData.personalInfo.email) suggestions.push('Add your email address');
    if (!importedData.personalInfo.linkedin) suggestions.push('Add your LinkedIn profile URL');
    if (importedData.workExperience.length === 0) suggestions.push('Add work experience');
    if (importedData.skills.length < 5) suggestions.push('Add more relevant skills');
    if (importedData.projects.length === 0) suggestions.push('Add portfolio projects');

    // Identify strengths
    if (importedData.workExperience.length > 2) strengths.push('Strong work experience');
    if (importedData.skills.length > 10) strengths.push('Diverse skill set');
    if (importedData.education.length > 0) strengths.push('Educational background included');
    if (importedData.projects.length > 0) strengths.push('Portfolio projects showcased');

    // Suggest improvements
    if (importedData.workExperience.some(exp => !exp.description || exp.description.length === 0)) {
      improvements.push('Add descriptions to work experience entries');
    }
    if (importedData.skills.length < 10) {
      improvements.push('Consider adding more technical skills');
    }

    return {
      completeness: Math.min(100, completeness),
      suggestions,
      strengths,
      improvements
    };
  }
}

export const resumeAutoImportService = new ResumeAutoImportService();
