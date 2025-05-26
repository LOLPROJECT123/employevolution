
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Users, 
  Star,
  CheckCircle,
  Calendar,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Job } from '@/types/job';

const Index = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 24,
    responseRate: 18,
    interviewsScheduled: 3,
    savedJobs: 12
  });

  const [recentJobs, setRecentJobs] = useState<Job[]>([]);

  useEffect(() => {
    // Mock recent jobs data
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp',
        location: 'San Francisco, CA',
        salary: { min: 120000, max: 160000, currency: 'USD' },
        type: 'full-time',
        level: 'senior',
        description: 'Looking for an experienced frontend developer...',
        requirements: ['React', 'TypeScript', 'GraphQL'],
        postedAt: '2024-01-15T10:00:00Z',
        skills: ['React', 'TypeScript', 'GraphQL'],
        applyUrl: 'https://example.com/apply',
        source: 'company'
      },
      {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        location: 'Remote',
        salary: { min: 100000, max: 140000, currency: 'USD' },
        type: 'full-time',
        level: 'mid',
        description: 'Join our growing product team...',
        requirements: ['Product Strategy', 'Analytics', 'Leadership'],
        postedAt: '2024-01-14T14:00:00Z',
        skills: ['Product Strategy', 'Analytics', 'Leadership'],
        applyUrl: 'https://example.com/apply',
        source: 'job_board'
      },
      {
        id: '3',
        title: 'UX Designer',
        company: 'DesignStudio',
        location: 'New York, NY',
        salary: { min: 80000, max: 120000, currency: 'USD' },
        type: 'full-time',
        level: 'mid',
        description: 'Create amazing user experiences...',
        requirements: ['Figma', 'User Research', 'Prototyping'],
        postedAt: '2024-01-13T09:00:00Z',
        skills: ['Figma', 'User Research', 'Prototyping'],
        applyUrl: 'https://example.com/apply',
        source: 'company'
      }
    ];

    setRecentJobs(mockJobs);
  }, []);

  const formatSalary = (job: Job) => {
    if (job.salary) {
      return `$${(job.salary.min / 1000).toFixed(0)}k - $${(job.salary.max / 1000).toFixed(0)}k`;
    }
    return 'Salary not specified';
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to Your Job Search Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your applications, discover new opportunities, and land your dream job with our comprehensive job search platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/jobs')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Find Jobs
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View Analytics
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.responseRate}%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interviews</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.interviewsScheduled}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Jobs</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.savedJobs}</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Jobs Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Recent Job Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {recentJobs.map((job) => (
              <div 
                key={job.id} 
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate('/jobs')}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                      <Badge variant="secondary" className="ml-2">
                        {job.type}
                      </Badge>
                    </div>
                    
                    <p className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-2">
                      {job.company}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {formatSalary(job)}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {getTimeAgo(job.postedAt)}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {job.skills?.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills && job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 lg:ml-6">
                    <Button 
                      className="w-full lg:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/jobs');
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full lg:w-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle save job action
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="text-center pt-6">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/jobs')}
              >
                View All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
