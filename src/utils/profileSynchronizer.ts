/**
 * Profile synchronization utilities
 * Handles extracting data from resumes and syncing with user profile
 */

import { toast } from "sonner";
import { extractSkillKeywords } from "./resume/skillsParser";
import { parseLanguages } from "./resume/skillsParser";
import { addResumeSnapshot } from "./resume/versionControl";
import { ParsedResume } from "@/types/resume";
import { getUserProfile, saveUserProfile, UserProfile } from "./profileUtils";

/**
 * Smart Profile Sync - Intelligently syncs parsed resume data with user profile
 * @param resumeData The parsed resume data
 * @param overwrite Whether to overwrite existing data
 * @param notify Whether to show notifications
 * @returns Updated user profile
 */
export const smartProfileSync = async (
  resumeData: ParsedResume,
  overwrite: boolean = false,
  notify: boolean = true
): Promise<Partial<UserProfile>> => {
  try {
    // Get current profile
    const currentProfile = getUserProfile();
    
    // Create a new profile with extracted data
    const updatedProfile: Partial<UserProfile> = { ...currentProfile };
    
    // Create a timestamp for this sync operation
    const syncTimestamp = new Date().toISOString();
    
    // Process personal information
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
          updatedProfile.lastName = '';
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
      if (overwrite || !currentProfile.experience || currentProfile.experience.length === 0) {
        updatedProfile.experience = resumeData.workExperiences.map(exp => ({
          title: exp.role, // Using role from parsed resume for title field
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.endDate.toLowerCase().includes('present'),
          description: Array.isArray(exp.description) ? exp.description.join('\n') : '',
        }));
      }
    }
    
    // Update education
    if (resumeData.education && resumeData.education.length > 0) {
      if (overwrite || !currentProfile.education || currentProfile.education.length === 0) {
        updatedProfile.education = resumeData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.school,
          location: '',
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: false,
          description: '',
        }));
      }
    }
    
    // Update skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      if (!updatedProfile.skills || updatedProfile.skills.length === 0) {
        updatedProfile.skills = resumeData.skills;
      } else if (!overwrite) {
        // Merge skills without duplicates
        const existingSkills = new Set(updatedProfile.skills);
        resumeData.skills.forEach(skill => existingSkills.add(skill));
        updatedProfile.skills = Array.from(existingSkills);
      } else {
        updatedProfile.skills = resumeData.skills;
      }
    }
    
    // Update languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      if (!updatedProfile.languages || updatedProfile.languages.length === 0) {
        updatedProfile.languages = resumeData.languages;
      } else if (!overwrite) {
        // Merge languages without duplicates
        const existingLanguages = new Set(updatedProfile.languages);
        resumeData.languages.forEach(language => existingLanguages.add(language));
        updatedProfile.languages = Array.from(existingLanguages);
      } else {
        updatedProfile.languages = resumeData.languages;
      }
    }
    
    // Update social links
    if (resumeData.socialLinks) {
      if (!updatedProfile.socialLinks) {
        updatedProfile.socialLinks = {
          linkedin: '',
          github: '',
          website: '',
          portfolio: '',
          twitter: ''
        };
      }
      
      if (resumeData.socialLinks.linkedin && (overwrite || !updatedProfile.socialLinks.linkedin)) {
        updatedProfile.socialLinks.linkedin = resumeData.socialLinks.linkedin;
      }
      
      if (resumeData.socialLinks.github && (overwrite || !updatedProfile.socialLinks.github)) {
        updatedProfile.socialLinks.github = resumeData.socialLinks.github;
      }
      
      if (resumeData.socialLinks.portfolio && (overwrite || !updatedProfile.socialLinks.website)) {
        updatedProfile.socialLinks.website = resumeData.socialLinks.portfolio;
      }
      
      if (resumeData.socialLinks.other && (overwrite || !updatedProfile.socialLinks.portfolio)) {
        updatedProfile.socialLinks.portfolio = resumeData.socialLinks.other;
      }
    }
    
    // Update projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      if (overwrite || !currentProfile.projects || currentProfile.projects.length === 0) {
        updatedProfile.projects = resumeData.projects.map(proj => ({
          name: proj.name,
          description: Array.isArray(proj.description) ? proj.description.join('\n') : '',
          startDate: proj.startDate,
          endDate: proj.endDate,
          skills: [],
        }));
      }
    }
    
    // Store a snapshot of the resume data
    if (!updatedProfile.resumeSnapshots) {
      updatedProfile.resumeSnapshots = [];
    }
    
    // Add resume snapshot
    addResumeSnapshot(resumeData);
    
    // Save the updated profile
    saveUserProfile(updatedProfile);
    
    // Show notification if requested
    if (notify) {
      if (overwrite) {
        toast.success("Profile updated from resume");
      } else {
        toast.success("Profile merged with resume data");
      }
    }
    
    return updatedProfile;
  } catch (error) {
    console.error('Error syncing profile from resume:', error);
    if (notify) {
      toast.error("Failed to sync profile");
    }
    return getUserProfile();
  }
};

