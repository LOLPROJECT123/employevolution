
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface EnhancedErrorDisplayProps {
  error: Error;
  retry?: () => void;
  resetErrorBoundary?: () => void;
  showDetails?: boolean;
}

export const EnhancedErrorDisplay: React.FC<EnhancedErrorDisplayProps> = ({
  error,
  retry,
  resetErrorBoundary,
  showDetails = false
}) => {
  const [showFullError, setShowFullError] = React.useState(false);

  const handleReportBug = () => {
    // In a real app, this would send error details to your error tracking service
    console.error('Error reported:', error);
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred. Please try again.'}
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {retry && (
            <Button onClick={retry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {resetErrorBoundary && (
            <Button variant="outline" onClick={resetErrorBoundary} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          )}

          <Button 
            variant="ghost" 
            onClick={handleReportBug}
            className="w-full"
          >
            <Bug className="h-4 w-4 mr-2" />
            Report Bug
          </Button>
        </div>

        {showDetails && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullError(!showFullError)}
              className="text-xs"
            >
              {showFullError ? 'Hide' : 'Show'} Error Details
            </Button>
            
            {showFullError && (
              <div className="bg-muted p-3 rounded text-xs font-mono overflow-auto max-h-40">
                <div className="mb-2 font-semibold">Error Stack:</div>
                <pre className="whitespace-pre-wrap">{error.stack}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedErrorDisplay;
