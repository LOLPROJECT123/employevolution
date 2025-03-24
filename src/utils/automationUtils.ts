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
    "Languages Known": "${config.profile.languagesKnown.join(', ')}",
    "Coding Languages Known": "${config.profile.codingLanguagesKnown.join(', ')}"
}

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

driver.get("https://asu.joinhandshake.com/login?ref=app-domain")
username = "${config.credentials.email}"
password = "${config.credentials.password}"

# Login to Handshake
try:
    # Click on school sign in button
    school_signin = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Sign in with your school')]"))
    )
    school_signin.click()

    # Wait for and fill email field
    email_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "username"))
    )
    email_field.send_keys(username)
    
    # Fill password and submit
    password_field = driver.find_element(By.ID, "password")
    password_field.send_keys(password)
    
    # Submit login form
    submit_button = driver.find_element(By.NAME, "commit")
    submit_button.click()
    
    print("Successfully logged in to Handshake")
    
    # Navigate to job listing page or specific job
    # This will be replaced with the actual job URL when downloaded
    
    # Check for and click Easy Apply button if available
    try:
        easy_apply_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Easy Apply') or contains(text(), 'Apply')]"))
        )
        easy_apply_button.click()
        print("Clicked on Apply button")
        
        # Wait for the application form to load
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class, 'application-form')]"))
        )
        
        # Fill out application form
        # This will depend on the specific job application, but here's a general approach
        
        # Step through each part of the form using Next buttons
        while True:
            # Try to find and fill any empty input fields
            inputs = driver.find_elements(By.XPATH, "//input[not(@type='hidden') and not(@readonly)]")
            for input_field in inputs:
                field_id = input_field.get_attribute("id") or ""
                field_name = input_field.get_attribute("name") or ""
                field_type = input_field.get_attribute("type") or ""
                
                # Skip if the field is already filled
                if input_field.get_attribute("value"):
                    continue
                
                # Fill differently based on field type and name
                if field_type == "text":
                    if "name" in field_id.lower() or "name" in field_name.lower():
                        input_field.send_keys(context["name"])
                    elif "email" in field_id.lower() or "email" in field_name.lower():
                        input_field.send_keys(context["email"])
                    elif "phone" in field_id.lower() or "phone" in field_name.lower():
                        input_field.send_keys(context["phone"])
                    elif "location" in field_id.lower() or "location" in field_name.lower():
                        input_field.send_keys(context["location"])
                    else:
                        # Generic text input for other fields
                        input_field.send_keys("Yes")
                
                # Handle checkboxes and radio buttons for questions
                elif field_type == "checkbox" or field_type == "radio":
                    # Try to find the label to understand what the checkbox is for
                    try:
                        label = driver.find_element(By.XPATH, f"//label[@for='{field_id}']")
                        label_text = label.text.lower()
                        
                        # Make decisions based on the checkbox label
                        if any(term in label_text for term in ["agree", "terms", "consent"]):
                            if not input_field.is_selected():
                                input_field.click()
                        elif "visa" in label_text or "sponsor" in label_text:
                            if context["Need a Visa"] and not input_field.is_selected():
                                input_field.click()
                    except:
                        # If we can't determine what the checkbox is for, skip it
                        pass
            
            # Handle textareas (for cover letters, etc.)
            textareas = driver.find_elements(By.TAG_NAME, "textarea")
            for textarea in textareas:
                # Skip if already filled
                if textarea.get_attribute("value"):
                    continue
                    
                # Generic message for text areas
                textarea.send_keys("I am excited for this opportunity and believe my skills and experience make me an excellent candidate for this position.")
            
            # Look for Next or Submit button
            try:
                next_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Next') or contains(text(), 'Continue')]")
                next_button.click()
                print("Moved to next step")
                time.sleep(2)  # Wait for next form page to load
            except NoSuchElementException:
                # If no Next button, look for Submit
                try:
                    submit_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Submit') or contains(text(), 'Apply')]")
                    submit_button.click()
                    print("Submitted application")
                    break  # End the loop after submission
                except NoSuchElementException:
                    print("Could not find Next or Submit button, may have reached the end of the form")
                    break
    
    except Exception as e:
        print(f"Error during application process: {e}")

