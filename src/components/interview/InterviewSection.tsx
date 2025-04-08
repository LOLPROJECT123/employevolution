
import React from "react";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import BehavioralInterview from "./BehavioralInterview";
import CodingInterview from "./CodingInterview";
import CompanyProblems from "./CompanyProblems";

const InterviewSection = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = React.useState("behavioral");

  return (
    <div className={`container mx-auto px-4 ${isMobile ? 'pt-16' : 'pt-24'} pb-12 flex-1`}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Interview Practice</h1>
        
        <p className="text-muted-foreground mb-8 text-center">
          Prepare for your interviews with our comprehensive practice tools.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-2' : ''} w-full max-w-md mx-auto`}>
            <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
            <TabsTrigger value="coding">Coding</TabsTrigger>
            <TabsTrigger value="company">Company Specific</TabsTrigger>
          </TabsList>
          
          <TabsContent value="behavioral" className="space-y-6">
            <BehavioralInterview />
          </TabsContent>
          
          <TabsContent value="coding" className="space-y-6">
            <CodingInterview />
          </TabsContent>
          
          <TabsContent value="company" className="space-y-6">
            <CompanyProblems />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterviewSection;
