
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVoiceJobSearch } from '@/hooks/useVoiceJobSearch';
import { Mic, MicOff } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceSearchButtonProps {
  onSearch: (query: string) => void;
  className?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ 
  onSearch, 
  className = '' 
}) => {
  const [lastTranscript, setLastTranscript] = useState('');

  const {
    isSupported,
    isListening,
    transcript,
    toggleListening
  } = useVoiceJobSearch((query) => {
    setLastTranscript(query);
    onSearch(query);
    toast.success(`Voice search: "${query}"`);
  });

  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={toggleListening}
        className={className}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {isListening && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="secondary" className="animate-pulse">
            {transcript || "Listening..."}
          </Badge>
        </div>
      )}
      
      {lastTranscript && !isListening && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10">
          <Badge variant="outline" className="text-xs">
            Last: {lastTranscript.substring(0, 20)}...
          </Badge>
        </div>
      )}
    </div>
  );
};

export default VoiceSearchButton;
