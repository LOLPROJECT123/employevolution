
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import RequestReferral from "@/components/referrals/RequestReferral";
import ManageReferrals from "@/components/referrals/ManageReferrals";

const Referrals = () => {
  const [activeTab, setActiveTab] = useState<string>("request");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Employee Referrals</h1>
          
          <p className="text-muted-foreground mb-8 text-center">
            Connect with employees who can refer you to their company, or manage referral requests if you're an employee.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="request">Request a Referral</TabsTrigger>
              <TabsTrigger value="manage">Manage Referrals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="request" className="space-y-6">
              <RequestReferral />
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-6">
              <ManageReferrals />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
