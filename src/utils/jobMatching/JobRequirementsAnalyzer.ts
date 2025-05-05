
/**
 * JobRequirementsAnalyzer - Extracts and processes job requirements from job descriptions
 */
import { Job } from "@/types/job";

export interface SkillRequirement {
  skill: string;
  category: string;
  required: boolean;
  importance: number;
}

export interface EducationRequirement {
  degree: string;
  level: string;
  field: string;
  required: boolean;
  preferred: boolean;
}

export interface ExperienceRequirement {
  years?: number;
  level?: string;
  area?: string;
  required: boolean;
}

export interface OtherRequirement {
  requirement: string;
  context: string;
  required: boolean;
}

export interface JobRequirements {
  technical: SkillRequirement[];
  soft: SkillRequirement[];
  education: EducationRequirement[];
  experience: ExperienceRequirement[];
  other: OtherRequirement[];
}

export class JobRequirementsAnalyzer {
  private technicalTerms: string[];
  private softSkills: string[];
  private degreeTerms: { term: string; level: string }[];
  private experienceLevelTerms: { term: string; years: number }[];

  constructor() {
    this.technicalTerms = this.loadTechnicalTerms();
    this.softSkills = this.loadSoftSkills();
    this.degreeTerms = this.loadDegreeTerms();
    this.experienceLevelTerms = this.loadExperienceLevelTerms();
  }

  /**
   * Analyze job description to extract requirements
   */
  public analyzeJobDescription(jobDescription: string): JobRequirements {
    if (!jobDescription) {
      return {
        technical: [],
        soft: [],
        education: [],
        experience: [],
        other: []
      };
    }

    const cleanDescription = this.cleanText(jobDescription);

    return {
      technical: this.extractTechnicalSkills(cleanDescription),
      soft: this.extractSoftSkills(cleanDescription),
      education: this.extractEducationRequirements(cleanDescription),
      experience: this.extractExperienceRequirements(cleanDescription),
      other: this.extractOtherRequirements(cleanDescription)
    };
  }

  /**
   * Analyze a job object to extract all requirements
   */
  public analyzeJob(job: Job): JobRequirements {
    // Combine description and requirements for more thorough analysis
    let fullText = job.description || '';
    
    if (job.requirements && job.requirements.length > 0) {
      fullText += ' ' + job.requirements.join(' ');
    }

    // Also use skills array if available
    const requirements = this.analyzeJobDescription(fullText);
    
    // Add skills from the job's skills array if they're not already included
    if (job.skills && job.skills.length > 0) {
      const existingTechnicalSkills = new Set(
        requirements.technical.map(skill => skill.skill.toLowerCase())
      );

      job.skills.forEach(skill => {
        if (!existingTechnicalSkills.has(skill.toLowerCase())) {
          requirements.technical.push({
            skill,
            category: this.getTechnicalCategory(skill),
            required: true, // Assume listed skills are required
            importance: 80 // High importance for explicitly listed skills
          });
        }
      });
    }

    return requirements;
  }

