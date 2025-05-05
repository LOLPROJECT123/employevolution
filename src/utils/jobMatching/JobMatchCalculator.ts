
/**
 * JobMatchCalculator - Calculates match percentage between resume and job requirements
 */
import { Job } from "@/types/job";
import { ParsedResume } from "@/types/resume";
import { JobRequirementsAnalyzer, JobRequirements } from "./JobRequirementsAnalyzer";
import { ResumeSkillsExtractor, ExtractedSkill } from "./ResumeSkillsExtractor";

export interface SkillMatch {
  jobSkill: string;
  resumeSkill: string | null;
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
  };
}

export class JobMatchCalculator {
  private requirementsAnalyzer: JobRequirementsAnalyzer;
  private skillsExtractor: ResumeSkillsExtractor;

  constructor() {
    this.requirementsAnalyzer = new JobRequirementsAnalyzer();
    this.skillsExtractor = new ResumeSkillsExtractor();
  }

  /**
   * Calculate match percentage between a resume and a job posting
   */
  public calculateMatchPercentage(job: Job, resume: ParsedResume): JobMatchResult {
    // Extract job requirements
    const jobRequirements = this.requirementsAnalyzer.analyzeJob(job);
    
    // Extract resume skills
    const resumeSkills = this.skillsExtractor.extractSkillsFromResume(resume);
    
    // Match technical skills
    const technicalSkillsResult = this.matchSkills(
      jobRequirements.technical.map(req => req.skill),
      resumeSkills.filter(s => s.category === 'technical').map(s => s.skill)
    );
    
    // Match soft skills
    const softSkillsResult = this.matchSkills(
      jobRequirements.soft.map(req => req.skill),
      resumeSkills.filter(s => s.category === 'soft').map(s => s.skill)
    );
    
    // Calculate education score
    const educationScore = this.calculateEducationScore(jobRequirements, resume);
    
    // Calculate experience score
    const experienceScore = this.calculateExperienceScore(jobRequirements, resume);
    
    // Combined skill matches
    const skillMatches = [...technicalSkillsResult.matches, ...softSkillsResult.matches];
    
    // List of missing skills (required by job but not in resume)
    const missingSkills = [
      ...jobRequirements.technical
        .filter(req => req.required)
        .map(req => req.skill)
        .filter(skill => !resumeSkills.some(s => s.skill.toLowerCase() === skill.toLowerCase())),
      ...jobRequirements.soft
        .filter(req => req.required)
        .map(req => req.skill)
        .filter(skill => !resumeSkills.some(s => s.skill.toLowerCase() === skill.toLowerCase()))
    ];
    
    // List of extra skills (in resume but not required by job)
    const extraSkills = resumeSkills
      .map(skill => skill.skill)
      .filter(skill => 
        !jobRequirements.technical.some(req => req.skill.toLowerCase() === skill.toLowerCase()) &&
        !jobRequirements.soft.some(req => req.skill.toLowerCase() === skill.toLowerCase())
      );
    
    // Calculate weighted overall score
    const weights = {
      technicalSkills: 0.6,  // 60% of score from technical skills
      softSkills: 0.1,       // 10% of score from soft skills
      education: 0.15,       // 15% of score from education
      experience: 0.15       // 15% of score from experience
    };
    
    // Get scores (make sure we don't divide by zero)
    const technicalSkillsScore = technicalSkillsResult.score;
    const softSkillsScore = softSkillsResult.score;
    
    // Calculate final match percentage (0-100)
    const overallScore = 
      (technicalSkillsScore * weights.technicalSkills) +
      (softSkillsScore * weights.softSkills) +
      (educationScore * weights.education) +
      (experienceScore * weights.experience);
    
    // Round to nearest integer
    const matchPercentage = Math.round(overallScore);
    
    return {
      matchPercentage,
      skillMatches,
      missingSkills,
      extraSkills,
      details: {
        technicalSkillsScore,
        softSkillsScore,
        educationScore,
        experienceScore
      }
    };
  }

  /**
   * Match skills between job requirements and resume
   */
  private matchSkills(
    jobSkills: string[], 
    resumeSkills: string[]
  ): { 
    score: number, 
    matches: SkillMatch[] 
  } {
    // No required skills means perfect match
    if (jobSkills.length === 0) {
      return { score: 100, matches: [] };
    }
    
    const matches: SkillMatch[] = [];
    let matchedCount = 0;
    
    // Check each job skill against resume skills
    jobSkills.forEach(jobSkill => {
      // Find a matching skill in the resume (case insensitive)
      const matchingResumeSkill = resumeSkills.find(
        resumeSkill => resumeSkill.toLowerCase() === jobSkill.toLowerCase()
      );
      
      // Add to matches array
      matches.push({
        jobSkill,
        resumeSkill: matchingResumeSkill || null,
        matched: !!matchingResumeSkill
      });
      
      // Count matches
      if (matchingResumeSkill) {
        matchedCount++;
      }
    });
    
    // Calculate score as percentage of matched skills
    const score = Math.round((matchedCount / jobSkills.length) * 100);
    
    return { score, matches };
  }

