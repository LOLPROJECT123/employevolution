
/**
 * Enhanced section parser that identifies content between bold headings in resumes
 */

export interface ResumeSection {
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

export const extractSectionsBetweenBoldHeadings = (text: string): ResumeSection[] => {
  const sections: ResumeSection[] = [];
  
  // Common section headers that are typically bold in resumes
  const sectionPatterns = [
    /^(EXPERIENCE|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EMPLOYMENT|CAREER HISTORY)\s*$/im,
    /^(EDUCATION|ACADEMIC BACKGROUND|ACADEMIC HISTORY)\s*$/im,
    /^(PROJECTS|PERSONAL PROJECTS|ACADEMIC PROJECTS|KEY PROJECTS)\s*$/im,
    /^(SKILLS|TECHNICAL SKILLS|CORE COMPETENCIES|TECHNOLOGIES)\s*$/im,
    /^(LANGUAGES|LANGUAGE PROFICIENCY|SPOKEN LANGUAGES)\s*$/im,
    /^(CERTIFICATIONS|CERTIFICATES|PROFESSIONAL CERTIFICATIONS)\s*$/im,
    /^(SUMMARY|PROFESSIONAL SUMMARY|CAREER SUMMARY|OBJECTIVE)\s*$/im,
    /^(AWARDS|ACHIEVEMENTS|HONORS|RECOGNITION)\s*$/im,
    /^(PUBLICATIONS|RESEARCH|PAPERS)\s*$/im,
    /^(VOLUNTEER|VOLUNTEER EXPERIENCE|COMMUNITY SERVICE)\s*$/im
  ];

  // Split text into lines for analysis
  const lines = text.split('\n');
  
  // Find all section headers
  const sectionHeaders: { title: string; lineIndex: number; startIndex: number }[] = [];
  
  lines.forEach((line, lineIndex) => {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) return;
    
    // Check if line matches any section pattern
    for (const pattern of sectionPatterns) {
      const match = trimmedLine.match(pattern);
      if (match) {
        const startIndex = text.indexOf(line);
        sectionHeaders.push({
          title: match[1],
          lineIndex,
          startIndex
        });
        break;
      }
    }
  });

  // Extract content between sections
  for (let i = 0; i < sectionHeaders.length; i++) {
    const currentSection = sectionHeaders[i];
    const nextSection = sectionHeaders[i + 1];
    
    const startIndex = currentSection.startIndex + lines[currentSection.lineIndex].length;
    const endIndex = nextSection ? nextSection.startIndex : text.length;
    
    const content = text.slice(startIndex, endIndex).trim();
    
    if (content.length > 10) { // Only include sections with meaningful content
      sections.push({
        title: currentSection.title,
        content,
        startIndex,
        endIndex
      });
    }
  }

  return sections;
};

export const parseExperienceFromSection = (content: string) => {
  const experiences = [];
  
  // Split by double line breaks or clear separators
  const entries = content.split(/\n\s*\n/).filter(entry => entry.trim().length > 20);
  
  for (const entry of entries) {
    const lines = entry.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 2) continue;
    
    // Try to parse the first few lines for role, company, dates
    const firstLine = lines[0];
    const secondLine = lines.length > 1 ? lines[1] : '';
    const thirdLine = lines.length > 2 ? lines[2] : '';
    
    // Look for patterns like "Software Engineer at Google" or "Software Engineer | Google"
    const roleCompanyMatch = firstLine.match(/^(.+?)\s+(?:at|@|\||-|–)\s+(.+?)(?:\s*[\|,]|\s*$)/i);
    
    let role = '';
    let company = '';
    let dates = '';
    let location = '';
    
    if (roleCompanyMatch) {
      role = roleCompanyMatch[1].trim();
      company = roleCompanyMatch[2].trim();
    } else {
      // Fallback: assume first line is role, second is company
      role = firstLine;
      company = secondLine.includes('|') ? secondLine.split('|')[0].trim() : secondLine;
    }
    
    // Look for dates in the first few lines
    const datePattern = /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\d{4})\s*(?:to|-|–|—)\s*(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b|\d{4}|\bPresent\b)/i;
    
    for (const line of lines.slice(0, 3)) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        dates = `${dateMatch[1]} - ${dateMatch[2]}`;
        break;
      }
    }
    
    // Look for location
    const locationPattern = /([A-Z][a-zA-Z\s]+,\s*[A-Z]{2}(?:\s*,\s*[A-Z]{2,})?)/;
    for (const line of lines.slice(0, 3)) {
      const locationMatch = line.match(locationPattern);
      if (locationMatch) {
        location = locationMatch[1];
        break;
      }
    }
    
    // Extract description bullets (lines starting with bullet points or remaining content)
    const description = lines.slice(1)
      .filter(line => !line.match(datePattern) && !line.match(locationPattern))
      .filter(line => line !== company && line !== location)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 10);
    
    if (role && company) {
      experiences.push({
        role: role.replace(/[•*-]\s*$/, '').trim(),
        company: company.replace(/[•*-]\s*$/, '').trim(),
        location: location || 'Location',
        startDate: dates.split(' - ')[0] || 'Start Date',
        endDate: dates.split(' - ')[1] || 'End Date',
        description: description.length > 0 ? description : ['Job responsibilities and achievements']
      });
    }
  }
  
  return experiences;
};

