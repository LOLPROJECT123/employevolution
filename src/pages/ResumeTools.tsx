
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import ATSOptimizer from "@/components/ATSOptimizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import JobApplicationAutomation from "@/components/resume/JobApplicationAutomation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const ResumeTools = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {/* Only show Navbar on desktop */}
      {!isMobile && <Navbar />}
      
      {/* Mobile top bar */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b p-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
            className="mobile-menu-button flex md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-6 w-6" />
            <span className="font-bold text-base">Streamline</span>
          </div>
        </div>
      )}
      
      {/* Mobile menu overlay */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={toggleMobileMenu}>
          <div 
            className="bg-white dark:bg-slate-950 h-full w-[85%] max-w-[300px] p-4 shadow-lg animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center gap-2">
                  <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-8 w-8" />
                  <span className="font-bold text-lg">Streamline</span>
                </div>
                <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-1 pt-2">
                <a href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Dashboard
                </a>
                <a href="/jobs" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Jobs
                </a>
                <a href="/resume-tools" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-primary font-medium text-sm">
                  Resume &amp; CV Tools
                </a>
                <a href="/interview-practice" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Interview Practice
                </a>
                <a href="/referrals" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Referrals
                </a>
                <a href="/salary-negotiations" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Salary Negotiations
                </a>
                <a href="/networking" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Networking &amp; Outreach
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className={`flex-1 ${isMobile ? "pt-4" : "pt-20"}`}>
        <div className="container px-4 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Resume & CV Tools</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Create, optimize, and get feedback on your professional documents
            </p>
          </div>
          
          <Tabs defaultValue="ats-optimizer" className="space-y-4 ats-tabs">
            <TabsList className="flex flex-wrap gap-1 px-1">
              <TabsTrigger value="ats-optimizer" className="text-xs md:text-sm px-2 py-1.5">ATS Optimizer</TabsTrigger>
              <TabsTrigger value="ai-resume-creator" className="text-xs md:text-sm px-2 py-1.5">AI Resume</TabsTrigger>
              <TabsTrigger value="ai-cv-creator" className="text-xs md:text-sm px-2 py-1.5">AI CV</TabsTrigger>
              <TabsTrigger value="job-automation" className="text-xs md:text-sm px-2 py-1.5">Job Automation</TabsTrigger>
              <TabsTrigger value="forum" className="text-xs md:text-sm px-2 py-1.5">Forum</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs md:text-sm px-2 py-1.5">Templates</TabsTrigger>
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
