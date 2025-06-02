
import { supabase } from '@/integrations/supabase/client';

export interface JobMatchResult {
  jobId: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  salaryMatch: number;
  locationMatch: number;
  experienceMatch: number;
  recommendations: string[];
}

export interface ResumeOptimization {
  score: number;
  keywords: string[];
  suggestions: string[];
  atsCompatibility: number;
  improvementAreas: string[];
}

export class MLJobMatchingService {
  static async calculateJobMatchScore(userId: string, jobData: any): Promise<JobMatchResult> {
    try {
      const [userProfile, userSkills, userPreferences, workExperience] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('job_preferences').select('*').eq('user_id', userId).single(),
        supabase.from('work_experiences').select('*').eq('user_id', userId)
      ]);

      const userSkillsSet = new Set(userSkills.data?.map(s => s.skill.toLowerCase()) || []);
      const jobRequiredSkills = this.extractSkillsFromJob(jobData);
      
      // Calculate skill match
      const matchingSkills = jobRequiredSkills.filter(skill => 
        userSkillsSet.has(skill.toLowerCase())
      );
      const missingSkills = jobRequiredSkills.filter(skill => 
        !userSkillsSet.has(skill.toLowerCase())
      );
      
      const skillMatchScore = (matchingSkills.length / Math.max(jobRequiredSkills.length, 1)) * 100;
      
      // Calculate salary match
      const expectedSalary = this.extractSalaryFromPreferences(userPreferences.data);
      const jobSalary = this.extractSalaryFromJob(jobData);
      const salaryMatch = this.calculateSalaryMatch(expectedSalary, jobSalary);
      
      // Calculate location match
      const userLocation = userProfile.data?.location || '';
      const jobLocation = jobData.location || '';
      const locationMatch = this.calculateLocationMatch(userLocation, jobLocation);
      
      // Calculate experience match
      const userExperienceYears = this.calculateExperienceYears(workExperience.data || []);
      const requiredExperience = this.extractExperienceFromJob(jobData);
      const experienceMatch = this.calculateExperienceMatch(userExperienceYears, requiredExperience);
      
      // Overall match score (weighted average)
      const matchScore = Math.round(
        (skillMatchScore * 0.4) + 
        (salaryMatch * 0.2) + 
        (locationMatch * 0.2) + 
        (experienceMatch * 0.2)
      );
      
      const recommendations = this.generateMatchRecommendations(
        matchingSkills, missingSkills, salaryMatch, locationMatch, experienceMatch
      );

