import { toast } from "sonner";

export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
  };
  workExperiences: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  projects: Array<{
    name: string;
    startDate: string;
    endDate: string;
    description: string[];
  }>;
  skills: string[];
  languages: string[];
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
    other: string;
  };
}

const parseWorkExperiences = (text: string) => {
  // This is a simplified parser - in a real app, this would be more sophisticated
  const workExperiences = [];
  const workSection = text.match(/EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROFESSIONAL EXPERIENCE/i);

  if (workSection) {
    const sectionStart = text.indexOf(workSection[0]);
    const nextSection = text.slice(sectionStart + workSection[0].length).match(/EDUCATION|PROJECTS|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const workText = text.slice(sectionStart, sectionEnd);

    const workEntries = workText.split(/\n\s*\n/);

    for (let i = 1; i < workEntries.length; i++) {
      const entry = workEntries[i].trim();
      if (entry.length < 10) continue;
      
      const roleMatch = entry.match(/^(.*?)(?:at|@|\||-|–|,|\n)/i);
      const companyMatch = entry.match(/(?:at|@|\||-|–|,|\n)(.*?)(?:\||,|-|–|\n)/i);
      const dateMatch = entry.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b)\s*(?:to|-|–|—)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\bPresent\b)/i);
      
      const role = roleMatch ? roleMatch[1].trim() : "Role";
      const company = companyMatch ? companyMatch[1].trim() : "Company";
      const startDate = dateMatch ? dateMatch[1].trim() : "Jan 2020";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "Present";
      
      const description = entry
        .replace(/^.*\n/, '')
        .split(/[-•*]/)
        .map(item => item.trim())
        .filter(item => item.length > 10);
      
      workExperiences.push({
        id: i,
        role,
        company,
        location: "Location",
        startDate,
        endDate,
        description: description.length > 0 ? description : ["Responsibilities and achievements"]
      });
    }
  }

  return workExperiences.length > 0 ? workExperiences : [
    {
      id: 1,
      role: "Software Engineer",
      company: "Example Company",
      location: "City, State",
      startDate: "Jan 2022",
      endDate: "Present",
      description: ["Extracted from resume. Please edit details as needed."]
    }
  ];
};

