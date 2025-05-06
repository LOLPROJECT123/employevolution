
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
    "education": "${config.profile.educationLevel || "Bachelor's Degree"}",
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
    "willing to relocate": "${config.profile.willingToRelocate ? "Yes" : "No"}",
    "open to relocation": "${config.profile.willingToRelocate ? "Yes" : "No"}",
    
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
            upload_resume_if_needed()
            
            # Look for Review or Submit buttons first (final steps)
            final_buttons = [
                (By.XPATH, "//button[contains(text(), 'Review')]", "Review"),
                (By.XPATH, "//button[contains(text(), 'Submit')]", "Submit"),
                (By.XPATH, "//button[contains(text(), 'Submit application')]", "Submit application")
            ]
            
            final_clicked = False
            for button_selector, button_name in final_buttons:
                try:
                    buttons = driver.find_elements(button_selector[0], button_selector[1])
                    if buttons and buttons[0].is_enabled():
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", buttons[0])
                        time.sleep(0.5)
                        driver.execute_script("arguments[0].click();", buttons[0])
                        print(f"Clicked {button_name} button")
                        final_clicked = True
                        time.sleep(2)
                        
                        # Check for the follow company prompt after final submission
                        handle_follow_company_prompt()
                        
                        break
                except:
                    continue
                    
            if final_clicked:
                print("Application submitted successfully")
                return True
                
            # If no final button found, look for Next or Continue
            next_buttons = [
                (By.XPATH, "//button[contains(text(), 'Next')]", "Next"),
                (By.XPATH, "//button[contains(text(), 'Continue')]", "Continue"),
                (By.CSS_SELECTOR, "button[aria-label='Continue to next step']", "Continue next")
            ]
            
            next_clicked = False
            for button_selector, button_name in next_buttons:
                try:
                    buttons = driver.find_elements(button_selector[0], button_selector[1])
                    if buttons and buttons[0].is_enabled():
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", buttons[0])
                        time.sleep(0.5)
                        driver.execute_script("arguments[0].click();", buttons[0])
                        print(f"Clicked {button_name} button")
                        next_clicked = True
                        current_step += 1
                        time.sleep(2)
                        break
                except:
                    continue
            
            if not next_clicked:
                # Try clicking any footer/actionbar button that might advance
                try:
                    footer_buttons = driver.find_elements(By.CSS_SELECTOR, 
                        "footer button:not([aria-label='Dismiss']), .artdeco-modal__actionbar button:not([aria-label='Dismiss'])")
                    
                    for button in footer_buttons:
                        if button.is_enabled() and button.is_displayed():
                            button_text = button.text.strip()
                            if button_text and button_text.lower() not in ["cancel", "exit", "dismiss", "discard"]:
                                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", button)
                                time.sleep(0.5)
                                driver.execute_script("arguments[0].click();", button)
                                print(f"Clicked footer button: {button_text}")
                                current_step += 1
                                time.sleep(2)
                                next_clicked = True
                                break
                except Exception as e:
                    print(f"Error finding footer buttons: {e}")
            
            if not next_clicked:
                print("Could not find next button or submit button, application process may be complete")
                break
        
        print("Application process completed")
        return True
    except Exception as e:
        print(f"Error during application: {e}")
        return False

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
import random
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from datetime import datetime

# Configuration from your settings
load_delay = ${indeedSettings.applicationSettings?.loadDelay || 1.5}

