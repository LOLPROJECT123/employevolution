
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { browserUseService } from "@/services/browserUseService";
import { Bot, Mail, Users, Briefcase, Play, Square, RefreshCw } from "lucide-react";

interface AutomationTask {
  id: string;
  type: 'job_scraping' | 'application_submission' | 'email_outreach' | 'linkedin_connect';
  status: 'pending' | 'running' | 'completed' | 'failed';
  data: any;
  userId: string;
  createdAt: string;
  completedAt?: string;
}

const BrowserAutomationDashboard = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [tasks, setTasks] = useState<AutomationTask[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  // Job Scraping State
  const [jobScrapingForm, setJobScrapingForm] = useState({
    platforms: ['linkedin', 'indeed'],
    query: 'Software Engineer',
    location: 'San Francisco, CA',
    remote: false,
    salaryMin: 100000,
    experienceLevel: 'mid'
  });

  // Application Submission State
  const [applicationForm, setApplicationForm] = useState({
    jobUrls: '',
    coverLetterTemplate: '',
    resumeVersion: 'default'
  });

  // Email Outreach State
  const [emailForm, setEmailForm] = useState({
    contacts: '',
    emailTemplate: 'Hello {{name}},\n\nI hope this email finds you well. I came across your profile and was impressed by your work at {{company}}...',
    subject: 'Connection Opportunity'
  });

  // LinkedIn Connect State
  const [linkedinForm, setLinkedinForm] = useState({
    profiles: '',
    messageTemplate: 'Hi {{name}}, I noticed your background in {{position}} at {{company}} and would love to connect!'
  });

  useEffect(() => {
    initializeSession();
    loadMetrics();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      const sessionId = await browserUseService.initializeBrowserAgent('current-user');
      setActiveSession(sessionId);
      toast.success('Browser automation session initialized');
    } catch (error) {
      console.error('Failed to initialize session:', error);
      toast.error('Failed to initialize automation session');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const metricsData = await browserUseService.getAutomationMetrics('current-user');
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const startJobScraping = async () => {
    if (!activeSession) {
      toast.error('No active session. Please initialize first.');
      return;
    }

    try {
      setIsLoading(true);
      const task = await browserUseService.startJobScrapingSession(
        activeSession,
        jobScrapingForm.platforms,
        {
          query: jobScrapingForm.query,
          location: jobScrapingForm.location,
          remote: jobScrapingForm.remote,
          salaryMin: jobScrapingForm.salaryMin,
          experienceLevel: jobScrapingForm.experienceLevel
        }
      );
      setTasks(prev => [...prev, task]);
      toast.success('Job scraping started');
    } catch (error) {
      console.error('Failed to start job scraping:', error);
      toast.error('Failed to start job scraping');
    } finally {
      setIsLoading(false);
    }
  };

  const startApplicationSubmission = async () => {
    if (!activeSession) {
      toast.error('No active session. Please initialize first.');
      return;
    }

    try {
      setIsLoading(true);
      const jobUrls = applicationForm.jobUrls.split('\n').filter(url => url.trim());
      const task = await browserUseService.startApplicationSubmission(
        activeSession,
        jobUrls,
        { name: 'John Doe', email: 'john@example.com' }, // Mock user profile
        'Mock resume content',
        applicationForm.coverLetterTemplate
      );
      setTasks(prev => [...prev, task]);
      toast.success('Application submission started');
    } catch (error) {
      console.error('Failed to start application submission:', error);
      toast.error('Failed to start application submission');
    } finally {
      setIsLoading(false);
    }
  };

  const startEmailOutreach = async () => {
    if (!activeSession) {
      toast.error('No active session. Please initialize first.');
      return;
    }

    try {
      setIsLoading(true);
      const contacts = emailForm.contacts.split('\n').map(line => {
        const [email, name, company] = line.split(',').map(s => s.trim());
        return { email, name, company };
      }).filter(contact => contact.email);

      const task = await browserUseService.startEmailOutreach(
        activeSession,
        contacts,
        emailForm.emailTemplate,
        { subject: emailForm.subject }
      );
      setTasks(prev => [...prev, task]);
      toast.success('Email outreach started');
    } catch (error) {
      console.error('Failed to start email outreach:', error);
      toast.error('Failed to start email outreach');
    } finally {
      setIsLoading(false);
    }
  };

  const startLinkedInConnect = async () => {
    if (!activeSession) {
      toast.error('No active session. Please initialize first.');
      return;
    }

    try {
      setIsLoading(true);
      const profiles = linkedinForm.profiles.split('\n').map(line => {
        const [profileUrl, name, position, company] = line.split(',').map(s => s.trim());
        return { profileUrl, name, position, company };
      }).filter(profile => profile.profileUrl);

      const task = await browserUseService.startLinkedInConnect(
        activeSession,
        profiles,
        linkedinForm.messageTemplate
      );
      setTasks(prev => [...prev, task]);
      toast.success('LinkedIn connections started');
    } catch (error) {
      console.error('Failed to start LinkedIn connections:', error);
      toast.error('Failed to start LinkedIn connections');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTask = async (taskId: string) => {
    try {
      await browserUseService.stopTask(taskId);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'failed' as const } : task
      ));
      toast.success('Task stopped');
    } catch (error) {
      console.error('Failed to stop task:', error);
      toast.error('Failed to stop task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'job_scraping': return <Briefcase className="w-4 h-4" />;
      case 'application_submission': return <Bot className="w-4 h-4" />;
      case 'email_outreach': return <Mail className="w-4 h-4" />;
      case 'linkedin_connect': return <Users className="w-4 h-4" />;
      default: return <RefreshCw className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Browser Automation Dashboard</h1>
          <p className="text-muted-foreground">AI-powered job search automation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={activeSession ? "default" : "secondary"}>
            {activeSession ? "Session Active" : "No Session"}
          </Badge>
          <Button onClick={initializeSession} disabled={isLoading}>
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Reset Session"}
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jobs Scraped</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.jobsScraped || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Submitted</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.applicationsSubmitted || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.emailsSent || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scraping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scraping">Job Scraping</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="outreach">Email Outreach</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="tasks">Active Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="scraping">
          <Card>
            <CardHeader>
              <CardTitle>AI Job Scraping</CardTitle>
              <CardDescription>
                Automatically discover job opportunities across multiple platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="query">Job Title/Keywords</Label>
                  <Input
                    id="query"
                    value={jobScrapingForm.query}
                    onChange={(e) => setJobScrapingForm(prev => ({ ...prev, query: e.target.value }))}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={jobScrapingForm.location}
                    onChange={(e) => setJobScrapingForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Minimum Salary</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={jobScrapingForm.salaryMin}
                    onChange={(e) => setJobScrapingForm(prev => ({ ...prev, salaryMin: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select
                    value={jobScrapingForm.experienceLevel}
                    onValueChange={(value) => setJobScrapingForm(prev => ({ ...prev, experienceLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Entry Level</SelectItem>
                      <SelectItem value="mid">Mid Level</SelectItem>
                      <SelectItem value="senior">Senior Level</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startJobScraping} disabled={!activeSession || isLoading}>
                <Play className="w-4 h-4 mr-2" />
                Start Job Scraping
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Automated Application Submission</CardTitle>
              <CardDescription>
                Submit applications to multiple jobs automatically with AI-powered form filling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobUrls">Job URLs (one per line)</Label>
                <Textarea
                  id="jobUrls"
                  value={applicationForm.jobUrls}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, jobUrls: e.target.value }))}
                  placeholder="https://jobs.company.com/job1&#10;https://jobs.company.com/job2"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="coverLetter">Cover Letter Template</Label>
                <Textarea
                  id="coverLetter"
                  value={applicationForm.coverLetterTemplate}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, coverLetterTemplate: e.target.value }))}
                  placeholder="Dear Hiring Manager, I am excited to apply for..."
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startApplicationSubmission} disabled={!activeSession || isLoading}>
                <Bot className="w-4 h-4 mr-2" />
                Start Application Submission
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="outreach">
          <Card>
            <CardHeader>
              <CardTitle>Email Outreach Automation</CardTitle>
              <CardDescription>
                Send personalized emails to recruiters and hiring managers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contacts">Contacts (email,name,company per line)</Label>
                <Textarea
                  id="contacts"
                  value={emailForm.contacts}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, contacts: e.target.value }))}
                  placeholder="recruiter@company.com,John Smith,Company Inc&#10;hr@startup.com,Jane Doe,Startup LLC"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Textarea
                  id="emailTemplate"
                  value={emailForm.emailTemplate}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, emailTemplate: e.target.value }))}
                  rows={6}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startEmailOutreach} disabled={!activeSession || isLoading}>
                <Mail className="w-4 h-4 mr-2" />
                Start Email Outreach
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Connection Automation</CardTitle>
              <CardDescription>
                Automatically send connection requests with personalized messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="profiles">Profile URLs (url,name,position,company per line)</Label>
                <Textarea
                  id="profiles"
                  value={linkedinForm.profiles}
                  onChange={(e) => setLinkedinForm(prev => ({ ...prev, profiles: e.target.value }))}
                  placeholder="https://linkedin.com/in/person1,John Smith,Engineer,Company Inc&#10;https://linkedin.com/in/person2,Jane Doe,Manager,Startup LLC"
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="messageTemplate">Connection Message Template</Label>
                <Textarea
                  id="messageTemplate"
                  value={linkedinForm.messageTemplate}
                  onChange={(e) => setLinkedinForm(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={startLinkedInConnect} disabled={!activeSession || isLoading}>
                <Users className="w-4 h-4 mr-2" />
                Start LinkedIn Connections
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">No active tasks</p>
                </CardContent>
              </Card>
            ) : (
              tasks.map((task) => (
                <Card key={task.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(task.type)}
                      <CardTitle className="text-sm font-medium">
                        {task.type.replace('_', ' ').toUpperCase()}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      {task.status === 'running' && (
                        <Button size="sm" variant="outline" onClick={() => stopTask(task.id)}>
                          <Square className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Started: {new Date(task.createdAt).toLocaleString()}
                    </div>
                    {task.status === 'running' && (
                      <Progress value={50} className="mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrowserAutomationDashboard;
