
/**
 * Job matching utilities
 */
import { Job } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";

export interface SkillMatch {
  skill: string;
  category?: string;
  required?: boolean;
  matched: boolean;
}

/**
 * Calculate match percentage between a job and a resume
 */
export const calculateMatchPercentage = (job: Job, resumeData: any): number => {
  // This is a simple implementation for now
  // A more sophisticated algorithm would consider many factors
  
  // Extract skills from resume
  const resumeSkills = resumeData.skills || [];
  
  // Extract skills from job
  const jobSkills = job.skills || [];
  
  if (jobSkills.length === 0) {
    return 50; // Neutral match if job has no skills listed
  }
  
  // Count matching skills
  const matchingSkills = jobSkills.filter(skill => 
    resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  
  // Calculate match percentage
  const matchPercentage = Math.round((matchingSkills.length / jobSkills.length) * 100);
  
  // Cap at 100%
  return Math.min(matchPercentage, 100);
};

// Add these functions for JobMatchingDemo.tsx
export const calculateJobMatch = calculateMatchPercentage;

export const addMatchPercentageToJob = (job: Job, resumeData: any): Job => {
  const matchPercentage = calculateMatchPercentage(job, resumeData);
  return {
    ...job,
    matchPercentage
  };
};

/**
 * Enhance a job with match data
 */
export const enhanceJobWithMatchData = (job: Job, resumeData: any): ExtendedJob => {
  const matchPercentage = calculateMatchPercentage(job, resumeData);
  
  const enhancedJob = {
    ...job,
    matchPercentage,
    matchDetails: {
      skillMatches: generateSkillMatches(job.skills || [], resumeData.skills || []),
      missingSkills: findMissingSkills(job.skills || [], resumeData.skills || []),
      extraSkills: findExtraSkills(job.skills || [], resumeData.skills || []),
      technicalSkillsScore: calculateTechnicalScore(job, resumeData),
      softSkillsScore: calculateSoftSkillsScore(job, resumeData),
      educationScore: calculateEducationScore(job, resumeData),
      experienceScore: calculateExperienceScore(job, resumeData)
    }
  } as ExtendedJob;
  
  return enhancedJob;
};

/**
 * Generate skill matches data
 */
const generateSkillMatches = (jobSkills: string[], resumeSkills: string[]): SkillMatch[] => {
  return jobSkills.map(skill => ({
    skill,
    matched: resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase() === skill.toLowerCase()
    ),
    required: true // Assume all skills are required for now
  }));
};

/**
 * Find skills in the job that are missing from the resume
 */
const findMissingSkills = (jobSkills: string[], resumeSkills: string[]): string[] => {
  return jobSkills.filter(skill => 
    !resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );
};

/**
 * Find extra skills in the resume that aren't mentioned in the job
 */
const findExtraSkills = (jobSkills: string[], resumeSkills: string[]): string[] => {
  return resumeSkills.filter(skill => 
    !jobSkills.some(jobSkill => 
      jobSkill.toLowerCase() === skill.toLowerCase()
    )
  );
};

/**
 * Calculate technical skills score
 */
const calculateTechnicalScore = (job: Job, resumeData: any): number => {
  // Simple implementation for now
  const jobSkills = job.skills || [];
  const resumeSkills = resumeData.skills || [];
  
  const technicalJobSkills = jobSkills.filter(skill => 
    isTechnicalSkill(skill)
  );
  
  if (technicalJobSkills.length === 0) {
    return 50; // Neutral if no technical skills in job
  }
  
  const matchingTechSkills = technicalJobSkills.filter(skill => 
    resumeSkills.some(resumeSkill => 
      resumeSkill.toLowerCase() === skill.toLowerCase()
    )
  );
  
  return Math.min(Math.round((matchingTechSkills.length / technicalJobSkills.length) * 100), 100);
};

/**
 * Calculate soft skills score
 */
const calculateSoftSkillsScore = (job: Job, resumeData: any): number => {
  // Simple implementation - can be expanded later
  return 70; // Default moderate match
};

/**
 * Calculate education score
 */
const calculateEducationScore = (job: Job, resumeData: any): number => {
  // Simple implementation - can be expanded later
  return 80; // Default good match
};

/**
 * Calculate experience score
 */
const calculateExperienceScore = (job: Job, resumeData: any): number => {
  // Simple implementation - can be expanded later
  return 75; // Default good match
};

/**
 * Check if a skill is a technical skill
 */
const isTechnicalSkill = (skill: string): boolean => {
  const technicalKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c#', 'c++', 'php', 'ruby', 'go',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'less', 'bootstrap', 'tailwind',
    'sql', 'mysql', 'postgresql', 'mongodb', 'nosql', 'redis', 'database',
    'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
    'git', 'cicd', 'jenkins', 'github actions',
    'rest', 'graphql', 'api'
  ];
  
  return technicalKeywords.some(keyword => 
    skill.toLowerCase().includes(keyword)
  );
};
