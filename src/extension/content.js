// Streamline's browser extension content script
// This script runs on supported job sites and handles job data extraction and form auto-filling
console.log("Streamline extension loaded");

// Enhanced job data extraction with improved URL handling and error handling
function extractJobData() {
  try {
    const jobData = {
      title: "",
      company: "",
      location: "",
      description: "",
      requirements: [],
      salary: "",
      postedDate: "",
      applyUrl: "",
      jobType: "",
      level: "",
      remote: false,
      skills: [],
      formFields: null
    };

    // Platform-specific extraction logic
    if (window.location.hostname.includes("linkedin.com")) {
      extractLinkedInJobData(jobData);
    } 
    else if (window.location.hostname.includes("indeed.com")) {
      extractIndeedJobData(jobData);
    }
    else if (window.location.hostname.includes("greenhouse.io")) {
      extractGreenhouseJobData(jobData);
    }
    else if (window.location.hostname.includes("lever.co")) {
      extractLeverJobData(jobData);
    }
    else if (window.location.hostname.includes("workday")) {
      extractWorkdayJobData(jobData);
    }
    // Add support for new platforms
    else if (window.location.hostname.includes("simplify.jobs")) {
      extractSimplifyJobData(jobData);
    }
    else if (window.location.hostname.includes("jobright.ai")) {
      extractJobRightJobData(jobData);
    }
    else if (window.location.hostname.includes("offerpilot.ai")) {
      extractOfferPilotJobData(jobData);
    }
    else if (window.location.hostname.includes("joinhandshake.com")) {
      extractHandshakeJobData(jobData);
    }
    else {
      extractGenericJobData(jobData);
    }

    // Extract resume upload fields if on an application page
    jobData.formFields = detectFormFields();

    // Get actual apply URL with better detection
    if (!jobData.applyUrl) {
      jobData.applyUrl = findApplyUrl();
    }

    return jobData;
  } catch (error) {
    console.error("Error extracting job data:", error);
    return {
      title: "Error extracting job data",
      applyUrl: window.location.href,
      error: error.message
    };
  }
}

// --- TODO: Add extraction logic for new platforms ---

function extractSimplifyJobData(jobData) {
  // TODO: Implement extraction for simplify.jobs
  jobData.title = document.title || "Simplify.jobs position";
}

function extractJobRightJobData(jobData) {
  // TODO: Implement extraction for jobright.ai
  jobData.title = document.title || "JobRight.ai position";
}

function extractOfferPilotJobData(jobData) {
  // TODO: Implement extraction for offerpilot.ai
  jobData.title = document.title || "OfferPilot.ai position";
}

function extractHandshakeJobData(jobData) {
  // TODO: Implement extraction for joinhandshake.com
  jobData.title = document.title || "Handshake position";
}

// --- Robust autofill dispatcher for all supported platforms ---

window.addEventListener("message", (event) => {
  // Only accept messages from this window
  if (event.source !== window) return;

  // Check for autofill request
  if (event.data && event.data.type === "STREAMLINE_AUTOFILL_REQUEST") {
    try {
      const profileData = event.data.profileData;
      const formFields = detectFormFields();
      const status = tryAutofillForm(profileData, formFields);

      window.postMessage({
        type: "STREAMLINE_AUTOFILL_RESULT",
        status
      }, "*");
    } catch (error) {
      window.postMessage({
        type: "STREAMLINE_AUTOFILL_RESULT",
        status: { success: false, error: error.message }
      }, "*");
    }
  }
});

