import { ParsedResume } from "@/types/resume";

export const parseResumeContent = (text: string): ParsedResume => {
  console.log('Starting enhanced resume parsing...');
  
  // Split the text into lines for processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Define section patterns that match your resume format
  const sectionPatterns = {
    education: /^(EDUCATION|Education)$/i,
    experience: /^(PROFESSIONAL EXPERIENCE|EXPERIENCE|Work Experience)$/i,
    projects: /^(PROJECTS|Personal Projects|Academic Projects)$/i,
    activities: /^(CLUBS, ACTIVITIES AND LEADERSHIP|ACTIVITIES|LEADERSHIP|CLUBS)$/i,
    skills: /^(SKILLS AND LANGUAGES|SKILLS|TECHNICAL SKILLS)$/i,
    languages: /^(LANGUAGES|LANGUAGE PROFICIENCY)$/i
  };

  // Find section boundaries
  const sections = findSections(lines, sectionPatterns);
  console.log('Found sections:', Object.keys(sections));

  // Extract personal information from the top of the resume
  const personalInfo = extractPersonalInfo(lines.slice(0, 10));
  console.log('Extracted personal info:', personalInfo);

  // Parse each section
  const workExperiences = sections.experience ? parseExperienceSection(sections.experience) : [];
  const education = sections.education ? parseEducationSection(sections.education) : [];
  const projects = sections.projects ? parseProjectsSection(sections.projects) : [];
  const skillsAndLanguages = sections.skills ? parseSkillsAndLanguagesSection(sections.skills) : { skills: [], languages: [] };
  const activities = sections.activities ? parseActivitiesSection(sections.activities) : [];

  // Extract social links from personal info section and throughout the document
  const socialLinks = extractSocialLinks(text);

  return {
    personalInfo,
    workExperiences,
    education,
    projects,
    skills: skillsAndLanguages.skills,
    languages: skillsAndLanguages.languages,
    socialLinks,
    activities
  };
};

function findSections(lines: string[], patterns: Record<string, RegExp>): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = '';
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let foundSection = false;

    // Check if current line matches any section pattern
    for (const [sectionName, pattern] of Object.entries(patterns)) {
      if (pattern.test(line)) {
        // Save previous section if it exists
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection] = [...sectionContent];
        }
        
        currentSection = sectionName;
        sectionContent = [];
        foundSection = true;
        break;
      }
    }

    // If not a section header, add to current section content
    if (!foundSection && currentSection) {
      sectionContent.push(line);
    }
  }

  // Save the last section
  if (currentSection && sectionContent.length > 0) {
    sections[currentSection] = sectionContent;
  }

  return sections;
}

function extractPersonalInfo(topLines: string[]) {
  const text = topLines.join(' ');
  
  // Extract name (usually the first line or a line that looks like a name)
  const nameMatch = topLines.find(line => 
    /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && 
    !line.includes('@') && 
    !line.includes('(') &&
    !line.includes('http')
  );

  // Extract email
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  
  // Extract phone number
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  
  // Extract location (City, State format)
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/);

  // Extract date of birth with enhanced patterns
  const dobMatch = extractDateOfBirth(text);

  return {
    name: nameMatch || "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
    location: locationMatch ? locationMatch[0] : "",
    dateOfBirth: dobMatch || ""
  };
}

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

  // Enhanced date patterns
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
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return '';
    }
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

function parseExperienceSection(lines: string[]) {
  const experiences = [];
  let currentExp: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line starts a new experience (usually has a job title or company)
    if (isExperienceHeader(line)) {
      // Save previous experience
      if (currentExp) {
        experiences.push(currentExp);
      }
      
      // Parse the experience header
      currentExp = parseExperienceHeader(line, lines, i);
      currentExp.description = [];
    } else if (currentExp && line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      // This is a bullet point description
      currentExp.description.push(line.replace(/^[•\-*]\s*/, ''));
    } else if (currentExp && line.length > 20 && !line.includes('|') && !line.match(/\d{4}/)) {
      // This might be a description without bullet points
      currentExp.description.push(line);
    }
  }
  
  // Add the last experience
  if (currentExp) {
    experiences.push(currentExp);
  }
  
  return experiences;
}

function isExperienceHeader(line: string): boolean {
  // Check if line contains job title patterns
  return (
    line.includes('|') || 
    line.includes('at ') ||
    line.includes('Software') ||
    line.includes('Engineer') ||
    line.includes('Developer') ||
    line.includes('Analyst') ||
    line.includes('Manager') ||
    line.includes('Intern') ||
    /[A-Z][a-z]+\s+[A-Z][a-z]+.*\d{4}/.test(line)
  );
}

