
/**
 * Job Match Calculator - Calculate match percentage between job and resume
 */

import { Job } from '@/types/job';
import { ParsedResume } from '@/types/resume';
import { ResumeSkillsExtractor, ExtractedSkill } from './ResumeSkillsExtractor';

export interface SkillMatch {
  skill: string;
  matched: boolean;
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
    locationScore?: number;
  }
}

export class JobMatchCalculator {
  private skillsExtractor: ResumeSkillsExtractor;
  
  constructor() {
    this.skillsExtractor = new ResumeSkillsExtractor();
  }
  
  /**
   * Calculate match percentage between a job and a resume
   * @param job The job to match against
   * @param resume The parsed resume to match
   * @returns The match result with percentage and details
   */
  calculateMatchPercentage(job: Job, resume: ParsedResume): JobMatchResult {
    // Extract job requirements
    const requiredSkills = job.skills || [];
    const jobTitle = job.title || '';
    const jobLevel = job.level || 'mid';
    const jobLocation = job.location || '';
    
    // Extract resume skills
    const resumeSkills = resume.skills || [];
    
    // Calculate skill matches
    const { 
      matchedSkills, 
      missingSkills, 
      extraSkills, 
      skillsScore 
    } = this.calculateSkillsScore(requiredSkills, resumeSkills);
    
    // Calculate education match
    const educationScore = this.calculateEducationScore(job, resume);
    
    // Calculate experience match
    const experienceScore = this.calculateExperienceScore(job, resume);
    
    // Calculate location match
    const locationScore = this.calculateLocationScore(job, resume);
    
    // Calculate overall match percentage with weighted components
    const weights = {
      skills: 0.5,
      education: 0.2,
      experience: 0.25,
      location: 0.05
    };
    
    const overallScore = 
      (skillsScore * weights.skills) +
      (educationScore * weights.education) +
      (experienceScore * weights.experience) +
      (locationScore * weights.location);
    
    // Create skill matches array for UI
    const skillMatches: SkillMatch[] = requiredSkills.map(skill => ({
      skill,
      matched: matchedSkills.includes(skill)
    }));
    
    return {
      matchPercentage: Math.round(overallScore * 100),
      skillMatches,
      missingSkills,
      extraSkills,
      details: {
        technicalSkillsScore: skillsScore * 100,
        softSkillsScore: 75, // Placeholder, would need more advanced analysis
        educationScore: educationScore * 100,
        experienceScore: experienceScore * 100,
        locationScore: locationScore * 100
      }
    };
  }
  
  /**
   * Calculate skill match score
   */
  private calculateSkillsScore(
    requiredSkills: string[], 
    resumeSkills: string[]
  ): { 
    matchedSkills: string[]; 
    missingSkills: string[]; 
    extraSkills: string[];
    skillsScore: number;
  } {
    const normalizedRequiredSkills = requiredSkills.map(s => s.toLowerCase());
    const normalizedResumeSkills = resumeSkills.map(s => s.toLowerCase());
    
    // Find matched skills
    const matchedSkills = normalizedRequiredSkills.filter(skill => 
      normalizedResumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
    );
    
    // Find missing skills
    const missingSkills = normalizedRequiredSkills.filter(skill => 
      !normalizedResumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
    );
    
    // Find extra skills in resume
    const extraSkills = normalizedResumeSkills.filter(skill => 
      !normalizedRequiredSkills.some(reqSkill => reqSkill.includes(skill) || skill.includes(reqSkill))
    );
    
    // Calculate score - empty required skills should return 1.0 (full match)
    const skillsScore = normalizedRequiredSkills.length === 0 ? 
      1.0 : 
      matchedSkills.length / normalizedRequiredSkills.length;
    
    return {
      matchedSkills: matchedSkills.map(s => this.capitalizeFirstLetter(s)),
      missingSkills: missingSkills.map(s => this.capitalizeFirstLetter(s)),
      extraSkills: extraSkills.map(s => this.capitalizeFirstLetter(s)),
      skillsScore
    };
  }
  
  /**
   * Calculate education match score
   */
  private calculateEducationScore(job: Job, resume: ParsedResume): number {
    if (!job.education || job.education.length === 0 || !resume.education || resume.education.length === 0) {
      // No education requirements or no education in resume
      return 0.5; // Neutral score
    }
    
    // Basic implementation - matches for presence of degree keywords
    const hasRelevantDegree = job.education.some(requiredEdu => {
      return resume.education.some(resumeEdu => {
        const degreeField = resumeEdu.degree.toLowerCase();
        return requiredEdu.toLowerCase().includes(degreeField) || 
               degreeField.includes(requiredEdu.toLowerCase());
      });
    });
    
    return hasRelevantDegree ? 0.9 : 0.3;
  }
  
