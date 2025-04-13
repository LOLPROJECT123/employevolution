// This script runs on job sites and can extract job information
console.log("EmployEvolution extension loaded");

// Enhanced job data extraction
function extractJobData() {
  let title = "";
  let company = "";
  let location = "";
  let description = "";
  let salary = "";
  let requirements = [];
  let postedDate = "";
  let applyUrl = "";
  
  // Different extraction logic based on the current site
  if (window.location.hostname.includes("linkedin.com")) {
    // LinkedIn specific extraction
    const titleElement = document.querySelector(".job-details-jobs-unified-top-card__job-title");
    if (titleElement) title = titleElement.textContent.trim();
    
    const companyElement = document.querySelector(".job-details-jobs-unified-top-card__company-name");
    if (companyElement) company = companyElement.textContent.trim();
    
    const locationElement = document.querySelector(".job-details-jobs-unified-top-card__bullet");
    if (locationElement) location = locationElement.textContent.trim();
    
    const descriptionElement = document.querySelector(".jobs-description-content");
    if (descriptionElement) description = descriptionElement.textContent.trim();
    
    // Try to find Apply button URL
    const applyButton = document.querySelector("button.jobs-apply-button");
    if (applyButton) {
      applyUrl = window.location.href;
    }
    
    // Try to extract posted date
    const postedElement = document.querySelector(".jobs-unified-top-card__posted-date");
    if (postedElement) postedDate = postedElement.textContent.trim();
    
    // Try to extract salary if visible
    const salaryElement = document.querySelector(".jobs-unified-top-card__salary-info");
    if (salaryElement) salary = salaryElement.textContent.trim();
  } 
  else if (window.location.hostname.includes("indeed.com")) {
    // Indeed specific extraction
    const titleElement = document.querySelector(".jobsearch-JobInfoHeader-title");
    if (titleElement) title = titleElement.textContent.trim();
    
    const companyElement = document.querySelector("[data-testid='inlineCompanyName']");
    if (companyElement) company = companyElement.textContent.trim();
    
    const locationElement = document.querySelector("[data-testid='jobLocationText']");
    if (locationElement) location = locationElement.textContent.trim();
    
    // Description
    const descriptionElement = document.querySelector("#jobDescriptionText");
    if (descriptionElement) description = descriptionElement.textContent.trim();
    
    // Apply button
    const applyButton = document.querySelector("[data-testid='applyButton-top']");
    if (applyButton && applyButton.tagName === 'A') {
      applyUrl = applyButton.href;
    } else {
      applyUrl = window.location.href;
    }
    
    // Try to extract posted date
    const dateElement = document.querySelector("[data-testid='jobPostDate']");
    if (dateElement) postedDate = dateElement.textContent.trim();
  }
  else if (window.location.hostname.includes("levels.fyi")) {
    // Levels.fyi specific extraction
    const titleElement = document.querySelector(".job-title");
    if (titleElement) title = titleElement.textContent.trim();
    
    const companyElement = document.querySelector(".company-name");
    if (companyElement) company = companyElement.textContent.trim();
    
    const locationElement = document.querySelector(".job-location");
    if (locationElement) location = locationElement.textContent.trim();
    
    // Get description
    const descriptionElement = document.querySelector(".job-description");
    if (descriptionElement) description = descriptionElement.textContent.trim();
    
    // Get apply URL if available
    const applyButton = document.querySelector("a.apply-button");
    if (applyButton) {
      applyUrl = applyButton.href;
    } else {
      applyUrl = window.location.href;
    }
    
    // Salary information is often available on levels.fyi
    const salaryElement = document.querySelector(".compensation");
    if (salaryElement) salary = salaryElement.textContent.trim();
  }
  
  // Generic extraction as fallback for other sites
  if (!title || !company) {
    // Generic extraction logic for any site
    // Look for job title patterns
    const possibleTitleElements = document.querySelectorAll("h1, h2, .job-title, .position-title, [class*='title']");
    for (const el of possibleTitleElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 100) {
        title = text;
        break;
      }
    }
    
    // Look for company patterns
    const possibleCompanyElements = document.querySelectorAll("[class*='company'], [class*='employer'], .organization");
    for (const el of possibleCompanyElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 50) {
        company = text;
        break;
      }
    }
    
    // Look for location patterns
    const possibleLocationElements = document.querySelectorAll("[class*='location'], [class*='address'], .city");
    for (const el of possibleLocationElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 50) {
        location = text;
        break;
      }
    }
  }
  
  // Extract possible requirements
  const skillsList = [];
  const requirementSections = document.querySelectorAll("ul, ol");
  for (const section of requirementSections) {
    if (section.textContent.toLowerCase().includes("skill") || 
        section.textContent.toLowerCase().includes("require") || 
        section.textContent.toLowerCase().includes("qualif")) {
      
      const items = section.querySelectorAll("li");
      for (const item of items) {
        skillsList.push(item.textContent.trim());
      }
    }
  }
  
  if (skillsList.length > 0) {
    requirements = skillsList;
  }
  
  // Try to detect form fields for auto-filling
  const formFields = detectFormFields();
  
  return { 
    title, 
    company, 
    location, 
    description, 
    requirements, 
    salary, 
    postedDate,
    applyUrl,
    formFields
  };
}

