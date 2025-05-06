
import { Job } from "./job";

/**
 * Extended Job interface with additional properties for match results
 */
export interface ExtendedJob extends Job {
  matchPercentage?: number;
  matchDetails?: {
    skillMatches?: Array<{ skill: string; matched: boolean }>;
    missingSkills?: string[];
    extraSkills?: string[];
    technicalSkillsScore?: number;
    softSkillsScore?: number;
    educationScore?: number;
    experienceScore?: number;
    locationScore?: number;
  };
  // Additional properties needed by the UI
  status?: string;
  appliedAt?: string;
  logo?: string;
  jobType?: string;
  savedAt?: string;
  interviewDate?: string;
}
