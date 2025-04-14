
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
 * Get detailed match information
 * (In a real app, this would compare job requirements against user profile)
 */
export const getDetailedMatch = (job: Job, userSkills: string[] = []): ComprehensiveMatch => {
  // Simulate skill matching
  const skillMatches: SkillMatch[] = [];
  const missingSkills: string[] = [];
  
  // For this example, we'll use random skill matching
  // In a real app, this would compare against the user's profile
  if (job.skills) {
    for (const skill of job.skills) {
      const isMatched = userSkills.includes(skill) || Math.random() > 0.3;
      const isHighPriority = Math.random() > 0.5;
      
      if (isMatched) {
        skillMatches.push({
          skill,
          matched: true,
          isHighPriority
        });
      } else {
        missingSkills.push(skill);
      }
    }
  }
  
  // Calculate skill match score
  const skillScore = job.skills && job.skills.length > 0
    ? Math.round((skillMatches.length / job.skills.length) * 100)
    : 100;
  
  // Simulate experience match
  const experienceMatch: ExperienceMatch = {
    matched: Math.random() > 0.4,
    matchPercentage: Math.floor(Math.random() * 40) + 60,
    details: "Your experience aligns with job requirements"
  };
  
  // Simulate education match
  const educationMatch: EducationMatch = {
    matched: Math.random() > 0.3,
    details: "You have the required education level"
  };
  
  // Simulate location match
  const locationMatch: LocationMatch = {
    matched: job.remote || Math.random() > 0.2,
    distance: Math.floor(Math.random() * 30),
    details: job.remote ? "Remote job" : `Within commuting distance`
  };
  
  // Determine overall score based on job.matchPercentage or calculate from components
  const overallScore = job.matchPercentage || Math.round(
    (skillScore * 0.4) +
    (experienceMatch.matchPercentage * 0.3) +
    (educationMatch.matched ? 15 : 0) +
    (locationMatch.matched ? 15 : 0)
  );
  
  // Return comprehensive match data
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
    salaryMatch: Math.random() > 0.2 // Simulate salary match
  };
};

/**
 * Generate a short explanation of why this job matches
 */
export const getMatchExplanation = (match: ComprehensiveMatch): string => {
  if (match.overallScore >= 85) {
    return "This job is an excellent match for your profile based on skills, experience, and other factors.";
  } else if (match.overallScore >= 70) {
    return "This job is a good match for your profile, with strong alignment in key areas.";
  } else if (match.overallScore >= 50) {
    return "This job is a fair match for your profile, with some areas of alignment.";
  } else {
    return "This job is not a strong match for your profile but may still be worth considering.";
  }
};
