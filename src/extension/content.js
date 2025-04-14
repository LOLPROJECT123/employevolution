// This script runs on job sites and can extract job information and assist with auto-filling applications
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

// Improved auto-fill function that handles more field types and platforms
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

// New function to fill application-specific fields
function fillApplicationSpecificFields(userData) {
  // Look for fields related to salary expectations
  const salaryInputs = findFieldsByKeywords(['salary', 'compensation', 'expected', 'desired']);
  if (salaryInputs.length > 0 && userData.salaryExpectation) {
    salaryInputs.forEach(input => {
      input.value = userData.salaryExpectation;
      triggerInputEvent(input);
    });
  }
  
  // Look for fields related to availability or start date
  const availabilityInputs = findFieldsByKeywords(['available', 'start date', 'when can you start']);
  if (availabilityInputs.length > 0 && userData.availability) {
    availabilityInputs.forEach(input => {
      input.value = userData.availability;
      triggerInputEvent(input);
    });
  }
  
  // Look for fields related to referrals
  const referralInputs = findFieldsByKeywords(['referred', 'referral', 'how did you hear']);
  if (referralInputs.length > 0 && userData.referredBy) {
    referralInputs.forEach(input => {
      input.value = userData.referredBy;
      triggerInputEvent(input);
    });
  }
}

// New function to fill common application questions using radio buttons and checkboxes
function fillCommonQuestions(userData) {
  // Handle work authorization questions
  if (userData.workAuthorization) {
    const workAuthInputs = findRadiosByKeywords([
      'legally authorized', 'work authorization', 'eligible to work'
    ]);
    
    // Determine which option to select based on user data
    const isAuthorized = userData.workAuthorization === 'US Citizen' || 
                          userData.workAuthorization === 'Green Card' ||
                          userData.workAuthorization === 'Permanent Resident';
                          
    selectRadioOption(workAuthInputs, isAuthorized);
  }
  
  // Handle sponsorship questions
  if (userData.hasOwnProperty('requireSponsorship')) {
    const sponsorshipInputs = findRadiosByKeywords([
      'sponsorship', 'visa', 'require a visa'
    ]);
    
    selectRadioOption(sponsorshipInputs, !userData.requireSponsorship);
  }
  
  // Handle relocation questions
  if (userData.hasOwnProperty('willingToRelocate')) {
    const relocationInputs = findRadiosByKeywords([
      'relocate', 'relocation', 'willing to move'
    ]);
    
    selectRadioOption(relocationInputs, userData.willingToRelocate);
  }
  
  // Handle remote work preference
  if (userData.remotePreference) {
    const remoteInputs = findRadiosByKeywords([
      'remote', 'on-site', 'hybrid', 'work location'
    ]);
    
    // This is more complex and would need a more sophisticated algorithm
    // to match the user's preference with available options
    console.log("Found remote work inputs, but needs manual selection");
  }
}

// Helper function to find fields by keywords in labels, placeholders, or names
function findFieldsByKeywords(keywords) {
  const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea, select');
  const matches = [];
  
  for (const input of inputs) {
    const inputId = input.id;
    const inputName = input.name;
    const inputPlaceholder = input.placeholder || '';
    
    // Check for associated label
    const label = findLabelForInput(input);
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    // Check if any keywords match
    const matchesKeyword = keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return inputName.toLowerCase().includes(lowerKeyword) || 
             inputId.toLowerCase().includes(lowerKeyword) || 
             inputPlaceholder.toLowerCase().includes(lowerKeyword) || 
             labelText.includes(lowerKeyword);
    });
    
    if (matchesKeyword) {
      matches.push(input);
    }
  }
  
  return matches;
}