// Attempt to autofill detected form fields with profile data
function tryAutofillForm(profile, formFields) {
  let successCount = 0;
  let failCount = 0;
  const failedFields = [];

  try {
    if (!formFields) return { success: false, error: "No form fields detected" };

    // Map profile fields to form fields
    const mapping = [
      ["firstName", profile.personal?.firstName],
      ["lastName", profile.personal?.lastName],
      ["email", profile.personal?.email],
      ["phone", profile.personal?.phone],
      ["address", profile.personal?.address],
      ["city", profile.personal?.city],
      ["state", profile.personal?.state],
      ["zip", profile.personal?.zipCode],
      ["country", profile.personal?.country],
      ["linkedin", profile.personal?.linkedin],
      ["website", profile.personal?.website],
      ["resume", profile.resumePath],
      ["coverLetter", profile.coverLetterPath]
    ];

    mapping.forEach(([key, value]) => {
      const input = formFields[key];
      if (input && value) {
        try {
          input.value = value;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
          successCount++;
        } catch (e) {
          failCount++;
          failedFields.push(key);
        }
      }
    });

    // TODO: Fill education and experience if present

    return {
      success: failCount === 0,
      filled: successCount,
      failed: failCount,
      failedFields
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// LinkedIn-specific job data extraction
function extractLinkedInJobData(jobData) {
  try {
    // Job title
    const titleElement = document.querySelector(".job-details-jobs-unified-top-card__job-title, .topcard__title");
    if (titleElement) jobData.title = titleElement.textContent.trim();
    
    // Company name
    const companyElement = document.querySelector(".job-details-jobs-unified-top-card__company-name, .topcard__org-name-link");
    if (companyElement) jobData.company = companyElement.textContent.trim();
    
    // Location
    const locationElement = document.querySelector(".job-details-jobs-unified-top-card__bullet, .topcard__flavor--bullet");
    if (locationElement) jobData.location = locationElement.textContent.trim();
    
    // Description
    const descriptionElement = document.querySelector(".jobs-description-content, .description__text");
    if (descriptionElement) jobData.description = descriptionElement.textContent.trim();
    
    // Posted date
    const postedElement = document.querySelector(".jobs-unified-top-card__posted-date, .topcard__flavor--metadata");
    if (postedElement) jobData.postedDate = postedElement.textContent.trim();
    
    // Job type
    const jobTypeElement = document.querySelector(".job-details-jobs-unified-top-card__workplace-type");
    if (jobTypeElement) {
      const jobTypeText = jobTypeElement.textContent.toLowerCase().trim();
      if (jobTypeText.includes("remote")) jobData.remote = true;
      if (jobTypeText.includes("full-time")) jobData.jobType = "full-time";
      else if (jobTypeText.includes("part-time")) jobData.jobType = "part-time";
      else if (jobTypeText.includes("contract")) jobData.jobType = "contract";
      else if (jobTypeText.includes("internship")) jobData.jobType = "internship";
    }
    
    // Requirements/skills section
    const skillsContainer = document.querySelector(".job-details-skill-match-status-list");
    if (skillsContainer) {
      const skillElements = skillsContainer.querySelectorAll("li");
      skillElements.forEach(element => {
        jobData.skills.push(element.textContent.trim());
      });
    }
    
    // Better apply URL extraction
    const applyButton = document.querySelector("button.jobs-apply-button, a.apply-button");
    if (applyButton) {
      if (applyButton.tagName === 'A' && applyButton.href) {
        jobData.applyUrl = applyButton.href;
      } else {
        // For button-based apply, we'll use the current URL + a flag
        jobData.applyUrl = window.location.href;
        jobData.requiresExtensionClick = true;
      }
    }

    // Salary
    const salaryElement = document.querySelector(".job-details-jobs-unified-top-card__salary-info, .compensation");
    if (salaryElement) jobData.salary = salaryElement.textContent.trim();
    
  } catch (error) {
    console.error("Error extracting LinkedIn job data:", error);
  }
}

// Indeed-specific job data extraction
function extractIndeedJobData(jobData) {
  try {
    // Job title
    const titleElement = document.querySelector(".jobsearch-JobInfoHeader-title");
    if (titleElement) jobData.title = titleElement.textContent.trim();
    
    // Company name
    const companyElement = document.querySelector("[data-testid='inlineCompanyName'], .jobsearch-InlineCompanyRating-companyHeader");
    if (companyElement) jobData.company = companyElement.textContent.trim();
    
    // Location
    const locationElement = document.querySelector("[data-testid='jobLocationText'], .jobsearch-JobInfoHeader-subtitle > div");
    if (locationElement) jobData.location = locationElement.textContent.trim();
    
    // Description
    const descriptionElement = document.querySelector("#jobDescriptionText");
    if (descriptionElement) jobData.description = descriptionElement.textContent.trim();
    
    // Apply button - more robust detection
    let applyUrl = '';
    const applyButton = document.querySelector("[data-testid='applyButton-top'], .jobsearch-IndeedApplyButton-newDesign");
    
    if (applyButton) {
      if (applyButton.tagName === 'A' && applyButton.href) {
        applyUrl = applyButton.href;
      } else if (applyButton.closest('a') && applyButton.closest('a').href) {
        applyUrl = applyButton.closest('a').href;
      } else {
        // Button likely uses JavaScript to open the application
        applyUrl = window.location.href;
        jobData.requiresExtensionClick = true;
      }
    }
    
    // If still no apply URL, try to find other apply links
    if (!applyUrl) {
      const applyLinks = document.querySelectorAll("a[href*='apply'], a[href*='application'], .icl-Button--primary");
      for (const link of applyLinks) {
        if (link.textContent.toLowerCase().includes('apply')) {
          applyUrl = link.href;
          break;
        }
      }
    }
    
    jobData.applyUrl = applyUrl || window.location.href;
    
    // Posted date
    const dateElement = document.querySelector("[data-testid='jobPostDate'], .jobsearch-JobMetadataFooter > div");
    if (dateElement) jobData.postedDate = dateElement.textContent.trim();
    
    // Job type
    const jobDetailsList = document.querySelectorAll(".jobsearch-JobDescriptionSection-sectionItem");
    for (const item of jobDetailsList) {
      const text = item.textContent.toLowerCase();
      if (text.includes("job type") || text.includes("employment type")) {
        if (text.includes("full-time")) jobData.jobType = "full-time";
        else if (text.includes("part-time")) jobData.jobType = "part-time";
        else if (text.includes("contract")) jobData.jobType = "contract";
        else if (text.includes("internship")) jobData.jobType = "internship";
        
        if (text.includes("remote")) jobData.remote = true;
      }
    }

    // Salary information
    const salaryElement = document.querySelector(".jobsearch-JobMetadataHeader-item");
    if (salaryElement && salaryElement.textContent.includes('$')) {
      jobData.salary = salaryElement.textContent.trim();
    }
    
  } catch (error) {
    console.error("Error extracting Indeed job data:", error);
  }
}

// Greenhouse-specific job data extraction
function extractGreenhouseJobData(jobData) {
  try {
    // Job title
    const titleElement = document.querySelector(".app-title");
    if (titleElement) jobData.title = titleElement.textContent.trim();
    
    // Company name - often in the logo alt text or page title
    const logoElement = document.querySelector(".company-logo");
    if (logoElement && logoElement.alt) {
      jobData.company = logoElement.alt.trim();
    } else {
      // Try to extract from title
      const pageTitle = document.title;
      if (pageTitle.includes("at")) {
        jobData.company = pageTitle.split("at")[1].trim();
      }
    }
    
    // Location
    const locationElement = document.querySelector(".location");
    if (locationElement) jobData.location = locationElement.textContent.trim();
    
    // Description
    const descriptionElement = document.querySelector(".content-intro");
    if (descriptionElement) jobData.description = descriptionElement.textContent.trim();
    
    // Apply URL - Greenhouse typically has an application form on the same page
    jobData.applyUrl = window.location.href;
    
    // Check for a multi-page application
    const applyButton = document.querySelector("a.btn-apply, button.btn-apply");
    if (applyButton) {
      if (applyButton.tagName === 'A' && applyButton.href) {
        jobData.applyUrl = applyButton.href;
      } else {
        jobData.requiresExtensionClick = true;
      }
    }
    
    // Requirements/qualifications
    const contentBlocks = document.querySelectorAll(".section-wrapper");
    for (const block of contentBlocks) {
      const heading = block.querySelector("h3, h2");
      if (heading && (
          heading.textContent.toLowerCase().includes("requirements") || 
          heading.textContent.toLowerCase().includes("qualifications"))) {
        
        const listItems = block.querySelectorAll("li");
        for (const item of listItems) {
          jobData.requirements.push(item.textContent.trim());
        }
      }
    }
  } catch (error) {
    console.error("Error extracting Greenhouse job data:", error);
  }
}

// Lever-specific job data extraction
function extractLeverJobData(jobData) {
  try {
    // Job title
    const titleElement = document.querySelector(".posting-headline h2");
    if (titleElement) jobData.title = titleElement.textContent.trim();
    
    // Company name - usually in the logo or can be derived from URL
    const companyElement = document.querySelector(".main-header-logo img");
    if (companyElement && companyElement.alt) {
      jobData.company = companyElement.alt.trim();
    } else {
      // Extract from URL (lever.co/COMPANY_NAME/...)
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 1) {
        jobData.company = pathParts[1].replace(/-/g, ' ');
        // Capitalize company name
        jobData.company = jobData.company.charAt(0).toUpperCase() + jobData.company.slice(1);
      }
    }
    
    // Location
    const locationElement = document.querySelector(".posting-category-location .location");
    if (locationElement) jobData.location = locationElement.textContent.trim();
    
    // Description - Lever has a structured layout
    const descriptionElement = document.querySelector(".posting-description");
    if (descriptionElement) jobData.description = descriptionElement.textContent.trim();
    
    // Apply URL - Lever typically has an "Apply for this job" button
    const applyButton = document.querySelector(".postings-btn-wrapper a, a.postings-btn");
    if (applyButton && applyButton.href) {
      jobData.applyUrl = applyButton.href;
    } else {
      jobData.applyUrl = window.location.href;
    }
    
    // Requirements - look for specific sections
    const sections = document.querySelectorAll(".section");
    for (const section of sections) {
      const heading = section.querySelector("h3");
      if (heading && (
          heading.textContent.toLowerCase().includes("requirements") || 
          heading.textContent.toLowerCase().includes("qualifications"))) {
        
        const listItems = section.querySelectorAll("li");
        for (const item of listItems) {
          jobData.requirements.push(item.textContent.trim());
        }
      }
    }
    
    // Work type/level
    const categories = document.querySelectorAll(".posting-category-tag");
    for (const category of categories) {
      const text = category.textContent.toLowerCase();
      if (text.includes("full-time")) jobData.jobType = "full-time";
      else if (text.includes("part-time")) jobData.jobType = "part-time";
      else if (text.includes("contract")) jobData.jobType = "contract";
      else if (text.includes("internship")) jobData.jobType = "internship";
      
      if (text.includes("remote")) jobData.remote = true;
      
      // Try to determine level
      if (text.includes("senior")) jobData.level = "senior";
      else if (text.includes("lead")) jobData.level = "lead";
      else if (text.includes("manager")) jobData.level = "manager";
      else if (text.includes("entry")) jobData.level = "entry";
      else if (text.includes("junior")) jobData.level = "entry";
    }
  } catch (error) {
    console.error("Error extracting Lever job data:", error);
  }
}

// Workday-specific job data extraction
function extractWorkdayJobData(jobData) {
  try {
    // Job title
    const titleElement = document.querySelector(".css-1l77fat, .css-9z5rtv, .GWTJobTitle");
    if (titleElement) jobData.title = titleElement.textContent.trim();
    
    // Company name can be hard to extract from Workday - often in the logo or page title
    const companyElement = document.querySelector(".css-1sgb1se, .gwt-Label");
    if (companyElement) jobData.company = companyElement.textContent.trim();
    
    if (!jobData.company) {
      // Try to get it from the page title
      const titleParts = document.title.split('|');
      if (titleParts.length > 1) {
        jobData.company = titleParts[titleParts.length - 1].trim();
      }
    }
    
    // Location
    const locationElement = document.querySelector(".css-1sg4kaf, .css-129fb8, .css-1ixbp0l");
    if (locationElement) jobData.location = locationElement.textContent.trim();
    
    // Description
    const descriptionElement = document.querySelector(".css-1sgpksa-positionDescription, .css-1ujt8f5, .css-1d59u00");
    if (descriptionElement) jobData.description = descriptionElement.textContent.trim();
    
    // Apply URL - Workday typically has an "Apply" button
    const applyButton = document.querySelector("a.css-1u0oqcg, button.css-1hddt8t, a.gwt-Anchor");
    if (applyButton) {
      if (applyButton.tagName === 'A' && applyButton.href) {
        jobData.applyUrl = applyButton.href;
      } else {
        jobData.applyUrl = window.location.href;
        jobData.requiresExtensionClick = true;
      }
    } else {
      jobData.applyUrl = window.location.href;
    }
    
    // Job type / work model
    const jobMetadata = document.querySelectorAll(".css-g7iuka, .css-4obbn, .css-1iwhhmz");
    for (const meta of jobMetadata) {
      const text = meta.textContent.toLowerCase();
      
      if (text.includes("full-time")) jobData.jobType = "full-time";
      else if (text.includes("part-time")) jobData.jobType = "part-time";
      else if (text.includes("contract")) jobData.jobType = "contract";
      else if (text.includes("internship")) jobData.jobType = "internship";
      
      if (text.includes("remote")) jobData.remote = true;
    }
  } catch (error) {
    console.error("Error extracting Workday job data:", error);
  }
}

// Generic job data extraction for unsupported sites
function extractGenericJobData(jobData) {
  try {
    // Look for job title in common locations
    const possibleTitleElements = document.querySelectorAll("h1, h2, .job-title, .position-title, [class*='title']");
    for (const el of possibleTitleElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 100) {
        jobData.title = text;
        break;
      }
    }
    
    // Look for company name
    const possibleCompanyElements = document.querySelectorAll("[class*='company'], [class*='employer'], .organization");
    for (const el of possibleCompanyElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 50) {
        jobData.company = text;
        break;
      }
    }
    
    // Look for location
    const possibleLocationElements = document.querySelectorAll("[class*='location'], [class*='address'], .city");
    for (const el of possibleLocationElements) {
      const text = el.textContent.trim();
      if (text.length > 0 && text.length < 50) {
        jobData.location = text;
        break;
      }
    }
    
    // Description - look for main content area
    const possibleDescElements = document.querySelectorAll("[class*='description'], [class*='details'], [class*='content']");
    for (const el of possibleDescElements) {
      if (el.textContent.length > 100) {
        jobData.description = el.textContent.trim();
        break;
      }
    }
    
    // Apply URL - look for apply buttons/links
    const applyLinks = document.querySelectorAll("a[href*='apply'], button[class*='apply'], a[class*='apply']");
    for (const link of applyLinks) {
      if (link.textContent.toLowerCase().includes('apply')) {
        if (link.tagName === 'A' && link.href) {
          jobData.applyUrl = link.href;
        } else {
          jobData.applyUrl = window.location.href;
          jobData.requiresExtensionClick = true;
        }
        break;
      }
    }
    
    if (!jobData.applyUrl) {
      jobData.applyUrl = window.location.href;
    }
    
    // Try to extract requirements
    const requirementSections = document.querySelectorAll("ul, ol");
    for (const section of requirementSections) {
      if (section.textContent.toLowerCase().includes("requirement") || 
          section.textContent.toLowerCase().includes("qualification")) {
        const items = section.querySelectorAll("li");
        for (const item of items) {
          jobData.requirements.push(item.textContent.trim());
        }
      }
    }
  } catch (error) {
    console.error("Error extracting generic job data:", error);
  }
}