const parseEducation = (text: string) => {
  const education = [];
  const eduSection = text.match(/EDUCATION|ACADEMIC|EDUCATIONAL BACKGROUND/i);

  if (eduSection) {
    const sectionStart = text.indexOf(eduSection[0]);
    const nextSection = text.slice(sectionStart + eduSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|PROJECTS|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const eduText = text.slice(sectionStart, sectionEnd);

    const eduEntries = eduText.split(/\n\s*\n/);

    for (let i = 1; i < eduEntries.length; i++) {
      const entry = eduEntries[i].trim();
      if (entry.length < 10) continue;
      
      const schoolMatch = entry.match(/^(.*?)(?:,|-|–|\n)/i);
      const degreeMatch = entry.match(/(?:Bachelor|Master|Ph\.D|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA|MD|JD).*?(?:in|of).*?(?:,|-|–|\n)/i);
      const dateMatch = entry.match(/(\d{4})\s*(?:-|–|—|to)\s*(\d{4}|Present)/i);
      
      const school = schoolMatch ? schoolMatch[1].trim() : "University";
      const degree = degreeMatch ? degreeMatch[0].replace(/,|-|–|\n/g, '').trim() : "Degree";
      const startDate = dateMatch ? dateMatch[1].trim() : "2020";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "2024";
      
      education.push({
        id: i,
        school,
        degree,
        startDate: `${startDate}`,
        endDate: `${endDate}`
      });
    }
  }

  return education.length > 0 ? education : [
    {
      id: 1,
      school: "University Name",
      degree: "Degree in Field",
      startDate: "2020",
      endDate: "2024"
    }
  ];
};

const parseProjects = (text: string) => {
  const projects = [];
  const projectSection = text.match(/PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS/i);

  if (projectSection) {
    const sectionStart = text.indexOf(projectSection[0]);
    const nextSection = text.slice(sectionStart + projectSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|SKILLS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const projectText = text.slice(sectionStart, sectionEnd);

    const projectEntries = projectText.split(/\n\s*\n/);

    for (let i = 1; i < projectEntries.length; i++) {
      const entry = projectEntries[i].trim();
      if (entry.length < 10) continue;
      
      const nameMatch = entry.match(/^(.*?)(?:,|-|–|\n)/i);
      const dateMatch = entry.match(/(\d{4})\s*(?:-|–|—|to)\s*(\d{4}|Present)/i);
      
      const name = nameMatch ? nameMatch[1].trim() : "Project Name";
      const startDate = dateMatch ? dateMatch[1].trim() : "2023";
      const endDate = dateMatch && dateMatch[2] ? dateMatch[2].trim() : "Present";
      
      const description = entry
        .replace(/^.*\n/, '')
        .split(/[-•*]/)
        .map(item => item.trim())
        .filter(item => item.length > 5);
      
      projects.push({
        id: i,
        name,
        startDate,
        endDate,
        description: description.length > 0 ? description : ["Project description. Please edit as needed."]
      });
    }
  }

  return projects.length > 0 ? projects : [
    {
      id: 1,
      name: "Project Name",
      startDate: "2023",
      endDate: "Present",
      description: ["Project description extracted from resume. Please edit as needed."]
    }
  ];
};

const parseSkills = (text: string) => {
  const skillsSection = text.match(/SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES/i);
  
  if (skillsSection) {
    const sectionStart = text.indexOf(skillsSection[0]);
    const nextSection = text.slice(sectionStart + skillsSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS|LANGUAGES|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const skillsText = text.slice(sectionStart, sectionEnd).toLowerCase();

    const commonTechSkills = [
      "javascript", "python", "java", "c++", "react", "angular", "vue", "node.js", 
      "express", "django", "flask", "spring", "aws", "azure", "gcp", "docker", "kubernetes",
      "mongodb", "postgresql", "mysql", "redis", "typescript", "html", "css", "git", "cicd",
      "machine learning", "data science", "ai", "react native", "swift", "kotlin", "flutter"
    ];
    
    return commonTechSkills
      .filter(skill => skillsText.includes(skill.toLowerCase()))
      .slice(0, 7);
  }
  
  return ["JavaScript", "React", "TypeScript", "Node.js"];
};

const parseLanguages = (text: string) => {
  const languagesSection = text.match(/LANGUAGES|LANGUAGE PROFICIENCY/i);
  
  if (languagesSection) {
    const sectionStart = text.indexOf(languagesSection[0]);
    const nextSection = text.slice(sectionStart + languagesSection[0].length).match(/EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS|SKILLS|CERTIFICATIONS/i);
    const sectionEnd = nextSection ? text.indexOf(nextSection[0], sectionStart) : text.length;
    const languagesText = text.slice(sectionStart, sectionEnd).toLowerCase();

    const commonLanguages = [
      "english", "spanish", "french", "german", "chinese", "mandarin", "cantonese", 
      "japanese", "korean", "russian", "arabic", "hindi", "portuguese", "italian"
    ];
    
    return commonLanguages
      .filter(language => languagesText.includes(language.toLowerCase()))
      .map(lang => lang.charAt(0).toUpperCase() + lang.slice(1));
  }
  
  return ["English"];
};

const extractSocialLinks = (text: string) => {
  const socialLinks = {
    linkedin: "",
    github: "",
    portfolio: "",
    other: ""
  };

  const linkedinMatch = text.match(/(linkedin\.com\/in\/[a-z0-9-]+)/i);
  const githubMatch = text.match(/(github\.com\/[a-z0-9-]+)/i);
  const websiteMatch = text.match(/(https?:\/\/(?!linkedin\.com|github\.com)[a-z0-9-]+\.[a-z]{2,}(?:\/[a-z0-9-]+)*)/i);

  if (linkedinMatch) socialLinks.linkedin = `https://www.${linkedinMatch[1]}`;
  if (githubMatch) socialLinks.github = `https://www.${githubMatch[1]}`;
  if (websiteMatch) socialLinks.portfolio = websiteMatch[1];

  return socialLinks;
};

const extractPersonalInfo = (text: string) => {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = text.match(/(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const nameMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
  const locationMatch = text.match(/[A-Z][a-zA-Z]+,\s*[A-Z]{2}/);

  return {
    name: nameMatch ? nameMatch[1] : "Your Name",
    email: emailMatch ? emailMatch[0] : "email@example.com",
    phone: phoneMatch ? phoneMatch[0] : "+1 (555) 555-5555",
    location: locationMatch ? locationMatch[0] : "City, State"
  };
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
