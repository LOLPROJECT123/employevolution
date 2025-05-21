
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

    if (showToast) toast.success("Resume parsed successfully!");

    return {
      personalInfo,
      workExperiences,
      education,
      projects,
      skills,
      languages,
      socialLinks
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
      }
    };
  }
};
