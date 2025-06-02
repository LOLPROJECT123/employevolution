
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2 } from 'lucide-react';

interface VoiceCommand {
  command: string;
  action: () => void;
  description: string;
}

export const VoiceCommandInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const voiceCommands: VoiceCommand[] = [
    {
      command: 'search jobs',
      action: () => navigate('/jobs'),
      description: 'Navigate to job search'
    },
    {
      command: 'view applications',
      action: () => navigate('/applications'),
      description: 'Show my applications'
    },
    {
      command: 'open calendar',
      action: () => navigate('/calendar'),
      description: 'View interview calendar'
    },
    {
      command: 'show analytics',
      action: () => navigate('/analytics'),
      description: 'View job search analytics'
    },
    {
      command: 'edit profile',
      action: () => navigate('/profile'),
      description: 'Edit user profile'
    },
    {
      command: 'resume tools',
      action: () => navigate('/resume-tools'),
      description: 'Access resume tools'
    },
    {
      command: 'networking',
      action: () => navigate('/networking'),
      description: 'View networking opportunities'
    },
    {
      command: 'practice interview',
      action: () => navigate('/interview-practice'),
      description: 'Start interview practice'
    }
  ];

  useEffect(() => {
    // Check if SpeechRecognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Recognition Error",
          description: "Please try again or check microphone permissions",
          variant: "destructive"
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const processVoiceCommand = (command: string) => {
    const matchedCommand = voiceCommands.find(cmd => 
      command.includes(cmd.command) || 
      cmd.command.split(' ').every(word => command.includes(word))
    );

    if (matchedCommand) {
      setLastCommand(matchedCommand.command);
      matchedCommand.action();
      toast({
        title: "Voice Command Executed",
        description: matchedCommand.description
      });
    } else {
      // Try to handle partial matches or similar commands
      const partialMatch = voiceCommands.find(cmd => {
        const cmdWords = cmd.command.split(' ');
        return cmdWords.some(word => command.includes(word));
      });

      if (partialMatch) {
        toast({
          title: "Did you mean?",
          description: `"${partialMatch.command}" - ${partialMatch.description}`,
          action: (
            <Button size="sm" onClick={partialMatch.action}>
              Execute
            </Button>
          )
        });
      } else {
        toast({
          title: "Command Not Recognized",
          description: `"${command}" - Try one of the available commands`,
          variant: "destructive"
        });
      }
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <MicOff className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Voice commands not supported in this browser
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Button */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          onClick={isListening ? stopListening : startListening}
          className="rounded-full"
        >
          {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>
        
        <div className="text-center">
          <p className="text-sm font-medium">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>
          {transcript && (
            <p className="text-xs text-muted-foreground">"{transcript}"</p>
          )}
        </div>
      </div>

      {/* Status and Last Command */}
      {lastCommand && (
        <div className="text-center">
          <Badge variant="outline">Last: {lastCommand}</Badge>
        </div>
      )}

      {/* Available Commands */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3 flex items-center">
            <Volume2 className="h-4 w-4 mr-2" />
            Available Voice Commands
          </h3>
          <div className="grid gap-2">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">"{cmd.command}"</span>
                <span className="text-muted-foreground">{cmd.description}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Say any command naturally. For example: "Search for jobs" or "Show my applications"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCommandInterface;
