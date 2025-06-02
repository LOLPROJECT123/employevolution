
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedIntegrationService } from '@/services/enhancedIntegrationService';
import { RealApiIntegrationService } from '@/services/realApiIntegrationService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Calendar, 
  Mail, 
  Briefcase, 
  Linkedin, 
  CheckCircle, 
  XCircle,
  Settings
} from 'lucide-react';

interface IntegrationStatus {
  linkedin: boolean;
  googleCalendar: boolean;
  outlookCalendar: boolean;
  atsIntegrations: string[];
}

export const IntegrationManager: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<IntegrationStatus>({
    linkedin: false,
    googleCalendar: false,
    outlookCalendar: false,
    atsIntegrations: []
  });
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // LinkedIn Integration
  const [linkedinCode, setLinkedinCode] = useState('');

  // Calendar Integration
  const [calendarProvider, setCalendarProvider] = useState<'google' | 'outlook'>('google');
  const [calendarClientId, setCalendarClientId] = useState('');
  const [calendarSecret, setCalendarSecret] = useState('');

  // Email Integration
  const [emailProvider, setEmailProvider] = useState<'sendgrid' | 'mailgun'>('sendgrid');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [emailDomain, setEmailDomain] = useState('');

  // ATS Integration
  const [atsProvider, setAtsProvider] = useState<'greenhouse' | 'lever' | 'workday'>('greenhouse');
  const [atsApiKey, setAtsApiKey] = useState('');
  const [atsBaseUrl, setAtsBaseUrl] = useState('');

  useEffect(() => {
    loadIntegrationStatus();
  }, [user]);

  const loadIntegrationStatus = async () => {
    if (!user) return;

    try {
      const integrationStatus = await EnhancedIntegrationService.getIntegrationStatus(user.id);
      setStatus(integrationStatus);
    } catch (error) {
      console.error('Failed to load integration status:', error);
    }
  };

  const handleLinkedInAuth = async () => {
    if (!linkedinCode.trim()) {
      toast.error('Please enter the LinkedIn authorization code');
      return;
    }

    setLoading(prev => ({ ...prev, linkedin: true }));
    try {
      const result = await EnhancedIntegrationService.authenticateLinkedInOAuth(linkedinCode);
      if (result.success) {
        toast.success('LinkedIn connected successfully!');
        setStatus(prev => ({ ...prev, linkedin: true }));
        setLinkedinCode('');
      } else {
        toast.error(result.error || 'LinkedIn connection failed');
      }
    } catch (error) {
      toast.error('Failed to connect LinkedIn');
    } finally {
      setLoading(prev => ({ ...prev, linkedin: false }));
    }
  };

  const handleCalendarSync = async () => {
    if (!user) return;

    setLoading(prev => ({ ...prev, calendar: true }));
    try {
      const result = await EnhancedIntegrationService.syncCalendarEvents(user.id, calendarProvider);
      if (result.success) {
        toast.success(`${calendarProvider} Calendar synced! ${result.eventsCount} events processed.`);
        setStatus(prev => ({ 
          ...prev, 
          [calendarProvider === 'google' ? 'googleCalendar' : 'outlookCalendar']: true 
        }));
      } else {
        toast.error(result.error || 'Calendar sync failed');
      }
    } catch (error) {
      toast.error('Failed to sync calendar');
    } finally {
      setLoading(prev => ({ ...prev, calendar: false }));
    }
  };

  const handleEmailTest = async () => {
    if (!emailApiKey.trim()) {
      toast.error('Please enter your email API key');
      return;
    }

    setLoading(prev => ({ ...prev, email: true }));
    try {
      const result = await EnhancedIntegrationService.sendSMTPEmail(
        'test@example.com',
        'Test Email',
        'This is a test email from your job search assistant!'
      );
      
      if (result.success) {
        toast.success('Test email sent successfully!');
      } else {
        toast.error(result.error || 'Email test failed');
      }
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleATSConnect = async () => {
    if (!user || !atsApiKey.trim() || !atsBaseUrl.trim()) {
      toast.error('Please fill in all ATS connection fields');
      return;
    }

    setLoading(prev => ({ ...prev, ats: true }));
    try {
      const result = await RealApiIntegrationService.connectATS({
        provider: atsProvider,
        apiKey: atsApiKey,
        baseUrl: atsBaseUrl
      });

      if (result.success) {
        toast.success(`${atsProvider} connected successfully!`);
        setStatus(prev => ({ 
          ...prev, 
          atsIntegrations: [...prev.atsIntegrations, atsProvider]
        }));
      } else {
        toast.error(result.error || 'ATS connection failed');
      }
    } catch (error) {
      toast.error('Failed to connect ATS');
    } finally {
      setLoading(prev => ({ ...prev, ats: false }));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Integration Manager</h1>
        <p className="text-muted-foreground">Connect and manage your external integrations</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ats">ATS</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LinkedIn</CardTitle>
                <Linkedin className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status.linkedin ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={status.linkedin ? "default" : "secondary"}>
                    {status.linkedin ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calendar</CardTitle>
                <Calendar className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status.googleCalendar || status.outlookCalendar ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={status.googleCalendar || status.outlookCalendar ? "default" : "secondary"}>
                    {status.googleCalendar || status.outlookCalendar ? "Synced" : "Not Synced"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email</CardTitle>
                <Mail className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline">Configurable</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ATS Systems</CardTitle>
                <Briefcase className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {status.atsIntegrations.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <Badge variant={status.atsIntegrations.length > 0 ? "default" : "secondary"}>
                    {status.atsIntegrations.length} Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Linkedin className="h-5 w-5" />
                <span>LinkedIn Integration</span>
              </CardTitle>
              <CardDescription>
                Connect your LinkedIn account to import profile data and network contacts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin-code">Authorization Code</Label>
                <Input
                  id="linkedin-code"
                  placeholder="Enter LinkedIn authorization code"
                  value={linkedinCode}
                  onChange={(e) => setLinkedinCode(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleLinkedInAuth} 
                disabled={loading.linkedin}
                className="w-full"
              >
                {loading.linkedin ? 'Connecting...' : 'Connect LinkedIn'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Calendar Integration</span>
              </CardTitle>
              <CardDescription>
                Sync your calendar to manage interview schedules and reminders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Calendar Provider</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="calendar-provider"
                      value="google"
                      checked={calendarProvider === 'google'}
                      onChange={(e) => setCalendarProvider(e.target.value as 'google')}
                    />
                    <span>Google Calendar</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="calendar-provider"
                      value="outlook"
                      checked={calendarProvider === 'outlook'}
                      onChange={(e) => setCalendarProvider(e.target.value as 'outlook')}
                    />
                    <span>Outlook Calendar</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calendar-client-id">Client ID</Label>
                  <Input
                    id="calendar-client-id"
                    placeholder="Enter client ID"
                    value={calendarClientId}
                    onChange={(e) => setCalendarClientId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calendar-secret">Client Secret</Label>
                  <Input
                    id="calendar-secret"
                    type="password"
                    placeholder="Enter client secret"
                    value={calendarSecret}
                    onChange={(e) => setCalendarSecret(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCalendarSync} 
                disabled={loading.calendar}
                className="w-full"
              >
                {loading.calendar ? 'Syncing...' : `Sync ${calendarProvider} Calendar`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Email Integration</span>
              </CardTitle>
              <CardDescription>
                Configure SMTP settings for automated email communications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Provider</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="email-provider"
                      value="sendgrid"
                      checked={emailProvider === 'sendgrid'}
                      onChange={(e) => setEmailProvider(e.target.value as 'sendgrid')}
                    />
                    <span>SendGrid</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="email-provider"
                      value="mailgun"
                      checked={emailProvider === 'mailgun'}
                      onChange={(e) => setEmailProvider(e.target.value as 'mailgun')}
                    />
                    <span>Mailgun</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email-api-key">API Key</Label>
                  <Input
                    id="email-api-key"
                    type="password"
                    placeholder="Enter API key"
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-domain">Domain (for Mailgun)</Label>
                  <Input
                    id="email-domain"
                    placeholder="yourdomain.com"
                    value={emailDomain}
                    onChange={(e) => setEmailDomain(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleEmailTest} 
                disabled={loading.email}
                className="w-full"
              >
                {loading.email ? 'Testing...' : 'Test Email Configuration'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5" />
                <span>ATS Integration</span>
              </CardTitle>
              <CardDescription>
                Connect to Applicant Tracking Systems to sync applications and job data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>ATS Provider</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ats-provider"
                      value="greenhouse"
                      checked={atsProvider === 'greenhouse'}
                      onChange={(e) => setAtsProvider(e.target.value as 'greenhouse')}
                    />
                    <span>Greenhouse</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ats-provider"
                      value="lever"
                      checked={atsProvider === 'lever'}
                      onChange={(e) => setAtsProvider(e.target.value as 'lever')}
                    />
                    <span>Lever</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="ats-provider"
                      value="workday"
                      checked={atsProvider === 'workday'}
                      onChange={(e) => setAtsProvider(e.target.value as 'workday')}
                    />
                    <span>Workday</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ats-api-key">API Key</Label>
                  <Input
                    id="ats-api-key"
                    type="password"
                    placeholder="Enter API key"
                    value={atsApiKey}
                    onChange={(e) => setAtsApiKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ats-base-url">Base URL</Label>
                  <Input
                    id="ats-base-url"
                    placeholder="https://api.company.greenhouse.io"
                    value={atsBaseUrl}
                    onChange={(e) => setAtsBaseUrl(e.target.value)}
                  />
                </div>
              </div>
              <Button 
                onClick={handleATSConnect} 
                disabled={loading.ats}
                className="w-full"
              >
                {loading.ats ? 'Connecting...' : `Connect ${atsProvider}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
