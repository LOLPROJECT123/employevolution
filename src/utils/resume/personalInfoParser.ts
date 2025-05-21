
import { toast } from "sonner";

export const extractPersonalInfo = (text: string) => {
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

export const extractSocialLinks = (text: string) => {
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