# Personal info from your profile
user_info = {
    "address": '${config.profile.address || ''}',
    "phone": '${config.profile.phone || ''}',
    "city": '${config.profile.city || ''}',
    "postal": '${config.profile.postalCode || ''}',
    "state": '${config.profile.state || ''}',
    "github": '${config.profile.githubUrl || ''}',
    "dbs_check": ${indeedSettings.applicationSettings?.hasDBS ? 'True' : 'False'},
    "criminal_record": ${config.profile.hasCriminalRecord ? 'True' : 'False'},
    "valid_cert": ${indeedSettings.applicationSettings?.hasValidCertificate ? 'True' : 'False'},
    "university": '${config.profile.university || ''}',
    "linkedin": '${config.profile.linkedinUrl || ''}',
    "need_sponsorship": ${config.profile.needsSponsorship ? 'True' : 'False'},
    "willing_relocate": ${config.profile.willingToRelocate ? 'True' : 'False'},
    "work_authorized": ${config.profile.workAuthorized ? 'True' : 'False'},
    "is_citizen": ${config.profile.isCitizen ? 'True' : 'False'},
    "education_level": '${config.profile.educationLevel || 'Bachelor'}',
    "salary_expectation": '${config.profile.salaryExpectation || ''}',
    "gender": '${config.profile.gender || 'Decline'}',
    "veteran_status": '${config.profile.veteranStatus || 'Decline'}',
    "disability_status": '${config.profile.disabilityStatus || 'Decline'}',
    "can_commute": ${config.profile.canCommute ? 'True' : 'False'},
    "preferred_shift": '${config.profile.preferredShift || 'Day shift'}',
    "available_interview": '${config.profile.availableForInterview || 'Immediately'}',
    "full_name": '${config.profile.name}',
    "email": '${config.profile.email}'
}

# Experience years for various technologies
experience_years = {
    "java": '${indeedSettings.experienceYears?.java || indeedSettings.experienceYears?.default || '0'}',
    "aws": '${indeedSettings.experienceYears?.aws || indeedSettings.experienceYears?.default || '0'}',
    "python": '${indeedSettings.experienceYears?.python || indeedSettings.experienceYears?.default || '0'}',
    "analysis": '${indeedSettings.experienceYears?.analysis || indeedSettings.experienceYears?.default || '0'}',
    "django": '${indeedSettings.experienceYears?.django || indeedSettings.experienceYears?.default || '0'}',
    "php": '${indeedSettings.experienceYears?.php || indeedSettings.experienceYears?.default || '0'}',
    "react": '${indeedSettings.experienceYears?.react || indeedSettings.experienceYears?.default || '0'}',
    "node": '${indeedSettings.experienceYears?.node || indeedSettings.experienceYears?.default || '0'}',
    "angular": '${indeedSettings.experienceYears?.angular || indeedSettings.experienceYears?.default || '0'}',
    "javascript": '${indeedSettings.experienceYears?.javascript || indeedSettings.experienceYears?.default || '0'}',
    "orm": '${indeedSettings.experienceYears?.orm || indeedSettings.experienceYears?.default || '0'}',
    "sdet": '${indeedSettings.experienceYears?.sdet || indeedSettings.experienceYears?.default || '0'}',
    "selenium": '${indeedSettings.experienceYears?.selenium || indeedSettings.experienceYears?.default || '0'}',
    "testautomation": '${indeedSettings.experienceYears?.testautomation || indeedSettings.experienceYears?.default || '0'}',
    "webdev": '${indeedSettings.experienceYears?.webdev || indeedSettings.experienceYears?.default || '0'}',
    "programming": '${indeedSettings.experienceYears?.programming || indeedSettings.experienceYears?.default || '0'}',
    "teaching": '${indeedSettings.experienceYears?.teaching || indeedSettings.experienceYears?.default || '0'}',
    "default": '${indeedSettings.experienceYears?.default || '0'}'
}

# Set up Chrome options for more reliable automation
chrome_options = Options()
chrome_options.add_argument("--start-maximized")
chrome_options.add_argument("--disable-notifications")
chrome_options.add_argument("--disable-popup-blocking")
# Don't run in headless mode for Indeed - they often detect it

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Helper functions
def safe_click(element):
    """Safely click an element using JavaScript if normal click fails"""
    try:
        element.click()
    except:
        try:
            driver.execute_script("arguments[0].click();", element)
        except Exception as e:
            print(f"Failed to click element: {e}")
            return False
    return True

def wait_and_click(by, value, timeout=10):
    """Wait for an element to be clickable and then click it"""
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable((by, value))
        )
        return safe_click(element)
    except Exception as e:
        print(f"Failed to wait and click element ({by}, {value}): {e}")
        return False

