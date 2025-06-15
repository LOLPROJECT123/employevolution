
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Settings, 
  Eye, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import { enhancedJobScrapingService } from '@/services/enhancedJobScrapingService';
import { applicationQuestionService } from '@/services/applicationQuestionService';
import { networkingAutomationService } from '@/services/networkingAutomationService';
import { resumeAutoImportService } from '@/services/resumeAutoImportService';

interface AutomationConfig {
  enabledPlatforms: string[];
  autoApply: boolean;
  maxApplicationsPerDay: number;
  customizeResumePerJob: boolean;
  sendNetworkingEmails: boolean;
  searchQuery: string;
  location: string;
}

interface AutomationStats {
  jobsScraped: number;
  applicationsSubmitted: number;
  emailsSent: number;
  questionsAnswered: number;
  successRate: number;
}

export const AutomatedJobApplicationManager: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<AutomationConfig>({
    enabledPlatforms: ['linkedin', 'indeed', 'glassdoor'],
    autoApply: false,
    maxApplicationsPerDay: 10,
    customizeResumePerJob: true,
    sendNetworkingEmails: true,
    searchQuery: 'Software Engineer',
    location: 'Austin, TX'
  });
  const [stats, setStats] = useState<AutomationStats>({
    jobsScraped: 0,
    applicationsSubmitted: 0,
    emailsSent: 0,
    questionsAnswered: 0,
    successRate: 0
  });
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', enabled: true },
    { id: 'indeed', name: 'Indeed', enabled: true },
    { id: 'glassdoor', name: 'Glassdoor', enabled: true },
    { id: 'handshake', name: 'Handshake', enabled: true },
    { id: 'ziprecruiter', name: 'ZipRecruiter', enabled: false },
    { id: 'dice', name: 'Dice', enabled: false },
    { id: 'simplyhired', name: 'Simply Hired', enabled: false },
    { id: 'lever', name: 'Lever', enabled: false },
    { id: 'icims', name: 'iCIMS', enabled: false },
    { id: 'workday', name: 'Workday', enabled: false },
    { id: 'greenhouse', name: 'Greenhouse', enabled: false },
    { id: 'ashby', name: 'Ashby', enabled: false },
    { id: 'rippling', name: 'Rippling', enabled: false }
  ];

  const startAutomation = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setCurrentProgress(0);
    
    try {
      // Phase 1: Scrape jobs from all enabled platforms
      toast({
        title: "Automation Started",
        description: "Beginning job scraping across all platforms...",
      });
      
      const scrapingResults = await enhancedJobScrapingService.scrapeAllPlatforms(
        config.searchQuery,
        config.location
      );
      
      let totalJobsFound = 0;
      scrapingResults.forEach(result => {
        totalJobsFound += result.totalFound;
      });
      
      setStats(prev => ({ ...prev, jobsScraped: totalJobsFound }));
      setCurrentProgress(25);
      
      // Phase 2: Process applications if auto-apply is enabled
      if (config.autoApply) {
        toast({
          title: "Processing Applications",
          description: "Starting automated job applications...",
        });
        
        // This would integrate with the Chrome extension for actual applications
        setCurrentProgress(50);
      }
      
      // Phase 3: Generate networking outreach if enabled
      if (config.sendNetworkingEmails) {
        toast({
          title: "Networking Outreach",
          description: "Finding and contacting recruiters and alumni...",
        });
        
        setCurrentProgress(75);
      }
      
      // Phase 4: Complete
      setCurrentProgress(100);
      
      toast({
        title: "Automation Complete",
        description: `Found ${totalJobsFound} jobs across ${config.enabledPlatforms.length} platforms.`,
      });
      
    } catch (error) {
      console.error('Automation error:', error);
      toast({
        title: "Automation Error",
        description: "An error occurred during automation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const stopAutomation = () => {
    setIsRunning(false);
    setCurrentProgress(0);
    toast({
      title: "Automation Stopped",
      description: "Job application automation has been stopped.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Automated Job Applications</h2>
        <div className="flex gap-2">
          <Button
            onClick={isRunning ? stopAutomation : startAutomation}
            variant={isRunning ? "destructive" : "default"}
            disabled={!config.enabledPlatforms.length}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Automation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Automation
              </>
            )}
          </Button>
        </div>
      </div>

      {isRunning && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Automation Progress</span>
                <span className="text-sm text-muted-foreground">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Jobs Scraped</p>
                    <p className="text-2xl font-bold">{stats.jobsScraped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Applications Submitted</p>
                    <p className="text-2xl font-bold">{stats.applicationsSubmitted}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Emails Sent</p>
                    <p className="text-2xl font-bold">{stats.emailsSent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                    <p className="text-2xl font-bold">{stats.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Automated job applications should be used responsibly. Always review applications before submission and ensure they meet the employer's requirements.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center">
                      <span className="font-medium">{platform.name}</span>
                      {platform.enabled && (
                        <Badge variant="secondary" className="ml-2">Enabled</Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Toggle platform
                        console.log(`Toggling ${platform.name}`);
                      }}
                    >
                      {platform.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Questions Database</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    The system automatically detects and saves application questions. You'll be prompted to answer new questions as they're encountered.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center py-8 text-muted-foreground">
                  <p>No questions have been detected yet.</p>
                  <p className="text-sm">Start the automation to begin collecting application questions.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Networking Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    Automatically find and reach out to recruiters and alumni at companies you're interested in.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center py-8 text-muted-foreground">
                  <p>No networking contacts found yet.</p>
                  <p className="text-sm">Enable networking automation to start building connections.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
