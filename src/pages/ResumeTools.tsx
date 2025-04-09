
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import ATSOptimizer from "@/components/ATSOptimizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import JobApplicationAutomation from "@/components/resume/JobApplicationAutomation";
import { useMobile } from "@/hooks/use-mobile";
import MobileHeader from "@/components/MobileHeader";
import { ScrollArea } from "@/components/ui/scroll-area";

const ResumeTools = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Resume Tools" />}
      
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume & CV Tools</h1>
            <p className="text-muted-foreground mt-1 mb-6">
              Create, optimize, and get feedback on your professional documents to increase your chances of landing interviews
            </p>
          </div>
          
          <Tabs defaultValue="ats-optimizer" className="space-y-8">
            {isMobile ? (
              <div className="overflow-x-auto pb-4">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="ats-optimizer" className="px-3 py-2 text-sm whitespace-normal h-auto">ATS Optimizer</TabsTrigger>
                  <TabsTrigger value="ai-resume-creator" className="px-3 py-2 text-sm whitespace-normal h-auto">AI Resume Creator</TabsTrigger>
                  <TabsTrigger value="ai-cv-creator" className="px-3 py-2 text-sm whitespace-normal h-auto">AI CV Creator</TabsTrigger>
                </TabsList>
                <TabsList className="w-full grid grid-cols-3 mt-2">
                  <TabsTrigger value="job-automation" className="px-3 py-2 text-sm whitespace-normal h-auto">Job Automation</TabsTrigger>
                  <TabsTrigger value="forum" className="px-3 py-2 text-sm whitespace-normal h-auto">Resume Forum</TabsTrigger>
                  <TabsTrigger value="templates" className="px-3 py-2 text-sm whitespace-normal h-auto">Templates</TabsTrigger>
                </TabsList>
              </div>
            ) : (
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="ats-optimizer">ATS Optimizer</TabsTrigger>
                <TabsTrigger value="ai-resume-creator">AI Resume Creator</TabsTrigger>
                <TabsTrigger value="ai-cv-creator">AI CV Creator</TabsTrigger>
                <TabsTrigger value="job-automation">Job Automation</TabsTrigger>
                <TabsTrigger value="forum">Resume Forum</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
            )}
            
            <TabsContent value="ats-optimizer" className="mt-8">
              <ATSOptimizer />
            </TabsContent>
            
            <TabsContent value="ai-resume-creator" className="mt-8">
              <AIResumeCreator />
            </TabsContent>
            
            <TabsContent value="ai-cv-creator" className="mt-8">
              <AICVCreator />
            </TabsContent>
            
            <TabsContent value="job-automation" className="mt-8">
              <JobApplicationAutomation />
            </TabsContent>
            
            <TabsContent value="forum" className="mt-8">
              <div className="grid place-items-center p-12">
                <p className="text-muted-foreground">Forum content will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="mt-8">
              <div className="grid place-items-center p-12">
                <p className="text-muted-foreground">Resume and cover letter templates will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ResumeTools;
