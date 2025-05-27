
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Linkedin, ExternalLink, Search, UserRound } from "lucide-react";
import JobScraper from "@/components/resume/job-application/JobScraper";
import JobSourceScraper from "@/components/resume/job-application/JobSourceScraper";
import JobApplicationForm from "@/components/resume/job-application/JobApplicationForm";
import LinkedInContactFinder from "@/components/resume/job-application/LinkedInContactFinder";
import { ScrapedJob, JobApplicationTab } from "@/components/resume/job-application/types";
import { LinkedInContact, OutreachTemplate } from "@/types/resumePost";

interface JobApplicationSectionProps {
  onJobsScraped: (jobs: ScrapedJob[]) => void;
  onJobSelected: (job: ScrapedJob) => void;
  linkedInContacts: LinkedInContact[];
  isScrapingLinkedIn: boolean;
  outreachTemplates: OutreachTemplate[];
  onSaveTemplate: (template: OutreachTemplate) => void;
  onCreateTemplate: (template: Omit<OutreachTemplate, 'id'>) => void;
  onNavigateToProfile: () => void;
  onApplicationSuccess: (jobUrl: string) => void;
}

const JobApplicationSection = ({
  onJobsScraped,
  onJobSelected,
  linkedInContacts,
  isScrapingLinkedIn,
  outreachTemplates,
  onSaveTemplate,
  onCreateTemplate,
  onNavigateToProfile,
  onApplicationSuccess
}: JobApplicationSectionProps) => {
  const [activeTab, setActiveTab] = useState<JobApplicationTab>("scraper");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Job Discovery & Application
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as JobApplicationTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="scraper" className="flex items-center gap-1">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="custom-urls" className="flex items-center gap-1">
              <ExternalLink className="h-4 w-4" />
              URLs
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-1">
              Manual
            </TabsTrigger>
            <TabsTrigger value="auto" className="flex items-center gap-1">
              Auto
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              Network
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="scraper" className="mt-4">
            <JobScraper onJobsScraped={onJobsScraped} />
          </TabsContent>
          
          <TabsContent value="custom-urls" className="mt-4">
            <JobSourceScraper onJobsScraped={onJobsScraped} />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-4">
            <JobApplicationForm 
              activeTab="manual"
              onNavigateToProfile={onNavigateToProfile}
              onSuccess={onApplicationSuccess}
            />
          </TabsContent>
          
          <TabsContent value="auto" className="mt-4">
            <JobApplicationForm 
              activeTab="auto"
              onNavigateToProfile={onNavigateToProfile}
              onSuccess={onApplicationSuccess}
            />
          </TabsContent>
          
          <TabsContent value="linkedin" className="mt-4">
            <LinkedInContactFinder 
              contacts={linkedInContacts}
              isLoading={isScrapingLinkedIn}
              templates={outreachTemplates}
              onSaveTemplate={onSaveTemplate}
              onCreateTemplate={onCreateTemplate}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default JobApplicationSection;
