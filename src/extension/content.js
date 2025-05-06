// Content script for the Streamline Chrome Extension

console.log("Streamline content script loaded");

// Keep track of detected jobs and forms
let detectedJobs = [];
let detectedForms = [];

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getJobData") {
    // Extract job data from the current page
    const jobData = extractJobData();
    sendResponse(jobData);
  }
  
  if (request.action === "detectApplicationForm") {
    // Detect if this page contains a job application form
    const formData = detectApplicationForm();
    sendResponse(formData);
  }
  
  if (request.action === "autoFillApplication") {
    // Auto-fill the application form with user data
    const result = autoFillApplicationForm(request.userData);
    sendResponse(result);
  }
  
  if (request.action === "captureJob") {
    // Capture job data from the current page
    const jobData = extractJobData();
    
    // Send the job data to the background script
    chrome.runtime.sendMessage({
      action: "onJobPage",
      jobData
    });
    
    sendResponse({ success: true, jobData });
  }
  
  // Keep the message channel open
  return true;
});

// Extract job data from the current page
function extractJobData() {
  // Default values
  const jobData = {
    title: "",
    company: "",
    location: "",
    applyUrl: window.location.href,
    description: "",
    salary: {
      min: 0,
      max: 0,
      currency: "USD"
    },
    postedAt: new Date().toISOString(),
    skills: [],
    datePosted: new Date().toLocaleDateString(),
  };

  try {
    // Extract job title - look for typical job title elements
    const titleSelectors = [
      'h1',
      '.job-title',
      '[data-automation="jobTitle"]',
      '.listings-item__title',
      '[data-testid="jobTitle"]',
      '.jobsearch-JobInfoHeader-title'
    ];
    
    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement && titleElement.textContent.trim()) {
        jobData.title = titleElement.textContent.trim();
        break;
      }
    }
    
    // Extract company name - look for typical company name elements
    const companySelectors = [
      '.company-name',
      '.jobsearch-InlineCompanyRating > div:first-child',
      '[data-automation="jobCompany"]',
      '[data-testid="company-name"]',
      '.job-company'
    ];
    
    for (const selector of companySelectors) {
      const companyElement = document.querySelector(selector);
      if (companyElement && companyElement.textContent.trim()) {
        jobData.company = companyElement.textContent.trim();
        break;
      }
    }
    
    // Extract location - look for typical location elements
    const locationSelectors = [
      '.location',
      '.job-location',
      '[data-automation="jobLocation"]',
      '[data-testid="location"]',
      '.jobsearch-JobInfoHeader-locationText'
    ];
    
    for (const selector of locationSelectors) {
      const locationElement = document.querySelector(selector);
      if (locationElement && locationElement.textContent.trim()) {
        jobData.location = locationElement.textContent.trim();
        break;
      }
    }
    
    // Extract job description - look for typical description elements
    const descriptionSelectors = [
      '.job-description',
      '#jobDescriptionText',
      '[data-automation="jobDescription"]',
      '[data-testid="job-description"]',
      '.description'
    ];
    
    for (const selector of descriptionSelectors) {
      const descElement = document.querySelector(selector);
      if (descElement && descElement.textContent.trim()) {
        jobData.description = descElement.textContent.trim();
        break;
      }
    }
    
    // Extract apply URL if there's a dedicated apply button
    const applyButtonSelectors = [
      'a.apply-button',
      'a[data-automation="apply-link"]',
      'a.apply-now-button',
      'a[href*="apply"]',
      'a.job-apply-button'
    ];
    
    for (const selector of applyButtonSelectors) {
      const applyButton = document.querySelector(selector);
      if (applyButton && applyButton.href) {
        jobData.applyUrl = applyButton.href;
        break;
      }
    }
    
    // Extract skills from the job description using basic keyword analysis
    if (jobData.description) {
      const commonSkills = [
        "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", 
        "Java", "C#", ".NET", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "SQL",
        "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
        "HTML", "CSS", "Sass", "LESS", "Git", "CI/CD", "Jenkins", "GitHub Actions"
      ];
      
      jobData.skills = commonSkills.filter(skill => 
        new RegExp(`\\b${skill}\\b`, 'i').test(jobData.description)
      );
    }
    
    // Extract date posted if available
    const dateSelectors = [
      '.date',
      '.job-date',
      '[data-automation="jobDate"]',
      '[data-testid="date-posted"]'
    ];
    
    for (const selector of dateSelectors) {
      const dateElement = document.querySelector(selector);
      if (dateElement && dateElement.textContent.trim()) {
        jobData.datePosted = dateElement.textContent.trim();
        break;
      }
    }
    
    // Look for salary information
    const salarySelectors = [
      '.salary',
      '.compensation',
      '[data-testid="salary-range"]',
      '[data-automation="jobSalary"]'
    ];
    
    for (const selector of salarySelectors) {
      const salaryElement = document.querySelector(selector);
      if (salaryElement && salaryElement.textContent.trim()) {
        // Simple regex to extract salary range
        const salaryText = salaryElement.textContent.trim();
        const match = salaryText.match(/(\$[\d,]+)(?:[^\d$]+(\$[\d,]+))?/);
        
        if (match) {
          // Extract currency and values
          const currencyMatch = salaryText.match(/(\$|€|£|¥)/);
          jobData.salary.currency = currencyMatch ? currencyMatch[1] : "USD";
          
          // Remove commas and convert to numbers
          if (match[1]) {
            jobData.salary.min = parseInt(match[1].replace(/[$,]/g, ''), 10);
          }
          
          if (match[2]) {
            jobData.salary.max = parseInt(match[2].replace(/[$,]/g, ''), 10);
          } else if (match[1]) {
            // If only one number is found, use it for both min and max
            jobData.salary.max = jobData.salary.min;
          }
        }
        
        break;
      }
    }
  } catch (error) {
    console.error("Error extracting job data:", error);
  }
  
  // Add unique ID for tracking
  jobData.id = generateJobId();
  
  // Notify that we detected a job
  console.log("Detected job:", jobData);
  
  return jobData;
}

