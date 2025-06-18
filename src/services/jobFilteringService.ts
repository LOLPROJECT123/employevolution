
import { Job, JobFilters } from '@/types/job';

export class JobFilteringService {
  static filterJobs(jobs: Job[], filters: JobFilters, appliedJobIds: string[] = []): Job[] {
    return jobs.filter(job => {
      // Hide applied jobs filter
      if (filters.hideAppliedJobs && appliedJobIds.includes(job.id)) {
        return false;
      }

      // Search filter (title, company, description, skills)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${job.title} ${job.company} ${job.description} ${job.skills?.join(' ') || ''}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Location filter
      if (filters.location) {
        const locationMatch = job.location.toLowerCase().includes(filters.location.toLowerCase()) ||
                             (filters.remote && job.remote);
        if (!locationMatch) {
          return false;
        }
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
      if (filters.salaryRange && (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 300000)) {
        const jobMinSalary = job.salary?.min || 0;
        const jobMaxSalary = job.salary?.max || 0;
        if (jobMinSalary < filters.salaryRange[0] || jobMaxSalary > filters.salaryRange[1]) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills.length > 0) {
        const jobSkills = job.skills?.map(s => s.toLowerCase()) || [];
        const hasMatchingSkill = filters.skills.some(skill => 
          jobSkills.some(jobSkill => jobSkill.includes(skill.toLowerCase()))
        );
        if (!hasMatchingSkill) {
          return false;
        }
      }

      // Company filter
      if (filters.companies && filters.companies.length > 0) {
        const companyMatch = filters.companies.some(company => 
          job.company.toLowerCase().includes(company.toLowerCase())
        );
        if (!companyMatch) {
          return false;
        }
      }

      // Job title filter
      if (filters.title) {
        if (!job.title.toLowerCase().includes(filters.title.toLowerCase())) {
          return false;
        }
      }

      // Job function filter
      if (filters.jobFunction) {
        const jobFunction = job.jobFunction || job.category || '';
        if (!jobFunction.toLowerCase().includes(filters.jobFunction.toLowerCase())) {
          return false;
        }
      }

      // Company types filter
      if (filters.companyTypes.length > 0) {
        const companyType = job.companyType || 'private';
        if (!filters.companyTypes.includes(companyType)) {
          return false;
        }
      }

      // Company size filter
      if (filters.companySize.length > 0) {
        const companySize = job.companySize || 'medium';
        if (!filters.companySize.includes(companySize)) {
          return false;
        }
      }

      // Benefits filter
      if (filters.benefits.length > 0) {
        const jobBenefits = job.benefits || [];
        const hasMatchingBenefit = filters.benefits.some(benefit => 
          jobBenefits.some(jobBenefit => jobBenefit.toLowerCase().includes(benefit.toLowerCase()))
        );
        if (!hasMatchingBenefit) {
          return false;
        }
      }

      return true;
    });
  }

  static getActiveFilterCount(filters: JobFilters): number {
    let count = 0;
    
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.remote) count++;
    if (filters.jobType?.length > 0) count += filters.jobType.length;
    if (filters.experienceLevels?.length > 0) count += filters.experienceLevels.length;
    if (filters.skills?.length > 0) count += filters.skills.length;
    if (filters.companies?.length > 0) count += filters.companies.length;
    if (filters.title) count++;
    if (filters.jobFunction) count++;
    if (filters.companyTypes?.length > 0) count += filters.companyTypes.length;
    if (filters.companySize?.length > 0) count += filters.companySize.length;
    if (filters.benefits?.length > 0) count += filters.benefits.length;
    if (filters.hideAppliedJobs) count++;
    
    if (filters.salaryRange && 
        (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 300000)) {
      count++;
    }
    
    return count;
  }

  static getActiveFiltersDescription(filters: JobFilters): string[] {
    const descriptions: string[] = [];
    
    if (filters.search) descriptions.push(`Search: "${filters.search}"`);
    if (filters.location) descriptions.push(`Location: "${filters.location}"`);
    if (filters.remote) descriptions.push('Remote jobs only');
    if (filters.jobType?.length > 0) descriptions.push(`Job types: ${filters.jobType.join(', ')}`);
    if (filters.experienceLevels?.length > 0) descriptions.push(`Experience: ${filters.experienceLevels.join(', ')}`);
    if (filters.skills?.length > 0) descriptions.push(`Skills: ${filters.skills.join(', ')}`);
    if (filters.companies?.length > 0) descriptions.push(`Companies: ${filters.companies.join(', ')}`);
    if (filters.title) descriptions.push(`Title: "${filters.title}"`);
    if (filters.jobFunction) descriptions.push(`Function: "${filters.jobFunction}"`);
    if (filters.salaryRange && (filters.salaryRange[0] !== 0 || filters.salaryRange[1] !== 300000)) {
      descriptions.push(`Salary: $${filters.salaryRange[0].toLocaleString()} - $${filters.salaryRange[1].toLocaleString()}`);
    }
    
    return descriptions;
  }
}
