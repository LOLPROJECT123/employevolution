
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VoiceCommandService, VoiceResponse } from '@/services/voiceCommandService';
import { toast } from 'sonner';
import type { 
  SpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '@/types/speechRecognition';

interface UseVoiceCommandsOptions {
  onFiltersChange?: (filters: any) => void;
  onSearchChange?: (query: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useVoiceCommands = (options: UseVoiceCommandsOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState<VoiceResponse | null>(null);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  
  const navigate = useNavigate();
  
  const {
    onFiltersChange,
    onSearchChange,
    continuous = false,
    language = 'en-US'
  } = options;

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionClass) {
      setIsSupported(true);
      
      const recognitionInstance = new SpeechRecognitionClass();
      recognitionInstance.continuous = continuous;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = language;

      recognitionInstance.onstart = () => {
        setIsListening(true);
        console.log('Voice recognition started');
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
        console.log('Voice recognition ended');
      };

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone permission denied. Please enable microphone access.');
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognitionInstance.onresult = async (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptResult = event.results[current][0].transcript;
        
        setTranscript(transcriptResult);
        
        // Only process final results
        if (event.results[current].isFinal) {
          console.log('Final transcript:', transcriptResult);
          await processVoiceCommand(transcriptResult);
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognition) {
        recognition.abort();
      }
    };
  }, [continuous, language]);

  const processVoiceCommand = async (voiceTranscript: string) => {
    try {
      const response = await VoiceCommandService.processVoiceCommand(voiceTranscript);
      setLastResponse(response);
      
      // Show response message
      toast.success(response.message);
      
      // Execute action if provided
      if (response.action) {
        await executeAction(response.action);
      }
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast.error('Failed to process voice command');
    }
  };

  const executeAction = async (action: VoiceResponse['action']) => {
    if (!action) return;

    switch (action.type) {
      case 'navigate':
        if (action.payload.route === 'back') {
          window.history.back();
        } else {
          navigate(action.payload.route);
        }
        break;
        
      case 'search':
        if (onSearchChange) {
          onSearchChange(action.payload.query);
        }
        break;
        
      case 'filter':
        if (onFiltersChange) {
          const filters = await VoiceCommandService.convertVoiceToFilters(transcript);
          onFiltersChange(filters);
        }
        break;
        
      case 'execute':
        // Handle custom execution logic
        console.log('Executing custom action:', action.payload);
        break;
    }
  };

  const startListening = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice commands not supported in this browser');
      return;
    }

    if (!recognition) {
      toast.error('Voice recognition not initialized');
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      setTranscript('');
      recognition.start();
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast.error('Failed to start voice recognition');
    }
  }, [isSupported, recognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isSupported,
    isListening,
    transcript,
    lastResponse,
    startListening,
    stopListening,
    toggleListening,
    processVoiceCommand
  };
};
