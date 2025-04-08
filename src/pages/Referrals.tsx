
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RequestReferral from "@/components/referrals/RequestReferral";
import ManageReferrals from "@/components/referrals/ManageReferrals";

const Referrals = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("request");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Referrals" />}
      
      <div className={`container mx-auto px-4 ${isMobile ? 'pt-16' : 'pt-24'} pb-12 flex-1`}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Employee Referrals</h1>
          <p className="text-muted-foreground mb-8">
            Connect with employees who can refer you to their company, or manage referral requests if you're an employee.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="request">Request a Referral</TabsTrigger>
              <TabsTrigger value="manage">Manage Referrals</TabsTrigger>
            </TabsList>
            
            <div className="mt-12">
              <TabsContent value="request">
                <RequestReferral />
              </TabsContent>
              
              <TabsContent value="manage">
                <ManageReferrals />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
