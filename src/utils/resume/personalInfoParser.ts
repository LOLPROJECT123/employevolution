
import { toast } from "sonner";

export const extractPersonalInfo = (text: string) => {
  // Enhanced email extraction with preference for Gmail
  const gmailMatch = text.match(/\b[A-Za-z0-9._%+-]+@gmail\.com\b/i);
  const generalEmailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Enhanced phone extraction
  const phonePatterns = [
    /(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/,  // Standard US format
    /\b\d{10}\b/,  // Simple 10 digit
    /\+\d{1,2}\s\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/  // International format
  ];
  
  let phoneMatch = null;
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      phoneMatch = match;
      break;
    }
  }
  
  // Name extraction - look for patterns like "JOHN DOE" or first line of resume
  const namePatterns = [
    /^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/m,  // Standard "First Last"
    /^([A-Z][A-Z\s]+)$/m,  // ALL CAPS NAME
    /([A-Z][a-z]+ [A-Z][a-z]+)(?:\n|,)/  // Name followed by newline or comma
  ];
  
  let nameMatch = null;
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) {
      nameMatch = match;
      break;
    }
  }
  
  // Enhanced location extraction
  const locationPatterns = [
    /([A-Z][a-zA-Z]+,\s*[A-Z]{2})/,  // City, ST
    /([A-Z][a-zA-Z\s]+,\s*[A-Za-z\s]+)/,  // City, State
    /Location:?\s*([A-Za-z\s]+,\s*[A-Za-z\s]+)/i  // Location: City, State
  ];
  
  let locationMatch = null;
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) {
      locationMatch = match;
      break;
    }
  }

  return {
    name: nameMatch ? nameMatch[1] : "Your Name",
    email: gmailMatch ? gmailMatch[0] : (generalEmailMatch ? generalEmailMatch[0] : "email@example.com"),
    phone: phoneMatch ? phoneMatch[0] : "+1 (555) 555-5555",
    location: locationMatch ? locationMatch[1] : "City, State",
    workAuthorization: ""
  };
};

export const extractSocialLinks = (text: string) => {
  const socialLinks = {
    linkedin: "",
    github: "",
    portfolio: "",
    other: ""
  };

  // LinkedIn pattern - multiple formats
  const linkedinPatterns = [
    /(linkedin\.com\/in\/[a-z0-9-]+)/i,
    /linkedin:?\s*((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-z0-9-]+)/i,
    /LinkedIn:?\s*((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9-]+)/i
  ];
  
  // Github pattern - multiple formats  
  const githubPatterns = [
    /(github\.com\/[a-z0-9-]+)/i,
    /github:?\s*((?:https?:\/\/)?(?:www\.)?github\.com\/[a-z0-9-]+)/i,
    /GitHub:?\s*((?:https?:\/\/)?(?:www\.)?github\.com\/[A-Za-z0-9-]+)/i
  ];
  
  // Portfolio/personal website
  const websitePatterns = [
    /(https?:\/\/(?!linkedin\.com|github\.com)[a-z0-9-]+\.[a-z]{2,}(?:\/[a-z0-9-]+)*)/i,
    /website:?\s*(https?:\/\/[a-z0-9-]+\.[a-z]{2,}(?:\/[a-z0-9-]+)*)/i,
    /portfolio:?\s*(https?:\/\/[a-z0-9-]+\.[a-z]{2,}(?:\/[a-z0-9-]+)*)/i
  ];

  // Check LinkedIn patterns
  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match) {
      socialLinks.linkedin = match[1].startsWith('http') ? match[1] : `https://www.${match[1]}`;
      break;
    }
  }
  
  // Check GitHub patterns
  for (const pattern of githubPatterns) {
    const match = text.match(pattern);
    if (match) {
      socialLinks.github = match[1].startsWith('http') ? match[1] : `https://www.${match[1]}`;
      break;
    }
  }
  
  // Check website patterns
  for (const pattern of websitePatterns) {
    const match = text.match(pattern);
    if (match) {
      socialLinks.portfolio = match[1].startsWith('http') ? match[1] : `https://${match[1]}`;
      break;
    }
  }

  return socialLinks;
};
