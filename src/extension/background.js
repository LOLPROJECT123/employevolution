
// Background script for the EmployEvolution Chrome Extension

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "onJobPage") {
    // Handle job page detection
    console.log("Job page detected:", message.jobData);
    
    // Could store the job data in Chrome storage
    chrome.storage.local.set({
      "lastDetectedJob": message.jobData
    });
    
    // Show extension icon badge to indicate a job was detected
    chrome.action.setBadgeText({ text: "JOB" });
    chrome.action.setBadgeBackgroundColor({ color: "#4caf50" });
    
    sendResponse({ success: true });
  }
  
  if (message.action === "applicationFormDetected") {
    // Handle application form detection
    console.log("Application form detected:", message.formData);
    
    // Store the form data in Chrome storage
    chrome.storage.local.set({
      "lastApplicationForm": message.formData
    });
    
    // Show extension icon badge to indicate an application form was detected
    chrome.action.setBadgeText({ text: "FORM" });
    chrome.action.setBadgeBackgroundColor({ color: "#2196f3" });
    
    // Show a notification to the user
    chrome.notifications.create({
      type: "basic",
      iconUrl: "favicon.ico",
      title: "Application Form Detected",
      message: "EmployEvolution can help you fill out this job application. Click to open the extension.",
      priority: 2,
      buttons: [
        { title: "Auto-fill Form" },
        { title: "Dismiss" }
      ]
    });
    
    sendResponse({ success: true });
  }
  
  return true;
});

// Listen for notification clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // User clicked "Auto-fill Form"
    // Open the extension popup
    chrome.action.openPopup();
  }
  // If buttonIndex is 1, user clicked "Dismiss" - do nothing
});

// When extension is first installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("EmployEvolution extension installed/updated");
  
  // Initialize storage with default values
  chrome.storage.local.set({
    "enableAutoDetect": true,
    "enableNotifications": true,
    "defaultCoverLetterTemplate": "I am writing to express my interest in the {position} position at {company}.",
    "userProfileComplete": false
  });
});

// Context menu for job pages
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "captureJob",
    title: "Capture This Job",
    contexts: ["page"]
  });
  
  chrome.contextMenus.create({
    id: "autoFillApplication",
    title: "Auto-fill This Application",
    contexts: ["page"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "captureJob") {
    // Capture job data from the current page
    chrome.tabs.sendMessage(tab.id, { action: "captureJob" });
  }
  
  if (info.menuItemId === "autoFillApplication") {
    // Auto-fill the current application form
    chrome.storage.local.get("userProfile", (data) => {
      if (data.userProfile) {
        chrome.tabs.sendMessage(tab.id, { 
          action: "autoFillApplication", 
          userData: data.userProfile
        });
      } else {
        // Show a notification that profile is incomplete
        chrome.notifications.create({
          type: "basic",
          iconUrl: "favicon.ico",
          title: "Profile Incomplete",
          message: "Please complete your profile in the EmployEvolution app before using auto-fill.",
          priority: 2
        });
      }
    });
  }
});
