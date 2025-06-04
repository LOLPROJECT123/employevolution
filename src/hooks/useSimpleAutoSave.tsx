
import { useState, useEffect, useCallback, useRef } from 'react';

interface SimpleAutoSaveOptions<T> {
  saveFunction: (data: T) => Promise<{ success: boolean; error?: string }>;
  interval: number;
  localStorageKey?: string;
  onSaveSuccess?: () => void;
  onSaveError?: (error: string) => void;
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

  // Enhanced localStorage backup with error handling
  const saveToLocalStorage = useCallback((dataToSave: T) => {
    if (options.localStorageKey) {
      try {
        localStorage.setItem(options.localStorageKey, JSON.stringify(dataToSave));
        const timestampKey = options.localStorageKey.replace('-draft-', '-timestamp-');
        localStorage.setItem(timestampKey, new Date().toISOString());
        console.log('📱 Data backed up to localStorage with timestamp');
      } catch (error) {
        console.warn('Failed to save to localStorage:', error);
        // Don't throw error here as localStorage failure shouldn't block the app
      }
    }
  }, [options.localStorageKey]);

  // Enhanced save function with better error handling
  const performSave = useCallback(async (dataToSave: T) => {
    console.log('🔄 Starting enhanced auto-save...');
    setSaveStatus('saving');
    setError(null);
    
    // Always save to localStorage first (instant backup)
    saveToLocalStorage(dataToSave);
    
    try {
      const result = await options.saveFunction(dataToSave);
      
      if (result.success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        options.onSaveSuccess?.();
        console.log('✅ Enhanced auto-save successful');
        
        // Auto-hide saved status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        throw new Error(result.error || 'Save operation failed');
      }
    } catch (saveError) {
      const errorMessage = saveError instanceof Error ? saveError.message : 'Save failed';
      setSaveStatus('error');
      setError(errorMessage);
      options.onSaveError?.(errorMessage);
      
      console.warn('❌ Enhanced auto-save failed:', errorMessage);
      
      // Auto-hide error status after 8 seconds (longer than success)
      setTimeout(() => {
        setSaveStatus('idle');
        setError(null);
      }, 8000);
    }
  }, [options.saveFunction, options.onSaveSuccess, options.onSaveError, saveToLocalStorage]);

  // Debounced save effect with data change detection
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
