
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Bell,
  BellOff, 
  Mail, 
  MessageSquare,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type AlertType = "email" | "browser" | "discord";
type AlertFrequency = "instant" | "hourly" | "daily";

interface AlertSettings {
  enabled: boolean;
  types: {
    email: boolean;
    browser: boolean;
    discord: boolean;
  };
  frequency: AlertFrequency;
  keywords: string[];
  minMatchPercentage: number;
}

export function RealTimeJobAlerts() {
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    types: {
      email: true,
      browser: true,
      discord: false
    },
    frequency: "instant",
    keywords: ["React", "TypeScript", "Frontend"],
    minMatchPercentage: 70
  });
  
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showWebhookInput, setShowWebhookInput] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  
  // Toggle alert system on/off
  const toggleAlerts = () => {
    const newEnabled = !settings.enabled;
    setSettings({
      ...settings,
      enabled: newEnabled
    });
    
    toast({
      title: newEnabled ? "Alerts Enabled" : "Alerts Disabled",
      description: newEnabled 
        ? "You will receive real-time job alerts based on your preferences"
        : "You will no longer receive job alerts",
    });
  };
  
  // Toggle individual alert types
  const toggleAlertType = (type: AlertType) => {
    setSettings({
      ...settings,
      types: {
        ...settings.types,
        [type]: !settings.types[type]
      }
    });
    
    // If enabling Discord notifications, show webhook input
    if (type === "discord" && !settings.types.discord) {
      setShowWebhookInput(true);
    }
  };
  
  // Change alert frequency
  const changeFrequency = (frequency: AlertFrequency) => {
    setSettings({
      ...settings,
      frequency
    });
    
    toast({
      title: "Alert Frequency Updated",
      description: `Job alerts will now be sent ${frequency}ly`
    });
  };
  
  // Add new keyword
  const addKeyword = () => {
    if (newKeyword && !settings.keywords.includes(newKeyword)) {
      setSettings({
        ...settings,
        keywords: [...settings.keywords, newKeyword]
      });
      setNewKeyword("");
    }
  };
  
  // Remove keyword
  const removeKeyword = (keyword: string) => {
    setSettings({
      ...settings,
      keywords: settings.keywords.filter(k => k !== keyword)
    });
  };
  
  // Set minimum match percentage
  const setMinMatch = (value: number) => {
    setSettings({
      ...settings,
      minMatchPercentage: value
    });
  };
  
  // Save Discord webhook
  const saveWebhook = () => {
    if (webhookUrl) {
      toast({
        title: "Discord Webhook Saved",
        description: "You will now receive job alerts via Discord"
      });
      setShowWebhookInput(false);
    }
  };

  // Effect for testing job alert (demonstration only)
  useEffect(() => {
    if (settings.enabled) {
      // Simulate finding a matching job after component mounts
      const timer = setTimeout(() => {
        if (Math.random() > 0.5) { // 50% chance of showing an alert
          toast({
            title: "New Job Match!",
            description: "Senior React Developer at Acme Corp - 85% match",
            duration: 10000,
          });
        }
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [settings.enabled]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Real-Time Job Alerts
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {settings.enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={settings.enabled}
            onCheckedChange={toggleAlerts}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold">Notification Methods</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={settings.types.email ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAlertType("email")}
                disabled={!settings.enabled}
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                Email
              </Button>
              
              <Button
                variant={settings.types.browser ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAlertType("browser")}
                disabled={!settings.enabled}
              >
                <Bell className="h-3.5 w-3.5 mr-1" />
                Browser
              </Button>
              
              <Button
                variant={settings.types.discord ? "default" : "outline"}
                size="sm"
                onClick={() => toggleAlertType("discord")}
                disabled={!settings.enabled}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Discord
              </Button>
            </div>
          </div>
          
          {showWebhookInput && (
            <div className="space-y-2">
              <div className="text-xs font-semibold">Discord Webhook URL</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="https://discord.com/api/webhooks/..."
                />
                <Button size="sm" onClick={saveWebhook}>Save</Button>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-xs font-semibold">Alert Frequency</div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={settings.frequency === "instant" ? "default" : "outline"}
                size="sm"
                onClick={() => changeFrequency("instant")}
                disabled={!settings.enabled}
              >
                Instant
              </Button>
              
              <Button
                variant={settings.frequency === "hourly" ? "default" : "outline"}
                size="sm"
                onClick={() => changeFrequency("hourly")}
                disabled={!settings.enabled}
              >
                Hourly
              </Button>
              
              <Button
                variant={settings.frequency === "daily" ? "default" : "outline"}
                size="sm"
                onClick={() => changeFrequency("daily")}
                disabled={!settings.enabled}
              >
                Daily
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-semibold">Minimum Match Percentage</div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={settings.minMatchPercentage}
                onChange={(e) => setMinMatch(parseInt(e.target.value))}
                disabled={!settings.enabled}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <span className="text-sm font-medium">{settings.minMatchPercentage}%</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-semibold">Alert Keywords</div>
            <div className="flex flex-wrap gap-1">
              {settings.keywords.map((keyword) => (
                <div 
                  key={keyword}
                  className="bg-gray-100 dark:bg-gray-800 text-xs px-2 py-1 rounded flex items-center"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    disabled={!settings.enabled}
                    className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                disabled={!settings.enabled}
                className="flex-1 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Add keyword..."
                onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
              />
              <Button 
                size="sm" 
                onClick={addKeyword}
                disabled={!settings.enabled || !newKeyword}
              >
                Add
              </Button>
            </div>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                disabled={!settings.enabled}
              >
                <Settings className="h-3.5 w-3.5 mr-2" />
                Advanced Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Advanced Alert Settings</h4>
                
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Exclude recruiters</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Exclude agencies</span>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs">Include remote only</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
        </div>
      </CardContent>
    </Card>
  );
}