// Find apply URL with better heuristics
function findApplyUrl() {
  // Try to find the most likely apply button/link
  const applySelectors = [
    // Generic apply buttons
    "a.apply-button", 
    "a[href*='apply']", 
    "button.apply", 
    "a.apply",
    "a[data-automation='apply-button']",
    "a.job-apply-button",
    // LinkedIn
    "button.jobs-apply-button",
    // Indeed
    "[data-testid='applyButton-top']",
    ".jobsearch-IndeedApplyButton",
    // Greenhouse
    "a.btn-apply",
    "button.btn-apply",
    // Lever
    ".postings-btn-wrapper a",
    "a.postings-btn",
    // Workday
    "a.css-1u0oqcg", 
    "button.css-1hddt8t", 
    "a.gwt-Anchor",
    // BrassRing
    "a#dialogApplyButton",
    // Taleo
    "a.btn-apply-now"
  ];
  
  for (const selector of applySelectors) {
    try {
      const element = document.querySelector(selector);
      if (element) {
        if (element.tagName === 'A' && element.href) {
          return element.href;
        } else {
          // It's a button that likely uses JS to trigger the application
          return window.location.href;
        }
      }
    } catch (error) {
      console.error(`Error checking selector ${selector}:`, error);
    }
  }
  
  // If no apply button found, return current URL
  return window.location.href;
}

