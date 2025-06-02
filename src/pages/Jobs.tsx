import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BriefcaseIcon,
  MapPin,
  CalendarIcon,
  Clock,
  Tag,
  ChevronDown,
  Search,
  Filter,
  ExternalLink,
  Plus,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  datePosted: string;
  tags: string[];
  description: string;
  salary?: string;
  benefits?: string[];
  qualifications?: string[];
  isFeatured?: boolean;
  isRemote?: boolean;
  applyUrl?: string;
  matchPercentage?: number;
  source?: string;
  verified?: boolean;
}

const sampleJobs: Job[] = [
  {
    id: '1',
    title: 'Software Engineer',
    company: 'Google',
    location: 'Mountain View, CA',
    datePosted: '2 days ago',
    tags: ['Full-time', 'Mid-level', 'Backend'],
    description: 'Join our team to build the next generation of search technology.',
    salary: '$140,000 - $180,000',
    benefits: ['Health insurance', 'Paid time off', 'Stock options'],
    qualifications: ['Bachelor\'s degree', '5+ years experience'],
    isFeatured: true,
    isRemote: false,
    applyUrl: 'https://careers.google.com/jobs/#!t=jo&jid=/google/software-engineer-mountain-view-ca&',
    matchPercentage: 85,
    source: 'Google Careers',
    verified: true
  },
  {
    id: '2',
    title: 'Data Scientist',
    company: 'Facebook',
    location: 'Menlo Park, CA',
    datePosted: '5 days ago',
    tags: ['Full-time', 'Senior', 'Machine Learning'],
    description: 'Develop machine learning models to improve user experience.',
    salary: '$160,000 - $200,000',
    benefits: ['Health insurance', 'Paid time off', 'Relocation assistance'],
    qualifications: ['Master\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: false,
    applyUrl: 'https://www.metacareers.com/jobs/929292271852489/',
    matchPercentage: 92,
    source: 'Meta Careers',
    verified: true
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    datePosted: '1 week ago',
    tags: ['Full-time', 'Mid-level', 'React'],
    description: 'Build user interfaces for our streaming platform.',
    salary: '$130,000 - $170,000',
    benefits: ['Health insurance', 'Paid time off', 'Free Netflix subscription'],
    qualifications: ['Bachelor\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: true,
    applyUrl: 'https://jobs.netflix.com/jobs/22920581',
    matchPercentage: 78,
    source: 'Netflix Jobs',
    verified: true
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'Amazon',
    location: 'Seattle, WA',
    datePosted: '3 days ago',
    tags: ['Full-time', 'Senior', 'Product Strategy'],
    description: 'Define and execute product strategy for our e-commerce platform.',
    salary: '$150,000 - $190,000',
    benefits: ['Health insurance', 'Paid time off', 'Employee discount'],
    qualifications: ['Bachelor\'s degree', '5+ years experience'],
    isFeatured: false,
    isRemote: false,
    applyUrl: 'https://www.amazon.jobs/en/jobs/2279476/product-manager',
    matchPercentage: 89,
    source: 'Amazon Jobs',
    verified: true
  },
  {
    id: '5',
    title: 'UX Designer',
    company: 'Apple',
    location: 'Cupertino, CA',
    datePosted: '4 days ago',
    tags: ['Full-time', 'Mid-level', 'UI/UX'],
    description: 'Design intuitive user experiences for our mobile devices.',
    salary: '$120,000 - $160,000',
    benefits: ['Health insurance', 'Paid time off', 'Apple product discount'],
    qualifications: ['Bachelor\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: false,
    applyUrl: 'https://jobs.apple.com/en-us/details/200492924/ux-designer',
    matchPercentage: 82,
    source: 'Apple Careers',
    verified: true
  },
  {
    id: '6',
    title: 'Data Analyst',
    company: 'Microsoft',
    location: 'Redmond, WA',
    datePosted: '6 days ago',
    tags: ['Full-time', 'Entry-level', 'Data Analysis'],
    description: 'Analyze data to provide insights and support business decisions.',
    salary: '$100,000 - $140,000',
    benefits: ['Health insurance', 'Paid time off', 'Stock options'],
    qualifications: ['Bachelor\'s degree', '1+ years experience'],
    isFeatured: false,
    isRemote: true,
    applyUrl: 'https://careers.microsoft.com/us/en/job/1674917/Data-Analyst',
    matchPercentage: 75,
    source: 'Microsoft Careers',
    verified: true
  },
  {
    id: '7',
    title: 'Cybersecurity Analyst',
    company: 'IBM',
    location: 'New York, NY',
    datePosted: '1 week ago',
    tags: ['Full-time', 'Mid-level', 'Security'],
    description: 'Protect our systems and data from cyber threats.',
    salary: '$110,000 - $150,000',
    benefits: ['Health insurance', 'Paid time off', 'Training programs'],
    qualifications: ['Bachelor\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: false,
    applyUrl: 'https://www.ibm.com/careers/us-en/job/X2400896/Cybersecurity-Analyst',
    matchPercentage: 88,
    source: 'IBM Careers',
    verified: true
  },
  {
    id: '8',
    title: 'Cloud Architect',
    company: 'Oracle',
    location: 'Austin, TX',
    datePosted: '2 days ago',
    tags: ['Full-time', 'Senior', 'Cloud Computing'],
    description: 'Design and implement cloud-based solutions for our clients.',
    salary: '$170,000 - $210,000',
    benefits: ['Health insurance', 'Paid time off', 'Stock options'],
    qualifications: ['Bachelor\'s degree', '7+ years experience'],
    isFeatured: false,
    isRemote: true,
    applyUrl: 'https://oracle.taleo.net/careersection/ex_emea/jobdetail.ftl?job=24000G1X&lang=en',
    matchPercentage: 95,
    source: 'Oracle Careers',
    verified: true
  },
  {
    id: '9',
    title: 'AI Engineer',
    company: 'NVIDIA',
    location: 'Santa Clara, CA',
    datePosted: '3 days ago',
    tags: ['Full-time', 'Mid-level', 'Artificial Intelligence'],
    description: 'Develop AI algorithms and models for our GPU technology.',
    salary: '$150,000 - $190,000',
    benefits: ['Health insurance', 'Paid time off', 'Stock options'],
    qualifications: ['Master\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: false,
    applyUrl: 'https://nvidia.wd5.myworkdayjobs.com/External/job/Santa-Clara-California/AI-Engineer_JR1973952',
    matchPercentage: 91,
    source: 'NVIDIA Careers',
    verified: true
  },
  {
    id: '10',
    title: 'Blockchain Developer',
    company: 'Coinbase',
    location: 'San Francisco, CA',
    datePosted: '5 days ago',
    tags: ['Full-time', 'Mid-level', 'Blockchain'],
    description: 'Build decentralized applications on our blockchain platform.',
    salary: '$160,000 - $200,000',
    benefits: ['Health insurance', 'Paid time off', 'Stock options'],
    qualifications: ['Bachelor\'s degree', '3+ years experience'],
    isFeatured: false,
    isRemote: true,
    applyUrl: 'https://www.coinbase.com/careers/positions/5269011',
    matchPercentage: 84,
    source: 'Coinbase Careers',
    verified: true
  }
];

const Jobs = () => {
  const isMobile = useMobile();
  const [jobs, setJobs] = useState<Job[]>(sampleJobs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prevFilters =>
      prevFilters.includes(filter)
        ? prevFilters.filter(f => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const filteredJobs = jobs.filter(job => {
    const searchMatch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        job.location.toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch = selectedFilters.length === 0 || job.tags.some(tag => selectedFilters.includes(tag));
    return searchMatch && filterMatch;
  });

  const jobTags = Array.from(new Set(jobs.flatMap(job => job.tags)));

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Jobs" />}

      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Find Your Dream Job
          </h1>
          <p className="text-blue-100 mt-2">
            Explore thousands of job opportunities and find the perfect fit for your skills and experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        {isMobile ? (
          <>
            <MobileHeader title="Job Search" />
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
              </div>

              <div className="flex overflow-x-auto space-x-2">
                {jobTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedFilters.includes(tag) ? 'default' : 'outline'}
                    onClick={() => toggleFilter(tag)}
                    className="rounded-full text-sm"
                  >
                    {tag}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <Card key={job.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <BriefcaseIcon className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{job.datePosted}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Tag className="h-4 w-4" />
                        <span>{job.tags.join(', ')}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{job.description}</p>
                      {job.matchPercentage && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            Match: {job.matchPercentage}%
                          </Badge>
                        </div>
                      )}
                      <Button asChild>
                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          Apply Now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={handleSearch}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Job Type</h4>
                    {jobTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={tag}
                          className="h-4 w-4 rounded text-blue-500 focus:ring-blue-500"
                          checked={selectedFilters.includes(tag)}
                          onChange={() => toggleFilter(tag)}
                        />
                        <label htmlFor={tag} className="text-sm">{tag}</label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-3">
              <div className="grid grid-cols-1 gap-4">
                {filteredJobs.map(job => (
                  <Card key={job.id} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <BriefcaseIcon className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{job.datePosted}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                        <Tag className="h-4 w-4" />
                        <span>{job.tags.join(', ')}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{job.description}</p>
                      {job.matchPercentage && (
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">
                            Match: {job.matchPercentage}%
                          </Badge>
                        </div>
                      )}
                      <Button asChild>
                        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                          Apply Now
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
