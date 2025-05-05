
/**
 * Job Matching System - Export all components for easy imports
 */

export { JobRequirementsAnalyzer, type JobRequirements } from './JobRequirementsAnalyzer';
export { ResumeSkillsExtractor, type ExtractedSkill } from './ResumeSkillsExtractor';
export { JobMatchCalculator, type JobMatchResult, type SkillMatch } from './JobMatchCalculator';
import { ExtendedJob } from '@/types/jobExtensions';

// Helper function to calculate job match for a given job and resume
import { JobMatchCalculator } from './JobMatchCalculator';
import { Job } from '@/types/job';
import { ParsedResume } from '@/types/resume';

/**
 * Calculate match percentage between a job and a resume
 * Returns the match percentage and details
 */
export function calculateJobMatch(job: Job, resume: ParsedResume) {
  const calculator = new JobMatchCalculator();
  return calculator.calculateMatchPercentage(job, resume);
}

/**
 * Update job object with match percentage
 * This is useful for displaying match % in job listings
 */
export function addMatchPercentageToJob(job: Job, resume: ParsedResume): ExtendedJob {
  const matchResult = calculateJobMatch(job, resume);
  
  // Create an ExtendedJob object with the match information
  const enhancedJob: ExtendedJob = {
    ...job,
    matchPercentage: matchResult.matchPercentage,
    matchDetails: {
      skillMatches: matchResult.skillMatches,
      missingSkills: matchResult.missingSkills,
      extraSkills: matchResult.extraSkills,
      technicalSkillsScore: matchResult.details.technicalSkillsScore,
      softSkillsScore: matchResult.details.softSkillsScore,
      educationScore: matchResult.details.educationScore,
      experienceScore: matchResult.details.experienceScore
    }
  } as ExtendedJob;
  
  return enhancedJob;
}

/**
 * Updates job array with match percentages
 * Sorts jobs by match percentage (highest first)
 */
export function addMatchPercentagesToJobs(jobs: Job[], resume: ParsedResume): ExtendedJob[] {
  return jobs
    .map(job => addMatchPercentageToJob(job, resume))
    .sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
}