  /**
   * Clean and normalize text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-\/\.\,\:]/g, ' ')
      .toLowerCase();
  }

  /**
   * Extract technical skills from job description
   */
  private extractTechnicalSkills(text: string): SkillRequirement[] {
    const skills: SkillRequirement[] = [];

    // Check for each technical term
    for (const term of this.technicalTerms) {
      // Match whole words only with word boundaries
      const regex = new RegExp(`\\b${this.escapeRegExp(term.toLowerCase())}\\b`, 'i');
      if (regex.test(text)) {
        skills.push({
          skill: term,
          category: this.getTechnicalCategory(term),
          required: this.isRequiredSkill(text, term),
          importance: this.calculateImportance(text, term)
        });
      }
    }

    // Look for skills in common patterns
    const skillPatterns = [
      /experience (?:with|in) ([\w\s,\/\-\.]+)/gi,
      /knowledge of ([\w\s,\/\-\.]+)/gi,
      /familiar with ([\w\s,\/\-\.]+)/gi,
      /proficient in ([\w\s,\/\-\.]+)/gi,
      /skilled in ([\w\s,\/\-\.]+)/gi
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
                category: 'technical',
                required: this.isRequiredSkill(text, skill),
                importance: this.calculateImportance(text, skill)
              });
            }
          }
        }
      }
    }

    return skills;
  }

  /**
   * Extract soft skills from job description
   */
  private extractSoftSkills(text: string): SkillRequirement[] {
    const skills: SkillRequirement[] = [];

    // Check for each soft skill term
    for (const term of this.softSkills) {
      const regex = new RegExp(`\\b${this.escapeRegExp(term.toLowerCase())}\\b`, 'i');
      if (regex.test(text)) {
        skills.push({
          skill: term,
          category: 'soft',
          required: this.isRequiredSkill(text, term),
          importance: this.calculateImportance(text, term)
        });
      }
    }

    // Look for soft skills in common patterns
    const skillPatterns = [
      /strong ([\w\s]+) skills/gi,
      /excellent ([\w\s]+) skills/gi,
      /demonstrated ([\w\s]+) abilities/gi
    ];

    for (const pattern of skillPatterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const skill = match[1].trim();
          if (skill.length > 2 && !skills.some(s => s.skill.toLowerCase() === skill.toLowerCase())) {
            skills.push({
              skill: skill,
              category: 'soft',
              required: this.isRequiredSkill(text, skill),
              importance: this.calculateImportance(text, skill)
            });
          }
        }
      }
    }

    return skills;
  }

  /**
   * Extract education requirements
   */
  private extractEducationRequirements(text: string): EducationRequirement[] {
    const educationReqs: EducationRequirement[] = [];

    // Look for degree requirements
    for (const degree of this.degreeTerms) {
      const regex = new RegExp(`\\b${this.escapeRegExp(degree.term.toLowerCase())}\\b`, 'i');
      if (regex.test(text)) {
        let field = 'Not specified';

        // Try to extract the field of study
        const fieldPatterns = [
          new RegExp(`${this.escapeRegExp(degree.term)}\\s+in\\s+([\\w\\s,]+)`, 'i'),
          new RegExp(`${this.escapeRegExp(degree.term)}\\s+of\\s+([\\w\\s,]+)`, 'i')
        ];

        for (const pattern of fieldPatterns) {
          const match = text.match(pattern);
          if (match && match[1]) {
            field = match[1].trim();
            break;
          }
        }

        educationReqs.push({
          degree: degree.term,
          level: degree.level,
          field: field,
          required: this.isRequiredEducation(text, degree.term),
          preferred: this.isPreferredEducation(text, degree.term)
        });
      }
    }

    // If no specific degree was found, check general education patterns
    if (educationReqs.length === 0) {
      const educationPatterns = [
        /degree (?:in|from) ([^\.]+)/i,
        /education (?:in|with focus on) ([^\.]+)/i
      ];

      for (const pattern of educationPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          educationReqs.push({
            degree: 'Degree',
            level: 'Bachelor',
            field: match[1].trim(),
            required: true,
            preferred: false
          });
        }
      }
    }

    return educationReqs;
  }

  /**
   * Extract experience requirements
   */
  private extractExperienceRequirements(text: string): ExperienceRequirement[] {
    const experienceReqs: ExperienceRequirement[] = [];

    // Look for years of experience patterns
    const yearsPatterns = [
      /(\d+)(?:\+|\s*\+)?\s*(?:years|yrs)(?:\s+of)?\s+experience/i,
      /experience\s*(?:of|for)?\s*(\d+)(?:\+|\s*\+)?\s*(?:years|yrs)/i,
      /(\d+)(?:\+|\s*\+)?\s*(?:years|yrs)\s+(?:of\s+)?(?:relevant|professional|industry|work)\s+experience/i
    ];

    for (const pattern of yearsPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const years = parseInt(match[1], 10);

        // Try to determine what the experience is in
        let experienceIn = 'general';
        const contextPatterns = [
          new RegExp(`${match[0]}\\s+(?:in|with)\\s+([\\w\\s,]+)`, 'i'),
          new RegExp(`experience\\s+(?:in|with)\\s+([\\w\\s,]+)\\s+for\\s+${years}`, 'i')
        ];

        for (const contextPattern of contextPatterns) {
          const contextMatch = text.match(contextPattern);
          if (contextMatch && contextMatch[1]) {
            experienceIn = contextMatch[1].trim();
            break;
          }
        }

        experienceReqs.push({
          years: years,
          area: experienceIn,
          required: !text.slice(Math.max(0, match.index! - 30), match.index).includes('prefer')
        });
      }
    }

    // Look for experience level terms
    for (const level of this.experienceLevelTerms) {
      if (text.includes(level.term.toLowerCase())) {
        experienceReqs.push({
          level: level.term,
          years: level.years,
          required: !text.includes(`preferred ${level.term}`) && !text.includes(`prefer ${level.term}`)
        });
      }
    }

    return experienceReqs;
  }

  /**
   * Extract other requirements
   */
  private extractOtherRequirements(text: string): OtherRequirement[] {
    const otherReqs: OtherRequirement[] = [];

    // Common other requirements patterns
    const patterns = [
      /must be able to ([^\.]+)/gi,
      /ability to ([^\.]+)/gi,
      /willing to ([^\.]+)/gi,
      /required to ([^\.]+)/gi
    ];

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          otherReqs.push({
            requirement: match[1].trim(),
            context: match[0],
            required: true
          });
        }
      }
    }

    return otherReqs;
  }

  /**
   * Determine if a skill is required based on context
   */
  private isRequiredSkill(text: string, skill: string): boolean {
    const skillContext = this.getTextContext(text, skill, 30);

    // Check for prefixes indicating requirement
    const requiredPatterns = [
      /must\s+have/i,
      /required/i,
      /necessary/i,
      /essential/i
    ];

    // Check for prefixes indicating preference
    const preferredPatterns = [
      /prefer/i,
      /nice\s+to\s+have/i,
      /bonus/i,
      /plus/i,
      /helpful/i
    ];

    for (const pattern of requiredPatterns) {
      if (pattern.test(skillContext)) {
        return true;
      }
    }

    for (const pattern of preferredPatterns) {
      if (pattern.test(skillContext)) {
        return false;
      }
    }

    // Default to required if not explicitly preferred
    return true;
  }

  /**
   * Determine if education is required based on context
   */
  private isRequiredEducation(text: string, degree: string): boolean {
    const degreeContext = this.getTextContext(text, degree, 30);
    return !/(prefer|preferred|plus|nice to have)/i.test(degreeContext);
  }

  /**
   * Determine if education is preferred but not required
   */
  private isPreferredEducation(text: string, degree: string): boolean {
    const degreeContext = this.getTextContext(text, degree, 30);
    return /(prefer|preferred|plus|nice to have)/i.test(degreeContext);
  }

  /**
   * Calculate importance of a skill based on frequency and position
   */
  private calculateImportance(text: string, term: string): number {
    const regex = new RegExp(this.escapeRegExp(term.toLowerCase()), 'gi');
    const matches = text.match(regex);

    // Count occurrences
    const frequency = matches ? matches.length : 0;

    // Check if it appears in the first third of the text (more important)
    const firstThird = text.substring(0, Math.floor(text.length / 3));
    const appearsEarly = new RegExp(this.escapeRegExp(term.toLowerCase()), 'i').test(firstThird);

    // Check if it appears in a requirements section
    const inRequirementsSection = /requirements|qualifications|what you'll need/i.test(
      this.getTextContext(text, term, 100)
    );

    // Calculate importance score (0-100)
    let score = 0;
    score += Math.min(frequency * 20, 40); // Up to 40 points for frequency
    score += appearsEarly ? 30 : 0;        // 30 points for appearing early
    score += inRequirementsSection ? 30 : 0; // 30 points for being in requirements section

    return Math.min(score, 100);
  }

  /**
   * Helper function to get text context around a term
   */
  private getTextContext(text: string, term: string, charWindow: number): string {
    const termIndex = text.toLowerCase().indexOf(term.toLowerCase());
    if (termIndex === -1) return '';

    const start = Math.max(0, termIndex - charWindow);
    const end = Math.min(text.length, termIndex + term.length + charWindow);

    return text.substring(start, end);
  }

  /**
   * Escape special characters in regex
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Get technical category for a skill
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
   * Load degree terms with education levels
   */
  private loadDegreeTerms(): { term: string; level: string }[] {
    return [
      { term: 'Bachelor\'s Degree', level: 'Bachelor' },
      { term: 'Bachelor of Science', level: 'Bachelor' },
      { term: 'Bachelor of Arts', level: 'Bachelor' },
      { term: 'B.S.', level: 'Bachelor' },
      { term: 'B.A.', level: 'Bachelor' },
      { term: 'Master\'s Degree', level: 'Master' },
      { term: 'Master of Science', level: 'Master' },
      { term: 'Master of Arts', level: 'Master' },
      { term: 'M.S.', level: 'Master' },
      { term: 'M.A.', level: 'Master' },
      { term: 'MBA', level: 'Master' },
      { term: 'Ph.D.', level: 'Doctorate' },
      { term: 'Doctorate', level: 'Doctorate' },
      { term: 'Doctoral Degree', level: 'Doctorate' },
      { term: 'Associate\'s Degree', level: 'Associate' },
      { term: 'Associate Degree', level: 'Associate' },
      { term: 'A.A.', level: 'Associate' },
      { term: 'A.S.', level: 'Associate' },
      { term: 'Certificate', level: 'Certificate' },
      { term: 'Certification', level: 'Certificate' },
      { term: 'High School Diploma', level: 'HighSchool' }
    ];
  }

  /**
   * Load experience level terms
   */
  private loadExperienceLevelTerms(): { term: string; years: number }[] {
    return [
      { term: 'Entry Level', years: 0 },
      { term: 'Junior', years: 1 },
      { term: 'Mid-Level', years: 3 },
      { term: 'Senior', years: 5 },
      { term: 'Lead', years: 7 },
      { term: 'Principal', years: 10 },
      { term: 'Staff', years: 8 },
      { term: 'Architect', years: 8 }
    ];
  }
}
