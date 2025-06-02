
import { useState, useCallback, useMemo } from 'react';
import { performanceService } from '@/services/performanceService';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
  severity?: 'error' | 'warning' | 'info';
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function useEnhancedValidation<T>(
  rules: ValidationRule<T>[],
  debounceMs: number = 300
) {
  const [validationCache, setValidationCache] = useState<Map<string, ValidationResult>>(new Map());
  const [isValidating, setIsValidating] = useState(false);

  const debouncedValidate = useMemo(
    () => performanceService.debounce(async (value: T): Promise<ValidationResult> => {
      setIsValidating(true);
      const timer = performanceService.startTimer('validation');
      
      try {
        const cacheKey = JSON.stringify(value);
        const cached = validationCache.get(cacheKey);
        
        if (cached) {
          return cached;
        }

        const errors: string[] = [];
        const warnings: string[] = [];
        const suggestions: string[] = [];

        for (const rule of rules) {
          const isValid = rule.validate(value);
          if (!isValid) {
            const severity = rule.severity || 'error';
            
            switch (severity) {
              case 'error':
                errors.push(rule.message);
                break;
              case 'warning':
                warnings.push(rule.message);
                break;
              case 'info':
                suggestions.push(rule.message);
                break;
            }
          }
        }

        const result: ValidationResult = {
          isValid: errors.length === 0,
          errors,
          warnings,
          suggestions
        };

        // Cache the result
        setValidationCache(prev => new Map(prev.set(cacheKey, result)));
        
        return result;
      } finally {
        timer();
        setIsValidating(false);
      }
    }, debounceMs),
    [rules, debounceMs, validationCache]
  );

  const clearCache = useCallback(() => {
    setValidationCache(new Map());
  }, []);

  return {
    validate: debouncedValidate,
    isValidating,
    clearCache
  };
}
