
import { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorHandler } from '@/utils/errorHandling';
import { toast } from 'sonner';

export interface AutoSaveConfig {
  key: string;
  saveInterval?: number;
  enabled?: boolean;
  onSave?: (data: any) => Promise<boolean>;
  onError?: (error: Error) => void;
}

export interface AutoSaveStatus {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
}

export const useAutoSave = <T extends Record<string, any>>(
  data: T,
  config: AutoSaveConfig
) => {
  const [status, setStatus] = useState<AutoSaveStatus>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const {
    key,
    saveInterval = 30000, // 30 seconds default
    enabled = true,
    onSave,
    onError
  } = config;

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      if (saved) {
        const parsedData = JSON.parse(saved);
        lastSavedDataRef.current = JSON.stringify(parsedData);
      }
    } catch (error) {
      console.warn('Failed to load auto-saved data:', error);
    }
  }, [key]);

  // Save to localStorage
  const saveToStorage = useCallback((dataToSave: T) => {
    try {
      localStorage.setItem(`autosave_${key}`, JSON.stringify(dataToSave));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  }, [key]);

  // Main save function
  const performSave = useCallback(async (dataToSave: T, isManual = false) => {
    if (!enabled) return;

    setStatus(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      // Always save to localStorage first
      saveToStorage(dataToSave);

      // Call custom save function if provided
      if (onSave) {
        const success = await onSave(dataToSave);
        if (!success) {
          throw new Error('Save operation failed');
        }
      }

      lastSavedDataRef.current = JSON.stringify(dataToSave);
      
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null
      }));

      if (isManual) {
        toast.success('Changes saved successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      
      setStatus(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }));

      if (onError) {
        onError(error instanceof Error ? error : new Error(errorMessage));
      } else {
        ErrorHandler.handleError(
          error instanceof Error ? error : new Error(errorMessage),
          { operation: 'Auto Save', component: 'useAutoSave' },
          isManual
        );
      }
    }
  }, [enabled, key, onSave, onError, saveToStorage]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return performSave(data, true);
  }, [data, performSave]);

  // Load saved data
  const loadSavedData = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(`autosave_${key}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to load saved data:', error);
      return null;
    }
  }, [key]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(`autosave_${key}`);
      lastSavedDataRef.current = '';
      setStatus(prev => ({
        ...prev,
        lastSaved: null,
        hasUnsavedChanges: false
      }));
    } catch (error) {
      console.error('Failed to clear saved data:', error);
    }
  }, [key]);

  // Check for changes and schedule auto-save
  useEffect(() => {
    if (!enabled) return;

    const currentDataString = JSON.stringify(data);
    const hasChanges = currentDataString !== lastSavedDataRef.current;

    setStatus(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));

    if (hasChanges) {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule auto-save
      timeoutRef.current = setTimeout(() => {
        performSave(data);
      }, saveInterval);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, saveInterval, performSave]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (status.hasUnsavedChanges) {
        event.preventDefault();
        saveToStorage(data);
        return (event.returnValue = 'You have unsaved changes. Are you sure you want to leave?');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [data, status.hasUnsavedChanges, saveToStorage]);

  return {
    status,
    saveNow,
    loadSavedData,
    clearSavedData,
    // Helper to check if there are changes since last save
    hasChanges: status.hasUnsavedChanges
  };
};
