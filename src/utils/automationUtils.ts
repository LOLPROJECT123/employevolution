
// This file contains interfaces and types related to job application automation
// The actual automation runs via a browser extension or desktop app to avoid security limitations

export type AutomationPlatform = 'handshake' | 'linkedin' | 'indeed' | 'glassdoor';

export interface AutomationCredentials {
  platform: AutomationPlatform;
  email: string;
  password: string;
  enabled: boolean;
}

export interface AutomationProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  currentlyEmployed: boolean;
  needVisa: boolean;
  yearsOfCoding: number;
  experience: string;
  languagesKnown: string[];
  codingLanguagesKnown: string[];
  // Additional fields for Indeed-specific profile
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

// Additional fields for platform-specific settings
export interface IndeedSettings {
  experienceYears: {
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
  applicationSettings: {
    loadDelay?: number;
    hasDBS?: boolean;
    hasValidCertificate?: boolean;
  };
}

// Configuration data structure that matches what the automation expects
export interface AutomationConfig {
  credentials: AutomationCredentials;
  profile: AutomationProfile;
  platformSpecificSettings?: {
    indeed?: IndeedSettings;
    [key: string]: any;
  };
}

// Function to determine if a job URL belongs to a supported platform
export function detectPlatform(url?: string): AutomationPlatform | null {
  if (!url) return null;
  
  if (url.includes('joinhandshake.com') || url.includes('handshake.com')) {
    return 'handshake';
  } else if (url.includes('linkedin.com')) {
    return 'linkedin';
  } else if (url.includes('indeed.com')) {
    return 'indeed';
  } else if (url.includes('glassdoor.com')) {
    return 'glassdoor';
  }
  
  return null;
}

// This function would be called by the extension/desktop app
export function getHandshakeAutomationScript(config: AutomationConfig): string {
  // In a real implementation, this would return the actual Python script with
  // the configuration values interpolated, or trigger a download
  return `
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# Use configuration instead of env variables
context = {
    "name": "${config.profile.name}",
    "email": "${config.profile.email}",
    "phone": "${config.profile.phone}",
    "location": "${config.profile.location}",
    "currently employed": ${config.profile.currentlyEmployed},
    "Need a Visa": ${config.profile.needVisa},
    "Years of Coding": ${config.profile.yearsOfCoding},
    "Experience": "${config.profile.experience}",
    "Languages Known": ${config.profile.languagesKnown.join(', ')},
    "Coding Languages Known": ${config.profile.codingLanguagesKnown.join(', ')}"
}

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

driver.get("https://asu.joinhandshake.com/login?ref=app-domain")
username = "${config.credentials.email}"
password = "${config.credentials.password}"

# Rest of the handshake automation code...
`;
}

// New function for Indeed automation script
export function getIndeedAutomationScript(config: AutomationConfig): string {
  const indeedSettings = config.platformSpecificSettings?.indeed || {
    experienceYears: { default: '0' },
    applicationSettings: { loadDelay: 1.5 }
  };
  
  return `
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv

# Configuration from your settings
load_delay = ${indeedSettings.applicationSettings.loadDelay || 1.5}

# Personal info from your profile
add_address = '${config.profile.address || ''}'
add_phone = '${config.profile.phone || ''}'
add_city = '${config.profile.city || ''}'
add_postal = '${config.profile.postalCode || ''}'
add_state = '${config.profile.state || ''}'
add_github = '${config.profile.githubUrl || ''}'
add_DBS = '${indeedSettings.applicationSettings.hasDBS ? 'Yes' : 'No'}'
add_criminal = '${config.profile.hasCriminalRecord ? 'Yes' : 'No'}'
add_valid_cert = '${indeedSettings.applicationSettings.hasValidCertificate ? 'Yes' : 'No'}'
add_university = '${config.profile.university || ''}'
add_linkedin = '${config.profile.linkedinUrl || ''}'
add_sponsorship = '${config.profile.needsSponsorship ? 'Yes' : 'No'}'
add_relocate = '${config.profile.willingToRelocate ? 'Yes' : 'No'}'
add_workauthorized = '${config.profile.workAuthorized ? 'Yes' : 'No'}'
add_citizen = '${config.profile.isCitizen ? 'Yes' : 'No'}'
add_education = '${config.profile.educationLevel || 'Bachelor'}'
add_salary = '${config.profile.salaryExpectation || ''}'
add_gender = '${config.profile.gender || 'Decline'}'
add_veteran = '${config.profile.veteranStatus || 'Decline'}'
add_disability = '${config.profile.disabilityStatus || 'Decline'}'
add_commute = '${config.profile.canCommute ? 'Yes, I can commute' : 'No'}'
add_commute2 = '${config.profile.canCommute ? 'Yes' : 'No'}'
add_shift = '${config.profile.preferredShift || 'Day shift'}'
add_available = 'Yes'
default_unknown_multi = ''
add_interview_dates = '${config.profile.availableForInterview || 'Immediately'}'

# experience years
add_java = '${indeedSettings.experienceYears.java || indeedSettings.experienceYears.default || '0'}'
add_aws = '${indeedSettings.experienceYears.aws || indeedSettings.experienceYears.default || '0'}'
add_python = '${indeedSettings.experienceYears.python || indeedSettings.experienceYears.default || '0'}'
add_analysis = '${indeedSettings.experienceYears.analysis || indeedSettings.experienceYears.default || '0'}'
add_django = '${indeedSettings.experienceYears.django || indeedSettings.experienceYears.default || '0'}'
add_php = '${indeedSettings.experienceYears.php || indeedSettings.experienceYears.default || '0'}'
add_react = '${indeedSettings.experienceYears.react || indeedSettings.experienceYears.default || '0'}'
add_node = '${indeedSettings.experienceYears.node || indeedSettings.experienceYears.default || '0'}'
add_angular = '${indeedSettings.experienceYears.angular || indeedSettings.experienceYears.default || '0'}'
add_javascript = '${indeedSettings.experienceYears.javascript || indeedSettings.experienceYears.default || '0'}'
add_orm = '${indeedSettings.experienceYears.orm || indeedSettings.experienceYears.default || '0'}'
add_sdet = '${indeedSettings.experienceYears.sdet || indeedSettings.experienceYears.default || '0'}'
add_selenium = '${indeedSettings.experienceYears.selenium || indeedSettings.experienceYears.default || '0'}'
add_testautomation = '${indeedSettings.experienceYears.testautomation || indeedSettings.experienceYears.default || '0'}'
add_webdevyears = '${indeedSettings.experienceYears.webdev || indeedSettings.experienceYears.default || '0'}'
add_programming = '${indeedSettings.experienceYears.programming || indeedSettings.experienceYears.default || '0'}'
add_teaching = '${indeedSettings.experienceYears.teaching || indeedSettings.experienceYears.default || '0'}'
add_default_experience = '${indeedSettings.experienceYears.default || '0'}'

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

driver.get("https://www.indeed.com/account/login")
username = "${config.credentials.email}"
password = "${config.credentials.password}"

# Log in to Indeed
try:
    email_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ifl-InputFormField-3"))
    )
    email_input.send_keys(username)
    
    password_input = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "ifl-InputFormField-5"))
    )
    password_input.send_keys(password)
    
    sign_in_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
    )
    sign_in_button.click()
    
    # Rest of the Indeed automation code would go here
    # This would follow the logic from the Python script you provided

except Exception as e:
    print(f"Error during login: {e}")

# Keep the browser open for 10 seconds before closing
time.sleep(10)
driver.quit()
`;
}

// This would be used to trigger the automation via the extension
export function startAutomation(jobUrl: string, config: AutomationConfig): void {
  // In a real implementation, this would communicate with the browser extension
  // or desktop app to trigger the automation
  
  // For now, we'll just show a message about how this would work
  console.log(`Automation for ${jobUrl} would be triggered with:`, config);
  
  // This would typically dispatch a custom event that the extension listens for
  const event = new CustomEvent('job-automation-requested', { 
    detail: {
      jobUrl,
      config
    }
  });
  
  window.dispatchEvent(event);
}

