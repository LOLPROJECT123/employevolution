
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Job } from '@/types/job';
import { ExtendedJob } from '@/types/jobExtensions';
import { calculateJobMatch, addMatchPercentageToJob } from '@/utils/jobMatching';
import ResumeJobMatchIndicator from '@/components/ResumeJobMatchIndicator';
import { getParsedResumeFromProfile } from '@/utils/profileUtils';

const JobMatchingDemo = () => {
  const [job, setJob] = useState<Job>({
    id: "demo-job",
    title: "Frontend Developer",
    company: "Demo Company",
    location: "San Francisco, CA",
    salary: {
      min: 90000,
      max: 120000,
      currency: "USD"
    },
    type: "full-time",
    level: "mid",
    description: "We are looking for a talented Frontend Developer to join our team.",
    requirements: [
      "3+ years of experience in frontend development",
      "Strong knowledge of React and JavaScript",
      "Experience with TypeScript is a plus",
      "Understanding of responsive design principles"
    ],
    postedAt: "2 days ago",
    skills: ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Redux"],
    remote: false
  });
  
  const [matchPercentage, setMatchPercentage] = useState<number>(0);
  
  useEffect(() => {
    // Calculate match percentage based on user's profile
    const resumeData = getParsedResumeFromProfile();
    const calculatedMatch = calculateJobMatch(job, resumeData);
    setMatchPercentage(calculatedMatch);
    
    // Enhance the job with match data
    const jobWithMatch = addMatchPercentageToJob(job, resumeData);
    setJob(jobWithMatch);
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Match Demo</CardTitle>
        <CardDescription>See how your profile matches with this job</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-muted-foreground">{job.company} • {job.location}</p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium">Skills Required:</p>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm">
                  {skill}
                </div>
              ))}
            </div>
          </div>
          
          <ResumeJobMatchIndicator matchPercentage={matchPercentage} />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Job Details</Button>
      </CardFooter>
    </Card>
  );
};

export default JobMatchingDemo;
