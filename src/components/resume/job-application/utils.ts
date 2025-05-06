
// Utility functions for job application scraper and form

/**
 * Validates a job URL and returns a corrected version if needed
 */
export const validateUrl = (url: string): string | boolean => {
  if (!url.trim()) {
    return false;
  }

  // Add https:// if missing
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }

  try {
    new URL(url);
    return url;
  } catch (e) {
    return false;
  }
};

/**
 * Extracts a job ID from a job URL
 */
export const extractJobId = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    
    // For LinkedIn
    if (url.includes('linkedin.com')) {
      const pathSegments = parsedUrl.pathname.split('/');
      // LinkedIn job IDs are usually the last segment in the URL
      return pathSegments[pathSegments.length - 1] || null;
    }
    
    // For Indeed
    if (url.includes('indeed.com')) {
      // Indeed uses jk parameter in the URL
      return parsedUrl.searchParams.get('jk') || null;
    }
    
    // For Greenhouse
    if (url.includes('greenhouse.io')) {
      const pathSegments = parsedUrl.pathname.split('/');
      // Usually the job ID is the last segment
      return pathSegments[pathSegments.length - 1] || null;
    }
    
    // For Lever
    if (url.includes('lever.co')) {
      const pathSegments = parsedUrl.pathname.split('/');
      // Lever typically has the job ID in the format /company/job-id
      return pathSegments.length > 2 ? pathSegments[pathSegments.length - 1] : null;
    }
    
    // Default: try to find any numeric ID in the path
    const match = parsedUrl.pathname.match(/\d+/);
    return match ? match[0] : null;
    
  } catch (error) {
    console.error("Error extracting job ID:", error);
    return null;
  }
};

/**
 * Determines if a job URL is from a supported platform
 */
export const isSupportedJobPlatform = (url: string): boolean => {
  const supportedDomains = [
    'linkedin.com',
    'indeed.com',
    'glassdoor.com',
    'monster.com',
    'ziprecruiter.com',
    'dice.com',
    'lever.co',
    'greenhouse.io',
    'workday.com',
    'taleo.',
    'jobvite.com',
    'icims.com',
    'smartrecruiters.com'
  ];
  
  return supportedDomains.some(domain => url.includes(domain));
};

/**
 * Counts keyword matches between a job description and a resume
 */
export const countKeywordMatches = (
  jobDescription: string,
  resumeText: string,
  keywords: string[] = []
): { count: number, total: number, matches: string[] } => {
  if (!jobDescription || !resumeText) {
    return { count: 0, total: 0, matches: [] };
  }
  
  // Default keywords to look for if none provided
  const defaultKeywords = [
    'javascript', 'python', 'react', 'node', 'typescript', 'angular', 'vue',
    'java', 'c#', 'c++', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'php',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'serverless', 'devops',
    'frontend', 'backend', 'fullstack', 'api', 'rest', 'graphql', 'database',
    'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'agile', 'scrum'
  ];
  
  const keywordsToCheck = keywords.length > 0 ? keywords : defaultKeywords;
  const jobDescLower = jobDescription.toLowerCase();
  const resumeLower = resumeText.toLowerCase();
  
  let count = 0;
  const matches: string[] = [];
  
  keywordsToCheck.forEach(keyword => {
    const keywordLower = keyword.toLowerCase();
    if (jobDescLower.includes(keywordLower) && resumeLower.includes(keywordLower)) {
      count++;
      matches.push(keyword);
    }
  });
  
  return {
    count,
    total: keywordsToCheck.length,
    matches
  };
};
