
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";

const NetworkingTools = () => {
  const [activeTab, setActiveTab] = useState("recruiters");
  const isMobile = useIsMobile();

  return (
    <div className="w-full space-y-6">
      {/* Add the Navbar component at the top */}
      <Navbar />
      
      {/* Header section styled like the Jobs page */}
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <h1 className="text-xl md:text-3xl font-bold text-white whitespace-nowrap">
              Networking <br className="md:hidden" />&amp; Outreach Tools
            </h1>
            
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl space-y-6">
        {/* Main card with tabs */}
        <Card className="shadow-sm">
          <div className="p-0">
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
