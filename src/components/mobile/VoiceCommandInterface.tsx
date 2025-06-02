import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import type { 
  SpeechRecognition, 
  SpeechRecognitionStatic, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '@/types/speechRecognition';

interface VoiceCommandInterfaceProps {
  onCommand: (command: string, confidence: number) => void;
  isEnabled?: boolean;
  language?: string;
}

export const VoiceCommandInterface: React.FC<VoiceCommandInterfaceProps> = ({
  onCommand,
  isEnabled = true,
  language = 'en-US'
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for browser support
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      initializeRecognition(SpeechRecognitionClass);
    } else {
      console.warn('Speech recognition not supported in this browser');
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const initializeRecognition = (SpeechRecognitionConstructor: SpeechRecognitionStatic) => {
    const recognition = new SpeechRecognitionConstructor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setConfidence(0);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setConfidence(confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onCommand(finalTranscript.trim(), confidence || 0.8);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      toast({
        title: "Voice Recognition Error",
        description: `Error: ${event.error}`,
        variant: "destructive"
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const startListening = () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in this browser",
        variant: "destructive"
      });
      return;
    }

    if (!isEnabled) {
      toast({
        title: "Voice Commands Disabled",
        description: "Voice commands are currently disabled",
        variant: "destructive"
      });
      return;
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast({
          title: "Voice Recognition Error",
          description: "Failed to start voice recognition",
          variant: "destructive"
        });
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <Badge variant="destructive">Voice commands not supported</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <div className="flex items-center space-x-4">
        <Button
          size="lg"
          variant={isListening ? "destructive" : "default"}
          onClick={isListening ? stopListening : startListening}
          disabled={!isEnabled}
          className="rounded-full w-16 h-16"
        >
          {isListening ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {isListening && (
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-primary animate-pulse" />
            <Badge variant="secondary">Listening...</Badge>
          </div>
        )}
      </div>

      {transcript && (
        <div className="w-full max-w-md">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
            <p className="text-sm">{transcript}</p>
            {confidence > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Confidence: {Math.round(confidence * 100)}%
              </p>
            )}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {isEnabled 
            ? "Tap the microphone to start voice commands" 
            : "Voice commands are disabled"
          }
        </p>
      </div>
    </div>
  );
};

export default VoiceCommandInterface;
