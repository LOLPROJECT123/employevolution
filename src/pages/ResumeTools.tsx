
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import ResumeTemplates from "@/components/resume/ResumeTemplates";
import AIResumeCreator from "@/components/resume/AIResumeCreator";
import AICVCreator from "@/components/resume/AICVCreator";
import ResumeForum from "@/components/resume/ResumeForum";
import { useParams, useNavigate } from "react-router-dom";

const ResumeTools = () => {
  const isMobile = useMobile();
  const { tab } = useParams();
  const navigate = useNavigate();
  
  // Default to 'templates' tab unless specified otherwise
  const [activeTab, setActiveTab] = useState(tab || 'templates');

  useEffect(() => {
    // Update active tab when the tab parameter changes
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/resume-tools/${value}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Resume Tools" />}
      
      <main className="container px-4 py-8 pt-20">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Resume Tools</h1>
            <p className="text-muted-foreground">
              Create, optimize, and manage your resume to stand out to employers.
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="ai-creator">AI Resume</TabsTrigger>
              <TabsTrigger value="ai-cv">AI CV</TabsTrigger>
              <TabsTrigger value="forum">Forum</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates" className="mt-0">
              <ResumeTemplates />
            </TabsContent>
            
            <TabsContent value="ai-creator" className="mt-0">
              <AIResumeCreator />
            </TabsContent>
            
            <TabsContent value="ai-cv" className="mt-0">
              <AICVCreator />
            </TabsContent>
            
            <TabsContent value="forum" className="mt-0">
              <ResumeForum />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ResumeTools;