export const parseEducationFromSection = (content: string) => {
  const education = [];
  const entries = content.split(/\n\s*\n/).filter(entry => entry.trim().length > 10);
  
  for (const entry of entries) {
    const lines = entry.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 1) continue;
    
    let school = '';
    let degree = '';
    let dates = '';
    
    // Look for school name (usually the longest line or contains "University", "College", etc.)
    const schoolKeywords = ['university', 'college', 'institute', 'school', 'academy'];
    const schoolLine = lines.find(line => 
      schoolKeywords.some(keyword => line.toLowerCase().includes(keyword))
    ) || lines[0];
    
    school = schoolLine;
    
    // Look for degree information
    const degreeKeywords = ['bachelor', 'master', 'phd', 'ph.d', 'degree', 'b.s.', 'm.s.', 'b.a.', 'm.a.', 'mba'];
    const degreeLine = lines.find(line => 
      degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    if (degreeLine) {
      degree = degreeLine;
    } else if (lines.length > 1 && lines[1] !== school) {
      degree = lines[1];
    }
    
    // Look for dates
    const datePattern = /(\d{4})\s*(?:to|-|–|—)\s*(\d{4}|Present)/i;
    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        dates = `${dateMatch[1]} - ${dateMatch[2]}`;
        break;
      }
    }
    
    if (school) {
      education.push({
        school: school.replace(/[•*-]\s*$/, '').trim(),
        degree: degree.replace(/[•*-]\s*$/, '').trim() || 'Degree',
        startDate: dates.split(' - ')[0] || '2020',
        endDate: dates.split(' - ')[1] || '2024'
      });
    }
  }
  
  return education;
};

export const parseProjectsFromSection = (content: string) => {
  const projects = [];
  const entries = content.split(/\n\s*\n/).filter(entry => entry.trim().length > 10);
  
  for (const entry of entries) {
    const lines = entry.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length < 1) continue;
    
    const name = lines[0].replace(/[•*-]\s*/, '').trim();
    
    // Look for dates
    let dates = '';
    const datePattern = /(\d{4})\s*(?:to|-|–|—)\s*(\d{4}|Present)/i;
    for (const line of lines) {
      const dateMatch = line.match(datePattern);
      if (dateMatch) {
        dates = `${dateMatch[1]} - ${dateMatch[2]}`;
        break;
      }
    }
    
    // Extract description
    const description = lines.slice(1)
      .filter(line => !line.match(datePattern))
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 5);
    
    projects.push({
      name,
      startDate: dates.split(' - ')[0] || '2023',
      endDate: dates.split(' - ')[1] || 'Present',
      description: description.length > 0 ? description : ['Project description']
    });
  }
  
  return projects;
};

export const parseSkillsFromSection = (content: string): string[] => {
  const skills = new Set<string>();
  
  // Split by common separators
  const text = content.replace(/\n/g, ' ');
  const skillItems = text.split(/[,;•\|\n]/).map(item => item.trim()).filter(item => item.length > 1);
  
  // Common skill patterns
  const skillPatterns = [
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|Ruby|PHP|Go|Rust|Swift|Kotlin)\b/gi,
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel)\b/gi,
    /\b(AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Git|CI\/CD)\b/gi,
    /\b(MongoDB|PostgreSQL|MySQL|Redis|Elasticsearch)\b/gi,
    /\b(HTML|CSS|SASS|SCSS|Tailwind|Bootstrap)\b/gi
  ];
  
  // Extract from structured lists
  for (const item of skillItems) {
    const cleanItem = item.replace(/^[-•*]\s*/, '').trim();
    if (cleanItem.length > 1 && cleanItem.length < 30) {
      skills.add(cleanItem);
    }
  }
  
  // Extract using patterns
  for (const pattern of skillPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => skills.add(match));
    }
  }
  
  return Array.from(skills).slice(0, 15); // Limit to 15 skills
};
