import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobFilters } from "@/components/JobFilters";
import { SavedAndAppliedJobs } from "@/components/SavedAndAppliedJobs";
import { JobMatchDetails } from "@/components/JobMatchDetails";
import { JobDetailView } from "@/components/JobDetailView";
import { ContextAwareNavigationSuggestions } from "@/components/navigation/ContextAwareNavigationSuggestions";
import { VoiceSearchButton } from "@/components/mobile/VoiceSearchButton";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";
import { NavigationAnalyticsService } from "@/services/navigationAnalyticsService";
import { MLJobMatchingService } from "@/services/mlJobMatchingService";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { 
  Search, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building, 
  Bookmark, 
  ExternalLink,
  Mic,
  Filter
} from "lucide-react";

const Jobs = () => {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<any>({});

  // Voice command integration
  const { 
    isListening, 
    transcript, 
    startListening, 
    isSupported: voiceSupported 
  } = useVoiceCommands({
    onSearchChange: handleVoiceSearch,
    onFiltersChange: handleVoiceFilters
  });

  useEffect(() => {
    // Track navigation to jobs page
    NavigationAnalyticsService.trackNavigationPatterns(
      window.location.pathname, 
      '/jobs', 
      'direct'
    );
    
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchQuery, jobs]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      // Mock job data - in real app, would fetch from API
      const mockJobs = [
        {
          id: "1",
          title: "Senior React Developer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          salary: "$120,000 - $150,000",
          type: "Full-time",
          posted: "2 days ago",
          description: "We're looking for a senior React developer with 5+ years of experience...",
          requirements: ["React", "TypeScript", "Node.js", "AWS"],
          benefits: ["Health Insurance", "401k", "Remote Work"]
        },
        {
          id: "2", 
          title: "Full Stack Engineer",
          company: "StartupXYZ",
          location: "New York, NY",
          salary: "$100,000 - $130,000",
          type: "Full-time",
          posted: "1 week ago",
          description: "Join our fast-growing startup as a full stack engineer...",
          requirements: ["JavaScript", "React", "Python", "Django"],
          benefits: ["Equity", "Flexible Hours", "Learning Budget"]
        },
        {
          id: "3",
          title: "Frontend Developer",
          company: "DesignCo",
          location: "Austin, TX",
          salary: "$85,000 - $110,000", 
          type: "Full-time",
          posted: "3 days ago",
          description: "We need a creative frontend developer to join our design team...",
          requirements: ["React", "CSS", "JavaScript", "Figma"],
          benefits: ["Creative Freedom", "Health Insurance", "PTO"]
        }
      ];

      setJobs(mockJobs);
      setFilteredJobs(mockJobs);

      // Calculate job match scores if user is available
      if (user) {
        const jobsWithScores = await Promise.all(
          mockJobs.map(async (job) => {
            const matchResult = await MLJobMatchingService.calculateJobMatchScore(user.id, job);
            return { ...job, matchScore: matchResult.matchScore, matchDetails: matchResult };
          })
        );
        setJobs(jobsWithScores);
        setFilteredJobs(jobsWithScores);
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredJobs(jobs);
      return;
    }

    const filtered = jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some((req: string) => req.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    setFilteredJobs(filtered);
    
    // Track search analytics
    NavigationAnalyticsService.trackNavigationPatterns(
      '/jobs',
      `/jobs?search=${searchQuery}`,
      'click'
    );
  };

  const handleVoiceSearch = (query: string) => {
    setSearchQuery(query);
    toast.success(`Voice search: "${query}"`);
    
    // Track voice search
    NavigationAnalyticsService.trackNavigationPatterns(
      '/jobs',
      `/jobs?search=${query}`,
      'voice'
    );
  };

  const handleVoiceFilters = (filters: any) => {
    setCurrentFilters(filters);
    applyFilters(filters);
    toast.success('Voice filters applied');
  };

  const applyFilters = (filters: any) => {
    let filtered = [...jobs];

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.salary) {
      // Simple salary filtering logic
      filtered = filtered.filter(job => {
        const jobSalary = parseInt(job.salary.replace(/[^0-9]/g, ''));
        const filterSalary = parseInt(filters.salary.replace(/[^0-9]/g, ''));
        return jobSalary >= filterSalary;
      });
    }

    if (filters.skills && filters.skills.length > 0) {
      filtered = filtered.filter(job =>
        filters.skills.some((skill: string) =>
          job.requirements.some((req: string) => 
            req.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    setFilteredJobs(filtered);
    setCurrentFilters(filters);
  };

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
    
    // Track job selection
    NavigationAnalyticsService.trackNavigationPatterns(
      '/jobs',
      `/jobs/${job.id}`,
      'click'
    );
  };

  const handleSaveJob = async (jobId: string) => {
    if (!user) {
      toast.error('Please sign in to save jobs');
      return;
    }

    try {
      // Mock save job functionality
      toast.success('Job saved successfully');
      
      // Track save action
      NavigationAnalyticsService.trackNavigationPatterns(
        `/jobs/${jobId}`,
        '/jobs/saved',
        'click'
      );
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading jobs...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Context-aware navigation suggestions */}
      <ContextAwareNavigationSuggestions currentPage="/jobs" />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Discover your next career opportunity with AI-powered job matching
        </p>
      </div>

      {/* Search and Voice Input */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          
          {voiceSupported && (
            <VoiceSearchButton
              isListening={isListening}
              onStartListening={startListening}
              transcript={transcript}
            />
          )}
          
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        
        {transcript && (
          <div className="mt-2 text-sm text-muted-foreground">
            Voice input: "{transcript}"
          </div>
        )}
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
          <TabsTrigger value="saved">Saved Jobs</TabsTrigger>
          <TabsTrigger value="applied">Applied Jobs</TabsTrigger>
          <TabsTrigger value="matches">AI Matches</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <JobFilters onFiltersChange={applyFilters} currentFilters={currentFilters} />
            </div>

            {/* Job Listings */}
            <div className="lg:col-span-2 space-y-4">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedJob?.id === job.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <Building className="h-4 w-4" />
                          <span>{job.company}</span>
                        </CardDescription>
                      </div>
                      
                      {job.matchScore && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {job.matchScore}% Match
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salary}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.posted}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.requirements.slice(0, 3).map((req: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                      {job.requirements.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requirements.length - 3} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{job.type}</Badge>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveJob(job.id);
                          }}
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('#', '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredJobs.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No jobs found matching your criteria. Try adjusting your search or filters.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Job Details Panel */}
            <div className="lg:col-span-1">
              {selectedJob ? (
                <JobDetailView job={selectedJob} onSave={handleSaveJob} />
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      Select a job to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="saved">
          <SavedAndAppliedJobs type="saved" />
        </TabsContent>

        <TabsContent value="applied">
          <SavedAndAppliedJobs type="applied" />
        </TabsContent>

        <TabsContent value="matches">
          <div className="space-y-4">
            {filteredJobs
              .filter(job => job.matchScore && job.matchScore >= 70)
              .map((job) => (
                <JobMatchDetails key={job.id} job={job} matchDetails={job.matchDetails} />
              ))
            }
            
            {filteredJobs.filter(job => job.matchScore && job.matchScore >= 70).length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">
                    No high-match jobs found. Complete your profile for better AI matching.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Jobs;
