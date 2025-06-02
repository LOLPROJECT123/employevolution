
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react';

export interface EnhancedErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  contextHelp?: string;
  suggestions?: string[];
}

export const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  onRetry,
  contextHelp,
  suggestions = []
}) => {
  return (
    <Alert variant="destructive" className="animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="text-sm">{error.message}</p>
        
        {contextHelp && (
          <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <HelpCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-800">{contextHelp}</p>
          </div>
        )}
        
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Try these solutions:</p>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
