
export const validateJobUrl = async (url: string): Promise<boolean> => {
  if (!url) return false;
  
  try {
    // Check if URL is valid
    new URL(url);
    
    // For demonstration purposes, we'll simulate a validation check
    // In a real implementation, you would make a request to check if the URL is accessible
    const response = await fetch(url, { 
      method: 'HEAD',
      mode: 'no-cors' // This will be limited due to CORS, but demonstrates the pattern
    });
    
    return true; // Assume valid for demo purposes
  } catch (error) {
    console.error('URL validation error:', error);
    return false;
  }
};

export const extractJobIdFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/');
    
    // Common patterns for job URLs
    const jobIdPatterns = [
      /\/jobs?\/(\d+)/,
      /\/job\/([a-zA-Z0-9-_]+)/,
      /\/posting\/(\d+)/,
      /\/careers\/(\d+)/
    ];
    
    for (const pattern of jobIdPatterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

export const generateJobSlug = (title: string, company: string): string => {
  const combined = `${title}-${company}`;
  return combined
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};
