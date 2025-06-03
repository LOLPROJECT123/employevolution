
import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceService } from '@/services/performanceService';
import { ErrorHandler } from '@/utils/errorHandling';

interface AutoSaveOptions<T> {
  saveFunction: (data: T) => Promise<boolean>;
  interval: number;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  localStorageKey?: string; // New option for localStorage backup
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

  // Save to localStorage as backup
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    if (options.localStorageKey) {
      try {
        localStorage.setItem(options.localStorageKey, JSON.stringify(dataToSave));
        console.log('📱 Data backed up to localStorage');
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
      }
    }
  }, [options.localStorageKey]);

  // Load from localStorage on mount
  useEffect(() => {
    if (options.localStorageKey) {
      try {
        const savedData = localStorage.getItem(options.localStorageKey);
        if (savedData) {
          console.log('📱 Found existing data in localStorage');
          // We could emit this data back to the parent component if needed
        }
      } catch (error) {
        console.warn('Failed to load from localStorage:', error);
      }
    }
  }, [options.localStorageKey]);

  const debouncedSave = useCallback(
    performanceService.debounce(async (dataToSave: T) => {
      setSaveStatus('saving');
      setError(null);
      
      // Always save to localStorage first (instant backup)
      saveToLocalStorage(dataToSave);
      
      try {
        const success = await options.saveFunction(dataToSave);
        
        if (success) {
          setSaveStatus('saved');
          setLastSaved(new Date());
          options.onSaveSuccess?.();
          console.log('✅ Auto-save successful');
        } else {
          throw new Error('Save operation failed');
        }
      } catch (saveError) {
        const errorMessage = saveError instanceof Error ? saveError.message : 'Save failed';
        setSaveStatus('error');
        setError(errorMessage);
        options.onSaveError?.(saveError instanceof Error ? saveError : new Error(errorMessage));
        
        console.warn('❌ Auto-save failed, but data is backed up locally');
        
        ErrorHandler.handleError(
          saveError instanceof Error ? saveError : new Error(errorMessage),
          { operation: 'Auto Save' },
          false
        );
      }
    }, options.interval),
    [options.saveFunction, options.interval, options.onSaveSuccess, options.onSaveError, saveToLocalStorage]
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

  // Clear localStorage backup when component unmounts
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
