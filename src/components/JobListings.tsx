import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MapPin,
  Building,
  Calendar,
  Briefcase,
  ChevronRight,
  Star,
  Clock,
  Filter
} from "lucide-react";
import { jobScraperService, JobSource } from "@/services/JobScraperService";
import { Job } from "@/types/job";
import { ExtendedJob } from "@/types/jobExtensions";
import { toast } from "sonner";

interface JobListingsProps {
  initialJobs?: ExtendedJob[];
}

const JobListings: React.FC<JobListingsProps> = ({ initialJobs = [] }) => {
  const [jobs, setJobs] = useState<ExtendedJob[]>(initialJobs);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [sources, setSources] = useState<JobSource[]>(['indeed', 'linkedin']);
  const [filteredJobs, setFilteredJobs] = useState<ExtendedJob[]>(jobs);
  
  useEffect(() => {
    // Filter jobs based on search term and location
    const filtered = jobs.filter(job => {
      const titleMatch = job.title.toLowerCase().includes(searchTerm.toLowerCase());
      const companyMatch = job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const descMatch = job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const locationMatch = location === '' || 
        job.location.toLowerCase().includes(location.toLowerCase());
      
      return (titleMatch || companyMatch || descMatch) && locationMatch;
    });
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, location]);
  
  const handleSearch = async () => {
    if (!searchTerm) {
      toast.error("Please enter a search term");
      return;
    }
    
    setLoading(true);
    
    try {
      const results = await jobScraperService.searchJobs(
        searchTerm,
        location,
        sources
      );
      
      setJobs(results);
      setFilteredJobs(results);
      
      if (results.length === 0) {
        toast.info("No jobs found matching your criteria");
      } else {
        toast.success(`Found ${results.length} jobs matching your criteria`);
      }
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error("Failed to search jobs");
    } finally {
      setLoading(false);
    }
  };
  
  const getSalaryText = (job: Job) => {
    if (job.salary?.min && job.salary?.max) {
      return `$${job.salary.min.toLocaleString()} - $${job.salary.max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };
  
  const formatTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    } catch (e) {
      return dateStr;
    }
  };
  
  const toggleJobSource = (source: JobSource) => {
    if (sources.includes(source)) {
      setSources(sources.filter(s => s !== source));
    } else {
      setSources([...sources, source]);
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Search Form */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Job title, keyword, or company"
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Location or Remote"
                className="pl-10"
                value={location}
                onChange={e => setLocation(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleSearch}
              disabled={loading}
              className="h-10"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Searching...
                </>
              ) : (
                <>Search Jobs</>
              )}
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              <span>Sources:</span>
            </div>
            
            <Badge 
              variant={sources.includes('indeed') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleJobSource('indeed')}
            >
              Indeed
            </Badge>
            
            <Badge 
              variant={sources.includes('linkedin') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleJobSource('linkedin')}
            >
              LinkedIn
            </Badge>
            
            <Badge 
              variant={sources.includes('glassdoor') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleJobSource('glassdoor')}
            >
              Glassdoor
            </Badge>
            
            <Badge 
              variant={sources.includes('ziprecruiter') ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => toggleJobSource('ziprecruiter')}
            >
              ZipRecruiter
            </Badge>
          </div>
        </Card>
        
        {/* Results */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                    <img 
                      src={job.logo || "/placeholder.svg"} 
                      alt={job.company} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-lg truncate">{job.title}</h3>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Building className="h-3.5 w-3.5 mr-1" />
                          <span>{job.company}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{formatTimeAgo(job.datePosted)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2" 
                        dangerouslySetInnerHTML={{ __html: job.description.slice(0, 200) + '...' }} 
                      />
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills?.slice(0, 5).map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50 dark:bg-gray-800/70">
                          {skill}
                        </Badge>
                      ))}
                      
                      {job.skills && job.skills.length > 5 && (
                        <Badge variant="outline">+{job.skills.length - 5} more</Badge>
                      )}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                          <Briefcase className="h-3.5 w-3.5 inline mr-1" />
                          <span>{job.jobType}</span>
                        </div>
                        
                        <div className="text-sm font-medium">
                          {getSalaryText(job)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Star className="h-4 w-4" />
                        </Button>
                        
                        <Button asChild>
                          <Link to={`/job/${job.id}`}>
                            View Job <ChevronRight className="ml-1 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Searching for jobs...</p>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No Jobs Found</h3>
            <p className="text-gray-500 mb-6">
              {jobs.length > 0 
                ? "No jobs match your current search filters. Try broadening your search criteria."
                : "Search for jobs by entering keywords and location above."}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setLocation('');
              }}
            >
              Clear Filters
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default JobListings;