def fill_form_field(field, value):
    """Fill a form field with a given value, with typing simulation"""
    try:
        field.clear()
        # Type like a human with slight pauses between characters
        for character in value:
            field.send_keys(character)
            time.sleep(random.uniform(0.05, 0.15))
        return True
    except Exception as e:
        print(f"Failed to fill form field: {e}")
        return False

def handle_screening_questions():
    """Handle Indeed-specific screening questions"""
    try:
        # Look for question containers
        question_containers = driver.find_elements(By.CSS_SELECTOR, 
            ".ia-Questions-item, .ia-BasePage-component, .ia-MultifieldQuestion-container")
        
        if not question_containers:
            return True  # No questions found
        
        print(f"Found {len(question_containers)} potential question containers")
        
        for container in question_containers:
            try:
                # Try to get the question text
                question_elements = container.find_elements(By.CSS_SELECTOR, 
                    "label, .ia-BasePage-component-textContainer, .ia-Questions-item-label")
                
                question_text = ""
                if question_elements:
                    question_text = question_elements[0].text.lower()
                    print(f"Processing question: {question_text}")
                
                # Check if this is a work experience question
                experience_input = False
                for tech, years in experience_years.items():
                    if tech.lower() in question_text:
                        experience_input = True
                        # Look for input fields
                        inputs = container.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='number']")
                        if inputs:
                            fill_form_field(inputs[0], years)
                            print(f"Filled {tech} experience with {years} years")
                            break
                
                if experience_input:
                    continue
                
                # Handle radio buttons and checkboxes
                radio_inputs = container.find_elements(By.CSS_SELECTOR, "input[type='radio'], input[type='checkbox']")
                for radio in radio_inputs:
                    # Get the label text
                    label_id = radio.get_attribute("id")
                    label_text = ""
                    
                    if label_id:
                        labels = driver.find_elements(By.CSS_SELECTOR, f"label[for='{label_id}']")
                        if labels:
                            label_text = labels[0].text.lower()
                    
                    # Make decisions based on question type
                    should_select = False
                    
                    if "visa" in question_text or "sponsor" in question_text:
                        if user_info["need_sponsorship"] and "yes" in label_text:
                            should_select = True
                        elif not user_info["need_sponsorship"] and "no" in label_text:
                            should_select = True
                    
                    elif "relocate" in question_text:
                        if user_info["willing_relocate"] and "yes" in label_text:
                            should_select = True
                        elif not user_info["willing_relocate"] and "no" in label_text:
                            should_select = True
                    
                    elif "authorized" in question_text or "eligible" in question_text or "legally" in question_text:
                        if user_info["work_authorized"] and "yes" in label_text:
                            should_select = True
                        elif not user_info["work_authorized"] and "no" in label_text:
                            should_select = True
                    
                    elif "commute" in question_text or "travel" in question_text:
                        if user_info["can_commute"] and "yes" in label_text:
                            should_select = True
                        elif not user_info["can_commute"] and "no" in label_text:
                            should_select = True
                    
                    elif "criminal" in question_text:
                        if user_info["criminal_record"] and "yes" in label_text:
                            should_select = True
                        elif not user_info["criminal_record"] and "no" in label_text:
                            should_select = True
                    
                    elif "gender" in question_text:
                        if user_info["gender"].lower() in label_text:
                            should_select = True
                        elif "prefer" in label_text and user_info["gender"] == "Decline":
                            should_select = True
                    
                    elif "veteran" in question_text:
                        if user_info["veteran_status"].lower() in label_text:
                            should_select = True
                        elif "prefer" in label_text and user_info["veteran_status"] == "Decline":
                            should_select = True
                    
                    elif "disability" in question_text:
                        if user_info["disability_status"].lower() in label_text:
                            should_select = True
                        elif "prefer" in label_text and user_info["disability_status"] == "Decline":
                            should_select = True
                    
                    # Default to positive answers for general questions
                    elif "willing to" in question_text or "able to" in question_text:
                        if "yes" in label_text:
                            should_select = True
                    
                    # Select appropriate option
                    if should_select and not radio.is_selected():
                        try:
                            safe_click(radio)
                            print(f"Selected option: {label_text}")
                            time.sleep(0.5)
                        except:
                            print(f"Failed to select {label_text}")
                
                # Handle text inputs and textareas
                text_inputs = container.find_elements(By.CSS_SELECTOR, "input[type='text'], textarea")
                for text_input in text_inputs:
                    # Skip if already handled as experience input
                    if experience_input:
                        continue
                    
                    # Skip if already filled
                    if text_input.get_attribute("value"):
                        continue
                    
                    field_name = text_input.get_attribute("name") or ""
                    placeholder = text_input.get_attribute("placeholder") or ""
                    aria_label = text_input.get_attribute("aria-label") or ""
                    
                    field_context = (field_name + placeholder + aria_label + question_text).lower()
                    
                    # Fill different fields appropriately
                    if "name" in field_context:
                        fill_form_field(text_input, user_info["full_name"])
                    elif "email" in field_context:
                        fill_form_field(text_input, user_info["email"])
                    elif "phone" in field_context:
                        fill_form_field(text_input, user_info["phone"])
                    elif "address" in field_context:
                        fill_form_field(text_input, user_info["address"])
                    elif "city" in field_context:
                        fill_form_field(text_input, user_info["city"])
                    elif "postal" in field_context or "zip" in field_context:
                        fill_form_field(text_input, user_info["postal"])
                    elif "state" in field_context:
                        fill_form_field(text_input, user_info["state"])
                    elif "github" in field_context:
                        fill_form_field(text_input, user_info["github"])
                    elif "linkedin" in field_context:
                        fill_form_field(text_input, user_info["linkedin"])
                    elif "university" in field_context or "education" in field_context:
                        fill_form_field(text_input, user_info["university"])
                    elif "salary" in field_context or "compensation" in field_context:
                        fill_form_field(text_input, user_info["salary_expectation"])
                    elif "available" in field_context or "start" in field_context:
                        fill_form_field(text_input, user_info["available_interview"])
                    elif text_input.tag_name == "textarea":
                        # For cover letters or other large text inputs
                        cover_letter = f"I'm excited about this opportunity and believe my skills and experience make me an excellent fit for the role. My background includes expertise in {', '.join([tech for tech, years in experience_years.items() if int(years) > 0][:5])}. I am particularly interested in this position because it aligns with my career goals in technology and software development."
                        fill_form_field(text_input, cover_letter)
                    else:
                        # For unknown fields, fill with generic positive response
                        fill_form_field(text_input, "Yes")
                
                # Handle select/dropdown elements
                select_elements = container.find_elements(By.CSS_SELECTOR, "select")
                for select_element in select_elements:
                    select = Select(select_element)
                    options = select.options
                    
                    # Skip if no options
                    if len(options) <= 1:
                        continue
                    
                    # Make selection based on field context
                    field_name = select_element.get_attribute("name") or ""
                    field_id = select_element.get_attribute("id") or ""
                    field_context = (field_name + field_id + question_text).lower()
                    
                    if "education" in field_context:
                        # Find matching education level
                        education_level = user_info["education_level"].lower()
                        found = False
                        for option in options:
                            if option.text.strip() and education_level in option.text.lower():
                                select.select_by_visible_text(option.text)
                                found = True
                                break
                        
                        if not found and len(options) > 1:
                            # Select second option if no match found (skip default option)
                            select.select_by_index(1)
                    
                    elif "experience" in field_context or "years" in field_context:
                        # Try to select an experience option close to default experience
                        default_exp = experience_years["default"]
                        found = False
                        for option in options:
                            if option.text.strip() and default_exp in option.text:
                                select.select_by_visible_text(option.text)
                                found = True
                                break
                        
                        if not found and len(options) > 1:
                            # Select second option if no match found
                            select.select_by_index(1)
                    
                    elif "shift" in field_context:
                        # Match preferred shift
                        preferred_shift = user_info["preferred_shift"].lower()
                        found = False
                        for option in options:
                            if option.text.strip() and preferred_shift in option.text.lower():
                                select.select_by_visible_text(option.text)
                                found = True
                                break
                        
                        if not found and len(options) > 1:
                            # Select second option if no match found
                            select.select_by_index(1)
                    
                    else:
                        # For unknown dropdowns, select the second option (skip default)
                        if len(options) > 1:
                            try:
                                select.select_by_index(1)
                            except:
                                print(f"Failed to select option for dropdown")
                
            except Exception as e:
                print(f"Error processing question container: {e}")
        
        return True
    except Exception as e:
        print(f"Error handling screening questions: {e}")
        return False

