
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";

const NetworkingTools = () => {
  const [activeTab, setActiveTab] = useState("recruiters");
  const isMobile = useMobile();

  return (
    <div className="w-full space-y-6">
      {/* Add the Navbar component at the top */}
      <Navbar />
      
      {/* Header section styled like the Jobs page */}
      <div className="bg-blue-600 dark:bg-blue-900 py-6 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Find Your Next Opportunity
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl space-y-6">
        {/* Main card with tabs */}
        <Card className="shadow-sm">
          <div className="p-0">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-medium">Networking & Outreach Tools</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="default" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Now
                </Button>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4 border-b">
                <TabsList className="h-12">
                  <TabsTrigger 
                    value="recruiters" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Recruiter Finder
                  </TabsTrigger>
                  <TabsTrigger 
                    value="research" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
                  >
                    Research Opportunities
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-4">
                <TabsContent value="recruiters" className="mt-0">
                  <RecruiterFinder />
                </TabsContent>
                
                <TabsContent value="research" className="mt-0">
                  <ResearchOpportunityFinder />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default NetworkingTools;
