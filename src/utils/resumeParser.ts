
import { ParsedResume } from "@/types/resume";
import { parseWorkExperiences } from "./resume/workExperienceParser";
import { parseEducation } from "./resume/educationParser";
import { parseProjects } from "./resume/projectParser";
import { parseSkills, parseLanguages, extractSkillKeywords } from "./resume/skillsParser";
import { extractPersonalInfo, extractSocialLinks } from "./resume/personalInfoParser";
import { toast } from "sonner";
import { getUserProfile } from "./profileUtils";
import { smartProfileSync } from "./profileSynchronizer";

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

    const parsedResume = {
      personalInfo,
      workExperiences,
      education,
      projects,
      skills,
      languages,
      socialLinks
    };
    
    // If showToast is true, it means the user explicitly wants to update their profile
    // with this resume data
    if (showToast) {
      const userProfile = getUserProfile();
      const hasExistingData = Boolean(
        userProfile.firstName || 
        userProfile.lastName || 
        (userProfile.skills && userProfile.skills.length > 0)
      );
      
      // If the profile is empty, update it right away
      if (!hasExistingData) {
        await smartProfileSync(parsedResume, true, true);
        toast.success("Profile updated with resume data");
      } else {
        // Otherwise mention that they can update their profile from the Profile page
        toast.info("You can update your profile with this resume data from the Profile page");
      }
    }

    return parsedResume;
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

// Function to extract skills from job descriptions
export const extractImpliedSkills = (text: string): string[] => {
  const knownTechnologies = [
    // Programming languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust",
    // Frameworks & libraries
    "React", "Angular", "Vue", "Node.js", "Django", "Flask", "Spring", "Laravel", "Express", "jQuery",
    ".NET", "TensorFlow", "PyTorch", "Next.js", "Redux", "GraphQL", "REST API",
    // Databases
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Oracle", "SQLite", "Redis", "Cassandra", "DynamoDB",
    // Cloud & DevOps
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Git", "GitHub", "GitLab",
    // Testing
    "Jest", "Mocha", "Cypress", "Selenium", "JUnit", "pytest",
    // Mobile
    "React Native", "Flutter", "iOS", "Android", "Swift", "Kotlin"
  ];
  
  // Check which technologies are mentioned in the text
  const mentionedTechnologies = knownTechnologies.filter(tech => {
    // Create regex to match the technology as a whole word
    const regex = new RegExp(`\\b${tech.replace(/\./g, '\\.')}\\b`, 'i');
    return regex.test(text);
  });
  
  // Look for patterns that suggest technical skills
  const patterns = [
    { regex: /built\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:app|application|system|platform)/gi, group: 1 },
    { regex: /developed\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:app|application|system|platform)/gi, group: 1 },
    { regex: /created\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:app|application|system|platform)/gi, group: 1 },
    { regex: /designed\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:app|application|system|interface|UI)/gi, group: 1 },
    { regex: /implemented\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:feature|system|algorithm)/gi, group: 1 },
    { regex: /deployed\s+(?:an?|the)\s+(\w+(?:\s\w+){0,3})\s+(?:app|application|system|solution)/gi, group: 1 },
  ];
  
  const extractedPhrases = new Set<string>();
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.regex.exec(text)) !== null) {
      if (match[pattern.group]) {
        extractedPhrases.add(match[pattern.group].trim());
      }
    }
  });
  
  // Combine the mentioned technologies and extracted phrases
  return Array.from(new Set([
    ...mentionedTechnologies,
    ...Array.from(extractedPhrases)
  ]));
};

// Enhanced function to suggest profile improvements based on job description
export const suggestProfileImprovements = (jobDescription: string, userProfile: any): string[] => {
  const suggestions: string[] = [];
  
  // Extract skills from job description
  const jobSkills = extractImpliedSkills(jobDescription);
  const userSkills = userProfile.skills || [];
  
  // Find missing skills
  const missingSkills = jobSkills.filter(skill => 
    !userSkills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );
  
  if (missingSkills.length > 0) {
    suggestions.push(`Consider adding these skills to your profile: ${missingSkills.slice(0, 5).join(", ")}${missingSkills.length > 5 ? '...' : ''}`);
  }
  
  // Now also use extractSkillKeywords for a more comprehensive analysis
  const keywordSkills = extractSkillKeywords(jobDescription);
  const missingKeywords = keywordSkills.filter(skill => 
    !userSkills.some(userSkill => 
      userSkill.toLowerCase().includes(skill.toLowerCase()) || 
      skill.toLowerCase().includes(userSkill.toLowerCase())
    )
  );
  
  if (missingKeywords.length > 0 && missingKeywords.some(k => !missingSkills.includes(k))) {
    const uniqueKeywords = missingKeywords.filter(k => !missingSkills.includes(k));
    if (uniqueKeywords.length > 0) {
      suggestions.push(`We also detected these technical keywords in job postings: ${uniqueKeywords.slice(0, 3).join(", ")}${uniqueKeywords.length > 3 ? '...' : ''}`);
    }
  }
  
  // Check for incomplete profile sections
  if (!userProfile.location) {
    suggestions.push("Add your location to improve location-based job matching");
  }
  
  if (!userProfile.experience || userProfile.experience.length === 0) {
    suggestions.push("Add your work experience to strengthen your profile");
  }
  
  if (!userProfile.education || userProfile.education.length === 0) {
    suggestions.push("Include your education details for better job matching");
  }
  
  if (!userProfile.jobPreferences) {
    suggestions.push("Set your job preferences to get more relevant recommendations");
  }
  
  // Check for profile completeness
  const hasGithubLink = userProfile.socialLinks?.github;
  const hasLinkedinLink = userProfile.socialLinks?.linkedin;
  
  if (!hasGithubLink && !hasLinkedinLink) {
    suggestions.push("Add your LinkedIn and GitHub links to enhance your professional profile");
  } else if (!hasGithubLink) {
    suggestions.push("Add your GitHub link to showcase your technical projects");
  } else if (!hasLinkedinLink) {
    suggestions.push("Add your LinkedIn profile to strengthen your professional network");
  }
  
  return suggestions;
};
