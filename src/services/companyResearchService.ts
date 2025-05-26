
interface CompanyInfo {
  name: string;
  description: string;
  size: string;
  industry: string;
  founded: number;
  headquarters: string;
  website: string;
  rating: number;
  reviewCount: number;
  culture: {
    workLifeBalance: number;
    compensation: number;
    careerOpportunities: number;
    management: number;
    diversity: number;
  };
  salaryData: {
    averageSalary: number;
    salaryRange: { min: number; max: number };
    byLevel: Record<string, { min: number; max: number }>;
  };
  interviewProcess: {
    difficulty: number;
    length: string;
    stages: string[];
    commonQuestions: string[];
  };
  benefits: string[];
  recentNews: Array<{
    title: string;
    date: string;
    source: string;
    url: string;
  }>;
  keyPeople: Array<{
    name: string;
    title: string;
    linkedinUrl?: string;
  }>;
  competitors: string[];
  pros: string[];
  cons: string[];
}

class CompanyResearchService {
  private cache = new Map<string, { data: CompanyInfo; timestamp: number }>();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  async getCompanyInfo(companyName: string): Promise<CompanyInfo | null> {
    // Check cache first
    const cached = this.cache.get(companyName);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // In a real implementation, these would be actual API calls
      const companyInfo = await this.fetchCompanyData(companyName);
      
      // Cache the result
      this.cache.set(companyName, {
        data: companyInfo,
        timestamp: Date.now()
      });
      
      return companyInfo;
    } catch (error) {
      console.error('Failed to fetch company info:', error);
      return this.getMockCompanyInfo(companyName);
    }
  }

  private async fetchCompanyData(companyName: string): Promise<CompanyInfo> {
    // This would integrate with actual APIs like:
    // - Glassdoor API for reviews and salary data
    // - Crunchbase API for company info
    // - LinkedIn API for employee data
    // - News APIs for recent company news
    
    // For now, return mock data
    return this.getMockCompanyInfo(companyName);
  }

  private getMockCompanyInfo(companyName: string): CompanyInfo {
    const mockData: Record<string, CompanyInfo> = {
      'Google': {
        name: 'Google',
        description: 'Technology company specializing in search, cloud computing, and AI',
        size: 'Large (100,000+ employees)',
        industry: 'Technology',
        founded: 1998,
        headquarters: 'Mountain View, CA',
        website: 'https://google.com',
        rating: 4.4,
        reviewCount: 15420,
        culture: {
          workLifeBalance: 4.2,
          compensation: 4.6,
          careerOpportunities: 4.5,
          management: 4.1,
          diversity: 4.3
        },
        salaryData: {
          averageSalary: 165000,
          salaryRange: { min: 120000, max: 350000 },
          byLevel: {
            'entry': { min: 120000, max: 160000 },
            'mid': { min: 150000, max: 220000 },
            'senior': { min: 200000, max: 350000 }
          }
        },
        interviewProcess: {
          difficulty: 4.2,
          length: '4-6 weeks',
          stages: ['Phone Screen', 'Technical Interview', 'System Design', 'Behavioral Interview', 'Team Match'],
          commonQuestions: [
            'Tell me about a challenging project you worked on',
            'How would you design a URL shortener?',
            'Describe a time you had to work with a difficult team member'
          ]
        },
        benefits: [
          'Comprehensive health insurance',
          'Free meals and snacks',
          '20% time for personal projects',
          'Stock options',
          'Unlimited PTO',
          'Learning and development budget'
        ],
        recentNews: [
          {
            title: 'Google announces new AI initiatives',
            date: '2024-01-15',
            source: 'TechCrunch',
            url: 'https://techcrunch.com/google-ai'
          }
        ],
        keyPeople: [
          { name: 'Sundar Pichai', title: 'CEO', linkedinUrl: 'https://linkedin.com/in/sundarpichai' }
        ],
        competitors: ['Microsoft', 'Apple', 'Amazon', 'Meta'],
        pros: [
          'Excellent compensation and benefits',
          'Cutting-edge technology and projects',
          'Strong engineering culture',
          'Great career growth opportunities'
        ],
        cons: [
          'Highly competitive environment',
          'Can be bureaucratic',
          'Work-life balance varies by team',
          'High performance expectations'
        ]
      },
      'Microsoft': {
        name: 'Microsoft',
        description: 'Technology corporation focused on software, cloud computing, and productivity',
        size: 'Large (200,000+ employees)',
        industry: 'Technology',
        founded: 1975,
        headquarters: 'Redmond, WA',
        website: 'https://microsoft.com',
        rating: 4.4,
        reviewCount: 12300,
        culture: {
          workLifeBalance: 4.4,
          compensation: 4.5,
          careerOpportunities: 4.3,
          management: 4.2,
          diversity: 4.4
        },
        salaryData: {
          averageSalary: 155000,
          salaryRange: { min: 110000, max: 320000 },
          byLevel: {
            'entry': { min: 110000, max: 150000 },
            'mid': { min: 140000, max: 200000 },
            'senior': { min: 180000, max: 320000 }
          }
        },
        interviewProcess: {
          difficulty: 4.0,
          length: '3-5 weeks',
          stages: ['Phone Screen', 'Technical Round', 'System Design', 'Behavioral Interview'],
          commonQuestions: [
            'Why do you want to work at Microsoft?',
            'Design a distributed cache system',
            'Tell me about a time you failed and what you learned'
          ]
        },
        benefits: [
          'Comprehensive healthcare',
          'Stock purchase plan',
          'Flexible work arrangements',
          'Generous parental leave',
          'Learning resources and training'
        ],
        recentNews: [
          {
            title: 'Microsoft expands Azure AI services',
            date: '2024-01-10',
            source: 'GeekWire',
            url: 'https://geekwire.com/microsoft-azure'
          }
        ],
        keyPeople: [
          { name: 'Satya Nadella', title: 'CEO', linkedinUrl: 'https://linkedin.com/in/satyanadella' }
        ],
        competitors: ['Google', 'Amazon', 'Apple', 'Oracle'],
        pros: [
          'Excellent work-life balance',
          'Strong focus on employee development',
          'Inclusive culture',
          'Competitive compensation'
        ],
        cons: [
          'Large bureaucratic structure',
          'Slower decision making',
          'Variable team quality',
          'Legacy technology constraints'
        ]
      }
    };

    return mockData[companyName] || this.getGenericCompanyInfo(companyName);
  }

  private getGenericCompanyInfo(companyName: string): CompanyInfo {
    return {
      name: companyName,
      description: `${companyName} is a technology company focused on innovative solutions`,
      size: 'Mid-size (1,000-10,000 employees)',
      industry: 'Technology',
      founded: 2010,
      headquarters: 'San Francisco, CA',
      website: `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      rating: 3.8,
      reviewCount: 150,
      culture: {
        workLifeBalance: 3.8,
        compensation: 3.9,
        careerOpportunities: 4.0,
        management: 3.7,
        diversity: 3.8
      },
      salaryData: {
        averageSalary: 120000,
        salaryRange: { min: 80000, max: 180000 },
        byLevel: {
          'entry': { min: 80000, max: 110000 },
          'mid': { min: 100000, max: 140000 },
          'senior': { min: 130000, max: 180000 }
        }
      },
      interviewProcess: {
        difficulty: 3.5,
        length: '2-3 weeks',
        stages: ['Phone Screen', 'Technical Interview', 'Final Interview'],
        commonQuestions: [
          'Tell me about yourself',
          'Why are you interested in this role?',
          'Describe a challenging project you worked on'
        ]
      },
      benefits: [
        'Health insurance',
        'Dental and vision',
        '401(k) matching',
        'Flexible PTO',
        'Remote work options'
      ],
      recentNews: [],
      keyPeople: [],
      competitors: [],
      pros: [
        'Growing company with opportunities',
        'Collaborative team environment',
        'Competitive salary'
      ],
      cons: [
        'Limited information available',
        'Smaller company resources',
        'Less established processes'
      ]
    };
  }

  async getSalaryBenchmark(position: string, location: string, experience: string): Promise<{
    averageSalary: number;
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile90: number;
    sampleSize: number;
  }> {
    // Mock salary benchmarking data
    const baseSalary = this.getBaseSalaryForPosition(position);
    const locationMultiplier = this.getLocationMultiplier(location);
    const experienceMultiplier = this.getExperienceMultiplier(experience);
    
    const adjustedSalary = baseSalary * locationMultiplier * experienceMultiplier;
    
    return {
      averageSalary: Math.round(adjustedSalary),
      percentile25: Math.round(adjustedSalary * 0.85),
      percentile50: Math.round(adjustedSalary * 0.95),
      percentile75: Math.round(adjustedSalary * 1.15),
      percentile90: Math.round(adjustedSalary * 1.35),
      sampleSize: 150
    };
  }

  private getBaseSalaryForPosition(position: string): number {
    const positionSalaries: Record<string, number> = {
      'software engineer': 120000,
      'senior software engineer': 160000,
      'staff software engineer': 200000,
      'engineering manager': 180000,
      'product manager': 140000,
      'data scientist': 130000,
      'devops engineer': 125000,
      'frontend developer': 110000,
      'backend developer': 125000,
      'full stack developer': 115000
    };
    
    const lowerPosition = position.toLowerCase();
    return positionSalaries[lowerPosition] || 100000;
  }

  private getLocationMultiplier(location: string): number {
    const locationMultipliers: Record<string, number> = {
      'san francisco': 1.4,
      'new york': 1.3,
      'seattle': 1.25,
      'boston': 1.2,
      'austin': 1.1,
      'chicago': 1.05,
      'denver': 1.0,
      'atlanta': 0.95,
      'remote': 1.1
    };
    
    const lowerLocation = location.toLowerCase();
    return locationMultipliers[lowerLocation] || 1.0;
  }

  private getExperienceMultiplier(experience: string): number {
    const experienceMultipliers: Record<string, number> = {
      'entry': 0.85,
      'mid': 1.0,
      'senior': 1.3,
      'lead': 1.5,
      'manager': 1.4,
      'director': 1.8
    };
    
    return experienceMultipliers[experience] || 1.0;
  }

  async getInterviewInsights(companyName: string, position: string): Promise<{
    commonQuestions: string[];
    interviewTips: string[];
    difficulty: number;
    processLength: string;
    successRate: number;
  }> {
    const companyInfo = await this.getCompanyInfo(companyName);
    
    if (!companyInfo) {
      return {
        commonQuestions: [
          'Tell me about yourself',
          'Why are you interested in this position?',
          'What are your greatest strengths?'
        ],
        interviewTips: [
          'Research the company thoroughly',
          'Prepare specific examples',
          'Ask thoughtful questions'
        ],
        difficulty: 3.0,
        processLength: '2-3 weeks',
        successRate: 0.25
      };
    }
    
    return {
      commonQuestions: companyInfo.interviewProcess.commonQuestions,
      interviewTips: [
        `Research ${companyName}'s recent news and initiatives`,
        'Prepare STAR method examples for behavioral questions',
        'Practice technical questions relevant to the role',
        'Prepare questions about team structure and growth'
      ],
      difficulty: companyInfo.interviewProcess.difficulty,
      processLength: companyInfo.interviewProcess.length,
      successRate: this.calculateSuccessRate(companyInfo.interviewProcess.difficulty)
    };
  }

  private calculateSuccessRate(difficulty: number): number {
    // Higher difficulty = lower success rate
    if (difficulty >= 4.5) return 0.15;
    if (difficulty >= 4.0) return 0.25;
    if (difficulty >= 3.5) return 0.35;
    if (difficulty >= 3.0) return 0.45;
    return 0.55;
  }
}

export const companyResearchService = new CompanyResearchService();