except Exception as e:
    print(f"Login error: {e}")

# Keep the browser window open for a bit so you can see the results
time.sleep(5)
driver.quit()
`;
}

// New function for LinkedIn automation script with improved techniques
export function getLinkedInAutomationScript(config: AutomationConfig): string {
  return `
import os
import time
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementClickInterceptedException, StaleElementReferenceException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# Configuration from your settings
username = "${config.credentials.email}"
password = "${config.credentials.password}"
resume_path = ""  # Path to resume file, optional

# User profile data
user_data = {
    "name": "${config.profile.name}",
    "email": "${config.profile.email}",
    "phone": "${config.profile.phone}",
    "location": "${config.profile.location}",
    "years_of_experience": "${config.profile.yearsOfCoding}",
    "education": "${config.profile.educationLevel || 'Bachelor\\'s Degree'}",
    "skills": ${JSON.stringify(config.profile.codingLanguagesKnown)},
    "work_auth": "${config.profile.workAuthorized || !config.profile.needVisa}",
    "need_sponsorship": "${config.profile.needVisa}"
}

# Improved answers for common screening questions
common_answers = {
    # Years of experience questions
    "years of experience": str(user_data["years_of_experience"]),
    "how many years": str(user_data["years_of_experience"]),
    "years have you": str(user_data["years_of_experience"]),
    
    # Work authorization
    "legally authorized": "Yes" if user_data["work_auth"] == "true" else "No",
    "work authorization": "Yes" if user_data["work_auth"] == "true" else "No",
    "eligible to work": "Yes" if user_data["work_auth"] == "true" else "No",
    "right to work": "Yes" if user_data["work_auth"] == "true" else "No",
    
    # Sponsorship
    "require sponsorship": "Yes" if user_data["need_sponsorship"] == "true" else "No",
    "visa sponsorship": "Yes" if user_data["need_sponsorship"] == "true" else "No",
    "need sponsorship": "Yes" if user_data["need_sponsorship"] == "true" else "No",
    
    # Relocation questions
    "willing to relocate": "${config.profile.willingToRelocate ? 'Yes' : 'No'}",
    "open to relocation": "${config.profile.willingToRelocate ? 'Yes' : 'No'}",
    
    # Education questions
    "highest degree": user_data["education"],
    "level of education": user_data["education"],
    
    # Skills validation
    "familiar with": "Yes",
    "experience with": "Yes",
    "knowledge of": "Yes",
    
    # General positive answers to increase chances
    "committed to": "Yes",
    "willing to": "Yes",
    "able to": "Yes"
}

# Initialize Chrome driver with improved options
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--disable-notifications")
chrome_options.add_argument("--disable-popup-blocking")
# Uncomment to run in headless mode if needed
# chrome_options.add_argument("--headless")
# chrome_options.add_argument("--window-size=1920,1080")

# Chrome driver setup
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

def safe_wait_and_click(by, value, timeout=10, scroll=True):
    """Safely wait for an element, scroll to it, and click it with retry logic"""
    for attempt in range(3):  # Retry up to 3 times
        try:
            element = WebDriverWait(driver, timeout).until(
                EC.element_to_be_clickable((by, value))
            )
            if scroll:
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
                time.sleep(0.5)  # Small delay after scrolling
            element.click()
            return True
        except (TimeoutException, ElementClickInterceptedException, StaleElementReferenceException) as e:
            print(f"Click attempt {attempt+1} failed: {e}")
            time.sleep(1)  # Wait between retries
            
            # Try alternative clicking if normal click fails
            if attempt == 1:
                try:
                    element = driver.find_element(by, value)
                    driver.execute_script("arguments[0].click();", element)
                    return True
                except:
                    pass
    return False

