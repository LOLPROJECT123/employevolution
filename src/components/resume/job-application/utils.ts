
import { normalizeJobUrl, extractJobIdFromUrl } from "@/utils/jobValidationUtils";

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
  return extractJobIdFromUrl(url);
};

// Clean and normalize job application URL
export const cleanJobUrl = (url: string): string => {
  return normalizeJobUrl(url);
};

// Generate a unique job ID if one doesn't exist
export const generateJobId = (company: string, title: string, url?: string): string => {
  if (url) {
    const extractedId = extractJobId(url);
    if (extractedId) return extractedId;
  }
  
  // Create a deterministic ID from job info
  const baseString = `${company}-${title}-${url || ''}`;
  let hash = 0;
  
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to a positive hex string
  return Math.abs(hash).toString(16);
};
