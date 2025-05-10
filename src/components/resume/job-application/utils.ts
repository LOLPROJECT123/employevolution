
/**
 * Validate and potentially fix a URL string
 */
export const validateUrl = (url: string): string | boolean => {
  if (!url.trim()) return false;
  
  try {
    // If the URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    // Try to create a URL object to validate
    new URL(url);
    return url;
  } catch (error) {
    console.error("Invalid URL:", error);
    return false;
  }
};

/**
 * Extract a job ID from various job platform URLs
 */
export const extractJobId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    
    // LinkedIn job URLs: /jobs/view/JOBID
    if (urlObj.hostname.includes('linkedin.com')) {
      const matches = urlObj.pathname.match(/\/jobs\/view\/(\d+)/);
      if (matches && matches[1]) return `linkedin-${matches[1]}`;
    }
    
    // Indeed job URLs: /viewjob?jk=JOBID
    if (urlObj.hostname.includes('indeed.com')) {
      const jk = urlObj.searchParams.get('jk');
      if (jk) return `indeed-${jk}`;
    }
    
    // Greenhouse job URLs: /j/JOBID
    if (urlObj.hostname.includes('greenhouse.io')) {
      const matches = urlObj.pathname.match(/\/j\/([^\/]+)/);
      if (matches && matches[1]) return `greenhouse-${matches[1]}`;
    }
    
    // Lever job URLs: /jobs/JOBID
    if (urlObj.hostname.includes('lever.co')) {
      const matches = urlObj.pathname.match(/\/jobs\/([^\/]+)/);
      if (matches && matches[1]) return `lever-${matches[1]}`;
    }
    
    // If no specific format matches, use the path as a fallback
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      return `job-${pathParts[pathParts.length - 1]}`;
    }
    
    return null;
  } catch (error) {
    console.error("Error extracting job ID:", error);
    return null;
  }
};
