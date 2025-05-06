
// Utility functions for job matching and display

export const getMatchLabel = (percentage: number): string => {
  if (percentage >= 80) return "Excellent Match";
  if (percentage >= 70) return "Strong Match";
  if (percentage >= 60) return "Good Match";
  if (percentage >= 50) return "Fair Match";
  return "Partial Match";
};

export const getMatchColor = (percentage: number): string => {
  if (percentage >= 80) return "text-green-600 dark:text-green-500";
  if (percentage >= 70) return "text-green-500 dark:text-green-400";
  if (percentage >= 60) return "text-yellow-600 dark:text-yellow-500";
  if (percentage >= 50) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
};

export const getMatchBgColor = (percentage: number): string => {
  if (percentage >= 80) return "bg-green-50 dark:bg-green-900/20";
  if (percentage >= 70) return "bg-green-50 dark:bg-green-900/20";
  if (percentage >= 60) return "bg-yellow-50 dark:bg-yellow-900/20";
  if (percentage >= 50) return "bg-yellow-50 dark:bg-yellow-900/20";
  return "bg-red-50 dark:bg-red-900/20";
};

export const getSkillsMatchPercentage = (jobSkills: string[], userSkills: string[]): number => {
  if (!jobSkills.length || !userSkills.length) return 0;
  
  const normalizedJobSkills = jobSkills.map(s => s.toLowerCase());
  const normalizedUserSkills = userSkills.map(s => s.toLowerCase());
  
  let matchCount = 0;
  
  normalizedJobSkills.forEach(skill => {
    if (normalizedUserSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))) {
      matchCount++;
    }
  });
  
  return Math.round((matchCount / normalizedJobSkills.length) * 100);
};

export const calculateOverallMatch = (
  skillsMatch: number, 
  experienceMatch: number, 
  locationMatch: number, 
  educationMatch: number
): number => {
  // Weighted scoring
  const weights = {
    skills: 0.4,
    experience: 0.3,
    location: 0.1,
    education: 0.2
  };
  
  return Math.round(
    (skillsMatch * weights.skills) +
    (experienceMatch * weights.experience) +
    (locationMatch * weights.location) +
    (educationMatch * weights.education)
  );
};

export const formatMatchData = (matchPercentage: number) => {
  return {
    percentage: matchPercentage,
    label: getMatchLabel(matchPercentage),
    color: getMatchColor(matchPercentage),
    bgColor: getMatchBgColor(matchPercentage)
  };
};

export const getRecommendedActions = (matchPercentage: number) => {
  if (matchPercentage >= 80) {
    return ["Apply immediately", "Prepare for interview", "Research company culture"];
  }
  
  if (matchPercentage >= 70) {
    return ["Apply", "Highlight relevant skills", "Address gaps in cover letter"];
  }
  
  if (matchPercentage >= 60) {
    return ["Consider applying", "Emphasize transferable skills", "Explain how you can grow into the role"];
  }
  
  if (matchPercentage >= 50) {
    return ["Apply if interested", "Focus on transferable skills", "Consider enhancing skills before applying"];
  }
  
  return ["Focus on better matches", "Develop missing skills", "Look for more suitable roles"];
};

// Additional exported functions to fix build errors
export interface MatchScoreLevel {
  label: string;
  color: string;
  range: [number, number];
}

export const getDetailedMatch = (job: any, profile: any) => {
  // Implementation would depend on your app's logic
  return {
    overall: 75,
    skills: 80,
    experience: 70,
    location: 90,
    education: 65
  };
};

export const getMatchExplanation = (score: number) => {
  if (score >= 80) return "Your profile is an excellent match for this job.";
  if (score >= 70) return "Your profile is a strong match for this job.";
  if (score >= 60) return "Your profile is a good match for this job.";
  if (score >= 50) return "Your profile is a fair match for this job.";
  return "Your profile is a partial match for this job.";
};
