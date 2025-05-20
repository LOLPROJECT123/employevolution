
/**
 * Get a human-readable match label based on percentage
 */
export const getMatchLabel = (percentage?: number): string => {
  if (!percentage) return "Unknown Match";
  if (percentage >= 90) return "Excellent Match";
  if (percentage >= 80) return "Strong Match";
  if (percentage >= 70) return "Good Match";
  if (percentage >= 60) return "Fair Match";
  return "Low Match";
};

/**
 * Get color class for match percentage
 */
export const getMatchColor = (percentage?: number): string => {
  if (!percentage) return "text-gray-500";
  if (percentage >= 80) return "text-green-500";
  if (percentage >= 60) return "text-amber-500";
  return "text-red-500";
};

/**
 * Get background color class for match percentage
 */
export const getMatchBgColor = (percentage?: number): string => {
  if (!percentage) return "bg-gray-100 dark:bg-gray-800";
  if (percentage >= 80) return "bg-green-50 dark:bg-green-900/30";
  if (percentage >= 60) return "bg-amber-50 dark:bg-amber-900/30";
  return "bg-red-50 dark:bg-red-900/30";
};

/**
 * Calculate job match score against a candidate profile
 * Note: In a real app, this would compare against the user's actual profile
 */
export const calculateJobMatch = (job: any, userProfile: any = null): number => {
  // This is a placeholder implementation
  // In a real app, this would do actual scoring based on user's skills, experience, etc.
  
  // For this demo, we'll use the match score if provided, or generate a random one
  if (job.matchPercentage) {
    return job.matchPercentage;
  }
  
  // Generate a somewhat realistic score (biased toward higher matches for better UX)
  return Math.floor(Math.random() * 30) + 70; // 70-99
};

/**
 * Calculate detailed match criteria
 */
export const calculateMatchCriteria = (job: any, userProfile: any = null): Record<string, boolean> => {
  // Again, this is a placeholder
  // In a real app, this would check actual criteria against the user profile
  
  return {
    skills: Math.random() > 0.3,      // 70% chance of skills match
    experience: Math.random() > 0.4,  // 60% chance of experience match
    education: Math.random() > 0.2,   // 80% chance of education match
    location: Math.random() > 0.5     // 50% chance of location match
  };
};

/**
 * Calculate keyword match details
 */
export const calculateKeywordMatch = (job: any, userProfile: any = null): any => {
  // This would normally analyze job description against user's skills and experience
  // For the demo, we'll generate realistic-looking data
  
  if (job.keywordMatch) {
    return job.keywordMatch;
  }
  
  const totalKeywords = Math.floor(Math.random() * 10) + 8; // 8-18
  const foundKeywords = Math.floor(totalKeywords * (Math.random() * 0.5 + 0.5)); // 50-100% match
  
  const score = Math.floor((foundKeywords / totalKeywords) * 100);
  
  // Generate some realistic keywords based on job role
  const generateKeywords = () => {
    const techKeywords = ["Python", "JavaScript", "TypeScript", "React", "Node.js", "AWS", "Docker", "Kubernetes", "SQL", "MongoDB", "Git", "CI/CD"];
    const financeKeywords = ["C++", "Python", "KDB/Q", "SQL", "Finance", "Trading Systems", "Risk Analysis", "Algorithms", "FPGA", "Low Latency"];
    
    // Determine if this is likely a finance job
    const isFinanceJob = job.title?.toLowerCase().includes("quant") || 
                        job.title?.toLowerCase().includes("trading") ||
                        job.company?.toLowerCase().includes("capital") ||
                        job.company?.toLowerCase().includes("trading");
    
    return isFinanceJob ? financeKeywords : techKeywords;
  };
  
  const allKeywords = generateKeywords();
  const highPriorityCount = Math.min(5, Math.floor(allKeywords.length / 2));
  const highPriorityKeywords = allKeywords.slice(0, highPriorityCount);
  const lowPriorityKeywords = allKeywords.slice(highPriorityCount);
  
  const highPriorityFound = Math.floor(highPriorityCount * (Math.random() * 0.6 + 0.4)); // 40-100% match
  const lowPriorityFound = Math.floor(lowPriorityKeywords.length * (Math.random() * 0.7 + 0.3)); // 30-100% match
  
  return {
    score,
    total: totalKeywords,
    found: highPriorityFound + lowPriorityFound,
    highPriority: {
      keywords: highPriorityKeywords,
      found: highPriorityFound,
      total: highPriorityCount
    },
    lowPriority: {
      keywords: lowPriorityKeywords,
      found: lowPriorityFound,
      total: lowPriorityKeywords.length
    }
  };
};
