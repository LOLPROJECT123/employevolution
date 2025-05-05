
import { Job } from '@/types/job';
import { ParsedResume } from '@/types/resume';

export interface SkillMatch {
  skill: string;
  matched: boolean;
  category?: string;
  required?: boolean;
}

export interface JobMatchResult {
  matchPercentage: number;
  skillMatches: SkillMatch[];
  missingSkills: string[];
  extraSkills: string[];
  details: {
    technicalSkillsScore: number;
    softSkillsScore: number;
    educationScore: number;
    experienceScore: number;
  }
}

export class JobMatchCalculator {
  constructor() {}

  /**
   * Calculate the match percentage between a job and a resume
   */
  calculateMatchPercentage(job: Job, resume: ParsedResume): JobMatchResult {
    // Extract skills from resume and job
    const resumeSkills = resume.skills || [];
    const jobSkills = job.skills || [];
    
    // Calculate matching skills
    const matchingSkills = jobSkills.filter(skill => 
      resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    // Calculate match percentage
    const matchPercentage = jobSkills.length > 0 
      ? Math.min(Math.round((matchingSkills.length / jobSkills.length) * 100), 100)
      : 50; // Default to 50% if no job skills are specified
    
    // Generate skill matches
    const skillMatches: SkillMatch[] = jobSkills.map(skill => ({
      skill,
      matched: resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase() === skill.toLowerCase()
      ),
      required: true
    }));
    
    // Find missing skills (in job but not in resume)
    const missingSkills = jobSkills.filter(skill => 
      !resumeSkills.some(resumeSkill => 
        resumeSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    // Find extra skills (in resume but not in job)
    const extraSkills = resumeSkills.filter(skill => 
      !jobSkills.some(jobSkill => 
        jobSkill.toLowerCase() === skill.toLowerCase()
      )
    );
    
    return {
      matchPercentage,
      skillMatches,
      missingSkills,
      extraSkills,
      details: {
        technicalSkillsScore: this.calculateTechnicalScore(job, resume),
        softSkillsScore: this.calculateSoftSkillsScore(job, resume),
        educationScore: this.calculateEducationScore(job, resume),
        experienceScore: this.calculateExperienceScore(job, resume)
      }
    };
  }
  
  /**
   * Calculate technical skills score
   */
  private calculateTechnicalScore(job: Job, resume: ParsedResume): number {
    return 75; // Simplified implementation
  }
  
  /**
   * Calculate soft skills score
   */
  private calculateSoftSkillsScore(job: Job, resume: ParsedResume): number {
    return 70; // Simplified implementation
  }
  
  /**
   * Calculate education score
   */
  private calculateEducationScore(job: Job, resume: ParsedResume): number {
    return 80; // Simplified implementation
  }
  
  /**
   * Calculate experience score
   */
  private calculateExperienceScore(job: Job, resume: ParsedResume): number {
    return 75; // Simplified implementation
  }
}
