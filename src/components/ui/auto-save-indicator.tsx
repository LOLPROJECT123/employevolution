
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving?: boolean;
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  isAutoSaving = false,
  lastSaved,
  hasUnsavedChanges = false,
  className = ''
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (minutes > 0) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${seconds}s ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastSaved]);

  if (isAutoSaving) {
    return (
      <Badge variant="secondary" className={`flex items-center space-x-1 ${className}`}>
        <Clock className="h-3 w-3 animate-pulse" />
        <span>Saving...</span>
      </Badge>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <Badge variant="outline" className={`flex items-center space-x-1 ${className}`}>
        <AlertCircle className="h-3 w-3 text-yellow-500" />
        <span>Unsaved changes</span>
      </Badge>
    );
  }

  if (lastSaved) {
    return (
      <Badge variant="outline" className={`flex items-center space-x-1 ${className}`}>
        <CheckCircle className="h-3 w-3 text-green-500" />
        <span>Saved {timeAgo}</span>
      </Badge>
    );
  }

  return null;
};

export default AutoSaveIndicator;
