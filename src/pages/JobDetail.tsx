
"use client"

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Bookmark, CheckCircle, Building, Calendar, Clock, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobDetail = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'company'>('overview');
  
  const job = {
    id: '1',
    title: 'Software Engineering Internship',
    company: 'Pineapple',
    location: 'San Francisco, CA',
    type: 'Internship',
    salary: '$40-50/hr',
    postedDate: '2 days ago',
    description: 'We are looking for a talented and motivated Software Engineering Intern to join our team...',
    requirements: [
      'Currently pursuing a Bachelor's or Master's degree in Computer Science or related field',
      'Strong programming skills in one or more languages (Python, Java, JavaScript)',
      'Experience with web development frameworks (React, Angular, Vue)',
      'Ability to work in a fast-paced environment',
      'Excellent problem-solving and analytical skills'
    ],
    responsibilities: [
      'Collaborate with senior engineers on feature development',
      'Write clean, maintainable, and efficient code',
      'Participate in code reviews and technical discussions',
      'Debug and fix issues in existing codebase',
      'Learn and adopt best practices in software development'
    ],
    skills: ['React', 'JavaScript', 'Node.js', 'SQL', 'Git', 'TypeScript', 'REST APIs'],
    company_size: '1,000-5,000 employees',
    company_description: 'Pineapple is a leading technology company focused on innovative solutions...',
    match: {
      percentage: 92,
      criteria: [
        { name: 'Location', match: 'Strong' },
        { name: 'Job Type', match: 'Strong' },
        { name: 'Skills', match: 'Strong' },
        { name: 'Experience', match: 'Moderate' }
      ]
    },
    logo: 'https://picsum.photos/id/1/64/64'
  };
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <Link to="/jobs" className="inline-flex items-center text-slate-600 hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to jobs
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-slate-900 rounded-lg border p-6">
              <div className="flex gap-4 mb-4">
                <div className="h-16 w-16 bg-slate-100 rounded-md overflow-hidden flex-shrink-0">
                  {job.logo ? (
                    <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xl font-bold text-slate-400">
                      {job.company.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold mb-1">{job.title}</h1>
                  <div className="text-slate-600 dark:text-slate-300 mb-2">
                    {job.company}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </Badge>
                    <Badge variant="outline">
                      {job.type}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {job.salary}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {job.postedDate}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex border-b mb-6">
                <button 
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`px-4 py-2 font-medium text-sm ${activeTab === 'company' ? 'border-b-2 border-primary text-primary' : 'text-slate-600'}`}
                  onClick={() => setActiveTab('company')}
                >
                  Company
                </button>
              </div>
              
              {activeTab === 'overview' ? (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Description</h2>
                    <p className="text-slate-600 dark:text-slate-300">{job.description}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Requirements</h2>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Responsibilities</h2>
                    <ul className="list-disc pl-6 space-y-1 text-slate-600 dark:text-slate-300">
                      {job.responsibilities.map((resp, index) => (
                        <li key={index}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">About {job.company}</h2>
                    <p className="text-slate-600 dark:text-slate-300 mb-4">
                      {job.company_description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">{job.company_size}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300">{job.location}</span>
                    </div>
                  </div>
                  
                  {/* More company details could go here */}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div>
            <Card className="mb-4">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{job.match.percentage}%</span>
                      <span className="font-medium">Match</span>
                    </div>
                    <p className="text-sm text-slate-500">Based on your profile</p>
                  </div>
                  <Badge className="bg-primary">Strong Match</Badge>
                </div>
                
                <div className="my-4 border-t border-b py-4">
                  <h3 className="font-medium mb-3">Match Criteria</h3>
                  <div className="space-y-3">
                    {job.match.criteria.map((criterion) => (
                      <div key={criterion.name} className="flex items-center justify-between">
                        <span className="text-sm">{criterion.name}</span>
                        <Badge 
                          variant={criterion.match === 'Strong' ? "default" : "outline"}
                          className={criterion.match === 'Strong' ? "bg-primary" : ""}
                        >
                          {criterion.match}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button className="w-full">Apply Now</Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    {isSaved ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save Job
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <div>
                    <h3 className="font-medium">Application status</h3>
                    <p className="text-sm text-slate-500">Not yet applied</p>
                  </div>
                </div>
                
                <p className="text-sm text-slate-500 mb-4">
                  Apply now to increase your chances of getting hired!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDetail;
