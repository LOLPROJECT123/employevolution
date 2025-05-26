import React, { useState, useEffect } from 'react';
import { Job } from '@/types/job';
import { MobileJobCard } from '@/components/MobileJobCard';
import { MobileJobDetail } from '@/components/MobileJobDetail';
import { MobileJobFiltersSection } from '@/components/MobileJobFiltersSection';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from "@/components/ui/scroll-area";

const MobileJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedJobs, setSavedJobs] = useState<string[]>([]);

  useEffect(() => {
    // Mock data for testing
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        description: 'We are seeking a talented Senior React Developer...',
        salary: {
          min: 120000,
          max: 160000,
          currency: 'USD'
        },
        type: 'full-time',
        level: 'senior',
        postedAt: '2024-01-15T10:00:00Z',
        skills: ['React', 'TypeScript', 'GraphQL'],
        remote: true,
        applyUrl: 'https://techcorp.com/careers/react-dev',
        source: 'company_website',
        matchPercentage: 95,
        workModel: 'remote',
        companySize: '501-1000',
        category: 'Engineering',
        jobFunction: 'Software Development'
      },
      {
        id: '2',
        title: 'Data Scientist',
        company: 'Data Insights Ltd.',
        location: 'New York, NY',
        description: 'Looking for a passionate Data Scientist to analyze...',
        salary: {
          min: 110000,
          max: 150000,
          currency: 'USD'
        },
        type: 'full-time',
        level: 'mid',
        postedAt: '2024-01-14T14:00:00Z',
        skills: ['Python', 'Machine Learning', 'Data Analysis'],
        remote: false,
        applyUrl: 'https://datainsights.com/careers/data-scientist',
        source: 'job_board',
        matchPercentage: 88,
        workModel: 'onsite',
        companySize: '51-200',
        category: 'Analytics',
        jobFunction: 'Data Science'
      },
      {
        id: '3',
        title: 'Frontend Engineer',
        company: 'Web Solutions Co.',
        location: 'Remote',
        description: 'Join our team as a Frontend Engineer and build...',
        salary: {
          min: 90000,
          max: 130000,
          currency: 'USD'
        },
        type: 'full-time',
        level: 'mid',
        postedAt: '2024-01-13T09:00:00Z',
        skills: ['JavaScript', 'React', 'HTML', 'CSS'],
        remote: true,
        applyUrl: 'https://websolutions.com/careers/frontend-engineer',
        source: 'remote_jobs',
        matchPercentage: 76,
        workModel: 'remote',
        companySize: '11-50',
        category: 'Engineering',
        jobFunction: 'Software Development'
      }
    ];
    setJobs(mockJobs);
  }, []);

  const handleJobSelect = (job: Job) => {
    setSelectedJob(job);
  };

  const handleCloseJobDetail = () => {
    setSelectedJob(null);
  };

  const handleToggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleApplyFilters = (filters: any) => {
    console.log('Applying filters:', filters);
    // Apply filters logic here
  };

  const handleSaveJob = (jobId: string) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Search Bar */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="search"
            placeholder="Search jobs..."
            className="pl-10 pr-3 py-2 w-full rounded-md border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Filter Button */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={handleToggleFilter}
        >
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Job List */}
        <div className="w-full max-w-md flex-shrink-0 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
          <ScrollArea className="h-full">
            {filteredJobs.map((job) => (
              <MobileJobCard
                key={job.id}
                job={job}
                onClick={() => handleJobSelect(job)}
                isSaved={savedJobs.includes(job.id)}
                onSave={() => handleSaveJob(job.id)}
              />
            ))}
          </ScrollArea>
        </div>

        {/* Job Detail or Filters */}
        <div className="flex-1 overflow-y-auto">
          {selectedJob ? (
            <MobileJobDetail
              job={selectedJob}
              onClose={handleCloseJobDetail}
              isSaved={savedJobs.includes(selectedJob.id)}
              onSave={() => handleSaveJob(selectedJob.id)}
            />
          ) : isFilterOpen ? (
            <div className="p-4">
              <MobileJobFiltersSection onApplyFilters={handleApplyFilters} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-gray-500 dark:text-gray-400">
              Select a job to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileJobs;
