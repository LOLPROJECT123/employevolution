
/**
 * Utilities for document management (resumes, cover letters)
 */

// Define types for document management
export interface UserDocument {
  id: string;
  name: string;
  type: 'resume' | 'cover_letter';
  filePath?: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  fileType: string; // pdf, docx, etc.
  isDefault: boolean;
  tags?: string[];
}

export interface ParsedResume {
  personal: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
    website?: string;
    linkedin?: string;
  };
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description: string[] | string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    courses?: string[];
  }>;
  skills: string[];
  projects?: Array<{
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
  }>;
  certifications?: string[];
  languages?: string[];
}

// Function to convert a file to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Base64'));
      }
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

// Function to convert a Base64 string to a File
export const base64ToFile = (base64: string, fileName: string, mimeType: string): File => {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new File([ab], fileName, { type: mimeType });
};

// Function to enhance resume content by suggesting improvements
export const enhanceResume = async (experienceItem: string, jobDescription?: string): Promise<string> => {
  try {
    // In a real implementation, this would call an API to enhance the content
    // For demo purposes, we'll just return a slightly improved version
    
    if (!experienceItem) return "";
    
    // Simple enhancement for demo
    if (!jobDescription) {
      const enhancedItem = experienceItem
        .replace(/responsible for/i, "Led")
        .replace(/worked on/i, "Developed")
        .replace(/helped/i, "Collaborated to")
        .replace(/managed/i, "Orchestrated")
        .replace(/created/i, "Designed and implemented")
        .replace(/improved/i, "Optimized")
        .replace(/fixed/i, "Resolved");
        
      return enhancedItem;
    }
    
    // If we have a job description, try to match keywords
    const keywords = extractKeywords(jobDescription);
    let enhancedItem = experienceItem;
    
    // Add any relevant keywords that aren't already in the experience
    for (const keyword of keywords) {
      if (!experienceItem.toLowerCase().includes(keyword.toLowerCase()) && 
          isKeywordRelevant(keyword, experienceItem)) {
        enhancedItem = enhancedItem.replace(/\.$/, `, leveraging ${keyword}.`);
        break;
      }
    }
    
    return enhancedItem;
  } catch (error) {
    console.error("Error enhancing resume:", error);
    return experienceItem;
  }
};

// Extract potential keywords from job description
function extractKeywords(jobDescription: string): string[] {
  const commonSkillKeywords = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", "Java", "C#", "SQL",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "Agile", "Scrum", "DevOps",
    "frontend", "backend", "full-stack", "microservices", "REST", "GraphQL", "API", "testing",
    "data analysis", "machine learning", "UX/UI", "responsive design", "mobile development"
  ];
  
  return commonSkillKeywords.filter(keyword => 
    jobDescription.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Check if a keyword is relevant to the experience item
function isKeywordRelevant(keyword: string, experienceItem: string): boolean {
  // This is a very simple heuristic - in a real implementation, 
  // this would use NLP to determine relevance
  
  const lowercaseExperience = experienceItem.toLowerCase();
  
  // Technology keywords
  if (["JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", "Java", "C#", "SQL",
       "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Git"].includes(keyword)) {
    return lowercaseExperience.includes("develop") || 
           lowercaseExperience.includes("engineer") || 
           lowercaseExperience.includes("implement") ||
           lowercaseExperience.includes("build") ||
           lowercaseExperience.includes("code");
  }
  
  // Process keywords
  if (["Agile", "Scrum", "DevOps", "CI/CD"].includes(keyword)) {
    return lowercaseExperience.includes("team") || 
           lowercaseExperience.includes("project") || 
           lowercaseExperience.includes("process") ||
           lowercaseExperience.includes("pipeline") ||
           lowercaseExperience.includes("deploy");
  }
  
  // Default to false if no specific rules match
  return false;
}

// Function to generate a cover letter
export const generateCoverLetter = async (
  jobDescription: string, 
  userProfile: any
): Promise<string> => {
  try {
    // In a real implementation, this would call an AI service API
    // For demo purposes, we'll generate a template-based cover letter
    
    const companyName = extractCompanyName(jobDescription);
    const jobTitle = extractJobTitle(jobDescription);
    const skills = extractKeywords(jobDescription).slice(0, 5);
    
    const fullName = `${userProfile.personal?.firstName || ''} ${userProfile.personal?.lastName || ''}`.trim();
    const userEmail = userProfile.personal?.email || '[Your Email]';
    const userPhone = userProfile.personal?.phone || '[Your Phone]';
    const relevantSkills = userProfile.skills?.filter((skill: string) => 
      skills.some(jobSkill => skill.toLowerCase().includes(jobSkill.toLowerCase()))
    ) || [];
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return `${currentDate}

${fullName}
${userEmail}
${userPhone}

Dear Hiring Manager,

I am writing to express my sincere interest in the ${jobTitle} position at ${companyName}. With my background in ${userProfile.experience?.[0]?.title || 'the field'} and expertise in ${relevantSkills.join(', ') || 'relevant technologies'}, I am confident in my ability to make a significant contribution to your team.

Throughout my career at ${userProfile.experience?.[0]?.company || 'my previous employers'}, I have successfully ${userProfile.experience?.[0]?.description?.[0] || 'delivered impactful results'}. My professional experience has equipped me with the skills necessary to excel in this role, particularly in ${skills.join(', ') || 'the required areas'}.

I am especially drawn to ${companyName} because of your commitment to innovation and excellence in the industry. The opportunity to contribute to ${generateCompanyAchievement(companyName)} is exciting, and I am eager to bring my skills and passion to your team.

Thank you for considering my application. I look forward to the opportunity to discuss how I can contribute to ${companyName}'s continued success.

Sincerely,
${fullName}`;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return "Error generating cover letter. Please try again later.";
  }
};

// Helper function to extract company name from job description
function extractCompanyName(jobDescription: string): string {
  // This is a placeholder - in a real implementation, 
  // this would use more sophisticated extraction
  const companyPatterns = [
    /at\s+([\w\s&.]+?)\s+(?:is|we are|we're)/i,
    /join\s+([\w\s&.]+?)\s+(?:as|and)/i,
    /([\w\s&.]+?)\s+is looking for/i
  ];
  
  for (const pattern of companyPatterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "the company";
}

// Helper function to extract job title from job description
function extractJobTitle(jobDescription: string): string {
  // This is a placeholder - in a real implementation,
  // this would use more sophisticated extraction
  const titlePatterns = [
    /for\s+(?:a\s+)?([\w\s]+?)\s+position/i,
    /hiring\s+(?:a\s+)?([\w\s]+?)(?:\s+to|\.)/i,
    /([\w\s]+?)\s+(?:role|position|opportunity)/i
  ];
  
  for (const pattern of titlePatterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return "the open position";
}

// Generate a generic achievement for a company
function generateCompanyAchievement(companyName: string): string {
  const achievements = [
    "your innovative products",
    "your market-leading solutions",
    "your commitment to customer satisfaction",
    "your groundbreaking research",
    "your industry leadership"
  ];
  
  return achievements[Math.floor(Math.random() * achievements.length)];
}

// Parse a resume file to extract structured data
export const parseResume = async (file: File): Promise<ParsedResume> => {
  try {
    // In a real implementation, this would call a resume parsing API
    // For demo purposes, we'll return an empty structure
    
    return {
      personal: {
        name: '',
        email: '',
        phone: '',
        address: {},
        website: '',
        linkedin: ''
      },
      experience: [],
      education: [],
      skills: []
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error("Failed to parse resume. Please try again.");
  }
};
