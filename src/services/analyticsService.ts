
interface JobApplicationMetrics {
  totalApplications: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  averageResponseTime: number;
  applicationsByStatus: Record<string, number>;
  applicationsByMonth: Array<{ month: string; count: number }>;
  topCompanies: Array<{ company: string; applications: number; responseRate: number }>;
  topJobTitles: Array<{ title: string; applications: number; successRate: number }>;
  salaryRanges: Array<{ range: string; count: number; averageOffer: number }>;
}

interface JobSearchMetrics {
  totalSearches: number;
  averageSearchResults: number;
  clickThroughRate: number;
  saveRate: number;
  popularKeywords: Array<{ keyword: string; searches: number; successRate: number }>;
  popularLocations: Array<{ location: string; searches: number; avgSalary: number }>;
  searchTrends: Array<{ date: string; searches: number; applications: number }>;
}

interface MarketInsights {
  salaryTrends: Array<{ jobTitle: string; avgSalary: number; growth: number }>;
  demandBySkill: Array<{ skill: string; jobCount: number; growth: number }>;
  industryGrowth: Array<{ industry: string; jobCount: number; growth: number }>;
  competitiveAnalysis: Array<{ company: string; openPositions: number; avgSalary: number }>;
  locationTrends: Array<{ location: string; jobCount: number; avgSalary: number; costOfLiving: number }>;
}

interface UserPerformanceMetrics {
  profileCompleteness: number;
  resumeViews: number;
  profileViews: number;
  networkConnections: number;
  skillsMatchRate: number;
  marketValue: number;
  recommendations: string[];
}

class AnalyticsService {
  private applicationData: any[] = [];
  private searchData: any[] = [];
  private marketData: any[] = [];

  constructor() {
    this.loadMockData();
  }

  private loadMockData(): void {
    // Generate mock application data
    this.applicationData = this.generateMockApplicationData();
    this.searchData = this.generateMockSearchData();
    this.marketData = this.generateMockMarketData();
  }

