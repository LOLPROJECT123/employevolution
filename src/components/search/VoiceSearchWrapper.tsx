
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff } from 'lucide-react';
import { useVoiceJobSearch } from '@/hooks/useVoiceSearch';

interface VoiceSearchWrapperProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const VoiceSearchWrapper: React.FC<VoiceSearchWrapperProps> = ({
  onSearch,
  placeholder = "Search...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const { isSupported, isListening, transcript, toggleListening } = useVoiceJobSearch(
    (transcript: string) => {
      setSearchQuery(transcript);
      onSearch(transcript);
    }
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={isListening ? transcript : searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pr-12"
        />
        {isSupported && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleListening}
            className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
              isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VoiceSearchWrapper;