// Helper function to find radio buttons by keywords
function findRadiosByKeywords(keywords) {
  const radioGroups = [];
  const radioButtons = document.querySelectorAll('input[type="radio"]');
  
  for (const radio of radioButtons) {
    const radioName = radio.name;
    const radioId = radio.id;
    
    // Check for associated label
    const label = findLabelForInput(radio);
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    // Check for fieldset legend or nearby text
    const fieldset = radio.closest('fieldset');
    const legend = fieldset ? fieldset.querySelector('legend') : null;
    const legendText = legend ? legend.textContent.toLowerCase() : '';
    
    // Check if any keywords match
    const matchesKeyword = keywords.some(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return radioName.toLowerCase().includes(lowerKeyword) || 
             radioId.toLowerCase().includes(lowerKeyword) || 
             labelText.includes(lowerKeyword) ||
             legendText.includes(lowerKeyword);
    });
    
    if (matchesKeyword) {
      let existingGroup = radioGroups.find(group => group.name === radioName);
      if (!existingGroup) {
        existingGroup = { name: radioName, options: [] };
        radioGroups.push(existingGroup);
      }
      existingGroup.options.push(radio);
    }
  }
  
  return radioGroups;
}

// Helper function to select the appropriate radio button based on a boolean value
function selectRadioOption(radioGroups, positiveSelection) {
  for (const group of radioGroups) {
    if (group.options.length === 2) {
      // Assume first is "Yes" and second is "No" (common pattern)
      // But we should try to be smarter about this in a real implementation
      const selectedOption = positiveSelection ? group.options[0] : group.options[1];
      selectedOption.checked = true;
      triggerInputEvent(selectedOption);
      console.log(`Set ${group.name} to ${positiveSelection ? 'Yes' : 'No'}`);
    }
    else if (group.options.length > 0) {
      console.log(`Radio group ${group.name} has ${group.options.length} options, needs manual selection`);
    }
  }
}

// Function to fill date fields
function fillDateFields(userData) {
  // Look for date inputs
  const dateInputs = document.querySelectorAll('input[type="date"]');
  
  for (const input of dateInputs) {
    const inputName = input.name.toLowerCase();
    const inputId = input.id.toLowerCase();
    const label = findLabelForInput(input);
    const labelText = label ? label.textContent.toLowerCase() : '';
    
    // Try to determine what this date field is for
    if (inputName.includes('start') || inputId.includes('start') || labelText.includes('start')) {
      if (userData.availability) {
        input.value = userData.availability;
        triggerInputEvent(input);
        console.log("Filled start date field");
      }
    }
    else if (inputName.includes('birth') || inputId.includes('birth') || labelText.includes('birth')) {
      if (userData.dateOfBirth) {
        input.value = userData.dateOfBirth;
        triggerInputEvent(input);
        console.log("Filled birth date field");
      }
    }
  }
}

// Function to fill education fields
function fillEducationFields(education) {
  // This would need to be much more sophisticated in a real implementation
  // Look for inputs that seem to be related to education
  const schoolInputs = findFieldsByKeywords(['school', 'university', 'college', 'institution']);
  const degreeInputs = findFieldsByKeywords(['degree', 'diploma', 'qualification']);
  const majorInputs = findFieldsByKeywords(['major', 'field', 'study', 'course']);
  const gpaInputs = findFieldsByKeywords(['gpa', 'grade', 'score']);
  
  if (schoolInputs.length > 0 && education[0]?.institution) {
    schoolInputs[0].value = education[0].institution;
    triggerInputEvent(schoolInputs[0]);
    console.log("Filled school field");
  }
  
  if (degreeInputs.length > 0 && education[0]?.degree) {
    degreeInputs[0].value = education[0].degree;
    triggerInputEvent(degreeInputs[0]);
    console.log("Filled degree field");
  }
  
  if (majorInputs.length > 0 && education[0]?.field) {
    majorInputs[0].value = education[0].field;
    triggerInputEvent(majorInputs[0]);
    console.log("Filled major/field of study");
  }
  
  if (gpaInputs.length > 0 && education[0]?.gpa) {
    gpaInputs[0].value = education[0].gpa;
    triggerInputEvent(gpaInputs[0]);
    console.log("Filled GPA");
  }
}

