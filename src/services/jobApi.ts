
import { Job } from '@/types/job';

export interface JobSearchParams {
  query: string;
  location?: string;
  remote?: boolean;
  salary_min?: number;
  salary_max?: number;
  job_type?: string;
  experience_level?: string;
  company?: string;
  posted_days?: number;
  page?: number;
  limit?: number;
}

export interface JobApiResponse {
  jobs: Job[];
  total: number;
  page: number;
  has_more: boolean;
}

class JobApiService {
  private baseUrl = '/api/jobs'; // This would be your backend API

  async searchJobs(params: JobSearchParams): Promise<JobApiResponse> {
    try {
      // For now, we'll simulate API calls with enhanced mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      
      const mockJobs = this.generateEnhancedMockJobs(params);
      
      return {
        jobs: mockJobs,
        total: mockJobs.length,
        page: params.page || 1,
        has_more: mockJobs.length >= (params.limit || 20)
      };
    } catch (error) {
      console.error('Job search failed:', error);
      throw new Error('Failed to fetch jobs. Please try again.');
    }
  }

  async getJobDetails(jobId: string): Promise<Job | null> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate fetching detailed job information
      const job = this.generateDetailedMockJob(jobId);
      return job;
    } catch (error) {
      console.error('Failed to fetch job details:', error);
      return null;
    }
  }

  async checkJobAvailability(jobUrl: string): Promise<boolean> {
    try {
      // Simulate checking if job is still available
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 95% of jobs are available in our simulation
      return Math.random() > 0.05;
    } catch (error) {
      console.error('Failed to check job availability:', error);
      return false;
    }
  }

  private generateEnhancedMockJobs(params: JobSearchParams): Job[] {
    const companies = [
      { name: 'Google', rating: 4.5, size: 'large', logo: '/api/placeholder/40/40' },
      { name: 'Microsoft', rating: 4.4, size: 'large', logo: '/api/placeholder/40/40' },
      { name: 'Apple', rating: 4.3, size: 'large', logo: '/api/placeholder/40/40' },
      { name: 'Amazon', rating: 4.1, size: 'large', logo: '/api/placeholder/40/40' },
      { name: 'Meta', rating: 4.2, size: 'large', logo: '/api/placeholder/40/40' },
      { name: 'Netflix', rating: 4.3, size: 'mid-size', logo: '/api/placeholder/40/40' },
      { name: 'Uber', rating: 3.9, size: 'mid-size', logo: '/api/placeholder/40/40' },
      { name: 'Airbnb', rating: 4.2, size: 'mid-size', logo: '/api/placeholder/40/40' },
      { name: 'Stripe', rating: 4.6, size: 'mid-size', logo: '/api/placeholder/40/40' },
      { name: 'Figma', rating: 4.7, size: 'early', logo: '/api/placeholder/40/40' }
    ];

    const jobTitles = [
      'Senior Software Engineer',
      'Product Manager',
      'Data Scientist',
      'UX Designer',
      'DevOps Engineer',
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Machine Learning Engineer',
      'QA Engineer',
      'Technical Lead',
      'Engineering Manager'
    ];

    const skills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
      'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'PostgreSQL', 'MongoDB',
      'Machine Learning', 'Data Analysis', 'UI/UX Design', 'Agile', 'Scrum'
    ];

    const locations = [
      'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX',
      'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO',
      'Atlanta, GA', 'Remote', 'Hybrid'
    ];

    const jobs: Job[] = [];
    const jobCount = params.limit || 20;

    for (let i = 0; i < jobCount; i++) {
      const company = companies[Math.floor(Math.random() * companies.length)];
      const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const isRemote = location === 'Remote' || location === 'Hybrid';
      
      const baseSalary = 80000 + Math.floor(Math.random() * 150000);
      const salaryRange = {
        min: baseSalary,
        max: baseSalary + Math.floor(Math.random() * 50000),
        currency: '$'
      };

      const jobSkills = skills.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 6) + 3);
      
      const postedDaysAgo = Math.floor(Math.random() * 30);
      const postedAt = new Date();
      postedAt.setDate(postedAt.getDate() - postedDaysAgo);

      const job: Job = {
        id: `job-${Date.now()}-${i}`,
        title,
        company: company.name,
        location,
        salary: salaryRange,
        type: ['full-time', 'part-time', 'contract'][Math.floor(Math.random() * 3)] as Job['type'],
        level: ['entry', 'mid', 'senior', 'lead'][Math.floor(Math.random() * 4)] as Job['level'],
        description: `We are looking for a talented ${title} to join our ${company.name} team. This role offers exciting opportunities to work on cutting-edge projects and make a significant impact.`,
        requirements: [
          `Bachelor's degree in Computer Science or related field`,
          `${Math.floor(Math.random() * 5) + 1}+ years of experience`,
          `Proficiency in ${jobSkills.slice(0, 3).join(', ')}`,
          `Experience with ${jobSkills.slice(3, 5).join(' and ')}`,
          `Strong problem-solving and communication skills`
        ],
        postedAt: postedAt.toISOString(),
        skills: jobSkills,
        matchPercentage: Math.floor(Math.random() * 40) + 60, // 60-100% match
        remote: isRemote,
        applyUrl: `https://${company.name.toLowerCase()}.com/jobs/${Date.now()}`,
        source: ['LinkedIn', 'Indeed', 'Glassdoor', 'Company Website'][Math.floor(Math.random() * 4)],
        applicationDetails: {
          applicantCount: Math.floor(Math.random() * 200) + 10,
          isAvailable: Math.random() > 0.05, // 95% availability
          platform: 'web'
        },
        // Enhanced properties
        companyType: 'private',
        companySize: company.size as Job['companySize'],
        workModel: isRemote ? (location === 'Remote' ? 'remote' : 'hybrid') : 'onsite',
        benefits: [
          'Health Insurance',
          'Dental Insurance',
          '401(k) Matching',
          'Flexible PTO',
          'Remote Work Options',
          'Professional Development Budget'
        ].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2),
        responsibilities: [
          `Design and develop ${jobSkills[0]} applications`,
          `Collaborate with cross-functional teams`,
          `Participate in code reviews and technical discussions`,
          `Mentor junior team members`,
          `Contribute to technical architecture decisions`
        ]
      };

      jobs.push(job);
    }

    return jobs.filter(job => {
      // Apply search filters
      if (params.query && !job.title.toLowerCase().includes(params.query.toLowerCase()) &&
          !job.company.toLowerCase().includes(params.query.toLowerCase())) {
        return false;
      }
      
      if (params.location && !job.location.toLowerCase().includes(params.location.toLowerCase())) {
        return false;
      }
      
      if (params.remote && !job.remote) {
        return false;
      }
      
      if (params.salary_min && job.salary.min < params.salary_min) {
        return false;
      }
      
      return true;
    });
  }

  private generateDetailedMockJob(jobId: string): Job {
    // Return a detailed version of a job with all fields populated
    const company = 'Google';
    return {
      id: jobId,
      title: 'Senior Software Engineer',
      company,
      location: 'San Francisco, CA',
      salary: { min: 150000, max: 200000, currency: '$' },
      type: 'full-time',
      level: 'senior',
      description: `Join Google's world-class engineering team and help build products that impact billions of users worldwide. We're looking for a Senior Software Engineer who is passionate about solving complex technical challenges at scale.`,
      requirements: [
        "Bachelor's degree in Computer Science or equivalent practical experience",
        "5+ years of experience with software development in one or more programming languages",
        "3+ years of experience with data structures or algorithms",
        "Experience with full-stack development",
        "Experience with distributed systems and scalability"
      ],
      postedAt: new Date().toISOString(),
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'GCP', 'Kubernetes'],
      matchPercentage: 85,
      remote: false,
      applyUrl: `https://careers.google.com/jobs/results/${jobId}`,
      source: 'Company Website',
      companyType: 'public',
      companySize: 'large',
      workModel: 'hybrid',
      sponsorH1b: true,
      applicationDetails: {
        applicantCount: 157,
        isAvailable: true,
        platform: 'web'
      },
      benefits: [
        'Comprehensive health, dental, and vision insurance',
        'Retirement savings plan with company match',
        'Flexible time off and holidays',
        'On-site wellness and fitness facilities',
        'Free meals and snacks',
        'Professional development opportunities',
        'Parental leave and family support',
        'Commuter benefits'
      ],
      responsibilities: [
        'Design, develop, test, deploy, maintain, and enhance software solutions',
        'Manage individual project priorities, deadlines and deliverables',
        'Participate in design reviews with peers and stakeholders',
        'Review code developed by other developers and provide feedback',
        'Contribute to existing documentation or educational content',
        'Triage product or system issues and debug/track/resolve by analyzing the sources of issues'
      ]
    };
  }
}

export const jobApi = new JobApiService();
