
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import ResumeTemplates from "@/components/resume/ResumeTemplates";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import ResumeForum from "@/components/resume/ResumeForum";
import ATSOptimizer from "@/components/ATSOptimizer";
import { useParams, useNavigate } from "react-router-dom";

const ResumeTools = () => {
  const isMobile = useMobile();
  const { tab } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState(tab || 'templates');

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/resume-tools/${value}`, { replace: true });
  };

  const handleRefresh = async () => {
    console.log('Refreshing resume tools...');
    // Implement refresh logic
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <main className={`container px-4 py-8 ${!isMobile ? 'pt-24' : 'pt-4'}`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        <div className="flex flex-col gap-8">
          {!isMobile && (
            <div>
              <h1 className="text-3xl font-bold mb-2">Resume Tools</h1>
              <p className="text-muted-foreground">
                Create, optimize, and manage your resume to stand out to employers.
              </p>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6 w-full">
              <TabsTrigger value="ats-optimizer" className="text-xs md:text-sm px-2 py-1">ATS Optimizer</TabsTrigger>
              <TabsTrigger value="ai-creator" className="text-xs md:text-sm px-2 py-1">AI Resume</TabsTrigger>
              <TabsTrigger value="ai-cv" className="text-xs md:text-sm px-2 py-1">AI CV</TabsTrigger>
              <TabsTrigger value="forum" className="text-xs md:text-sm px-2 py-1">Resume Forum</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs md:text-sm px-2 py-1">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ats-optimizer" className="mt-0">
              <ATSOptimizer />
            </TabsContent>
            
            <TabsContent value="ai-creator" className="mt-0">
              <AIResumeCreator />
            </TabsContent>
            
            <TabsContent value="ai-cv" className="mt-0">
              <AICVCreator />
            </TabsContent>
            
            <TabsContent value="templates" className="mt-0">
              <ResumeTemplates />
            </TabsContent>
            
            <TabsContent value="forum" className="mt-0">
              <ResumeForum />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Resume Tools"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default ResumeTools;
