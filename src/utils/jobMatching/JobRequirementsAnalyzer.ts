
/**
 * JobRequirementsAnalyzer - Extract and analyze job requirements from job descriptions
 */

import { Job } from '@/types/job';

export interface JobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  education: string[];
  experienceYears: number;
  location: string | null;
  remote: boolean;
  industry: string | null;
  role: string | null;
}

export class JobRequirementsAnalyzer {
  constructor() {}
  
  /**
   * Analyze job description to extract structured requirements
   */
  analyzeJobDescription(job: Job): JobRequirements {
    // This would normally use NLP or AI to parse the job description
    // For now, we'll use a simple implementation based on job properties
    
    return {
      requiredSkills: job.skills || [],
      preferredSkills: [],
      education: job.education || [],
      experienceYears: this.estimateExperienceYears(job),
      location: job.location,
      remote: job.remote || false,
      industry: null,
      role: job.title
    };
  }
  
  /**
   * Estimate required years of experience based on job data
   */
  private estimateExperienceYears(job: Job): number {
    switch (job.level) {
      case 'intern': return 0;
      case 'entry': return 1;
      case 'mid': return 3;
      case 'senior': return 5;
      case 'lead': return 7;
      case 'manager': return 5;
      case 'director': return 8;
      case 'executive': return 10;
      default: return 3; // Default to mid-level if not specified
    }
  }
}
