import { enhancedApplicationService } from './enhancedApplicationService';
import { Job } from '@/types/job';
import { ApplicationStatus } from '@/types/auth';

interface ApplicationAnalytics {
  overview: {
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;
    avgResponseTime: number;
    activeApplications: number;
  };
  trends: {
    applicationsOverTime: { date: string; count: number }[];
    responseRateOverTime: { date: string; rate: number }[];
    statusDistribution: { status: ApplicationStatus; count: number; percentage: number }[];
  };
  insights: {
    topPerformingSkills: { skill: string; responseRate: number; applications: number }[];
    bestCompanyTypes: { type: string; successRate: number; applications: number }[];
    optimalApplicationTiming: { dayOfWeek: string; successRate: number }[];
    salaryAnalysis: {
      avgOfferedSalary: number;
      salaryRangeDistribution: { range: string; count: number }[];
    };
  };
  recommendations: string[];
  benchmarks: {
    industryAvgResponseRate: number;
    industryAvgInterviewRate: number;
    industryAvgOfferRate: number;
    yourPerformanceVsIndustry: {
      responseRate: 'above' | 'below' | 'average';
      interviewRate: 'above' | 'below' | 'average';
      offerRate: 'above' | 'below' | 'average';
    };
  };
}

interface TimeSeriesData {
  date: string;
  applications: number;
  responses: number;
  interviews: number;
  offers: number;
}

class AnalyticsService {
  // Generate comprehensive analytics for a user
  generateApplicationAnalytics(userId: string): ApplicationAnalytics {
    const applications = enhancedApplicationService.getUserApplications(userId);
    const basicMetrics = enhancedApplicationService.getApplicationMetrics(userId);
    
    return {
      overview: this.generateOverviewMetrics(applications, basicMetrics),
      trends: this.generateTrendAnalysis(applications),
      insights: this.generateInsights(applications),
      recommendations: this.generateRecommendations(applications, basicMetrics),
      benchmarks: this.generateBenchmarks(basicMetrics)
    };
  }

  private generateOverviewMetrics(applications: any[], basicMetrics: any) {
    const activeStatuses = ['applied', 'phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received'];
    const activeApplications = applications.filter(app => activeStatuses.includes(app.status)).length;

    return {
      totalApplications: basicMetrics.totalApplications,
      responseRate: basicMetrics.responseRate,
      interviewRate: basicMetrics.interviewRate,
      offerRate: basicMetrics.offerRate,
      avgResponseTime: basicMetrics.avgResponseTime,
      activeApplications
    };
  }

  private generateBenchmarks(metrics: any) {
    // Industry benchmark data (these would be real industry averages in production)
    const industryBenchmarks = {
      responseRate: 25,
      interviewRate: 15,
      offerRate: 8
    };

    const compareToIndustry = (userRate: number, industryRate: number): 'above' | 'below' | 'average' => {
      if (userRate > industryRate * 1.1) return 'above';
      if (userRate < industryRate * 0.9) return 'below';
      return 'average';
    };

    return {
      industryAvgResponseRate: industryBenchmarks.responseRate,
      industryAvgInterviewRate: industryBenchmarks.interviewRate,
      industryAvgOfferRate: industryBenchmarks.offerRate,
      yourPerformanceVsIndustry: {
        responseRate: compareToIndustry(metrics.responseRate, industryBenchmarks.responseRate),
        interviewRate: compareToIndustry(metrics.interviewRate, industryBenchmarks.interviewRate),
        offerRate: compareToIndustry(metrics.offerRate, industryBenchmarks.offerRate)
      }
    };
  }

