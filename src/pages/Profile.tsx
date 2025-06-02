
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { ProfileDetails } from "@/components/profile/ProfileDetails";
import { EnhancedProfileCompletionWidget } from "@/components/profile/EnhancedProfileCompletionWidget";

const Profile = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing profile...');
    // Implement profile refresh logic
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`${!isMobile ? 'container mx-auto px-4 py-8 pt-24' : 'p-0'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">
              Manage your professional profile and settings
            </p>
          </div>
        )}
        
        <div className="space-y-6">
          <EnhancedProfileCompletionWidget />
          <ProfileDetails />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Profile"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Profile;
