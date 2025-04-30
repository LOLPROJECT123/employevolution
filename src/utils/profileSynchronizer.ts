import { ParsedResume } from "@/types/resume";
import { UserProfile, saveUserProfile, getUserProfile } from "@/utils/profileUtils";
import { extractImpliedSkills, suggestProfileImprovements } from "@/utils/resumeParser";
import { addResumeSnapshot } from "@/utils/resume/versionControl";
import { saveUserProfileToExtension } from "@/utils/syncUtils";
import { toast } from "sonner";

/**
 * Smart Profile Sync - Extracts and propagates resume data across the application
 */
export const smartProfileSync = async (
  resumeData: ParsedResume,
  overwrite: boolean = false,
  triggerNotifications: boolean = true,
  saveToExtension: boolean = true
): Promise<{
  success: boolean;
  updatedProfile: Partial<UserProfile>;
  suggestedImprovements: string[];
}> => {
  try {
    // Get current profile
    const currentProfile = getUserProfile();
    
    // Create a new profile with extracted data
    const updatedProfile: Partial<UserProfile> = { ...currentProfile };
    
    // Save resume snapshot for versioning
    const snapshot = addResumeSnapshot(resumeData);
    
    // Update personal information if available
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
        updatedProfile.experience = resumeData.workExperiences.map((exp) => ({
          title: exp.role,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate === 'Present' ? undefined : exp.endDate,
          current: exp.endDate === 'Present',
          description: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description.join('\n')
        }));
      } else {
        // Smart merge: Add any new experiences that don't match existing ones
        const existingExperience = currentProfile.experience || [];
        const newExperience = [...existingExperience];
        
        resumeData.workExperiences.forEach(exp => {
          // Check if this experience already exists
          const exists = existingExperience.some(e => 
            e.company === exp.company && 
            e.title === exp.role && 
            e.startDate === exp.startDate
          );
          
          if (!exists) {
            newExperience.push({
              title: exp.role,
              company: exp.company,
              location: exp.location,
              startDate: exp.startDate,
              endDate: exp.endDate === 'Present' ? undefined : exp.endDate,
              current: exp.endDate === 'Present',
              description: Array.isArray(exp.description) ? exp.description.join('\n') : exp.description.join('\n')
            });
          }
        });
        
        updatedProfile.experience = newExperience;
      }
    }
    
    // Update education
    if (resumeData.education && resumeData.education.length > 0) {
      if (overwrite || !currentProfile.education || currentProfile.education.length === 0) {
        updatedProfile.education = resumeData.education.map((edu) => ({
          degree: edu.degree,
          institution: edu.school,
          location: '',
          startDate: edu.startDate,
          endDate: edu.endDate === 'Present' ? undefined : edu.endDate,
          current: edu.endDate === 'Present',
          description: ''
        }));
      } else {
        // Smart merge: Add any new education entries
        const existingEducation = currentProfile.education || [];
        const newEducation = [...existingEducation];
        
        resumeData.education.forEach(edu => {
          // Check if this education already exists
          const exists = existingEducation.some(e => 
            e.institution === edu.school && 
            e.degree === edu.degree
          );
          
          if (!exists) {
            newEducation.push({
              degree: edu.degree,
              institution: edu.school,
              location: '',
              startDate: edu.startDate,
              endDate: edu.endDate === 'Present' ? undefined : edu.endDate,
              current: edu.endDate === 'Present',
              description: ''
            });
          }
        });
        
        updatedProfile.education = newEducation;
      }
    }
    
    // Update skills - extract both explicit and implied skills
    const explicitSkills = resumeData.skills || [];
    const impliedSkills: string[] = [];
    
    // Extract implied skills from work experience descriptions
    if (resumeData.workExperiences && resumeData.workExperiences.length > 0) {
      resumeData.workExperiences.forEach(exp => {
        if (exp.description && Array.isArray(exp.description)) {
          const expDesc = exp.description.join(' ');
          const extractedSkills = extractImpliedSkills(expDesc);
          impliedSkills.push(...extractedSkills);
        }
      });
    }
    
    // Extract implied skills from project descriptions
    if (resumeData.projects && resumeData.projects.length > 0) {
      resumeData.projects.forEach(proj => {
        if (proj.description && Array.isArray(proj.description)) {
          const projDesc = proj.description.join(' ');
          const extractedSkills = extractImpliedSkills(projDesc);
          impliedSkills.push(...extractedSkills);
        }
      });
    }
    
    // Combine and deduplicate skills
    const allSkills = [...new Set([...explicitSkills, ...impliedSkills])];
    
    if (allSkills.length > 0) {
      // If overwriting or no existing skills, just use the new skills
      if (overwrite || !currentProfile.skills || currentProfile.skills.length === 0) {
        updatedProfile.skills = allSkills;
      } else {
        // Otherwise merge skills without duplicates
        const existingSkills = new Set(currentProfile.skills);
        allSkills.forEach(skill => existingSkills.add(skill));
        updatedProfile.skills = Array.from(existingSkills);
      }
    }
    
    // Update projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      if (overwrite || !currentProfile.projects || currentProfile.projects.length === 0) {
        updatedProfile.projects = resumeData.projects.map((proj) => ({
          name: proj.name,
          description: Array.isArray(proj.description) ? proj.description.join('\n') : proj.description.join('\n'),
          startDate: proj.startDate,
          endDate: proj.endDate
        }));
      } else {
        // Smart merge: Add any new projects
        const existingProjects = currentProfile.projects || [];
        const newProjects = [...existingProjects];
        
        resumeData.projects.forEach(proj => {
          // Check if this project already exists
          const exists = existingProjects.some(p => p.name === proj.name);
          
          if (!exists) {
            newProjects.push({
              name: proj.name,
              description: Array.isArray(proj.description) ? proj.description.join('\n') : proj.description.join('\n'),
              startDate: proj.startDate,
              endDate: proj.endDate
            });
          }
        });
        
        updatedProfile.projects = newProjects;
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
    
    // Save the updated profile
    saveUserProfile(updatedProfile);
    
    // Sync with extension if available
    if (saveToExtension) {
      saveUserProfileToExtension(updatedProfile).catch(err => {
        console.warn("Could not sync profile with extension:", err);
      });
    }
    
    // Generate suggestions for profile improvements
    const mockJobDescription = "Looking for a skilled software developer with experience in web application development, proficient in modern JavaScript frameworks like React, Angular or Vue. Knowledge of backend technologies such as Node.js, Express, or Django is a plus. The ideal candidate should have strong problem-solving skills and experience with version control systems like Git.";
    const suggestedImprovements = suggestProfileImprovements(mockJobDescription, updatedProfile);
    
    if (triggerNotifications) {
      if (suggestedImprovements.length > 0) {
        toast.info("We've found some ways to improve your profile", {
          description: suggestedImprovements[0]
        });
      } else {
        toast.success("Your profile is looking good!");
      }
    }
    
    return {
      success: true,
      updatedProfile,
      suggestedImprovements
    };
  } catch (error) {
    console.error('Error syncing profile from resume:', error);
    
    if (triggerNotifications) {
      toast.error("Error updating your profile", {
        description: "There was a problem processing your resume data."
      });
    }
    
    return {
      success: false,
      updatedProfile: getUserProfile(),
      suggestedImprovements: []
    };
  }
};
