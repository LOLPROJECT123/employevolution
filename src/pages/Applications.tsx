
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { AdvancedGestureHandler } from "@/components/mobile/AdvancedGestureHandler";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Building, ExternalLink } from "lucide-react";

const Applications = () => {
  const isMobile = useMobile();
  const [currentAppIndex, setCurrentAppIndex] = useState(0);

  // Mock data - replace with real data
  const applications = [
    {
      id: "1",
      jobTitle: "Senior Software Engineer",
      company: "Tech Corp",
      location: "San Francisco, CA",
      appliedDate: "2024-01-15",
      status: "interview_scheduled",
      nextStep: "Technical Interview on Jan 25",
      salary: "$120k - $150k"
    },
    {
      id: "2",
      jobTitle: "Frontend Developer",
      company: "StartupXYZ",
      location: "Remote",
      appliedDate: "2024-01-10",
      status: "under_review",
      nextStep: "Waiting for response",
      salary: "$90k - $110k"
    }
  ];

  const handleRefresh = async () => {
    console.log('Refreshing applications...');
    // Implement refresh logic
  };

  const handleSwipeLeft = () => {
    if (currentAppIndex < applications.length - 1) {
      setCurrentAppIndex(prev => prev + 1);
    }
  };

  const handleSwipeRight = () => {
    if (currentAppIndex > 0) {
      setCurrentAppIndex(prev => prev - 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview_scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ApplicationCard = ({ application }: { application: any }) => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{application.jobTitle}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
              <Building className="h-4 w-4" />
              <span>{application.company}</span>
            </div>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{application.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>Applied {application.appliedDate}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Salary:</span> {application.salary}
          </div>
          <div className="text-sm">
            <span className="font-medium">Next Step:</span> {application.nextStep}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1" />
            View Job
          </Button>
          <Button size="sm">Update Status</Button>
        </div>
      </CardContent>
    </Card>
  );

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`${!isMobile ? 'container mx-auto px-4 py-8' : 'p-0'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
            <p className="text-muted-foreground">
              Track and manage your job applications
            </p>
          </div>
        )}
        
        {isMobile ? (
          <AdvancedGestureHandler
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            className="h-full"
          >
            <div className="p-4">
              {applications[currentAppIndex] && (
                <ApplicationCard application={applications[currentAppIndex]} />
              )}
              <div className="mt-4 text-center text-sm text-muted-foreground">
                {currentAppIndex + 1} of {applications.length} applications
              </div>
            </div>
          </AdvancedGestureHandler>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Applications"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Applications;
