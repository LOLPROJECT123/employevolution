import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MobileHeader from "@/components/MobileHeader";
import { useMobile } from "@/hooks/use-mobile";
import { useNavigate } from 'react-router-dom';
import { useJobApplications } from '@/contexts/JobApplicationContext';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BriefcaseIcon,
  FileTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  HourglassIcon,
  CalendarIcon,
  ArrowRightIcon,
  TrendingUpIcon,
  ListIcon,
  PlusIcon,
  Mail,
  BarChart3,
  Users,
  History,
  Zap,
} from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import CalendarView from '@/components/calendar/CalendarView';
import InterviewScheduler from '@/components/calendar/InterviewScheduler';
import ReminderManager from '@/components/calendar/ReminderManager';
import ApplicationTimeline from '@/components/calendar/ApplicationTimeline';
import EmailTemplates from '@/components/communications/EmailTemplates';
import ContactManager from '@/components/communications/ContactManager';
import CommunicationHistory from '@/components/communications/CommunicationHistory';
import FollowUpSequences from '@/components/communications/FollowUpSequences';
import { Interview, Reminder } from '@/services/calendarService';

const Dashboard = () => {
  const navigate = useNavigate();
  const isMobile = useMobile();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock authentication
  const [animationReady, setAnimationReady] = useState(false);
  const { applications, appliedJobs } = useJobApplications();
  const [showInterviewScheduler, setShowInterviewScheduler] = useState(false);
  const [showReminderManager, setShowReminderManager] = useState(false);

  useEffect(() => {
    // In a real app, check if user is authenticated
    // If not, redirect to login page

    // For demo purposes, we'll assume user is logged in
    // but in a real app you would check auth status and redirect if needed
    
    // Delay animations slightly for better page load experience
    const timer = setTimeout(() => setAnimationReady(true), 100);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleInterviewCreated = (interview: Interview) => {
    // Refresh calendar view
    window.location.reload();
  };

  const handleReminderCreated = (reminder: Reminder) => {
    // Refresh calendar view
    window.location.reload();
  };

  // Get application stats from our applications data
  const stats = {
    total: applications.length,
    active: applications.filter(app => app.status === 'applied').length,
    interviews: applications.filter(app => app.status === 'interviewing').length,
    offers: applications.filter(app => app.status === 'offered').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
  };

  // Get recent applications
  const recentApplications = applications
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 4)
    .map(app => {
      const job = appliedJobs.find(job => job.id === app.jobId);
      
      let statusColor = "";
      switch(app.status) {
        case 'applied':
          statusColor = "bg-blue-500";
          break;
        case 'interviewing':
          statusColor = "bg-amber-500";
          break;
        case 'offered':
          statusColor = "bg-green-500";
          break;
        case 'rejected':
          statusColor = "bg-red-500";
          break;
        case 'accepted':
          statusColor = "bg-green-500";
          break;
      }
      
      return {
        id: app.id,
        jobTitle: job?.title || "Unknown Position",
        company: job?.company || "Unknown Company",
        location: job?.location || "Unknown Location",
        status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        date: app.appliedAt,
        statusColor
      };
    });

  // Mock data for recommended jobs
  const recommendedJobs = [
    {
      id: 101,
      jobTitle: "Frontend Engineer",
      company: "Quantum Software Solutions",
      location: "Boston, MA",
      salary: "$110K - $140K",
      posted: "2 days ago",
      match: 95,
    },
    {
      id: 102,
      jobTitle: "React Developer",
      company: "Elevate Digital",
      location: "Remote",
      salary: "$95K - $120K",
      posted: "1 week ago",
      match: 90,
    },
    {
      id: 103,
      jobTitle: "UI/UX Developer",
      company: "DesignFirst Studios",
      location: "Seattle, WA",
      salary: "$105K - $135K",
      posted: "3 days ago",
      match: 85,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Navbar />}
      {isMobile && <MobileHeader />}
      
      <main className="flex-1 pt-20">
        <div className="container px-4 py-8">
          {/* Dashboard Header */}
          <div className="mb-8">
            <div className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500`}>
              <h1 className="text-3xl font-bold">Welcome back, Alex</h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your job search today.
              </p>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="communications">
                <Mail className="w-4 h-4 mr-2" />
                Communications
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <History className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {/* Dashboard Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Application Overview */}
                <Card className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-100 md:col-span-2`}>
                  <CardHeader className="pb-2">
                    <CardTitle>Application Overview</CardTitle>
                    <CardDescription>Your current job application status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-4 md:gap-6">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium">Applied</span>
                          <span className="text-sm text-muted-foreground">({stats.active})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-sm font-medium">Interviews</span>
                          <span className="text-sm text-muted-foreground">({stats.interviews})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Offers</span>
                          <span className="text-sm text-muted-foreground">({stats.offers})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span className="text-sm font-medium">Rejected</span>
                          <span className="text-sm text-muted-foreground">({stats.rejected})</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Success Rate</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.total > 0 ? Math.round(((stats.offers + stats.accepted) / stats.total) * 100) : 0}%
                          </span>
                        </div>
                        <Progress value={stats.total > 0 ? ((stats.offers + stats.accepted) / stats.total) * 100 : 0} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-secondary/70 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Total Applications</div>
                            <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className="text-2xl font-bold">{stats.total}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Active</div>
                            <HourglassIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold">{stats.active}</div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Offers</div>
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="text-2xl font-bold">{stats.offers}</div>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">Interviews</div>
                            <CalendarIcon className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="text-2xl font-bold">{stats.interviews}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full button-hover"
                      onClick={() => navigate('/jobs')}
                    >
                      View All Applications
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Quick Actions */}
                <Card className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-200`}>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Tools to accelerate your job search</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-left button-hover"
                      onClick={() => navigate('/resume-tools/ai-creator')}
                    >
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      <div className="flex flex-col items-start">
                        <span>Generate Resume</span>
                        <span className="text-xs text-muted-foreground">Create a tailored resume</span>
                      </div>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-left button-hover"
                      onClick={() => navigate('/resume-tools/ai-cv')}
                    >
                      <FileTextIcon className="w-4 h-4 mr-2" />
                      <div className="flex flex-col items-start">
                        <span>Cover Letter</span>
                        <span className="text-xs text-muted-foreground">Craft a personalized letter</span>
                      </div>
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full justify-start text-left button-hover"
                      onClick={() => navigate('/communications')}
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      <div className="flex flex-col items-start">
                        <span>Email Templates</span>
                        <span className="text-xs text-muted-foreground">Manage communications</span>
                      </div>
                    </Button>
                    <Button 
                      variant="default" 
                      className="w-full justify-start text-left mt-4 button-hover"
                      onClick={() => navigate('/jobs')}
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-2" />
                      Browse Jobs
                    </Button>
                  </CardContent>
                </Card>
              </div>
              
              {/* Recent Applications and Recommended Jobs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Applications */}
                <Card className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-300 md:col-span-2`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Applications</CardTitle>
                        <CardDescription>Your latest job applications</CardDescription>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="button-hover"
                        onClick={() => navigate('/jobs')}
                      >
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Add New
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentApplications.length > 0 ? (
                        recentApplications.map((app) => (
                          <div 
                            key={app.id}
                            className="flex items-center p-3 rounded-lg hover:bg-secondary/70 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate">{app.jobTitle}</h4>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {app.company} • {app.location}
                                  </p>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${app.statusColor} bg-opacity-10 text-${app.statusColor.replace('bg-', '')}`}>
                                    {app.status}
                                  </div>
                                </div>
                              </div>
                              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                                <CalendarIcon className="w-3 h-3 mr-1" />
                                <span>
                                  Applied on {new Date(app.date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No recent applications</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full button-hover"
                      onClick={() => navigate('/jobs')}
                    >
                      View All Applications
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
                
                {/* Recommended Jobs */}
                <Card className={`${animationReady ? 'slide-up' : 'opacity-0'} transition-all duration-500 delay-400`}>
                  <CardHeader>
                    <CardTitle>Recommended for You</CardTitle>
                    <CardDescription>Jobs matching your profile</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendedJobs.map((job) => (
                        <div 
                          key={job.id}
                          className="p-3 rounded-lg hover:bg-secondary/70 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">{job.jobTitle}</h4>
                              <p className="text-xs text-muted-foreground truncate">
                                {job.company}
                              </p>
                            </div>
                            <div className="ml-2 flex-shrink-0">
                              <div className="flex items-center">
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                  {job.match}% match
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="inline-flex items-center text-xs text-muted-foreground">
                              <TrendingUpIcon className="w-3 h-3 mr-1" />
                              {job.salary}
                            </span>
                            <span className="inline-flex items-center text-xs text-muted-foreground">
                              Posted {job.posted}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant="outline" 
                      className="w-full button-hover"
                      onClick={() => navigate('/jobs')}
                    >
                      View More Jobs
                      <ArrowRightIcon className="w-4 h-4 ml-2" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="calendar">
              <div className="space-y-6">
                <CalendarView
                  onCreateInterview={() => setShowInterviewScheduler(true)}
                  onCreateReminder={() => setShowReminderManager(true)}
                />
              </div>
            </TabsContent>

            <TabsContent value="communications">
              <div className="space-y-6">
                <Tabs defaultValue="templates" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="templates" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Templates
                    </TabsTrigger>
                    <TabsTrigger value="contacts" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Contacts
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      History
                    </TabsTrigger>
                    <TabsTrigger value="sequences" className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Sequences
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="templates" className="space-y-6">
                    <EmailTemplates />
                  </TabsContent>

                  <TabsContent value="contacts" className="space-y-6">
                    <ContactManager />
                  </TabsContent>

                  <TabsContent value="history" className="space-y-6">
                    <CommunicationHistory />
                  </TabsContent>

                  <TabsContent value="sequences" className="space-y-6">
                    <FollowUpSequences />
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="space-y-6">
                <ApplicationTimeline showAll />
              </div>
            </TabsContent>
          </Tabs>

          <InterviewScheduler
            open={showInterviewScheduler}
            onClose={() => setShowInterviewScheduler(false)}
            onInterviewCreated={handleInterviewCreated}
          />

          <ReminderManager
            open={showReminderManager}
            onClose={() => setShowReminderManager(false)}
            onReminderCreated={handleReminderCreated}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