// Enhanced form field detection for auto-filling
function detectFormFields() {
  const formFields = {
    firstName: null,
    lastName: null,
    name: null,
    email: null,
    phone: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    country: null,
    linkedin: null,
    website: null,
    resume: null,
    coverLetter: null,
    education: [],
    experience: [],
    salary: null,
    availability: null,
    referral: null,
    fieldCounts: {
      text: 0,
      select: 0,
      radio: 0,
      checkbox: 0,
      date: 0,
      file: 0,
      total: 0
    }
  };
  
  // Find all form inputs
  const inputs = document.querySelectorAll('input, textarea, select');
  for (const input of inputs) {
    try {
      const type = input.type || 'text';
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const label = findLabelForInput(input);
      const labelText = label ? label.textContent.toLowerCase() : '';
      
      // Update field count
      formFields.fieldCounts.total++;
      if (['text', 'email', 'tel', 'url', 'textarea'].includes(type)) {
        formFields.fieldCounts.text++;
      } else if (type === 'select-one' || type === 'select-multiple') {
        formFields.fieldCounts.select++;
      } else if (type === 'radio') {
        formFields.fieldCounts.radio++;
      } else if (type === 'checkbox') {
        formFields.fieldCounts.checkbox++;
      } else if (type === 'date') {
        formFields.fieldCounts.date++;
      } else if (type === 'file') {
        formFields.fieldCounts.file++;
      }
      
      // Match field to appropriate category
      
      // Resume and cover letter uploads
      if (type === 'file') {
        if (containsAny(name + id + placeholder + labelText, ['resume', 'cv', 'curriculum'])) {
          formFields.resume = input;
        }
        else if (containsAny(name + id + placeholder + labelText, ['cover', 'letter', 'motivation'])) {
          formFields.coverLetter = input;
        }
      }
      
      // Name fields
      else if (containsAny(name + id + placeholder + labelText, ['first name', 'firstname', 'given name'])) {
        formFields.firstName = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['last name', 'lastname', 'family name', 'surname'])) {
        formFields.lastName = input;
      }
      else if (type !== 'password' && containsAny(name + id + placeholder + labelText, ['full name', 'name']) && 
              !containsAny(name + id + placeholder + labelText, ['first', 'last', 'user', 'company'])) {
        formFields.name = input;
      }
      
      // Contact information
      else if (type === 'email' || containsAny(name + id + placeholder + labelText, ['email'])) {
        formFields.email = input;
      }
      else if (type === 'tel' || containsAny(name + id + placeholder + labelText, ['phone', 'mobile', 'cell'])) {
        formFields.phone = input;
      }
      
      // Address fields
      else if (containsAny(name + id + placeholder + labelText, ['address', 'street']) && 
               !containsAny(name + id + placeholder + labelText, ['email'])) {
        formFields.address = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['city', 'town'])) {
        formFields.city = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['state', 'province', 'region'])) {
        formFields.state = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['zip', 'postal', 'post code'])) {
        formFields.zip = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['country', 'nation'])) {
        formFields.country = input;
      }
      
      // Online presence
      else if (containsAny(name + id + placeholder + labelText, ['linkedin'])) {
        formFields.linkedin = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['website', 'portfolio', 'personal site']) && 
               !containsAny(name + id + placeholder + labelText, ['linkedin'])) {
        formFields.website = input;
      }
      
      // Application specific fields
      else if (containsAny(name + id + placeholder + labelText, ['salary', 'compensation', 'expected', 'desired'])) {
        formFields.salary = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['available', 'start date', 'when can you start'])) {
        formFields.availability = input;
      }
      else if (containsAny(name + id + placeholder + labelText, ['referred', 'referral', 'how did you hear'])) {
        formFields.referral = input;
      }
    } catch (error) {
      console.error("Error processing form field:", error);
    }
  }
  
  // Look for education and experience sections
  detectEducationFields(formFields);
  detectExperienceFields(formFields);
  
  return formFields;
}