// Detect form fields on the current page for auto-filling
function detectFormFields() {
  const formFields = {
    name: null,
    email: null,
    phone: null,
    resume: null,
    coverLetter: null,
    linkedin: null,
    website: null,
    education: [],
    experience: []
  };
  
  // Check for common form field patterns
  const inputs = document.querySelectorAll('input, textarea, select');
  for (const input of inputs) {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const type = input.type;
    const placeholder = (input.placeholder || '').toLowerCase();
    const label = findLabelForInput(input);
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    // Determine field type based on attributes and label
    if (type === 'file' && (name.includes('resume') || id.includes('resume') || placeholder.includes('resume') || labelText.includes('resume'))) {
      formFields.resume = input;
    }
    else if (type === 'file' && (name.includes('cover') || id.includes('cover') || placeholder.includes('cover') || labelText.includes('cover letter'))) {
      formFields.coverLetter = input;
    }
    else if ((name.includes('first') && name.includes('name')) || 
             (id.includes('first') && id.includes('name')) || 
             placeholder === 'first name' ||
             labelText === 'first name') {
      formFields.firstName = input;
    }
    else if ((name.includes('last') && name.includes('name')) || 
             (id.includes('last') && id.includes('name')) || 
             placeholder === 'last name' ||
             labelText === 'last name') {
      formFields.lastName = input;
    }
    else if ((name.includes('name') && !name.includes('last') && !name.includes('first')) || 
             (id.includes('name') && !id.includes('last') && !id.includes('first')) || 
             placeholder === 'full name' || placeholder === 'name' ||
             labelText === 'full name' || labelText === 'name') {
      formFields.name = input;
    }
    else if (type === 'email' || name.includes('email') || id.includes('email') || placeholder.includes('email') || labelText.includes('email')) {
      formFields.email = input;
    }
    else if (type === 'tel' || name.includes('phone') || id.includes('phone') || placeholder.includes('phone') || labelText.includes('phone')) {
      formFields.phone = input;
    }
    else if (name.includes('linkedin') || id.includes('linkedin') || placeholder.includes('linkedin') || labelText.includes('linkedin')) {
      formFields.linkedin = input;
    }
    else if ((name.includes('website') || id.includes('website') || placeholder.includes('website') || labelText.includes('website')) && 
             !(name.includes('linkedin') || id.includes('linkedin'))) {
      formFields.website = input;
    }
    else if (name.includes('address') || id.includes('address') || placeholder.includes('address') || labelText.includes('address')) {
      formFields.address = input;
    }
  }
  
  return formFields;
}

// Helper function to find a label associated with an input
function findLabelForInput(input) {
  // Check for label with matching 'for' attribute
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label;
  }
  
  // Check if input is inside a label
  let parent = input.parentElement;
  while (parent) {
    if (parent.tagName === 'LABEL') {
      return parent;
    }
    parent = parent.parentElement;
  }
  
  // Look for nearby labels
  const labels = Array.from(document.querySelectorAll('label'));
  const rect = input.getBoundingClientRect();
  // Find the closest label above or to the left
  return labels.find(label => {
    const labelRect = label.getBoundingClientRect();
    // Label is above or to the left and close to the input
    return (labelRect.bottom < rect.top && Math.abs(labelRect.left - rect.left) < 100) || 
           (labelRect.right < rect.left && Math.abs(labelRect.top - rect.top) < 30);
  });
}

