
import { Job } from "@/types/job";
import { getDetailedMatch, SkillMatch } from "@/utils/jobMatchingUtils";

/**
 * Advanced job matching algorithm with NLP-inspired techniques
 * This provides more nuanced matching than the basic skill comparison
 */
export interface ApplicationScoreDetails {
  overallScore: number;
  skillScore: number;
  experienceScore: number;
  educationScore: number;
  locationScore: number;
  keywordMatches: Array<{keyword: string, count: number}>;
  improvementSuggestions: string[];
}

/**
 * Calculate a detailed application score based on resume data and job posting
 */
export function calculateApplicationScore(
  job: Job, 
  userSkills: string[] = [], 
  userExperience: number = 0,
  userEducation: string[] = [],
  userLocation: string = ""
): ApplicationScoreDetails {
  // Get basic match details
  const matchDetails = getDetailedMatch(job, userSkills);
  
  // Calculate more specific scores
  const skillScore = matchDetails.skills.score;
  
  // Experience score based on years vs required (simple algorithm)
  let experienceScore = 100;
  if (job.level === 'senior' && userExperience < 5) {
    experienceScore = Math.min(100, userExperience * 20);
  } else if (job.level === 'mid' && userExperience < 3) {
    experienceScore = Math.min(100, userExperience * 33);
  } else if (job.level === 'entry' && userExperience < 1) {
    experienceScore = Math.min(100, userExperience * 100);
  }
  
  // Education score based on requirements
  let educationScore = 100;
  if (job.education && job.education.length > 0 && userEducation.length > 0) {
    // Simple matching algorithm that checks if education requirements are met
    const educationMatch = job.education.some(reqEdu => 
      userEducation.some(edu => edu.toLowerCase().includes(reqEdu.toLowerCase()))
    );
    educationScore = educationMatch ? 100 : 50;
  }
  
  // Location score
  let locationScore = 100;
  if (job.location && userLocation && !job.remote) {
    // Simple check if location contains user's preferred location
    const locationMatch = job.location.toLowerCase().includes(userLocation.toLowerCase()) || 
                          userLocation.toLowerCase().includes(job.location.toLowerCase());
    locationScore = locationMatch ? 100 : 
                   (job.workModel === 'hybrid' ? 75 : 50);
  }
  
  // Extract keyword matches from job description
  const keywordMatches = extractKeywordMatches(job.description, userSkills);
  
  // Generate improvement suggestions
  const improvementSuggestions = generateImprovementSuggestions(
    job, 
    matchDetails.skills.missing, 
    experienceScore, 
    educationScore, 
    locationScore
  );
  
  // Final weighted score calculation
  const overallScore = Math.round(
    (skillScore * 0.40) +  // Skills are most important
    (experienceScore * 0.30) +  // Experience is second most important
    (educationScore * 0.20) +  // Education is third
    (locationScore * 0.10)  // Location is least important if remote work is possible
  );
  
  return {
    overallScore,
    skillScore,
    experienceScore,
    educationScore,
    locationScore,
    keywordMatches,
    improvementSuggestions
  };
}

/**
 * Extract keyword matches from job description
 */
function extractKeywordMatches(description: string = "", userSkills: string[] = []): Array<{keyword: string, count: number}> {
  if (!description || userSkills.length === 0) {
    return [];
  }
  
  const matches: Array<{keyword: string, count: number}> = [];
  const descLower = description.toLowerCase();
  
  userSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    // Count occurrences of skill in the description
    const regex = new RegExp(`\\b${skillLower}\\b`, 'gi');
    const matches_array = descLower.match(regex);
    const count = matches_array ? matches_array.length : 0;
    
    if (count > 0) {
      matches.push({ keyword: skill, count });
    }
  });
  
  // Sort by count (highest first)
  return matches.sort((a, b) => b.count - a.count);
}

/**
 * Generate improvement suggestions based on job match analysis
 */
function generateImprovementSuggestions(
  job: Job, 
  missingSkills: string[], 
  experienceScore: number, 
  educationScore: number, 
  locationScore: number
): string[] {
  const suggestions: string[] = [];
  
  // Skill-based suggestions
  if (missingSkills.length > 0) {
    suggestions.push(`Consider adding these skills to your resume: ${missingSkills.slice(0, 3).join(', ')}${missingSkills.length > 3 ? '...' : ''}`);
  }
  
  // Experience-based suggestions
  if (experienceScore < 70) {
    suggestions.push(`Highlight more relevant experience for ${job.level}-level positions`);
  }
  
  // Education-based suggestions
  if (educationScore < 70 && job.education && job.education.length > 0) {
    suggestions.push(`This role may require education in: ${job.education.join(', ')}`);
  }
  
  // Location-based suggestions
  if (locationScore < 70 && !job.remote) {
    suggestions.push(`This role is based in ${job.location} and may not be remote-friendly`);
  }
  
  return suggestions;
}

/**
 * Format the application score as a human-readable grade
 */
export function scoreToGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 85) return "A";
  if (score >= 80) return "A-";
  if (score >= 75) return "B+";
  if (score >= 70) return "B";
  if (score >= 65) return "B-";
  if (score >= 60) return "C+";
  if (score >= 55) return "C";
  if (score >= 50) return "C-";
  if (score >= 45) return "D+";
  if (score >= 40) return "D";
  return "F";
}
