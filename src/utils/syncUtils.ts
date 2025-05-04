/**
 * Utilities for synchronizing data between the extension and web app
 */

import { Job, JobApplicationStatus } from "@/types/job";

// Define Chrome extension types with proper structure
interface ChromeLastError {
  message: string;
}

interface ChromeRuntime {
  sendMessage: (message: any, responseCallback?: (response: any) => void) => void;
  lastError?: ChromeLastError;
}

interface ChromeStorage {
  local: {
    set: (items: {[key: string]: any}, callback?: () => void) => void;
    get: (keys: string | string[] | null, callback: (items: {[key: string]: any}) => void) => void;
  }
}

interface ChromeExtension {
  runtime?: ChromeRuntime;
  storage?: ChromeStorage;
}

// Fix: Instead of using interface merging, declare the global chrome property differently
declare global {
  var chrome: ChromeExtension | undefined;
}

export interface SyncState {
  lastSyncTime: string;
  pendingUploads: number;
  pendingDownloads: number;
  status: 'idle' | 'syncing' | 'error';
  error?: string;
}

// Function to check if Chrome extension is available
export const isExtensionAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         window.chrome !== undefined && 
         window.chrome.runtime !== undefined &&
         typeof window.chrome.runtime.sendMessage === 'function';
};

// Function to sync job applications between extension and web app
export const syncJobApplications = async (): Promise<{
  success: boolean;
  syncedJobs: Job[];
  error?: string;
}> => {
  if (!isExtensionAvailable()) {
    return { 
      success: false, 
      syncedJobs: [], 
      error: "Extension not available" 
    };
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve({ 
          success: false, 
          syncedJobs: [], 
          error: "Chrome runtime not available" 
        });
        return;
      }

      window.chrome.runtime.sendMessage(
        { action: "getAppliedJobs" }, 
        (response: { jobs: Job[] } | undefined) => {
          // Check for runtime error
          if (window.chrome?.runtime?.lastError) {
            resolve({ 
              success: false, 
              syncedJobs: [], 
              error: window.chrome.runtime.lastError.message 
            });
            return;
          }
          
          if (response && Array.isArray(response.jobs)) {
            // Here you would typically merge the jobs with your web app storage
            // For now, we'll just return them
            resolve({ 
              success: true, 
              syncedJobs: response.jobs 
            });
          } else {
            resolve({ 
              success: false, 
              syncedJobs: [], 
              error: "Invalid response from extension" 
            });
          }
        }
      );
    });
  } catch (error) {
    return { 
      success: false, 
      syncedJobs: [], 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
};

// Function to send job application status updates to the extension
export const updateApplicationStatus = async (
  jobId: string,
  status: JobApplicationStatus,
  notes?: string
): Promise<boolean> => {
  if (!isExtensionAvailable()) {
    return false;
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve(false);
        return;
      }

      window.chrome.runtime.sendMessage(
        { 
          action: "updateJobStatus", 
          jobId,
          status,
          notes
        }, 
        (response: { success: boolean } | undefined) => {
          if (window.chrome?.runtime?.lastError) {
            console.error("Error updating application status:", window.chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          
          resolve(response?.success || false);
        }
      );
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return false;
  }
};

// Function to get a user's profile from the extension
export const getUserProfileFromExtension = async (): Promise<any | null> => {
  if (!isExtensionAvailable()) {
    return null;
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve(null);
        return;
      }

      window.chrome.runtime.sendMessage(
        { action: "getUserProfile" }, 
        (response: any) => {
          if (window.chrome?.runtime?.lastError) {
            console.error("Error getting user profile:", window.chrome.runtime.lastError.message);
            resolve(null);
            return;
          }
          
          resolve(response?.userProfile || null);
        }
      );
    });
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Function to save a user's profile to the extension
export const saveUserProfileToExtension = async (profile: any): Promise<boolean> => {
  if (!isExtensionAvailable()) {
    return false;
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve(false);
        return;
      }

      window.chrome.runtime.sendMessage(
        { 
          action: "saveUserProfile", 
          userProfile: profile 
        }, 
        (response: { success: boolean } | undefined) => {
          if (window.chrome?.runtime?.lastError) {
            console.error("Error saving user profile:", window.chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          
          resolve(response?.success || false);
        }
      );
    });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return false;
  }
};

// Function to get extension settings
export const getExtensionSettings = async (): Promise<{
  enableAutoDetect: boolean;
  enableNotifications: boolean;
  preferredApplicationMethod: 'auto' | 'manual';
} | null> => {
  if (!isExtensionAvailable()) {
    return null;
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve(null);
        return;
      }

      window.chrome.runtime.sendMessage(
        { action: "getSettings" }, 
        (response: any) => {
          if (window.chrome?.runtime?.lastError) {
            console.error("Error getting extension settings:", window.chrome.runtime.lastError.message);
            resolve(null);
            return;
          }
          
          resolve(response?.settings || null);
        }
      );
    });
  } catch (error) {
    console.error("Error getting extension settings:", error);
    return null;
  }
};

// Function to save extension settings
export const saveExtensionSettings = async (settings: {
  enableAutoDetect: boolean;
  enableNotifications: boolean;
  preferredApplicationMethod: 'auto' | 'manual';
}): Promise<boolean> => {
  if (!isExtensionAvailable()) {
    return false;
  }
  
  try {
    return new Promise((resolve) => {
      if (!window.chrome?.runtime?.sendMessage) {
        resolve(false);
        return;
      }

      window.chrome.runtime.sendMessage(
        { 
          action: "saveSettings", 
          settings 
        }, 
        (response: { success: boolean } | undefined) => {
          if (window.chrome?.runtime?.lastError) {
            console.error("Error saving extension settings:", window.chrome.runtime.lastError.message);
            resolve(false);
            return;
          }
          
          resolve(response?.success || false);
        }
      );
    });
  } catch (error) {
    console.error("Error saving extension settings:", error);
    return false;
  }
};
