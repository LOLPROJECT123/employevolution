
interface ResumeVersion {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  targetRole?: string;
  targetIndustry?: string;
  usageCount: number;
}

interface CoverLetterTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  targetRole?: string;
  usageCount: number;
}

class ResumeService {
  private resumeKey = 'resume_versions';
  private coverLetterKey = 'cover_letter_templates';

  async saveResumeVersion(
    userId: string,
    name: string,
    content: string,
    targetRole?: string,
    targetIndustry?: string,
    isDefault: boolean = false
  ): Promise<ResumeVersion> {
    const resume: ResumeVersion = {
      id: `resume-${Date.now()}`,
      name,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault,
      targetRole,
      targetIndustry,
      usageCount: 0
    };

    const resumes = this.getResumeVersions(userId);
    
    // If this is set as default, unset others
    if (isDefault) {
      resumes.forEach(r => r.isDefault = false);
    }
    
    resumes.push(resume);
    localStorage.setItem(`${this.resumeKey}_${userId}`, JSON.stringify(resumes));

    return resume;
  }

  getResumeVersions(userId: string): ResumeVersion[] {
    try {
      const stored = localStorage.getItem(`${this.resumeKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getDefaultResume(userId: string): ResumeVersion | null {
    const resumes = this.getResumeVersions(userId);
    return resumes.find(r => r.isDefault) || resumes[0] || null;
  }

  async updateResumeUsage(userId: string, resumeId: string): Promise<void> {
    const resumes = this.getResumeVersions(userId);
    const index = resumes.findIndex(r => r.id === resumeId);
    
    if (index !== -1) {
      resumes[index].usageCount += 1;
      resumes[index].updatedAt = new Date().toISOString();
      localStorage.setItem(`${this.resumeKey}_${userId}`, JSON.stringify(resumes));
    }
  }

  async saveCoverLetterTemplate(
    userId: string,
    name: string,
    content: string,
    targetRole?: string,
    isDefault: boolean = false
  ): Promise<CoverLetterTemplate> {
    const template: CoverLetterTemplate = {
      id: `cover-${Date.now()}`,
      name,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDefault,
      targetRole,
      usageCount: 0
    };

    const templates = this.getCoverLetterTemplates(userId);
    
    if (isDefault) {
      templates.forEach(t => t.isDefault = false);
    }
    
    templates.push(template);
    localStorage.setItem(`${this.coverLetterKey}_${userId}`, JSON.stringify(templates));

    return template;
  }

  getCoverLetterTemplates(userId: string): CoverLetterTemplate[] {
    try {
      const stored = localStorage.getItem(`${this.coverLetterKey}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getDefaultCoverLetter(userId: string): CoverLetterTemplate | null {
    const templates = this.getCoverLetterTemplates(userId);
    return templates.find(t => t.isDefault) || templates[0] || null;
  }

  generateCustomizedCoverLetter(template: CoverLetterTemplate, job: any, user: any): string {
    let customized = template.content;
    
    // Replace placeholders with actual data
    customized = customized.replace(/\{company\}/g, job.company || '');
    customized = customized.replace(/\{position\}/g, job.title || '');
    customized = customized.replace(/\{name\}/g, user.name || '');
    customized = customized.replace(/\{location\}/g, job.location || '');
    
    return customized;
  }
}

export const resumeService = new ResumeService();
