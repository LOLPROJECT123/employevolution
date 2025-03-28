
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";

const NetworkingTools = () => {
  const [activeTab, setActiveTab] = useState("recruiters");

  return (
    <div className="container mx-auto py-6 max-w-screen-lg space-y-6">
      <h1 className="text-3xl font-bold">Networking & Outreach Tools</h1>
      <p className="text-muted-foreground">
        Connect with recruiters, hiring managers, professors, and research opportunities
      </p>
      
      <Card className="mt-6">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b h-12">
              <TabsTrigger value="recruiters" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Recruiter Finder
              </TabsTrigger>
              <TabsTrigger value="research" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Research Opportunities
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="recruiters" className="mt-0">
                <RecruiterFinder />
              </TabsContent>
              
              <TabsContent value="research" className="mt-0">
                <ResearchOpportunityFinder />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkingTools;