// Function to fill work experience fields
function fillExperienceFields(experience) {
  // This would need to be much more sophisticated in a real implementation
  const companyInputs = findFieldsByKeywords(['company', 'employer', 'organization']);
  const titleInputs = findFieldsByKeywords(['title', 'position', 'role']);
  const dutiesInputs = findFieldsByKeywords(['duties', 'responsibilities', 'description']);
  
  if (companyInputs.length > 0 && experience[0]?.company) {
    companyInputs[0].value = experience[0].company;
    triggerInputEvent(companyInputs[0]);
    console.log("Filled company field");
  }
  
  if (titleInputs.length > 0 && experience[0]?.title) {
    titleInputs[0].value = experience[0].title;
    triggerInputEvent(titleInputs[0]);
    console.log("Filled job title field");
  }
  
  if (dutiesInputs.length > 0 && experience[0]?.description) {
    const description = Array.isArray(experience[0].description) ? 
      experience[0].description.join("\n\n") : experience[0].description;
    dutiesInputs[0].value = description;
    triggerInputEvent(dutiesInputs[0]);
    console.log("Filled job duties/description field");
  }
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
  
  if (request.action === "detectApplicationForm") {
    const formFields = detectFormFields();
    const isApplicationForm = Object.values(formFields).some(field => field !== null);
    sendResponse({ 
      isApplicationForm, 
      fields: formFields,
      platform: detectPlatform()
    });
    return true;
  }
  
  return true;
});

// Detect which ATS platform is being used
function detectPlatform() {
  const url = window.location.href;
  const html = document.documentElement.innerHTML;
  
  // Check URL patterns
  if (url.includes('greenhouse.io')) return 'Greenhouse';
  if (url.includes('lever.co')) return 'Lever';
  if (url.includes('myworkdayjobs') || url.includes('/workday/')) return 'Workday';
  if (url.includes('taleo')) return 'Taleo';
  if (url.includes('icims')) return 'iCIMS';
  if (url.includes('brassring')) return 'BrassRing';
  
  // Check for platform-specific HTML signatures
  if (html.includes('workday') || html.includes('myworkday')) return 'Workday';
  if (html.includes('greenhouse')) return 'Greenhouse';
  if (html.includes('lever-')) return 'Lever';
  if (html.includes('taleo')) return 'Taleo';
  if (html.includes('icims')) return 'iCIMS';
  
  // Check if common ATS JavaScript libraries are loaded
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    const src = script.src || '';
    if (src.includes('greenhouse')) return 'Greenhouse';
    if (src.includes('lever')) return 'Lever';
    if (src.includes('workday')) return 'Workday';
    if (src.includes('taleo')) return 'Taleo';
    if (src.includes('icims')) return 'iCIMS';
    if (src.includes('brassring')) return 'BrassRing';
  }
  
  return 'Unknown';
}

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
  
  // New: Also check if this is an application form page and offer to autofill
  const formFields = detectFormFields();
  const hasFormFields = Object.values(formFields).some(field => field !== null);
  
  if (hasFormFields) {
    console.log("EmployEvolution: Detected possible application form");
    
    // Count significant form fields to determine if this looks like an application
    let significantFieldCount = 0;
    if (formFields.name || formFields.firstName) significantFieldCount++;
    if (formFields.email) significantFieldCount++;
    if (formFields.phone) significantFieldCount++;
    if (formFields.resume) significantFieldCount++;
    
    if (significantFieldCount >= 2) {
      // This looks like an application form, notify the extension
      try {
        chrome.runtime.sendMessage({
          action: "applicationFormDetected",
          formData: {
            url: window.location.href,
            title: document.title,
            platform: detectPlatform(),
            fields: Object.keys(formFields).filter(key => formFields[key] !== null)
          }
        });
      } catch (e) {
        console.log("EmployEvolution: Unable to contact extension", e);
      }
    }
  }
}

// Run initialization
setTimeout(initialize, 1000);
