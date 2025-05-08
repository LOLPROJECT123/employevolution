
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
  if (!percentage && percentage !== 0) return "bg-gray-100 dark:bg-gray-800";
  if (percentage >= 85) return "bg-emerald-50 dark:bg-emerald-900/30";
  if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
  if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
  return "bg-red-50 dark:bg-red-900/30";
};

/**
 * Get text color for match percentage display
 */
export const getMatchColor = (percentage?: number) => {
  if (!percentage && percentage !== 0) return "";
  if (percentage >= 85) return "text-emerald-500";
  if (percentage >= 70) return "text-green-500";
  if (percentage >= 50) return "text-amber-500";
  return "text-red-500";
};

/**
 * Get label for match percentage display
 */
export const getMatchLabel = (percentage?: number) => {
  if (!percentage && percentage !== 0) return "";
  if (percentage >= 85) return "EXCELLENT MATCH";
  if (percentage >= 70) return "GOOD MATCH";
  if (percentage >= 50) return "FAIR MATCH";
  return "WEAK MATCH";
};

/**
 * Get detailed match information
 * The overallScore is now exactly the percentage of job-required skills matched by userSkills.
 */
export const getDetailedMatch = (job: Job, userSkills: string[] = []): ComprehensiveMatch => {
  // Normalize skills for case-insensitive comparison
  const normalizedUserSkills = userSkills.map(skill => skill.toLowerCase());
  const normalizedJobSkills = job.skills?.map(skill => skill.toLowerCase()) || [];
  
  // Skills calculation
  const skillMatches: SkillMatch[] = [];
  const missingSkills: string[] = [];

  if (job.skills) {
    for (let i = 0; i < job.skills.length; i++) {
      const skill = job.skills[i];
      const normalizedSkill = skill.toLowerCase();
      const isMatched = normalizedUserSkills.includes(normalizedSkill);
      
      // We consider all skills equally important for basic matching
      const isHighPriority = false;
      
      if (isMatched) {
        skillMatches.push({ skill, matched: true, isHighPriority });
      } else {
        missingSkills.push(skill);
      }
    }
  }

  // Calculate skill score - percentage of required skills that the user has
  const skillScore = job.skills && job.skills.length > 0
    ? Math.round((skillMatches.length / job.skills.length) * 100)
    : 100;

  // The following sections exist for display only; they all reflect the skill score
  const experienceMatch: ExperienceMatch = {
    matched: true,
    matchPercentage: skillScore, // Use the same score for consistency
    details: "Experience match is based on your skills match."
  };

  const educationMatch: EducationMatch = {
    matched: true,
    details: "Education match is based on your skills match."
  };

  const locationMatch: LocationMatch = {
    matched: true,
    distance: 0,
    details: "Location is not considered in this match calculation."
  };

  // The overall score is now exactly the skill match percentage
  const overallScore = skillScore;

  return {
    overallScore,
    matchLevel: getMatchLevel(overallScore),
    skills: {
      matched: skillMatches,
      missing: missingSkills,
      extras: normalizedUserSkills.filter(skill => 
        !normalizedJobSkills.includes(skill)
      ).map(skill => {
        // Find the original case from user's skills
        const originalCaseIndex = userSkills.findIndex(
          s => s.toLowerCase() === skill
        );
        return originalCaseIndex >= 0 ? userSkills[originalCaseIndex] : skill;
      }),
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
 */
export const getMatchExplanation = (match: ComprehensiveMatch): string => {
  if (match.overallScore >= 85) {
    return `You have ${match.overallScore}% of the required skills for this job.`;
  } else if (match.overallScore >= 70) {
    return `You have ${match.overallScore}% of the required skills for this job.`;
  } else if (match.overallScore >= 50) {
    return `You have ${match.overallScore}% of the required skills for this job.`;
  } else {
    // Special case for 0% match
    if (match.overallScore === 0) {
      return `You have none of the required skills for this job.`;
    }
    return `You have only ${match.overallScore}% of the required skills for this job.`;
  }
};
