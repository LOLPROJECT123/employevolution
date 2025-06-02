
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import InterviewSection from "@/components/interview/InterviewSection";

const InterviewPractice = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing interview practice...');
    // Implement refresh logic
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`${!isMobile ? 'container mx-auto px-4 py-8 pt-24' : 'p-0'}`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        <InterviewSection />
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Interview Practice"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default InterviewPractice;
