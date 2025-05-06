
/**
 * Resume Skills Extractor - Extract skills from resume text
 */

export interface ExtractedSkill {
  name: string;
  category: 'technical' | 'soft' | 'language' | 'other';
  confidence: number;
}

export class ResumeSkillsExtractor {
  private technicalSkills: string[] = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express', 
    'mongodb', 'sql', 'postgresql', 'mysql', 'nosql', 'redis', 'aws', 'azure', 
    'gcp', 'docker', 'kubernetes', 'ci/cd', 'git', 'github', 'gitlab', 'java', 
    'python', 'c#', 'c++', 'rust', 'go', 'php', 'laravel', 'ruby', 'rails', 
    'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui',
    'redux', 'graphql', 'rest', 'api', 'oauth', 'jwt', 'authentication', 
    'authorization', 'webpack', 'vite', 'jest', 'mocha', 'testing', 'tdd', 
    'agile', 'scrum', 'kanban', 'jira'
  ];
  
  private softSkills: string[] = [
    'communication', 'teamwork', 'leadership', 'problem-solving', 'time-management',
    'critical-thinking', 'decision-making', 'organizational', 'stress-management',
    'adaptability', 'conflict-resolution', 'creativity', 'emotional-intelligence',
    'interpersonal', 'collaboration', 'flexibility', 'detail-oriented', 'multitasking',
    'research', 'self-motivation', 'work-ethic', 'customer-service'
  ];
  
  private languages: string[] = [
    'english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'russian',
    'portuguese', 'italian', 'dutch', 'arabic', 'hindi', 'korean', 'hebrew'
  ];
  
  constructor() {}
  
  /**
   * Extract skills from resume text
   * @param resumeText The text from the resume
   * @returns Array of extracted skills
   */
  extractSkills(resumeText: string): ExtractedSkill[] {
    const lowerCaseText = resumeText.toLowerCase();
    const skills: ExtractedSkill[] = [];
    
    // Extract technical skills
    this.technicalSkills.forEach(skill => {
      if (this.containsSkill(lowerCaseText, skill)) {
        skills.push({
          name: skill,
          category: 'technical',
          confidence: 0.9
        });
      }
    });
    
    // Extract soft skills
    this.softSkills.forEach(skill => {
      if (this.containsSkill(lowerCaseText, skill)) {
        skills.push({
          name: skill,
          category: 'soft',
          confidence: 0.8
        });
      }
    });
    
    // Extract language skills
    this.languages.forEach(language => {
      if (this.containsSkill(lowerCaseText, language)) {
        skills.push({
          name: language,
          category: 'language',
          confidence: 0.95
        });
      }
    });
    
    return skills;
  }
  
  /**
   * Check if resume text contains a skill
   * @param text The text to search in
   * @param skill The skill to search for
   * @returns Boolean indicating if the skill is found
   */
  private containsSkill(text: string, skill: string): boolean {
    // Simple check for exact match or word boundary
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    return regex.test(text);
  }
}
