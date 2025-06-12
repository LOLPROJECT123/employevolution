import { toast } from "sonner";

export const extractPersonalInfo = (text: string) => {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  const phoneMatch = text.match(/(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  const nameMatch = text.match(/^([A-Z][a-z]+(?: [A-Z][a-z]+)+)/);
  const locationMatch = text.match(/[A-Z][a-zA-Z]+,\s*[A-Z]{2}/);
  
  // Date of Birth extraction
  const dobMatch = extractDateOfBirth(text);

  return {
    name: nameMatch ? nameMatch[1] : "Your Name",
    email: emailMatch ? emailMatch[0] : "email@example.com",
    phone: phoneMatch ? phoneMatch[0] : "+1 (555) 555-5555",
    location: locationMatch ? locationMatch[0] : "City, State",
    dateOfBirth: dobMatch || ""
  };
};

const extractDateOfBirth = (text: string): string => {
  // Common DOB prefixes
  const dobPrefixes = [
    'date of birth:?\\s*',
    'dob:?\\s*',
    'born:?\\s*',
    'birth date:?\\s*',
    'd\\.o\\.b\\.?:?\\s*',
    'birthdate:?\\s*'
  ];

  // Date patterns
  const datePatterns = [
    // MM/DD/YYYY or MM-DD-YYYY
    '(0?[1-9]|1[0-2])[/\\-](0?[1-9]|[12][0-9]|3[01])[/\\-](19|20)\\d{2}',
    // DD/MM/YYYY or DD-MM-YYYY
    '(0?[1-9]|[12][0-9]|3[01])[/\\-](0?[1-9]|1[0-2])[/\\-](19|20)\\d{2}',
    // Month DD, YYYY
    '(january|february|march|april|may|june|july|august|september|october|november|december)\\s+(0?[1-9]|[12][0-9]|3[01]),?\\s+(19|20)\\d{2}',
    // DD Month YYYY
    '(0?[1-9]|[12][0-9]|3[01])\\s+(january|february|march|april|may|june|july|august|september|october|november|december)\\s+(19|20)\\d{2}',
    // Mon DD, YYYY (abbreviated)
    '(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\\.?\\s+(0?[1-9]|[12][0-9]|3[01]),?\\s+(19|20)\\d{2}',
    // YYYY-MM-DD
    '(19|20)\\d{2}[/\\-](0?[1-9]|1[0-2])[/\\-](0?[1-9]|[12][0-9]|3[01])'
  ];

  const normalizedText = text.toLowerCase();

  // Try to find date with prefixes first
  for (const prefix of dobPrefixes) {
    for (const pattern of datePatterns) {
      const regex = new RegExp(`${prefix}(${pattern})`, 'i');
      const match = normalizedText.match(regex);
      if (match) {
        return validateAndFormatDate(match[1]);
      }
    }
  }

  // If no prefixed date found, look for standalone dates in reasonable birth year range
  for (const pattern of datePatterns) {
    const regex = new RegExp(pattern, 'gi');
    const matches = normalizedText.match(regex);
    if (matches) {
      for (const match of matches) {
        const formatted = validateAndFormatDate(match);
        if (formatted && isReasonableBirthYear(formatted)) {
          return formatted;
        }
      }
    }
  }

  return '';
};

const validateAndFormatDate = (dateStr: string): string => {
  try {
    // Try to parse the date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Format as YYYY-MM-DD
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
};

const isReasonableBirthYear = (dateStr: string): boolean => {
  try {
    const year = new Date(dateStr).getFullYear();
    const currentYear = new Date().getFullYear();
    // Reasonable birth year range: 18-80 years old
    return year >= (currentYear - 80) && year <= (currentYear - 18);
  } catch {
    return false;
  }
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
