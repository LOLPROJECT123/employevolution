
// Utility functions for job application automation

// Function to detect which platform a job URL belongs to
export const detectPlatform = (url: string): string | null => {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('google.com') || lowerUrl.includes('careers.google')) return 'Google';
  if (lowerUrl.includes('microsoft.com') || lowerUrl.includes('careers.microsoft')) return 'Microsoft';
  if (lowerUrl.includes('apple.com') || lowerUrl.includes('jobs.apple')) return 'Apple';
  if (lowerUrl.includes('amazon.jobs') || lowerUrl.includes('amazon.com/jobs')) return 'Amazon';
  if (lowerUrl.includes('meta.com') || lowerUrl.includes('metacareers')) return 'Meta';
  if (lowerUrl.includes('netflix.com') || lowerUrl.includes('jobs.netflix')) return 'Netflix';
  if (lowerUrl.includes('uber.com/careers') || lowerUrl.includes('uber.com/us/en/careers')) return 'Uber';
  if (lowerUrl.includes('airbnb.com/careers') || lowerUrl.includes('careers.airbnb')) return 'Airbnb';
  if (lowerUrl.includes('twitter.com/careers') || lowerUrl.includes('careers.twitter')) return 'Twitter';
  if (lowerUrl.includes('linkedin.com/jobs') || lowerUrl.includes('careers.linkedin')) return 'LinkedIn';
  
  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('workday')) return 'Workday';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('taleo')) return 'Taleo';
  if (lowerUrl.includes('icims')) return 'iCIMS';
  if (lowerUrl.includes('brassring')) return 'BrassRing';
  if (lowerUrl.includes('smartrecruiters')) return 'SmartRecruiters';
  if (lowerUrl.includes('jobvite')) return 'Jobvite';
  
  return null; // Unknown platform
};

// Function to start automation with the Chrome extension
export const startAutomation = (
  jobUrl: string, 
  config: any
): void => {
  // Check if the Chrome extension is available
  if (typeof window !== 'undefined' && 
      window.chrome?.runtime?.sendMessage) {
    try {
      // Send message to Chrome extension to start automation
      window.chrome.runtime.sendMessage({
        action: 'startJobAutomation',
        data: {
          url: jobUrl,
          config: config
        }
      }, (response) => {
        console.log('Automation response:', response);
      });
    } catch (error) {
      console.error('Error starting automation:', error);
    }
  } else {
    console.log('Chrome extension not available');
    // Fallback - open the URL in a new tab
    window.open(jobUrl, '_blank', 'noopener,noreferrer');
  }
};

// Function to check if Chrome extension is installed and connected
export const checkExtensionConnection = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && 
        window.chrome?.runtime?.sendMessage) {
      try {
        window.chrome.runtime.sendMessage({
          action: 'ping'
        }, (response) => {
          if (response && response.status === 'success') {
            resolve(true);
          } else {
            resolve(false);
          }
        });
        
        // Set a timeout in case the extension doesn't respond
        setTimeout(() => {
          resolve(false);
        }, 1000);
      } catch (error) {
        console.error('Error checking extension connection:', error);
        resolve(false);
      }
    } else {
      resolve(false);
    }
  });
};

// Additional automation utilities
export const getApplicantDetails = () => {
  // Get applicant details from localStorage or context
  try {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      return JSON.parse(profileData);
    }
  } catch (error) {
    console.error('Error getting applicant details:', error);
  }
  
  // Return default profile if none found
  return {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    resume: ''
  };
};

// Function to save automation settings
export const saveAutomationSettings = (settings: any): void => {
  try {
    localStorage.setItem('automationConfig', JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving automation settings:', error);
  }
};

// Function to get automation settings
export const getAutomationSettings = (): any => {
  try {
    const settings = localStorage.getItem('automationConfig');
    if (settings) {
      return JSON.parse(settings);
    }
  } catch (error) {
    console.error('Error getting automation settings:', error);
  }
  
  return null;
};
