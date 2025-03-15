
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BehavioralInterview from "@/components/interview/BehavioralInterview";
import CodingInterview from "@/components/interview/CodingInterview";
import Navbar from "@/components/Navbar";

const InterviewPractice = () => {
  const [activeTab, setActiveTab] = useState<string>("behavioral");

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Interview Practice</h1>
          
          <p className="text-muted-foreground mb-8 text-center">
            Practice both behavioral and coding interviews with AI assistance. Use your camera, 
            microphone, and screen sharing to simulate a real interview environment.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
              <TabsTrigger value="behavioral">Behavioral Interview</TabsTrigger>
              <TabsTrigger value="coding">Coding Interview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="behavioral" className="space-y-6">
              <BehavioralInterview />
            </TabsContent>
            
            <TabsContent value="coding" className="space-y-6">
              <CodingInterview />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default InterviewPractice;
