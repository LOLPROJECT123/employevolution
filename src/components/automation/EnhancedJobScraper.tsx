
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { browserUseService } from "@/services/browserUseService";
import { Bot, Globe, Zap, Shield } from "lucide-react";

interface ScrapingConfig {
  platforms: string[];
  searchTerms: string[];
  locations: string[];
  filters: {
    remote: boolean;
    salaryMin: number;
    salaryMax: number;
    experienceLevel: string[];
    companySize: string[];
    jobType: string[];
  };
  aiSettings: {
    smartFiltering: boolean;
    duplicateDetection: boolean;
    qualityScoring: boolean;
    autoApply: boolean;
  };
}

const PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'indeed', name: 'Indeed', icon: '🔍' },
  { id: 'glassdoor', name: 'Glassdoor', icon: '🏢' },
  { id: 'monster', name: 'Monster', icon: '👾' },
  { id: 'ziprecruiter', name: 'ZipRecruiter', icon: '📧' },
  { id: 'dice', name: 'Dice', icon: '🎲' },
  { id: 'greenhouse', name: 'Greenhouse', icon: '🌱' },
  { id: 'lever', name: 'Lever', icon: '⚡' },
  { id: 'workday', name: 'Workday', icon: '📅' },
  { id: 'bamboohr', name: 'BambooHR', icon: '🎋' }
];

