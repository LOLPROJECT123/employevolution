
/**
 * Extensions to the Job type to support job matching and additional features
 */

import { Job } from "@/types/job";
import { SkillMatch } from "@/utils/jobMatching";

// Extended version of Job with match details
export interface ExtendedJob extends Job {
  matchPercentage?: number;
  matchDetails?: {
    skillMatches?: SkillMatch[];
    missingSkills?: string[];
    extraSkills?: string[];
    technicalSkillsScore?: number;
    softSkillsScore?: number;
    educationScore?: number;
    experienceScore?: number;
  };
  appliedAt?: string | null;
  status?: string;
  savedAt?: string;
  logo?: string;
  jobType?: string;
}

// Type for a job posting with additional analytics
export interface JobWithAnalytics extends ExtendedJob {
  analytics?: {
    views: number;
    applicants: number;
    favorites: number;
    datePosted: string;
    timeToFill?: number;
  };
}

// Type for profile-based job recommendations
export interface JobRecommendation {
  job: ExtendedJob;
  reason: string;
  score: number;
  sourceType: 'skills' | 'experience' | 'education' | 'location' | 'industry' | 'career-path';
}
