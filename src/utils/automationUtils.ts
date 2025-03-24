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

// New function for LinkedIn automation script
export function getLinkedInAutomationScript(config: AutomationConfig): string {
  return `
import os
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# Configuration from your settings
username = "${config.credentials.email}"
password = "${config.credentials.password}"
resume_path = "" # Path to resume file, optional

# Initialize Chrome driver
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
# Uncomment the following line to run in headless mode
# chrome_options.add_argument("--headless")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

def login_to_linkedin():
    """Login to LinkedIn with provided credentials"""
    driver.get("https://www.linkedin.com/login")
    
    # Wait for the login page to load
    try:
        username_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        username_field.send_keys(username)
        
        password_field = driver.find_element(By.ID, "password")
        password_field.send_keys(password)
        
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Wait for the home page to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "global-nav__content"))
        )
        print("Successfully logged in to LinkedIn")
        return True
    except Exception as e:
        print(f"Error during login: {e}")
        return False

def navigate_to_job(job_url):
    """Navigate to the specific job posting"""
    driver.get(job_url)
    try:
        # Wait for the job details to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "jobs-unified-top-card"))
        )
        print(f"Successfully navigated to job posting: {job_url}")
        return True
    except Exception as e:
        print(f"Error navigating to job: {e}")
        return False

def apply_to_job():
    """Apply to the current job posting"""
    try:
        # Find and click the apply button
        apply_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, ".jobs-apply-button"))
        )
        apply_button.click()
        print("Clicked Apply button")
        
        # Wait for the application form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, "jobs-easy-apply-content"))
        )
        
        # Process the application steps
        process_application_steps()
        
        return True
    except NoSuchElementException:
        print("Apply button not found, may have already applied or using 'Easy Apply' not available")
        return False
    except ElementClickInterceptedException:
        print("Cannot click Apply button, might be obstructed")
        return False
    except Exception as e:
        print(f"Error during application: {e}")
        return False

def process_application_steps():
    """Process the multi-step application form"""
    current_step = 1
    max_steps = 20  # Safety mechanism to avoid infinite loops
    
    while current_step <= max_steps:
        try:
            # Wait for form elements to load
            time.sleep(2)
            
            # Look for input fields in the current step
            try:
                input_fields = driver.find_elements(By.CSS_SELECTOR, "input:not([type='hidden']), textarea, select")
                for field in input_fields:
                    field_id = field.get_attribute("id") or ""
                    field_name = field.get_attribute("name") or ""
                    field_type = field.get_attribute("type") or ""
                    field_aria_label = field.get_attribute("aria-label") or ""
                    
                    # Skip if field is already filled
                    if field.get_attribute("value"):
                        continue
                    
                    # Handle different types of fields
                    if "phone" in field_id.lower() or "phone" in field_name.lower() or "phone" in field_aria_label.lower():
                        field.send_keys("${config.profile.phone}")
                    elif "resume" in field_id.lower() and field_type == "file" and resume_path:
                        field.send_keys(resume_path)
                    elif field_type == "radio" or field_type == "checkbox":
                        # Handle screening questions
                        question_text = ""
                        try:
                            # Try to find the question associated with this radio/checkbox
                            question_element = driver.find_element(By.XPATH, f"//label[@for='{field_id}']/../..")
                            question_text = question_element.text.lower()
                        except:
                            pass
                        
                        # Auto select favorable answers
                        if any(term in question_text for term in ["years of experience", "how many years"]):
                            if "${config.profile.yearsOfCoding}" in question_text:
                                field.click()
                        elif any(term in question_text for term in ["eligible", "authorized", "legally", "work authorization"]):
                            if not field.is_selected() and "yes" in field_aria_label.lower():
                                field.click()
                        elif "sponsorship" in question_text:
                            need_sponsorship = ${config.profile.needVisa}
                            if (need_sponsorship and "yes" in field_aria_label.lower()) or (not need_sponsorship and "no" in field_aria_label.lower()):
                                field.click()
                    elif field_type == "select-one":
                        # Handle dropdown selections
                        try:
                            field.click()
                            time.sleep(0.5)
                            # Try to select a favorable option
                            options = field.find_elements(By.TAG_NAME, "option")
                            # Prefer higher experience levels, "yes" for positive questions
                            for option in options:
                                option_text = option.text.lower()
                                if option_text and option_text != "select an option":
                                    option.click()
                                    break
                        except:
                            pass
            except Exception as e:
                print(f"Error processing fields: {e}")
            
            # Look for the Next or Submit button
            try:
                # Check for "Review" or "Submit" button first (final step)
                final_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Review') or contains(text(), 'Submit') or contains(text(), 'Apply')]")
                if final_buttons:
                    final_buttons[0].click()
                    print("Clicked final submit button")
                    time.sleep(2)
                    # Look for confirmation buttons in follow-up dialogs
                    try:
                        confirm_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Submit') or contains(text(), 'Confirm') or contains(text(), 'Done')]")
                        if confirm_buttons:
                            confirm_buttons[0].click()
                            print("Clicked confirmation button")
                    except:
                        pass
                    break
                else:
                    # Look for "Next" or "Continue" button
                    next_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Next') or contains(text(), 'Continue')]")
                    if next_buttons:
                        next_buttons[0].click()
                        print(f"Moved to step {current_step + 1}")
                        current_step += 1
                    else:
                        # If no obvious buttons, look for any footer button that might advance
                        footer_buttons = driver.find_elements(By.CSS_SELECTOR, "footer button, .artdeco-modal__actionbar button")
                        if footer_buttons:
                            for button in footer_buttons:
                                if button.is_enabled() and button.is_displayed():
                                    button.click()
                                    print(f"Clicked a footer button to advance")
                                    current_step += 1
                                    break
                        else:
                            print("Could not find next button, application process may be complete")
                            break
            except Exception as e:
                print(f"Error finding navigation buttons: {e}")
                break
                
            time.sleep(1.5)
        except Exception as e:
            print(f"Unexpected error in step {current_step}: {e}")
            break
    
    print("Application process completed")

# Main execution flow
try:
    if login_to_linkedin():
        # Use the URL that was provided when the script was created
        job_url = "JOB_URL_PLACEHOLDER"
        
        if navigate_to_job(job_url):
            if apply_to_job():
                print("Successfully applied to job!")
            else:
                print("Could not complete application process")
        else:
            print("Could not navigate to job posting")
    else:
        print("Login failed, could not proceed")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    # Wait a moment before closing
    time.sleep(5)
    driver.quit()
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
load_delay = ${indeedSettings.applicationSettings?.loadDelay || 1.5}

# Personal info from your profile
add_address = '${config.profile.address || ''}'
add_phone = '${config.profile.phone || ''}'
add_city = '${config.profile.city || ''}'
add_postal = '${config.profile.postalCode || ''}'
add_state = '${config.profile.state || ''}'
add_github = '${config.profile.githubUrl || ''}'
add_DBS = '${indeedSettings.applicationSettings?.hasDBS ? 'Yes' : 'No'}'
add_criminal = '${config.profile.hasCriminalRecord ? 'Yes' : 'No'}'
add_valid_cert = '${indeedSettings.applicationSettings?.hasValidCertificate ? 'Yes' : 'No'}'
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
add_java = '${indeedSettings.experienceYears?.java || indeedSettings.experienceYears?.default || '0'}'
add_aws = '${indeedSettings.experienceYears?.aws || indeedSettings.experienceYears?.default || '0'}'
add_python = '${indeedSettings.experienceYears?.python || indeedSettings.experienceYears?.default || '0'}'
add_analysis = '${indeedSettings.experienceYears?.analysis || indeedSettings.experienceYears?.default || '0'}'
add_django = '${indeedSettings.experienceYears?.django || indeedSettings.experienceYears?.default || '0'}'
add_php = '${indeedSettings.experienceYears?.php || indeedSettings.experienceYears?.default || '0'}'
add_react = '${indeedSettings.experienceYears?.react || indeedSettings.experienceYears?.default || '0'}'
add_node = '${indeedSettings.experienceYears?.node || indeedSettings.experienceYears?.default || '0'}'
add_angular = '${indeedSettings.experienceYears?.angular || indeedSettings.experienceYears?.default || '0'}'
add_javascript = '${indeedSettings.experienceYears?.javascript || indeedSettings.experienceYears?.default || '0'}'
add_orm = '${indeedSettings.experienceYears?.orm || indeedSettings.experienceYears?.default || '0'}'
add_sdet = '${indeedSettings.experienceYears?.sdet || indeedSettings.experienceYears?.default || '0'}'
add_selenium = '${indeedSettings.experienceYears?.selenium || indeedSettings.experienceYears?.default || '0'}'
add_testautomation = '${indeedSettings.experienceYears?.testautomation || indeedSettings.experienceYears?.default || '0'}'
add_webdevyears = '${indeedSettings.experienceYears?.webdev || indeedSettings.experienceYears?.default || '0'}'
add_programming = '${indeedSettings.experienceYears?.programming || indeedSettings.experienceYears?.default || '0'}'
add_teaching = '${indeedSettings.experienceYears?.teaching || indeedSettings.experienceYears?.default || '0'}'
add_default_experience = '${indeedSettings.experienceYears?.default || '0'}'

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

# Navigate to the job URL (this would be passed in)
current_url = "${config.credentials.platform === 'indeed' ? 'https://www.indeed.com/account/login' : ''}"
driver.get(current_url)
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
    
    print("Successfully logged in")
    
    # Code to navigate to the job listing and apply
    # This is where we'd implement the application logic based on Jobs_Applier_AI_Agent_AIHawk
    
    # Wait for login to complete
    time.sleep(2)
    
    # Accept cookies if prompted
    try:
        cookie_button = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
        )
        cookie_button.click()
        print("Accepted cookies")
    except:
        print("No cookie prompt or already accepted")
    
    # Automated application process would continue here...
    # This would include:
    # 1. Finding the apply button
    # 2. Clicking it
    # 3. Filling out form fields
    # 4. Uploading resume if needed
    # 5. Submitting the application

except Exception as e:
    print(f"Error during login: {e}")

# Keep the browser open for 30 seconds before closing
time.sleep(30)
driver.quit()
`;
}

