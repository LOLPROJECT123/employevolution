
import React from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import JobApplicationAutomation from "@/components/resume/JobApplicationAutomation";

const JobAutomation = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Job Application Automation" />}
      
      <main className="container px-4 py-8 pt-20">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Job Application Automation</h1>
            <p className="text-muted-foreground">
              Automate your job applications and maximize your chances of getting hired.
            </p>
          </div>
          
          <JobApplicationAutomation />
        </div>
      </main>
    </div>
  );
};

export default JobAutomation;
