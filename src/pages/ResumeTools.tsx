
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import ATSOptimizer from "@/components/ATSOptimizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import JobApplicationAutomation from "@/components/resume/JobApplicationAutomation";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader, MobileSidebar } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";

const ResumeTools = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {/* Only show Navbar on desktop */}
      {isMobile ? (
        <>
          <MobileHeader onMenuToggle={toggleMobileMenu} />
          <MobileSidebar isOpen={mobileMenuOpen} onClose={toggleMobileMenu} />
        </>
      ) : (
        <Navbar />
      )}
      
      <main className={`flex-1 ${isMobile ? "pt-4" : "pt-20"}`}>
        <div className="container px-4 py-4 md:py-8 text-left md:text-center">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Resume & CV Tools</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Create, optimize, and get feedback on your professional documents
            </p>
          </div>
          
          <Tabs defaultValue="ats-optimizer" className="space-y-4 ats-tabs">
            <TabsList className="flex flex-wrap w-full justify-start gap-3 px-3 py-3">
              <TabsTrigger value="ats-optimizer" className="text-xs md:text-sm px-3 py-2">ATS Optimizer</TabsTrigger>
              <TabsTrigger value="ai-resume-creator" className="text-xs md:text-sm px-3 py-2">AI Resume</TabsTrigger>
              <TabsTrigger value="ai-cv-creator" className="text-xs md:text-sm px-3 py-2">AI CV</TabsTrigger>
              <TabsTrigger value="job-automation" className="text-xs md:text-sm px-3 py-2">Job Automation</TabsTrigger>
              <TabsTrigger value="forum" className="text-xs md:text-sm px-3 py-2">Forum</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs md:text-sm px-3 py-2">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ats-optimizer">
              <ATSOptimizer />
            </TabsContent>
            
            <TabsContent value="ai-resume-creator">
              <AIResumeCreator />
            </TabsContent>
            
            <TabsContent value="ai-cv-creator">
              <AICVCreator />
            </TabsContent>
            
            <TabsContent value="job-automation">
              <JobApplicationAutomation />
            </TabsContent>
            
            <TabsContent value="forum">
              <div className="grid place-items-center p-12">
                <p className="text-muted-foreground">Forum content will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
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
