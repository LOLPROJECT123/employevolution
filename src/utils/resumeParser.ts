
import { ParsedResume } from "@/types/resume";
import { parseWorkExperiences } from "./resume/workExperienceParser";
import { parseEducation } from "./resume/educationParser";
import { parseProjects } from "./resume/projectParser";
import { parseSkills, parseLanguages } from "./resume/skillsParser";
import { extractPersonalInfo, extractSocialLinks } from "./resume/personalInfoParser";
import { 
  extractSectionsBetweenBoldHeadings, 
  parseExperienceFromSection, 
  parseEducationFromSection, 
  parseProjectsFromSection,
  parseSkillsFromSection 
} from "./resume/sectionParser";
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

    // Extract structured sections using enhanced parser
    const sections = extractSectionsBetweenBoldHeadings(text);
    console.log('Extracted sections:', sections);

    // Parse personal information
    const personalInfo = extractPersonalInfo(text);
    
    // Parse work experience using enhanced section parsing
    const experienceSection = sections.find(s => 
      s.title.toLowerCase().includes('experience') || 
      s.title.toLowerCase().includes('employment')
    );
    
    let workExperiences = [];
    if (experienceSection) {
      workExperiences = parseExperienceFromSection(experienceSection.content);
      console.log('Parsed work experiences:', workExperiences);
    }
    
    // Fallback to original parser if enhanced parser didn't find anything
    if (workExperiences.length === 0) {
      workExperiences = parseWorkExperiences(text);
    }

    // Parse education using enhanced section parsing
    const educationSection = sections.find(s => 
      s.title.toLowerCase().includes('education') || 
      s.title.toLowerCase().includes('academic')
    );
    
    let education = [];
    if (educationSection) {
      education = parseEducationFromSection(educationSection.content);
      console.log('Parsed education:', education);
    }
    
    // Fallback to original parser
    if (education.length === 0) {
      education = parseEducation(text);
    }

    // Parse projects using enhanced section parsing
    const projectSection = sections.find(s => 
      s.title.toLowerCase().includes('project')
    );
    
    let projects = [];
    if (projectSection) {
      projects = parseProjectsFromSection(projectSection.content);
      console.log('Parsed projects:', projects);
    }
    
    // Fallback to original parser
    if (projects.length === 0) {
      projects = parseProjects(text);
    }

    // Parse skills using enhanced section parsing
    const skillsSection = sections.find(s => 
      s.title.toLowerCase().includes('skill') || 
      s.title.toLowerCase().includes('competenc') ||
      s.title.toLowerCase().includes('technolog')
    );
    
    let skills = [];
    if (skillsSection) {
      skills = parseSkillsFromSection(skillsSection.content);
      console.log('Parsed skills:', skills);
    }
    
    // Fallback to original parser
    if (skills.length === 0) {
      skills = parseSkills(text);
    }

    // Parse languages
    const languagesSection = sections.find(s => 
      s.title.toLowerCase().includes('language')
    );
    
    let languages = [];
    if (languagesSection) {
      // Simple parsing for languages section
      const languageText = languagesSection.content;
      const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Portuguese', 'Italian', 'Russian'];
      languages = commonLanguages.filter(lang => 
        languageText.toLowerCase().includes(lang.toLowerCase())
      );
    }
    
    // Fallback to original parser
    if (languages.length === 0) {
      languages = parseLanguages(text);
    }

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
        name: "",
        email: "",
        phone: "",
        location: ""
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
