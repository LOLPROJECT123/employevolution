/**
 * ResumeSkillsExtractor - Extracts skills and qualifications from resume
 */
import { ParsedResume } from "@/types/resume";

export interface ExtractedSkill {
  skill: string;
  category?: string;
  subcategory?: string;
  level?: string;
  source?: string | string[];
  confidence: number;
  experienceCompany?: string;
  experienceTitle?: string;
  projectName?: string;
}

export class ResumeSkillsExtractor {
  private technicalTerms: string[];
  private softSkills: string[];

  constructor() {
    this.technicalTerms = this.loadTechnicalTerms();
    this.softSkills = this.loadSoftSkills();
  }

  /**
   * Extract skills from resume text and structured data
   */
  public extractSkillsFromResume(resumeData: ParsedResume, resumeText?: string): ExtractedSkill[] {
    // Extract skills from explicitly listed skills sections
    const explicitSkills = this.extractExplicitSkills(resumeData.skills || []);
    
    // Extract skills from work experience descriptions
    const experienceSkills = this.extractSkillsFromExperience(resumeData.workExperiences || []);
    
    // Extract skills from projects
    const projectSkills = this.extractSkillsFromProjects(resumeData.projects || []);
    
    // Extract from full text using NLP techniques if available
    const textExtractedSkills = resumeText ? this.extractSkillsFromText(resumeText) : [];
    
    // Combine all skills, removing duplicates
    return this.combineAndNormalizeSkills([
      ...explicitSkills,
      ...experienceSkills,
      ...projectSkills,
      ...textExtractedSkills
    ]);
  }

  /**
   * Extract skills from explicitly listed skills
   */
  private extractExplicitSkills(skillsData: string[]): ExtractedSkill[] {
    if (!skillsData || !Array.isArray(skillsData)) {
      return [];
    }
    
    const skills: ExtractedSkill[] = [];
    
    // Handle string arrays of skills
    skillsData.forEach(skill => {
      if (typeof skill === 'string') {
        const cleanSkill = skill.trim();
        if (cleanSkill) {
          skills.push({
            skill: cleanSkill,
            source: 'explicit',
            category: this.categorizeSkill(cleanSkill),
            confidence: 0.9 // High confidence for explicitly listed skills
          });
        }
      }
    });
    
    return skills;
  }

  /**
   * Extract skills from work experience descriptions
   */
  private extractSkillsFromExperience(experienceData: Array<{
    role: string;
    company: string;
    description: string[];
  }>): ExtractedSkill[] {
    if (!experienceData || !Array.isArray(experienceData)) {
      return [];
    }
    
    const skills: ExtractedSkill[] = [];
    
    experienceData.forEach(exp => {
      // Combine job description
      let text = '';
      
      if (exp.description && Array.isArray(exp.description)) {
        text += exp.description.join(' ');
      }
      
      // Extract skills from this text
      const extractedSkills = this.extractSkillsFromText(text);
      
      // Add experience source info
      extractedSkills.forEach(skill => {
        skill.source = 'experience';
        skill.experienceCompany = exp.company;
        skill.experienceTitle = exp.role;
        // Lower confidence as these are inferred from experience
        skill.confidence = Math.min(skill.confidence || 0.7, 0.7);
      });
      
      skills.push(...extractedSkills);
    });
    
    return skills;
  }

  /**
   * Extract skills from projects
   */
  private extractSkillsFromProjects(projectsData: Array<{
    name: string;
    description: string[];
  }>): ExtractedSkill[] {
    if (!projectsData || !Array.isArray(projectsData)) {
      return [];
    }
    
    const skills: ExtractedSkill[] = [];
    
    projectsData.forEach(project => {
      // Combine project description
      let text = '';
      
      if (project.description && Array.isArray(project.description)) {
        text += project.description.join(' ');
      }
      
      // Extract skills from this text
      const extractedSkills = this.extractSkillsFromText(text);
      
      // Add project source info
      extractedSkills.forEach(skill => {
        skill.source = 'project';
        skill.projectName = project.name;
        // Medium confidence for project skills
        skill.confidence = Math.min(skill.confidence || 0.8, 0.8);
      });
      
      skills.push(...extractedSkills);
    });
    
    return skills;
  }

