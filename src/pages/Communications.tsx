
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailTemplates from '@/components/communications/EmailTemplates';
import ContactManager from '@/components/communications/ContactManager';
import CommunicationHistory from '@/components/communications/CommunicationHistory';
import FollowUpSequences from '@/components/communications/FollowUpSequences';
import { Mail, Users, History, Zap } from 'lucide-react';

const Communications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Communication Tools</h1>
          <p className="text-muted-foreground">
            Manage email templates, contacts, and communication history for your job search.
          </p>
        </div>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="sequences" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Sequences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-6">
            <EmailTemplates />
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <ContactManager />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <CommunicationHistory />
          </TabsContent>

          <TabsContent value="sequences" className="space-y-6">
            <FollowUpSequences />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Communications;
