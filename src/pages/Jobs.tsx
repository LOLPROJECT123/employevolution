
"use client"

import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, MapPin, Bookmark, CheckCircle } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  postedDate: string;
  matchPercentage: number;
  saved: boolean;
  logo?: string;
  featured?: boolean;
  skills: string[];
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: '1',
      title: 'Software Engineering Intern',
      company: 'Pineapple',
      location: 'San Francisco, CA',
      type: 'Internship',
      postedDate: '2d ago',
      matchPercentage: 92,
      saved: false,
      logo: 'https://picsum.photos/id/1/40/40',
      featured: true,
      skills: ['JavaScript', 'React', 'Node.js']
    },
    {
      id: '2',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'Remote',
      type: 'Full-time',
      postedDate: '3d ago',
      matchPercentage: 88,
      saved: true,
      logo: 'https://picsum.photos/id/2/40/40',
      skills: ['React', 'TypeScript', 'CSS']
    },
    {
      id: '3',
      title: 'Full Stack Engineer',
      company: 'StartupX',
      location: 'Austin, TX',
      type: 'Full-time',
      postedDate: '1w ago',
      matchPercentage: 76,
      saved: false,
      logo: 'https://picsum.photos/id/3/40/40',
      skills: ['JavaScript', 'Python', 'React', 'Django']
    },
    {
      id: '4',
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      location: 'Seattle, WA',
      type: 'Contract',
      postedDate: '2w ago',
      matchPercentage: 65,
      saved: false,
      logo: 'https://picsum.photos/id/4/40/40',
      skills: ['Figma', 'Adobe XD', 'UI Design']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  
  const toggleSaved = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, saved: !job.saved } : job
    ));
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-6">Jobs</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              className="pl-9 pr-4 py-2 w-full border rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Job listings */}
        <div className="md:col-span-2 space-y-4">
          {jobs.map(job => (
            <Card key={job.id} className={job.featured ? 'border-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400 font-bold">
                        {job.company.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <Link to={`/jobs/${job.id}`}>
                        <h3 className="font-medium hover:text-primary">{job.title}</h3>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleSaved(job.id)}
                      >
                        {job.saved ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    <div className="text-sm text-slate-500 mb-2">{job.company}</div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="flex items-center gap-1 text-xs">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        {job.postedDate}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`inline-block h-2 w-2 rounded-full mr-2 ${
                          job.matchPercentage > 85 ? 'bg-green-500' : 
                          job.matchPercentage > 70 ? 'bg-yellow-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-sm font-medium">
                          {job.matchPercentage}% Match
                        </span>
                      </div>
                      
                      <Link to={`/jobs/${job.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Filters sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Match Preferences</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <input
                    type="text"
                    placeholder="City, state, or remote"
                    className="mt-1 p-2 w-full text-sm border rounded-md"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Job Type</label>
                  <div className="mt-1 space-y-2">
                    {['Full-time', 'Part-time', 'Contract', 'Internship'].map(type => (
                      <div key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          id={type}
                          className="mr-2"
                        />
                        <label htmlFor={type} className="text-sm">{type}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Experience Level</label>
                  <div className="mt-1 space-y-2">
                    {['Entry', 'Mid', 'Senior', 'Lead'].map(level => (
                      <div key={level} className="flex items-center">
                        <input
                          type="checkbox"
                          id={level}
                          className="mr-2"
                        />
                        <label htmlFor={level} className="text-sm">{level}</label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full">Apply Filters</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Saved Jobs</h3>
              <p className="text-sm text-slate-500">
                {jobs.filter(job => job.saved).length} jobs saved
              </p>
              <Button variant="outline" className="w-full mt-3" asChild>
                <Link to="/job-tracker">View Saved Jobs</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Jobs;