def login_to_indeed():
    """Login to Indeed with improved error handling"""
    try:
        driver.get("https://www.indeed.com/account/login")
        print("Navigating to Indeed login page")
        
        # Wait for the page to load fully
        time.sleep(2)
        
        # Accept cookies if prompted
        try:
            cookie_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.ID, "onetrust-accept-btn-handler"))
            )
            safe_click(cookie_button)
            print("Accepted cookies")
        except:
            print("No cookie prompt or already accepted")
        
        # Try to find email input field with different selectors
        email_selectors = [
            (By.ID, "ifl-InputFormField-3"),
            (By.NAME, "email"),
            (By.CSS_SELECTOR, "input[type='email']"),
            (By.CSS_SELECTOR, "[data-testid='login-email-input']")
        ]
        
        email_input = None
        for selector in email_selectors:
            try:
                email_input = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(selector)
                )
                if email_input:
                    break
            except:
                continue
        
        if not email_input:
            print("Could not find email input field")
            return False
        
        fill_form_field(email_input, "${config.credentials.email}")
        
        # Try to find password input with different selectors
        password_selectors = [
            (By.ID, "ifl-InputFormField-5"),
            (By.NAME, "password"),
            (By.CSS_SELECTOR, "input[type='password']"),
            (By.CSS_SELECTOR, "[data-testid='login-password-input']")
        ]
        
        password_input = None
        for selector in password_selectors:
            try:
                password_input = WebDriverWait(driver, 5).until(
                    EC.presence_of_element_located(selector)
                )
                if password_input:
                    break
            except:
                continue
        
        if not password_input:
            print("Could not find password input field")
            return False
        
        fill_form_field(password_input, "${config.credentials.password}")
        
        # Try to find and click sign in button
        signin_selectors = [
            (By.XPATH, "//button[@type='submit']"),
            (By.XPATH, "//button[contains(text(), 'Sign in')]"),
            (By.CSS_SELECTOR, "[data-testid='login-submit-button']")
        ]
        
        signin_clicked = False
        for selector in signin_selectors:
            try:
                if wait_and_click(selector[0], selector[1], timeout=5):
                    signin_clicked = True
                    break
            except:
                continue
        
        if not signin_clicked:
            print("Could not click sign in button")
            return False
        
        # Wait for login to complete by checking for navigation elements
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, "jobsNav"))
            )
            print("Successfully logged in to Indeed")
            return True
        except:
            try:
                # Alternative way to check if logged in
                WebDriverWait(driver, 15).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, ".gnav-loggedIn"))
                )
                print("Successfully logged in to Indeed")
                return True
            except:
                print("Could not confirm successful login")
                return False
                
    except Exception as e:
        print(f"Error during Indeed login: {e}")
        return False

