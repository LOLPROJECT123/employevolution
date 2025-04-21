
// Job source sites supported for scraping
export const SUPPORTED_JOB_SOURCES = [
  { name: "LinkedIn", supported: true },
  { name: "Levels.fyi", supported: true },
  { name: "Handshake", supported: true },
  { name: "OfferPilotAI", supported: true },
  { name: "Simplify.jobs", supported: true },
  { name: "Jobright.ai", supported: true },
  { name: "Indeed", supported: true },
  { name: "Glassdoor", supported: true },
  { name: "Greenhouse", supported: true },
  { name: "Lever", supported: true },
  { name: "Workday", supported: true },
  { name: "Taleo", supported: true },
  { name: "iCims", supported: true },
  { name: "BrassRing", supported: true },
  { name: "SmartRecruiters", supported: true },
  { name: "Jobvite", supported: true },
  { name: "Wellfound", supported: true },
  { name: "Dice", supported: true },
  { name: "ZipRecruiter", supported: true },
  { name: "Monster", supported: true },
  { name: "CareerBuilder", supported: true },
  { name: "Company websites", supported: true },
];

// Job Application Sources Tabs
export const JOB_TABS = [
  { value: "manual", label: "Manual Apply" },
  { value: "auto", label: "Auto Fill" },
  { value: "scraper", label: "Job Scraper" },
];

// Common form field identifiers for auto-filling
export const FORM_FIELD_IDENTIFIERS = {
  firstName: ["first name", "firstname", "given name", "first"],
  lastName: ["last name", "lastname", "surname", "family name", "last"],
  fullName: ["full name", "name", "your name"],
  email: ["email", "e-mail", "email address"],
  phone: ["phone", "mobile", "telephone", "cell", "phone number"],
  address: ["address", "street address", "mailing address"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  zipCode: ["zip", "postal code", "postcode", "zip code"],
  country: ["country", "nation"],
  resume: ["resume", "cv", "curriculum vitae", "upload resume"],
  coverLetter: ["cover letter", "covering letter", "motivation letter"],
  linkedin: ["linkedin", "linkedin url", "linkedin profile"],
  website: ["website", "personal website", "portfolio", "blog"],
  github: ["github", "github url", "github profile"],
  education: ["education", "school", "university", "college", "degree"],
  experience: ["experience", "work experience", "employment history", "work history"],
  skills: ["skills", "abilities", "competencies"],
  languages: ["languages", "spoken languages"],
  references: ["references", "referees"],
  salary: ["salary", "compensation", "expected salary", "desired salary"],
  availableDate: ["available", "start date", "availability"],
  relocation: ["relocation", "willing to relocate"],
  citizenship: ["citizenship", "work authorization", "visa", "eligible to work"],
  security: ["security clearance", "clearance"]
};
