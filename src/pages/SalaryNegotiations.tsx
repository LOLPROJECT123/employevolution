
import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NegotiationForum from "@/components/salary/NegotiationForum";
import NegotiationGuides from "@/components/salary/NegotiationGuides";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const SalaryNegotiations = () => {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-background">
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
                <a href="/salary-negotiations" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded text-primary font-medium text-sm">
                  Salary Negotiations
                </a>
                <a href="/networking" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
                  Networking &amp; Outreach
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container py-6 px-4 space-y-6">
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Salary Negotiations</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Learn how to negotiate effectively and discuss strategies with peers.
          </p>
        </div>
        
        <Tabs defaultValue="guides" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="gap-2">
              <TabsTrigger value="guides" className="text-sm px-5">Guides</TabsTrigger>
              <TabsTrigger value="forum" className="text-sm px-5">Forum</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="guides">
            <NegotiationGuides />
          </TabsContent>
          
          <TabsContent value="forum">
            <NegotiationForum />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaryNegotiations;
