
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { MobileHeader, MobileSidebar } from "@/components/MobileHeader";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";

const NetworkingTools = () => {
  const [activeTab, setActiveTab] = useState("recruiters");
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="w-full space-y-4 pb-20">
      {/* Only show Navbar on desktop */}
      {!isMobile && <Navbar />}
      
      {/* Mobile top bar */}
      {isMobile && (
        <MobileHeader onMenuToggle={toggleMobileMenu} />
      )}
      
      {/* Header section styled like the Jobs page - with improved mobile layout */}
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-white">
              Find Your Next <br className="md:hidden" />Opportunity
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mt-2">
            <div className="text-white text-lg font-medium">
              Networking & Outreach Tools
            </div>
            
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Settings
              </Button>
              <Button variant="outline" size="sm" className="bg-blue-500 text-white border-blue-400 hover:bg-blue-600 flex-1 md:flex-none">
                Refresh Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl space-y-4">
        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
          <MobileSidebar isOpen={mobileMenuOpen} onClose={toggleMobileMenu} />
        )}

        {/* Main card with tabs */}
        <Card className="shadow-sm">
          <div className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-3 border-b">
                <TabsList className="h-12 gap-4">
                  <TabsTrigger 
                    value="recruiters" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-[13px] md:text-sm"
                  >
                    {isMobile ? "Recruiters" : "Recruiter Finder"}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="research" 
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 text-[13px] md:text-sm"
                  >
                    {isMobile ? "Research" : "Research Opportunities"}
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-3 md:p-4">
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
