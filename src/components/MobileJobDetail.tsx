
import { useState } from "react";
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

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <button onClick={onBack} className="p-1">
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
        
        <div className="w-5"></div> {/* Spacer for alignment */}
      </header>
      
      <div className="flex-1 overflow-y-auto">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            <div className="p-4">
              <Badge className="bg-blue-50 text-blue-600 border-0 rounded-full px-4 py-1.5 text-sm">
                {job.level === 'intern' ? 'Internship' : job.type}
              </Badge>
              
              <h1 className="text-2xl font-bold mt-4">{job.title}</h1>
              
              <p className="text-gray-500 mt-1">
                Confirmed live in the last 24 hours
              </p>
              
              {!isApplied && (
                <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center">
                  <span className="text-sm">Unlock job views with</span>
                  <span className="ml-1 text-primary font-medium">JobSearch+</span>
                </div>
              )}
              
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
                  {job.salary.currency}{job.salary.min.toLocaleString()} {job.type === 'internship' ? '/hr' : ''}
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
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Requirements</h3>
                      <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                        {job.requirements.map((req, idx) => (
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
                          {job.requirements.map((req, idx) => (
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
                    {job.companySize === 'enterprise' ? '5,001-10,000' : '100-500'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Company Stage</h3>
                  <p className="mt-1 font-medium">
                    {job.companyType === 'public' ? 'IPO' : 'Series C'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Headquarters</h3>
                  <p className="mt-1 font-medium">
                    {job.location.split(',')[0]}, {job.location.includes(',') ? job.location.split(',')[1].trim() : 'USA'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm text-gray-500">Founded</h3>
                  <p className="mt-1 font-medium">
                    {2023 - Math.floor(Math.random() * 50) - 5}
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Company News</h3>
                  
                  <div className="space-y-6">
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm text-gray-500">AdvisorHub</span>
                        <span className="text-sm text-gray-500">Mar 13th, 2025</span>
                      </div>
                      <h4 className="text-primary font-medium">
                        {job.company} Recruits $1.35 Billion Team From Raymond James in Georgia
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {job.company} Financial on Wednesday landed a team managing $1.35 billion in client assets from...
                      </p>
                    </div>
                    
                    <div className="pb-4 border-b">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm text-gray-500">MarketBeat</span>
                        <span className="text-sm text-gray-500">Mar 12th, 2025</span>
                      </div>
                      <h4 className="text-primary font-medium">
                        SHEPHERD WEALTH MANAGEMENT Ltd LIABILITY Co Invests $862,000 in IES Holdings, Inc.
                      </h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        Finally, {job.company} Financial Corp acquired a new stake in IES in the third quarter valued at about $631,000.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Benefits</h3>
                  
                  <div className="space-y-3">
                    {job.benefits?.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-teal-500" />
                        <span>{benefit}</span>
                      </div>
                    )) || (
                      <>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-teal-500" />
                          <span>Health Insurance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-teal-500" />
                          <span>Dental Insurance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-teal-500" />
                          <span>Vision Insurance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-teal-500" />
                          <span>401(k) Retirement Plan</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="p-4 border-t flex items-center justify-between bg-white dark:bg-gray-900 sticky bottom-0">
        <button 
          className="text-primary text-sm"
          onClick={() => {}}
        >
          Already Applied?
        </button>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-lg"
            onClick={() => onSave(job)}
          >
            <BookmarkIcon className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : ""}`} />
          </Button>
          
          <Button
            size="lg"
            className="bg-primary rounded-lg px-6 h-12"
            onClick={() => onApply(job)}
          >
            <Zap className="h-5 w-5 mr-2" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
