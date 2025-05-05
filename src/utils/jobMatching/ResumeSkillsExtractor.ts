
/**
 * ResumeSkillsExtractor - Extract skills from resume
 */

import { ParsedResume } from '@/types/resume';

export interface ExtractedSkill {
  name: string;
  category?: 'technical' | 'soft' | 'language' | 'tool' | 'domain' | 'other';
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export class ResumeSkillsExtractor {
  constructor() {}
  
  /**
   * Extract skills from a parsed resume
   */
  extractSkills(resume: ParsedResume): ExtractedSkill[] {
    // This would normally use NLP or AI to extract and categorize skills
    // For now, we'll use a simple implementation based on resume skills
    
    return (resume.skills || []).map(skill => ({
      name: skill,
      category: this.categorizeSkill(skill),
      // Note: We don't have enough information to determine proficiency and years of experience
    }));
  }
  
  /**
   * Categorize a skill
   */
  private categorizeSkill(skill: string): ExtractedSkill['category'] {
    const technicalKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go',
      'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
      'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
      'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'redis', 'database',
      'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
      'git', 'cicd', 'jenkins', 'github actions',
      'rest', 'graphql', 'api'
    ];
    
    const softKeywords = [
      'communication', 'leadership', 'teamwork', 'problem solving', 
      'critical thinking', 'creativity', 'time management', 'collaboration',
      'adaptability', 'conflict resolution', 'decision making', 'negotiation',
      'presentation', 'writing', 'mentoring', 'coaching'
    ];
    
    const languageKeywords = [
      'english', 'spanish', 'french', 'german', 'chinese', 'japanese',
      'russian', 'arabic', 'hindi', 'portuguese', 'italian'
    ];
    
    const toolKeywords = [
      'jira', 'confluence', 'slack', 'microsoft office', 'excel', 'powerpoint',
      'word', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator',
      'trello', 'asana', 'notion'
    ];
    
    const lowercaseSkill = skill.toLowerCase();
    
    if (technicalKeywords.some(keyword => lowercaseSkill.includes(keyword))) {
      return 'technical';
    }
    
    if (softKeywords.some(keyword => lowercaseSkill.includes(keyword))) {
      return 'soft';
    }
    
    if (languageKeywords.some(keyword => lowercaseSkill.includes(keyword))) {
      return 'language';
    }
    
    if (toolKeywords.some(keyword => lowercaseSkill.includes(keyword))) {
      return 'tool';
    }
    
    return 'other';
  }
}
