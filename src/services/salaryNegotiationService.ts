
interface SalaryData {
  position: string;
  company?: string;
  location: string;
  salaryRange: {
    min: number;
    max: number;
    median: number;
  };
  equity?: {
    min: number;
    max: number;
  };
  benefits: string[];
  lastUpdated: string;
  source: string;
  experienceLevel: string;
}

interface NegotiationStrategy {
  id: string;
  title: string;
  description: string;
  tactics: string[];
  whenToUse: string[];
  riskLevel: 'low' | 'medium' | 'high';
  successRate: number;
}

interface NegotiationTemplate {
  id: string;
  name: string;
  scenario: string;
  emailTemplate: string;
  phoneScript: string;
  tips: string[];
}

interface MarketAnalysis {
  position: string;
  location: string;
  marketRate: {
    percentile25: number;
    percentile50: number;
    percentile75: number;
    percentile90: number;
  };
  trending: 'up' | 'down' | 'stable';
  demand: 'high' | 'medium' | 'low';
  insights: string[];
  recommendations: string[];
}

class SalaryNegotiationService {
  private salaryDataKey = 'salary_market_data';
  private negotiationHistoryKey = 'negotiation_history';

  // Get market salary data for a position
  async getMarketSalaryData(
    position: string,
    location: string,
    experienceLevel: string
  ): Promise<MarketAnalysis> {
    // Simulate API call to salary data providers
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock market data (in production, this would come from APIs like Glassdoor, PayScale, etc.)
    const baseRates = this.getBaseSalaryRates(position, location, experienceLevel);
    
    return {
      position,
      location,
      marketRate: {
        percentile25: baseRates.base * 0.85,
        percentile50: baseRates.base,
        percentile75: baseRates.base * 1.15,
        percentile90: baseRates.base * 1.35
      },
      trending: this.getSalaryTrend(position),
      demand: this.getJobDemand(position),
      insights: this.generateMarketInsights(position, location, baseRates),
      recommendations: this.generateNegotiationRecommendations(position, baseRates)
    };
  }

  private getBaseSalaryRates(position: string, location: string, experienceLevel: string) {
    // Mock salary calculation based on position, location, and experience
    const baseSalaries: Record<string, number> = {
      'software engineer': 95000,
      'senior software engineer': 130000,
      'product manager': 120000,
      'data scientist': 115000,
      'frontend developer': 85000,
      'backend developer': 90000,
      'full stack developer': 88000,
      'devops engineer': 105000,
      'machine learning engineer': 125000,
      'ui/ux designer': 75000
    };

    const locationMultipliers: Record<string, number> = {
      'san francisco': 1.4,
      'new york': 1.3,
      'seattle': 1.25,
      'boston': 1.2,
      'austin': 1.1,
      'denver': 1.05,
      'remote': 1.15
    };

    const experienceMultipliers: Record<string, number> = {
      'entry': 0.8,
      'mid': 1.0,
      'senior': 1.3,
      'lead': 1.6,
      'executive': 2.0
    };

    const normalizedPosition = position.toLowerCase();
    const normalizedLocation = location.toLowerCase();
    const baseRate = baseSalaries[normalizedPosition] || 80000;
    const locationMultiplier = locationMultipliers[normalizedLocation] || 1.0;
    const experienceMultiplier = experienceMultipliers[experienceLevel] || 1.0;

    return {
      base: Math.round(baseRate * locationMultiplier * experienceMultiplier),
      baseRate,
      locationMultiplier,
      experienceMultiplier
    };
  }

  private getSalaryTrend(position: string): 'up' | 'down' | 'stable' {
    // Mock trending data
    const trends: Record<string, 'up' | 'down' | 'stable'> = {
      'software engineer': 'up',
      'data scientist': 'stable',
      'product manager': 'up',
      'devops engineer': 'up',
      'ui/ux designer': 'stable'
    };

    return trends[position.toLowerCase()] || 'stable';
  }

  private getJobDemand(position: string): 'high' | 'medium' | 'low' {
    const demandLevels: Record<string, 'high' | 'medium' | 'low'> = {
      'software engineer': 'high',
      'data scientist': 'high',
      'product manager': 'medium',
      'devops engineer': 'high',
      'ui/ux designer': 'medium'
    };

    return demandLevels[position.toLowerCase()] || 'medium';
  }

