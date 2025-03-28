
// This script runs on job sites and can extract job information
console.log("EmployEvolution extension loaded");

function extractJobData() {
  let title = "";
  let company = "";
  let location = "";
  
  // Different extraction logic based on the current site
  if (window.location.hostname.includes("linkedin.com")) {
    // LinkedIn specific extraction
    const titleElement = document.querySelector(".job-details-jobs-unified-top-card__job-title");
    if (titleElement) title = titleElement.textContent.trim();
    
    const companyElement = document.querySelector(".job-details-jobs-unified-top-card__company-name");
    if (companyElement) company = companyElement.textContent.trim();
    
    const locationElement = document.querySelector(".job-details-jobs-unified-top-card__bullet");
    if (locationElement) location = locationElement.textContent.trim();
  } 
  else if (window.location.hostname.includes("indeed.com")) {
    // Indeed specific extraction
    const titleElement = document.querySelector(".jobsearch-JobInfoHeader-title");
    if (titleElement) title = titleElement.textContent.trim();
    
    const companyElement = document.querySelector("[data-testid='inlineCompanyName']");
    if (companyElement) company = companyElement.textContent.trim();
    
    const locationElement = document.querySelector("[data-testid='jobLocationText']");
    if (locationElement) location = locationElement.textContent.trim();
  }
  
  return { title, company, location };
}

// Send data to extension popup when requested
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getJobData") {
    sendResponse(extractJobData());
  }
  return true;
});