const EnhancedJobScraper = () => {
  const [config, setConfig] = useState<ScrapingConfig>({
    platforms: ['linkedin', 'indeed'],
    searchTerms: ['Software Engineer'],
    locations: ['San Francisco, CA'],
    filters: {
      remote: false,
      salaryMin: 80000,
      salaryMax: 200000,
      experienceLevel: ['mid'],
      companySize: ['medium', 'large'],
      jobType: ['full-time']
    },
    aiSettings: {
      smartFiltering: true,
      duplicateDetection: true,
      qualityScoring: true,
      autoApply: false
    }
  });

  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [scrapingProgress, setScrapingProgress] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scrapingResults, setScrapingResults] = useState<any>(null);

  const handlePlatformToggle = (platformId: string) => {
    setConfig(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  const addSearchTerm = (term: string) => {
    if (term && !config.searchTerms.includes(term)) {
      setConfig(prev => ({
        ...prev,
        searchTerms: [...prev.searchTerms, term]
      }));
    }
  };

  const removeSearchTerm = (term: string) => {
    setConfig(prev => ({
      ...prev,
      searchTerms: prev.searchTerms.filter(t => t !== term)
    }));
  };

  const addLocation = (location: string) => {
    if (location && !config.locations.includes(location)) {
      setConfig(prev => ({
        ...prev,
        locations: [...prev.locations, location]
      }));
    }
  };

  const removeLocation = (location: string) => {
    setConfig(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l !== location)
    }));
  };

  const startEnhancedScraping = async () => {
    try {
      setIsScrapingActive(true);
      setScrapingProgress(0);

      // Initialize browser session if not exists
      if (!sessionId) {
        const newSessionId = await browserUseService.initializeBrowserAgent('current-user');
        setSessionId(newSessionId);
      }

      // Start scraping with AI enhancements
      const task = await browserUseService.startJobScrapingSession(
        sessionId!,
        config.platforms,
        {
          searchTerms: config.searchTerms,
          locations: config.locations,
          filters: config.filters,
          aiSettings: config.aiSettings
        }
      );

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setScrapingProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsScrapingActive(false);
            // Mock results
            setScrapingResults({
              jobsFound: Math.floor(Math.random() * 100) + 50,
              platformsSearched: config.platforms.length,
              duplicatesRemoved: Math.floor(Math.random() * 20) + 5,
              qualityScore: Math.floor(Math.random() * 30) + 70,
              autoApplications: config.aiSettings.autoApply ? Math.floor(Math.random() * 10) + 2 : 0
            });
            toast.success('Enhanced job scraping completed!');
            return 100;
          }
          return prev + 2;
        });
      }, 200);

      toast.success('Enhanced job scraping started with AI');
    } catch (error) {
      console.error('Failed to start enhanced scraping:', error);
      toast.error('Failed to start enhanced scraping');
      setIsScrapingActive(false);
    }
  };

  const stopScraping = () => {
    setIsScrapingActive(false);
    setScrapingProgress(0);
    toast.info('Scraping stopped');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>AI-Enhanced Job Scraping</span>
          </CardTitle>
          <CardDescription>
            Intelligent job discovery with advanced filtering and automation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-base font-medium">Target Platforms</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {PLATFORMS.map((platform) => (
                <div
                  key={platform.id}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    config.platforms.includes(platform.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                  {config.platforms.includes(platform.id) && (
                    <div className="w-2 h-2 bg-primary rounded-full ml-auto" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search Configuration */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-base font-medium">Search Terms</Label>
              <div className="space-y-2 mt-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add job title or keyword"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSearchTerm(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.searchTerms.map((term) => (
                    <Badge
                      key={term}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeSearchTerm(term)}
                    >
                      {term} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Locations</Label>
              <div className="space-y-2 mt-2">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add location"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLocation(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {config.locations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeLocation(location)}
                    >
                      {location} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <Label className="text-base font-medium mb-3 block">Filters</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={config.filters.remote}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        filters: { ...prev.filters, remote: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="remote">Remote work options</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="salaryMin" className="text-sm">Min Salary</Label>
                    <Input
                      id="salaryMin"
                      type="number"
                      value={config.filters.salaryMin}
                      onChange={(e) =>
                        setConfig(prev => ({
                          ...prev,
                          filters: { ...prev.filters, salaryMin: parseInt(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryMax" className="text-sm">Max Salary</Label>
                    <Input
                      id="salaryMax"
                      type="number"
                      value={config.filters.salaryMax}
                      onChange={(e) =>
                        setConfig(prev => ({
                          ...prev,
                          filters: { ...prev.filters, salaryMax: parseInt(e.target.value) || 0 }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="experienceLevel" className="text-sm">Experience Level</Label>
                <Select
                  value={config.filters.experienceLevel[0] || ''}
                  onValueChange={(value) =>
                    setConfig(prev => ({
                      ...prev,
                      filters: { ...prev.filters, experienceLevel: [value] }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead/Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div>
            <Label className="text-base font-medium mb-3 block">AI Enhancements</Label>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smartFiltering"
                    checked={config.aiSettings.smartFiltering}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        aiSettings: { ...prev.aiSettings, smartFiltering: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="smartFiltering" className="flex items-center space-x-1">
                    <Zap className="w-4 h-4" />
                    <span>Smart filtering</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="duplicateDetection"
                    checked={config.aiSettings.duplicateDetection}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        aiSettings: { ...prev.aiSettings, duplicateDetection: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="duplicateDetection" className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Duplicate detection</span>
                  </Label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="qualityScoring"
                    checked={config.aiSettings.qualityScoring}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        aiSettings: { ...prev.aiSettings, qualityScoring: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="qualityScoring" className="flex items-center space-x-1">
                    <Globe className="w-4 h-4" />
                    <span>Quality scoring</span>
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoApply"
                    checked={config.aiSettings.autoApply}
                    onCheckedChange={(checked) =>
                      setConfig(prev => ({
                        ...prev,
                        aiSettings: { ...prev.aiSettings, autoApply: checked as boolean }
                      }))
                    }
                  />
                  <Label htmlFor="autoApply" className="flex items-center space-x-1">
                    <Bot className="w-4 h-4" />
                    <span>Auto-apply (Beta)</span>
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Progress and Controls */}
          {isScrapingActive && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Scraping Progress</Label>
                <span className="text-sm text-muted-foreground">{scrapingProgress}%</span>
              </div>
              <Progress value={scrapingProgress} />
            </div>
          )}

          <div className="flex space-x-3">
            {!isScrapingActive ? (
              <Button
                onClick={startEnhancedScraping}
                disabled={config.platforms.length === 0 || config.searchTerms.length === 0}
                className="flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>Start AI Scraping</span>
              </Button>
            ) : (
              <Button onClick={stopScraping} variant="destructive">
                Stop Scraping
              </Button>
            )}
          </div>

          {/* Results */}
          {scrapingResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scraping Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{scrapingResults.jobsFound}</div>
                    <div className="text-sm text-muted-foreground">Jobs Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{scrapingResults.platformsSearched}</div>
                    <div className="text-sm text-muted-foreground">Platforms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{scrapingResults.duplicatesRemoved}</div>
                    <div className="text-sm text-muted-foreground">Duplicates Removed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{scrapingResults.qualityScore}%</div>
                    <div className="text-sm text-muted-foreground">Avg Quality Score</div>
                  </div>
                </div>
                {config.aiSettings.autoApply && (
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold text-orange-600">
                      {scrapingResults.autoApplications} applications submitted automatically
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedJobScraper;
