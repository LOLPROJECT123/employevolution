
/**
 * Utility functions for job application automation
 */

import { toast } from "sonner";
import { detectJobPlatform } from "./jobUrlUtils";

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
 * Start automation process for a specific job URL
 */
export const startAutomation = (url: string, config: AutomationConfig) => {
  const platform = detectJobPlatform(url);
  
  if (!platform) {
    toast.error('Unsupported platform for automation');
    return;
  }
  
  // Check if browser extension is available
  const extensionAvailable = typeof chrome !== 'undefined' && chrome.runtime?.id;
  
  if (!extensionAvailable) {
    toast({
      title: "Browser extension not detected",
      description: "Please install the Streamline extension to enable automation",
      action: {
        label: "Get Extension",
        onClick: () => window.open("https://chrome.google.com/webstore/detail/streamline-extension", "_blank")
      }
    });
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
      const linkedinScript = getLinkedInAutomationScript(url, config);
      executeAutomationScript(linkedinScript);
      break;
      
    case 'Handshake':
      console.log('Running Handshake automation script');
      const handshakeScript = getHandshakeAutomationScript(url, config);
      executeAutomationScript(handshakeScript);
      break;
      
    case 'Glassdoor':
      console.log('Running Glassdoor automation script');
      const glassdoorScript = getGlassdoorAutomationScript(url, config);
      executeAutomationScript(glassdoorScript);
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
 * Generate LinkedIn automation script
 */
export const getLinkedInAutomationScript = (url: string, config: AutomationConfig): string => {
  const { credentials, profile, linkedin } = config;
  
  return `
    // LinkedIn Automation Script
    // URL: ${url}
    // Config: ${JSON.stringify({ credentials, profile, linkedin })}
    
    (async () => {
      try {
        console.log("Starting LinkedIn application automation");
        
        // Navigate to job page
        window.location.href = "${url}";
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Check if this is an Easy Apply job
        const easyApplyButton = document.querySelector('.jobs-apply-button');
        if (easyApplyButton) {
          easyApplyButton.click();
          console.log("Clicked Easy Apply button");
          
          // Wait for modal to open
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Let the extension know we're on an Easy Apply form
          window.postMessage({
            type: 'LINKEDIN_EASY_APPLY',
            profile: ${JSON.stringify(profile)}
          }, '*');
          
          // Fill in phone number if needed
          const phoneInput = document.querySelector('input[name="phoneNumber"]');
          if (phoneInput) {
            phoneInput.value = "${profile.phone}";
            phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
            phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log("Filled in phone number");
          }
          
          // Click continue/submit buttons
          const continueButtons = Array.from(document.querySelectorAll('button')).filter(
            button => button.textContent?.includes('Continue') || button.textContent?.includes('Submit')
          );
          
          if (continueButtons.length > 0) {
            continueButtons[0].click();
            console.log("Clicked continue button");
          }
        } else {
          console.log("Not an Easy Apply job, redirecting to external application");
          
          // Find and click the apply button (which might redirect to external site)
          const applyButton = document.querySelector('button[data-control-name="jobdetails_apply"]');
          if (applyButton) {
            applyButton.click();
            console.log("Clicked external apply button");
          }
        }
        
        console.log("LinkedIn automation completed");
      } catch (error) {
        console.error("Error during LinkedIn automation:", error);
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
 * Generate Glassdoor automation script
 */
export const getGlassdoorAutomationScript = (url: string, config: AutomationConfig): string => {
  const { credentials, profile } = config;
  
  return `
    // Glassdoor Automation Script
    // URL: ${url}
    // Config: ${JSON.stringify({ credentials, profile })}
    
    (async () => {
      try {
        console.log("Starting Glassdoor application automation");
        
        // Navigate to job page
        window.location.href = "${url}";
        
        // Wait for page to load
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Find and click apply button
        const applyButton = document.querySelector('button[data-test="apply-button"], a[data-test="apply-button"]');
        if (applyButton) {
          applyButton.click();
          console.log("Clicked apply button");
        } else {
          console.error("Could not find apply button");
          return;
        }
        
        // Wait for application form to load or redirect
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if we're still on Glassdoor (Easy Apply) or redirected
        const isRedirected = !window.location.href.includes('glassdoor.com');
        
        if (!isRedirected) {
          // Fill in form fields for Glassdoor Easy Apply
          const nameInput = document.querySelector('input[name="fullName"]');
          if (nameInput) {
            nameInput.value = "${profile.name}";
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
            nameInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          const emailInput = document.querySelector('input[name="email"]');
          if (emailInput) {
            emailInput.value = "${profile.email}";
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            emailInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
          
          const phoneInput = document.querySelector('input[name="phoneNumber"]');
          if (phoneInput) {
            phoneInput.value = "${profile.phone}";
            phoneInput.dispatchEvent(new Event('input', { bubbles: true }));
            phoneInput.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
        
        console.log("Glassdoor automation completed");
      } catch (error) {
        console.error("Error during Glassdoor automation:", error);
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
    console.log("Sending automation script to extension");
    
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
