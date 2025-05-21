
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
 * Detects which job platform or ATS a URL belongs to
 */
export function detectPlatform(url: string | undefined): string | null {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  // Major job boards
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('monster.com')) return 'Monster';
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter';
  
  // Common ATS platforms
  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('workday')) return 'Workday';
  if (lowerUrl.includes('icims.com')) return 'iCims';
  if (lowerUrl.includes('jobvite.com')) return 'Jobvite';
  if (lowerUrl.includes('taleo.net')) return 'Taleo';
  if (lowerUrl.includes('brassring.com')) return 'BrassRing';
  if (lowerUrl.includes('smartrecruiters.com')) return 'SmartRecruiters';
  if (lowerUrl.includes('bamboohr.com')) return 'BambooHR';
  if (lowerUrl.includes('recruitee.com')) return 'Recruitee';
  if (lowerUrl.includes('jazzhr.com')) return 'JazzHR';
  if (lowerUrl.includes('zoho.com/recruit')) return 'Zoho Recruit';
  if (lowerUrl.includes('avature.net')) return 'Avature';
  if (lowerUrl.includes('ashbyhq.com')) return 'Ashby';
  if (lowerUrl.includes('myworkdayjobs.com')) return 'Workday';
  if (lowerUrl.includes('breezy.hr')) return 'Breezy HR';
  if (lowerUrl.includes('freshteam.com')) return 'Freshteam';
  if (lowerUrl.includes('successfactors.')) return 'SAP SuccessFactors';
  
  // Tech job boards
  if (lowerUrl.includes('wellfound.com')) return 'Wellfound';
  if (lowerUrl.includes('dice.com')) return 'Dice';
  if (lowerUrl.includes('careerbuilder.com')) return 'CareerBuilder';
  if (lowerUrl.includes('stackoverflow.com/jobs')) return 'Stack Overflow';
  if (lowerUrl.includes('github.com/jobs')) return 'GitHub Jobs';
  if (lowerUrl.includes('ycombinator.com/jobs')) return 'Y Combinator';
  if (lowerUrl.includes('angel.co')) return 'AngelList';
  if (lowerUrl.includes('weworkremotely.com')) return 'We Work Remotely';
  if (lowerUrl.includes('remote.co')) return 'Remote.co';
  if (lowerUrl.includes('remoteok.io')) return 'RemoteOK';
  if (lowerUrl.includes('simplify.jobs')) return 'Simplify';
  if (lowerUrl.includes('levels.fyi/jobs')) return 'Levels.fyi';
  if (lowerUrl.includes('techjobsforgood.com')) return 'Tech Jobs for Good';
  if (lowerUrl.includes('remotive.io')) return 'Remotive';
  
  // Company career pages for major tech companies
  if (lowerUrl.includes('careers.google.com')) return 'Google Careers';
  if (lowerUrl.includes('careers.microsoft.com')) return 'Microsoft Careers';
  if (lowerUrl.includes('amazon.jobs')) return 'Amazon Jobs';
  if (lowerUrl.includes('apple.com/careers')) return 'Apple Careers';
  if (lowerUrl.includes('meta.com/careers')) return 'Meta Careers';
  if (lowerUrl.includes('netflix.jobs')) return 'Netflix Jobs';
  
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
    else if (platform === 'Workday') {
      // Workday URLs: company.wd5.myworkdayjobs.com/en-US/External/job/Location/Title_JOBID
      const pathParts = urlObj.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1] || '';
      const matches = lastPart.match(/.*_(\w+)$/);
      return matches && matches[1] ? matches[1] : lastPart;
    }
    else if (platform === 'iCims') {
      // iCIMS URLs: careers-company.icims.com/jobs/JOBID/job
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.includes('jobs') && pathParts.length > pathParts.indexOf('jobs') + 1) {
        return pathParts[pathParts.indexOf('jobs') + 1];
      }
    }
    else if (platform === 'Taleo') {
      // Taleo URLs: company.taleo.net/careersection/2/jobdetail.ftl?job=JOBID
      return urlObj.searchParams.get('job') || null;
    }
    else if (platform === 'Google Careers') {
      // Google careers: careers.google.com/jobs/results/JOBID
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.includes('results')) {
        const resultIndex = pathParts.indexOf('results');
        if (resultIndex >= 0 && resultIndex < pathParts.length - 1) {
          return pathParts[resultIndex + 1];
        }
      }
    }
    else if (platform === 'SmartRecruiters') {
      // SmartRecruiters URLs: jobs.smartrecruiters.com/Company/JOBID
      const pathParts = urlObj.pathname.split('/');
      return pathParts[pathParts.length - 1] || null;
    }
    else if (platform === 'BrassRing') {
      // BrassRing URLs: company.brassring.com/TGnewUI/Search/home/HomeWithPreLoad?JobID=JOBID
      return urlObj.searchParams.get('JobID') || null;
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
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'referrer', 'source',
      'trk', 'trkCampaign', 'sc_campaign', 'mkt_tok'
    ];
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (e) {
    console.error("Error normalizing URL:", e);
    return url;
  }
}

