
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";

const NetworkingTools = () => {
  const [activeTab, setActiveTab] = useState("recruiters");

  return (
    <div className="container mx-auto py-6 max-w-screen-lg space-y-6">
      <h1 className="text-3xl font-bold">Networking & Outreach Tools</h1>
      <p className="text-muted-foreground">
        Connect with recruiters, hiring managers, professors, and research opportunities
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recruiters">Recruiter Finder</TabsTrigger>
          <TabsTrigger value="research">Research Opportunities</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recruiters" className="mt-6">
          <RecruiterFinder />
        </TabsContent>
        
        <TabsContent value="research" className="mt-6">
          <ResearchOpportunityFinder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkingTools;
