
import { ParsedResume } from "@/types/resume";
import { parseWorkExperiences } from "./resume/workExperienceParser";
import { parseEducation } from "./resume/educationParser";
import { parseProjects } from "./resume/projectParser";
import { parseSkills, parseLanguages } from "./resume/skillsParser";
import { extractPersonalInfo, extractSocialLinks } from "./resume/personalInfoParser";
import { toast } from "sonner";

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

export const parseResume = async (file: File, showToast: boolean = false): Promise<ParsedResume> => {
  try {
    const text = await readFileAsText(file);

    const personalInfo = extractPersonalInfo(text);
    const workExperiences = parseWorkExperiences(text);
    const education = parseEducation(text);
    const projects = parseProjects(text);
    const skills = parseSkills(text);
    const languages = parseLanguages(text);
    const socialLinks = extractSocialLinks(text);
    
    // Extract potential work authorization from text
    let workAuthorization = "";
    const workAuthRegex = /(work authorization|work permit|visa status|employment eligibility):?\s*(.*?)(?:\.|$)/i;
    const workAuthMatch = text.match(workAuthRegex);
    if (workAuthMatch && workAuthMatch[2]) {
      workAuthorization = workAuthMatch[2].trim();
      personalInfo.workAuthorization = workAuthorization;
    }
    
    // Try to extract Gmail specifically
    const gmailRegex = /([a-zA-Z0-9._%+-]+@gmail\.com)/i;
    const gmailMatch = text.match(gmailRegex);
    if (gmailMatch && gmailMatch[1]) {
      personalInfo.email = gmailMatch[1]; // Prioritize Gmail if found
    }

    // Enhanced phone extraction with focus on standard formats
    const enhancedPhoneRegex = /(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
    const phoneMatch = text.match(enhancedPhoneRegex);
    if (phoneMatch) {
      personalInfo.phone = phoneMatch[0];
    }

    if (showToast) toast.success("Resume parsed successfully!");

    return {
      personalInfo,
      workExperiences,
      education,
      projects,
      skills,
      languages,
      socialLinks,
      preferences: {
        desiredRoles: [],
        preferredLocations: [],
        preferredIndustries: [],
        preferredCompanySize: "",
        desiredBenefits: [],
        remotePreference: 'remote'
      }
    };
  } catch (error) {
    if (showToast) {
      toast.error("Error parsing resume. Please try again or enter details manually.");
    }
    console.error("Resume parsing error:", error);
    return {
      personalInfo: {
        name: "Your Name",
        email: "email@example.com",
        phone: "+1 (555) 555-5555",
        location: "City, State"
      },
      workExperiences: [],
      education: [],
      projects: [],
      skills: [],
      languages: [],
      socialLinks: {
        linkedin: "",
        github: "",
        portfolio: "",
        other: ""
      },
      preferences: {
        desiredRoles: [],
        preferredLocations: [],
        preferredIndustries: [],
        preferredCompanySize: "",
        desiredBenefits: [],
      }
    };
  }
};
