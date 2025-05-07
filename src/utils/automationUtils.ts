
import { toast } from "sonner";

export type AutomationPlatform = 'handshake' | 'linkedin' | 'indeed' | 'glassdoor';

export interface AutomationCredentials {
  enabled: boolean;
  username?: string;
  password: string;
  email: string;
  platform: AutomationPlatform;
}

export interface AutomationProfile {
  name: string;
  title?: string;
  location: string;
  skills?: string[];
  experience: string;
  education?: string[];
  email: string;
  phone: string;
  currentlyEmployed: boolean;
  needVisa: boolean;
  yearsOfCoding: number;
  languagesKnown: string[];
  codingLanguagesKnown: string[];
  
  // Extended profile fields
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  university?: string;
  hasCriminalRecord?: boolean;
  needsSponsorship?: boolean;
  willingToRelocate?: boolean;
  workAuthorized?: boolean;
  isCitizen?: boolean;
  educationLevel?: string;
  salaryExpectation?: string;
  gender?: 'Male' | 'Female' | 'Decline';
  veteranStatus?: 'Yes' | 'No' | 'Decline';
  disabilityStatus?: 'Yes' | 'No' | 'Decline';
  canCommute?: boolean;
  preferredShift?: 'Day shift' | 'Night shift' | 'Overnight shift';
  availableForInterview?: string;
}

export interface IndeedSettings {
  autoApplyEasyApply: boolean;
  skipAssessments: boolean;
  autoUploadResume: boolean;
}

export interface AutomationConfig {
  credentials: AutomationCredentials;
  profile: AutomationProfile;
  indeed?: IndeedSettings;
  linkedin?: {
    autoApplyEasyApply: boolean;
  };
  handshake?: {
    autoApply: boolean;
  };
  platformSpecificSettings?: {
    indeed?: {
      experienceYears?: {
        java?: string;
        aws?: string;
        python?: string;
        analysis?: string;
        django?: string;
        php?: string;
        react?: string;
        node?: string;
        angular?: string;
        javascript?: string;
        orm?: string;
        sdet?: string;
        selenium?: string;
        testautomation?: string;
        webdev?: string;
        programming?: string;
        teaching?: string;
        default?: string;
      };
      applicationSettings?: {
        loadDelay?: number;
        hasDBS?: boolean;
        hasValidCertificate?: boolean;
      };
    };
  };
}

/**
 * Detect which platform a job URL belongs to
 */
export const detectPlatform = (url: string): string | null => {
  if (!url) return null;
  
  try {
    const hostname = new URL(url).hostname;
    
    if (hostname.includes('indeed.com')) return 'Indeed';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('handshake.com') || hostname.includes('joinhandshake.com')) return 'Handshake';
    if (hostname.includes('ziprecruiter.com')) return 'ZipRecruiter';
    if (hostname.includes('monster.com')) return 'Monster';
    if (hostname.includes('glassdoor.com')) return 'Glassdoor';
    
    return null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};

/**
 * Start automation process for a specific job URL
 */
export const startAutomation = (url: string, config: AutomationConfig) => {
  const platform = detectPlatform(url);
  
  if (!platform) {
    toast.error('Unsupported platform for automation');
    return;
  }
  
  switch (platform) {
    case 'Indeed':
      console.log('Running Indeed automation script');
      const indeedScript = getIndeedAutomationScript(url, config);
      executeAutomationScript(indeedScript);
      break;
      
    case 'LinkedIn':
      console.log('Running LinkedIn automation script');
      // LinkedIn automation logic would go here
      break;
      
    case 'Handshake':
      console.log('Running Handshake automation script');
      const handshakeScript = getHandshakeAutomationScript(url, config);
      executeAutomationScript(handshakeScript);
      break;
      
    default:
      toast.error(`Automation not yet supported for ${platform}`);
      break;
  }
};

/**
 * Generate Indeed automation script
 */
export const getIndeedAutomationScript = (url: string, config: AutomationConfig): string => {
  const { credentials, profile, indeed } = config;
  
  return `
    // Indeed Automation Script
    // URL: ${url}
    // Config: ${JSON.stringify({ credentials, profile, indeed })}
    
    (async () => {
      try {
        console.log("Starting Indeed application automation");
        
        // Navigate to job page
        window.location.href = "${url}";
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Find and click apply button
        const applyButton = document.querySelector('button[id*="apply"], a[id*="apply"]');
        if (applyButton) {
          applyButton.click();
          console.log("Clicked apply button");
        } else {
          console.error("Could not find apply button");
          return;
        }
        
        // Wait for application form to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Fill in basic information if needed
        const nameInput = document.querySelector('input[id*="name"]');
        if (nameInput && nameInput.value === "") {
          nameInput.value = "${profile.name}";
          nameInput.dispatchEvent(new Event('input', { bubbles: true }));
          nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log("Filled in name");
        }
        
        const emailInput = document.querySelector('input[type="email"]');
        if (emailInput && emailInput.value === "") {
          emailInput.value = "${credentials.email}";
          emailInput.dispatchEvent(new Event('input', { bubbles: true }));
          emailInput.dispatchEvent(new Event('change', { bubbles: true }));
          console.log("Filled in email");
        }
        
        // Auto upload resume if enabled
        if (${indeed?.autoUploadResume ?? false}) {
          const resumeUpload = document.querySelector('input[type="file"][accept*=".pdf"]');
          if (resumeUpload) {
            console.log("Found resume upload but need manual intervention");
            // Cannot programmatically set file input due to security restrictions
          }
        }
        
        // Skip assessments if enabled
        if (${indeed?.skipAssessments ?? false}) {
          const skipButtons = document.querySelectorAll('button:contains("Skip")');
          skipButtons.forEach(button => button.click());
          console.log("Attempted to skip assessments");
        }
        
        console.log("Indeed automation completed");
      } catch (error) {
        console.error("Error during Indeed automation:", error);
      }
    })();
  `;
};

/**
 * Generate Handshake automation script
 */
export const getHandshakeAutomationScript = (url: string, config: AutomationConfig): string => {
  const { credentials, profile } = config;
  
  return `
    // Handshake Automation Script
    // URL: ${url}
    // Config: ${JSON.stringify({ credentials, profile })}
    
    (async () => {
      try {
        console.log("Starting Handshake application automation");
        
        // Navigate to job page
        window.location.href = "${url}";
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Find and click apply button
        const applyButton = document.querySelector('a[data-test="job-detail-apply"]');
        if (applyButton) {
          applyButton.click();
          console.log("Clicked apply button");
        } else {
          console.error("Could not find apply button");
          return;
        }
        
        // Wait for application form to load
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log("Handshake automation completed");
      } catch (error) {
        console.error("Error during Handshake automation:", error);
      }
    })();
  `;
};

/**
 * Execute automation script
 */
const executeAutomationScript = (script: string) => {
  try {
    // In a real implementation, this would communicate with a browser extension
    // For demo purposes, we'll just log the script
    console.log("Automation script to execute:", script);
    
    // Simulate sending to extension
    window.postMessage({
      type: 'EXECUTE_AUTOMATION',
      script
    }, '*');
    
    toast.success("Automation script sent to extension");
  } catch (error) {
    console.error("Error executing automation script:", error);
    toast.error("Failed to execute automation script");
  }
};