  private generateMarketInsights(position: string, location: string, rates: any): string[] {
    const insights: string[] = [];

    if (rates.locationMultiplier > 1.2) {
      insights.push(`${location} offers significantly higher salaries for ${position} roles (+${Math.round((rates.locationMultiplier - 1) * 100)}%)`);
    }

    if (this.getJobDemand(position) === 'high') {
      insights.push(`High demand for ${position} positions gives you strong negotiating power`);
    }

    if (this.getSalaryTrend(position) === 'up') {
      insights.push(`Salaries for ${position} roles are trending upward, strengthening your position`);
    }

    insights.push(`Market rates vary significantly - research specific companies for more accurate data`);
    insights.push(`Consider total compensation including equity, benefits, and work-life balance`);

    return insights;
  }

  private generateNegotiationRecommendations(position: string, rates: any): string[] {
    const recommendations: string[] = [];

    recommendations.push(`Aim for the 75th percentile ($${Math.round(rates.base * 1.15).toLocaleString()}) as your target`);
    recommendations.push(`Have a minimum acceptable offer of $${Math.round(rates.base * 0.9).toLocaleString()}`);
    recommendations.push(`Research company-specific compensation data for more accurate negotiations`);
    recommendations.push(`Consider negotiating equity, flexible work arrangements, and professional development budget`);

    if (this.getJobDemand(position) === 'high') {
      recommendations.push(`Leverage high market demand to negotiate above-market rates`);
    }

    return recommendations;
  }

  // Get negotiation strategies
  getNegotiationStrategies(): NegotiationStrategy[] {
    return [
      {
        id: 'market-research',
        title: 'Market Research Approach',
        description: 'Use comprehensive market data to justify your salary request',
        tactics: [
          'Present salary research from multiple sources',
          'Highlight your unique value proposition',
          'Compare total compensation packages',
          'Reference industry trends and growth'
        ],
        whenToUse: [
          'When you have strong market data',
          'For standard industry positions',
          'When the company values data-driven decisions'
        ],
        riskLevel: 'low',
        successRate: 75
      },
      {
        id: 'value-based',
        title: 'Value-Based Negotiation',
        description: 'Focus on the unique value and ROI you bring to the organization',
        tactics: [
          'Quantify your past achievements',
          'Project future impact and contributions',
          'Highlight rare skills or expertise',
          'Demonstrate cost savings or revenue generation'
        ],
        whenToUse: [
          'When you have strong track record',
          'For specialized roles',
          'When company is growing rapidly'
        ],
        riskLevel: 'medium',
        successRate: 80
      },
      {
        id: 'competing-offers',
        title: 'Competing Offers Strategy',
        description: 'Leverage multiple job offers to increase your negotiating power',
        tactics: [
          'Mention competing offers tactfully',
          'Compare total compensation packages',
          'Create urgency with decision timelines',
          'Focus on preferred company while showing alternatives'
        ],
        whenToUse: [
          'When you have multiple offers',
          'In competitive job markets',
          'For in-demand skills'
        ],
        riskLevel: 'medium',
        successRate: 85
      },
      {
        id: 'package-optimization',
        title: 'Total Package Optimization',
        description: 'Negotiate beyond base salary to optimize total compensation',
        tactics: [
          'Negotiate signing bonus',
          'Request equity or stock options',
          'Discuss flexible work arrangements',
          'Negotiate professional development budget',
          'Consider additional vacation time'
        ],
        whenToUse: [
          'When base salary is fixed',
          'For startups with limited cash',
          'When work-life balance is important'
        ],
        riskLevel: 'low',
        successRate: 70
      }
    ];
  }

