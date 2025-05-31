
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const NetworkingTools = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("recruiters");

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Networking" />}

      <div className="container mx-auto px-4 max-w-screen-xl space-y-6 pt-6">
        <Card className="shadow-sm">
          <div className="p-0">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium">Networking & Outreach Tools</h2>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
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