def login_to_linkedin():
    """Login to LinkedIn with provided credentials and better error handling"""
    driver.get("https://www.linkedin.com/login")
    
    try:
        # Wait for the login page to load
        username_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        username_field.send_keys(username)
        
        password_field = driver.find_element(By.ID, "password")
        password_field.send_keys(password)
        
        # Add small random delay to mimic human behavior
        time.sleep(random.uniform(0.5, 1.5))
        
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        
        # Wait for the home page to load - multiple indicators for robustness
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CLASS_NAME, "global-nav__content"))
            )
        except:
            # Alternative way to check if logged in
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "li.global-nav__primary-item"))
            )
        
        print("Successfully logged in to LinkedIn")
        
        # Handle any security verifications if present
        try:
            security_check = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "captcha-challenge"))
            )
            print("ATTENTION: Security verification required. Please complete it manually.")
            input("Press Enter once you've completed the security verification...")
        except:
            # No security verification
            pass
            
        return True
    except Exception as e:
        print(f"Error during login: {e}")
        return False

def navigate_to_job(job_url):
    """Navigate to the specific job posting with better error handling"""
    try:
        driver.get(job_url)
        
        # Multiple ways to detect when job details have loaded
        selectors = [
            (By.CLASS_NAME, "jobs-unified-top-card"),
            (By.CSS_SELECTOR, ".job-view-layout"),
            (By.CSS_SELECTOR, "[data-job-id]")
        ]
        
        for selector in selectors:
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located(selector)
                )
                print(f"Successfully navigated to job posting: {job_url}")
                return True
            except:
                continue
                
        raise Exception("Could not confirm job posting loaded")
    except Exception as e:
        print(f"Error navigating to job: {e}")
        return False

