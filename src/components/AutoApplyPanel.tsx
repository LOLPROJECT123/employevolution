
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Zap, Pause, Play, StopCircle, Check, X, AlertTriangle, Loader2, UserCheck, Clock, Settings } from "lucide-react";
import { ExtendedJob } from "@/types/jobExtensions";
import { getUserProfile } from "@/utils/profileUtils";
import { JobAutoApplier, AutoApplyConfig, AutoApplierProgress, useAutoApplier } from '@/services/jobAutomation/autoApplier';
import { Badge } from '@/components/ui/badge';

interface AutoApplyPanelProps {
  jobs: ExtendedJob[];
  onJobStatusUpdate?: (jobId: string, status: string) => void;
}

const AutoApplyPanel = ({ jobs, onJobStatusUpdate }: AutoApplyPanelProps) => {
  const [activeTab, setActiveTab] = useState('configure');
  const [config, setConfig] = useState<AutoApplyConfig>({
    autoFillProfile: true,
    autoUploadResume: true,
    autoUploadCoverLetter: true,
    skipCustomQuestions: false,
    useAIForCustomQuestions: true,
    trackApplicationStatus: true,
    sendFollowupMessage: false,
    followUpDays: 7,
    onlyApplyToMatchedJobs: true,
    minimumMatchPercentage: 70,
    applyCooldownMinutes: 5,
    maxApplicationsPerDay: 25,
    maxApplicationsPerCompany: 3,
    avoidDuplicateApplications: true,
    useProxy: false,
    useHeadlessBrowser: true
  });
  
  const [progress, setProgress] = useState<AutoApplierProgress | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<ExtendedJob[]>([]);
  
  const profile = getUserProfile();
  const { 
    createApplier, 
    startApplying, 
    pauseApplying, 
    resumeApplying, 
    stopApplying,
    getProgress
  } = useAutoApplier(selectedJobs, profile, config);
  
  useEffect(() => {
    // Filter jobs based on config
    if (config.onlyApplyToMatchedJobs) {
      const filtered = jobs.filter(job => 
        (job.matchPercentage || 0) >= config.minimumMatchPercentage
      );
      setSelectedJobs(filtered);
    } else {
      setSelectedJobs(jobs);
    }
  }, [jobs, config.onlyApplyToMatchedJobs, config.minimumMatchPercentage]);
  
  const handleStartAutomation = async () => {
    if (selectedJobs.length === 0) {
      toast.error("No jobs selected for auto-application");
      return;
    }
    
    try {
      setIsRunning(true);
      setIsPaused(false);
      
      // Create new applier
      createApplier();
      
      // Start applying
      toast.loading("Starting auto-application process");
      const result = await startApplying();
      
      setProgress(result);
      setActiveTab('progress');
      
      // If not yet complete (paused or error), update state
      if (result.status !== 'complete') {
        setIsRunning(result.status === 'running');
        setIsPaused(result.status === 'paused');
      } else {
        setIsRunning(false);
        setIsPaused(false);
        toast.success(`Applied to ${result.stats.successfulApplications} jobs successfully`);
        
        // Update job statuses if callback provided
        if (onJobStatusUpdate) {
          result.results.forEach(r => {
            if (r.success) {
              onJobStatusUpdate(r.jobId, 'applied');
            }
          });
        }
      }
    } catch (error) {
      console.error('Error in auto-application:', error);
      toast.error("Error in auto-application process");
      setIsRunning(false);
    }
  };
  
  const handlePauseAutomation = () => {
    pauseApplying();
    setIsPaused(true);
    toast.info("Auto-application process paused");
  };
  
  const handleResumeAutomation = async () => {
    try {
      setIsPaused(false);
      const result = await resumeApplying();
      setProgress(result);
      
      if (result.status === 'complete') {
        setIsRunning(false);
        toast.success(`Applied to ${result.stats.successfulApplications} jobs successfully`);
      }
    } catch (error) {
      console.error('Error resuming auto-application:', error);
      toast.error("Error resuming auto-application process");
    }
  };
  
  const handleStopAutomation = () => {
    stopApplying();
    setIsRunning(false);
    setIsPaused(false);
    toast.info("Auto-application process stopped");
  };
  
  const getProgressPercentage = () => {
    if (!progress) return 0;
    return Math.round((progress.currentJobIndex / progress.totalJobs) * 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Auto Application</CardTitle>
        <CardDescription>
          Automatically apply to multiple jobs with your profile
        </CardDescription>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="progress" disabled={!progress}>
              Progress
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="configure" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  {selectedJobs.length > 0 
                    ? `${selectedJobs.length} jobs selected for auto-application` 
                    : "No jobs selected yet. Adjust the criteria below."}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="use-matched-jobs">Only apply to matching jobs</Label>
                    <Switch
                      id="use-matched-jobs"
                      checked={config.onlyApplyToMatchedJobs}
                      onCheckedChange={(checked) => setConfig({...config, onlyApplyToMatchedJobs: checked})}
                    />
                  </div>
                  
                  {config.onlyApplyToMatchedJobs && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Minimum match percentage: {config.minimumMatchPercentage}%</Label>
                        <span className="text-sm text-muted-foreground">
                          {jobs.filter(j => (j.matchPercentage || 0) >= config.minimumMatchPercentage).length} jobs
                        </span>
                      </div>
                      <Slider
                        defaultValue={[config.minimumMatchPercentage]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={(values) => setConfig({...config, minimumMatchPercentage: values[0]})}
                      />
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Application Settings</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-fill-profile">Auto-fill profile details</Label>
                      <Switch
                        id="auto-fill-profile"
                        checked={config.autoFillProfile}
                        onCheckedChange={(checked) => setConfig({...config, autoFillProfile: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-upload-resume">Auto-upload resume</Label>
                      <Switch
                        id="auto-upload-resume"
                        checked={config.autoUploadResume}
                        onCheckedChange={(checked) => setConfig({...config, autoUploadResume: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-upload-cover-letter">Auto-upload cover letter</Label>
                      <Switch
                        id="auto-upload-cover-letter"
                        checked={config.autoUploadCoverLetter}
                        onCheckedChange={(checked) => setConfig({...config, autoUploadCoverLetter: checked})}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="skip-custom-questions">Skip custom questions</Label>
                      <Switch
                        id="skip-custom-questions"
                        checked={config.skipCustomQuestions}
                        onCheckedChange={(checked) => setConfig({...config, skipCustomQuestions: checked})}
                      />
                    </div>
                    
                    {!config.skipCustomQuestions && (
                      <div className="flex items-center justify-between">
                        <Label htmlFor="use-ai-questions">Use AI for custom questions</Label>
                        <Switch
                          id="use-ai-questions"
                          checked={config.useAIForCustomQuestions}
                          onCheckedChange={(checked) => setConfig({...config, useAIForCustomQuestions: checked})}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Safety & Limits</h3>
                  
                  <div className="space-y-2">
                    <Label>Wait time between applications: {config.applyCooldownMinutes} minutes</Label>
                    <Slider
                      defaultValue={[config.applyCooldownMinutes]}
                      min={1}
                      max={30}
                      step={1}
                      onValueChange={(values) => setConfig({...config, applyCooldownMinutes: values[0]})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum applications per day: {config.maxApplicationsPerDay}</Label>
                    <Slider
                      defaultValue={[config.maxApplicationsPerDay]}
                      min={5}
                      max={100}
                      step={5}
                      onValueChange={(values) => setConfig({...config, maxApplicationsPerDay: values[0]})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="avoid-duplicates">Avoid duplicate applications</Label>
                    <Switch
                      id="avoid-duplicates"
                      checked={config.avoidDuplicateApplications}
                      onCheckedChange={(checked) => setConfig({...config, avoidDuplicateApplications: checked})}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleStartAutomation} 
                disabled={isRunning || isPaused || selectedJobs.length === 0}
                className="w-full"
              >
                <Zap className="mr-2 h-4 w-4" />
                Start Auto-Apply
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4 mt-4">
            {progress && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {isRunning && !isPaused && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Running
                        </Badge>
                      )}
                      {isPaused && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Paused
                        </Badge>
                      )}
                      {progress.status === 'complete' && (
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                      {progress.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {progress.currentJobIndex} of {progress.totalJobs} jobs processed
                    </span>
                  </div>
                  <Progress value={getProgressPercentage()} />
                </div>
                
                <div className="flex space-x-2 justify-center">
                  {isRunning && !isPaused && (
                    <Button onClick={handlePauseAutomation} variant="outline">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                  )}
                  
                  {isPaused && (
                    <Button onClick={handleResumeAutomation} variant="outline">
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                  )}
                  
                  {(isRunning || isPaused) && (
                    <Button onClick={handleStopAutomation} variant="destructive">
                      <StopCircle className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  )}
                  
                  {!isRunning && !isPaused && (
                    <Button onClick={() => setActiveTab('configure')} variant="outline">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                  )}
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <span className="block text-2xl font-semibold text-green-700">
                      {progress.stats.successfulApplications}
                    </span>
                    <span className="text-sm text-green-600">Success</span>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-3 text-center">
                    <span className="block text-2xl font-semibold text-red-700">
                      {progress.stats.failedApplications}
                    </span>
                    <span className="text-sm text-red-600">Failed</span>
                  </div>
                  
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <span className="block text-2xl font-semibold text-yellow-700">
                      {progress.stats.skippedApplications}
                    </span>
                    <span className="text-sm text-yellow-600">Skipped</span>
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <span className="block text-2xl font-semibold text-blue-700">
                      {progress.stats.totalProcessed}
                    </span>
                    <span className="text-sm text-blue-600">Total</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="font-medium">Application Results</h3>
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {progress.results.map((result, index) => (
                        <div 
                          key={index} 
                          className={`p-2 rounded-md flex justify-between items-center ${
                            result.success 
                              ? "bg-green-50 border border-green-100" 
                              : "bg-red-50 border border-red-100"
                          }`}
                        >
                          <div>
                            <div className="font-medium">{result.jobTitle}</div>
                            <div className="text-sm text-muted-foreground">{result.company}</div>
                          </div>
                          <div className="flex items-center">
                            {result.success ? (
                              <Check className="h-5 w-5 text-green-500" />
                            ) : (
                              <X className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {progress.results.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No results yet.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
};

export default AutoApplyPanel;
