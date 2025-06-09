
import { ParsedResume } from "@/types/resume";
import { Job } from "@/types/job";

export interface JobMatchResult {
  matchPercentage: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: number;
  keywordMatches: string[];
  recommendations: string[];
}

export interface MatchingOptions {
  prioritizeSkills?: boolean;
  experienceWeight?: number;
  skillsWeight?: number;
  keywordWeight?: number;
}

export const calculateEnhancedJobMatch = (
  resume: ParsedResume,
  job: Job,
  options: MatchingOptions = {}
): JobMatchResult => {
  const {
    prioritizeSkills = true,
    experienceWeight = 0.3,
    skillsWeight = 0.4,
    keywordWeight = 0.3
  } = options;

  // Extract all text content from resume for keyword matching
  const resumeText = extractResumeText(resume).toLowerCase();
  const jobText = `${job.title} ${job.description} ${job.requirements?.join(' ') || ''}`.toLowerCase();

  // 1. Skills matching
  const skillsMatch = calculateSkillsMatch(resume.skills || [], job.skills || []);
  
  // 2. Experience matching
  const experienceMatch = calculateExperienceMatch(resume.workExperiences || [], job);
  
  // 3. Keyword matching from enhanced text extraction
  const keywordMatch = calculateKeywordMatch(resumeText, jobText, job);
  
  // Calculate weighted score
  const totalWeight = experienceWeight + skillsWeight + keywordWeight;
  const normalizedExperienceWeight = experienceWeight / totalWeight;
  const normalizedSkillsWeight = skillsWeight / totalWeight;
  const normalizedKeywordWeight = keywordWeight / totalWeight;

  const finalScore = Math.round(
    (experienceMatch.score * normalizedExperienceWeight +
     skillsMatch.score * normalizedSkillsWeight +
     keywordMatch.score * normalizedKeywordWeight) * 100
  );

  // Generate recommendations
  const recommendations = generateRecommendations(skillsMatch, experienceMatch, keywordMatch);

  return {
    matchPercentage: Math.min(finalScore, 100),
    matchingSkills: skillsMatch.matching,
    missingSkills: skillsMatch.missing,
    experienceMatch: Math.round(experienceMatch.score * 100),
    keywordMatches: keywordMatch.matches,
    recommendations
  };
};

const extractResumeText = (resume: ParsedResume): string => {
  const textParts: string[] = [];
  
  // Personal info
  if (resume.personalInfo) {
    const { name, email, phone, location } = resume.personalInfo;
    textParts.push(name || '', email || '', phone || '', location || '');
  }
  
  // Work experiences
  resume.workExperiences?.forEach(exp => {
    textParts.push(exp.role, exp.company, exp.location || '');
    if (exp.description) {
      if (Array.isArray(exp.description)) {
        textParts.push(...exp.description);
      } else {
        textParts.push(exp.description);
      }
    }
  });
  
  // Education
  resume.education?.forEach(edu => {
    textParts.push(edu.school, edu.degree || '', edu.fieldOfStudy || '');
  });
  
  // Projects
  resume.projects?.forEach(project => {
    textParts.push(project.name);
    if (project.description) {
      if (Array.isArray(project.description)) {
        textParts.push(...project.description);
      } else {
        textParts.push(project.description);
      }
    }
    if (project.technologies) {
      textParts.push(...project.technologies);
    }
  });
  
  // Skills
  if (resume.skills) {
    textParts.push(...resume.skills);
  }
  
  // Languages
  if (resume.languages) {
    textParts.push(...resume.languages);
  }
  
  return textParts.filter(text => text && text.trim()).join(' ');
};

const calculateSkillsMatch = (resumeSkills: string[], jobSkills: string[]) => {
  if (!jobSkills || jobSkills.length === 0) {
    return { score: 0.5, matching: [], missing: [] }; // Neutral score if no job skills specified
  }
  
  const normalizedResumeSkills = resumeSkills.map(skill => skill.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map(skill => skill.toLowerCase().trim());
  
  const matching: string[] = [];
  const missing: string[] = [];
  
  normalizedJobSkills.forEach(jobSkill => {
    const found = normalizedResumeSkills.some(resumeSkill => 
      resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill) ||
      getSkillSimilarity(resumeSkill, jobSkill) > 0.8
    );
    
    if (found) {
      matching.push(jobSkill);
    } else {
      missing.push(jobSkill);
    }
  });
  
  const score = matching.length / normalizedJobSkills.length;
  return { score, matching, missing };
};