  private generateTrendAnalysis(applications: any[]) {
    // Generate time series data for the last 30 days
    const timeSeriesData = this.generateTimeSeriesData(applications, 30);
    
    const applicationsOverTime = timeSeriesData.map(data => ({
      date: data.date,
      count: data.applications
    }));

    const responseRateOverTime = timeSeriesData.map(data => ({
      date: data.date,
      rate: data.applications > 0 ? (data.responses / data.applications) * 100 : 0
    }));

    const statusCounts = this.calculateStatusDistribution(applications);
    const total = applications.length;
    const statusDistribution = statusCounts.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0
    }));

    return {
      applicationsOverTime,
      responseRateOverTime,
      statusDistribution
    };
  }

  private generateTimeSeriesData(applications: any[], days: number): TimeSeriesData[] {
    const now = new Date();
    const data: TimeSeriesData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];

      const dayApplications = applications.filter(app => {
        const appDate = new Date(app.applied_at).toISOString().split('T')[0];
        return appDate === dateString;
      });

      const responses = dayApplications.filter(app => 
        ['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
      ).length;

      const interviews = dayApplications.filter(app => 
        ['interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
      ).length;

      const offers = dayApplications.filter(app => 
        ['offer_received', 'offer_accepted'].includes(app.status)
      ).length;

      data.push({
        date: dateString,
        applications: dayApplications.length,
        responses,
        interviews,
        offers
      });
    }

    return data;
  }

  private calculateStatusDistribution(applications: any[]) {
    const statusCounts: Record<ApplicationStatus, number> = {
      applied: 0,
      phone_screen: 0,
      interview_scheduled: 0,
      interview_completed: 0,
      offer_received: 0,
      offer_accepted: 0,
      rejected: 0,
      withdrawn: 0
    };

    applications.forEach(app => {
      statusCounts[app.status as ApplicationStatus]++;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status as ApplicationStatus,
      count
    }));
  }

  private generateInsights(applications: any[]) {
    return {
      topPerformingSkills: this.analyzeSkillPerformance(applications),
      bestCompanyTypes: this.analyzeCompanyTypePerformance(applications),
      optimalApplicationTiming: this.analyzeApplicationTiming(applications),
      salaryAnalysis: this.analyzeSalaryData(applications)
    };
  }

  private analyzeSkillPerformance(applications: any[]) {
    // This would analyze which skills in job descriptions correlate with higher response rates
    // For now, returning mock data based on common tech skills
    const mockSkillData = [
      { skill: 'React', responseRate: 45, applications: 15 },
      { skill: 'Python', responseRate: 42, applications: 12 },
      { skill: 'TypeScript', responseRate: 38, applications: 8 },
      { skill: 'AWS', responseRate: 35, applications: 10 },
      { skill: 'Node.js', responseRate: 33, applications: 9 }
    ];

    return mockSkillData.sort((a, b) => b.responseRate - a.responseRate).slice(0, 5);
  }

  private analyzeCompanyTypePerformance(applications: any[]) {
    const companyTypeData: Record<string, { total: number; successful: number }> = {};

    applications.forEach(app => {
      // Mock company type extraction (in real implementation, this would come from job data)
      const companyType = this.inferCompanyType(app);
      
      if (!companyTypeData[companyType]) {
        companyTypeData[companyType] = { total: 0, successful: 0 };
      }
      
      companyTypeData[companyType].total++;
      
      if (['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)) {
        companyTypeData[companyType].successful++;
      }
    });

    return Object.entries(companyTypeData)
      .map(([type, data]) => ({
        type,
        successRate: data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0,
        applications: data.total
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
  }

  private inferCompanyType(application: any): string {
    // Mock company type inference based on application data
    const types = ['Startup', 'Mid-size', 'Enterprise', 'Non-profit', 'Government'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private analyzeApplicationTiming(applications: any[]) {
    const dayPerformance: Record<string, { total: number; successful: number }> = {
      'Monday': { total: 0, successful: 0 },
      'Tuesday': { total: 0, successful: 0 },
      'Wednesday': { total: 0, successful: 0 },
      'Thursday': { total: 0, successful: 0 },
      'Friday': { total: 0, successful: 0 },
      'Saturday': { total: 0, successful: 0 },
      'Sunday': { total: 0, successful: 0 }
    };

    applications.forEach(app => {
      const dayOfWeek = new Date(app.applied_at).toLocaleDateString('en-US', { weekday: 'long' });
      
      dayPerformance[dayOfWeek].total++;
      
      if (['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)) {
        dayPerformance[dayOfWeek].successful++;
      }
    });

    return Object.entries(dayPerformance)
      .map(([dayOfWeek, data]) => ({
        dayOfWeek,
        successRate: data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0
      }))
      .sort((a, b) => b.successRate - a.successRate);
  }

  private analyzeSalaryData(applications: any[]) {
    const salaryOffers = applications
      .filter(app => app.salary_offered)
      .map(app => app.salary_offered);

    const avgOfferedSalary = salaryOffers.length > 0 
      ? Math.round(salaryOffers.reduce((sum, salary) => sum + salary, 0) / salaryOffers.length)
      : 0;

    // Group salaries into ranges
    const ranges = [
      { range: '< $60k', min: 0, max: 60000 },
      { range: '$60k - $80k', min: 60000, max: 80000 },
      { range: '$80k - $100k', min: 80000, max: 100000 },
      { range: '$100k - $120k', min: 100000, max: 120000 },
      { range: '$120k - $150k', min: 120000, max: 150000 },
      { range: '> $150k', min: 150000, max: Infinity }
    ];

    const salaryRangeDistribution = ranges.map(range => ({
      range: range.range,
      count: salaryOffers.filter(salary => salary >= range.min && salary < range.max).length
    }));

    return {
      avgOfferedSalary,
      salaryRangeDistribution
    };
  }

  private generateRecommendations(applications: any[], metrics: any): string[] {
    const recommendations: string[] = [];

    if (metrics.responseRate < 20) {
      recommendations.push("Consider improving your resume and cover letter - your response rate is below average");
      recommendations.push("Focus on applying to jobs that match your skills more closely");
    } else if (metrics.responseRate < 35) {
      recommendations.push("Your response rate is decent but could be improved with more targeted applications");
    } else {
      recommendations.push("Great response rate! You're doing well with targeting relevant positions");
    }

    if (metrics.interviewRate < 10) {
      recommendations.push("Work on your application materials to convert more responses to interviews");
    }

    if (applications.length < 10) {
      recommendations.push("Consider applying to more positions to increase your chances of success");
    } else if (applications.length > 50) {
      recommendations.push("You're applying to many positions - consider being more selective for better results");
    }

    const recentApplications = applications.filter(app => {
      const appDate = new Date(app.applied_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return appDate > weekAgo;
    });

    if (recentApplications.length < 3) {
      recommendations.push("Consider increasing your application frequency to maintain momentum");
    }

    return recommendations;
  }

  // Generate weekly/monthly reports
  generatePeriodicReport(userId: string, period: 'week' | 'month'): {
    period: string;
    summary: string;
    keyMetrics: Record<string, number>;
    achievements: string[];
    areasForImprovement: string[];
  } {
    const applications = enhancedApplicationService.getUserApplications(userId);
    const now = new Date();
    const periodStart = new Date();
    
    if (period === 'week') {
      periodStart.setDate(now.getDate() - 7);
    } else {
      periodStart.setMonth(now.getMonth() - 1);
    }

    const periodApplications = applications.filter(app => 
      new Date(app.applied_at) >= periodStart
    );

    const responses = periodApplications.filter(app => 
      ['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    const interviews = periodApplications.filter(app => 
      ['interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    const offers = periodApplications.filter(app => 
      ['offer_received', 'offer_accepted'].includes(app.status)
    ).length;

    const responseRate = periodApplications.length > 0 ? (responses / periodApplications.length) * 100 : 0;

    return {
      period: period === 'week' ? 'This Week' : 'This Month',
      summary: `You applied to ${periodApplications.length} jobs this ${period} with a ${responseRate.toFixed(1)}% response rate.`,
      keyMetrics: {
        applications: periodApplications.length,
        responses,
        interviews,
        offers,
        responseRate: Math.round(responseRate * 10) / 10
      },
      achievements: this.generateAchievements(periodApplications, period),
      areasForImprovement: this.generateImprovementAreas(periodApplications, responseRate)
    };
  }

  private generateAchievements(applications: any[], period: string): string[] {
    const achievements: string[] = [];
    
    if (applications.length >= 10) {
      achievements.push(`Applied to ${applications.length} jobs this ${period} - great activity level!`);
    }
    
    const responses = applications.filter(app => 
      ['phone_screen', 'interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;
    
    if (responses > 0) {
      achievements.push(`Received ${responses} positive responses - your applications are getting noticed!`);
    }
    
    const interviews = applications.filter(app => 
      ['interview_scheduled', 'interview_completed', 'offer_received', 'offer_accepted'].includes(app.status)
    ).length;
    
    if (interviews > 0) {
      achievements.push(`Secured ${interviews} interviews - your profile is compelling to employers!`);
    }
    
    return achievements;
  }

  private generateImprovementAreas(applications: any[], responseRate: number): string[] {
    const improvements: string[] = [];
    
    if (responseRate < 15) {
      improvements.push("Focus on tailoring your applications to better match job requirements");
      improvements.push("Consider reviewing and updating your resume and cover letter");
    }
    
    if (applications.length < 5) {
      improvements.push("Consider increasing your application volume to improve chances");
    }
    
    if (applications.length > 20 && responseRate < 10) {
      improvements.push("Quality over quantity - focus on more targeted applications");
    }
    
    return improvements;
  }
}

export const analyticsService = new AnalyticsService();
