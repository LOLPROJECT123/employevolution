
import { ParsedResume } from "@/types/resume";

export const parseResumeContent = (text: string): ParsedResume => {
  console.log('🔍 Starting enhanced resume parsing...');
  console.log('📄 Raw text length:', text.length);
  console.log('📄 First 500 characters:', text.substring(0, 500));
  
  // Split the text into lines for processing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  console.log('📝 Total lines extracted:', lines.length);
  
  // Define more flexible section patterns
  const sectionPatterns = {
    education: /^(EDUCATION|Education|ACADEMIC BACKGROUND|Academic Background|QUALIFICATIONS|Qualifications)$/i,
    experience: /^(PROFESSIONAL EXPERIENCE|EXPERIENCE|Work Experience|EMPLOYMENT HISTORY|Employment History|CAREER HISTORY|Career History|WORK|Work)$/i,
    projects: /^(PROJECTS|Personal Projects|Academic Projects|PROJECT EXPERIENCE|Project Experience|RELEVANT PROJECTS|Relevant Projects)$/i,
    activities: /^(CLUBS, ACTIVITIES AND LEADERSHIP|ACTIVITIES|LEADERSHIP|CLUBS|EXTRACURRICULAR|Extracurricular|VOLUNTEER|Volunteer)$/i,
    skills: /^(SKILLS AND LANGUAGES|SKILLS|TECHNICAL SKILLS|Technical Skills|CORE COMPETENCIES|Core Competencies|TECHNOLOGIES|Technologies)$/i,
    languages: /^(LANGUAGES|LANGUAGE PROFICIENCY|Language Proficiency|LANGUAGE SKILLS|Language Skills)$/i
  };

  // Find section boundaries with enhanced logging
  const sections = findSections(lines, sectionPatterns);
  console.log('🗂️ Found sections:', Object.keys(sections));
  Object.entries(sections).forEach(([key, content]) => {
    console.log(`📂 Section "${key}" has ${content.length} lines`);
  });

  // Extract personal information from the top of the resume with enhanced extraction
  const personalInfo = extractPersonalInfo(lines.slice(0, 15), text);
  console.log('👤 Extracted personal info:', personalInfo);

  // Parse each section with enhanced methods
  const workExperiences = sections.experience ? parseExperienceSection(sections.experience) : [];
  console.log('💼 Work experiences found:', workExperiences.length);

  const education = sections.education ? parseEducationSection(sections.education) : [];
  console.log('🎓 Education entries found:', education.length);

  const projects = sections.projects ? parseProjectsSection(sections.projects) : [];
  console.log('🚀 Projects found:', projects.length);

  const skillsAndLanguages = sections.skills ? parseSkillsAndLanguagesSection(sections.skills) : { skills: [], languages: [] };
  console.log('🛠️ Skills found:', skillsAndLanguages.skills.length);
  console.log('🌐 Languages found:', skillsAndLanguages.languages.length);

  const activities = sections.activities ? parseActivitiesSection(sections.activities) : [];
  console.log('🎯 Activities found:', activities.length);

  // Extract social links with enhanced patterns
  const socialLinks = extractSocialLinks(text);
  console.log('🔗 Social links found:', socialLinks);

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
        console.log(`📍 Found section "${sectionName}" at line: "${line}"`);
        
        // Save previous section if it exists
        if (currentSection && sectionContent.length > 0) {
          sections[currentSection] = [...sectionContent];
          console.log(`💾 Saved section "${currentSection}" with ${sectionContent.length} lines`);
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
    console.log(`💾 Saved final section "${currentSection}" with ${sectionContent.length} lines`);
  }

  return sections;
}

