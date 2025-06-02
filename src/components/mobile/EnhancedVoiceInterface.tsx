
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoiceCommands } from '@/hooks/useVoiceCommands';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  HelpCircle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedVoiceInterfaceProps {
  onFiltersChange?: (filters: any) => void;
  onSearchChange?: (query: string) => void;
  className?: string;
}

const EnhancedVoiceInterface: React.FC<EnhancedVoiceInterfaceProps> = ({
  onFiltersChange,
  onSearchChange,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('en-US');
  const [continuous, setContinuous] = useState(false);

  const {
    isSupported,
    isListening,
    transcript,
    lastResponse,
    toggleListening,
    processVoiceCommand
  } = useVoiceCommands({
    onFiltersChange,
    onSearchChange,
    continuous,
    language
  });

  // Speak responses using text-to-speech
  const speakResponse = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (lastResponse && voiceEnabled) {
      speakResponse(lastResponse.message);
    }
  }, [lastResponse, voiceEnabled]);

  const handleVoiceToggle = () => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser');
      return;
    }

    toggleListening();
  };

  const handleTestCommand = async () => {
    const testCommands = [
      'search for developer jobs',
      'filter by remote jobs',
      'go to dashboard',
      'help'
    ];
    
    const randomCommand = testCommands[Math.floor(Math.random() * testCommands.length)];
    await processVoiceCommand(randomCommand);
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center">
          <MicOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">
            Voice commands not supported in this browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Voice Control */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Voice Assistant</span>
              {isListening && (
                <Badge variant="secondary" className="animate-pulse">
                  Listening...
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Voice Button */}
          <div className="text-center">
            <Button
              size="lg"
              variant={isListening ? "destructive" : "default"}
              onClick={handleVoiceToggle}
              className="rounded-full w-16 h-16"
            >
              {isListening ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground mt-2">
              {isListening 
                ? "Tap to stop listening" 
                : "Tap to start voice command"
              }
            </p>
          </div>

          {/* Transcript Display */}
          {transcript && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-1">You said:</div>
              <div className="text-sm">{transcript}</div>
            </div>
          )}

          {/* Response Display */}
          {lastResponse && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium mb-1 text-blue-800">Assistant:</div>
              <div className="text-sm text-blue-700">{lastResponse.message}</div>
              
              {lastResponse.suggestions && lastResponse.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs font-medium text-blue-800">Try saying:</div>
                  {lastResponse.suggestions.slice(0, 3).map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="mr-2 text-xs">
                      "{suggestion}"
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestCommand}
              className="flex-1"
            >
              Test Command
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => processVoiceCommand('help')}
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Voice Settings</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Continuous Listening</label>
              <Button
                size="sm"
                variant={continuous ? "default" : "outline"}
                onClick={() => setContinuous(!continuous)}
              >
                {continuous ? "On" : "Off"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Voice Responses</label>
              <Button
                size="sm"
                variant={voiceEnabled ? "default" : "outline"}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? "On" : "Off"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <HelpCircle className="h-5 w-5 mr-2" />
            Example Commands
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <span className="font-medium">Job Search:</span>
              <div className="text-muted-foreground">
                "Search for software engineer jobs"
              </div>
            </div>
            
            <div>
              <span className="font-medium">Filtering:</span>
              <div className="text-muted-foreground">
                "Show only remote jobs"
              </div>
            </div>
            
            <div>
              <span className="font-medium">Navigation:</span>
              <div className="text-muted-foreground">
                "Go to dashboard"
              </div>
            </div>
            
            <div>
              <span className="font-medium">Salary:</span>
              <div className="text-muted-foreground">
                "Filter by salary above 80k"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedVoiceInterface;
