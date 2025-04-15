import React, { useState } from "react";
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Building2, 
  BookmarkIcon, 
  ExternalLinkIcon, 
  Zap,
  ArrowLeft,
  Share2,
  Flag,
  CheckCircle,
  Users
} from "lucide-react";
import { CandidateMatchPreferences } from "@/components/CandidateMatchPreferences";

interface MobileJobDetailProps {
  job: Job | null;
  onApply: (job: Job) => void;
  onSave: (job: Job) => void;
  onBack: () => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

const capitalizeFirstLetter = (string: string) => {
  return string.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('-');
};

export function MobileJobDetail({ 
  job, 
  onApply, 
  onSave, 
  onBack,
  isSaved = false,
  isApplied = false
}: MobileJobDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  if (!job) {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <p>No job selected</p>
      </div>
    );
  }

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

  const companyNews = [
    {
      source: "AdvisorHub",
      date: "Mar 13th, 2025",
      title: `${job.company} Recruits $1.35 Billion Team From Raymond James in Georgia`,
      snippet: `${job.company} Financial on Wednesday landed a team managing $1.35 billion in client assets from...`
    },
    {
      source: "MarketBeat",
      date: "Mar 12th, 2025",
      title: "SHEPHERD WEALTH MANAGEMENT Ltd LIABILITY Co Invests $862,000 in IES Holdings, Inc.",
      snippet: `Finally, ${job.company} Financial Corp acquired a new stake in IES in the third quarter valued at about $631,000.`
    },
    {
      source: "Investing.com",
      date: "Mar 11th, 2025",
      title: `${job.company} maintains Buy rating and $64 target on Las Vegas Sands stock`,
      snippet: `${job.company} analysts reaffirmed their positive view on the casino operator, citing strong recovery in Macau operations.`
    }
  ];

  const companyDetails = {
    size: job.companySize === 'enterprise' ? '5,001-10,000' : '100-500',
    stage: job.companyType === 'public' ? 'IPO' : 'Series C',
    headquarters: `${job.location.split(',')[0]}, ${job.location.includes(',') ? job.location.split(',')[1].trim() : 'USA'}`,
    founded: 2023 - Math.floor(Math.random() * 50) - 5
  };

  const companyUniquePoints = [
    `${job.company} Discover offers personalized financial content, enhancing user engagement through AI and data analytics.`,
    `Sponsorship of Haskins and ANNIKA Awards boosts brand visibility among younger demographics.`,
    `${job.company}'s recruitment of a $1.35 billion team shows competitive edge in talent acquisition.`
  ];

  const enhancedBenefits = [
    "Health Insurance",
    "Dental Insurance",
    "Vision Insurance",
    "Life Insurance",
    "401(k) Retirement Plan",
    "Wellness Program",
    "Paid Vacation",
    "Professional Development",
    "Tuition Reimbursement",
    "Employee Assistance Program"
  ];