function extractPersonalInfo(topLines: string[], fullText: string) {
  const text = topLines.join(' ') + ' ' + fullText;
  console.log('🔍 Extracting personal info from:', text.substring(0, 300));
  
  // Enhanced name extraction - look for name patterns
  const nameMatch = topLines.find(line => 
    /^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && 
    !line.includes('@') && 
    !line.includes('(') &&
    !line.includes('http') &&
    !line.includes('www') &&
    line.length < 50
  );
  console.log('👤 Name match:', nameMatch);

  // Enhanced email extraction
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  console.log('📧 Email match:', emailMatch?.[0]);
  
  // Enhanced phone number extraction with multiple patterns and validation
  const phoneNumbers = extractPhoneNumbers(text);
  console.log('📞 All phone numbers found:', phoneNumbers);
  
  // Select the best phone number (prefer those in contact sections)
  const phone = selectBestPhoneNumber(phoneNumbers, topLines);
  console.log('📞 Selected phone:', phone);
  
  // Enhanced location extraction
  const locationMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s+\d{5})?)/);
  console.log('📍 Location match:', locationMatch?.[0]);

  // Enhanced date of birth extraction
  const dobMatch = extractDateOfBirth(text);
  console.log('🎂 DOB match:', dobMatch);

  return {
    name: nameMatch || "",
    email: emailMatch ? emailMatch[0] : "",
    phone: phone || "",
    location: locationMatch ? locationMatch[0] : "",
    dateOfBirth: dobMatch || ""
  };
}

const extractPhoneNumbers = (text: string): string[] => {
  const phonePatterns = [
    // US formats with country code
    /\+1\s*[\(\-\s]*(\d{3})[\)\-\s]*(\d{3})[\-\s]*(\d{4})/g,
    // Standard US formats
    /\((\d{3})\)\s*(\d{3})[\-\s]*(\d{4})/g,
    // Dotted format
    /(\d{3})\.(\d{3})\.(\d{4})/g,
    // Dashed format
    /(\d{3})\-(\d{3})\-(\d{4})/g,
    // Spaced format
    /(\d{3})\s+(\d{3})\s+(\d{4})/g,
    // No separators
    /\b(\d{10})\b/g,
  ];

  const foundNumbers: string[] = [];
  
  phonePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      foundNumbers.push(...matches);
    }
  });

  // Clean and normalize phone numbers
  return foundNumbers.map(number => {
    // Remove all non-digits first
    const digits = number.replace(/\D/g, '');
    
    // If it's 11 digits and starts with 1, remove the 1
    if (digits.length === 11 && digits.startsWith('1')) {
      const cleaned = digits.substring(1);
      return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
    }
    
    // If it's 10 digits, format it
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    
    return number; // Return original if doesn't match expected lengths
  });
};

const selectBestPhoneNumber = (phoneNumbers: string[], topLines: string[]): string => {
  if (phoneNumbers.length === 0) return "";
  if (phoneNumbers.length === 1) return phoneNumbers[0];
  
  // Prefer phone numbers that appear in the top lines (contact section)
  const topText = topLines.join(' ');
  for (const phone of phoneNumbers) {
    if (topText.includes(phone.replace(/\D/g, ''))) {
      return phone;
    }
  }
  
  // Return the first valid-looking phone number
  return phoneNumbers[0];
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
  console.log('💼 Parsing experience section with', lines.length, 'lines');
  const experiences = [];
  let currentExp: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`💼 Processing line ${i}: "${line}"`);
    
    // Enhanced experience header detection
    if (isExperienceHeader(line)) {
      console.log('💼 Found experience header:', line);
      
      // Save previous experience
      if (currentExp) {
        experiences.push(currentExp);
        console.log('💼 Saved previous experience:', currentExp.role, 'at', currentExp.company);
      }
      
      // Parse the experience header
      currentExp = parseExperienceHeader(line, lines, i);
      currentExp.description = [];
      console.log('💼 Created new experience:', currentExp);
    } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*') || line.startsWith('○'))) {
      // This is a bullet point description
      const cleanedLine = line.replace(/^[•\-*○]\s*/, '');
      currentExp.description.push(cleanedLine);
      console.log('💼 Added bullet point:', cleanedLine);
    } else if (currentExp && line.length > 20 && !line.includes('|') && !line.match(/\d{4}/) && !isExperienceHeader(line)) {
      // This might be a description without bullet points
      currentExp.description.push(line);
      console.log('💼 Added description line:', line);
    }
  }
  
  // Add the last experience
  if (currentExp) {
    experiences.push(currentExp);
    console.log('💼 Saved final experience:', currentExp.role, 'at', currentExp.company);
  }
  
  console.log('💼 Total experiences parsed:', experiences.length);
  return experiences;
}

