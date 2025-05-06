
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
