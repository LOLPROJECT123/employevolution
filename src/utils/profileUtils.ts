
/**
 * Utilities for user profile management and synchronization
 */

// Define Chrome extension types to fix the missing property error
interface ChromeStorage {
  local: {
    set: (items: {[key: string]: any}, callback?: () => void) => void;
  }
}

interface ChromeExtension {
  storage?: ChromeStorage;
  runtime?: {
    sendMessage: (message: any, callback?: (response: any) => void) => void;
  }
}

declare global {
  interface Window {
    chrome?: ChromeExtension;
  }
}

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
  languages?: string[]; // Adding missing languages property
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
    portfolio?: string; // Adding portfolio for compatibility
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
  resumeSnapshots?: Array<{
    id: string;
    uploadDate: string;
    fileName: string;
    extractedData: any;
  }>;
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

/**
 * Extract structured data from a resume and update profile
 * This function integrates with the resume parser
 */
export async function extractAndUpdateProfileFromResume(
  resumeData: any, 
  overwrite: boolean = false
): Promise<Partial<UserProfile>> {
  try {
    // Get current profile
    const currentProfile = getUserProfile();
    
    // Create a new profile with extracted data
    const updatedProfile: Partial<UserProfile> = { ...currentProfile };
    
    // Update personal information if available and allowed to overwrite
    if (resumeData.personalInfo) {
      const { name, email, phone, location } = resumeData.personalInfo;
      
      // Split name into first and last name
      if (name && (overwrite || !currentProfile.firstName)) {
        const nameParts = name.split(' ');
        if (nameParts.length > 1) {
          updatedProfile.firstName = nameParts[0];
          updatedProfile.lastName = nameParts.slice(1).join(' ');
        } else {
          updatedProfile.firstName = name;
        }
      }
      
      // Update other personal info
      if (email && (overwrite || !currentProfile.email)) {
        updatedProfile.email = email;
      }
      
      if (phone && (overwrite || !currentProfile.phone)) {
        updatedProfile.phone = phone;
      }
      
      if (location && (overwrite || !currentProfile.location)) {
        updatedProfile.location = location;
      }
    }
    
    // Update work experience
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
      // Only overwrite if explicitly allowed or no existing experience
      if (overwrite || !currentProfile.experience || currentProfile.experience.length === 0) {
        updatedProfile.experience = resumeData.workExperiences.map((exp: any) => ({
          title: exp.role,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: !exp.endDate || exp.endDate.toLowerCase().includes('present'),
          description: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description || ''
        }));
      }
    }
    
    // Update education
    if (resumeData.education && resumeData.education.length > 0) {
      if (overwrite || !currentProfile.education || currentProfile.education.length === 0) {
        updatedProfile.education = resumeData.education.map((edu: any) => ({
          degree: edu.degree,
          institution: edu.school,
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: !edu.endDate || edu.endDate.toLowerCase().includes('present'),
          description: ''
        }));
      }
    }
    
    // Update skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      // If overwriting or no existing skills, just use the new skills
      if (overwrite || !currentProfile.skills || currentProfile.skills.length === 0) {
        updatedProfile.skills = resumeData.skills;
      } else {
        // Otherwise merge skills without duplicates
        const existingSkills = new Set(currentProfile.skills);
        resumeData.skills.forEach((skill: string) => existingSkills.add(skill));
        updatedProfile.skills = Array.from(existingSkills);
      }
    }
    
    // Update projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      if (overwrite || !currentProfile.projects || currentProfile.projects.length === 0) {
        updatedProfile.projects = resumeData.projects.map((proj: any) => ({
          name: proj.name,
          description: Array.isArray(proj.description) ? proj.description.join('\n') : proj.description || '',
          startDate: proj.startDate,
          endDate: proj.endDate
        }));
      }
    }
    
    // Update social links
    if (resumeData.socialLinks) {
      if (overwrite || !currentProfile.socialLinks) {
        updatedProfile.socialLinks = {
          linkedin: resumeData.socialLinks.linkedin || '',
          github: resumeData.socialLinks.github || '',
          website: resumeData.socialLinks.portfolio || resumeData.socialLinks.other || '',
          twitter: ''
        };
      } else {
        // Selectively update social links
        updatedProfile.socialLinks = {
          ...currentProfile.socialLinks,
          linkedin: (overwrite || !currentProfile.socialLinks.linkedin) ? resumeData.socialLinks.linkedin || '' : currentProfile.socialLinks.linkedin,
          github: (overwrite || !currentProfile.socialLinks.github) ? resumeData.socialLinks.github || '' : currentProfile.socialLinks.github,
          website: (overwrite || !currentProfile.socialLinks.website) ? resumeData.socialLinks.portfolio || resumeData.socialLinks.other || '' : currentProfile.socialLinks.website
        };
      }
    }
    
    // Store resume snapshot for versioning
    if (!updatedProfile.resumeSnapshots) {
      updatedProfile.resumeSnapshots = [];
    }
    
    // Add the current resume snapshot
    updatedProfile.resumeSnapshots.push({
      id: `resume_${Date.now()}`,
      uploadDate: new Date().toISOString(),
      fileName: 'Uploaded Resume',
      extractedData: resumeData
    });
    
    // Limit the number of stored snapshots to 5
    if (updatedProfile.resumeSnapshots.length > 5) {
      updatedProfile.resumeSnapshots = updatedProfile.resumeSnapshots.slice(-5);
    }
    
    // Save the updated profile
    saveUserProfile(updatedProfile);
    
    return updatedProfile;
  } catch (error) {
    console.error('Error extracting and updating profile from resume:', error);
    throw error;
  }
}
