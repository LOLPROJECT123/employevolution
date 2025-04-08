
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
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Interview Practice</h1>
        
        <p className="text-muted-foreground mb-12 mx-auto max-w-2xl">
          Prepare for your interviews with our comprehensive practice tools.
        </p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className={`${isMobile ? 'grid grid-cols-2 gap-2' : ''} w-full max-w-md mx-auto`}>
            <TabsTrigger value="behavioral" className="px-6">Behavioral</TabsTrigger>
            <TabsTrigger value="coding" className="px-6">Coding</TabsTrigger>
            <TabsTrigger value="company" className="px-6">Company Specific</TabsTrigger>
          </TabsList>
          
          <TabsContent value="behavioral" className="space-y-8 text-left mt-8">
            <BehavioralInterview />
          </TabsContent>
          
          <TabsContent value="coding" className="space-y-8 text-left mt-8">
            <CodingInterview />
          </TabsContent>
          
          <TabsContent value="company" className="space-y-8 text-left mt-8">
            <CompanyProblems />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InterviewSection;