  /**
   * Calculate education match score
   */
  private calculateEducationScore(jobRequirements: JobRequirements, resume: ParsedResume): number {
    if (jobRequirements.education.length === 0) {
      return 100; // No education requirements means perfect score
    }
    
    // Get highest level of education from resume
    const resumeEducationLevels = this.getEducationLevels(resume);
    if (resumeEducationLevels.length === 0) {
      return 0; // No education in resume
    }
    
    const highestResumeLevel = Math.max(...resumeEducationLevels);
    
    // Find required education levels from job
    const requiredLevels = jobRequirements.education
      .filter(edu => edu.required)
      .map(edu => this.getEducationLevelValue(edu.level));
    
    // Find preferred education levels from job
    const preferredLevels = jobRequirements.education
      .filter(edu => edu.preferred && !edu.required)
      .map(edu => this.getEducationLevelValue(edu.level));
    
    if (requiredLevels.length > 0) {
      // Check if resume meets the highest required education level
      const highestRequiredLevel = Math.max(...requiredLevels);
      
      if (highestResumeLevel >= highestRequiredLevel) {
        return 100; // Meets or exceeds required education
      } else {
        // Partial credit if close to required level
        return Math.round((highestResumeLevel / highestRequiredLevel) * 80);
      }
    } else if (preferredLevels.length > 0) {
      // Check against preferred levels
      const highestPreferredLevel = Math.max(...preferredLevels);
      
      if (highestResumeLevel >= highestPreferredLevel) {
        return 100; // Meets or exceeds preferred education
      } else {
        // Still give high score since these are just preferences
        return 80;
      }
    }
    
    return 100; // No specific required or preferred levels
  }

  /**
   * Get education levels from resume
   */
  private getEducationLevels(resume: ParsedResume): number[] {
    if (!resume.education || resume.education.length === 0) {
      return [];
    }
    
    return resume.education.map(edu => {
      const degree = edu.degree.toLowerCase();
      
      if (degree.includes('phd') || degree.includes('doctor')) {
        return this.getEducationLevelValue('Doctorate');
      } else if (degree.includes('master')) {
        return this.getEducationLevelValue('Master');
      } else if (degree.includes('bachelor')) {
        return this.getEducationLevelValue('Bachelor');
      } else if (degree.includes('associate')) {
        return this.getEducationLevelValue('Associate');
      } else if (degree.includes('certificate') || degree.includes('certification')) {
        return this.getEducationLevelValue('Certificate');
      } else if (degree.includes('high school')) {
        return this.getEducationLevelValue('HighSchool');
      }
      
      return 1; // Default to some education
    });
  }

  /**
   * Convert education level string to numeric value for comparison
   */
  private getEducationLevelValue(level: string): number {
    const levels: Record<string, number> = {
      'Doctorate': 6,
      'Master': 5,
      'Bachelor': 4,
      'Associate': 3,
      'Certificate': 2,
      'HighSchool': 1,
      'None': 0
    };
    
    return levels[level] || 0;
  }

  /**
   * Calculate experience match score
   */
  private calculateExperienceScore(jobRequirements: JobRequirements, resume: ParsedResume): number {
    if (jobRequirements.experience.length === 0) {
      return 100; // No experience requirements means perfect score
    }
    
    // Calculate years of experience from resume
    const yearsOfExperience = this.calculateYearsOfExperience(resume);
    
    // Find highest required years of experience
    const requiredExperience = jobRequirements.experience
      .filter(exp => exp.required && exp.years !== undefined)
      .map(exp => exp.years as number);
    
    if (requiredExperience.length > 0) {
      const maxRequiredYears = Math.max(...requiredExperience);
      
      if (yearsOfExperience >= maxRequiredYears) {
        return 100; // Meets or exceeds required experience
      } else if (yearsOfExperience >= maxRequiredYears * 0.8) {
        return 90; // Close to required experience (80% or more)
      } else if (yearsOfExperience >= maxRequiredYears * 0.6) {
        return 70; // Has majority of required experience
      } else if (yearsOfExperience >= maxRequiredYears * 0.4) {
        return 50; // Has some of required experience
      } else {
        return 30; // Has less than 40% of required experience
      }
    }
    
    // If no explicit year requirements, check experience level
    const requiredLevels = jobRequirements.experience
      .filter(exp => exp.required && exp.level !== undefined)
      .map(exp => {
        // Convert level to equivalent years
        const level = exp.level?.toLowerCase() || '';
        if (level.includes('senior')) return 5;
        if (level.includes('mid')) return 3;
        if (level.includes('junior')) return 1;
        if (level.includes('entry')) return 0;
        return 2; // Default
      });
    
    if (requiredLevels.length > 0) {
      const maxRequiredLevel = Math.max(...requiredLevels);
      
      if (yearsOfExperience >= maxRequiredLevel) {
        return 100; // Meets or exceeds required level
      } else if (yearsOfExperience >= maxRequiredLevel * 0.7) {
        return 80; // Close to required level
      } else {
        return 60; // Below required level
      }
    }
    
    // Default score if no specific requirements found
    return Math.min(100, Math.max(60, yearsOfExperience * 10));
  }

  /**
   * Calculate total years of experience from resume
   */
  private calculateYearsOfExperience(resume: ParsedResume): number {
    if (!resume.workExperiences || resume.workExperiences.length === 0) {
      return 0;
    }
    
    const now = new Date();
    let totalMonths = 0;
    
    resume.workExperiences.forEach(job => {
      try {
        const startDate = new Date(job.startDate);
        let endDate: Date;
        
        // Handle current jobs
        if (job.endDate.toLowerCase() === 'present' || !job.endDate) {
          endDate = now;
        } else {
          endDate = new Date(job.endDate);
        }
        
        // Calculate months between dates
        const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
        
        if (!isNaN(months) && months > 0) {
          totalMonths += months;
        }
      } catch (e) {
        // Skip jobs with invalid dates
      }
    });
    
    // Convert months to years (rounded to 1 decimal place)
    return Math.round((totalMonths / 12) * 10) / 10;
  }
}
