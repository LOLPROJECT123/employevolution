
/**
 * Job Application Automation Utilities
 */

type AutomationConfig = {
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  education?: any[];
  experience?: any[];
  skills?: string[];
  coverLetterTemplate?: string;
  preferences?: {
    autoFillPersonal: boolean;
    autoFillEducation: boolean;
    autoFillExperience: boolean;
    autoFillSkills: boolean;
    autoGenerateCoverLetter: boolean;
    applyWithoutConfirmation: boolean;
  }
};

/**
 * Start the automation process for a job application
 */
export function startAutomation(applyUrl: string, config: AutomationConfig): void {
  if (!applyUrl) {
    console.error("No apply URL provided");
    return;
  }
  
  if (!config) {
    console.error("No automation configuration provided");
    return;
  }
  
  // In production, this would communicate with a browser extension
  // For now, we'll just post a message that the extension can listen for
  window.postMessage({
    type: 'START_AUTOMATION',
    payload: {
      url: applyUrl,
      config
    }
  }, '*');
  
  // Log the automation start
  console.log(`Automation started for URL: ${applyUrl}`);
  console.log("Using config:", config);
  
  // Open the URL in a new tab (the extension would handle the automation)
  window.open(applyUrl, '_blank');
}

/**
 * Save automation configuration to local storage
 */
export function saveAutomationConfig(config: AutomationConfig): void {
  localStorage.setItem('automationConfig', JSON.stringify(config));
  console.log("Automation configuration saved");
}

/**
 * Get saved automation configuration
 */
export function getAutomationConfig(): AutomationConfig | null {
  const configStr = localStorage.getItem('automationConfig');
  if (!configStr) return null;
  
  try {
    return JSON.parse(configStr);
  } catch (error) {
    console.error("Error parsing automation config:", error);
    return null;
  }
}

/**
 * Check if the Streamline extension is installed
 */
export function checkExtensionInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    // Set a timeout in case we don't get a response
    const timeout = setTimeout(() => resolve(false), 500);
    
    // Add an event listener for the response
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'EXTENSION_INSTALLED') {
        clearTimeout(timeout);
        window.removeEventListener('message', handleMessage);
        resolve(true);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Send a message to check if the extension is installed
    window.postMessage({ type: 'CHECK_EXTENSION_INSTALLED' }, '*');
  });
}
