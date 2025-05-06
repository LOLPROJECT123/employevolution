
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfileTabsProps {
  children: React.ReactNode;
  defaultTab?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ children, defaultTab = "contact" }) => {
  const isMobile = useIsMobile();
  
  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-5 mb-4' : 'grid-cols-5'}`}>
        <TabsTrigger value="contact">Contact</TabsTrigger>
        <TabsTrigger value="resume">Resume</TabsTrigger>
        <TabsTrigger value="job-preferences">Job Preferences</TabsTrigger>
        <TabsTrigger value="equal-employment">Equal Employment</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export const TabPanel: React.FC<{ value: string; children: React.ReactNode }> = ({
  value,
  children,
}) => (
  <TabsContent value={value} className="mt-4">
    {children}
  </TabsContent>
);

export default ProfileTabs;
