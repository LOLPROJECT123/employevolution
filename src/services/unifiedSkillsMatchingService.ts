
import { Job } from '@/types/job';

export interface SkillsMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  additionalSkills: string[];
  skillsGapPercentage: number;
}

export class UnifiedSkillsMatchingService {
  calculateSkillsMatch(jobSkills: string[], userSkills: string[]): SkillsMatchResult {
    // Normalize skills for case-insensitive comparison
    const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());
    const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase().trim());
    
    // Find matching skills
    const matchingSkills = jobSkills.filter(jobSkill => 
      normalizedUserSkills.includes(jobSkill.toLowerCase().trim())
    );
    
    // Find missing skills (required by job but not possessed by user)
    const missingSkills = jobSkills.filter(jobSkill => 
      !normalizedUserSkills.includes(jobSkill.toLowerCase().trim())
    );
    
    // Find additional skills (user has but not required by job)
    const additionalSkills = userSkills.filter(userSkill => 
      !normalizedJobSkills.includes(userSkill.toLowerCase().trim())
    );
    
    // Calculate match percentage
    const matchPercentage = jobSkills.length > 0 
      ? Math.round((matchingSkills.length / jobSkills.length) * 100)
      : 100;
    
    // Calculate skills gap percentage (inverse of match percentage)
    const skillsGapPercentage = 100 - matchPercentage;
    
    return {
      matchPercentage,
      matchingSkills,
      missingSkills,
      additionalSkills,
      skillsGapPercentage
    };
  }

  getMatchLabel(percentage: number): string {
    if (percentage >= 85) return 'EXCELLENT MATCH';
    if (percentage >= 70) return 'GOOD MATCH';
    if (percentage >= 50) return 'FAIR MATCH';
    return 'WEAK MATCH';
  }

  getMatchColor(percentage: number): string {
    if (percentage >= 85) return 'text-emerald-500';
    if (percentage >= 70) return 'text-green-500';
    if (percentage >= 50) return 'text-amber-500';
    return 'text-red-500';
  }
}

export const unifiedSkillsMatchingService = new UnifiedSkillsMatchingService();
