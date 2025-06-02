
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MobileHeader from '@/components/MobileHeader';
import { useMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, FileText, Users, TrendingUp, Bell, Settings } from 'lucide-react';
import PersonalizedDashboard from '@/components/dashboard/PersonalizedDashboard';
import ProfileCompletionWidget from '@/components/profile/ProfileCompletionWidget';
import RecentActivity from '@/components/dashboard/RecentActivity';
import JobRecommendations from '@/components/dashboard/JobRecommendations';

const Dashboard = () => {
  const isMobile = useMobile();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader title="Dashboard" />}
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Your personalized career management center
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-3 space-y-6">
                <PersonalizedDashboard />
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                <ProfileCompletionWidget />
                <JobRecommendations />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <PersonalizedDashboard />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Applications Sent</p>
                      <p className="text-2xl font-bold">23</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
                      <p className="text-2xl font-bold">34%</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +3 this week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Job Matches</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <BarChart className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    +45 new this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Analytics Components */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Applications Sent</span>
                      <span>23</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Responses Received</span>
                      <span>8</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Interviews Scheduled</span>
                      <span>3</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Success Rate</span>
                      <span className="text-green-600">34%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Match Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">JavaScript</span>
                      <span className="text-sm text-green-600">95% match</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">React</span>
                      <span className="text-sm text-green-600">88% match</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">TypeScript</span>
                      <span className="text-sm text-yellow-600">65% match</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Docker</span>
                      <span className="text-sm text-red-600">23% match</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <RecentActivity />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