  private generateMockApplicationData(): any[] {
    const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb'];
    const jobTitles = ['Software Engineer', 'Data Scientist', 'Product Manager', 'DevOps Engineer', 'UI/UX Designer'];
    const statuses = ['applied', 'reviewed', 'interview', 'offer', 'rejected'];

    const data = [];
    for (let i = 0; i < 100; i++) {
      const appliedDate = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
      data.push({
        id: `app-${i}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        jobTitle: jobTitles[Math.floor(Math.random() * jobTitles.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        appliedDate,
        responseDate: Math.random() > 0.3 ? new Date(appliedDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000) : null,
        salary: 80000 + Math.random() * 120000,
        location: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Remote'][Math.floor(Math.random() * 5)]
      });
    }
    return data;
  }

  private generateMockSearchData(): any[] {
    const keywords = ['software engineer', 'data scientist', 'product manager', 'frontend developer', 'backend engineer'];
    const locations = ['San Francisco', 'New York', 'Seattle', 'Austin', 'Remote'];

    const data = [];
    for (let i = 0; i < 500; i++) {
      const searchDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      data.push({
        id: `search-${i}`,
        keyword: keywords[Math.floor(Math.random() * keywords.length)],
        location: locations[Math.floor(Math.random() * locations.length)],
        resultsCount: Math.floor(Math.random() * 100) + 10,
        clickedJobs: Math.floor(Math.random() * 10),
        savedJobs: Math.floor(Math.random() * 5),
        appliedJobs: Math.floor(Math.random() * 3),
        searchDate
      });
    }
    return data;
  }

  private generateMockMarketData(): any[] {
    return [
      { jobTitle: 'Software Engineer', avgSalary: 145000, growth: 15.2 },
      { jobTitle: 'Data Scientist', avgSalary: 135000, growth: 22.1 },
      { jobTitle: 'Product Manager', avgSalary: 155000, growth: 8.7 },
      { jobTitle: 'DevOps Engineer', avgSalary: 140000, growth: 18.5 },
      { jobTitle: 'UI/UX Designer', avgSalary: 125000, growth: 12.3 }
    ];
  }

  getJobApplicationMetrics(): JobApplicationMetrics {
    const totalApplications = this.applicationData.length;
    const responsesReceived = this.applicationData.filter(app => app.responseDate).length;
    const interviews = this.applicationData.filter(app => app.status === 'interview' || app.status === 'offer').length;
    const offers = this.applicationData.filter(app => app.status === 'offer').length;

    const responseRate = totalApplications > 0 ? (responsesReceived / totalApplications) * 100 : 0;
    const interviewRate = totalApplications > 0 ? (interviews / totalApplications) * 100 : 0;
    const offerRate = totalApplications > 0 ? (offers / totalApplications) * 100 : 0;

    // Calculate average response time
    const responseTimes = this.applicationData
      .filter(app => app.responseDate)
      .map(app => app.responseDate.getTime() - app.appliedDate.getTime());
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (24 * 60 * 60 * 1000)
      : 0;

    // Group applications by status
    const applicationsByStatus = this.applicationData.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group applications by month
    const applicationsByMonth = this.groupByMonth(this.applicationData, 'appliedDate');

    // Top companies
    const topCompanies = this.getTopCompanies();

    // Top job titles
    const topJobTitles = this.getTopJobTitles();

    // Salary ranges
    const salaryRanges = this.getSalaryRanges();

    return {
      totalApplications,
      responseRate,
      interviewRate,
      offerRate,
      averageResponseTime,
      applicationsByStatus,
      applicationsByMonth,
      topCompanies,
      topJobTitles,
      salaryRanges
    };
  }

  getJobSearchMetrics(): JobSearchMetrics {
    const totalSearches = this.searchData.length;
    const totalResults = this.searchData.reduce((sum, search) => sum + search.resultsCount, 0);
    const averageSearchResults = totalSearches > 0 ? totalResults / totalSearches : 0;

    const totalClicks = this.searchData.reduce((sum, search) => sum + search.clickedJobs, 0);
    const clickThroughRate = totalResults > 0 ? (totalClicks / totalResults) * 100 : 0;

    const totalSaves = this.searchData.reduce((sum, search) => sum + search.savedJobs, 0);
    const saveRate = totalClicks > 0 ? (totalSaves / totalClicks) * 100 : 0;

    const popularKeywords = this.getPopularKeywords();
    const popularLocations = this.getPopularLocations();
    const searchTrends = this.getSearchTrends();

    return {
      totalSearches,
      averageSearchResults,
      clickThroughRate,
      saveRate,
      popularKeywords,
      popularLocations,
      searchTrends
    };
  }

  getMarketInsights(): MarketInsights {
    return {
      salaryTrends: this.marketData,
      demandBySkill: this.getDemandBySkill(),
      industryGrowth: this.getIndustryGrowth(),
      competitiveAnalysis: this.getCompetitiveAnalysis(),
      locationTrends: this.getLocationTrends()
    };
  }

  getUserPerformanceMetrics(): UserPerformanceMetrics {
    return {
      profileCompleteness: 85,
      resumeViews: 156,
      profileViews: 89,
      networkConnections: 234,
      skillsMatchRate: 72,
      marketValue: 145000,
      recommendations: [
        'Add more technical skills to your profile',
        'Update your work experience with recent projects',
        'Get recommendations from former colleagues',
        'Consider taking courses in emerging technologies'
      ]
    };
  }

  private groupByMonth(data: any[], dateField: string): Array<{ month: string; count: number }> {
    const grouped = data.reduce((acc, item) => {
      const month = item[dateField].toISOString().slice(0, 7); // YYYY-MM format
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  }

  private getTopCompanies(): Array<{ company: string; applications: number; responseRate: number }> {
    const companyStats = this.applicationData.reduce((acc, app) => {
      if (!acc[app.company]) {
        acc[app.company] = { applications: 0, responses: 0 };
      }
      acc[app.company].applications++;
      if (app.responseDate) {
        acc[app.company].responses++;
      }
      return acc;
    }, {} as Record<string, { applications: number; responses: number }>);

    return Object.entries(companyStats)
      .map(([company, stats]) => ({
        company,
        applications: stats.applications,
        responseRate: stats.applications > 0 ? (stats.responses / stats.applications) * 100 : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);
  }

  private getTopJobTitles(): Array<{ title: string; applications: number; successRate: number }> {
    const titleStats = this.applicationData.reduce((acc, app) => {
      if (!acc[app.jobTitle]) {
        acc[app.jobTitle] = { applications: 0, successes: 0 };
      }
      acc[app.jobTitle].applications++;
      if (app.status === 'offer' || app.status === 'interview') {
        acc[app.jobTitle].successes++;
      }
      return acc;
    }, {} as Record<string, { applications: number; successes: number }>);

    return Object.entries(titleStats)
      .map(([title, stats]) => ({
        title,
        applications: stats.applications,
        successRate: stats.applications > 0 ? (stats.successes / stats.applications) * 100 : 0
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 10);
  }

  private getSalaryRanges(): Array<{ range: string; count: number; averageOffer: number }> {
    const ranges = [
      { min: 0, max: 80000, label: 'Under $80k' },
      { min: 80000, max: 120000, label: '$80k - $120k' },
      { min: 120000, max: 160000, label: '$120k - $160k' },
      { min: 160000, max: 200000, label: '$160k - $200k' },
      { min: 200000, max: Infinity, label: 'Over $200k' }
    ];

    return ranges.map(range => {
      const applicationsInRange = this.applicationData.filter(
        app => app.salary >= range.min && app.salary < range.max
      );
      const offers = applicationsInRange.filter(app => app.status === 'offer');
      const averageOffer = offers.length > 0
        ? offers.reduce((sum, app) => sum + app.salary, 0) / offers.length
        : 0;

      return {
        range: range.label,
        count: applicationsInRange.length,
        averageOffer
      };
    });
  }

  private getPopularKeywords(): Array<{ keyword: string; searches: number; successRate: number }> {
    const keywordStats = this.searchData.reduce((acc, search) => {
      if (!acc[search.keyword]) {
        acc[search.keyword] = { searches: 0, applications: 0 };
      }
      acc[search.keyword].searches++;
      acc[search.keyword].applications += search.appliedJobs;
      return acc;
    }, {} as Record<string, { searches: number; applications: number }>);

    return Object.entries(keywordStats)
      .map(([keyword, stats]) => ({
        keyword,
        searches: stats.searches,
        successRate: stats.searches > 0 ? (stats.applications / stats.searches) * 100 : 0
      }))
      .sort((a, b) => b.searches - a.searches);
  }

  private getPopularLocations(): Array<{ location: string; searches: number; avgSalary: number }> {
    const locationStats = this.searchData.reduce((acc, search) => {
      if (!acc[search.location]) {
        acc[search.location] = { searches: 0, totalSalary: 0, salaryCount: 0 };
      }
      acc[search.location].searches++;
      
      // Get salary data from applications in this location
      const applicationsInLocation = this.applicationData.filter(app => app.location === search.location);
      applicationsInLocation.forEach(app => {
        acc[search.location].totalSalary += app.salary;
        acc[search.location].salaryCount++;
      });
      
      return acc;
    }, {} as Record<string, { searches: number; totalSalary: number; salaryCount: number }>);

    return Object.entries(locationStats)
      .map(([location, stats]) => ({
        location,
        searches: stats.searches,
        avgSalary: stats.salaryCount > 0 ? stats.totalSalary / stats.salaryCount : 0
      }))
      .sort((a, b) => b.searches - a.searches);
  }

  private getSearchTrends(): Array<{ date: string; searches: number; applications: number }> {
    const trends = this.searchData.reduce((acc, search) => {
      const date = search.searchDate.toISOString().slice(0, 10); // YYYY-MM-DD format
      if (!acc[date]) {
        acc[date] = { searches: 0, applications: 0 };
      }
      acc[date].searches++;
      acc[date].applications += search.appliedJobs;
      return acc;
    }, {} as Record<string, { searches: number; applications: number }>);

    return Object.entries(trends)
      .map(([date, stats]) => ({ date, ...stats }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days
  }

  private getDemandBySkill(): Array<{ skill: string; jobCount: number; growth: number }> {
    return [
      { skill: 'JavaScript', jobCount: 1250, growth: 12.5 },
      { skill: 'Python', jobCount: 1180, growth: 18.3 },
      { skill: 'React', jobCount: 980, growth: 15.7 },
      { skill: 'Node.js', jobCount: 850, growth: 13.2 },
      { skill: 'AWS', jobCount: 920, growth: 22.1 },
      { skill: 'Docker', jobCount: 680, growth: 19.8 },
      { skill: 'Kubernetes', jobCount: 520, growth: 28.5 },
      { skill: 'TypeScript', jobCount: 780, growth: 25.3 }
    ].sort((a, b) => b.jobCount - a.jobCount);
  }

  private getIndustryGrowth(): Array<{ industry: string; jobCount: number; growth: number }> {
    return [
      { industry: 'Technology', jobCount: 5420, growth: 16.8 },
      { industry: 'Healthcare', jobCount: 3250, growth: 12.3 },
      { industry: 'Finance', jobCount: 2890, growth: 8.7 },
      { industry: 'E-commerce', jobCount: 2150, growth: 24.1 },
      { industry: 'Education', jobCount: 1780, growth: 11.2 },
      { industry: 'Gaming', jobCount: 1450, growth: 19.5 }
    ].sort((a, b) => b.jobCount - a.jobCount);
  }

  private getCompetitiveAnalysis(): Array<{ company: string; openPositions: number; avgSalary: number }> {
    return [
      { company: 'Google', openPositions: 1250, avgSalary: 175000 },
      { company: 'Microsoft', openPositions: 980, avgSalary: 165000 },
      { company: 'Apple', openPositions: 850, avgSalary: 170000 },
      { company: 'Amazon', openPositions: 1450, avgSalary: 155000 },
      { company: 'Meta', openPositions: 720, avgSalary: 180000 },
      { company: 'Netflix', openPositions: 380, avgSalary: 190000 }
    ].sort((a, b) => b.openPositions - a.openPositions);
  }

  private getLocationTrends(): Array<{ location: string; jobCount: number; avgSalary: number; costOfLiving: number }> {
    return [
      { location: 'San Francisco', jobCount: 2850, avgSalary: 185000, costOfLiving: 180 },
      { location: 'New York', jobCount: 2450, avgSalary: 165000, costOfLiving: 160 },
      { location: 'Seattle', jobCount: 1890, avgSalary: 155000, costOfLiving: 140 },
      { location: 'Austin', jobCount: 1250, avgSalary: 135000, costOfLiving: 110 },
      { location: 'Remote', jobCount: 3200, avgSalary: 145000, costOfLiving: 100 }
    ].sort((a, b) => b.jobCount - a.jobCount);
  }

  exportAnalytics(format: 'json' | 'csv'): string {
    const data = {
      applications: this.getJobApplicationMetrics(),
      searches: this.getJobSearchMetrics(),
      market: this.getMarketInsights(),
      performance: this.getUserPerformanceMetrics(),
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format
      return this.convertToCSV(data);
    }
  }

  private convertToCSV(data: any): string {
    // Simplified CSV conversion - in a real implementation, this would be more comprehensive
    const applications = data.applications.topCompanies.map((company: any) => 
      `${company.company},${company.applications},${company.responseRate.toFixed(1)}%`
    ).join('\n');

    return `Company,Applications,Response Rate\n${applications}`;
  }
}

export const analyticsService = new AnalyticsService();
