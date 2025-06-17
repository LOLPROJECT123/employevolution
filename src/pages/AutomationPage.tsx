
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrowserAutomationDashboard from "@/components/automation/BrowserAutomationDashboard";
import EnhancedJobScraper from "@/components/automation/EnhancedJobScraper";
import ChromeExtensionManager from "@/components/ChromeExtensionManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Globe, Mail, Users, Zap, Shield } from "lucide-react";

const AutomationPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Job Search Automation
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Harness the power of AI and browser automation to supercharge your job search. 
          Automatically discover opportunities, submit applications, and build professional connections.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Bot className="w-12 h-12 mx-auto mb-2 text-blue-600" />
            <CardTitle>Intelligent Scraping</CardTitle>
            <CardDescription>
              AI-powered job discovery across multiple platforms with smart filtering
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-2 text-purple-600" />
            <CardTitle>Auto Applications</CardTitle>
            <CardDescription>
              Automated application submission with personalized cover letters and resumes
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <CardTitle>Smart Networking</CardTitle>
            <CardDescription>
              Automated outreach and LinkedIn connections with personalized messaging
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="scraper">Enhanced Scraper</TabsTrigger>
          <TabsTrigger value="extension">Extension</TabsTrigger>
          <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <BrowserAutomationDashboard />
        </TabsContent>

        <TabsContent value="scraper">
          <EnhancedJobScraper />
        </TabsContent>

        <TabsContent value="extension">
          <div className="space-y-6">
            <ChromeExtensionManager />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Browser Integration Features</span>
                </CardTitle>
                <CardDescription>
                  Advanced browser automation capabilities powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">🤖 Intelligent Form Filling</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      AI automatically detects and fills application forms with your profile data
                    </p>
                    
                    <h3 className="font-semibold mb-2">🔍 Dynamic Job Detection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Automatically identifies job opportunities across any career site
                    </p>
                    
                    <h3 className="font-semibold mb-2">📊 Real-time Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Track application success rates and optimize your strategy
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">🌐 Multi-Platform Support</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Works with LinkedIn, Indeed, Glassdoor, and 100+ ATS systems
                    </p>
                    
                    <h3 className="font-semibold mb-2">🔒 Privacy Protection</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      All data processed locally with enterprise-grade security
                    </p>
                    
                    <h3 className="font-semibold mb-2">⚡ Smart Rate Limiting</h3>
                    <p className="text-sm text-muted-foreground">
                      Human-like behavior patterns to avoid detection
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="safety">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Safety & Compliance</span>
                </CardTitle>
                <CardDescription>
                  Ensuring ethical and responsible automation practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">🛡️ Built-in Safety Features</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Rate limiting to respect platform policies</li>
                    <li>• Human-like interaction patterns</li>
                    <li>• Automatic captcha detection and pause</li>
                    <li>• User approval required for sensitive actions</li>
                    <li>• Comprehensive audit logging</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">📋 Compliance Guidelines</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Respects robots.txt and platform terms of service</li>
                    <li>• No scraping of personal data without consent</li>
                    <li>• Transparent automation activity logging</li>
                    <li>• User control over all automated actions</li>
                    <li>• Regular compliance updates</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">🔒 Privacy Protection</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Local data processing when possible</li>
                    <li>• Encrypted storage of sensitive information</li>
                    <li>• No sharing of user data with third parties</li>
                    <li>• GDPR and CCPA compliant</li>
                    <li>• User data deletion on request</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📞 Support & Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">24/7 Monitoring</h4>
                    <p className="text-sm text-muted-foreground">
                      Continuous monitoring of automation health and platform compatibility
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Expert Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Dedicated support team for automation setup and troubleshooting
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationPage;