/**
 * Determines if a job posting is outdated based on its post date
 */
export function isJobOutdated(postedDate: string | Date, maxAgeDays: number = 30): boolean {
  try {
    const postDate = postedDate instanceof Date ? postedDate : new Date(postedDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > maxAgeDays;
  } catch (e) {
    console.error("Error checking job age:", e);
    return false;
  }
}

/**
 * Extracts the company name from a job URL
 */
export function extractCompanyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const platform = detectPlatform(url);
    
    // For common job boards, extract from path or query
    if (platform === 'LinkedIn') {
      const companyParam = urlObj.searchParams.get('company');
      if (companyParam) return companyParam;
      
      // Try to extract from path for company pages
      if (urlObj.pathname.includes('/company/')) {
        const matches = urlObj.pathname.match(/\/company\/([^\/]+)/);
        if (matches && matches[1]) return matches[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'Greenhouse') {
      // Greenhouse URLs: greenhouse.io/companyname/job/position or job-boards.greenhouse.io/companyname
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 1) {
        return pathParts[1].replace(/-/g, ' ');
      }
      // Handle job-boards.greenhouse.io domain
      if (hostname.includes('job-boards.greenhouse.io')) {
        return pathParts[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'Lever') {
      // Lever URLs: jobs.lever.co/companyname/position
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 1) {
        return pathParts[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'Workday') {
      // Workday URLs: companyname.wd5.myworkdayjobs.com
      const matches = hostname.match(/^([^\.]+)\.wd\d+\.myworkdayjobs/);
      if (matches && matches[1]) {
        return matches[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'iCims') {
      // iCIMS URLs: careers-companyname.icims.com
      const matches = hostname.match(/^careers-([^\.]+)\.icims\.com/);
      if (matches && matches[1]) {
        return matches[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'Taleo') {
      // Taleo URLs: companyname.taleo.net
      const matches = hostname.match(/^([^\.]+)\.taleo\.net/);
      if (matches && matches[1]) {
        return matches[1].replace(/-/g, ' ');
      }
    }
    else if (platform === 'SmartRecruiters') {
      // SmartRecruiters URLs: jobs.smartrecruiters.com/CompanyName
      const pathParts = urlObj.pathname.split('/');
      if (pathParts.length > 1) {
        return pathParts[1].replace(/([A-Z])/g, ' $1').trim();
      }
    }
    
    // Handle company career sites
    // Extract company name from subdomain (common pattern)
    const subdomainMatch = hostname.match(/^(?:www\.|careers\.|jobs\.|)([^.]+)\./i);
    if (subdomainMatch && subdomainMatch[1] && !['jobs', 'careers', 'www', 'apply'].includes(subdomainMatch[1].toLowerCase())) {
      return subdomainMatch[1].replace(/-/g, ' ');
    }
    
    // Extract from domain without TLD (last resort)
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      // Return the main domain part without common TLDs
      const mainDomain = domainParts[domainParts.length - 2];
      return mainDomain !== 'co' ? mainDomain : domainParts[domainParts.length - 3] || null;
    }
    
    return null;
  } catch (e) {
    console.error("Error extracting company from URL:", e);
    return null;
  }
}

/**
 * Estimates time to apply for a job based on application platform
 */
export function estimateApplicationTime(url: string): number {
  // Returns estimated minutes to complete application
  const platform = detectPlatform(url);
  
  // Quick apply platforms
  if (platform === 'LinkedIn' && url.includes('easy-apply')) return 5;
  if (platform === 'Indeed' && url.includes('indeedapply')) return 7;
  if (platform === 'ZipRecruiter' && url.includes('quick-apply')) return 6;
  
  // Complex application systems usually take longer
  if (platform === 'Workday') return 25;
  if (platform === 'Taleo') return 30;
  if (platform === 'iCims') return 20;
  if (platform === 'BrassRing') return 22;
  if (platform === 'SuccessFactors') return 28;
  
  // Medium complexity
  if (platform === 'Greenhouse') return 15;
  if (platform === 'Lever') return 12;
  if (platform === 'SmartRecruiters') return 18;
  if (platform === 'Jobvite') return 17;
  
  // Simpler application systems
  if (platform === 'BambooHR') return 10;
  if (platform === 'JazzHR') return 12;
  if (platform === 'Recruitee') return 8;
  if (platform === 'Breezy HR') return 8;
  if (platform === 'Freshteam') return 9;
  
  // Default case - average time
  return 15;
}

/**
 * Generates a generic ATS URL template for a company name
 */
export function generateAtsUrlTemplate(company: string, atsType: string): string {
  // Normalize company name for URL usage
  const normalizedCompany = company.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  switch (atsType.toLowerCase()) {
    case 'greenhouse':
      return `https://boards.greenhouse.io/${normalizedCompany}`;
    case 'lever':
      return `https://jobs.lever.co/${normalizedCompany}`;
    case 'workday':
      return `https://${normalizedCompany}.wd5.myworkdayjobs.com/en-US/External`;
    case 'icims':
      return `https://careers-${normalizedCompany}.icims.com/jobs/search`;
    case 'taleo':
      return `https://${normalizedCompany}.taleo.net/careersection/2/jobsearch.ftl`;
    case 'smartrecruiters':
      return `https://jobs.smartrecruiters.com/${company.replace(/\s+/g, '')}`;
    default:
      return '';
  }
}

/**
 * Batch validates multiple job URLs efficiently
 */
export async function batchValidateUrls(urls: string[]): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  // Process in chunks to avoid overwhelming the browser
  const chunkSize = 5;
  for (let i = 0; i < urls.length; i += chunkSize) {
    const chunk = urls.slice(i, i + chunkSize);
    
    // Process chunk in parallel
    const chunkResults = await Promise.all(
      chunk.map(async url => {
        const isValid = await validateJobUrl(url);
        return { url, isValid };
      })
    );
    
    // Collect results
    chunkResults.forEach(({ url, isValid }) => {
      results[url] = isValid;
    });
    
    // Small delay between chunks to be polite to servers
    if (i + chunkSize < urls.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
}

/**
 * Detects if a URL is for an ATS system and returns its type
 */
export function detectAtsSystem(url: string): string | null {
  const platform = detectPlatform(url);
  
  // If it's one of our recognized ATS platforms, return it
  if (['Greenhouse', 'Lever', 'Workday', 'iCims', 'Taleo', 'SmartRecruiters', 
       'BrassRing', 'BambooHR', 'JazzHR', 'Recruitee', 'Breezy HR', 'Freshteam',
       'Jobvite', 'SAP SuccessFactors', 'Ashby', 'Avature', 'Zoho Recruit'].includes(platform || '')) {
    return platform;
  }
  
  return null;
}

/**
 * Generate the company name variation for ATS URL templates
 */
export function generateCompanyNameVariations(companyName: string): string[] {
  const variations: string[] = [];
  
  // Original name
  variations.push(companyName);
  
  // Lowercase with dashes
  variations.push(companyName.toLowerCase().replace(/\s+/g, '-'));
  
  // Lowercase with no spaces
  variations.push(companyName.toLowerCase().replace(/\s+/g, ''));
  
  // Remove non-alphanumeric characters
  const alphanumeric = companyName.replace(/[^a-zA-Z0-9\s]/g, '');
  variations.push(alphanumeric.toLowerCase().replace(/\s+/g, '-'));
  
  // Acronym (using first letter of each word)
  const acronym = companyName.split(/\s+/).map(word => word[0]).join('').toLowerCase();
  if (acronym.length > 1) {
    variations.push(acronym);
  }
  
  return [...new Set(variations)]; // Remove duplicates
}