// Function to auto-fill application forms - Enhanced version
function autoFillApplication(userData) {
  console.log("Starting autofill with user data:", userData);
  const formFields = detectFormFields();
  let filledFields = 0;
  
  // Auto-fill detected fields
  if (formFields.firstName && userData.firstName) {
    formFields.firstName.value = userData.firstName;
    triggerInputEvent(formFields.firstName);
    filledFields++;
  }
  
  if (formFields.lastName && userData.lastName) {
    formFields.lastName.value = userData.lastName;
    triggerInputEvent(formFields.lastName);
    filledFields++;
  }
  
  if (formFields.name && userData.name) {
    formFields.name.value = userData.name;
    triggerInputEvent(formFields.name);
    filledFields++;
  }
  
  if (formFields.email && userData.email) {
    formFields.email.value = userData.email;
    triggerInputEvent(formFields.email);
    filledFields++;
  }
  
  if (formFields.phone && userData.phone) {
    formFields.phone.value = userData.phone;
    triggerInputEvent(formFields.phone);
    filledFields++;
  }
  
  if (formFields.linkedin && userData.linkedin) {
    formFields.linkedin.value = userData.linkedin;
    triggerInputEvent(formFields.linkedin);
    filledFields++;
  }
  
  if (formFields.website && userData.website) {
    formFields.website.value = userData.website;
    triggerInputEvent(formFields.website);
    filledFields++;
  }
  
  if (formFields.address && userData.address) {
    formFields.address.value = userData.address;
    triggerInputEvent(formFields.address);
    filledFields++;
  }
  
  console.log(`Auto-filled ${filledFields} fields`);
  
  // Attempt to find and click "Next" or "Continue" buttons after filling
  if (filledFields > 0) {
    setTimeout(() => {
      attemptToAdvanceForm();
    }, 500);
  }
  
  return filledFields;
}

// Helper function to trigger input events after filling fields
function triggerInputEvent(element) {
  if (!element) return;
  
  const events = ['input', 'change', 'blur'];
  events.forEach(eventType => {
    const event = new Event(eventType, { bubbles: true });
    element.dispatchEvent(event);
  });
}

// Function to attempt to advance to the next step in multi-step forms
function attemptToAdvanceForm() {
  // Common button text patterns
  const buttonPatterns = [
    'next', 'continue', 'submit', 'save', 'apply', 'proceed', 
    'siguiente', 'next step', 'review', 'weiter', 'suivant'
  ];
  
  // Look for buttons matching patterns
  const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.button'));
  
  for (const button of buttons) {
    const buttonText = button.textContent.toLowerCase() || button.value?.toLowerCase() || '';
    if (buttonPatterns.some(pattern => buttonText.includes(pattern)) && isElementVisible(button)) {
      console.log("Found potential 'Next' button:", buttonText);
      // Don't actually click, just highlight to let user confirm
      highlightElement(button);
      return;
    }
  }
}

function isElementVisible(element) {
  if (!element) return false;
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

function highlightElement(element) {
  const originalBackground = element.style.backgroundColor;
  const originalBorder = element.style.border;
  
  // Add pulsing highlight
  element.style.backgroundColor = '#ceff9e';
  element.style.border = '2px solid #4caf50';
  element.style.transition = 'all 0.3s ease';
  
  // Create tooltip
  const tooltip = document.createElement('div');
  tooltip.textContent = 'EmployEvolution found this button to continue';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '5px 10px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.zIndex = '10000';
  
  // Position tooltip above the button
  const rect = element.getBoundingClientRect();
  tooltip.style.top = (rect.top - 30 + window.scrollY) + 'px';
  tooltip.style.left = (rect.left + window.scrollX) + 'px';
  
  document.body.appendChild(tooltip);
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    element.style.backgroundColor = originalBackground;
    element.style.border = originalBorder;
    document.body.removeChild(tooltip);
  }, 3000);
}

// Send data to extension popup when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getJobData") {
    sendResponse(extractJobData());
    return true;
  }
  
  if (request.action === "autoFillApplication" && request.userData) {
    const filledFields = autoFillApplication(request.userData);
    sendResponse({ success: true, filledFields });
    return true;
  }
  
  return true;
});

// Initialize by checking if we're on a job page
function initialize() {
  const url = window.location.href;
  
  // Check if this appears to be a job listing page
  if (
    url.includes('/jobs/') || 
    url.includes('/job/') || 
    url.includes('/careers/') || 
    url.includes('/career/') || 
    url.includes('/position/') || 
    url.includes('apply') ||
    document.title.toLowerCase().includes('job') ||
    document.title.toLowerCase().includes('career')
  ) {
    console.log("EmployEvolution: Detected possible job listing page");
    
    // Extract initial job data
    const jobData = extractJobData();
    console.log("EmployEvolution: Initial job data extracted", jobData);
    
    // Notify extension that we're on a job page
    try {
      chrome.runtime.sendMessage({
        action: "onJobPage",
        jobData: jobData
      });
    } catch (e) {
      console.log("EmployEvolution: Unable to contact extension", e);
    }
  }
}

// Run initialization
setTimeout(initialize, 1000);
