
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
  const inputs = document.querySelectorAll('input, textarea');
  for (const input of inputs) {
    const name = input.name.toLowerCase();
    const id = input.id.toLowerCase();
    const type = input.type;
    const placeholder = (input.placeholder || '').toLowerCase();
    
    // Determine field type based on attributes
    if (type === 'file' && (name.includes('resume') || id.includes('resume') || placeholder.includes('resume'))) {
      formFields.resume = input;
    }
    else if (type === 'file' && (name.includes('cover') || id.includes('cover') || placeholder.includes('cover'))) {
      formFields.coverLetter = input;
    }
    else if ((name.includes('name') || id.includes('name') || placeholder.includes('name')) && 
             !(name.includes('last') || id.includes('last') || placeholder.includes('last'))) {
      formFields.name = input;
    }
    else if (type === 'email' || name.includes('email') || id.includes('email') || placeholder.includes('email')) {
      formFields.email = input;
    }
    else if (type === 'tel' || name.includes('phone') || id.includes('phone') || placeholder.includes('phone')) {
      formFields.phone = input;
    }
    else if (name.includes('linkedin') || id.includes('linkedin') || placeholder.includes('linkedin')) {
      formFields.linkedin = input;
    }
    else if ((name.includes('website') || id.includes('website') || placeholder.includes('website')) && 
             !(name.includes('linkedin') || id.includes('linkedin'))) {
      formFields.website = input;
    }
  }
  
  return formFields;
}

// Function to auto-fill application forms
function autoFillApplication(userData) {
  const formFields = detectFormFields();
  let filledFields = 0;
  
  // Auto-fill detected fields
  if (formFields.name && userData.name) {
    formFields.name.value = userData.name;
    filledFields++;
  }
  
  if (formFields.email && userData.email) {
    formFields.email.value = userData.email;
    filledFields++;
  }
  
  if (formFields.phone && userData.phone) {
    formFields.phone.value = userData.phone;
    filledFields++;
  }
  
  if (formFields.linkedin && userData.linkedin) {
    formFields.linkedin.value = userData.linkedin;
    filledFields++;
  }
  
  if (formFields.website && userData.website) {
    formFields.website.value = userData.website;
    filledFields++;
  }
  
  return filledFields;
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
