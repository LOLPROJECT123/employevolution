import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  Clock, 
  BookmarkIcon, 
  ExternalLinkIcon, 
  BadgeCheck, 
  CheckCircle2, 
  Zap,
  Users,
  Calendar,
  Award,
  Globe,
  HeartHandshake,
  Newspaper,
  Percent
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { detectPlatform, startAutomation } from "@/utils/automationUtils";
import AutomationSettings from "@/components/AutomationSettings";
import { useJobApplications } from "@/contexts/JobApplicationContext";

interface JobDetailViewProps {
  job: Job | null;
  onApply?: (job: Job) => void;
  onSave?: (job: Job) => void;
}

export function JobDetailView({ job, onApply, onSave }: JobDetailViewProps) {
  const [isApplying, setIsApplying] = useState(false);
  const { saveJob, applyToJob, savedJobs, appliedJobs, getApplicationByJobId } = useJobApplications();
  
  const handleSaveJob = onSave || saveJob;
  const handleApplyToJob = onApply || applyToJob;
  
  const canAutomate = job?.applyUrl ? detectPlatform(job.applyUrl) !== null : false;
  
  const automationEnabled = (() => {
    try {
      const config = JSON.parse(localStorage.getItem('automationConfig') || '{}');
      return config?.credentials?.enabled || false;
    } catch (e) {
      return false;
    }
  })();

  const platform = job?.applyUrl ? detectPlatform(job.applyUrl) : null;

  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="max-w-md mx-auto">
          <div className="mx-auto w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No Job Selected</h3>
          <p className="text-muted-foreground mt-2">
            Select A Job From The List To View Details
          </p>
        </div>
      </div>
    );
  }

  const formattedSalary = `${job.salary.currency}${job.salary.min.toLocaleString()} - ${job.salary.currency}${job.salary.max.toLocaleString()}`;
  
  const getMatchColor = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getMatchBgColor = (percentage?: number) => {
    if (!percentage) return "bg-gray-100 dark:bg-gray-800";
    if (percentage >= 70) return "bg-green-50 dark:bg-green-900/30";
    if (percentage >= 50) return "bg-amber-50 dark:bg-amber-900/30";
    return "bg-red-50 dark:bg-red-900/30";
  };

  const getMatchLabel = (percentage?: number) => {
    if (!percentage) return "";
    if (percentage >= 70) return "GOOD MATCH";
    if (percentage >= 50) return "FAIR MATCH";
    return "WEAK MATCH";
  };

  const enhancedRequirements = [
    "Ability to organize large amounts of information and prioritize workload to meet deadlines, ensuring projects are completed efficiently and on time.",
    "Effectively collaborate and work as a team with a diverse group of individuals, demonstrating strong interpersonal skills and adaptability in cross-functional environments.",
    "Proficient in Microsoft Excel, Word, PowerPoint, and Outlook, with advanced knowledge of spreadsheet functions, document formatting, and presentation design.",
    "Minimum Required: 2+ years of industry related college coursework, demonstrating foundational knowledge and commitment to the field.",
    "Strong attention to detail with the ability to maintain accuracy while managing multiple tasks simultaneously.",
    "Excellent written and verbal communication skills with experience interacting with clients and stakeholders at all levels."
  ];

  const enhancedResponsibilities = [
    "Administrative duties as needed such as answering phones, filing, scanning, travel and expense reports, data entry, and scheduling appointments, ensuring smooth daily operations and efficient workflow.",
    "Collection of information needed for performance reports and coordinating the appropriate paperwork and materials for client meetings, including preparation of presentation materials and follow-up documentation.",
    "Perform general clerical duties related to daily branch operation, including maintaining electronic and physical filing systems, handling correspondence, and ensuring compliance with company policies.",
    "Participate in special projects as assigned, contributing to cross-functional team initiatives and providing administrative support to meet project goals and deadlines.",
    "Coordinate internal and external communications, drafting professional emails and documents while maintaining brand consistency.",
    "Support senior staff by preparing reports, analyzing data, and creating visual presentations for stakeholder meetings."
  ];

  const companyInfo = {
    size: job.companySize === 'enterprise' ? '5,000-10,000 employees' : 
          job.companySize === 'large' ? '1,000-5,000 employees' : 
          job.companySize === 'mid-size' ? '100-1,000 employees' : 
          job.companySize === 'early' ? '10-100 employees' : '1-10 employees',
    headquarters: `${job.location.split(',')[0]}, ${job.location.includes(',') ? job.location.split(',')[1].trim() : 'USA'}`,
    founded: 2023 - Math.floor(Math.random() * 50) - 5,
    stage: job.companyType === 'public' ? 'Public (IPO)' : 
           job.companyType === 'private' ? 'Private (Series C)' : 
           job.companyType === 'nonprofit' ? 'Non-Profit' : 'Educational Institution'
  };

  const companyNews = [
    {
      source: "Business News",
      date: "2 days ago",
      title: `${job.company} Secures $25M Series B Funding`,
      snippet: `${job.company} announced closing a $25M Series B round led by Venture Partners, focusing on expanding their product offerings and entering new markets.`
    },
    {
      source: "Tech Daily",
      date: "1 week ago",
      title: `${job.company} Partners With Industry Leader for Joint Initiative`,
      snippet: `A strategic partnership between ${job.company} and IndustryLeader aims to revolutionize how companies approach digital transformation.`
    },
    {
      source: "Market Insight",
      date: "2 weeks ago",
      title: `${job.company} Reports Record Q2 Growth`,
      snippet: `${job.company} announced record-breaking second quarter results with 45% year-over-year growth in their core business segments.`
    }
  ];

  const enhancedBenefits = [
    "Comprehensive health, dental, and vision insurance with coverage for dependents",
    "401(k) retirement plan with generous company matching up to 6%",
    "Flexible work arrangements including hybrid and remote options",
    "Professional development stipend of $2,500 annually",
    "15 days paid time off plus 10 paid holidays and 2 floating personal days",
    "Parental leave policy offering 16 weeks fully paid for primary caregivers",
    "Mental health resources including free counseling sessions",
    "Gym membership reimbursement and wellness program incentives",
    "Employee stock purchase plan with discounted rates",
    "Tuition reimbursement for approved educational programs"
  ];

  const companyValues = [
    "Innovation - We constantly seek new solutions and embrace creative thinking",
    "Integrity - We uphold the highest ethical standards in all our interactions",
    "Collaboration - We believe the best outcomes come from teamwork and diverse perspectives",
    "Customer Focus - We put our customers at the center of everything we do",
    "Excellence - We pursue continuous improvement and exceptional quality"
  ];

  const handleApplyClick = async () => {
    try {
      setIsApplying(true);
      handleApplyToJob(job);
    } catch (error) {
      toast.error("Failed To Apply", {
        description: "There Was An Error Submitting Your Application. Please Try Again."
      });
      console.error("Application error:", error);
    } finally {
      setIsApplying(false);
    }
  };
  
  const handleAutomatedApply = () => {
    try {
      if (!job.applyUrl) {
        toast.error("Cannot Automate Application", {
          description: "This Job Doesn't Have An Application URL."
        });
        return;
      }
      
      const automationConfig = localStorage.getItem('automationConfig');
      if (!automationConfig) {
        toast.error("Automation Not Configured", {
          description: "Please Configure Your Automation Settings First."
        });
        return;
      }
      
      const config = JSON.parse(automationConfig);
      
      startAutomation(job.applyUrl, config);
      
      toast.success("Automation Initiated", {
        description: `The Automation Script Will Now Apply To This Job On ${platform || 'The Job Platform'}. Please Check The Browser Extension For Details.`
      });
      
      handleApplyToJob(job);
    } catch (error) {
      toast.error("Automation Failed", {
        description: "There Was An Error Starting The Automation Process."
      });
      console.error("Automation error:", error);
    }
  };

  const getAutomationButtonText = () => {
    switch(platform) {
      case 'linkedin':
        return "AutoApply With LinkedIn Script";
      case 'indeed':
        return "AutoApply With Indeed Script";
      case 'handshake':
        return "AutoApply With Handshake Script";
      default:
        return "AutoApply With Script";
    }
  };

  const isSaved = savedJobs.some(j => j.id === job.id);
  const isApplied = appliedJobs.some(j => j.id === job.id);
  const application = getApplicationByJobId(job.id);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b relative">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{job.title}</h2>
            
            <div className="space-y-2 mt-3">
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" /> {job.company}
              </p>
              
              <p className="text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {job.location}
              </p>
              
              <p className="text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> Posted {new Date(job.postedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {job.matchPercentage && (
            <div className="mr-4">
              <Badge variant="outline" className={`px-3 py-1.5 rounded-full ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} text-sm font-bold shadow-sm flex items-center gap-1.5`}>
                <Percent className="w-4 h-4" />
                {job.matchPercentage}% Match
              </Badge>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant={isSaved ? "default" : "outline"}
              size="icon"
              onClick={() => handleSaveJob(job)}
              className="button-hover"
            >
              <BookmarkIcon className="w-4 h-4" />
            </Button>
            {job.applyUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(job.applyUrl, '_blank')}
                className="button-hover"
              >
                <ExternalLinkIcon className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {job.remote && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Remote
            </Badge>
          )}
          <Badge variant="secondary" className="capitalize">{job.type}</Badge>
          <Badge variant="secondary" className="capitalize">{job.level}</Badge>
          <Badge variant="outline">{formattedSalary}</Badge>
        </div>
        
        {isApplied && application && (
          <div className="mt-3 p-2 bg-secondary/50 rounded-lg">
            <p className="text-sm font-medium">
              Status: <span className="capitalize">{application.status}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Applied on {new Date(application.appliedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
      
      <div className="p-4 border-b bg-gray-50 dark:bg-gray-800/50">
        <Button
          className="w-full py-6 text-base font-medium shadow-sm rounded-lg"
          size="lg"
          onClick={handleApplyClick}
          disabled={isApplying || isApplied}
        >
          {isApplying ? "Applying..." : isApplied ? "Applied" : "Apply Now"}
        </Button>
      </div>
      
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="summary" className="w-full flex-1 flex flex-col overflow-hidden">
          <div className="px-4 mt-4">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
              <TabsTrigger value="full-posting">Full Job Posting</TabsTrigger>
            </TabsList>
          </div>
          
          <ScrollArea className="flex-1 px-4 pb-4">
            <TabsContent value="summary" className="mt-0 space-y-6 h-full data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
              {job.matchPercentage && (
                <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-4`}>
                  <div className="flex items-center gap-2">
                    <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</div>
                    <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
                      {getMatchLabel(job.matchPercentage)}
                    </div>
                  </div>
                  <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
                </div>
              )}
              
              {job.matchCriteria && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="mb-2">
                    <p className="font-medium">You Match The Following {job.company}'s Candidate Preferences</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                      <span className="text-lg">✨</span> Employers Are More Likely To Interview You If You Match These Preferences:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {job.matchCriteria.degree && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Degree</span>
                      </div>
                    )}
                    {job.matchCriteria.experience && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Experience</span>
                      </div>
                    )}
                    {job.matchCriteria.skills && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Skills</span>
                      </div>
                    )}
                    {job.matchCriteria.location && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Location</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-3">About This Role</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {job.description.substring(0, 300)}...
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {enhancedRequirements.slice(0, 4).map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <div key={index} className="px-3 py-1 rounded-full bg-secondary/70 text-sm">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="company" className="mt-0 space-y-6 h-full data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
              <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-lg">
                <h3 className="text-lg font-medium mb-4">About {job.company}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Company Size</h4>
                      <p className="font-medium flex items-center mt-1 gap-2">
                        <Users className="w-4 h-4 text-blue-500" />
                        {companyInfo.size}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Headquarters</h4>
                      <p className="font-medium flex items-center mt-1 gap-2">
                        <Globe className="w-4 h-4 text-blue-500" />
                        {companyInfo.headquarters}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Founded</h4>
                      <p className="font-medium flex items-center mt-1 gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        {companyInfo.founded}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-gray-500">Company Stage</h4>
                      <p className="font-medium flex items-center mt-1 gap-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        {companyInfo.stage}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Company News</h3>
                <div className="space-y-4">
                  {companyNews.map((news, idx) => (
                    <div key={idx} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span className="font-medium">{news.source}</span>
                        <span>{news.date}</span>
                      </div>
                      <h4 className="font-medium text-primary mb-1">{news.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{news.snippet}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Benefits</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {enhancedBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Company Values & Culture</h3>
                <div className="grid gap-3">
                  {companyValues.map((value, idx) => (
                    <div key={idx} className="bg-secondary/30 p-3 rounded-lg">
                      <p className="text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="full-posting" className="mt-0 space-y-6 h-full data-[state=active]:flex-1 data-[state=active]:flex data-[state=active]:flex-col">
              {job.matchPercentage && (
                <div className={`p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)} mb-4`}>
                  <div className="flex items-center gap-2">
                    <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</div>
                    <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
                      {getMatchLabel(job.matchPercentage)}
                    </div>
                  </div>
                  <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
                </div>
              )}
              
              {job.matchCriteria && (
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="mb-2">
                    <p className="font-medium">You Match The Following {job.company}'s Candidate Preferences</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 flex items-center gap-1 mt-1">
                      <span className="text-lg">✨</span> Employers Are More Likely To Interview You If You Match These Preferences:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {job.matchCriteria.degree && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Degree</span>
                      </div>
                    )}
                    {job.matchCriteria.experience && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Experience</span>
                      </div>
                    )}
                    {job.matchCriteria.skills && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Skills</span>
                      </div>
                    )}
                    {job.matchCriteria.location && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                        <span>Location</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-3">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                  {job.description}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Responsibilities</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {enhancedResponsibilities.map((responsibility, idx) => (
                    <li key={idx}>{responsibility}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Requirements</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {enhancedRequirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>
              
              {job.education && job.education.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Education</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {job.education.map((edu, idx) => (
                      <li key={idx}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-3">Benefits</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  {enhancedBenefits.map((benefit, idx) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                  {job.type}
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                  {job.level}
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary text-sm">
                  {formattedSalary}
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Clock className="w-4 h-4 mr-2" />
                Posted on {new Date(job.postedAt).toLocaleDateString()}
              </div>
              
              {job.applyUrl && (
                <div className="p-4 rounded-lg bg-secondary/20 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="w-5 h-5 text-primary" />
                    <span className="font-medium">Application Details</span>
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Click the "Apply Now" button to visit the application page.
                  </p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
      
      <div className="border-t p-4">
        <div className="flex gap-3">
          <Button
            variant={isSaved ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleSaveJob(job)}
          >
            {isSaved ? "Saved" : "Save Job"}
          </Button>
          
          {job.applyUrl && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(job.applyUrl, '_blank')}
            >
              Visit Job Page
            </Button>
          )}
        </div>
        
        {canAutomate && automationEnabled && !isApplied && (
          <div className="mt-3">
            <Button
              variant="outline"
              className="w-full bg-primary/10 hover:bg-primary/20"
              onClick={handleAutomatedApply}
            >
              <Zap className="w-4 h-4 mr-2" />
              {getAutomationButtonText()}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
