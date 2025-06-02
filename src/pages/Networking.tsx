
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Calendar, Briefcase, Search, UserPlus } from "lucide-react";

const Networking = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing networking...');
    // Implement refresh logic
  };

  const content = (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      
      <div className={`container mx-auto px-4 py-8 ${!isMobile ? 'pt-24' : 'pt-4'} max-w-6xl`}>
        {!isMobile && (
          <div className="mb-6">
            <BreadcrumbNav />
          </div>
        )}
        
        {!isMobile && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Professional Networking</h1>
            <p className="text-muted-foreground">
              Build meaningful professional relationships and expand your network
            </p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Find Professionals</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discover and connect with professionals in your industry
              </p>
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Network
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Messaging</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Send personalized messages and follow up with contacts
              </p>
              <Button className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Compose Message
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Networking Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find and attend networking events in your area
              </p>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Browse Events
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>Industry Groups</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Join professional groups and communities
              </p>
              <Button className="w-full">
                <UserPlus className="h-4 w-4 mr-2" />
                Join Groups
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <MobileRouteLayout
        title="Networking"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default Networking;