  const handleApply = () => {
    if (job.applyUrl) {
      window.open(job.applyUrl, '_blank', 'noopener,noreferrer');
    }
    onApply(job);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-1" aria-label="Back to job list">
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <div className="flex space-x-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="w-5"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <Badge className="bg-blue-50 text-blue-600 border-0 rounded-full px-4 py-1.5 text-sm">
                  {job.level === 'intern' 
                    ? 'Internship' 
                    : capitalizeFirstLetter(job.type)
                  }
                </Badge>
                
                {job.matchPercentage && (
                  <Badge variant="outline" className={`px-3 py-1.5 rounded-full ${getMatchBgColor(job.matchPercentage)} ${getMatchColor(job.matchPercentage)} text-sm font-bold shadow-sm flex items-center gap-1.5`}>
                    {job.matchPercentage}% Match
                  </Badge>
                )}
              </div>
              
              <h1 className="text-2xl font-bold mt-2">{job.title}</h1>
              
              <p className="text-gray-500 mt-1">
                Confirmed live in the last 24 hours
              </p>
              
              <div className="mt-5 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-500">{job.company.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-lg font-medium">{job.company}</h2>
                  <p className="text-sm text-gray-500">
                    {job.companySize === 'enterprise' ? '5,001-10,000 employees' : 'Growing company'}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
                <h3 className="font-medium">Compensation Overview</h3>
                <div className="mt-3 flex items-center text-xl font-medium">
                  <span className="text-primary mr-2">💰</span>
                  {job.salary.currency}{job.salary.min.toLocaleString()} - {job.salary.currency}{job.salary.max.toLocaleString()} {job.type === 'internship' ? '/hr' : ''}
                </div>
                {job.type !== 'internship' && (
                  <p className="mt-1 text-gray-500">+ Bonus</p>
                )}
              </div>
              
              <div className="mt-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span>{job.location}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Building2 className="h-5 w-5 text-gray-500" />
                  <span>Category</span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.category && (
                    <Badge variant="secondary" className="rounded-full px-4 py-2">
                      {job.category}
                    </Badge>
                  )}
                  {job.jobFunction && (
                    <Badge variant="secondary" className="rounded-full px-4 py-2">
                      {job.jobFunction}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>Required Skills</span>
                </div>
                
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.skills.slice(0, 4).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="rounded-full px-4 py-2">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {job.matchPercentage && (
                <div className={`mt-6 p-4 rounded-lg ${getMatchBgColor(job.matchPercentage)}`}>
                  <div className="flex items-center gap-2">
                    <div className={`text-xl font-bold ${getMatchColor(job.matchPercentage)}`}>{job.matchPercentage}%</div>
                    <div className={`font-semibold ${getMatchColor(job.matchPercentage)}`}>
                      {job.matchPercentage >= 70 ? "GOOD MATCH" : 
                       job.matchPercentage >= 50 ? "FAIR MATCH" : "WEAK MATCH"}
                    </div>
                  </div>
                  <p className="text-sm mt-1">Based on your profile, skills, and experience</p>
                  <div className="text-xs mt-2 text-gray-600">
                    Match percentage is calculated by comparing your resume keywords with job requirements
                  </div>
                </div>
              )}
              
              <div className="mt-6 border-t pt-6">
                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="full-posting">Full Job Posting</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="summary" className="mt-4">
                    {job.matchCriteria && (
                      <div className="mb-6">
                        <h3 className="font-medium mb-2">
                          You match the following {job.company}'s candidate preferences
                        </h3>
                        
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-3">
                          ✨ Employers are more likely to interview you if you match these preferences:
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {job.matchCriteria.degree && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <CheckCircle className="text-green-500 h-5 w-5" />
                              <span>Degree</span>
                            </div>
                          )}
                          
                          {job.matchCriteria.experience && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <CheckCircle className="text-green-500 h-5 w-5" />
                              <span>Experience</span>
                            </div>
                          )}
                          
                          {job.matchCriteria.skills && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <CheckCircle className="text-green-500 h-5 w-5" />
                              <span>Skills</span>
                            </div>
                          )}
                          
                          {job.matchCriteria.location && (
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <CheckCircle className="text-green-500 h-5 w-5" />
                              <span>Location</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Requirements</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        {enhancedRequirements.slice(0, 4).map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="full-posting" className="mt-4">
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-2">Requirements</h3>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                          {enhancedRequirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {job.responsibilities && (
                        <div>
                          <h3 className="font-medium mb-2">Responsibilities</h3>
                          <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                            {job.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {job.description && (
                        <div>
                          <h3 className="font-medium mb-2">Description</h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            {job.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="company" className="mt-0">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-500">{job.company.charAt(0)}</span>
                </div>
                <div>
                  <h2 className="text-xl font-medium">{job.company}</h2>
                  <div className="flex gap-3 mt-2">
                    <Button variant="outline" size="sm" className="h-9 px-3 rounded-full">
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      Website
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full">
                      X
                    </Button>
                    
                    <Button variant="outline" size="sm" className="h-9 w-9 p-0 rounded-full">
                      <span className="text-blue-600">in</span>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-gray-500">Company Size</h3>
                  <p className="mt-1 font-medium">
                    {companyDetails.size}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Company Stage</h3>
                  <p className="mt-1 font-medium">
                    {companyDetails.stage}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Headquarters</h3>
                  <p className="mt-1 font-medium">
                    {companyDetails.headquarters}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Founded</h3>
                  <p className="mt-1 font-medium">
                    {companyDetails.founded}
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Company News</h3>
                  
                  <div className="space-y-6">
                    {companyNews.map((news, index) => (
                      <div key={index} className="pb-4 border-b">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm text-gray-500">{news.source}</span>
                          <span className="text-sm text-gray-500">{news.date}</span>
                        </div>
                        <h4 className="text-primary font-medium">
                          {news.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {news.snippet}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">What makes {job.company} unique</h3>
                  
                  <div className="space-y-3">
                    {companyUniquePoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <p>{point}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Benefits</h3>
                  
                  <div className="space-y-3">
                    {enhancedBenefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-3 border-t flex items-center justify-between bg-white dark:bg-gray-900 sticky bottom-0">
        <button 
          className="text-primary text-sm"
          onClick={() => {}}
        >
          Already Applied?
        </button>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onSave(job!);
            }}
            aria-label={isSaved ? "Unsave job" : "Save job"}
          >
            <BookmarkIcon className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : ""}`} />
          </Button>
          
          <Button
            size="lg"
            className="bg-primary rounded-lg px-6 h-10"
            onClick={handleApply}
            disabled={isApplied}
          >
            {isApplied ? (
              <CheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <Zap className="h-5 w-5 mr-2" />
            )}
            {isApplied ? "Applied" : "Apply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
