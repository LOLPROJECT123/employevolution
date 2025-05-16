
// Background script for the Streamline Chrome Extension

// Initialize storage when extension is first installed or updated
chrome.runtime.onInstalled.addListener(initializeExtension);

function initializeExtension() {
  console.log("Streamline extension installed/updated");
  
  // Initialize storage with default values
  chrome.storage.local.set({
    "enableAutoDetect": true,
    "enableNotifications": true,
    "defaultCoverLetterTemplate": "I am writing to express my interest in the {position} position at {company}.",
    "userProfileComplete": false,
    "appliedJobs": [],
    "savedJobs": [],
    "preferredApplicationMethod": "auto", // Options: auto, manual
    "lastSync": new Date().toISOString()
  });
  
  // Set up context menus
  setupContextMenus();
}

// Set up context menus for job pages
function setupContextMenus() {
  chrome.contextMenus.create({
    id: "captureJob",
    title: "Save This Job to Streamline",
    contexts: ["page"]
  });
  
  chrome.contextMenus.create({
    id: "autoFillApplication",
    title: "Auto-fill This Application",
    contexts: ["page"]
  });
  
  chrome.contextMenus.create({
    id: "generateCoverLetter",
    title: "Generate Cover Letter for This Job",
    contexts: ["page"]
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "captureJob") {
    // Capture job data from the current page
    chrome.tabs.sendMessage(tab.id, { action: "captureJob" }, (response) => {
      if (response && response.success) {
        // Show notification
        chrome.notifications.create({
          type: "basic",
          iconUrl: "favicon.ico",
          title: "Job Saved",
          message: `${response.jobData.title} at ${response.jobData.company} has been saved to your Streamline dashboard.`,
          priority: 2
        });
      }
    });
  }
  
  if (info.menuItemId === "autoFillApplication") {
    // Auto-fill the current application form
    chrome.storage.local.get("userProfile", (data) => {
      if (data.userProfile) {
        chrome.tabs.sendMessage(tab.id, { 
          action: "autoFillApplication", 
          userData: data.userProfile
        }, (response) => {
          if (response && response.success) {
            // Show notification
            chrome.notifications.create({
              type: "basic",
              iconUrl: "favicon.ico",
              title: "Application Auto-filled",
              message: `${response.filledFields.count} fields have been filled based on your profile.`,
              priority: 2
            });
          }
        });
      } else {
        // Show a notification that profile is incomplete
        chrome.notifications.create({
          type: "basic",
          iconUrl: "favicon.ico",
          title: "Profile Incomplete",
          message: "Please complete your profile in the Streamline app before using auto-fill.",
          priority: 2
        });
      }
    });
  }
  
  if (info.menuItemId === "generateCoverLetter") {
    // Get job data and generate a cover letter
    chrome.tabs.sendMessage(tab.id, { action: "getJobData" }, (jobData) => {
      if (jobData && jobData.title && jobData.company) {
        chrome.storage.local.get(["userProfile", "defaultCoverLetterTemplate"], (data) => {
          if (data.userProfile) {
            // Open a new tab with the cover letter generator
            chrome.tabs.create({
              url: chrome.runtime.getURL("index.html") + `?page=coverLetter&jobTitle=${encodeURIComponent(jobData.title)}&company=${encodeURIComponent(jobData.company)}`
            });
          } else {
            // Show a notification that profile is incomplete
            chrome.notifications.create({
              type: "basic",
              iconUrl: "favicon.ico",
              title: "Profile Incomplete",
              message: "Please complete your profile in the Streamline app before generating cover letters.",
              priority: 2
            });
          }
        });
      }
    });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Job page detection handler
  if (message.action === "onJobPage") {
    console.log("Job page detected:", message.jobData);
    
    // Store the job data in Chrome storage
    chrome.storage.local.set({
      "lastDetectedJob": message.jobData
    });
    
    // Show extension icon badge to indicate a job was detected
    chrome.action.setBadgeText({ text: "JOB" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    
    sendResponse({ success: true });
  }
  
  // Application form detection handler
  if (message.action === "applicationFormDetected") {
    console.log("Application form detected:", message.formData);
    
    // Store the form data in Chrome storage
    chrome.storage.local.set({
      "lastApplicationForm": message.formData
    });
    
    // Show extension icon badge to indicate an application form was detected
    chrome.action.setBadgeText({ text: "FORM" });
    chrome.action.setBadgeBackgroundColor({ color: "#2196f3" });
    
    // Check if we should show a notification
    chrome.storage.local.get("enableNotifications", (data) => {
      if (data.enableNotifications !== false) {
        // Show a notification to the user
        chrome.notifications.create({
          type: "basic",
          iconUrl: "favicon.ico",
          title: "Application Form Detected",
          message: "Streamline can help you fill out this job application. Click to open the extension.",
          priority: 2,
          buttons: [
            { title: "Auto-fill Form" },
            { title: "Dismiss" }
          ]
        });
      }
    });
    
    sendResponse({ success: true });
  }

  // Handle opening job application URL
  if (message.action === "openJobUrl") {
    console.log("Opening job URL:", message.url);
    
    if (message.url) {
      // Open the URL in a new tab
      chrome.tabs.create({ url: message.url });
      sendResponse({ success: true });
    } else {
      console.error("No URL provided for job application");
      sendResponse({ success: false, error: "No URL provided" });
    }
  }
  
  // Handle job application tracking
  if (message.action === "trackJobApplication") {
    console.log("Tracking job application:", message.jobData);
    
    chrome.storage.local.get("appliedJobs", (data) => {
      const appliedJobs = data.appliedJobs || [];
      
      // Add the new application with status and timestamp
      appliedJobs.push({
        ...message.jobData,
        appliedAt: new Date().toISOString(),
        status: message.status || 'applied',
        notes: message.notes || ''
      });
      
      // Save back to storage
      chrome.storage.local.set({ "appliedJobs": appliedJobs }, () => {
        // Sync with main application if possible
        syncWithMainApplication();
        
        sendResponse({ success: true });
      });
    });
  }
  
  // Handle cover letter generation requests
  if (message.action === "generateCoverLetter") {
    console.log("Generating cover letter for:", message.jobData);
    
    // This would typically call an API to generate the cover letter
    // For now, we'll use a template-based approach
    chrome.storage.local.get(["userProfile", "defaultCoverLetterTemplate"], (data) => {
      if (data.userProfile && data.defaultCoverLetterTemplate) {
        const template = data.defaultCoverLetterTemplate;
        const userProfile = data.userProfile;
        
        // Simple template replacement
        let coverLetter = template
          .replace('{position}', message.jobData.title || 'the open position')
          .replace('{company}', message.jobData.company || 'your company')
          .replace('{name}', `${userProfile.personal?.firstName || ''} ${userProfile.personal?.lastName || ''}`.trim())
          .replace('{skills}', Array.isArray(userProfile.skills) ? userProfile.skills.join(', ') : '');
          
        sendResponse({ success: true, coverLetter });
      } else {
        sendResponse({ 
          success: false, 
          error: "User profile or cover letter template not found"
        });
      }
    });
  }
  
  return true;
});

// Listen for notification clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // User clicked "Auto-fill Form"
    chrome.storage.local.get(["userProfile", "lastApplicationForm"], (data) => {
      if (data.userProfile && data.lastApplicationForm) {
        // Find the tab with the form
        chrome.tabs.query({ url: data.lastApplicationForm.url }, (tabs) => {
          if (tabs.length > 0) {
            // Send message to content script to auto-fill
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "autoFillApplication",
              userData: data.userProfile
            });
            
            // Focus the tab
            chrome.tabs.update(tabs[0].id, { active: true });
          } else {
            // Open the URL in a new tab
            chrome.tabs.create({ url: data.lastApplicationForm.url }, (tab) => {
              // Wait for the page to load before sending the auto-fill message
              chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                  // Remove this listener
                  chrome.tabs.onUpdated.removeListener(listener);
                  
                  // Send the auto-fill message
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tab.id, {
                      action: "autoFillApplication",
                      userData: data.userProfile
                    });
                  }, 1000);
                }
              });
            });
          }
        });
      } else {
        // Open the extension popup to complete profile
        chrome.action.openPopup();
      }
    });
  }
});

