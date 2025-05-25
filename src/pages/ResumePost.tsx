
import React from 'react';
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";

const ResumePost = () => {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Resume Tools" />}
      
      <div className="bg-blue-600 dark:bg-blue-900 py-4 px-4 md:py-6 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <h1 className="text-xl md:text-3xl font-bold text-white">
            Resume Tools
          </h1>
          <p className="text-blue-100 mt-2">
            Create, optimize, and manage your resumes
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Resume Management</h2>
          <p className="text-muted-foreground">
            Coming soon - Advanced resume creation and optimization tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumePost;
