
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { FilterIcon, PlusSquare } from "lucide-react";
import NegotiationForum from "@/components/salary/NegotiationForum";
import NegotiationGuides from "@/components/salary/NegotiationGuides";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SalaryNegotiations = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState<"forum" | "guides">("forum");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-16' : 'pt-20'} pb-12 flex-1`}>
        <Tabs 
          defaultValue="forum" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "forum" | "guides")}
          className="max-w-5xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Salary Negotiations</h1>
              <p className="text-muted-foreground mt-1">
                Learn strategies and share experiences to maximize your compensation
              </p>
            </div>
            
            <TabsList className="self-start">
              <TabsTrigger value="forum">Forum</TabsTrigger>
              <TabsTrigger value="guides">Guides</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="forum" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-semibold">Salary Negotiation Forum</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-1" /> Filter
                </Button>
                <Button className="flex items-center" size="sm">
                  <PlusSquare className="h-4 w-4 mr-1.5" /> New Post
                </Button>
              </div>
            </div>
            
            <NegotiationForum />
          </TabsContent>
          
          <TabsContent value="guides">
            <NegotiationGuides />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalaryNegotiations;
