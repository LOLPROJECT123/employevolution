
/**
 * Utility functions for validating job URLs and checking job availability
 */

/**
 * Validates a job URL by attempting to fetch it and checking the response status
 */
export async function validateJobUrl(url: string): Promise<boolean> {
  try {
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
  
  return null;
}

/**
 * Checks if a job posting is still available
 */
export async function checkJobAvailability(job: { applyUrl?: string }): Promise<boolean> {
  if (!job.applyUrl) return false;
  
  return await validateJobUrl(job.applyUrl);
}

