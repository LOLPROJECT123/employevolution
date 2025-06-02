
import { useState, useEffect, useRef } from 'react';

interface VoiceSearchOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

export const useVoiceSearch = ({
  onResult,
  onError,
  continuous = false,
  language = 'en-US'
}: VoiceSearchOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = continuous;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript || interimTranscript;
        setTranscript(fullTranscript);

        if (finalTranscript) {
          onResult(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        const errorMessage = `Speech recognition error: ${event.error}`;
        console.error(errorMessage);
        onError?.(errorMessage);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      onError?.('Speech recognition is not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult, onError, continuous, language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isSupported,
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
  };
};

// Voice commands for job search
export const useVoiceJobSearch = (onSearch: (query: string) => void) => {
  const processVoiceCommand = (transcript: string) => {
    const lowercaseTranscript = transcript.toLowerCase();

    // Remove command phrases and extract search terms
    const searchTerms = lowercaseTranscript
      .replace(/^(search for|find|look for|show me)\s+/i, '')
      .replace(/\s+(jobs|positions|roles|opportunities)$/i, '')
      .trim();

    if (searchTerms) {
      onSearch(searchTerms);
    }
  };

  return useVoiceSearch({
    onResult: processVoiceCommand,
    onError: (error) => console.error('Voice search error:', error),
  });
};
