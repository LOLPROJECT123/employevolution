
import { useState, useCallback } from 'react';
import { validationService } from '@/services/validationService';
import { securityService } from '@/services/securityService';
import { z } from 'zod';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

interface ValidationOptions {
  sanitize?: boolean;
  checkRateLimit?: boolean;
  endpoint?: string;
  identifier?: string;
}

export const useSecurityValidation = () => {
  const [isValidating, setIsValidating] = useState(false);

  const validateForm = useCallback(async <T>(
    data: any,
    schema: z.ZodSchema<T>,
    options: ValidationOptions = {}
  ): Promise<ValidationResult> => {
    setIsValidating(true);
    
    try {
      // Rate limiting check
      if (options.checkRateLimit && options.endpoint && options.identifier) {
        const allowed = await securityService.checkRateLimit(
          options.identifier,
          options.endpoint,
          100 // 100 requests per hour
        );
        
        if (!allowed) {
          return {
            isValid: false,
            errors: ['Too many requests. Please try again later.']
          };
        }
      }

      // Validate and sanitize
      const result = validationService.validateFormData(data, schema);
      
      if (!result.success) {
        return {
          isValid: false,
          errors: result.errors || ['Validation failed']
        };
      }

      return {
        isValid: true,
        errors: [],
        sanitizedData: result.data
      };
    } catch (error) {
      console.error('Security validation failed:', error);
      return {
        isValid: false,
        errors: ['Security validation failed']
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const sanitizeInput = useCallback((input: string): string => {
    return validationService.sanitizeText(input);
  }, []);

  const validateFile = useCallback((
    file: File,
    maxSizeMB = 10,
    allowedTypes: string[] = []
  ): string | null => {
    return validationService.validateFile(file, maxSizeMB, allowedTypes);
  }, []);

  const preventXSS = useCallback((input: string): string => {
    return validationService.preventXSS(input);
  }, []);

  return {
    validateForm,
    sanitizeInput,
    validateFile,
    preventXSS,
    isValidating
  };
};