function parseExperienceHeader(line: string, lines: string[], index: number) {
  // Try to extract role, company, location, and dates from the header and nearby lines
  let role = '';
  let company = '';
  let location = '';
  let startDate = '';
  let endDate = '';

  // Pattern 1: "Software Engineer | Company Name | Location | Date - Date"
  const pattern1 = line.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
  if (pattern1) {
    role = pattern1[1].trim();
    company = pattern1[2].trim();
    location = pattern1[3].trim();
    const dateStr = pattern1[4].trim();
    const dates = parseDateRange(dateStr);
    startDate = dates.start;
    endDate = dates.end;
  } else {
    // Pattern 2: Role and company on same line, dates on next line
    if (line.includes(' at ')) {
      const parts = line.split(' at ');
      role = parts[0].trim();
      company = parts[1].trim();
    } else {
      role = line;
      // Look for company in next line
      if (index + 1 < lines.length) {
        company = lines[index + 1];
      }
    }
    
    // Look for dates in the next few lines
    for (let j = index + 1; j < Math.min(index + 3, lines.length); j++) {
      const nextLine = lines[j];
      const dateMatch = nextLine.match(/(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|Present)/);
      if (dateMatch) {
        startDate = dateMatch[1];
        endDate = dateMatch[2];
        break;
      }
    }
  }

  return { role, company, location, startDate, endDate };
}

function parseDateRange(dateStr: string): { start: string; end: string } {
  const match = dateStr.match(/(.+?)\s*[-–—]\s*(.+)/);
  if (match) {
    return { start: match[1].trim(), end: match[2].trim() };
  }
  return { start: dateStr, end: 'Present' };
}

function parseEducationSection(lines: string[]) {
  const education = [];
  let currentEdu: any = null;

  for (const line of lines) {
    // Check if this line contains a school name (usually contains "University", "College", etc.)
    if (line.includes('University') || line.includes('College') || line.includes('Institute')) {
      if (currentEdu) {
        education.push(currentEdu);
      }
      currentEdu = {
        school: line.split('|')[0].trim(),
        degree: '',
        startDate: '',
        endDate: ''
      };
      
      // Extract graduation date if present
      const dateMatch = line.match(/(\w+\s+\d{4})/);
      if (dateMatch) {
        currentEdu.endDate = dateMatch[1];
      }
    } else if (currentEdu && (line.includes('Bachelor') || line.includes('Master') || line.includes('PhD') || line.includes('B.S.') || line.includes('M.S.'))) {
      currentEdu.degree = line;
    }
  }

  if (currentEdu) {
    education.push(currentEdu);
  }

  return education;
}

function parseProjectsSection(lines: string[]) {
  const projects = [];
  let currentProject: any = null;

  for (const line of lines) {
    // Project names are usually standalone lines or start with bullet points
    if (!line.startsWith('•') && !line.startsWith('-') && line.length > 5) {
      if (currentProject) {
        projects.push(currentProject);
      }
      currentProject = {
        name: line,
        startDate: '',
        endDate: 'Present',
        description: []
      };
    } else if (currentProject && (line.startsWith('•') || line.startsWith('-'))) {
      currentProject.description.push(line.replace(/^[•\-]\s*/, ''));
    }
  }

  if (currentProject) {
    projects.push(currentProject);
  }

  return projects;
}

function parseActivitiesSection(lines: string[]) {
  const activities = [];
  
  for (const line of lines) {
    if (line.includes('|') || line.includes(' - ')) {
      const parts = line.split(/\s*[\|\-]\s*/);
      if (parts.length >= 2) {
        activities.push({
          organization: parts[0].trim(),
          role: parts[1].trim(),
          description: parts.slice(2).join(' ').trim()
        });
      }
    }
  }
  
  return activities;
}

function parseSkillsAndLanguagesSection(lines: string[]): { skills: string[]; languages: string[] } {
  const skills: string[] = [];
  const languages: string[] = [];
  
  let isLanguageSection = false;
  
  for (const line of lines) {
    if (line.toLowerCase().includes('language')) {
      isLanguageSection = true;
      continue;
    }
    
    // Split by common separators and clean up
    const items = line.split(/[,;|]/).map(item => item.trim()).filter(item => item.length > 1);
    
    if (isLanguageSection) {
      languages.push(...items);
    } else {
      skills.push(...items);
    }
  }
  
  return { skills, languages };
}

function extractSocialLinks(text: string) {
  const socialLinks = {
    linkedin: "",
    github: "",
    portfolio: "",
    other: ""
  };

  // Enhanced LinkedIn URL patterns
  const linkedinMatch = text.match(/(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[a-zA-Z0-9-]+)/i);
  if (linkedinMatch) {
    socialLinks.linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  // Enhanced GitHub URL patterns
  const githubMatch = text.match(/(https?:\/\/)?(www\.)?(github\.com\/[a-zA-Z0-9-]+)/i);
  if (githubMatch) {
    socialLinks.github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  // Portfolio/personal website (excluding LinkedIn and GitHub)
  const websiteMatch = text.match(/(https?:\/\/(?!.*linkedin\.com)(?!.*github\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
  if (websiteMatch) {
    socialLinks.portfolio = websiteMatch[0];
  }

  return socialLinks;
}
