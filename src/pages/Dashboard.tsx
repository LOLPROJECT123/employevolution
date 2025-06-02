import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PersonalizedDashboard from "@/components/dashboard/PersonalizedDashboard";
import JobRecommendations from "@/components/dashboard/JobRecommendations";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { ContextAwareNavigationSuggestions } from "@/components/navigation/ContextAwareNavigationSuggestions";
import { EnhancedProfileValidation } from "@/components/enhanced/EnhancedProfileValidation";
import { ProfessionalDevelopmentTracker } from "@/components/enhanced/ProfessionalDevelopmentTracker";
import { FeatureStatusDashboard } from "@/components/completion/FeatureStatusDashboard";
import { NavigationAnalyticsService } from "@/services/navigationAnalyticsService";
import { CompletionStatusService } from "@/services/completionStatusService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar,
  Target,
  Award,
  BookOpen,
  Zap
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Track navigation to dashboard
    NavigationAnalyticsService.trackNavigationPatterns(
      window.location.pathname,
      '/dashboard',
      'direct'
    );

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const status = await CompletionStatusService.getCompletionStatus(user.id);
      setCompletionStatus(status);
      
      // Update user metrics
      await CompletionStatusService.updateUserMetrics(user.id);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      {/* Context-aware navigation suggestions */}
      <ContextAwareNavigationSuggestions />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's your personalized career dashboard with AI insights
        </p>
      </div>

      {/* Completion Status Overview */}
      {completionStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enhanced Features</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionStatus.enhancedFeatures}%</div>
              <Progress value={completionStatus.enhancedFeatures} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Navigation</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionStatus.navigationIntegration}%</div>
              <Progress value={completionStatus.navigationIntegration} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ML/AI Features</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionStatus.mlAiFeatures}%</div>
              <Progress value={completionStatus.mlAiFeatures} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionStatus.overall}%</div>
              <Progress value={completionStatus.overall} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile AI</TabsTrigger>
          <TabsTrigger value="development">Development</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PersonalizedDashboard />
            <JobRecommendations />
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <EnhancedProfileValidation />
        </TabsContent>

        <TabsContent value="development">
          <ProfessionalDevelopmentTracker />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">+3 from last week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">16.7%</div>
                <p className="text-xs text-muted-foreground">Above average</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
                <p className="text-xs text-muted-foreground">2 scheduled</p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Career Progress Analytics</CardTitle>
              <CardDescription>
                AI-powered insights into your job search performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Strength</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Market Competitiveness</span>
                    <span>72%</span>
                  </div>
                  <Progress value={72} />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Application Success Rate</span>
                    <span>16.7%</span>
                  </div>
                  <Progress value={16.7} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <FeatureStatusDashboard />
        </TabsContent>

        <TabsContent value="activity">
          <RecentActivity />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
