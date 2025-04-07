import React from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import InterviewSection from "@/components/interview/InterviewSection";

const InterviewPractice = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <InterviewSection />
    </div>
  );
};

export default InterviewPractice;