interface ResumeData {
  personalInfo?: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary?: string;
  };
  workExperiences?: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
    current?: boolean;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    current?: boolean;
  }>;
  skills?: string[];
  languages?: string[];
  projects?: Array<{
    name: string;
    description: string[];
    technologies?: string[];
    link?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
  }>;
  certifications?: string[];
  socialLinks?: {
    linkedin: string;
    github: string;
    portfolio: string;
    other: string;
  };
}

// For addResumeSnapshot function calls with ParsedResume, ensure properties match
const sanitizeResumeDataForSnapshot = (data: any): ParsedResume => {
  return {
    personalInfo: {
      name: data.personalInfo?.name || '',
      email: data.personalInfo?.email || '',
      phone: data.personalInfo?.phone || '',
      location: data.personalInfo?.location || ''
    },
    workExperiences: (data.workExperiences || []).map((exp: any) => ({
      role: exp.title || exp.role || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      description: Array.isArray(exp.description) ? exp.description : [exp.description || '']
    })),
    education: (data.education || []).map((edu: any) => ({
      school: edu.institution || edu.school || '',
      degree: edu.degree || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || ''
    })),
    projects: (data.projects || []).map((proj: any) => ({
      name: proj.title || proj.name || '',
      startDate: proj.startDate || '',
      endDate: proj.endDate || '',
      description: Array.isArray(proj.description) ? proj.description : [proj.description || '']
    })),
    skills: data.skills || [],
    languages: data.languages || [],
    socialLinks: {
      linkedin: data.socialLinks?.linkedin || '',
      github: data.socialLinks?.github || '',
      portfolio: data.socialLinks?.portfolio || data.socialLinks?.website || '',
      other: data.socialLinks?.other || ''
    }
  };
};

/**
 * Generate profile improvement suggestions
 */
export const generateProfileSuggestions = (userProfile: UserProfile): string[] => {
  const suggestions: string[] = [];
  
  if (!userProfile.firstName || !userProfile.lastName) {
    suggestions.push('Add your full name to your profile');
  }
  
  if (!userProfile.email) {
    suggestions.push('Add your email address');
  }
  
  if (!userProfile.phone) {
    suggestions.push('Add your phone number for recruiters to contact you');
  }
  
  if (!userProfile.location) {
    suggestions.push('Add your location to help find nearby opportunities');
  }
  
  if (!userProfile.skills || userProfile.skills.length < 5) {
    suggestions.push('Add more skills to your profile (aim for at least 5-10 relevant skills)');
  }
  
  if (!userProfile.experience || userProfile.experience.length === 0) {
    suggestions.push('Add your work experience to improve job matching');
  } else {
    const needsDescription = userProfile.experience.some(exp => !exp.description || exp.description.length < 50);
    if (needsDescription) {
      suggestions.push('Add detailed descriptions to your work experiences');
    }
  }
  
  if (!userProfile.education || userProfile.education.length === 0) {
    suggestions.push('Add your education details');
  }
  
  if (!userProfile.socialLinks || (!userProfile.socialLinks.linkedin && !userProfile.socialLinks.github)) {
    suggestions.push('Add your LinkedIn and/or GitHub profile links');
  }
  
  return suggestions;
};

/**
 * Extract data from resume text
 */
