
import { ParsedResume } from "@/types/resume";
import { parseResumeContent } from "./resume/enhancedResumeParser";
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
    console.log('Starting resume parsing for file:', file.name);
    const text = await readFileAsText(file);
    console.log('File content length:', text.length);

    // Use the enhanced parser for better extraction
    const parsedData = parseResumeContent(text);
    console.log('Enhanced parsing complete:', parsedData);

    if (showToast) {
      toast.success("Resume parsed successfully!");
    }

    return parsedData;
  } catch (error) {
    console.error("Resume parsing error:", error);
    if (showToast) {
      toast.error("Error parsing resume. Please try again or enter details manually.");
    }
    
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