function isExperienceHeader(line: string): boolean {
  // Check if line contains job title patterns
  const indicators = [
    line.includes('|'), 
    line.includes(' at '),
    line.includes('Software'),
    line.includes('Engineer'),
    line.includes('Developer'),
    line.includes('Analyst'),
    line.includes('Manager'),
    line.includes('Intern'),
    line.includes('Specialist'),
    line.includes('Coordinator'),
    line.includes('Assistant'),
    /[A-Z][a-z]+\s+[A-Z][a-z]+.*\d{4}/.test(line),
    // Look for company name patterns
    line.includes('Inc.') || line.includes('LLC') || line.includes('Corp') || line.includes('Company')
  ];
  
  return indicators.some(indicator => indicator);
}

function parseExperienceHeader(line: string, lines: string[], index: number) {
  console.log('🔍 Parsing experience header:', line);
  
  let role = '';
  let company = '';
  let location = '';
  let startDate = '';
  let endDate = '';

  // Enhanced pattern matching for different formats
  
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
    console.log('🔍 Pattern 1 match:', { role, company, location, startDate, endDate });
  } 
  // Pattern 2: "Role at Company"
  else if (line.includes(' at ')) {
    const parts = line.split(' at ');
    role = parts[0].trim();
    company = parts[1].trim();
    console.log('🔍 Pattern 2 match:', { role, company });
    
    // Look for dates in next lines
    for (let j = index + 1; j < Math.min(index + 3, lines.length); j++) {
      const nextLine = lines[j];
      const dateMatch = nextLine.match(/(\w+\s+\d{4})\s*[-–—]\s*(\w+\s+\d{4}|Present|Current)/);
      if (dateMatch) {
        startDate = dateMatch[1];
        endDate = dateMatch[2];
        console.log('🔍 Found dates in next line:', { startDate, endDate });
        break;
      }
    }
  }
  // Pattern 3: Company name followed by role
  else {
    // Try to detect if this is a company name line
    if (line.includes('Inc.') || line.includes('LLC') || line.includes('Corp') || line.includes('Company')) {
      company = line;
      // Look for role in next line
      if (index + 1 < lines.length) {
        role = lines[index + 1];
      }
    } else {
      role = line;
      // Look for company in next line
      if (index + 1 < lines.length) {
        company = lines[index + 1];
      }
    }
    console.log('🔍 Pattern 3 match:', { role, company });
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
  console.log('🎓 Parsing education section with', lines.length, 'lines');
  const education = [];
  let currentEdu: any = null;

  for (const line of lines) {
    console.log('🎓 Processing line:', line);
    
    // Enhanced school detection
    if (line.includes('University') || line.includes('College') || line.includes('Institute') || 
        line.includes('School') || line.includes('Academy')) {
      if (currentEdu) {
        education.push(currentEdu);
        console.log('🎓 Saved previous education:', currentEdu);
      }
      
      currentEdu = {
        school: line.split('|')[0].trim(),
        degree: '',
        startDate: '',
        endDate: ''
      };
      
      // Extract graduation date if present
      const dateMatch = line.match(/(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\d{4})/);
      if (dateMatch) {
        currentEdu.endDate = dateMatch[1];
        console.log('🎓 Found graduation date:', dateMatch[1]);
      }
    } else if (currentEdu && (line.includes('Bachelor') || line.includes('Master') || line.includes('PhD') || 
               line.includes('B.S.') || line.includes('M.S.') || line.includes('B.A.') || line.includes('M.A.'))) {
      currentEdu.degree = line;
      console.log('🎓 Found degree:', line);
    }
  }

  if (currentEdu) {
    education.push(currentEdu);
    console.log('🎓 Saved final education:', currentEdu);
  }

  console.log('🎓 Total education entries:', education.length);
  return education;
}

