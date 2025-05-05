
/**
 * Utilities for working with user profiles and resume data
 */

// Define the UserProfile interface
export interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  skills?: string[];
  languages?: string[];
  experience?: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  socialLinks?: {
    linkedin?: string;
    github?: string;
    website?: string;
    portfolio?: string;
    twitter?: string;
  };
  projects?: Array<{
    name: string;
    description: string;
    startDate?: string;
    endDate?: string;
    skills?: string[];
  }>;
  resumeSnapshots?: any[];
}

// Simple mock profile for development purposes
export const getUserProfile = (): UserProfile => {
  // Try to get profile from localStorage
  try {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      return JSON.parse(storedProfile);
    }
  } catch (e) {
    console.error('Error parsing stored profile:', e);
  }

  // Return default profile if nothing in localStorage
  return {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    phone: '555-123-4567',
    location: 'San Francisco, CA',
    title: 'Frontend Developer',
    summary: 'Passionate frontend developer with experience in React, TypeScript, and modern web development.',
    skills: [
      'JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Node.js',
      'GraphQL', 'Git', 'Responsive Design', 'UI/UX', 'Redux', 'Jest'
    ],
    experience: [
      {
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        startDate: '2021-05',
        endDate: '2023-03',
        current: false,
        description: 'Developed responsive web applications using React and TypeScript.'
      },
      {
        title: 'Junior Web Developer',
        company: 'WebSolutions LLC',
        location: 'Oakland, CA',
        startDate: '2019-08',
        endDate: '',
        current: true,
        description: 'Built and maintained client websites using modern web technologies.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2015-09',
        endDate: '2019-05',
        current: false,
        description: ''
      }
    ],
    projects: [
      {
        name: 'Portfolio Website',
        description: 'Personal portfolio website built with React and TypeScript',
        startDate: '2022-01',
        endDate: '2022-03',
        skills: ['React', 'TypeScript', 'Tailwind CSS']
      },
      {
        name: 'Task Management App',
        description: 'A full-stack application for managing tasks and projects',
        startDate: '2021-06',
        endDate: '2021-12',
        skills: ['React', 'Node.js', 'Express', 'MongoDB']
      }
    ]
  };
};

/**
 * Save user profile to localStorage
 */
export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Dispatch event for components to react to profile changes
    const event = new CustomEvent('profileUpdated', {
      detail: profile
    });
    window.dispatchEvent(event);
  } catch (error) {
    console.error('Error saving profile:', error);
  }
};

/**
 * Get user initials from profile
 */
export const getUserInitials = (profile?: UserProfile): string => {
  const userProfile = profile || getUserProfile();
  
  if (userProfile.firstName && userProfile.lastName) {
    return `${userProfile.firstName[0]}${userProfile.lastName[0]}`;
  }
  
  if (userProfile.firstName) {
    return userProfile.firstName.substring(0, 2);
  }
  
  return 'U';
};

/**
 * Get user full name from profile
 */
export const getUserFullName = (profile?: UserProfile): string => {
  const userProfile = profile || getUserProfile();
  
  if (userProfile.firstName && userProfile.lastName) {
    return `${userProfile.firstName} ${userProfile.lastName}`;
  }
  
  if (userProfile.firstName) {
    return userProfile.firstName;
  }
  
  return 'User';
};

/**
 * Convert our user profile format to ParsedResume format for job matching
 */
export const convertProfileToResumeFormat = (profile: any) => {
  return {
    personalInfo: {
      name: `${profile.firstName} ${profile.lastName}`,
      email: profile.email,
      phone: profile.phone,
      location: profile.location
    },
    workExperiences: profile.experience?.map((exp: any) => ({
      role: exp.title,
      company: exp.company,
      location: exp.location,
      startDate: exp.startDate,
      endDate: exp.current ? 'present' : (exp.endDate || ''),
      description: [exp.description]
    })) || [],
    education: profile.education?.map((edu: any) => ({
      school: edu.institution || edu.school,
      degree: edu.degree,
      startDate: edu.startDate,
      endDate: edu.endDate
    })) || [],
    projects: profile.projects?.map((proj: any) => ({
      name: proj.name,
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      description: Array.isArray(proj.description) ? proj.description : [proj.description || '']
    })) || [],
    skills: profile.skills || [],
    languages: profile.languages || [],
    socialLinks: {
      linkedin: profile.socialLinks?.linkedin || '',
      github: profile.socialLinks?.github || '',
      portfolio: profile.socialLinks?.portfolio || profile.socialLinks?.website || '',
      other: ''
    }
  };
};

/**
 * Get the parsed resume format from the user's profile
 */
export const getParsedResumeFromProfile = () => {
  const profile = getUserProfile();
  return convertProfileToResumeFormat(profile);
};