def answer_screening_questions():
    """Handle LinkedIn screening questions with intelligent responses"""
    try:
        # Look for question containers
        question_containers = driver.find_elements(By.CSS_SELECTOR, ".jobs-easy-apply-form-section__grouping")
        
        if not question_containers:
            return True  # No questions found
            
        for container in question_containers:
            try:
                # Extract the question text
                question_element = container.find_element(By.CSS_SELECTOR, "label, legend")
                question_text = question_element.text.lower()
                print(f"Found question: {question_text}")
                
                # Check for input fields, selects, or radio/checkbox buttons
                inputs = container.find_elements(By.CSS_SELECTOR, "input, select, textarea")
                
                if not inputs:
                    continue
                    
                for input_element in inputs:
                    input_type = input_element.get_attribute("type")
                    
                    # Skip already filled inputs
                    if input_type not in ["radio", "checkbox"] and input_element.get_attribute("value"):
                        continue
                        
                    # Handle different input types
                    if input_type == "text" or input_type == "number" or input_element.tag_name == "textarea":
                        # Smart text input based on question
                        answer = ""
                        
                        # Try to find a matching answer from common answers
                        for key, value in common_answers.items():
                            if key in question_text:
                                answer = value
                                break
                                
                        # Default answer based on field name
                        if not answer:
                            field_name = input_element.get_attribute("name") or ""
                            field_id = input_element.get_attribute("id") or ""
                            field_name_lower = field_name.lower() + field_id.lower()
                            
                            if "phone" in field_name_lower:
                                answer = user_data["phone"]
                            elif "name" in field_name_lower:
                                answer = user_data["name"]
                            elif "email" in field_name_lower:
                                answer = user_data["email"]
                            elif "location" in field_name_lower or "address" in field_name_lower:
                                answer = user_data["location"]
                            elif "experience" in field_name_lower or "year" in field_name_lower:
                                answer = str(user_data["years_of_experience"])
                            elif input_element.tag_name == "textarea":
                                answer = "I believe my skills and experience make me an excellent candidate for this role. I am excited about the opportunity to contribute to your team."
                            else:
                                # Generic answer for other text fields
                                answer = "Yes"
                                
                        # Send the answer
                        input_element.clear()
                        for character in answer:
                            input_element.send_keys(character)
                            time.sleep(random.uniform(0.05, 0.1))  # Realistic typing
                        
                    elif input_element.tag_name == "select":
                        # Handle dropdown selections intelligently
                        select = Select(input_element)
                        options = select.options
                        
                        # Skip if no options or already selected
                        if len(options) <= 1:
                            continue
                            
                        # Choose appropriate option based on question
                        if "experience" in question_text:
                            # Try to select value closest to years of experience
                            selected = False
                            for option in options:
                                if str(user_data["years_of_experience"]) in option.text:
                                    select.select_by_visible_text(option.text)
                                    selected = True
                                    break
                                    
                            # If exact match not found, select highest experience option that's not ridiculous
                            if not selected:
                                # Sort options that have numbers by their numeric value
                                numeric_options = []
                                for option in options:
                                    if option.text.strip() and option.text.lower() != "select an option":
                                        nums = [int(s) for s in option.text.split() if s.isdigit()]
                                        if nums:
                                            numeric_options.append((option, nums[0]))
                                
                                if numeric_options:
                                    # Sort by numeric value and get the option closest to user's experience
                                    numeric_options.sort(key=lambda x: abs(x[1] - int(user_data["years_of_experience"])))
                                    select.select_by_visible_text(numeric_options[0][0].text)
                                else:
                                    # No numeric options, select the second option (often "Yes" or positive response)
                                    if len(options) > 1:
                                        select.select_by_index(1)
                        elif "education" in question_text or "degree" in question_text:
                            # Look for the right education level
                            education_keywords = {
                                "bachelor": ["bachelor", "bs", "ba", "undergraduate", "college"],
                                "master": ["master", "ms", "ma", "graduate", "postgraduate"],
                                "phd": ["phd", "doctorate", "doctoral"],
                                "high school": ["high school", "secondary", "hs", "diploma"]
                            }
                            
                            user_ed = user_data["education"].lower()
                            for option in options:
                                opt_text = option.text.lower()
                                if opt_text.strip() and opt_text != "select an option":
                                    # Find education type that matches user's
                                    for ed_type, keywords in education_keywords.items():
                                        if any(kw in user_ed for kw in keywords) and any(kw in opt_text for kw in keywords):
                                            select.select_by_visible_text(option.text)
                                            break
                        else:
                            # For other questions, try to select "Yes" or positive response
                            for option in options:
                                opt_text = option.text.lower()
                                if opt_text.strip() and opt_text != "select an option":
                                    if opt_text == "yes" or "yes" in opt_text:
                                        select.select_by_visible_text(option.text)
                                        break
                            else:
                                # If no "Yes" option, select the second option (skip the default)
                                if len(options) > 1:
                                    select.select_by_index(1)
                    
                    elif input_type == "radio" or input_type == "checkbox":
                        # Handle radio buttons and checkboxes based on question context
                        label_element = None
                        try:
                            # Try to find associated label
                            label_id = input_element.get_attribute("id")
                            if label_id:
                                label_element = driver.find_element(By.CSS_SELECTOR, f"label[for='{label_id}']")
                        except:
                            pass
                            
                        label_text = label_element.text.lower() if label_element else ""
                        
                        # Choose based on context
                        should_select = False
                        
                        # Check if any common answer keys are in the question text
                        for key, value in common_answers.items():
                            if key in question_text:
                                if value.lower() == "yes" and ("yes" in label_text or "true" in label_text):
                                    should_select = True
                                    break
                                elif value.lower() == "no" and ("no" in label_text or "false" in label_text):
                                    should_select = True
                                    break
                                elif value.lower() not in ["yes", "no"] and value.lower() in label_text:
                                    should_select = True
                                    break
                        
                        # Set required skills/technologies to yes
                        if not should_select:
                            for skill in user_data["skills"]:
                                if skill.lower() in label_text:
                                    should_select = True
                                    break
                        
                        # Generic positive response for unclear questions
                        if not should_select and ("yes" in label_text or "true" in label_text):
                            should_select = True
                            
                        # Select if determined
                        if should_select and not input_element.is_selected():
                            driver.execute_script("arguments[0].click();", input_element)
                            print(f"Selected option: {label_text}")
            except Exception as e:
                print(f"Error processing question: {e}")
                
        return True
    except Exception as e:
        print(f"Error answering screening questions: {e}")
        return False