  // Get negotiation templates
  getNegotiationTemplates(): NegotiationTemplate[] {
    return [
      {
        id: 'initial-counteroffer',
        name: 'Initial Counter Offer',
        scenario: 'Responding to the first salary offer',
        emailTemplate: `Dear [Hiring Manager],

Thank you for extending the offer for the [Position] role. I'm very excited about the opportunity to join [Company] and contribute to [specific project/goal].

After reviewing the offer and researching market rates for similar positions in [Location], I'd like to discuss the compensation package. Based on my research and experience, the market rate for this role ranges from $[X] to $[Y].

Given my [specific qualifications/experience], I was hoping we could adjust the base salary to $[target amount]. This would be more in line with market standards for someone with my background.

I'm confident that my skills in [relevant skills] will bring significant value to the team. I'm looking forward to discussing this further.

Best regards,
[Your Name]`,
        phoneScript: `Thank you for the offer - I'm really excited about joining the team. I've done some research on market rates and was hoping we could discuss the compensation. Based on my experience with [specific examples], I believe a salary of $[amount] would be more appropriate. What are your thoughts on that?`,
        tips: [
          'Express enthusiasm first',
          'Use market data to support your request',
          'Be specific about your value proposition',
          'Remain professional and collaborative'
        ]
      },
      {
        id: 'benefits-negotiation',
        name: 'Benefits and Perks Negotiation',
        scenario: 'When base salary is non-negotiable but other benefits can be adjusted',
        emailTemplate: `Dear [Hiring Manager],

I appreciate you taking the time to discuss the salary structure. I understand that the base salary of $[amount] is fixed, and I respect the company's compensation framework.

I'd like to explore other aspects of the compensation package that might be more flexible:

• Could we discuss a one-time signing bonus of $[amount]?
• Is there flexibility in the equity/stock option allocation?
• Would it be possible to negotiate additional vacation days?
• Could we include a professional development budget of $[amount] annually?

These adjustments would help bridge the gap and make the overall package more competitive. I'm committed to contributing significantly to [specific goals] and believe these investments in my development would benefit both of us.

Looking forward to your thoughts.

Best regards,
[Your Name]`,
        phoneScript: `I understand the base salary is set, but I'd love to discuss other parts of the package. Could we talk about things like a signing bonus, additional equity, or professional development opportunities? I think there might be creative ways to make this work for both of us.`,
        tips: [
          'Acknowledge constraints respectfully',
          'Propose specific alternatives',
          'Show flexibility and creativity',
          'Emphasize mutual benefit'
        ]
      }
    ];
  }

  // Calculate negotiation confidence score
  calculateNegotiationConfidence(
    currentOffer: number,
    marketRate: MarketAnalysis,
    candidateExperience: string,
    hasCompetingOffers: boolean
  ): {
    score: number;
    factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[];
    recommendation: string;
  } {
    let score = 50; // Base confidence
    const factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; description: string }[] = [];

    // Offer vs market rate
    const marketMedian = marketRate.marketRate.percentile50;
    if (currentOffer < marketMedian * 0.9) {
      score += 25;
      factors.push({
        factor: 'Below Market Rate',
        impact: 'positive',
        description: `Offer is ${Math.round(((marketMedian - currentOffer) / marketMedian) * 100)}% below market median`
      });
    } else if (currentOffer > marketMedian * 1.1) {
      score -= 15;
      factors.push({
        factor: 'Above Market Rate',
        impact: 'negative',
        description: `Offer is ${Math.round(((currentOffer - marketMedian) / marketMedian) * 100)}% above market median`
      });
    }

    // Market demand
    if (marketRate.demand === 'high') {
      score += 15;
      factors.push({
        factor: 'High Market Demand',
        impact: 'positive',
        description: 'Strong demand for your skills increases negotiating power'
      });
    }

    // Salary trending
    if (marketRate.trending === 'up') {
      score += 10;
      factors.push({
        factor: 'Rising Market Rates',
        impact: 'positive',
        description: 'Salaries are trending upward in your field'
      });
    }

    // Experience level
    if (candidateExperience === 'senior' || candidateExperience === 'lead') {
      score += 10;
      factors.push({
        factor: 'Senior Experience',
        impact: 'positive',
        description: 'Senior-level experience provides strong negotiating position'
      });
    }

    // Competing offers
    if (hasCompetingOffers) {
      score += 20;
      factors.push({
        factor: 'Competing Offers',
        impact: 'positive',
        description: 'Multiple offers significantly strengthen your position'
      });
    }

    // Cap the score
    score = Math.min(95, Math.max(15, score));

