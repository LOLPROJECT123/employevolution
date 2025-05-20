
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Job } from '@/types/job';
import { formatSalary } from '@/utils/formatters';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { 
  BookmarkIcon, 
  Check, 
  ExternalLink, 
  MapPin, 
  Building, 
  Calendar, 
  CircleDollarSign,
  Briefcase,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { JobMatchDetails } from '@/components/JobMatchDetails';

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch the job details from an API
    // For now, try to get it from localStorage
    const fetchJob = async () => {
      try {
        setLoading(true);
        
        // In this mock implementation, we'll generate a sample job
        // In a real app, you would fetch from an API using the id
        const mockJob: Job = {
          id: id || 'mock-job',
          title: 'Senior Software Engineer',
          company: 'Tech Company Inc.',
          location: 'San Francisco, CA',
          salary: {
            min: 120000,
            max: 180000,
            currency: 'USD',
          },
          type: 'full-time',
          level: 'senior',
          description: 'We are looking for an experienced Software Engineer to join our growing team. You will work on cutting-edge technologies and help shape the future of our products.',
          requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            '5+ years of experience with modern JavaScript frameworks',
            'Experience with React, Node.js, and TypeScript',
            'Understanding of cloud services (AWS, Azure, GCP)',
            'Experience with CI/CD pipelines',
          ],
          postedAt: '2023-05-15T12:00:00Z',
          skills: ['JavaScript', 'React', 'TypeScript', 'Node.js', 'AWS', 'Docker'],
          matchPercentage: 92,
          remote: true,
          workModel: 'remote',
          datePosted: '2023-05-15',
          responsibilities: [
            'Develop high-quality web applications using React',
            'Collaborate with cross-functional teams to define, design, and ship new features',
            'Ensure the technical feasibility of UI/UX designs',
            'Optimize application for maximum speed and scalability',
            'Identify and correct bottlenecks and fix bugs',
          ],
          applicationDetails: {
            applicantCount: 34,
            isAvailable: true,
          },
          keywordMatch: {
            score: 92,
            found: 8,
            total: 10,
            highPriority: {
              keywords: ['JavaScript', 'React', 'TypeScript'],
              found: 3,
              total: 3,
            },
            lowPriority: {
              keywords: ['Node.js', 'AWS', 'Docker', 'CI/CD', 'Cloud Services'],
              found: 5,
              total: 7,
            },
          },
          matchCriteria: {
            degree: true,
            experience: true,
            skills: true,
            location: true,
          },
        };
        
        setJob(mockJob);
        
        // Check if this job is saved or applied
        const savedJobs = localStorage.getItem('savedJobs');
        if (savedJobs) {
          const savedJobIds = JSON.parse(savedJobs);
          setIsSaved(savedJobIds.includes(mockJob.id));
        }
        
        const appliedJobs = localStorage.getItem('appliedJobs');
        if (appliedJobs) {
          const appliedJobIds = JSON.parse(appliedJobs);
          setIsApplied(appliedJobIds.includes(mockJob.id));
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  const handleSaveJob = () => {
    if (!job) return;
    
    try {
      const savedJobs = localStorage.getItem('savedJobs');
      let savedJobIds = savedJobs ? JSON.parse(savedJobs) : [];
      
      if (isSaved) {
        // Remove from saved jobs
        savedJobIds = savedJobIds.filter((jobId: string) => jobId !== job.id);
        toast.success('Job removed from saved jobs');
      } else {
        // Add to saved jobs
        savedJobIds.push(job.id);
        toast.success('Job saved successfully');
      }
      
      localStorage.setItem('savedJobs', JSON.stringify(savedJobIds));
      setIsSaved(!isSaved);
      
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  const handleApplyJob = () => {
    if (!job) return;
    
    try {
      if (isApplied) {
        toast.info('You have already applied to this job');
        return;
      }
      
      const appliedJobs = localStorage.getItem('appliedJobs');
      const appliedJobIds = appliedJobs ? JSON.parse(appliedJobs) : [];
      
      appliedJobIds.push(job.id);
      localStorage.setItem('appliedJobs', JSON.stringify(appliedJobIds));
      
      setIsApplied(true);
      toast.success('Application submitted successfully');
      
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
        <p className="mb-6">Sorry, we couldn't find the job you're looking for.</p>
        <Button onClick={() => navigate('/jobs')}>Browse Jobs</Button>
      </div>
    );
  }

  const getMatchBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-50 dark:bg-green-900/20';
    if (percentage >= 70) return 'bg-blue-50 dark:bg-blue-900/20';
    return 'bg-gray-50 dark:bg-gray-800/50';
  };
  
  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  const getMatchLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent Match';
    if (percentage >= 80) return 'Strong Match';
    if (percentage >= 70) return 'Good Match';
    if (percentage >= 60) return 'Fair Match';
    return 'Low Match';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/30">
      <Navbar />
      
      <main className="container mx-auto max-w-5xl px-4 py-8 mt-16">
        <div className="mb-6">
          <Button 
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/jobs')}
          >
            ← Back to Jobs
          </Button>
          
          {job.matchPercentage !== undefined && (
            <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-6`}>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${getMatchColor(job.matchPercentage)}`}>
                  {job.matchPercentage}% 
                </div>
                <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
                  {getMatchLabel(job.matchPercentage)}
                </div>
              </div>
              <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <JobMatchDetails job={job} compact={false} />
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                <div className="text-xl mb-1">{job.company}</div>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location} {job.remote ? '(Remote)' : ''}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Posted {formatRelativeTime(job.postedAt)}
                </div>
                {job.applicationDetails?.applicantCount && (
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    {job.applicationDetails.applicantCount} applicants
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleApplyJob}
                  disabled={isApplied}
                  className={isApplied ? "bg-green-600 hover:bg-green-700" : ""}
                  size="lg"
                >
                  {isApplied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Applied
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Apply Now
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleSaveJob}
                  className={isSaved ? "border-primary text-primary" : ""}
                >
                  <BookmarkIcon className={`mr-2 h-4 w-4 ${isSaved ? "fill-primary" : ""}`} />
                  {isSaved ? "Saved" : "Save Job"}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-4">Job Details</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <CircleDollarSign className="h-5 w-5 text-green-500 mr-2" />
                      <span className="font-medium">Salary Range</span>
                    </div>
                    <div className="text-xl font-bold">
                      {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">Job Type</span>
                    </div>
                    <div>
                      <Badge className="capitalize">
                        {job.type.replace('-', ' ')}
                      </Badge>
                      {job.workModel && (
                        <Badge className="ml-2 capitalize">
                          {job.workModel}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <div className="mb-6 whitespace-pre-line">{job.description}</div>
                
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                      {job.responsibilities.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {job.requirements && job.requirements.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-2 mb-6">
                      {job.requirements.map((requirement, index) => (
                        <li key={index}>{requirement}</li>
                      ))}
                    </ul>
                  </>
                )}
                
                {job.skills && job.skills.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-3">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
                  <Button
                    onClick={handleApplyJob}
                    disabled={isApplied}
                    className={isApplied ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {isApplied ? "Applied" : "Apply Now"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      // This would open the company website in a real app
                      toast.info("Opening company website");
                    }}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Company Profile
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-bold">
                    {job.company.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{job.company}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {job.companySize ? job.companySize.replace('-', ' ') : 'Tech'} Company
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => toast.info("Viewing similar jobs from this company")}
                >
                  View All Jobs from This Company
                </Button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Similar Jobs</h3>
                
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="font-medium mb-1">
                        {job.title} {i}
                      </div>
                      <div className="text-sm">{job.company}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {job.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetailsPage;
