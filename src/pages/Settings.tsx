
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AutomationSettings from "@/components/jobs/AutomationSettings";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const Settings = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState("automation");

  const handleDownloadExtension = () => {
    // In a real implementation, this would link to the Chrome Web Store
    window.open("https://chrome.google.com/webstore/detail/streamline-extension", "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900/30">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      <main className={`flex-1 ${isMobile ? 'pt-16' : 'pt-20'}`}>
        <div className="container px-4 py-8 mx-auto max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Settings
            </h1>
            
            <Button variant="outline" onClick={handleDownloadExtension} className="gap-2">
              <Download className="h-4 w-4" />
              Download Extension
            </Button>
          </div>

          <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-8 p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full max-w-md mb-8">
                <TabsTrigger value="automation" className="flex-1">
                  Application Automation
                </TabsTrigger>
                <TabsTrigger value="account" className="flex-1">
                  Account
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex-1">
                  Notifications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="automation">
                <AutomationSettings />
              </TabsContent>
              
              <TabsContent value="account">
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
                  <p className="text-gray-500 mb-4">
                    Account settings will be implemented in a future update.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="notifications">
                <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-2xl font-semibold mb-4">Notification Settings</h2>
                  <p className="text-gray-500 mb-4">
                    Notification settings will be implemented in a future update.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
