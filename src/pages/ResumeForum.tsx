
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import ATSOptimizer from "@/components/ATSOptimizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ResumeForum = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Resume & Cover Letter Optimization</h1>
            <p className="text-muted-foreground mt-1">
              Get your documents ATS-ready and increase your chances of landing interviews
            </p>
          </div>
          
          <Tabs defaultValue="ats-optimizer" className="space-y-6">
            <TabsList>
              <TabsTrigger value="ats-optimizer">ATS Optimizer</TabsTrigger>
              <TabsTrigger value="forum">Resume Forum</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ats-optimizer">
              <ATSOptimizer />
            </TabsContent>
            
            <TabsContent value="forum">
              <div className="grid place-items-center p-12">
                <p className="text-muted-foreground">Forum content will be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="templates">
              <div className="grid place-items-center p-12">
                <p className="text-muted-foreground">Resume and cover letter templates will be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ResumeForum;
