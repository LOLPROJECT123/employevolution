
import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NegotiationForum from "@/components/salary/NegotiationForum";
import NegotiationGuides from "@/components/salary/NegotiationGuides";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader, MobileSidebar } from "@/components/MobileHeader";
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
        <MobileHeader onMenuToggle={toggleMobileMenu} />
      )}
      
      {/* Mobile menu overlay */}
      {isMobile && mobileMenuOpen && (
        <MobileSidebar isOpen={mobileMenuOpen} onClose={toggleMobileMenu} />
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
            <TabsList className={`gap-2 ${isMobile ? 'w-full flex' : ''}`}>
              <TabsTrigger value="guides" className={`text-sm px-5 ${isMobile ? 'flex-1' : ''}`}>Guides</TabsTrigger>
              <TabsTrigger value="forum" className={`text-sm px-5 ${isMobile ? 'flex-1' : ''}`}>Discussion Forum</TabsTrigger>
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
