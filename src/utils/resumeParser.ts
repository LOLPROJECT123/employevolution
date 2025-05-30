
import { ParsedResume } from "@/types/resume";
import { parseResumeContent } from "./resume/enhancedResumeParser";
import { extractTextFromPDF } from "./pdfParser";
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
    console.log('Starting resume parsing for file:', file.name, 'Type:', file.type);
    
    let text = '';
    
    // Handle different file types
    if (file.type === 'application/pdf') {
      console.log('Processing PDF file...');
      text = await extractTextFromPDF(file);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      console.log('Processing text file...');
      text = await readFileAsText(file);
    } else {
      console.log('Unsupported file type, attempting text extraction...');
      try {
        text = await readFileAsText(file);
      } catch (error) {
        console.warn('Could not read file as text, using fallback');
        text = 'Resume content could not be parsed automatically. Please fill in your profile information manually.';
      }
    }

    console.log('Extracted text length:', text.length);

    // Use the enhanced parser for better extraction
    const parsedData = parseResumeContent(text);
    console.log('Enhanced parsing complete:', parsedData);

    // Ensure we always return a valid structure, even if parsing fails
    const validatedData: ParsedResume = {
      personalInfo: {
        name: parsedData.personalInfo?.name || "",
        email: parsedData.personalInfo?.email || "",
        phone: parsedData.personalInfo?.phone || "",
        location: parsedData.personalInfo?.location || ""
      },
      workExperiences: parsedData.workExperiences || [],
      education: parsedData.education || [],
      projects: parsedData.projects || [],
      skills: parsedData.skills || [],
      languages: parsedData.languages || [],
      socialLinks: parsedData.socialLinks || {
        linkedin: "",
        github: "",
        portfolio: "",
        other: ""
      },
      activities: parsedData.activities || []
    };

    if (showToast) {
      if (validatedData.personalInfo.name || validatedData.workExperiences.length > 0) {
        toast.success("Resume parsed successfully! Some information extracted.");
      } else {
        toast.success("Resume uploaded! Please complete your profile information manually.");
      }
    }

    return validatedData;
  } catch (error) {
    console.error("Resume parsing error:", error);
    
    if (showToast) {
      toast.success("Resume uploaded successfully! Please complete your profile information manually.");
    }
    
    // Return a default structure that allows the user to proceed
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
      },
      activities: []
    };
  }
};