export const extractResumeData = (text: string): ResumeData => {
  // Extract personal information using regex patterns
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  const linkedinRegex = /(?:linkedin\.com\/in\/|linkedin:)([a-zA-Z0-9_-]+)/i;
  const githubRegex = /(?:github\.com\/|github:)([a-zA-Z0-9_-]+)/i;
  
  // Parse text for data
  const email = text.match(emailRegex)?.[0] || '';
  const phone = text.match(phoneRegex)?.[0] || '';
  
  // Extract name (basic implementation - first occurrence of capitalized words at start)
  const nameRegex = /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/m;
  const nameMatch = text.match(nameRegex);
  const name = nameMatch ? nameMatch[0] : '';
  
  // Extract location (look for city, state format)
  const locationRegex = /([A-Z][a-zA-Z]+,\s*[A-Z]{2})/;
  const locationMatch = text.match(locationRegex);
  const location = locationMatch ? locationMatch[0] : '';
  
  // Extract skills
  const skills = extractSkillKeywords(text);
  
  // Extract languages
  const languages = parseLanguages(text);
  
  // Extract social links
  const linkedinMatch = text.match(linkedinRegex);
  const linkedin = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '';
  
  const githubMatch = text.match(githubRegex);
  const github = githubMatch ? `https://github.com/${githubMatch[1]}` : '';
  
  // Basic implementation for work experiences
  const experienceData: ResumeData['workExperiences'] = [];
  
  // Look for common experience patterns
  const experienceBlocks = text.split(/EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT HISTORY/i)[1]?.split(/EDUCATION|SKILLS|PROJECTS/i)[0] || '';
  
  if (experienceBlocks) {
    const companyTitlePattern = /([A-Z][A-Za-z\s&]+)[\s\|•]+([A-Za-z\s]+)[\s\|•]+((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\s*(?:-|–|to)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\s*(?:-|–|to)\s*Present)/ig;
    
    let match;
    while ((match = companyTitlePattern.exec(experienceBlocks)) !== null) {
      const company = match[1].trim();
      const role = match[2].trim(); // Using role consistently
      const dateRange = match[3].trim();
      
      const dateRangeParts = dateRange.split(/(?:-|–|to)/i);
      const startDate = dateRangeParts[0]?.trim() || '';
      const endDate = dateRangeParts[1]?.trim() || '';
      const current = endDate.toLowerCase().includes('present');
      
      experienceData.push({
        company,
        role,
        location: '',
        startDate,
        endDate: current ? endDate : endDate,
        description: [],
        current
      });
    }
  }
  
  return {
    personalInfo: {
      name,
      email,
      phone,
      location
    },
    workExperiences: experienceData,
    skills,
    languages,
    socialLinks: {
      linkedin,
      github,
      portfolio: '',  // Add empty string for portfolio
      other: ''       // Add empty string for other
    }
  };
};

/**
 * Sync resume data with user profile
 */
export const syncResumeWithProfile = (resumeData: ResumeData, overwriteExisting: boolean = false): boolean => {
  try {
    // Get existing profile
    const storedProfile = localStorage.getItem('userProfile');
    let userProfile: UserProfile = storedProfile ? JSON.parse(storedProfile) : {};
    
    // Create a snapshot before making changes
    if (resumeData && storedProfile) {
      addResumeSnapshot({
        personalInfo: {
          name: resumeData.personalInfo?.name || `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
          email: resumeData.personalInfo?.email || userProfile.email || '',
          phone: resumeData.personalInfo?.phone || userProfile.phone || '',
          location: resumeData.personalInfo?.location || userProfile.location || ''
        },
        workExperiences: (resumeData.workExperiences || []).map(exp => ({
          role: exp.role,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: Array.isArray(exp.description) ? exp.description : [exp.description || '']
        })),
        education: (resumeData.education || []).map(edu => ({
          school: edu.school,
          degree: edu.degree,
          startDate: edu.startDate,
          endDate: edu.endDate
        })),
        skills: resumeData.skills || [],
        languages: resumeData.languages || [],
        projects: [],
        socialLinks: resumeData.socialLinks || {
          linkedin: '',
          github: '',
          portfolio: '',
          other: ''
        }
      });
    }
    
    // Update personal info
    if (resumeData.personalInfo) {
      const nameParts = resumeData.personalInfo.name?.split(' ');
      
      if (nameParts && nameParts.length > 0 && (!userProfile.firstName || overwriteExisting)) {
        userProfile.firstName = nameParts[0];
      }
      
      if (nameParts && nameParts.length > 1 && (!userProfile.lastName || overwriteExisting)) {
        userProfile.lastName = nameParts.slice(1).join(' ');
      }
      
      if (resumeData.personalInfo.email && (!userProfile.email || overwriteExisting)) {
        userProfile.email = resumeData.personalInfo.email;
      }
      
      if (resumeData.personalInfo.phone && (!userProfile.phone || overwriteExisting)) {
        userProfile.phone = resumeData.personalInfo.phone;
      }
      
      if (resumeData.personalInfo.location && (!userProfile.location || overwriteExisting)) {
        userProfile.location = resumeData.personalInfo.location;
      }
    }
    
    // Update work experience
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
      if (!userProfile.experience || userProfile.experience.length === 0 || overwriteExisting) {
        userProfile.experience = resumeData.workExperiences.map(exp => ({
          title: exp.role, // Using role for title field to match UserProfile interface
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.endDate.toLowerCase().includes('present'),
          description: Array.isArray(exp.description) ? exp.description.join('\n') : ''
        }));
      }
    }
    
    // Update skills and other fields
    if (resumeData.skills && resumeData.skills.length > 0) {
      if (!userProfile.skills || userProfile.skills.length === 0) {
        userProfile.skills = resumeData.skills;
      } else if (!overwriteExisting) {
        // Merge skills without duplicates
        const existingSkills = new Set(userProfile.skills);
        resumeData.skills.forEach(skill => existingSkills.add(skill));
        userProfile.skills = Array.from(existingSkills);
      } else {
        userProfile.skills = resumeData.skills;
      }
    }
    
    // Update languages
    if (resumeData.languages && resumeData.languages.length > 0) {
      if (!userProfile.languages || userProfile.languages.length === 0) {
        userProfile.languages = resumeData.languages;
      } else if (!overwriteExisting) {
        // Merge languages without duplicates
        const existingLanguages = new Set(userProfile.languages);
        resumeData.languages.forEach(language => existingLanguages.add(language));
        userProfile.languages = Array.from(existingLanguages);
      } else {
        userProfile.languages = resumeData.languages;
      }
    }
    
    // Update education
    if (resumeData.education && resumeData.education.length > 0) {
      if (!userProfile.education || userProfile.education.length === 0 || overwriteExisting) {
        userProfile.education = resumeData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.school,
          location: '',
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: edu.current || false,
          description: ''
        }));
      }
    }
    
    // Update social links
    if (resumeData.socialLinks) {
      if (!userProfile.socialLinks) {
        userProfile.socialLinks = {};
      }
      
      if (resumeData.socialLinks.linkedin && (!userProfile.socialLinks.linkedin || overwriteExisting)) {
        userProfile.socialLinks.linkedin = resumeData.socialLinks.linkedin;
      }
      
      if (resumeData.socialLinks.github && (!userProfile.socialLinks.github || overwriteExisting)) {
        userProfile.socialLinks.github = resumeData.socialLinks.github;
      }
      
      if (resumeData.socialLinks.portfolio && (!userProfile.socialLinks.website || overwriteExisting)) {
        userProfile.socialLinks.website = resumeData.socialLinks.portfolio;
      }
      
      if (resumeData.socialLinks.other && (!userProfile.socialLinks.portfolio || overwriteExisting)) {
        userProfile.socialLinks.portfolio = resumeData.socialLinks.other;
      }
    }
    
    // Save updated profile
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Dispatch profile updated event
    const event = new CustomEvent('profileUpdated', {
      detail: userProfile
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error syncing resume with profile:', error);
    return false;
  }
};

/**
 * Process uploaded resume file
 */
export const processResumeFile = async (file: File): Promise<boolean> => {
  // Check if we should confirm overwrite
  const shouldConfirm = () => {
    try {
      const storedProfile = localStorage.getItem('userProfile');
      if (!storedProfile) return false;
      
      const userProfile = JSON.parse(storedProfile);
      
      // Check if profile already has substantial data
      return (userProfile.firstName && userProfile.lastName) || 
             (userProfile.experience && userProfile.experience.length > 0) ||
             (userProfile.skills && userProfile.skills.length > 3);
    } catch (e) {
      return false;
    }
  };
  
  if (shouldConfirm()) {
    const confirm = window.confirm(
      'Your profile already contains data. Would you like to merge the resume data with your existing profile? ' +
      'Click OK to merge (keeping existing data where conflicts occur), or Cancel to completely overwrite your profile.'
    );
    
    if (confirm) {
      // Merge mode - don't overwrite existing data
      syncResumeWithProfile(resumeData, false);
      toast.success('Resume data merged with your profile');
    } else {
      // Overwrite mode
      syncResumeWithProfile(resumeData, true);
      toast.success('Profile updated with resume data');
    }
  } else {
    // No existing data, just sync
    syncResumeWithProfile(resumeData, true);
    toast.success('Profile updated with resume data');
  }
  
  try {
    const text = await file.text();
    const resumeData = extractResumeData(text);
    
    // Check if we should confirm overwrite
    const shouldConfirm = () => {
      try {
        const storedProfile = localStorage.getItem('userProfile');
        if (!storedProfile) return false;
        
        const userProfile = JSON.parse(storedProfile);
        
        // Check if profile already has substantial data
        return (userProfile.firstName && userProfile.lastName) || 
               (userProfile.experience && userProfile.experience.length > 0) ||
               (userProfile.skills && userProfile.skills.length > 3);
      } catch (e) {
        return false;
      }
    };
    
    if (shouldConfirm()) {
      const confirm = window.confirm(
        'Your profile already contains data. Would you like to merge the resume data with your existing profile? ' +
        'Click OK to merge (keeping existing data where conflicts occur), or Cancel to completely overwrite your profile.'
      );
      
      if (confirm) {
        // Merge mode - don't overwrite existing data
        syncResumeWithProfile(resumeData, false);
        toast.success('Resume data merged with your profile');
      } else {
        // Overwrite mode
        syncResumeWithProfile(resumeData, true);
        toast.success('Profile updated with resume data');
      }
    } else {
      // No existing data, just sync
      syncResumeWithProfile(resumeData, true);
      toast.success('Profile updated with resume data');
    }
    
    return true;
  } catch (error) {
    console.error('Error processing resume file:', error);
    toast.error('Failed to process resume file');
    return false;
  }
};
