
/**
 * Utilities for user profile management and synchronization
 */

export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
  }>;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    twitter?: string;
  };
  jobPreferences?: {
    roles?: string[];
    locations?: string[];
    remote?: boolean;
    salary?: {
      min: number;
      max: number;
      currency: string;
    };
    jobTypes?: string[];
  };
}

/**
 * Save user profile to localStorage and trigger update events
 */
export function saveUserProfile(profile: Partial<UserProfile>): void {
  try {
    // First, get existing profile
    const existingProfile = getUserProfile();
    
    // Merge with new data
    const updatedProfile = {
      ...existingProfile,
      ...profile,
    };
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
    
    // Dispatch event for components to update
    const event = new CustomEvent('profileUpdated', {
      detail: updatedProfile
    });
    window.dispatchEvent(event);
    
    // Also update any extension storage if available
    if (window.chrome?.storage?.local) {
      window.chrome.storage.local.set({ 'userProfile': updatedProfile });
    }
    
    console.log('Profile updated:', updatedProfile);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
}

/**
 * Get user profile from localStorage
 */
export function getUserProfile(): Partial<UserProfile> {
  try {
    const profileJson = localStorage.getItem('userProfile');
    if (!profileJson) return {};
    
    return JSON.parse(profileJson);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return {};
  }
}

/**
 * Sync profile with browser extension
 */
export function syncProfileWithExtension(profile: Partial<UserProfile>): Promise<boolean> {
  return new Promise((resolve) => {
    // Skip if no extension API is available
    if (!window.chrome?.runtime?.sendMessage) {
      resolve(false);
      return;
    }
    
    window.chrome.runtime.sendMessage(
      { 
        action: 'syncProfile', 
        profile 
      },
      (response) => {
        if (response && response.success) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    );
    
    // Fallback in case no response
    setTimeout(() => resolve(false), 1000);
  });
}

/**
 * Generate user initials from name
 */
export function getUserInitials(profile?: Partial<UserProfile>): string {
  if (!profile) {
    profile = getUserProfile();
  }
  
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  } else if (profile.firstName) {
    return profile.firstName.substring(0, 2).toUpperCase();
  } else if (profile.email) {
    return profile.email.substring(0, 2).toUpperCase();
  }
  
  return 'U';
}

/**
 * Get user's full name
 */
export function getUserFullName(profile?: Partial<UserProfile>): string {
  if (!profile) {
    profile = getUserProfile();
  }
  
  if (profile.firstName && profile.lastName) {
    return `${profile.firstName} ${profile.lastName}`;
  } else if (profile.firstName) {
    return profile.firstName;
  } else if (profile.email) {
    return profile.email.split('@')[0];
  }
  
  return 'User';
}

/**
 * Calculate years of experience from profile
 */
export function calculateYearsOfExperience(profile?: Partial<UserProfile>): number {
  if (!profile) {
    profile = getUserProfile();
  }
  
  if (!profile.experience || profile.experience.length === 0) {
    return 0;
  }
  
  // Calculate total months across all experiences
  let totalMonths = 0;
  
  profile.experience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
    
    // Calculate months between dates
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                  (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, months);
  });
  
  // Convert to years (rounded to 1 decimal place)
  return Math.round((totalMonths / 12) * 10) / 10;
}
