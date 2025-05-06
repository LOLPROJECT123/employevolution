
export interface ValidatedJob {
  isValid: boolean;
  url?: string;
  error?: string;
}

export async function validateJobUrl(url: string): Promise<ValidatedJob> {
  try {
    // Add request timeout to avoid long waits
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { 
      method: 'HEAD',
      redirect: 'follow',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Consider 2xx and 3xx status codes as valid
    if (response.status >= 200 && response.status < 400) {
      return {
        isValid: true,
        url
      };
    }
    
    return {
      isValid: false,
      error: `Invalid status code: ${response.status}`
    };
    
  } catch (error) {
    console.error('URL validation error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error validating URL'
    };
  }
}

export function detectJobPlatform(url: string): string | null {
  if (!url) return null;
  
  if (url.includes('linkedin.com/jobs')) return 'linkedin';
  if (url.includes('indeed.com/jobs') || url.includes('indeed.com/search')) return 'indeed';
  if (url.includes('glassdoor.com')) return 'glassdoor';
  if (url.includes('apple.com/careers')) return 'apple';
  if (url.includes('microsoft.com/careers')) return 'microsoft';
  if (url.includes('amazon.jobs')) return 'amazon';
  if (url.includes('google.com/careers')) return 'google';
  
  return null;
}