  /**
   * Extract skills from text using pattern matching
   */
  private extractSkillsFromText(text: string): ExtractedSkill[] {
    if (!text) return [];
    
    const skills: ExtractedSkill[] = [];
    const normalizedText = text.toLowerCase();
    
    // Check for known technical terms
    for (const term of this.technicalTerms) {
      const regex = new RegExp(`\\b${this.escapeRegExp(term.toLowerCase())}\\b`, 'i');
      if (regex.test(normalizedText)) {
        skills.push({
          skill: term,
          category: 'technical',
          subcategory: this.getTechnicalCategory(term),
          confidence: 0.8 // High confidence for known technical terms
        });
      }
    }
    
    // Check for soft skills
    for (const term of this.softSkills) {
      const regex = new RegExp(`\\b${this.escapeRegExp(term.toLowerCase())}\\b`, 'i');
      if (regex.test(normalizedText)) {
        skills.push({
          skill: term,
          category: 'soft',
          confidence: 0.7 // Medium confidence for soft skills
        });
      }
    }
    
    // Look for technical skill patterns
    const skillPatterns = [
      /experienced (?:with|in) ([\w\s,\/\-\.]+)/gi,
      /knowledge of ([\w\s,\/\-\.]+)/gi,
      /familiar with ([\w\s,\/\-\.]+)/gi,
      /proficiency in ([\w\s,\/\-\.]+)/gi,
      /skilled in ([\w\s,\/\-\.]+)/gi,
      /expertise in ([\w\s,\/\-\.]+)/gi
    ];
    
    for (const pattern of skillPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          // Split by commas to get individual skills
          const extractedSkills = match[1].split(/,|;|\band\b/).map(s => s.trim());
          for (const skill of extractedSkills) {
            if (skill.length > 2 && !skills.some(s => s.skill.toLowerCase() === skill.toLowerCase())) {
              skills.push({
                skill: skill,
                category: this.categorizeSkill(skill),
                confidence: 0.6 // Medium confidence for pattern-extracted skills
              });
            }
          }
        }
      }
    }
    
    return skills;
  }

  /**
   * Combine skills from multiple sources and normalize
   */
  private combineAndNormalizeSkills(allSkills: ExtractedSkill[]): ExtractedSkill[] {
    const skillMap = new Map<string, ExtractedSkill>();
    
    for (const skill of allSkills) {
      const key = skill.skill.toLowerCase();
      
      if (skillMap.has(key)) {
        const existing = skillMap.get(key)!;
        
        // Keep the version with highest confidence
        if (skill.confidence > existing.confidence) {
          existing.level = skill.level || existing.level;
          existing.category = skill.category || existing.category;
          existing.confidence = skill.confidence;
        }
        
        // Add source if it's different
        if (skill.source && existing.source !== skill.source) {
          existing.source = Array.isArray(existing.source) 
            ? [...existing.source, skill.source as string] 
            : [existing.source as string, skill.source as string];
        }
        
      } else {
        // Normalize the skill name to proper case if it's a known term
        const normalizedSkill = { ...skill };
        
        // Get proper case for known terms
        const knownTerm = this.getProperCaseForKnownTerm(skill.skill);
        if (knownTerm) {
          normalizedSkill.skill = knownTerm;
        }
        
        skillMap.set(key, normalizedSkill);
      }
    }
    
    return Array.from(skillMap.values());
  }

  /**
   * Categorize a skill as technical or soft
   */
  private categorizeSkill(skill: string): string {
    const lowerSkill = skill.toLowerCase();
    
    // Check if it's a known technical term
    if (this.technicalTerms.some(term => term.toLowerCase() === lowerSkill)) {
      return 'technical';
    }
    
    // Check if it's a known soft skill
    if (this.softSkills.some(term => term.toLowerCase() === lowerSkill)) {
      return 'soft';
    }
    
    // Otherwise, make a best guess based on common patterns
    const technicalPatterns = ['programming', 'software', 'framework', 'language', 'database', 
      'cloud', 'development', 'code', 'algorithm', 'architecture', 'system', 'network'];
      
    for (const pattern of technicalPatterns) {
      if (lowerSkill.includes(pattern)) {
        return 'technical';
      }
    }
    
    return 'unknown';
  }

  /**
   * Get proper case for known terms
   */
  private getProperCaseForKnownTerm(skill: string): string | null {
    const lowerSkill = skill.toLowerCase();
    
    // Check technical terms
    for (const term of this.technicalTerms) {
      if (term.toLowerCase() === lowerSkill) {
        return term;
      }
    }
    
    // Check soft skills
    for (const term of this.softSkills) {
      if (term.toLowerCase() === lowerSkill) {
        return term;
      }
    }
    
    return null;
  }

  /**
   * Get technical category
   */
  private getTechnicalCategory(skill: string): string {
    const categories: Record<string, string[]> = {
      'languages': ['javascript', 'python', 'java', 'c#', 'c++', 'typescript', 'php', 'ruby', 'swift', 'kotlin', 'go'],
      'frontend': ['react', 'angular', 'vue', 'html', 'css', 'sass', 'less', 'redux', 'jquery', 'webpack'],
      'backend': ['node.js', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'aspnet'],
      'database': ['sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'dynamodb', 'redis', 'elasticsearch'],
      'devops': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'github actions'],
      'mobile': ['react native', 'flutter', 'android', 'ios', 'swift', 'kotlin'],
      'testing': ['jest', 'mocha', 'cypress', 'selenium', 'pytest', 'junit'],
      'tools': ['git', 'github', 'jira', 'confluence', 'slack', 'figma', 'sketch']
    };
    
    const lowerSkill = skill.toLowerCase();
    for (const [category, skills] of Object.entries(categories)) {
      if (skills.includes(lowerSkill)) {
        return category;
      }
    }
    
    return 'technical';
  }

  /**
   * Load list of technical terms
   */
  private loadTechnicalTerms(): string[] {
    return [
      'JavaScript', 'Python', 'Java', 'C#', 'C++', 'Ruby', 'Go', 'PHP', 'Swift', 'Kotlin',
      'TypeScript', 'HTML', 'CSS', 'SQL', 'React', 'Angular', 'Vue', 'Node.js', 'Express',
      'Django', 'Flask', 'Spring', 'Rails', 'ASP.NET', 'Laravel', 'Redux', 'GraphQL',
      'REST API', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'DynamoDB', 'Firebase',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'GitLab CI',
      'Terraform', 'Ansible', 'Git', 'Jira', 'Agile', 'Scrum', 'Kanban', 'CI/CD',
      'Microservices', 'Linux', 'Unix', 'Windows', 'macOS', 'Android', 'iOS',
      'React Native', 'Flutter', 'Electron', 'TensorFlow', 'PyTorch', 'Machine Learning', 
      'AI', 'Data Science', 'Blockchain', 'IoT', 'Cybersecurity', 'Cloud Computing'
    ];
  }

  /**
   * Load list of soft skills
   */
  private loadSoftSkills(): string[] {
    return [
      'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
      'Time Management', 'Organization', 'Adaptability', 'Flexibility', 'Creativity',
      'Attention to Detail', 'Interpersonal Skills', 'Collaboration', 'Conflict Resolution',
      'Decision Making', 'Analytical Thinking', 'Emotional Intelligence', 'Customer Service',
      'Presentation Skills', 'Negotiation', 'Persuasion', 'Self-Motivation', 'Initiative',
      'Empathy', 'Patience', 'Resilience', 'Work Ethic', 'Accountability',
      'Project Management', 'Mentoring', 'Strategic Thinking', 'Innovation'
    ];
  }

  /**
   * Escape special characters in regex
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
