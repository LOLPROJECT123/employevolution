
/**
 * Utility functions for validating job URLs and checking job availability
 */

/**
 * Validates a job URL by attempting to fetch it and checking the response status
 */
export async function validateJobUrl(url: string): Promise<boolean> {
  try {
    // Check if the URL is valid
    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return false;
    }
    
    // Set a timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow',
      signal: controller.signal,
      mode: 'no-cors' // Allow cross-origin requests without CORS
    });
    
    clearTimeout(timeoutId);
    
    // Check if the response is valid
    return response.status >= 200 && response.status < 400;
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
}

/**
 * Detects which job platform a URL belongs to
 */
export function detectPlatform(url: string | undefined): string | null {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('monster.com')) return 'Monster';
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('workday')) return 'Workday';
  if (lowerUrl.includes('icims.com')) return 'iCims';
  if (lowerUrl.includes('jobvite.com')) return 'Jobvite';
  if (lowerUrl.includes('taleo.net')) return 'Taleo';
  if (lowerUrl.includes('brassring.com')) return 'BrassRing';
  if (lowerUrl.includes('smartrecruiters.com')) return 'SmartRecruiters';
  if (lowerUrl.includes('wellfound.com')) return 'Wellfound';
  if (lowerUrl.includes('dice.com')) return 'Dice';
  if (lowerUrl.includes('careerbuilder.com')) return 'CareerBuilder';
  
  return null;
}

/**
 * Checks if a job posting is still available
 */
export async function checkJobAvailability(job: { applyUrl?: string }): Promise<boolean> {
  if (!job.applyUrl) return false;
  
  return await validateJobUrl(job.applyUrl);
}

/**
 * Extracts job ID from URL based on platform patterns
 */
export function extractJobIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const platform = detectPlatform(url);
    
    // Platform-specific extraction
    if (platform === 'LinkedIn') {
      // LinkedIn URLs format: linkedin.com/jobs/view/JOBID
      const matches = url.match(/\/jobs\/view\/(\d+)/);
      if (matches && matches[1]) return matches[1];
    } 
    else if (platform === 'Indeed') {
      // Indeed URLs format: indeed.com/viewjob?jk=JOBID
      return urlObj.searchParams.get('jk') || null;
    }
    else if (platform === 'Greenhouse') {
      // Greenhouse URLs: greenhouse.io/company/job/JOBID
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || null;
    }
    else if (platform === 'Lever') {
      // Lever URLs: jobs.lever.co/company/JOBID
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || null;
    }
    
    // Generic extraction approach
    const pathParts = urlObj.pathname.split('/');
    
    // Look for "job" or "jobs" in the path
    const jobIndex = pathParts.findIndex(part => 
      part === 'job' || part === 'jobs' || part === 'position' || part === 'posting');
    
    if (jobIndex >= 0 && jobIndex < pathParts.length - 1) {
      return pathParts[jobIndex + 1];
    }
    
    // Try to extract from query params
    const jobId = urlObj.searchParams.get('jobId') || 
                 urlObj.searchParams.get('id') || 
                 urlObj.searchParams.get('job');
    
    if (jobId) return jobId;
    
    // Last resort: just return the last part of the path
    return pathParts[pathParts.length - 1] || null;
  } catch (e) {
    console.error("Error extracting job ID:", e);
    return null;
  }
}

/**
 * Normalizes a job URL to its canonical form
 */
export function normalizeJobUrl(url: string): string {
  try {
    // If URL doesn't start with http or https, add https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObj = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (e) {
    console.error("Error normalizing URL:", e);
    return url;
  }
}
