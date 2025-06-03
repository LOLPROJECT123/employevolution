
import React, { useState, useEffect } from 'react';
import { Check, Save, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
  error
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (status !== 'idle') {
      setVisible(true);
      if (status === 'saved') {
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [status]);

  if (!visible) return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Save className="h-4 w-4 animate-pulse" />,
          text: 'Saving...',
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      case 'saved':
        return {
          icon: <Check className="h-4 w-4" />,
          text: 'Saved',
          className: 'bg-green-50 text-green-700 border-green-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: error || 'Save failed',
          className: 'bg-red-50 text-red-700 border-red-200'
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 px-3 py-2 rounded-lg border 
      flex items-center space-x-2 shadow-lg animate-fade-in
      ${config.className}
    `}>
      {config.icon}
      <span className="text-sm font-medium">{config.text}</span>
      {lastSaved && status === 'saved' && (
        <span className="text-xs opacity-75">
          {lastSaved.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};