// Helper function to detect education-related fields
function detectEducationFields(formFields) {
  try {
    // Look for education section containers
    const educationContainers = findFieldContainers(['education', 'academic', 'school', 'university', 'college']);
    
    for (const container of educationContainers) {
      const educationEntry = {
        school: null,
        degree: null,
        field: null,
        startDate: null,
        endDate: null,
        gpa: null
      };
      
      // School name
      const schoolField = findFieldInContainer(container, ['school', 'university', 'college', 'institution']);
      if (schoolField) educationEntry.school = schoolField;
      
      // Degree
      const degreeField = findFieldInContainer(container, ['degree', 'diploma', 'qualification', 'certificate']);
      if (degreeField) educationEntry.degree = degreeField;
      
      // Field of study / major
      const fieldField = findFieldInContainer(container, ['field', 'major', 'study', 'concentration']);
      if (fieldField) educationEntry.field = fieldField;
      
      // Dates
      const startDateField = findFieldInContainer(container, ['start date', 'from', 'begin']);
      if (startDateField) educationEntry.startDate = startDateField;
      
      const endDateField = findFieldInContainer(container, ['end date', 'to', 'completion', 'graduated']);
      if (endDateField) educationEntry.endDate = endDateField;
      
      // GPA
      const gpaField = findFieldInContainer(container, ['gpa', 'grade', 'average', 'score']);
      if (gpaField) educationEntry.gpa = gpaField;
      
      if (educationEntry.school || educationEntry.degree || educationEntry.field) {
        formFields.education.push(educationEntry);
      }
    }
  } catch (error) {
    console.error("Error detecting education fields:", error);
  }
}

