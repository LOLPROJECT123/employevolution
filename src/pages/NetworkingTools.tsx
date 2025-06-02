
import React from "react";
import Navbar from "@/components/Navbar";
import { useMobile } from "@/hooks/use-mobile";
import { MobileRouteLayout } from "@/components/mobile/MobileRouteLayout";
import { BreadcrumbNav } from "@/components/navigation/BreadcrumbNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, MessageCircle, UserSearch, Calendar, Mail, Phone } from "lucide-react";

const NetworkingTools = () => {
  const isMobile = useMobile();

  const handleRefresh = async () => {
    console.log('Refreshing networking tools...');
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
            <h1 className="text-3xl font-bold mb-2">Networking Tools</h1>
            <p className="text-muted-foreground">
              Advanced tools to help you build and manage your professional network
            </p>
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Network Analyzer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Analyze your network connections and identify growth opportunities
              </p>
              <Button className="w-full">
                <Network className="h-4 w-4 mr-2" />
                Analyze Network
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span>Message Templates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Pre-written templates for professional outreach and follow-ups
              </p>
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Browse Templates
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserSearch className="h-5 w-5" />
                <span>Contact Finder</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Find contact information for professionals in your target companies
              </p>
              <Button className="w-full">
                <UserSearch className="h-4 w-4 mr-2" />
                Find Contacts
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Follow-up Scheduler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Schedule and track follow-up reminders for your networking activities
              </p>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Follow-ups
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Sequences</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Automated email sequences for nurturing professional relationships
              </p>
              <Button className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Create Sequence
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Call Tracker</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Track and log your networking calls and conversations
              </p>
              <Button className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Log Calls
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
        title="Networking Tools"
        onRefresh={handleRefresh}
        className="bg-background"
      >
        {content}
      </MobileRouteLayout>
    );
  }

  return content;
};

export default NetworkingTools;
