
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import RecruiterFinder from "@/components/RecruiterFinder";
import ResearchOpportunityFinder from "@/components/ResearchOpportunityFinder";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, RefreshCw, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import Navbar from "@/components/Navbar";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

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
        <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b p-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleMobileMenu}
            className="flex md:hidden"
            aria-label="Menu"
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h1 className="text-xl md:text-3xl font-bold text-white">
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

      <div className="container mx-auto px-4 max-w-screen-xl space-y-4">
        {/* Mobile menu overlay */}
        {isMobile && mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={toggleMobileMenu}>
            <div 
              className="bg-white dark:bg-slate-950 h-full w-[85%] max-w-[300px] p-4 shadow-lg animate-slide-in-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-8 w-8" />
                    <span className="font-bold text-lg">Streamline</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="space-y-1 pt-2">
                  <a href="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Dashboard
                  </a>
                  <a href="/jobs" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Jobs
                  </a>
                  <a href="/resume-tools" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Resume &amp; CV Tools
                  </a>
                  <a href="/interview-practice" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Interview Practice
                  </a>
                  <a href="/referrals" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Referrals
                  </a>
                  <a href="/salary-negotiations" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                    Salary Negotiations
                  </a>
                  <a href="/networking" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-primary font-medium text-sm">
                    Networking &amp; Outreach
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
