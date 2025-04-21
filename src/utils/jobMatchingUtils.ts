import { Job } from "@/types/job";

/**
 * Enhanced job matching utilities for better job-to-candidate matching
 */

// Match score levels
export enum MatchScoreLevel {
  Excellent = "excellent",
  Good = "good",
  Fair = "fair",
  Weak = "weak"
}

// Types for skill matching
export interface SkillMatch {
  skill: string;
  matched: boolean;
  isHighPriority: boolean;
}

export interface EducationMatch {
  matched: boolean;
  details: string;
}

export interface ExperienceMatch {
  matched: boolean;
  matchPercentage: number;
  details: string;
}

export interface LocationMatch {
  matched: boolean;
  distance?: number;
  details: string;
}

export interface ComprehensiveMatch {
  overallScore: number;
  matchLevel: MatchScoreLevel;
  skills: {
    matched: SkillMatch[];
    missing: string[];
    extras: string[];
    score: number;
  };
  experience: ExperienceMatch;
  education: EducationMatch;
  location: LocationMatch;
  salaryMatch: boolean;
}

/**
 * Get the match level based on percentage
 */
export const getMatchLevel = (percentage: number): MatchScoreLevel => {
  if (percentage >= 85) return MatchScoreLevel.Excellent;
  if (percentage >= 70) return MatchScoreLevel.Good;
  if (percentage >= 50) return MatchScoreLevel.Fair;
  return MatchScoreLevel.Weak;
};

/**
 * Get background color for match percentage display
 */
export const getMatchBgColor = (percentage?: number) => {
  if (!percentage) return "bg-gray-100 dark:bg-gray-800";
  if (percentage >= 85) return "bg-emerald-50 dark:bg-emerald-900/30";
  if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
  if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
  return "bg-red-50 dark:bg-red-900/30";
};

/**
 * Get text color for match percentage display
 */
export const getMatchColor = (percentage?: number) => {
  if (!percentage) return "";
  if (percentage >= 85) return "text-emerald-500";
  if (percentage >= 70) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-red-500";
};

/**
 * Get label for match percentage display
 */
export const getMatchLabel = (percentage?: number) => {
  if (!percentage) return "";
  if (percentage >= 85) return "EXCELLENT MATCH";
  if (percentage >= 70) return "GOOD MATCH";
  if (percentage >= 50) return "FAIR MATCH";
  return "WEAK MATCH";
};

/**
 * Generate a deterministic random number between 0 and 1 based on a string
 * This ensures the same input always produces the same output
 */
function deterministicRandom(str: string, index = 0): number {
  // Simple hash function for strings
  let hash = 0;
  const baseStr = str + index.toString();
  for (let i = 0; i < baseStr.length; i++) {
    const char = baseStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Normalize to [0, 1]
  return (Math.abs(hash) % 1000) / 1000;
}

/**
 * Get detailed match information
 * Now, overallScore and skills.score will be exactly the percentage of job-required skills matched by userSkills.
 */
export const getDetailedMatch = (job: Job, userSkills: string[] = []): ComprehensiveMatch => {
  const jobId = job.id || "default";

  // Skills calculation
  const skillMatches: SkillMatch[] = [];
  const missingSkills: string[] = [];

  if (job.skills) {
    for (const skill of job.skills) {
      const isMatched = userSkills.includes(skill);
      // Use deterministic value for isHighPriority if you want
      const isHighPriority = false;
      if (isMatched) {
        skillMatches.push({ skill, matched: true, isHighPriority });
      } else {
        missingSkills.push(skill);
      }
    }
  }

  // Percent skills matched (used for score everywhere now)
  const skillScore = job.skills && job.skills.length > 0
    ? Math.round((skillMatches.length / job.skills.length) * 100)
    : 100;

  // The following sections exist for display only; don't contribute to main score
  const experienceMatch: ExperienceMatch = {
    matched: true,
    matchPercentage: skillScore,
    details: "Experience sections are not considered in score for this view."
  };

  const educationMatch: EducationMatch = {
    matched: true,
    details: "Education sections are not considered in score for this view."
  };

  const locationMatch: LocationMatch = {
    matched: true,
    distance: 0,
    details: "Location is not considered in score for this view."
  };

  const overallScore = skillScore;

  return {
    overallScore,
    matchLevel: getMatchLevel(overallScore),
    skills: {
      matched: skillMatches,
      missing: missingSkills,
      extras: userSkills.filter(skill => !job.skills?.includes(skill)),
      score: skillScore
    },
    experience: experienceMatch,
    education: educationMatch,
    location: locationMatch,
    salaryMatch: true
  };
};

/**
 * Generate a short explanation of why this job matches
 * (tailored to emphasize skills only)
 */
export const getMatchExplanation = (match: ComprehensiveMatch): string => {
  if (match.overallScore >= 85) {
    return "Your skills closely match the requirements for this job.";
  } else if (match.overallScore >= 70) {
    return "Your skills match this job well.";
  } else if (match.overallScore >= 50) {
    return "You meet some of the required job skills.";
  } else {
    return "You are missing many of the required skills for this job.";
  }
};
