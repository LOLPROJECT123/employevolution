
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw, Menu } from "lucide-react";
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
    <div className="w-full space-y-6">
      {/* Only show Navbar on desktop */}
      {!isMobile && <Navbar />}
      
      {/* Mobile top bar */}
      {isMobile && (
        <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b p-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
            className="flex md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-6 w-6" />
            <span className="font-bold text-base">Streamline</span>
          </div>
        </div>
      )}
      
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
        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleMobileMenu}>
            <div 
              className="bg-white dark:bg-slate-900 h-full w-2/3 p-4 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-4 border-b">
                  <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-8 w-8" />
                  <span className="font-bold text-lg">Streamline</span>
                </div>
                
                <div className="space-y-2 pt-2">
                  <a href="/dashboard" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Dashboard
                  </a>
                  <a href="/jobs" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Jobs
                  </a>
                  <a href="/resume-tools" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Resume
                  </a>
                  <a href="/interview-practice" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Interview Prep
                  </a>
                  <a href="/referrals" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Referrals
                  </a>
                  <a href="/salary-negotiations" className="block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                    Salary
                  </a>
                  <a href="/networking" className="block p-2 bg-gray-100 dark:bg-gray-800 rounded text-primary">
                    Networking
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

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
