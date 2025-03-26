import { useState, useEffect } from 'react';
import { Job } from "@/types/job";
import Navbar from "@/components/Navbar";
import { MobileJobCard } from "@/components/MobileJobCard";
import { MobileJobDetail } from "@/components/MobileJobDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Search,
  SlidersHorizontal,
  ArrowLeft,
  X
} from "lucide-react";

interface MobileJobsProps {
  jobs: Job[];
}

export default function MobileJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  
  useEffect(() => {
    const fetchJobs = async () => {
      const generateSampleJobs = (count: number): Job[] => {
        const jobTypes: Array<'full-time' | 'part-time' | 'contract' | 'internship' | 'temporary' | 'volunteer' | 'other'> = 
          ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'volunteer', 'other'];
        
        const levels: Array<'intern' | 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'manager' | 'director'> = 
          ['intern', 'entry', 'mid', 'senior', 'lead', 'executive', 'manager', 'director'];
        
        const companies = [
          'TechCorp', 'InnovateCo', 'Google', 'Amazon', 'Microsoft', 'Facebook', 'Apple', 
          'Netflix', 'Tesla', 'Twitter', 'LinkedIn', 'Uber', 'Airbnb', 'Stripe', 'Square'
        ];
        
        const locations = [
          'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Boston, MA', 'Austin, TX',
          'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA', 'Portland, OR'
        ];
        
        const titles = [
          'Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer',
          'Machine Learning Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
          'Engineering Manager'
        ];
        
        const skills = [
          'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go',
          'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'
        ];
        
        const requirements = [
          'Experience with modern frontend frameworks', 'Strong problem-solving skills',
          'Excellent communication skills', 'Ability to work in a team environment',
          'Passion for creating quality software', 'Understanding of CI/CD workflows'
        ];
        
        const platforms = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com', 'joinhandshake.com'];
        
        const benefits = [
          'Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Life Insurance',
          '401(k) Retirement Plan', 'Wellness Program', 'Paid Vacation'
        ];
        
        const responsibilities = [
          'Develop and maintain software applications',
          'Collaborate with cross-functional teams',
          'Participate in code reviews',
          'Write clean, efficient, and well-documented code',
          'Troubleshoot and debug issues'
        ];

        return Array.from({ length: count }, (_, i) => {
          const randomSalaryMin = Math.floor(Math.random() * 15) * 10000 + 50000;
          const randomSalaryMax = randomSalaryMin + Math.floor(Math.random() * 10) * 10000;
          const randomSkills = Array.from(
            { length: Math.floor(Math.random() * 5) + 3 },
            () => skills[Math.floor(Math.random() * skills.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomRequirements = Array.from(
            { length: Math.floor(Math.random() * 4) + 2 },
            () => requirements[Math.floor(Math.random() * requirements.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomResponsibilities = Array.from(
            { length: Math.floor(Math.random() * 4) + 2 },
            () => responsibilities[Math.floor(Math.random() * responsibilities.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomBenefits = Array.from(
            { length: Math.floor(Math.random() * 4) + 3 },
            () => benefits[Math.floor(Math.random() * benefits.length)]
          ).filter((item, pos, arr) => arr.indexOf(item) === pos);
          
          const randomTitle = titles[Math.floor(Math.random() * titles.length)];
          const randomType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
          const randomLevel = levels[Math.floor(Math.random() * levels.length)];
          const randomPrefix = randomLevel === 'senior' ? 'Senior ' : 
                              randomLevel === 'lead' ? 'Lead ' : 
                              randomLevel === 'manager' ? 'Manager, ' : '';
          const randomRemote = Math.random() > 0.5;
          const randomWorkModel = randomRemote ? 'remote' : Math.random() > 0.5 ? 'hybrid' : 'onsite';
          const randomCompany = companies[Math.floor(Math.random() * companies.length)];
          const randomLocation = locations[Math.floor(Math.random() * locations.length)];
          const randomMatchPercentage = Math.floor(Math.random() * 40) + 60; // 60-99%
          
          return {
            id: (i + 1).toString(),
            title: `${randomPrefix}${randomTitle}`,
            company: randomCompany,
            location: randomLocation,
            salary: {
              min: randomLevel === 'intern' ? 20 : randomSalaryMin,
              max: randomLevel === 'intern' ? 30 : randomSalaryMax,
              currency: '$'
            },
            type: randomType,
            level: randomLevel,
            description: `We are looking for a talented ${randomTitle} to join our growing team. The ideal candidate will have experience with ${randomSkills.slice(0, 3).join(', ')} and a passion for building high-quality software.`,
            requirements: randomRequirements,
            postedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
            skills: randomSkills,
            applyUrl: `https://${platforms[Math.floor(Math.random() * platforms.length)]}/jobs/example${i + 1}`,
            remote: randomRemote,
            workModel: randomWorkModel,
            responsibilities: randomResponsibilities,
            benefits: randomBenefits,
            matchPercentage: randomMatchPercentage,
            matchCriteria: {
              degree: Math.random() > 0.5,
              experience: Math.random() > 0.5,
              skills: Math.random() > 0.5,
              location: Math.random() > 0.5,
            },
            companyType: Math.random() > 0.5 ? 'public' : 'private',
            companySize: Math.random() > 0.5 ? 'enterprise' : 'mid-size',
          };
        });
      };
      
      const sampleJobs = generateSampleJobs(25);
      setJobs(sampleJobs);
    };
    
    fetchJobs();
  }, []);
  
  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSaveJob = (job: Job) => {
    if (savedJobIds.includes(job.id)) {
      setSavedJobIds(savedJobIds.filter(id => id !== job.id));
      toast({
        title: "Removed from saved jobs",
        description: `${job.title} at ${job.company} has been removed from your saved jobs.`,
      });
    } else {
      setSavedJobIds([...savedJobIds, job.id]);
      toast({
        title: "Job saved",
        description: `${job.title} at ${job.company} has been saved to your profile.`,
      });
    }
  };
  
  const handleApplyJob = (job: Job) => {
    if (!appliedJobIds.includes(job.id)) {
      setAppliedJobIds([...appliedJobIds, job.id]);
      
      toast({
        title: "Application submitted",
        description: `Your application to ${job.company} for ${job.title} has been submitted.`,
      });
      
      if (job.applyUrl) {
        window.open(job.applyUrl, '_blank');
      }
    }
  };
  
  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setShowDetailView(true);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
        {!showDetailView ? (
          <div className="p-3">
            <h1 className="text-xl font-bold mb-3">Search All Jobs</h1>
            
            <div className="relative mb-3">
              <Input
                type="text"
                placeholder="Search for roles, companies, or locations"
                className="pl-9 pr-9 py-2 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 h-10 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="h-3.5 w-3.5" />}
                iconPosition="left"
                onClear={handleClearSearch}
              />
            </div>
            
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 no-scrollbar">
              <Button
                variant="outline"
                className="rounded-full border-gray-200 dark:border-gray-700 py-1 px-3 text-xs flex-shrink-0 bg-white dark:bg-gray-800 h-8"
              >
                <SlidersHorizontal className="w-3 h-3 mr-1.5" />
                Filter Jobs
              </Button>
              
              <Button
                variant="outline"
                className="rounded-full border-gray-200 dark:border-gray-700 px-3 py-1 text-xs flex-shrink-0 bg-white dark:bg-gray-800 h-8"
              >
                Save Search
              </Button>
              
              <Button
                variant="outline"
                className="rounded-full border-gray-200 dark:border-gray-700 px-3 py-1 text-xs flex-shrink-0 bg-white dark:bg-gray-800 h-8"
              >
                Clear
              </Button>
            </div>
            
            <div className="flex items-center justify-between py-1.5 border-t border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Showing {filteredJobs.length} of {jobs.length} Jobs
              </span>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Most recent
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
      
      <main className={`flex-1 ${!showDetailView ? 'pt-[158px]' : ''}`}>
        {!showDetailView ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredJobs.map(job => (
              <MobileJobCard
                key={job.id}
                job={job}
                isSaved={savedJobIds.includes(job.id)}
                onSave={() => handleSaveJob(job)}
                onClick={() => handleSelectJob(job)}
              />
            ))}
          </div>
        ) : (
          <MobileJobDetail
            job={selectedJob}
            onApply={handleApplyJob}
            onSave={handleSaveJob}
            onBack={() => setShowDetailView(false)}
            isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
            isApplied={selectedJob ? appliedJobIds.includes(selectedJob.id) : false}
          />
        )}
      </main>
    </div>
  );
}
