
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, ArrowRight, Star, MapPin } from 'lucide-react';
import { Job } from '@/types/job';

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock job recommendations based on user profile
    const mockRecommendations: Job[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechFlow Inc.',
        location: 'Austin, TX',
        salary: { min: 90000, max: 120000, currency: 'USD' },
        type: 'full-time',
        level: 'senior',
        description: 'Join our team to build cutting-edge web applications',
        requirements: ['React', 'TypeScript', 'Node.js'],
        postedAt: '2024-01-10T10:00:00Z',
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
        matchPercentage: 92,
        remote: true
      },
      {
        id: '2',
        title: 'Full Stack Engineer',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        salary: { min: 100000, max: 140000, currency: 'USD' },
        type: 'full-time',
        level: 'mid',
        description: 'Build scalable applications in a fast-paced startup environment',
        requirements: ['React', 'Python', 'PostgreSQL'],
        postedAt: '2024-01-12T14:30:00Z',
        skills: ['React', 'Python', 'PostgreSQL', 'AWS'],
        matchPercentage: 85,
        remote: false
      },
      {
        id: '3',
        title: 'React Developer',
        company: 'Digital Solutions Ltd.',
        location: 'Remote',
        salary: { min: 75000, max: 95000, currency: 'USD' },
        type: 'full-time',
        level: 'mid',
        description: 'Create responsive and user-friendly web interfaces',
        requirements: ['React', 'JavaScript', 'CSS'],
        postedAt: '2024-01-15T09:15:00Z',
        skills: ['React', 'JavaScript', 'CSS', 'HTML'],
        matchPercentage: 78,
        remote: true
      }
    ];

    setRecommendations(mockRecommendations);
    setLoading(false);
  }, []);

  const formatSalary = (salary: Job['salary']) => {
    if (!salary || salary.min === 0) return 'Not specified';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-primary';
    return 'text-amber-600 dark:text-amber-400';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Recommended Jobs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((job) => (
          <div key={job.id} className="border border-border rounded-lg p-3 space-y-2 hover:bg-accent transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm hover:text-primary cursor-pointer">
                  {job.title}
                </h4>
                <p className="text-xs text-muted-foreground">{job.company}</p>
              </div>
              <div className={`text-xs font-medium ${getMatchColor(job.matchPercentage || 0)}`}>
                <Star className="h-3 w-3 inline mr-1" />
                {job.matchPercentage}%
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {job.location}
              {job.remote && <Badge variant="secondary" className="text-xs px-1 py-0">Remote</Badge>}
            </div>
            
            <div className="text-xs text-muted-foreground">
              {formatSalary(job.salary)}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {job.skills?.slice(0, 3).map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {skill}
                </Badge>
              ))}
              {(job.skills?.length || 0) > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{(job.skills?.length || 0) - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
        
        <Button variant="outline" className="w-full" size="sm">
          View All Recommendations
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default JobRecommendations;
