
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NegotiationGuides from "@/components/salary/NegotiationGuides";
import NegotiationForum from "@/components/salary/NegotiationForum";

const SalaryNegotiations = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing salary negotiations...');
    // Implement refresh logic
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`container mx-auto px-4 py-8 ${!isMobile ? 'pt-24' : 'pt-4'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Salary Negotiations</h1>
            <p className="text-muted-foreground">
              Master the art of salary negotiation with guides, tools, and community support
            </p>
          </div>
        )}
        
        <Tabs defaultValue="guides" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="guides">Negotiation Guides</TabsTrigger>
            <TabsTrigger value="forum">Community Forum</TabsTrigger>
          </TabsList>
          
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

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Salary Negotiations"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default SalaryNegotiations;
