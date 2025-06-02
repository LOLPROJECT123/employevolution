
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

export const detectPlatform = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('linkedin.com')) return 'linkedin';
    if (hostname.includes('indeed.com')) return 'indeed';
    if (hostname.includes('glassdoor.com')) return 'glassdoor';
    if (hostname.includes('monster.com')) return 'monster';
    if (hostname.includes('ziprecruiter.com')) return 'ziprecruiter';
    if (hostname.includes('careerbuilder.com')) return 'careerbuilder';
    if (hostname.includes('dice.com')) return 'dice';
    if (hostname.includes('stackoverflow.com')) return 'stackoverflow';
    
    return 'other';
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

export const normalizeJobUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    // Remove common tracking parameters
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'source'];
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    return urlObj.toString();
  } catch {
    return url;
  }
};

export const generateAtsUrlTemplate = (companyName: string, atsType: string): string => {
  const company = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const templates: Record<string, string> = {
    greenhouse: `https://boards.greenhouse.io/${company}`,
    workday: `https://${company}.wd5.myworkdayjobs.com/en-US/External`,
    lever: `https://jobs.lever.co/${company}`,
    taleo: `https://${company}.taleo.net/careersection/2/jobsearch.ftl`,
    icims: `https://careers-${company}.icims.com/jobs/search`,
    smartrecruiters: `https://jobs.smartrecruiters.com/${companyName}`,
    bamboohr: `https://${company}.bamboohr.com/jobs/`,
    jazzhr: `https://${company}.jazzhr.com/apply`,
    jobvite: `https://jobs.jobvite.com/${company}`,
    bullhorn: `https://${company}.bullhornstaffing.com/jobs`,
    zoho: `https://recruit.zoho.com/${company}/jobs/Careers`,
    avature: `https://${company}.avature.net/careers`,
    recruitee: `https://${company}.recruitee.com/`,
    breezy: `https://${company}.breezy.hr/`,
    freshteam: `https://${company}.freshteam.com/jobs`
  };
  
  return templates[atsType] || `https://${company}.com/careers`;
};