const calculateExperienceMatch = (workExperiences: any[], job: Job) => {
  if (!workExperiences || workExperiences.length === 0) {
    return { score: 0.2 }; // Low score for no experience
  }
  
  let experienceScore = 0;
  const jobTitleLower = job.title.toLowerCase();
  const jobDescriptionLower = job.description.toLowerCase();
  
  // Check for relevant job titles and companies
  workExperiences.forEach(exp => {
    const roleLower = exp.role.toLowerCase();
    const companyLower = exp.company.toLowerCase();
    
    // Title similarity
    if (roleLower.includes(jobTitleLower) || jobTitleLower.includes(roleLower)) {
      experienceScore += 0.4;
    } else if (getTextSimilarity(roleLower, jobTitleLower) > 0.6) {
      experienceScore += 0.3;
    }
    
    // Description matching
    if (exp.description) {
      const descriptionText = Array.isArray(exp.description) 
        ? exp.description.join(' ').toLowerCase()
        : exp.description.toLowerCase();
      
      const commonWords = findCommonWords(descriptionText, jobDescriptionLower);
      if (commonWords.length > 5) {
        experienceScore += 0.2;
      } else if (commonWords.length > 2) {
        experienceScore += 0.1;
      }
    }
  });
  
  return { score: Math.min(experienceScore, 1) };
};

const calculateKeywordMatch = (resumeText: string, jobText: string, job: Job) => {
  const jobKeywords = extractKeywords(jobText);
  const matches: string[] = [];
  
  jobKeywords.forEach(keyword => {
    if (resumeText.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  });
  
  // Calculate score based on keyword density
  const score = matches.length / Math.max(jobKeywords.length, 1);
  
  return { score, matches };
};

const extractKeywords = (text: string): string[] => {
  // Common technical and professional keywords
  const technicalKeywords = [
    'javascript', 'typescript', 'react', 'angular', 'vue', 'node.js', 'python', 'java',
    'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'sql', 'mongodb', 'postgresql',
    'mysql', 'redis', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
    'agile', 'scrum', 'devops', 'ci/cd', 'rest', 'graphql', 'microservices', 'api',
    'frontend', 'backend', 'fullstack', 'mobile', 'web development', 'software engineer',
    'senior', 'lead', 'manager', 'architect', 'design', 'development', 'testing',
    'automation', 'machine learning', 'artificial intelligence', 'data science',
    'analytics', 'big data', 'cloud computing', 'cybersecurity', 'blockchain'
  ];
  
  const foundKeywords: string[] = [];
  
  technicalKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  });
  
  // Also extract years of experience mentions
  const experienceRegex = /(\d+)\+?\s*years?\s*(of\s*)?(experience|exp)/gi;
  const experienceMatches = text.match(experienceRegex);
  if (experienceMatches) {
    foundKeywords.push(...experienceMatches);
  }
  
  return foundKeywords;
};

const getSkillSimilarity = (skill1: string, skill2: string): number => {
  // Simple similarity calculation
  if (skill1 === skill2) return 1;
  if (skill1.includes(skill2) || skill2.includes(skill1)) return 0.8;
  
  // Check for common abbreviations
  const abbreviations: Record<string, string[]> = {
    'js': ['javascript'],
    'ts': ['typescript'],
    'react': ['reactjs', 'react.js'],
    'vue': ['vuejs', 'vue.js'],
    'node': ['nodejs', 'node.js'],
    'css': ['css3'],
    'html': ['html5']
  };
  
  for (const [abbr, full] of Object.entries(abbreviations)) {
    if ((skill1 === abbr && full.includes(skill2)) || 
        (skill2 === abbr && full.includes(skill1))) {
      return 0.9;
    }
  }
  
  return 0;
};

const getTextSimilarity = (text1: string, text2: string): number => {
  const words1 = text1.split(/\s+/);
  const words2 = text2.split(/\s+/);
  const commonWords = words1.filter(word => words2.includes(word));
  return commonWords.length / Math.max(words1.length, words2.length);
};

const findCommonWords = (text1: string, text2: string): string[] => {
  const words1 = text1.split(/\s+/).filter(word => word.length > 3);
  const words2 = text2.split(/\s+/).filter(word => word.length > 3);
  return words1.filter(word => words2.includes(word));
};

const generateRecommendations = (
  skillsMatch: any,
  experienceMatch: any,
  keywordMatch: any
): string[] => {
  const recommendations: string[] = [];
  
  if (skillsMatch.missing.length > 0) {
    recommendations.push(`Consider learning these skills: ${skillsMatch.missing.slice(0, 3).join(', ')}`);
  }
  
  if (experienceMatch.score < 0.5) {
    recommendations.push('Highlight more relevant experience that matches this job title');
  }
  
  if (keywordMatch.score < 0.3) {
    recommendations.push('Include more industry-specific keywords in your resume');
  }
  
  if (skillsMatch.score > 0.8) {
    recommendations.push('Great skills match! Consider applying soon.');
  }
  
  return recommendations;
};

// Export utility functions for use in job matching components
export { extractResumeText, calculateSkillsMatch, extractKeywords };