def apply_to_indeed_job(job_url):
    """Apply to an Indeed job with comprehensive form handling"""
    try:
        # Navigate to the job URL
        driver.get(job_url)
        print(f"Navigating to job: {job_url}")
        
        # Wait for the job page to load
        time.sleep(3)
        
        # Find and click apply button
        apply_button_selectors = [
            (By.CSS_SELECTOR, ".ia-IndeedApplyButton"),
            (By.XPATH, "//button[contains(text(), 'Apply now')]"),
            (By.XPATH, "//a[contains(text(), 'Apply on company site')]"),
            (By.CSS_SELECTOR, "[data-testid='apply-button-link']")
        ]
        
        apply_clicked = False
        for selector in apply_button_selectors:
            try:
                if wait_and_click(selector[0], selector[1], timeout=5):
                    apply_clicked = True
                    print("Clicked apply button")
                    break
            except:
                continue
        
        if not apply_clicked:
            print("Could not find or click apply button")
            return False
        
        # Handle different application scenarios
        
        # Scenario 1: "Apply on company site" - this takes us to an external site
        try:
            company_site_check = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Continue') or contains(text(), 'company site')]"))
            )
            print("This job requires applying on the company website")
            
            # Switch to the company site tab if we're redirected
            if len(driver.window_handles) > 1:
                driver.switch_to.window(driver.window_handles[1])
                print("Switched to company website tab")
                time.sleep(3)
            
            # Cannot reliably automate external sites, just report success in reaching it
            return True
        except:
            pass
        
        # Scenario 2: Indeed Easy Apply
        
        # Wait for application form to load
        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".ia-BasePage-component, .ia-ContactInfo"))
            )
            print("Indeed Easy Apply form detected")
        except:
            print("Could not detect application form")
            return False
        
        # Process the multi-step application
        current_step = 1
        max_steps = 15  # Safety limit
        
        while current_step <= max_steps:
            print(f"Processing application step {current_step}")
            time.sleep(2)  # Wait for page elements to load
            
            # Handle screening questions for the current step
            handle_screening_questions()
            
            # Look for the continue/next button
            continue_button_selectors = [
                (By.CSS_SELECTOR, ".ia-continueButton button"),
                (By.XPATH, "//button[contains(text(), 'Continue')]"),
                (By.XPATH, "//button[contains(text(), 'Next')]"),
                (By.CSS_SELECTOR, "[data-testid='continue-button']")
            ]
            
            continue_clicked = False
            for selector in continue_button_selectors:
                try:
                    # Wait up to 5 seconds for the button to be clickable
                    continue_button = WebDriverWait(driver, 5).until(
                        EC.element_to_be_clickable(selector)
                    )
                    
                    if continue_button:
                        # Scroll to button and click
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", continue_button)
                        time.sleep(0.5)
                        safe_click(continue_button)
                        print("Clicked continue/next button")
                        continue_clicked = True
                        current_step += 1
                        time.sleep(2)  # Wait for next page to load
                        break
                except:
                    continue
            
            # Look for submit application button (final step)
            if not continue_clicked:
                submit_button_selectors = [
                    (By.XPATH, "//button[contains(text(), 'Submit')]"),
                    (By.XPATH, "//button[contains(text(), 'Apply')]"),
                    (By.CSS_SELECTOR, "[data-testid='submit-application-button']")
                ]
                
                submit_clicked = False
                for selector in submit_button_selectors:
                    try:
                        submit_button = WebDriverWait(driver, 5).until(
                            EC.element_to_be_clickable(selector)
                        )
                        
                        if submit_button:
                            # Scroll to button and click
                            driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", submit_button)
                            time.sleep(0.5)
                            safe_click(submit_button)
                            print("Submitted application!")
                            submit_clicked = True
                            time.sleep(3)  # Wait for confirmation
                            return True
                    except:
                        continue
                
                if not submit_clicked:
                    print("Could not find next or submit button, application process may be complete")
                    break
        
        # Check for application confirmation
        try:
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Applied') or contains(text(), 'Success') or contains(text(), 'Thank')]"))
            )
            print("Application confirmed successful!")
            return True
        except:
            print("Could not confirm application success, but process completed")
            return True
            
    except Exception as e:
        print(f"Error applying to Indeed job: {e}")
        return False

# Main execution flow
try:
    # Login to Indeed first
    if login_to_indeed():
        # Use the URL that will be provided when the script is downloaded/created
        job_url = "JOB_URL_PLACEHOLDER"
        
        # Apply to the job
        if apply_to_indeed_job(job_url):
            print("Successfully applied to job!")
            
            # Log the application
            try:
                log_file = "indeed_applications_log.txt"
                with open(log_file, "a") as f:
                    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    f.write(f"{timestamp} - Applied to: {job_url}\\n")
            except:
                print("Could not write to log file")
        else:
            print("Could not complete job application")
    else:
        print("Failed to log in to Indeed")
except Exception as e:
    print(f"An error occurred in the main execution: {e}")
finally:
    # Wait before closing the browser
    time.sleep(5)
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