// Function to sync data with main web application
function syncWithMainApplication() {
  // TODO: Add secure authentication (token, user ID, etc.)
  chrome.storage.local.get(["appliedJobs", "savedJobs", "lastSync", "userId"], (data) => {
    fetch("http://localhost:4000/api/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
        // Add Authorization header if using JWT or API key
      },
      body: JSON.stringify({
        userId: data.userId || "demo-user",
        appliedJobs: data.appliedJobs || [],
        savedJobs: data.savedJobs || [],
        lastSync: data.lastSync || new Date().toISOString()
      })
    })
      .then((response) => response.json())
      .then((result) => {
        console.log("[SYNC] Extension sync result:", result);
        chrome.storage.local.set({ lastSync: result.serverTime || new Date().toISOString() });
      })
      .catch((error) => {
        console.error("[SYNC] Failed to sync with backend:", error);
      });
  });
}

// Add listeners for tab updates to detect job pages and forms
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get("enableAutoDetect", (data) => {
      if (data.enableAutoDetect !== false) {
        // Check if this looks like a job page
        if (tab.url.includes('/jobs/') || 
            tab.url.includes('/job/') || 
            tab.url.includes('/careers/') || 
            tab.url.includes('/career/')) {
          
          // Ask content script to extract job data
          chrome.tabs.sendMessage(tabId, { action: "getJobData" }, (response) => {
            if (response && !chrome.runtime.lastError) {
              chrome.storage.local.set({ "lastDetectedJob": response });
              
              // Update badge
              chrome.action.setBadgeText({ text: "JOB", tabId });
              chrome.action.setBadgeBackgroundColor({ color: "#4caf50", tabId });
            }
          });
        }
        
        // Check if this looks like an application form
        if (tab.url.includes('apply') || 
            tab.url.includes('application') || 
            tab.title.toLowerCase().includes('application')) {
          
          // Ask content script to detect form
          chrome.tabs.sendMessage(tabId, { action: "detectApplicationForm" }, (response) => {
            if (response && response.isApplicationForm && !chrome.runtime.lastError) {
              chrome.storage.local.set({ "lastApplicationForm": response });
              
              // Update badge
              chrome.action.setBadgeText({ text: "FORM", tabId });
              chrome.action.setBadgeBackgroundColor({ color: "#2196f3", tabId });
            }
          });
        }
      }
    });
  }
});
