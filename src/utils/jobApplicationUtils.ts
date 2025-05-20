/**
 * Utility functions for job application scraping and auto-filling
 */

import { Job } from "@/types/job";
import { ScrapedJob } from "@/components/resume/job-application/types";
import { FORM_FIELD_IDENTIFIERS } from "@/components/resume/job-application/constants";
import { detectPlatform, extractJobIdFromUrl, normalizeJobUrl } from "./jobValidationUtils";

/**
 * Extracts skills from a job description using NLP patterns
 * @param description The job description text
 * @returns Array of extracted skills
 */
export function extractSkillsFromDescription(description: string): string[] {
  if (!description) return [];
  
  const skills: Set<string> = new Set();
  
  // Common technical skills to look for
  const technicalSkills = [
    "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Python", 
    "Java", "C#", ".NET", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "SQL",
    "NoSQL", "MongoDB", "PostgreSQL", "MySQL", "Redis", "GraphQL", "REST API",
    "HTML", "CSS", "Sass", "LESS", "Git", "CI/CD", "Jenkins", "GitHub Actions",
    "Terraform", "Ansible", "Agile", "Scrum", "Jira", "Confluence", "DevOps", 
    "Machine Learning", "AI", "Data Science", "Big Data", "Hadoop", "Spark", 
    "PHP", "Ruby", "Go", "Swift", "Kotlin", "Android", "iOS"
  ];
  
  // Soft skills to look for
  const softSkills = [
    "Communication", "Leadership", "Teamwork", "Problem Solving", "Critical Thinking",
    "Time Management", "Creativity", "Adaptability", "Collaboration", "Presentation",
    "Project Management"
  ];
  
  // Combine all skills to check
  const allSkills = [...technicalSkills, ...softSkills];
  
  // Simple extraction - look for direct mentions
  for (const skill of allSkills) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(description)) {
      skills.add(skill);
    }
  }
  
  // Look for skills in requirements lists (common in job descriptions)
  const requirements = extractRequirementsFromText(description);
  for (const req of requirements) {
    for (const skill of allSkills) {
      const regex = new RegExp(`\\b${skill}\\b`, 'i');
      if (regex.test(req)) {
        skills.add(skill);
      }
    }
  }
  
  return Array.from(skills);
}

/**
 * Extract requirement bullet points from text
 */
function extractRequirementsFromText(text: string): string[] {
  const requirements: string[] = [];
  
  // Look for common requirements sections
  const requirementsSectionRegex = /(?:requirements|qualifications|what you'll need|what we're looking for|what you need|skills required)(?:\s*:|\s*\n)([\s\S]*?)(?:\n\n|\n\s*\n|$)/i;
  const match = text.match(requirementsSectionRegex);
  
  if (match && match[1]) {
    // Split by bullet points or numbers
    const bullets = match[1].split(/\n\s*[•\-*]|\n\s*\d+\./).filter(Boolean);
    requirements.push(...bullets.map(b => b.trim()));
  }
  
  // If we couldn't find a requirements section, try to extract bullet points from anywhere
  if (requirements.length === 0) {
    const bulletPointRegex = /[•\-*]\s*(.*?)(?:\n|$)/g;
    let bulletMatch;
    while ((bulletMatch = bulletPointRegex.exec(text)) !== null) {
      if (bulletMatch[1].trim()) {
        requirements.push(bulletMatch[1].trim());
      }
    }
  }
  
  return requirements;
}

/**
 * Convert a ScrapedJob to the internal Job format
 */
export function convertScrapedJobToJob(scrapedJob: ScrapedJob): Job {
  return {
    id: scrapedJob.id,
    title: scrapedJob.title,
    company: scrapedJob.company,
    location: scrapedJob.location,
    description: scrapedJob.description,
    skills: extractSkillsFromDescription(scrapedJob.description),
    postedAt: scrapedJob.datePosted,
    applyUrl: scrapedJob.applyUrl,
    source: scrapedJob.source,
    requirements: scrapedJob.requirements || [],
    matchPercentage: scrapedJob.matchPercentage,
    remote: scrapedJob.location.toLowerCase().includes('remote'),
    salary: {
      min: 0,
      max: 0,
      currency: "USD"
    },
    type: 'full-time', // Default value
    level: 'mid', // Default value
    workModel: scrapedJob.location.toLowerCase().includes('remote') ? 'remote' : 
               scrapedJob.location.toLowerCase().includes('hybrid') ? 'hybrid' : 'onsite'
  };
}

/**
 * Extract form field identifiers from an input element
 */
