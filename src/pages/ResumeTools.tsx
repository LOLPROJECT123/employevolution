
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import ATSOptimizer from "@/components/ATSOptimizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import ResumeForum from "@/components/resume/ResumeForum";
import ResumeTemplates from "@/components/resume/ResumeTemplates";
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
              <div className="pb-16">  {/* Increased padding at bottom from 10 to 16 */}
                <TabsList className="w-full mb-2 grid grid-cols-2 gap-x-2 gap-y-2">
                  <TabsTrigger value="ats-optimizer" className="p-2 text-sm whitespace-normal h-auto">ATS Optimizer</TabsTrigger>
                  <TabsTrigger value="ai-resume-creator" className="p-2 text-sm whitespace-normal h-auto">AI Resume Creator</TabsTrigger>
                  <TabsTrigger value="ai-cv-creator" className="p-2 text-sm whitespace-normal h-auto">AI CV Creator</TabsTrigger>
                  <TabsTrigger value="forum" className="p-2 text-sm whitespace-normal h-auto">Resume Forum</TabsTrigger>
                  <TabsTrigger value="templates" className="p-2 text-sm whitespace-normal h-auto">Templates</TabsTrigger>
                </TabsList>
              </div>
            ) : (
              <TabsList className="flex flex-wrap">
                <TabsTrigger value="ats-optimizer">ATS Optimizer</TabsTrigger>
                <TabsTrigger value="ai-resume-creator">AI Resume Creator</TabsTrigger>
                <TabsTrigger value="ai-cv-creator">AI CV Creator</TabsTrigger>
                <TabsTrigger value="forum">Resume Forum</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
              </TabsList>
            )}
            
            <TabsContent value="ats-optimizer" className={isMobile ? "mt-4" : ""}>
              <ATSOptimizer />
            </TabsContent>
            
            <TabsContent value="ai-resume-creator" className={isMobile ? "mt-4" : ""}>
              <AIResumeCreator />
            </TabsContent>
            
            <TabsContent value="ai-cv-creator" className={isMobile ? "mt-4" : ""}>
              <AICVCreator />
            </TabsContent>
            
            <TabsContent value="forum" className={isMobile ? "mt-4" : ""}>
              <ResumeForum />
            </TabsContent>
            
            <TabsContent value="templates" className={isMobile ? "mt-4" : ""}>
              <ResumeTemplates />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ResumeTools;