// Helper function to detect experience-related fields
function detectExperienceFields(formFields) {
  try {
    // Look for experience section containers
    const experienceContainers = findFieldContainers(['experience', 'employment', 'work', 'job', 'career']);
    
    for (const container of experienceContainers) {
      const experienceEntry = {
        company: null,
        title: null,
        description: null,
        startDate: null,
        endDate: null,
        location: null
      };
      
      // Company name
      const companyField = findFieldInContainer(container, ['company', 'employer', 'organization', 'business']);
      if (companyField) experienceEntry.company = companyField;
      
      // Job title
      const titleField = findFieldInContainer(container, ['title', 'position', 'role', 'job title']);
      if (titleField) experienceEntry.title = titleField;
      
      // Description
      const descriptionField = findFieldInContainer(container, ['description', 'responsibilities', 'duties', 'achievements']);
      if (descriptionField) experienceEntry.description = descriptionField;
      
      // Dates
      const startDateField = findFieldInContainer(container, ['start date', 'from', 'begin']);
      if (startDateField) experienceEntry.startDate = startDateField;
      
      // EndDate
      const endDateField = findFieldInContainer(container, ['end date', 'to', 'current']);
      if (endDateField) experienceEntry.endDate = endDateField;
      
      // Location
      const locationField = findFieldInContainer(container, ['location', 'city', 'address', 'where']);
      if (locationField) experienceEntry.location = locationField;
      
      if (experienceEntry.company || experienceEntry.title || experienceEntry.description) {
        formFields.experience.push(experienceEntry);
      }
    }
  } catch (error) {
    console.error("Error detecting experience fields:", error);
  }
}

