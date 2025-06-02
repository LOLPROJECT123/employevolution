
import React, { ReactNode } from 'react';
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator';
import { useAutoSave } from '@/hooks/useAutoSave';

interface AutoSaveFormWrapperProps {
  children: ReactNode;
  data: any;
  saveFunction: (data: any) => Promise<boolean>;
  className?: string;
}

export const AutoSaveFormWrapper: React.FC<AutoSaveFormWrapperProps> = ({
  children,
  data,
  saveFunction,
  className = ""
}) => {
  const { saveStatus, lastSaved, error } = useAutoSave(data, {
    saveFunction,
    interval: 3000,
    onSaveSuccess: () => {
      console.log('Form auto-saved successfully');
    },
    onSaveError: (error) => {
      console.error('Auto-save failed:', error);
    }
  });

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <AutoSaveIndicator 
          isAutoSaving={saveStatus === 'saving'}
          lastSaved={lastSaved || undefined}
          hasUnsavedChanges={saveStatus === 'pending'}
        />
      </div>
    </div>
  );
};

export default AutoSaveFormWrapper;
