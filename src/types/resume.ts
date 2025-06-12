export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  county?: string;
  zipCode?: string;
  dateOfBirth?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  other?: string;
}

export interface Education {
  school: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface WorkExperience {
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string[];
}

export interface Project {
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string[];
  technologies?: string[];
  url?: string;
}

export interface Activity {
  organization: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ParsedResume {
  personalInfo?: PersonalInfo;
  socialLinks?: SocialLinks;
  education?: Education[];
  workExperiences?: WorkExperience[];
  projects?: Project[];
  activities?: Activity[];
  skills?: string[];
  languages?: string[];
}

export interface ResumeParsingResult {
  success: boolean;
  data?: ParsedResume;
  error?: string;
  confidence?: number;
}