export function getFieldIdentifiers(input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): string[] {
  const identifiers: string[] = [];
  
  // Check name attribute
  if (input.name) {
    identifiers.push(input.name.toLowerCase());
  }
  
  // Check id attribute
  if (input.id) {
    identifiers.push(input.id.toLowerCase());
  }
  
  // Check placeholder
  if ('placeholder' in input && input.placeholder) {
    identifiers.push(input.placeholder.toLowerCase());
  }
  
  // Check aria-label
  if (input.getAttribute('aria-label')) {
    identifiers.push(input.getAttribute('aria-label')!.toLowerCase());
  }
  
  // Check for associated label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label && label.textContent) {
      identifiers.push(label.textContent.toLowerCase().trim());
    }
  }
  
  return identifiers;
}

/**
 * Determine if a field matches a set of keywords
 */
export function fieldMatchesKeywords(identifiers: string[], keywords: string[]): boolean {
  return identifiers.some(identifier => 
    keywords.some(keyword => identifier.includes(keyword))
  );
}

/**
 * Find all form fields on a page that match specific criteria
 */
export function findFormFields(fieldType: keyof typeof FORM_FIELD_IDENTIFIERS): (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[] {
  const keywords = FORM_FIELD_IDENTIFIERS[fieldType];
  if (!keywords) return [];
  
  const allInputs = [
    ...Array.from(document.querySelectorAll('input:not([type="hidden"])')),
    ...Array.from(document.querySelectorAll('textarea')),
    ...Array.from(document.querySelectorAll('select'))
  ];
  
  return allInputs.filter(input => {
    const identifiers = getFieldIdentifiers(input as HTMLInputElement);
    return fieldMatchesKeywords(identifiers, keywords);
  }) as (HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[];
}

/**
 * Detect the application form on the current page
 */
export function detectApplicationForm(): boolean {
  // Look for elements that indicate this is an application form
  const formKeywords = ['apply', 'application', 'submit', 'resume', 'cv'];
  
  // Check page title and URL
  const pageTitle = document.title.toLowerCase();
  const currentUrl = window.location.href.toLowerCase();
  
  const titleContainsKeywords = formKeywords.some(keyword => pageTitle.includes(keyword));
  const urlContainsKeywords = formKeywords.some(keyword => currentUrl.includes(keyword));
  
  if (titleContainsKeywords || urlContainsKeywords) {
    // Check if there are form elements
    const formElements = [
      ...document.querySelectorAll('form'),
      ...findFormFields('firstName'),
      ...findFormFields('email'),
      ...findFormFields('resume')
    ];
    
    return formElements.length > 0;
  }
  
  return false;
}

/**
 * Auto-fill form fields with user data
 */
export function autoFillForm(userData: any): { 
  success: boolean; 
  filledFields: { count: number; fields: string[] }
} {
  if (!userData) {
    return { 
      success: false, 
      filledFields: { count: 0, fields: [] } 
    };
  }
  
  const filledFields: string[] = [];
  
  // Map of field types to user data properties
  const fieldMap: Record<string, keyof typeof userData | ((data: any) => string | undefined)> = {
    firstName: 'firstName',
    lastName: 'lastName',
    fullName: (data) => data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : undefined,
    email: 'email',
    phone: 'phone',
    address: 'address',
    city: 'city',
    state: 'state',
    zipCode: 'zipCode',
    country: 'country',
    linkedin: 'linkedin',
    website: 'website',
    github: 'github'
  };
  
  // Fill each field type
  for (const [fieldType, dataKey] of Object.entries(fieldMap)) {
    const fieldsToFill = findFormFields(fieldType as keyof typeof FORM_FIELD_IDENTIFIERS);
    
    for (const field of fieldsToFill) {
      // Get the value to fill
      let value: string | undefined;
      
      if (typeof dataKey === 'function') {
        value = dataKey(userData);
      } else if (userData[dataKey]) {
        value = userData[dataKey];
      }
      
      if (value && field.tagName.toLowerCase() === 'select') {
        // Handle select fields by finding the closest matching option
        const selectField = field as HTMLSelectElement;
        const options = Array.from(selectField.options);
        
        // Try to find an option that contains the value text
        const matchingOption = options.find(option => 
          option.text.toLowerCase().includes(value!.toLowerCase())
        );
        
        if (matchingOption) {
          selectField.value = matchingOption.value;
          filledFields.push(fieldType);
        }
      } else if (value) {
        // Handle regular input and textarea fields
        (field as HTMLInputElement | HTMLTextAreaElement).value = value;
        filledFields.push(fieldType);
      }
    }
  }
  
  return {
    success: filledFields.length > 0,
    filledFields: {
      count: filledFields.length,
      fields: filledFields
    }
  };
}
