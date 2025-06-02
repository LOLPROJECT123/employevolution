
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContactManager from "@/components/communications/ContactManager";
import EmailTemplates from "@/components/communications/EmailTemplates";
import FollowUpSequences from "@/components/communications/FollowUpSequences";
import CommunicationHistory from "@/components/communications/CommunicationHistory";

const Communications = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing communications...');
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
            <h1 className="text-3xl font-bold mb-2">Communications</h1>
            <p className="text-muted-foreground">
              Manage your professional communications and follow-ups
            </p>
          </div>
        )}
        
        <Tabs defaultValue="contacts" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="sequences">Sequences</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="contacts">
            <ContactManager />
          </TabsContent>
          
          <TabsContent value="templates">
            <EmailTemplates />
          </TabsContent>
          
          <TabsContent value="sequences">
            <FollowUpSequences />
          </TabsContent>
          
          <TabsContent value="history">
            <CommunicationHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Communications"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Communications;
