
import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceService } from '@/services/performanceService';
import { ErrorHandler } from '@/utils/errorHandling';

interface AutoSaveOptions<T> {
  saveFunction: (data: T) => Promise<boolean>;
  interval: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useAutoSave<T>(
  data: T,
  options: AutoSaveOptions<T>
) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);

  const debouncedSave = useCallback(
    performanceService.debounce(async (dataToSave: T) => {
      setSaveStatus('saving');
      setError(null);
      
      try {
        const success = await options.saveFunction(dataToSave);
        
        if (success) {
          setSaveStatus('saved');
          setLastSaved(new Date());
          options.onSaveSuccess?.();
        } else {
          throw new Error('Save operation failed');
        }
      } catch (saveError) {
        const errorMessage = saveError instanceof Error ? saveError.message : 'Save failed';
        setSaveStatus('error');
        setError(errorMessage);
        options.onSaveError?.(saveError instanceof Error ? saveError : new Error(errorMessage));
        
        ErrorHandler.handleError(
          saveError instanceof Error ? saveError : new Error(errorMessage),
          { operation: 'Auto Save' },
          false
        );
      }
    }, options.interval),
    [options.saveFunction, options.interval, options.onSaveSuccess, options.onSaveError]
  );

  useEffect(() => {
    // Only save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
      lastDataRef.current = data;
      debouncedSave(data);
    }
  }, [data, debouncedSave]);

  const forceSave = useCallback(async () => {
    return debouncedSave(data);
  }, [data, debouncedSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    lastSaved,
    error,
    forceSave
  };
}
