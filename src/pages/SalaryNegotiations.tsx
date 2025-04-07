
import React from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NegotiationForum from "@/components/salary/NegotiationForum";
import NegotiationGuides from "@/components/salary/NegotiationGuides";

const SalaryNegotiations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8 space-y-6">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Salary Negotiations</h1>
          <p className="text-muted-foreground">
            Learn how to negotiate effectively and discuss strategies with peers.
          </p>
        </div>
        
        <Tabs defaultValue="guides" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="guides">Negotiation Guides</TabsTrigger>
              <TabsTrigger value="forum">Discussion Forum</TabsTrigger>
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
