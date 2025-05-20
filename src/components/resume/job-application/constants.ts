
import { JobApplicationTab } from "./types";

export const JOB_TABS = [
  {
    value: "manual" as JobApplicationTab,
    label: "Manual Apply"
  },
  {
    value: "auto" as JobApplicationTab,
    label: "Auto Apply"
  },
  {
    value: "scraper" as JobApplicationTab,
    label: "Job Scraper"
  },
  {
    value: "linkedin" as JobApplicationTab,
    label: "LinkedIn"
  }
];

export const SUPPORTED_JOB_SOURCES = [
  { name: "LinkedIn", logo: "/logos/linkedin.svg" },
  { name: "Indeed", logo: "/logos/indeed.svg" },
  { name: "Glassdoor", logo: "/logos/glassdoor.svg" },
  { name: "ZipRecruiter", logo: "/logos/ziprecruiter.svg" },
  { name: "Monster", logo: "/logos/monster.svg" }
];

export const DEFAULT_APPLICATION_STATUS = "saved";

export const APPLICATION_STATUSES = [
  { value: "saved", label: "Saved" },
  { value: "applied", label: "Applied" },
  { value: "phone_screen", label: "Phone Screen" },
  { value: "interview", label: "Interview" },
  { value: "assessment", label: "Assessment" },
  { value: "offer", label: "Offer" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "declined", label: "Declined" },
  { value: "withdrawn", label: "Withdrawn" }
];

export const INTERVIEW_TYPES = [
  { value: "phone", label: "Phone" },
  { value: "video", label: "Video" },
  { value: "onsite", label: "Onsite" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" }
];

export const DEFAULT_RESUME_NAME = "MyResume.pdf";
export const DEFAULT_COVER_LETTER_NAME = "CoverLetter.pdf";

// Form field identification for auto-filling
export const FORM_FIELD_IDENTIFIERS = {
  firstName: ["first name", "firstname", "given name", "givenname", "name-first"],
  lastName: ["last name", "lastname", "surname", "family name", "familyname", "name-last"],
  fullName: ["full name", "fullname", "name", "complete name", "your name"],
  email: ["email", "e-mail", "email address", "e-mail address", "emailaddress"],
  phone: ["phone", "telephone", "mobile", "cell", "phone number", "phonenumber", "mobilenumber"],
  address: ["address", "street address", "streetaddress", "mailing address", "mailingaddress"],
  city: ["city", "town"],
  state: ["state", "province", "region"],
  zipCode: ["zip", "zipcode", "postal code", "postalcode", "zip code"],
  country: ["country", "nation"],
  linkedin: ["linkedin", "linkedin url", "linkedin profile"],
  website: ["website", "personal website", "portfolio", "url"],
  github: ["github", "github url", "github profile"],
  resume: ["resume", "cv", "curriculum vitae", "upload resume", "upload cv", "attach resume"],
  coverLetter: ["cover letter", "coverletter", "letter", "motivation letter", "upload cover letter"],
  portfolioUrl: ["portfolio url", "portfolio link", "portfolio website"],
  yearsOfExperience: ["years of experience", "experience", "years experience", "total experience"],
  education: ["education", "degree", "university", "college", "school"],
  skills: ["skills", "technical skills", "competencies", "abilities"]
};