// This would be used to trigger the automation via the extension
export function startAutomation(jobUrl: string, config: AutomationConfig): void {
  // In a real implementation, this would communicate with the browser extension
  // or desktop app to trigger the automation
  
  // For now, we'll just show a message about how this would work
  console.log(`Automation for ${jobUrl} would be triggered with:`, config);
  
  // Add helper line to help users understand how to use without extension
  console.log("Without the extension installed, you'll need to download and run the script manually");
  
  // This would typically dispatch a custom event that the extension listens for
  const event = new CustomEvent('job-automation-requested', { 
    detail: {
      jobUrl,
      config
    }
  });
  
  window.dispatchEvent(event);
}

// New function to support opening a job URL with custom parameters
export function openJobWithParameters(jobUrl: string, params: Record<string, string>): void {
  try {
    const url = new URL(jobUrl);
    
    // Add parameters to URL
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    // Open the URL in a new tab
    window.open(url.toString(), '_blank');
  } catch (error) {
    console.error("Failed to open job URL with parameters:", error);
  }
}

// Function to extract job details from a URL
export function extractJobDetailsFromUrl(url: string): { 
  platform: AutomationPlatform | null;
  jobId?: string;
  company?: string;
} {
  const platform = detectPlatform(url);
  
  if (!platform) {
    return { platform: null };
  }
  
  try {
    const parsedUrl = new URL(url);
    let jobId, company;
    
    if (platform === 'linkedin') {
      // Extract LinkedIn job ID from URL
      const matches = url.match(/view\/(\d+)/);
      jobId = matches ? matches[1] : undefined;
      
      // Try to extract company name from path segments
      const pathSegments = parsedUrl.pathname.split('/');
      company = pathSegments.length > 2 ? pathSegments[2] : undefined;
    } else if (platform === 'indeed') {
      // Extract Indeed job ID (usually in the form vp=xxx or jk=xxx)
      const vpMatch = parsedUrl.searchParams.get('vp');
      const jkMatch = parsedUrl.searchParams.get('jk');
      jobId = vpMatch || jkMatch || undefined;
      
      // Company might be in the URL path
      const pathSegments = parsedUrl.pathname.split('/');
      company = pathSegments.find(segment => segment.includes('at-')) || undefined;
      if (company) {
        company = company.replace('at-', '').replace(/-/g, ' ');
      }
    } else if (platform === 'handshake') {
      // Extract Handshake job ID
      const matches = url.match(/jobs\/(\d+)/);
      jobId = matches ? matches[1] : undefined;
    } else if (platform === 'glassdoor') {
      // Extract Glassdoor job ID
      const matches = url.match(/jobListingId=(\d+)/);
      jobId = matches ? matches[1] : undefined;
    }
    
    return { platform, jobId, company };
  } catch (error) {
    console.error("Failed to parse job URL:", error);
    return { platform };
  }
}
