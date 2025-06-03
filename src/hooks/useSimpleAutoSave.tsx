
import { useState, useEffect, useCallback, useRef } from 'react';
import { profileService } from '@/services/profileService';
import { ProfileDataSync } from '@/utils/profileDataSync';

interface SimpleAutoSaveOptions<T> {
  saveFunction: (data: T) => Promise<boolean>;
  interval: number;
  localStorageKey?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

export function useSimpleAutoSave<T>(
  data: T,
  options: SimpleAutoSaveOptions<T>
) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef<T>(data);

  // Simple localStorage backup
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

  // Simplified save function
  const performSave = useCallback(async (dataToSave: T) => {
    console.log('🔄 Starting simple auto-save...');
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
        console.log('✅ Simple auto-save successful');
        
        // Auto-hide saved status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error('Save operation returned false');
      }
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : 'Save failed';
      setSaveStatus('error');
      setError(errorMessage);
      options.onSaveError?.(saveError instanceof Error ? saveError : new Error(errorMessage));
      
      console.warn('❌ Simple auto-save failed:', errorMessage);
      
      // Auto-hide error status after 5 seconds
      setTimeout(() => setSaveStatus('idle'), 5000);
    }
  }, [options.saveFunction, options.onSaveSuccess, options.onSaveError, saveToLocalStorage]);

  // Debounced save effect
  useEffect(() => {
    // Only save if data has actually changed
    if (JSON.stringify(data) !== JSON.stringify(lastDataRef.current)) {
      lastDataRef.current = data;
      
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        performSave(data);
      }, options.interval);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, options.interval, performSave]);

  const forceSave = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return performSave(data);
  }, [data, performSave]);

  return {
    saveStatus,
    lastSaved,
    error,
    forceSave
  };
}
