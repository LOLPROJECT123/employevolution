
/**
 * Types for resume parsing and management
 */

export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    title?: string;
    summary?: string;
    dateOfBirth?: string;
  };
  skills: string[];
  languages: string[];
  workExperiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    other?: string;
  };
  certifications?: Certification[];
  achievements?: string[];
  interests?: string[];
  references?: Reference[];
}

export interface WorkExperience {
  id?: number;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string[] | string;
  technologies?: string[];
  achievements?: string[];
  responsibilities?: string[];
  url?: string;
}

export interface Education {
  id?: number;
  school: string;
  degree: string;
  field?: string;
  location?: string;
  startDate: string;
  endDate: string;
  gpa?: number;
  courses?: string[];
  activities?: string[];
  description?: string;
}

export interface Project {
  id?: number;
  name: string;
  description: string[] | string;
  technologies?: string[];
  url?: string;
  repositoryUrl?: string;
  startDate: string;
  endDate: string;
  highlights?: string[];
}

export interface Certification {
  id?: number;
  name: string;
  organization: string;
  date: string;
  expires?: string;
  credentialId?: string;
  url?: string;
}

export interface Reference {
  name: string;
  position: string;
  company: string;
  contact: string;
  relationship: string;
}

export interface ResumeParserResult {
  success: boolean;
  resume?: ParsedResume;
  error?: string;
  confidence?: number;
}

export interface ResumeComparisonResult {
  similarity: number;
  missingSkills: string[];
  extraSkills: string[];
  matchedSkills: string[];
  missingEducation: boolean;
  missingExperience: boolean;
  recommendations: string[];
}
