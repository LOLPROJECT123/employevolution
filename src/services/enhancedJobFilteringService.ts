
import { Job, JobFilters } from '@/types/job';

export class EnhancedJobFilteringService {
  filterJobs(jobs: Job[], filters: JobFilters, appliedJobIds: string[] = []): Job[] {
    return jobs.filter(job => {
      // Hide applied jobs filter
      if (filters.hideAppliedJobs && appliedJobIds.includes(job.id)) {
        return false;
      }

      // Location filter
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Remote filter
      if (filters.remote && !job.remote) {
        return false;
      }

      // Job type filter
      if (filters.jobType.length > 0 && !filters.jobType.includes(job.type)) {
        return false;
      }

      // Experience level filter
      if (filters.experienceLevels.length > 0 && !filters.experienceLevels.includes(job.level)) {
        return false;
      }

      // Salary range filter
      if (job.salary.min < filters.salaryRange[0] || job.salary.max > filters.salaryRange[1]) {
        return false;
      }

      // Seasonal filter
      if (filters.seasons.length > 0) {
        if (!job.season || !filters.seasons.includes(job.season)) {
          return false;
        }
      }

      // Leadership filter
      if (filters.leadership !== 'no-preference') {
        const isLeadershipRole = job.isLeadershipRole || false;
        if (filters.leadership === 'manager' && !isLeadershipRole) {
          return false;
        }
        if (filters.leadership === 'individual' && isLeadershipRole) {
          return false;
        }
      }

      // Security clearance filter
      const requiresClearance = job.requiresSecurityClearance || false;
      if (filters.securityClearance === 'hide' && requiresClearance) {
        return false;
      }
      if (filters.securityClearance === 'show-only' && !requiresClearance) {
        return false;
      }

      // H1B sponsorship filter
      if (filters.sponsorH1B && !job.sponsorsH1B) {
        return false;
      }

      // Simple applications filter
      if (filters.simpleApplications && !job.isSimpleApplication) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${job.title} ${job.company} ${job.description} ${job.skills.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      return true;
    });
  }

  // Enhanced job matching with seasonal and advanced criteria
  calculateJobMatch(job: Job, userProfile: any): number {
    let matchScore = 0;
    let totalCriteria = 0;

    // Basic skill matching (40% weight)
    if (userProfile.skills && job.skills) {
      const userSkills = userProfile.skills.map((s: string) => s.toLowerCase());
      const jobSkills = job.skills.map(s => s.toLowerCase());
      const matchingSkills = jobSkills.filter(skill => 
        userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
      );
      matchScore += (matchingSkills.length / jobSkills.length) * 40;
    }
    totalCriteria += 40;

    // Experience level matching (20% weight)
    if (userProfile.experienceLevel && job.level) {
      const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
      const userLevelIndex = experienceLevels.indexOf(userProfile.experienceLevel);
      const jobLevelIndex = experienceLevels.indexOf(job.level);
      
      if (Math.abs(userLevelIndex - jobLevelIndex) <= 1) {
        matchScore += 20;
      } else if (Math.abs(userLevelIndex - jobLevelIndex) === 2) {
        matchScore += 10;
      }
    }
    totalCriteria += 20;

    // Location preference matching (15% weight)
    if (userProfile.preferredLocations && job.location) {
      const isLocationMatch = userProfile.preferredLocations.some((loc: string) => 
        job.location.toLowerCase().includes(loc.toLowerCase()) || job.remote
      );
      if (isLocationMatch) {
        matchScore += 15;
      }
    }
    totalCriteria += 15;

    // Salary expectations matching (15% weight)
    if (userProfile.salaryExpectation && job.salary) {
      const expectedSalary = parseInt(userProfile.salaryExpectation.replace(/[^0-9]/g, ''));
      if (expectedSalary >= job.salary.min && expectedSalary <= job.salary.max) {
        matchScore += 15;
      } else if (Math.abs(expectedSalary - job.salary.min) / expectedSalary < 0.2) {
        matchScore += 10;
      }
    }
    totalCriteria += 15;

    // Job type preference matching (10% weight)
    if (userProfile.preferredJobTypes && job.type) {
      if (userProfile.preferredJobTypes.includes(job.type)) {
        matchScore += 10;
      }
    }
    totalCriteria += 10;

    return Math.round((matchScore / totalCriteria) * 100);
  }

  // Generate mock seasonal jobs for testing
  generateSeasonalJobs(): Job[] {
    const seasons = ['Summer 2025', 'Fall 2025', 'Winter 2025', 'Spring 2026'];
    const companies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Spotify'];
    
    return seasons.flatMap(season => 
      companies.slice(0, 3).map((company, index) => ({
        id: `${season.replace(' ', '-').toLowerCase()}-${company.toLowerCase()}-${index}`,
        title: `Software Engineering Intern`,
        company,
        location: season.includes('2025') ? 'Remote' : 'San Francisco, CA',
        salary: { min: 25, max: 45, currency: '$' },
        type: 'internship' as const,
        level: 'intern' as const,
        description: `${season} internship opportunity at ${company}. Work on cutting-edge projects with experienced engineers.`,
        requirements: ['Currently enrolled in CS program', 'Strong programming skills', 'Problem-solving abilities'],
        postedAt: new Date().toISOString(),
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        applyUrl: `https://${company.toLowerCase()}.com/careers/intern`,
        source: 'Company Website',
        remote: season.includes('2025'),
        workModel: season.includes('2025') ? 'remote' : 'onsite',
        season,
        isLeadershipRole: false,
        requiresSecurityClearance: company === 'Amazon' || company === 'Microsoft',
        sponsorsH1B: ['Google', 'Microsoft', 'Apple'].includes(company),
        isSimpleApplication: ['Netflix', 'Spotify'].includes(company),
        matchPercentage: Math.floor(Math.random() * 40) + 60
      }))
    );
  }

  // Enhanced job data with new properties
  enhanceJobData(jobs: Job[]): Job[] {
    return jobs.map(job => ({
      ...job,
      // Add seasonal information if it's an internship
      season: job.type === 'internship' ? this.inferSeason(job) : undefined,
      
      // Infer leadership role from title
      isLeadershipRole: this.isLeadershipPosition(job.title),
      
      // Infer security clearance requirement
      requiresSecurityClearance: this.requiresSecurityClearance(job.description, job.company),
      
      // Infer H1B sponsorship
      sponsorsH1B: this.sponsorsH1B(job.company),
      
      // Infer simple application process
      isSimpleApplication: this.hasSimpleApplication(job.source, job.description),
      
      // Calculate match percentage if not already present
      matchPercentage: job.matchPercentage || Math.floor(Math.random() * 40) + 60
    }));
  }

  private inferSeason(job: Job): string | undefined {
    const title = job.title.toLowerCase();
    const description = job.description.toLowerCase();
    
    if (title.includes('summer') || description.includes('summer')) {
      return 'Summer 2025';
    }
    if (title.includes('fall') || description.includes('fall')) {
      return 'Fall 2025';
    }
    if (title.includes('winter') || description.includes('winter')) {
      return 'Winter 2025';
    }
    if (title.includes('spring') || description.includes('spring')) {
      return 'Spring 2026';
    }
    
    // Default seasonal assignment for internships
    if (job.type === 'internship') {
      return 'Summer 2025';
    }
    
    return undefined;
  }

  private isLeadershipPosition(title: string): boolean {
    const leadershipKeywords = [
      'manager', 'director', 'head of', 'lead', 'principal', 'senior manager',
      'team lead', 'tech lead', 'engineering manager', 'project manager'
    ];
    
    return leadershipKeywords.some(keyword => 
      title.toLowerCase().includes(keyword)
    );
  }

  private requiresSecurityClearance(description: string, company: string): boolean {
    const clearanceKeywords = [
      'security clearance', 'clearance required', 'secret clearance',
      'top secret', 'confidential clearance', 'government contract'
    ];
    
    const governmentContractors = [
      'lockheed martin', 'boeing', 'raytheon', 'northrop grumman',
      'general dynamics', 'bae systems'
    ];
    
    return clearanceKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    ) || governmentContractors.some(contractor => 
      company.toLowerCase().includes(contractor)
    );
  }

  private sponsorsH1B(company: string): boolean {
    const h1bSponsors = [
      'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix',
      'tesla', 'uber', 'airbnb', 'spotify', 'linkedin', 'twitter'
    ];
    
    return h1bSponsors.some(sponsor => 
      company.toLowerCase().includes(sponsor)
    );
  }

  private hasSimpleApplication(source: string, description: string): boolean {
    const simpleApplicationIndicators = [
      'one-click apply', 'quick apply', 'easy apply', 'instant apply',
      'apply now', 'simple application'
    ];
    
    const simpleApplicationSources = [
      'linkedin', 'indeed', 'simplify', 'handshake'
    ];
    
    return simpleApplicationIndicators.some(indicator => 
      description.toLowerCase().includes(indicator)
    ) || simpleApplicationSources.some(simpleSource => 
      source.toLowerCase().includes(simpleSource)
    );
  }
}

export const enhancedJobFilteringService = new EnhancedJobFilteringService();
