
import { ErrorHandler } from './errorHandling';

export interface LinkedInProfile {
  id: string;
  firstName: string;
  lastName: string;
  headline: string;
  summary: string;
  positions: any[];
  educations: any[];
  skills: any[];
  profilePicture?: string;
}

export interface ATSOptimization {
  score: number;
  suggestions: string[];
  keywords: string[];
  formatIssues: string[];
}

export interface ResumeConversion {
  format: 'pdf' | 'docx' | 'txt' | 'html';
  content: string | Blob;
  fileName: string;
}

export class IntegrationServicesManager {
  // LinkedIn profile import (mock implementation)
  static async importLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
    try {
      // In real implementation, use LinkedIn API
      console.log('LinkedIn import would use API with token:', accessToken);
      
      // Mock response
      const mockProfile: LinkedInProfile = {
        id: 'linkedin_123',
        firstName: 'John',
        lastName: 'Doe',
        headline: 'Software Engineer at Tech Company',
        summary: 'Experienced software engineer with 5+ years...',
        positions: [],
        educations: [],
        skills: []
      };

      return mockProfile;
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'LinkedIn Import' }
      );
      return null;
    }
  }

  // Convert LinkedIn data to resume format
  static convertLinkedInToResume(linkedInProfile: LinkedInProfile): any {
    return {
      personalInfo: {
        name: `${linkedInProfile.firstName} ${linkedInProfile.lastName}`,
        email: '', // Would need to be provided separately
        phone: '', // Would need to be provided separately
        location: '',
        summary: linkedInProfile.summary
      },
      workExperiences: linkedInProfile.positions.map(pos => ({
        company: pos.company?.name || '',
        role: pos.title || '',
        location: pos.location || '',
        start_date: pos.startDate || '',
        end_date: pos.endDate || '',
        description: pos.summary ? [pos.summary] : []
      })),
      education: linkedInProfile.educations.map(edu => ({
        school: edu.schoolName || '',
        degree: edu.degree || '',
        field_of_study: edu.fieldOfStudy || '',
        start_date: edu.startDate || '',
        end_date: edu.endDate || ''
      })),
      skills: linkedInProfile.skills.map(skill => ({
        skill: skill.name || skill,
        category: 'general'
      }))
    };
  }

  // ATS optimization analysis
  static analyzeATSCompatibility(resumeData: any): ATSOptimization {
    const suggestions: string[] = [];
    const keywords: string[] = [];
    const formatIssues: string[] = [];
    let score = 100;

    // Check for common ATS issues
    if (!resumeData.personalInfo?.name) {
      suggestions.push('Add your full name at the top of the resume');
      score -= 10;
    }

    if (!resumeData.personalInfo?.email) {
      suggestions.push('Include a professional email address');
      score -= 10;
    }

    if (!resumeData.personalInfo?.phone) {
      suggestions.push('Add your phone number');
      score -= 5;
    }

    if (!resumeData.workExperiences || resumeData.workExperiences.length === 0) {
      suggestions.push('Add work experience section');
      score -= 20;
    }

    if (!resumeData.skills || resumeData.skills.length === 0) {
      suggestions.push('Add a skills section with relevant keywords');
      score -= 15;
    }

    // Extract keywords from job descriptions
    if (resumeData.workExperiences) {
      resumeData.workExperiences.forEach((exp: any) => {
        if (exp.description && Array.isArray(exp.description)) {
          exp.description.forEach((desc: string) => {
            // Simple keyword extraction
            const words = desc.toLowerCase().match(/\b\w{4,}\b/g) || [];
            keywords.push(...words);
          });
        }
      });
    }

    return {
      score: Math.max(score, 0),
      suggestions,
      keywords: [...new Set(keywords)].slice(0, 20),
      formatIssues
    };
  }

  // Resume format conversion
  static async convertResumeFormat(resumeData: any, targetFormat: 'pdf' | 'docx' | 'txt' | 'html'): Promise<ResumeConversion | null> {
    try {
      let content: string | Blob;
      let fileName: string;

      switch (targetFormat) {
        case 'txt':
          content = this.convertToText(resumeData);
          fileName = 'resume.txt';
          break;
        
        case 'html':
          content = this.convertToHTML(resumeData);
          fileName = 'resume.html';
          break;
        
        case 'pdf':
        case 'docx':
          // These would require specialized libraries
          throw new Error(`${targetFormat} conversion not implemented yet`);
        
        default:
          throw new Error(`Unsupported format: ${targetFormat}`);
      }

      return {
        format: targetFormat,
        content,
        fileName
      };
    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Resume Conversion' }
      );
      return null;
    }
  }

  // Convert resume data to plain text
  private static convertToText(resumeData: any): string {
    let text = '';

    // Personal Info
    if (resumeData.personalInfo) {
      const info = resumeData.personalInfo;
      text += `${info.name || ''}\n`;
      if (info.email) text += `Email: ${info.email}\n`;
      if (info.phone) text += `Phone: ${info.phone}\n`;
      if (info.location) text += `Location: ${info.location}\n`;
      text += '\n';
    }

    // Summary
    if (resumeData.personalInfo?.summary) {
      text += `SUMMARY\n${resumeData.personalInfo.summary}\n\n`;
    }

    // Work Experience
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
      text += 'WORK EXPERIENCE\n';
      resumeData.workExperiences.forEach((exp: any) => {
        text += `${exp.role || ''} at ${exp.company || ''}\n`;
        if (exp.start_date || exp.end_date) {
          text += `${exp.start_date || ''} - ${exp.end_date || 'Present'}\n`;
        }
        if (exp.location) text += `${exp.location}\n`;
        if (exp.description && Array.isArray(exp.description)) {
          exp.description.forEach((desc: string) => {
            text += `• ${desc}\n`;
          });
        }
        text += '\n';
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      text += 'EDUCATION\n';
      resumeData.education.forEach((edu: any) => {
        text += `${edu.degree || ''} in ${edu.field_of_study || ''}\n`;
        text += `${edu.school || ''}\n`;
        if (edu.start_date || edu.end_date) {
          text += `${edu.start_date || ''} - ${edu.end_date || ''}\n`;
        }
        text += '\n';
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      text += 'SKILLS\n';
      const skillList = resumeData.skills.map((s: any) => s.skill || s).join(', ');
      text += `${skillList}\n\n`;
    }

    return text;
  }

  // Convert resume data to HTML
  private static convertToHTML(resumeData: any): string {
    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; margin-bottom: 5px; }
        h2 { color: #666; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
        .contact-info { margin-bottom: 20px; }
        .experience-item, .education-item { margin-bottom: 15px; }
        .job-title { font-weight: bold; }
        .company { font-style: italic; }
        .dates { color: #666; }
        ul { margin: 5px 0; }
    </style>
</head>
<body>
`;

    // Personal Info
    if (resumeData.personalInfo) {
      const info = resumeData.personalInfo;
      html += `<h1>${info.name || ''}</h1>\n`;
      html += '<div class="contact-info">\n';
      if (info.email) html += `<p>Email: ${info.email}</p>\n`;
      if (info.phone) html += `<p>Phone: ${info.phone}</p>\n`;
      if (info.location) html += `<p>Location: ${info.location}</p>\n`;
      html += '</div>\n';

      if (info.summary) {
        html += `<h2>Summary</h2>\n<p>${info.summary}</p>\n`;
      }
    }

    // Work Experience
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
      html += '<h2>Work Experience</h2>\n';
      resumeData.workExperiences.forEach((exp: any) => {
        html += '<div class="experience-item">\n';
        html += `<div class="job-title">${exp.role || ''}</div>\n`;
        html += `<div class="company">${exp.company || ''}</div>\n`;
        if (exp.start_date || exp.end_date) {
          html += `<div class="dates">${exp.start_date || ''} - ${exp.end_date || 'Present'}</div>\n`;
        }
        if (exp.location) html += `<div>${exp.location}</div>\n`;
        if (exp.description && Array.isArray(exp.description)) {
          html += '<ul>\n';
          exp.description.forEach((desc: string) => {
            html += `<li>${desc}</li>\n`;
          });
          html += '</ul>\n';
        }
        html += '</div>\n';
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      html += '<h2>Education</h2>\n';
      resumeData.education.forEach((edu: any) => {
        html += '<div class="education-item">\n';
        html += `<div class="job-title">${edu.degree || ''} in ${edu.field_of_study || ''}</div>\n`;
        html += `<div class="company">${edu.school || ''}</div>\n`;
        if (edu.start_date || edu.end_date) {
          html += `<div class="dates">${edu.start_date || ''} - ${edu.end_date || ''}</div>\n`;
        }
        html += '</div>\n';
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      html += '<h2>Skills</h2>\n';
      const skillList = resumeData.skills.map((s: any) => s.skill || s).join(', ');
      html += `<p>${skillList}</p>\n`;
    }

    html += '</body>\n</html>';
    return html;
  }
}
