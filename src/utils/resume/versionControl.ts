
import { ParsedResume } from "@/types/resume";

export interface ResumeSnapshot {
  id: string;
  uploadDate: string; 
  fileName: string;
  description?: string;
  extractedData: ParsedResume;
}

export interface SnapshotDiff {
  field: string;
  oldValue: any;
  newValue: any;
  fieldType: 'personal' | 'experience' | 'education' | 'skills' | 'project' | 'other';
}

/**
 * Add a new resume snapshot to the user's profile
 */
export const addResumeSnapshot = (resumeData: ParsedResume, fileName: string = "Uploaded Resume"): ResumeSnapshot => {
  const snapshot: ResumeSnapshot = {
    id: `resume_${Date.now()}`,
    uploadDate: new Date().toISOString(),
    fileName,
    extractedData: resumeData
  };
  
  // Retrieve existing snapshots
  let snapshots: ResumeSnapshot[] = [];
  try {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      if (profile.resumeSnapshots && Array.isArray(profile.resumeSnapshots)) {
        snapshots = profile.resumeSnapshots;
      }
    }
  } catch (error) {
    console.error('Error retrieving resume snapshots:', error);
  }
  
  // Add new snapshot
  snapshots.unshift(snapshot);
  
  // Limit to 5 snapshots
  if (snapshots.length > 5) {
    snapshots = snapshots.slice(0, 5);
  }
  
  // Update profile with new snapshots
  try {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      profile.resumeSnapshots = snapshots;
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  } catch (error) {
    console.error('Error storing resume snapshots:', error);
  }
  
  return snapshot;
};

/**
 * Compare two resume snapshots and identify differences
 */
export const compareSnapshots = (oldSnapshot: ResumeSnapshot, newSnapshot: ResumeSnapshot): SnapshotDiff[] => {
  const differences: SnapshotDiff[] = [];
  
  // Compare personal info
  const oldInfo = oldSnapshot.extractedData.personalInfo;
  const newInfo = newSnapshot.extractedData.personalInfo;
  
  if (oldInfo.name !== newInfo.name) {
    differences.push({
      field: 'name',
      oldValue: oldInfo.name,
      newValue: newInfo.name,
      fieldType: 'personal'
    });
  }
  
  if (oldInfo.email !== newInfo.email) {
    differences.push({
      field: 'email',
      oldValue: oldInfo.email,
      newValue: newInfo.email,
      fieldType: 'personal'
    });
  }
  
  if (oldInfo.phone !== newInfo.phone) {
    differences.push({
      field: 'phone',
      oldValue: oldInfo.phone,
      newValue: newInfo.phone,
      fieldType: 'personal'
    });
  }
  
  if (oldInfo.location !== newInfo.location) {
    differences.push({
      field: 'location',
      oldValue: oldInfo.location,
      newValue: newInfo.location,
      fieldType: 'personal'
    });
  }
  
  // Compare social links
  const oldSocial = oldSnapshot.extractedData.socialLinks;
  const newSocial = newSnapshot.extractedData.socialLinks;
  
  if (oldSocial.linkedin !== newSocial.linkedin && (oldSocial.linkedin || newSocial.linkedin)) {
    differences.push({
      field: 'linkedin',
      oldValue: oldSocial.linkedin,
      newValue: newSocial.linkedin,
      fieldType: 'personal'
    });
  }
  
  if (oldSocial.github !== newSocial.github && (oldSocial.github || newSocial.github)) {
    differences.push({
      field: 'github',
      oldValue: oldSocial.github,
      newValue: newSocial.github,
      fieldType: 'personal'
    });
  }
  
  // Compare skills (check for added or removed)
  const oldSkills = new Set(oldSnapshot.extractedData.skills);
  const newSkills = new Set(newSnapshot.extractedData.skills);
  
  const addedSkills = [...newSkills].filter(skill => !oldSkills.has(skill));
  const removedSkills = [...oldSkills].filter(skill => !newSkills.has(skill));
  
  if (addedSkills.length > 0 || removedSkills.length > 0) {
    differences.push({
      field: 'skills',
      oldValue: [...oldSkills],
      newValue: [...newSkills],
      fieldType: 'skills'
    });
  }
  
  // Compare work experiences by counting and basic matching
  const oldExperience = oldSnapshot.extractedData.workExperiences;
  const newExperience = newSnapshot.extractedData.workExperiences;
  
  if (oldExperience.length !== newExperience.length) {
    differences.push({
      field: 'experienceCount',
      oldValue: oldExperience.length,
      newValue: newExperience.length,
      fieldType: 'experience'
    });
  }
  
  // Compare education entries
  const oldEducation = oldSnapshot.extractedData.education;
  const newEducation = newSnapshot.extractedData.education;
  
  if (oldEducation.length !== newEducation.length) {
    differences.push({
      field: 'educationCount',
      oldValue: oldEducation.length,
      newValue: newEducation.length,
      fieldType: 'education'
    });
  }
  
  return differences;
};

/**
 * Roll back to a previous resume snapshot
 */
export const rollbackToSnapshot = (snapshotId: string): boolean => {
  try {
    // Get the user profile
    const storedProfile = localStorage.getItem('userProfile');
    if (!storedProfile) return false;
    
    const profile = JSON.parse(storedProfile);
    if (!profile.resumeSnapshots || !Array.isArray(profile.resumeSnapshots)) return false;
    
    // Find the target snapshot
    const targetSnapshot = profile.resumeSnapshots.find(
      (snap: ResumeSnapshot) => snap.id === snapshotId
    );
    
    if (!targetSnapshot) return false;
    
    // Update the profile with snapshot data
    const resumeData = targetSnapshot.extractedData;
    
    // Only update if we have data
    if (resumeData.personalInfo) {
      const nameParts = resumeData.personalInfo.name.split(' ');
      profile.firstName = nameParts[0] || profile.firstName;
      profile.lastName = nameParts.slice(1).join(' ') || profile.lastName;
      profile.email = resumeData.personalInfo.email || profile.email;
      profile.phone = resumeData.personalInfo.phone || profile.phone;
      profile.location = resumeData.personalInfo.location || profile.location;
    }
    
    // Update skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      profile.skills = resumeData.skills;
    }
    
    // Update social links
    if (resumeData.socialLinks) {
      if (!profile.socialLinks) profile.socialLinks = {};
      profile.socialLinks.linkedin = resumeData.socialLinks.linkedin || profile.socialLinks.linkedin;
      profile.socialLinks.github = resumeData.socialLinks.github || profile.socialLinks.github;
      profile.socialLinks.website = resumeData.socialLinks.portfolio || profile.socialLinks.website;
    }
    
    // Save updated profile
    localStorage.setItem('userProfile', JSON.stringify(profile));
    
    // Dispatch profile updated event
    const event = new CustomEvent('profileUpdated', {
      detail: profile
    });
    window.dispatchEvent(event);
    
    return true;
  } catch (error) {
    console.error('Error rolling back to snapshot:', error);
    return false;
  }
};
