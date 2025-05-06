
/**
 * Utility functions for user profile operations
 */

export interface UserProfile {
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  location: string;
  title?: string;
  summary?: string;
  skills: string[];
  languages?: string[];
  experience?: any[];
  education?: any[];
  projects?: any[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    other?: string;
  };
  resumeSnapshots?: any[];
}

// Default mock profile for demo purposes
const defaultProfile: UserProfile = {
  name: "John Doe",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  title: "Frontend Developer",
  summary: "Experienced frontend developer with 5 years of experience in React and TypeScript.",
  skills: ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Redux", "Node.js"],
  languages: ["English", "Spanish"],
  experience: [
    {
      company: "Tech Company",
      position: "Senior Frontend Developer",
      startDate: "2020-01",
      endDate: "Present",
      description: "Building and maintaining frontend applications using React and TypeScript."
    }
  ],
  education: [
    {
      school: "University of California",
      degree: "Computer Science",
      startDate: "2014",
      endDate: "2018"
    }
  ],
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    github: "https://github.com/johndoe"
  }
};

/**
 * Get user profile data
 */
export function getUserProfile(): UserProfile {
  // In a real application, this would retrieve from localStorage, API, etc.
  return defaultProfile;
}

/**
 * Save user profile data
 */
export function saveUserProfile(profile: UserProfile): void {
  // In a real application, this would save to localStorage, API, etc.
  console.log("Profile saved:", profile);
}

/**
 * Get user initials for avatar
 */
export function getUserInitials(): string {
  const profile = getUserProfile();
  return profile.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Get user's full name
 */
export function getUserFullName(profile?: UserProfile): string {
  const userProfile = profile || getUserProfile();
  
  if (userProfile.firstName && userProfile.lastName) {
    return `${userProfile.firstName} ${userProfile.lastName}`;
  }
  
  return userProfile.name || "User";
}

/**
 * Get parsed resume data from user profile
 */
export function getParsedResumeFromProfile() {
  const profile = getUserProfile();
  
  return {
    personalInfo: {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      location: profile.location
    },
    skills: profile.skills || [],
    languages: profile.languages || [],
    workExperiences: profile.experience || [],
    education: profile.education || [],
    projects: profile.projects || [],
    socialLinks: profile.socialLinks || {}
  };
}

/**
 * Parse resume file (PDF, DOCX)
 */
export async function parseResume(file: File) {
  // In a real application, this would use a resume parsing API or library
  // For now, just return the default profile data
  console.log("Resume parsing requested for file:", file.name);
  
  // Simulate async parsing
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return getParsedResumeFromProfile();
}

// Mock for resume data type
export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  skills: string[];
  languages: string[];
  workExperiences: any[];
  education: any[];
  projects: any[];
  socialLinks: any;
}
