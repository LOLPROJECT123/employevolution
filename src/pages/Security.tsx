
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConsentManager from '@/components/security/ConsentManager';
import SecurityDashboard from '@/components/security/SecurityDashboard';

const Security: React.FC = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Security & Privacy</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account security, privacy settings, and data protection preferences.
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList>
              <TabsTrigger value="dashboard">Security Dashboard</TabsTrigger>
              <TabsTrigger value="privacy">Privacy & Consents</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <SecurityDashboard />
            </TabsContent>

            <TabsContent value="privacy">
              <ConsentManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Security;
