
// Validate and potentially fix URL
export const validateUrl = (url: string): boolean | string => {
  if (!url) return false;
  
  try {
    // Try to create a URL object to validate
    new URL(url);
    return true;
  } catch (e) {
    // If it fails, check if it might be missing the protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      try {
        new URL('https://' + url);
        return 'https://' + url;
      } catch (e) {
        return false;
      }
    }
    return false;
  }
};

// Extract job ID from URL if present
export const extractJobId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
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
    return pathParts[pathParts.length - 1];
  } catch (e) {
    console.error("Error extracting job ID:", e);
    return null;
  }
};
