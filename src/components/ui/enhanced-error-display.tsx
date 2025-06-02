
import React from 'react';
import { AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedErrorDisplayProps {
  error: string;
  suggestions?: string[];
  onRetry?: () => void;
  contextHelp?: string;
  severity?: 'error' | 'warning' | 'info';
}

export const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  suggestions = [],
  onRetry,
  contextHelp,
  severity = 'error'
}) => {
  const getSeverityColor = () => {
    switch (severity) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-red-200 bg-red-50';
    }
  };

  return (
    <Alert className={`animate-fade-in ${getSeverityColor()}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 mt-0.5 text-red-600" />
        <div className="flex-1 space-y-2">
          <AlertDescription className="font-medium text-gray-900">
            {error}
          </AlertDescription>
          
          {suggestions.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Try these solutions:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-blue-500">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2">
            {onRetry && (
              <Button 
                onClick={onRetry} 
                size="sm" 
                variant="outline"
                className="hover-scale"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {contextHelp && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{contextHelp}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};