  /**
   * Calculate experience match score
   */
  private calculateExperienceScore(job: Job, resume: ParsedResume): number {
    // Calculate total years of experience from work experiences
    let totalYearsExperience = 0;
    
    if (resume.workExperiences && resume.workExperiences.length > 0) {
      resume.workExperiences.forEach(job => {
        // Convert date strings to Date objects
        let startDate: Date;
        let endDate: Date;
        
        try {
          startDate = new Date(job.startDate);
          
          if (job.endDate.toLowerCase().includes('present')) {
            endDate = new Date(); // Current date
          } else {
            endDate = new Date(job.endDate);
          }
          
          // Calculate years difference
          const yearsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
          
          if (!isNaN(yearsDiff) && yearsDiff > 0) {
            totalYearsExperience += yearsDiff;
          }
        } catch (e) {
          // Skip this job if dates can't be parsed
        }
      });
    }
    
    // Map job level to required years of experience
    const requiredYears = this.getRequiredYearsFromLevel(job.level || 'mid');
    
    // Calculate score based on difference between required and actual experience
    if (totalYearsExperience >= requiredYears) {
      // Has enough experience
      return 1.0;
    } else if (totalYearsExperience >= requiredYears * 0.7) {
      // Has most of the required experience
      return 0.8;
    } else if (totalYearsExperience >= requiredYears * 0.4) {
      // Has some of the required experience
      return 0.5;
    } else {
      // Has much less experience than required
      return 0.2;
    }
  }
  
  /**
   * Calculate location match score
   */
  private calculateLocationScore(job: Job, resume: ParsedResume): number {
    if (!job.location || !resume.personalInfo.location) {
      return 0.5; // Neutral score if location info missing
    }
    
    // Simple text matching - would be better with geocoding
    const jobLocation = job.location.toLowerCase();
    const candidateLocation = resume.personalInfo.location.toLowerCase();
    
    if (job.remote === true) {
      return 1.0; // Perfect match for remote jobs
    }
    
    // Check for exact or partial location matches
    if (jobLocation === candidateLocation) {
      return 1.0; // Exact match
    } else if (this.locationsSimilar(jobLocation, candidateLocation)) {
      return 0.8; // Similar locations
    }
    
    // Extract cities and check
    const jobCity = this.extractCity(jobLocation);
    const candidateCity = this.extractCity(candidateLocation);
    
    if (jobCity && candidateCity && jobCity === candidateCity) {
      return 0.9; // Same city but described differently
    }
    
    return 0.3; // Different locations
  }
  
  /**
   * Determines if two location strings are similar
   */
  private locationsSimilar(loc1: string, loc2: string): boolean {
    // Check if either contains the other
    if (loc1.includes(loc2) || loc2.includes(loc1)) {
      return true;
    }
    
    // Split by common delimiters and check parts
    const parts1 = loc1.split(/[,\s]+/);
    const parts2 = loc2.split(/[,\s]+/);
    
    // Check for any matching non-trivial parts
    return parts1.some(p1 => 
      p1.length > 2 && parts2.some(p2 => p2.length > 2 && p1 === p2)
    );
  }
  
  /**
   * Extract city from location string
   */
  private extractCity(location: string): string | null {
    // Simple extraction of likely city name
    // Would be better with geocoding and structured location data
    
    // Split by common delimiters and take first part over 3 chars that's not a state code
    const parts = location.split(/[,\s]+/);
    for (const part of parts) {
      if (part.length > 3 && !/^[A-Z]{2}$/i.test(part)) {
        return part.toLowerCase();
      }
    }
    
    return null;
  }
  
  /**
   * Map job level to required years of experience
   */
  private getRequiredYearsFromLevel(level: string): number {
    switch (level.toLowerCase()) {
      case 'intern': return 0;
      case 'entry': return 1;
      case 'junior': return 1;
      case 'mid': return 3;
      case 'senior': return 5;
      case 'lead': return 7;
      case 'manager': return 5;
      case 'director': return 8;
      case 'executive': return 10;
      default: return 3; // Default to mid-level
    }
  }
  
  /**
   * Helper to capitalize first letter for display
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}
