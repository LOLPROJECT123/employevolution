
export interface ATSAnalysis {
  score: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  suggestions: string[];
  readabilityScore: number;
  formatIssues: string[];
}

export interface ATSSystemDetection {
  detectedSystem: string;
  confidence: number;
  optimizationTips: string[];
}

export class ATSOptimizationService {
  private static readonly commonATSSystems = [
    'Workday', 'Greenhouse', 'Lever', 'BambooHR', 'iCIMS', 
    'Taleo', 'SuccessFactors', 'SmartRecruiters', 'Jobvite'
  ];

  static async analyzeResume(resumeText: string, jobDescription: string): Promise<ATSAnalysis> {
    const jobKeywords = this.extractKeywords(jobDescription);
    const resumeKeywords = this.extractKeywords(resumeText);
    
    const keywordsFound = jobKeywords.filter(keyword => 
      resumeKeywords.some(rKeyword => 
        rKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    const keywordsMissing = jobKeywords.filter(keyword => 
      !keywordsFound.some(found => 
        found.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    const score = Math.round((keywordsFound.length / jobKeywords.length) * 100);
    const readabilityScore = this.calculateReadabilityScore(resumeText);
    const formatIssues = this.detectFormatIssues(resumeText);
    const suggestions = this.generateSuggestions(keywordsMissing, formatIssues, score);

    return {
      score,
      keywordsFound,
      keywordsMissing,
      suggestions,
      readabilityScore,
      formatIssues
    };
  }

  static detectATSSystem(jobPageUrl: string, jobPageHtml: string): ATSSystemDetection {
    const detectionRules = {
      'Workday': [
        'workday.com',
        'wd-template',
        'workday-application'
      ],
      'Greenhouse': [
        'greenhouse.io',
        'greenhouse-logo',
        'gh-application'
      ],
      'Lever': [
        'lever.co',
        'lever-application',
        'lever-form'
      ],
      'BambooHR': [
        'bamboohr.com',
        'bamboo-application'
      ],
      'iCIMS': [
        'icims.com',
        'iCIMS',
        'icims-form'
      ]
    };

    let bestMatch = { system: 'Unknown', confidence: 0 };

    for (const [system, indicators] of Object.entries(detectionRules)) {
      let matches = 0;
      for (const indicator of indicators) {
        if (jobPageUrl.includes(indicator) || jobPageHtml.includes(indicator)) {
          matches++;
        }
      }
      
      const confidence = (matches / indicators.length) * 100;
      if (confidence > bestMatch.confidence) {
        bestMatch = { system, confidence };
      }
    }

    return {
      detectedSystem: bestMatch.system,
      confidence: bestMatch.confidence,
      optimizationTips: this.getOptimizationTips(bestMatch.system)
    };
  }

  private static extractKeywords(text: string): string[] {
    // Remove common stop words and extract meaningful keywords
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Extract multi-word phrases (2-3 words)
    const phrases: string[] = [];
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
      if (i < words.length - 2) {
        phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
      }
    }

    return [...new Set([...words, ...phrases])];
  }

  private static calculateReadabilityScore(text: string): number {
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const characters = text.replace(/\s/g, '').length;

    // Simplified readability formula
    const avgWordsPerSentence = words / sentences;
    const avgCharsPerWord = characters / words;

    // ATS prefers clear, concise content
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 10;
    if (avgCharsPerWord > 6) score -= 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private static detectFormatIssues(text: string): string[] {
    const issues: string[] = [];

    // Check for common formatting issues
    if (text.includes('\t')) {
      issues.push('Contains tab characters - use spaces instead');
    }
    
    if (text.match(/\s{3,}/)) {
      issues.push('Contains excessive spacing - use single spaces');
    }
    
    if (text.match(/[^\x00-\x7F]/)) {
      issues.push('Contains special characters that may not parse correctly');
    }
    
    if (text.split('\n').length < 5) {
      issues.push('Text appears to lack proper line breaks and structure');
    }

    return issues;
  }

  private static generateSuggestions(
    missingKeywords: string[], 
    formatIssues: string[], 
    score: number
  ): string[] {
    const suggestions: string[] = [];

    if (score < 60) {
      suggestions.push('Your resume matches less than 60% of job keywords. Consider adding more relevant skills and experience.');
    }

    if (missingKeywords.length > 0) {
      suggestions.push(`Consider adding these missing keywords: ${missingKeywords.slice(0, 5).join(', ')}`);
    }

    if (formatIssues.length > 0) {
      suggestions.push('Fix formatting issues to improve ATS parsing');
    }

    suggestions.push('Use standard section headers like "Work Experience", "Education", "Skills"');
    suggestions.push('Include both spelled-out and abbreviated versions of key terms (e.g., "Search Engine Optimization (SEO)")');
    suggestions.push('Use standard fonts like Arial, Calibri, or Times New Roman');

    return suggestions;
  }

  private static getOptimizationTips(atsSystem: string): string[] {
    const generalTips = [
      'Use standard section headers',
      'Include keywords from job description',
      'Use simple formatting',
      'Save as .docx or .pdf format'
    ];

    const systemSpecificTips: Record<string, string[]> = {
      'Workday': [
        'Workday prefers chronological format',
        'Include exact job titles when possible',
        'Use bullet points for achievements'
      ],
      'Greenhouse': [
        'Greenhouse scans for specific skills',
        'Include technical certifications',
        'Use action verbs to start bullet points'
      ],
      'Lever': [
        'Lever focuses on cultural fit keywords',
        'Include soft skills alongside technical skills',
        'Mention collaboration and teamwork'
      ]
    };

    return [...generalTips, ...(systemSpecificTips[atsSystem] || [])];
  }

  static async optimizeResumeForJob(resumeText: string, jobDescription: string): Promise<string> {
    const analysis = await this.analyzeResume(resumeText, jobDescription);
    
    let optimizedResume = resumeText;
    
    // Add missing keywords naturally
    if (analysis.keywordsMissing.length > 0) {
      const skillsSection = this.findSkillsSection(resumeText);
      if (skillsSection) {
        const relevantSkills = analysis.keywordsMissing
          .filter(keyword => keyword.length < 20) // Filter out long phrases
          .slice(0, 3); // Add top 3 missing keywords
        
        optimizedResume = optimizedResume.replace(
          skillsSection,
          skillsSection + '\n• ' + relevantSkills.join('\n• ')
        );
      }
    }

    return optimizedResume;
  }

  private static findSkillsSection(resumeText: string): string | null {
    const skillsHeaders = [
      /Skills?\s*:?/i,
      /Technical Skills?\s*:?/i,
      /Core Competencies\s*:?/i,
      /Expertise\s*:?/i
    ];

    for (const header of skillsHeaders) {
      const match = resumeText.match(header);
      if (match) {
        const startIndex = match.index!;
        const nextSectionIndex = resumeText.indexOf('\n\n', startIndex);
        return resumeText.substring(startIndex, nextSectionIndex > -1 ? nextSectionIndex : resumeText.length);
      }
    }

    return null;
  }
}