def upload_resume_if_needed():
    """Handle resume upload if there's an upload field"""
    if not resume_path:
        print("No resume path configured, skipping upload")
        return True
        
    try:
        # Look for common resume upload elements
        upload_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Upload') or contains(text(), 'resume') or contains(text(), 'CV')]")
        
        if upload_buttons:
            # Click the upload button to open the file dialog
            driver.execute_script("arguments[0].click();", upload_buttons[0])
            time.sleep(1)
            
            # Find the actual file input element
            file_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")
            
            if file_inputs:
                file_inputs[0].send_keys(resume_path)
                print("Resume uploaded successfully")
                time.sleep(2)  # Wait for upload to complete
                return True
            else:
                print("Could not find file input element after clicking upload button")
        else:
            # Try to find direct file input
            file_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='file']")
            
            if file_inputs:
                file_inputs[0].send_keys(resume_path)
                print("Resume uploaded directly")
                time.sleep(2)  # Wait for upload to complete
                return True
            else:
                print("No resume upload field found")
                
        return True  # Return true even if no upload field found
    except Exception as e:
        print(f"Error uploading resume: {e}")
        return False

def handle_follow_company_prompt():
    """Handle the 'Follow company?' prompt that sometimes appears"""
    try:
        # Look for the "Follow company?" dialog
        follow_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Follow')]")
        skip_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Skip')]")
        
        # Click "Follow" (usually recommended to build relationship)
        if follow_buttons:
            driver.execute_script("arguments[0].click();", follow_buttons[0])
            print("Clicked 'Follow' on the follow company prompt")
            time.sleep(1)
            return True
        # Or click "Skip" if found and preferred
        elif skip_buttons:
            driver.execute_script("arguments[0].click();", skip_buttons[0])
            print("Clicked 'Skip' on the follow company prompt")
            time.sleep(1)
            return True
            
        return True  # Return true if prompt not found
    except Exception as e:
        print(f"Error handling follow company prompt: {e}")
        return True  # Continue even if error

def apply_to_job():
    """Apply to the current job posting with enhanced form handling"""
    try:
        # Find and click the apply button
        apply_button_clicked = False
        
        # Try different apply button selectors
        apply_button_selectors = [
            (By.CSS_SELECTOR, ".jobs-apply-button"),
            (By.XPATH, "//button[contains(text(), 'Easy Apply')]"),
            (By.XPATH, "//button[contains(text(), 'Apply')]"),
            (By.XPATH, "//a[contains(@href, '/jobs/apply/')]")
        ]
        
        for selector in apply_button_selectors:
            try:
                if safe_wait_and_click(selector[0], selector[1], timeout=5):
                    apply_button_clicked = True
                    print("Clicked Apply button")
                    break
            except:
                continue
                
        if not apply_button_clicked:
            print("Could not find the Apply button")
            return False
            
        # Wait for the application form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".jobs-easy-apply-content"))
        )
        
        # Process multi-step application
        current_step = 1
        max_steps = 20  # Safety mechanism to avoid infinite loops
        
        while current_step <= max_steps:
            print(f"Processing application step {current_step}")
            time.sleep(2)  # Wait for form elements to load
            
            # Look for contact info form (common first step)
            contact_info_fields = driver.find_elements(By.CSS_SELECTOR, "input[name*='phoneNumber'], input[name*='email']")
            if contact_info_fields:
                print("Filling contact information")
                for field in contact_info_fields:
                    field_name = field.get_attribute("name") or ""
                    if "phoneNumber" in field_name and not field.get_attribute("value"):
                        field.clear()
                        field.send_keys(user_data["phone"])
                    elif "email" in field_name and not field.get_attribute("value"):
                        field.clear()
                        field.send_keys(user_data["email"])
            
            # Answer current step's screening questions
            answer_screening_questions()
            
            # Check for resume upload