// Generate a unique ID for the job
function generateJobId() {
  return 'job_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Detect if the current page is an application form
function detectApplicationForm() {
  const formElements = document.querySelectorAll('form');
  const inputElements = document.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
  
  // Check if we have forms with enough inputs to be an application form
  const isApplicationForm = formElements.length > 0 && inputElements.length >= 3;
  
  // Check if the URL or page title contains application-related keywords
  const applicationKeywords = ['apply', 'application', 'job application', 'submit', 'resume'];
  const urlContainsKeyword = applicationKeywords.some(keyword => window.location.href.toLowerCase().includes(keyword));
  const titleContainsKeyword = applicationKeywords.some(keyword => document.title.toLowerCase().includes(keyword));
  
  // Check specific form field identifiers that indicate an application form
  const formFieldIdentifiers = [
    'name', 'first name', 'last name', 'email', 'phone', 'resume', 'cv',
    'cover letter', 'experience', 'education', 'skills'
  ];
  
  let detectedFields = [];
  
  inputElements.forEach(element => {
    const elementIdentifiers = [
      element.name?.toLowerCase(),
      element.id?.toLowerCase(),
      element.getAttribute('placeholder')?.toLowerCase(),
      element.getAttribute('aria-label')?.toLowerCase()
    ].filter(Boolean);
    
    for (const identifier of elementIdentifiers) {
      if (formFieldIdentifiers.some(fieldId => identifier.includes(fieldId))) {
        detectedFields.push(identifier);
      }
    }
  });
  
  const formData = {
    isApplicationForm: isApplicationForm && (urlContainsKeyword || titleContainsKeyword || detectedFields.length >= 2),
    url: window.location.href,
    title: document.title,
    detectedFields,
    formCount: formElements.length,
    inputCount: inputElements.length
  };
  
  if (formData.isApplicationForm) {
    console.log("Detected application form:", formData);
    
    // Notify background script of form detection
    chrome.runtime.sendMessage({
      action: "applicationFormDetected",
      formData
    });
  }
  
  return formData;
}

// Auto-fill application form with user data
function autoFillApplicationForm(userData) {
  if (!userData) {
    return {
      success: false,
      error: "No user data provided"
    };
  }
  
  console.log("Attempting to auto-fill form with:", userData);
  
  const filledFields = [];
  
  try {
    // Map of field identifiers to user data properties
    const fieldMappings = {
      // Name fields
      'first(\\s|-)*name': userData.firstName,
      'last(\\s|-)*name': userData.lastName,
      'full(\\s|-)*name': `${userData.firstName} ${userData.lastName}`.trim(),
      'name': `${userData.firstName} ${userData.lastName}`.trim(),
      
      // Contact information
      'email': userData.email,
      'phone': userData.phone,
      'mobile': userData.phone,
      'address': userData.address,
      'city': userData.city,
      'state': userData.state,
      'zip': userData.zipCode,
      'postal': userData.zipCode,
      'country': userData.country,
      
      // Professional fields
      'linkedin': userData.linkedin,
      'github': userData.github,
      'website': userData.website,
      'portfolio': userData.website,
      'experience': userData.experience?.join(', ') || '',
      'education': userData.education?.join(', ') || '',
      'skills': userData.skills?.join(', ') || ''
    };
    
    // Find and fill form fields
    document.querySelectorAll('input, textarea, select').forEach(element => {
      if (element.type === 'hidden' || element.disabled || !element.name && !element.id && !element.placeholder) {
        return;
      }
      
      // Collect identifiers for this element
      const elementIdentifiers = [
        element.name?.toLowerCase(),
        element.id?.toLowerCase(),
        element.placeholder?.toLowerCase(),
        element.getAttribute('aria-label')?.toLowerCase(),
        element.labels?.[0]?.textContent?.toLowerCase()
      ].filter(Boolean);
      
      // Try to match with field mappings
      for (const [pattern, value] of Object.entries(fieldMappings)) {
        if (!value) continue;
        
        const regex = new RegExp(pattern, 'i');
        const matches = elementIdentifiers.some(id => regex.test(id));
        
        if (matches) {
          if (element.tagName === 'SELECT') {
            // For select elements, find the option that contains the value
            for (const option of element.options) {
              if (option.text.toLowerCase().includes(value.toLowerCase())) {
                element.value = option.value;
                filledFields.push({ name: element.name || element.id, value });
                break;
              }
            }
          } else {
            // For input and textarea elements
            element.value = value;
            filledFields.push({ name: element.name || element.id, value });
          }
          
          // Dispatch input event to trigger validation
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          
          break; // Stop after first match
        }
      }
    });
    
    // If resume upload field is found, show notification (can't auto-upload files)
    const resumeField = Array.from(document.querySelectorAll('input[type="file"]')).find(input => {
      const identifiers = [
        input.name?.toLowerCase(),
        input.id?.toLowerCase(),
        input.getAttribute('accept')?.toLowerCase(),
        input.labels?.[0]?.textContent?.toLowerCase()
      ].filter(Boolean);
      
      return identifiers.some(id => /resume|cv|upload/i.test(id));
    });
    
    if (resumeField) {
      console.log("Resume upload field detected:", resumeField);
    }
    
    return {
      success: filledFields.length > 0,
      filledFields: {
        count: filledFields.length,
        fields: filledFields.map(f => f.name)
      },
      resumeFieldDetected: !!resumeField
    };
  } catch (error) {
    console.error("Error auto-filling form:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to observe DOM mutations for dynamic content
function observeDynamicContent() {
  const observer = new MutationObserver((mutations) => {
    // Check if we need to scan for job data or forms
    const shouldCheckForJobs = !detectedJobs.includes(window.location.href);
    const shouldCheckForForms = !detectedForms.includes(window.location.href);
    
    if (shouldCheckForJobs) {
      // Try to extract job data again (for dynamically loaded content)
      const jobData = extractJobData();
      
      // If we found valid job data, notify background script
      if (jobData.title && jobData.company) {
        chrome.runtime.sendMessage({
          action: "onJobPage",
          jobData
        });
        
        detectedJobs.push(window.location.href);
      }
    }
    
    if (shouldCheckForForms) {
      // Check for application forms (for dynamically loaded forms)
      const formData = detectApplicationForm();
      
      if (formData.isApplicationForm) {
        detectedForms.push(window.location.href);
      }
    }
  });
  
  // Observe the entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initial check for job information
  const jobData = extractJobData();
  
  // If we found valid job data, notify background script
  if (jobData.title && jobData.company) {
    chrome.runtime.sendMessage({
      action: "onJobPage",
      jobData
    });
    
    detectedJobs.push(window.location.href);
  }
  
  // Initial check for application forms
  const formData = detectApplicationForm();
  
  if (formData.isApplicationForm) {
    detectedForms.push(window.location.href);
  }
  
  // Set up observer for dynamic content
  observeDynamicContent();
});

// Check immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  const jobData = extractJobData();
  if (jobData.title && jobData.company) {
    chrome.runtime.sendMessage({
      action: "onJobPage",
      jobData
    });
    detectedJobs.push(window.location.href);
  }
  
  const formData = detectApplicationForm();
  if (formData.isApplicationForm) {
    detectedForms.push(window.location.href);
  }
  
  observeDynamicContent();
}
