
export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    workAuthorization?: string;
  };
  workExperiences: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string[];
    industry?: string;
    companySize?: string;
  }>;
  education: Array<{
    school: string;
    degree: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    fieldOfStudy?: string;
    description?: string[];
  }>;
  projects: Array<{
    name: string;
    startDate: string;
    endDate: string;
    description: string[];
    technologies?: string[];
    url?: string;
  }>;
  skills: string[];
  languages: string[];
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
    other: string;
  };
  preferences?: {
    desiredRoles?: string[];
    preferredLocations?: string[];
    preferredIndustries?: string[];
    preferredCompanySize?: string;
    desiredBenefits?: string[];
    salaryExpectation?: string;
    remotePreference?: 'remote' | 'hybrid' | 'onsite';
  };
}