// Find containers that might contain related fields
function findFieldContainers(keywords) {
  const containers = [];
  const potentialContainers = document.querySelectorAll('fieldset, div, section');
  
  for (const container of potentialContainers) {
    // Check if container has a label or heading with a keyword
    let hasKeyword = false;
    
    // Check headings inside the container
    const headings = container.querySelectorAll('h2, h3, h4, legend, label');
    for (const heading of headings) {
      if (containsAny(heading.textContent.toLowerCase(), keywords)) {
        hasKeyword = true;
        break;
      }
    }
    
    // Check container's own attributes
    if (!hasKeyword) {
      const containerText = container.textContent.toLowerCase();
      const containerClass = (container.className || '').toLowerCase();
      const containerId = (container.id || '').toLowerCase();
      
      if (containsAny(containerText, keywords) || containsAny(containerClass, keywords) || containsAny(containerId, keywords)) {
        hasKeyword = true;
      }
    }
    
    if (hasKeyword) {
      // Check if it has inputs inside
      const inputCount = container.querySelectorAll('input, textarea, select').length;
      if (inputCount > 0) {
        containers.push(container);
      }
    }
  }
  
  return containers;
}

// Find a specific field inside a container based on keywords
function findFieldInContainer(container, keywords) {
  const inputs = container.querySelectorAll('input, textarea, select');
  
  for (const input of inputs) {
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const label = findLabelForInput(input);
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    if (containsAny(name + id + placeholder + labelText, keywords)) {
      return input;
    }
  }
  
  return null;
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
    parent
