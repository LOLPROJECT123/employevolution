
/**
 * Utility functions for job URL parsing, validation, and status checking
 */

/**
 * Parse and extract information from a job URL
 */
export function parseJobUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const platform = detectJobPlatform(url);
    
    return {
      hostname,
      platform,
      isValid: true,
      path: parsedUrl.pathname,
      query: parsedUrl.search,
    };
  } catch (error) {
    console.error("Error parsing URL:", error);
    return {
      isValid: false,
      hostname: "",
      platform: null,
      path: "",
      query: "",
    };
  }
}

/**
 * Detect which job platform a URL belongs to
 */
export function detectJobPlatform(url: string): string | null {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  // Major job boards
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('handshake.com')) return 'Handshake';
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (lowerUrl.includes('monster.com')) return 'Monster';
  
  // Company career sites
  if (lowerUrl.includes('careers.google.com')) return 'Google Careers';
  if (lowerUrl.includes('metacareers.com')) return 'Meta Careers';
  if (lowerUrl.includes('amazon.jobs')) return 'Amazon Jobs';
  if (lowerUrl.includes('jobs.apple.com')) return 'Apple Careers';
  
  return null;
}

/**
 * Format a URL for display (shortened, readable format)
 */
export function getDisplayUrl(url: string, maxLength: number = 30): string {
  try {
    if (!url) return '';
    
    const { hostname, path } = parseJobUrl(url);
    const displayPath = path.length > 20 ? path.substring(0, 17) + '...' : path;
    const displayUrl = `${hostname}${displayPath}`;
    
    if (displayUrl.length > maxLength) {
      return displayUrl.substring(0, maxLength - 3) + '...';
    }
    
    return displayUrl;
  } catch (error) {
    console.error("Error creating display URL:", error);
    return url.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Check if a URL is a valid job posting URL
 */
export function isValidJobUrl(url: string): boolean {
  try {
    const parsed = parseJobUrl(url);
    return parsed.isValid && !!parsed.platform;
  } catch (error) {
    return false;
  }
}

/**
 * Check the status of a job URL (if it's still active)
 */
export async function checkJobUrlStatus(url: string): Promise<{ 
  valid: boolean; 
  message?: string; 
  fallbackUrl?: string;
}> {
  try {
    // In a real implementation, we would actually check if the URL is still valid
    // For demo purposes, we'll simulate with a random result
    const platform = detectJobPlatform(url);
    const isValid = Math.random() > 0.2; // 80% chance the URL is valid
    
    if (isValid) {
      return {
        valid: true
      };
    }
    
    // If not valid, provide a fallback URL and message
    const fallbackUrl = getCompanyCareerPage(url);
    return {
      valid: false,
      message: "This job posting is no longer available",
      fallbackUrl
    };
  } catch (error) {
    console.error("Error checking job URL status:", error);
    return {
      valid: false,
      message: "Could not verify job URL status",
      fallbackUrl: getCompanyCareerPage(url)
    };
  }
}

/**
 * Get the main careers page URL for a company
 */
export function getCompanyCareerPage(url: string): string {
  try {
    const platform = detectJobPlatform(url);
    const { hostname } = parseJobUrl(url);
    
    // Return platform-specific career pages
    if (platform === 'LinkedIn') return 'https://www.linkedin.com/jobs/';
    if (platform === 'Indeed') return 'https://www.indeed.com/jobs';
    if (platform === 'Glassdoor') return 'https://www.glassdoor.com/Jobs/';
    if (platform === 'Google Careers') return 'https://careers.google.com/';
    if (platform === 'Meta Careers') return 'https://www.metacareers.com/';
    if (platform === 'Amazon Jobs') return 'https://www.amazon.jobs/';
    if (platform === 'Apple Careers') return 'https://www.apple.com/careers/';
    
    // Generate a fallback URL based on the hostname
    return `https://${hostname}`;
  } catch (error) {
    console.error("Error generating company career page URL:", error);
    return 'https://www.linkedin.com/jobs/';
  }
}