function parseProjectsSection(lines: string[]) {
  console.log('🚀 Parsing projects section with', lines.length, 'lines');
  const projects = [];
  let currentProject: any = null;

  for (const line of lines) {
    console.log('🚀 Processing line:', line);
    
    // Project names are usually standalone lines or start with bullet points
    if (!line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*') && line.length > 5) {
      if (currentProject) {
        projects.push(currentProject);
        console.log('🚀 Saved previous project:', currentProject);
      }
      currentProject = {
        name: line,
        startDate: '',
        endDate: 'Present',
        description: []
      };
      console.log('🚀 Created new project:', line);
    } else if (currentProject && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      const cleanedLine = line.replace(/^[•\-*]\s*/, '');
      currentProject.description.push(cleanedLine);
      console.log('🚀 Added project description:', cleanedLine);
    }
  }

  if (currentProject) {
    projects.push(currentProject);
    console.log('🚀 Saved final project:', currentProject);
  }

  console.log('🚀 Total projects:', projects.length);
  return projects;
}

function parseActivitiesSection(lines: string[]) {
  console.log('🎯 Parsing activities section with', lines.length, 'lines');
  const activities = [];
  
  for (const line of lines) {
    console.log('🎯 Processing line:', line);
    
    if (line.includes('|') || line.includes(' - ')) {
      const parts = line.split(/\s*[\|\-]\s*/);
      if (parts.length >= 2) {
        const activity = {
          organization: parts[0].trim(),
          role: parts[1].trim(),
          description: parts.slice(2).join(' ').trim()
        };
        activities.push(activity);
        console.log('🎯 Added activity:', activity);
      }
    }
  }
  
  console.log('🎯 Total activities:', activities.length);
  return activities;
}

function parseSkillsAndLanguagesSection(lines: string[]): { skills: string[]; languages: string[] } {
  console.log('🛠️ Parsing skills section with', lines.length, 'lines');
  const skills: string[] = [];
  const languages: string[] = [];
  
  let isLanguageSection = false;
  
  for (const line of lines) {
    console.log('🛠️ Processing line:', line);
    
    if (line.toLowerCase().includes('language')) {
      isLanguageSection = true;
      console.log('🌐 Switched to language section');
      continue;
    }
    
    // Enhanced splitting by common separators
    const items = line.split(/[,;|•\-*]/)
      .map(item => item.trim())
      .filter(item => item.length > 1)
      .filter(item => !item.match(/^\d+$/)); // Filter out standalone numbers
    
    if (isLanguageSection) {
      languages.push(...items);
      console.log('🌐 Added languages:', items);
    } else {
      skills.push(...items);
      console.log('🛠️ Added skills:', items);
    }
  }
  
  console.log('🛠️ Total skills:', skills.length);
  console.log('🌐 Total languages:', languages.length);
  return { skills, languages };
}

function extractSocialLinks(text: string) {
  console.log('🔗 Extracting social links from text...');
  
  const socialLinks = {
    linkedin: "",
    github: "",
    portfolio: "",
    other: ""
  };

  // Enhanced LinkedIn URL patterns
  const linkedinPatterns = [
    /(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[a-zA-Z0-9-]+)/i,
    /linkedin\.com\/in\/([a-zA-Z0-9-]+)/i,
    /in\/([a-zA-Z0-9-]+)/i // Sometimes just the path part
  ];

  for (const pattern of linkedinPatterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[0];
      if (!url.startsWith('http')) {
        url = `https://www.${url}`;
      }
      socialLinks.linkedin = url;
      console.log('🔗 Found LinkedIn:', url);
      break;
    }
  }

  // Enhanced GitHub URL patterns
  const githubPatterns = [
    /(https?:\/\/)?(www\.)?(github\.com\/[a-zA-Z0-9-]+)/i,
    /github\.com\/([a-zA-Z0-9-]+)/i
  ];

  for (const pattern of githubPatterns) {
    const match = text.match(pattern);
    if (match) {
      let url = match[0];
      if (!url.startsWith('http')) {
        url = `https://www.${url}`;
      }
      socialLinks.github = url;
      console.log('🔗 Found GitHub:', url);
      break;
    }
  }

  // Portfolio/personal website (excluding LinkedIn and GitHub)
  const websiteMatch = text.match(/(https?:\/\/(?!.*linkedin\.com)(?!.*github\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i);
  if (websiteMatch) {
    socialLinks.portfolio = websiteMatch[0];
    console.log('🔗 Found portfolio:', websiteMatch[0]);
  }

  console.log('🔗 Final social links:', socialLinks);
  return socialLinks;
}