    let recommendation = '';
    if (score >= 80) {
      recommendation = 'Strong negotiating position - aim high and be confident';
    } else if (score >= 60) {
      recommendation = 'Good negotiating position - present your case professionally';
    } else if (score >= 40) {
      recommendation = 'Moderate position - focus on value and market data';
    } else {
      recommendation = 'Weak position - consider accepting or negotiating non-salary benefits';
    }

    return { score, factors, recommendation };
  }

  // Generate personalized negotiation plan
  generateNegotiationPlan(
    offer: {
      baseSalary: number;
      equity?: number;
      bonus?: number;
      benefits: string[];
    },
    marketData: MarketAnalysis,
    candidateProfile: {
      experience: string;
      skills: string[];
      achievements: string[];
    },
    hasCompetingOffers: boolean
  ) {
    const confidence = this.calculateNegotiationConfidence(
      offer.baseSalary,
      marketData,
      candidateProfile.experience,
      hasCompetingOffers
    );

    const targetSalary = Math.round(marketData.marketRate.percentile75);
    const minimumAcceptable = Math.round(marketData.marketRate.percentile50 * 0.95);

    return {
      confidence,
      targets: {
        baseSalary: targetSalary,
        minimumAcceptable,
        equityPercentage: offer.equity ? offer.equity * 1.2 : undefined,
        signingBonus: Math.round(targetSalary * 0.1)
      },
      strategy: this.selectBestStrategy(confidence.score, hasCompetingOffers),
      timeline: this.generateNegotiationTimeline(),
      talking_points: this.generateTalkingPoints(candidateProfile, marketData),
      fallback_options: this.generateFallbackOptions(offer, marketData)
    };
  }

  private selectBestStrategy(confidenceScore: number, hasCompetingOffers: boolean): NegotiationStrategy {
    const strategies = this.getNegotiationStrategies();

    if (hasCompetingOffers) {
      return strategies.find(s => s.id === 'competing-offers')!;
    }

    if (confidenceScore >= 70) {
      return strategies.find(s => s.id === 'value-based')!;
    }

    return strategies.find(s => s.id === 'market-research')!;
  }

  private generateNegotiationTimeline() {
    return [
      { step: 1, action: 'Research and prepare', timeframe: '1-2 days', description: 'Gather market data and prepare your case' },
      { step: 2, action: 'Initial response', timeframe: '2-3 days after offer', description: 'Thank them and request time to review' },
      { step: 3, action: 'Counteroffer', timeframe: '3-5 days after offer', description: 'Present your counteroffer with supporting data' },
      { step: 4, action: 'Follow-up', timeframe: '1-2 days after counteroffer', description: 'Discuss and negotiate details' },
      { step: 5, action: 'Final decision', timeframe: '1 week after offer', description: 'Accept, decline, or request final adjustments' }
    ];
  }

  private generateTalkingPoints(candidateProfile: any, marketData: MarketAnalysis) {
    return [
      `Market research shows the median salary for this position is $${marketData.marketRate.percentile50.toLocaleString()}`,
      `My ${candidateProfile.experience} years of experience positions me in the 75th percentile range`,
      `I bring unique value through my expertise in ${candidateProfile.skills.slice(0, 3).join(', ')}`,
      `Recent achievements include: ${candidateProfile.achievements.slice(0, 2).join(', ')}`,
      `I'm excited about contributing to [specific company goals] and believe fair compensation reflects mutual investment`
    ];
  }

  private generateFallbackOptions(offer: any, marketData: MarketAnalysis) {
    return [
      { option: 'Signing bonus', description: `Request $${Math.round(offer.baseSalary * 0.1).toLocaleString()} signing bonus`, likelihood: 'high' },
      { option: 'Equity increase', description: 'Request additional stock options or equity percentage', likelihood: 'medium' },
      { option: 'Flexible work', description: 'Negotiate remote work days or flexible hours', likelihood: 'high' },
      { option: 'Professional development', description: 'Request $5,000-10,000 annual learning budget', likelihood: 'high' },
      { option: 'Additional PTO', description: 'Request 5-10 additional vacation days', likelihood: 'medium' },
      { option: 'Title upgrade', description: 'Negotiate for senior-level title', likelihood: 'medium' }
    ];
  }
}

export const salaryNegotiationService = new SalaryNegotiationService();