      return {
        jobId: jobData.id || 'unknown',
        matchScore,
        matchingSkills,
        missingSkills,
        salaryMatch,
        locationMatch,
        experienceMatch,
        recommendations
      };
    } catch (error) {
      console.error('Job match calculation error:', error);
      return {
        jobId: 'unknown',
        matchScore: 0,
        matchingSkills: [],
        missingSkills: [],
        salaryMatch: 0,
        locationMatch: 0,
        experienceMatch: 0,
        recommendations: ['Unable to calculate match score']
      };
    }
  }

  static async generateResumeOptimizations(userId: string, targetJob?: any): Promise<ResumeOptimization> {
    try {
      const [userProfile, userSkills, workExperience, resumeFile] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('work_experiences').select('*').eq('user_id', userId),
        supabase.from('user_resume_files').select('*').eq('user_id', userId).eq('is_current', true).single()
      ]);

      const resumeContent = resumeFile.data?.file_content || '';
      const userSkillsList = userSkills.data?.map(s => s.skill) || [];
      
      // Analyze resume content
      const keywords = this.extractKeywordsFromResume(resumeContent);
      const atsCompatibility = this.calculateATSCompatibility(resumeContent);
      
      // Generate suggestions based on target job
      const suggestions: string[] = [];
      
      if (targetJob) {
        const jobSkills = this.extractSkillsFromJob(targetJob);
        const missingJobSkills = jobSkills.filter(skill => 
          !userSkillsList.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase())
          )
        );
        
        if (missingJobSkills.length > 0) {
          suggestions.push(`Add these relevant skills: ${missingJobSkills.slice(0, 5).join(', ')}`);
        }
      }
      
      // General resume improvements
      if (atsCompatibility < 80) {
        suggestions.push('Use more standard section headings (Experience, Education, Skills)');
        suggestions.push('Avoid images, tables, and complex formatting');
      }
      
      if (keywords.length < 10) {
        suggestions.push('Include more industry-specific keywords');
      }
      
      if (!resumeContent.includes('achieved') && !resumeContent.includes('improved')) {
        suggestions.push('Add quantifiable achievements and results');
      }

      const score = this.calculateResumeScore(resumeContent, userSkillsList, workExperience.data || []);
      const improvementAreas = this.identifyImprovementAreas(resumeContent, score);

      return {
        score,
        keywords,
        suggestions,
        atsCompatibility,
        improvementAreas
      };
    } catch (error) {
      console.error('Resume optimization error:', error);
      return {
        score: 0,
        keywords: [],
        suggestions: ['Unable to analyze resume'],
        atsCompatibility: 0,
        improvementAreas: []
      };
    }
  }

  static async predictSalaryRange(userId: string, jobTitle: string, location: string): Promise<{ min: number; max: number; confidence: number }> {
    try {
      const [userSkills, workExperience] = await Promise.all([
        supabase.from('user_skills').select('*').eq('user_id', userId),
        supabase.from('work_experiences').select('*').eq('user_id', userId)
      ]);

      const experienceYears = this.calculateExperienceYears(workExperience.data || []);
      const skillCount = userSkills.data?.length || 0;
      
      // Mock salary prediction based on role, experience, and skills
      const baseSalaries: Record<string, number> = {
        'software engineer': 75000,
        'senior software engineer': 110000,
        'data scientist': 90000,
        'product manager': 95000,
        'designer': 70000,
        'marketing manager': 65000
      };
      
      const normalizedTitle = jobTitle.toLowerCase();
      let baseSalary = 60000; // default
      
      for (const [title, salary] of Object.entries(baseSalaries)) {
        if (normalizedTitle.includes(title)) {
          baseSalary = salary;
          break;
        }
      }
      
      // Adjust for experience
      const experienceMultiplier = 1 + (experienceYears * 0.15);
      
      // Adjust for skills
      const skillMultiplier = 1 + (skillCount * 0.02);
      
      // Adjust for location (simplified)
      const locationMultiplier = location.toLowerCase().includes('san francisco') || location.toLowerCase().includes('new york') ? 1.4 :
                                location.toLowerCase().includes('seattle') || location.toLowerCase().includes('boston') ? 1.2 : 1.0;
      
      const adjustedSalary = baseSalary * experienceMultiplier * skillMultiplier * locationMultiplier;
      
      return {
        min: Math.round(adjustedSalary * 0.85),
        max: Math.round(adjustedSalary * 1.25),
        confidence: Math.min(85 + (experienceYears * 2) + (skillCount * 1), 95)
      };
    } catch (error) {
      console.error('Salary prediction error:', error);
      return { min: 50000, max: 80000, confidence: 50 };
    }
  }

  // Helper methods
  private static extractSkillsFromJob(jobData: any): string[] {
    const description = (jobData.description || '').toLowerCase();
    const title = (jobData.title || '').toLowerCase();
    const requirements = (jobData.requirements || '').toLowerCase();
    
    const allText = `${description} ${title} ${requirements}`;
    
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'communication',
      'machine learning', 'data analysis', 'project management', 'html', 'css'
    ];
    
    return commonSkills.filter(skill => allText.includes(skill));
  }

  private static extractSalaryFromPreferences(preferences: any): number {
    if (!preferences?.salary_expectation) return 75000;
    
    const salaryStr = preferences.salary_expectation.toLowerCase();
    const numbers = salaryStr.match(/\d+/g);
    
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0]) * (salaryStr.includes('k') ? 1000 : 1);
    }
    
    return 75000;
  }

  private static extractSalaryFromJob(jobData: any): number {
    const salary = jobData.salary || jobData.salary_min || 0;
    if (typeof salary === 'number') return salary;
    
    const salaryStr = (salary || '').toString().toLowerCase();
    const numbers = salaryStr.match(/\d+/g);
    
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0]) * (salaryStr.includes('k') ? 1000 : 1);
    }
    
    return 75000;
  }

  private static calculateSalaryMatch(expected: number, offered: number): number {
    if (offered === 0) return 50; // Unknown salary
    
    const ratio = offered / expected;
    if (ratio >= 1) return 100;
    if (ratio >= 0.9) return 90;
    if (ratio >= 0.8) return 75;
    if (ratio >= 0.7) return 50;
    return 25;
  }

  private static calculateLocationMatch(userLocation: string, jobLocation: string): number {
    if (!userLocation || !jobLocation) return 50;
    
    const userLoc = userLocation.toLowerCase();
    const jobLoc = jobLocation.toLowerCase();
    
    if (userLoc === jobLoc) return 100;
    if (userLoc.includes(jobLoc) || jobLoc.includes(userLoc)) return 80;
    if (jobLoc.includes('remote') || jobLoc.includes('anywhere')) return 90;
    
    // Check for same state/region
    const userState = userLoc.split(',').pop()?.trim();
    const jobState = jobLoc.split(',').pop()?.trim();
    if (userState && jobState && userState === jobState) return 70;
    
    return 30;
  }

  private static calculateExperienceYears(workExperiences: any[]): number {
    if (!workExperiences || workExperiences.length === 0) return 0;
    
    return workExperiences.reduce((total, exp) => {
      const startYear = exp.start_date ? parseInt(exp.start_date.split('-')[0]) : new Date().getFullYear();
      const endYear = exp.end_date ? parseInt(exp.end_date.split('-')[0]) : new Date().getFullYear();
      return total + Math.max(0, endYear - startYear);
    }, 0);
  }

  private static extractExperienceFromJob(jobData: any): number {
    const description = (jobData.description || '').toLowerCase();
    const requirements = (jobData.requirements || '').toLowerCase();
    const allText = `${description} ${requirements}`;
    
    const experienceMatches = allText.match(/(\d+)\s*(?:\+)?\s*years?\s*(?:of\s*)?experience/g);
    if (experienceMatches) {
      const numbers = experienceMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '0'));
      return Math.max(...numbers);
    }
    
    if (allText.includes('senior') || allText.includes('lead')) return 5;
    if (allText.includes('junior') || allText.includes('entry')) return 0;
    
    return 2; // Default mid-level
  }

  private static calculateExperienceMatch(userYears: number, requiredYears: number): number {
    if (userYears >= requiredYears) return 100;
    if (userYears >= requiredYears * 0.8) return 80;
    if (userYears >= requiredYears * 0.6) return 60;
    if (userYears >= requiredYears * 0.4) return 40;
    return 20;
  }

  private static generateMatchRecommendations(
    matchingSkills: string[],
    missingSkills: string[],
    salaryMatch: number,
    locationMatch: number,
    experienceMatch: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (missingSkills.length > 0) {
      recommendations.push(`Develop these skills: ${missingSkills.slice(0, 3).join(', ')}`);
    }
    
    if (salaryMatch < 70) {
      recommendations.push('Consider negotiating salary or look for roles with better compensation');
    }
    
    if (locationMatch < 50) {
      recommendations.push('Consider remote work opportunities or relocation');
    }
    
    if (experienceMatch < 60) {
      recommendations.push('Highlight transferable skills and relevant projects');
    }
    
    if (matchingSkills.length > 0) {
      recommendations.push(`Emphasize your strengths in: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    return recommendations;
  }

  private static extractKeywordsFromResume(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    const wordFreq = words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .reduce((acc, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word);
  }

  private static calculateATSCompatibility(content: string): number {
    let score = 100;
    
    // Check for problematic elements
    if (content.includes('<table>') || content.includes('│')) score -= 20;
    if (content.includes('<img>') || content.includes('image')) score -= 15;
    if (content.length < 500) score -= 20;
    if (!content.includes('Experience') && !content.includes('Work History')) score -= 10;
    if (!content.includes('Education')) score -= 10;
    if (!content.includes('Skills')) score -= 10;
    
    return Math.max(0, score);
  }

  private static calculateResumeScore(content: string, skills: string[], experience: any[]): number {
    let score = 0;
    
    // Content length
    if (content.length > 1000) score += 20;
    
    // Skills section
    if (skills.length >= 5) score += 20;
    
    // Experience
    if (experience.length >= 2) score += 25;
    
    // Quantified achievements
    if (content.match(/\d+%|\$\d+|\d+\s*(million|thousand|k)/gi)) score += 15;
    
    // Action words
    const actionWords = ['achieved', 'improved', 'developed', 'managed', 'led', 'created'];
    const hasActionWords = actionWords.some(word => content.toLowerCase().includes(word));
    if (hasActionWords) score += 10;
    
    // Contact information
    if (content.includes('@') && content.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/)) score += 10;
    
    return Math.min(100, score);
  }

  private static identifyImprovementAreas(content: string, score: number): string[] {
    const areas: string[] = [];
    
    if (score < 40) areas.push('Overall resume structure needs improvement');
    if (content.length < 800) areas.push('Add more detailed descriptions');
    if (!content.match(/\d+%|\$\d+/gi)) areas.push('Include quantified achievements');
    if (!content.toLowerCase().includes('achieved')) areas.push('Use more action-oriented language');
    
    return areas;
  }
}
