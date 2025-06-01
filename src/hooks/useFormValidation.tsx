
import { useState, useCallback, useRef } from 'react';
import { AddressValidator } from '@/utils/addressValidation';
import { ErrorHandler } from '@/utils/errorHandling';

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => { isValid: boolean; message?: string };
}

export interface FieldConfig {
  [fieldName: string]: ValidationRule;
}

export interface FormValidationState {
  [fieldName: string]: FieldValidation;
}

export interface FormValidationHook {
  validationState: FormValidationState;
  validateField: (fieldName: string, value: any) => FieldValidation;
  validateAllFields: (data: any) => boolean;
  clearValidation: (fieldName?: string) => void;
  isFormValid: boolean;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | undefined;
  getFieldWarning: (fieldName: string) => string | undefined;
}

export const useFormValidation = (config: FieldConfig): FormValidationHook => {
  const [validationState, setValidationState] = useState<FormValidationState>({});
  const validationCache = useRef<Map<string, FieldValidation>>(new Map());

  const validateField = useCallback((fieldName: string, value: any): FieldValidation => {
    const rule = config[fieldName];
    if (!rule) {
      return { isValid: true };
    }

    // Check cache first
    const cacheKey = `${fieldName}_${JSON.stringify(value)}`;
    if (validationCache.current.has(cacheKey)) {
      return validationCache.current.get(cacheKey)!;
    }

    let result: FieldValidation = { isValid: true };

    try {
      // Required validation
      if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
        result = { isValid: false, error: `${fieldName} is required` };
      }
      
      // Skip other validations if value is empty and not required
      else if (!value || (typeof value === 'string' && !value.trim())) {
        result = { isValid: true };
      }
      
      // Length validations
      else if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          result = { isValid: false, error: `${fieldName} must be at least ${rule.minLength} characters` };
        } else if (rule.maxLength && value.length > rule.maxLength) {
          result = { isValid: false, error: `${fieldName} must be no more than ${rule.maxLength} characters` };
        }
        
        // Pattern validation
        else if (rule.pattern && !rule.pattern.test(value)) {
          result = { isValid: false, error: `${fieldName} format is invalid` };
        }
      }
      
      // Custom validation
      if (result.isValid && rule.custom) {
        const customResult = rule.custom(value);
        if (!customResult.isValid) {
          result = { isValid: false, error: customResult.message || `${fieldName} is invalid` };
        }
      }

      // Special address field validations
      if (result.isValid) {
        switch (fieldName.toLowerCase()) {
          case 'zipcode':
          case 'zip':
          case 'postalcode':
            const zipResult = AddressValidator.validateZipCode(value);
            if (!zipResult.isValid) {
              result = { isValid: false, error: zipResult.error };
            }
            break;

          case 'state':
            const stateResult = AddressValidator.validateState(value);
            if (!stateResult.isValid) {
              result = { isValid: false, error: stateResult.error };
            } else if (stateResult.standardized && stateResult.standardized !== value) {
              result = { isValid: true, warning: `Will be standardized to: ${stateResult.standardized}` };
            }
            break;

          case 'email':
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
              result = { isValid: false, error: 'Invalid email format' };
            }
            break;

          case 'phone':
            const phonePattern = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phonePattern.test(value.replace(/[\s\-\(\)]/g, ''))) {
              result = { isValid: false, error: 'Invalid phone number format' };
            }
            break;
        }
      }

    } catch (error) {
      ErrorHandler.handleError(
        error instanceof Error ? error : new Error(String(error)),
        { operation: 'Field Validation', component: 'useFormValidation' },
        false
      );
      result = { isValid: false, error: 'Validation error occurred' };
    }

    // Cache the result
    validationCache.current.set(cacheKey, result);

    // Update state
    setValidationState(prev => ({
      ...prev,
      [fieldName]: result
    }));

    return result;
  }, [config]);

  const validateAllFields = useCallback((data: any): boolean => {
    const newValidationState: FormValidationState = {};
    let allValid = true;

    Object.keys(config).forEach(fieldName => {
      const fieldValue = getNestedValue(data, fieldName);
      const validation = validateField(fieldName, fieldValue);
      newValidationState[fieldName] = validation;
      
      if (!validation.isValid) {
        allValid = false;
      }
    });

    setValidationState(newValidationState);
    return allValid;
  }, [config, validateField]);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationState(prev => {
        const newState = { ...prev };
        delete newState[fieldName];
        return newState;
      });
      
      // Clear from cache
      validationCache.current.forEach((_, key) => {
        if (key.startsWith(`${fieldName}_`)) {
          validationCache.current.delete(key);
        }
      });
    } else {
      setValidationState({});
      validationCache.current.clear();
    }
  }, []);

  const isFormValid = Object.values(validationState).every(validation => validation.isValid);
  const hasErrors = Object.values(validationState).some(validation => !validation.isValid);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return validationState[fieldName]?.error;
  }, [validationState]);

  const getFieldWarning = useCallback((fieldName: string): string | undefined => {
    return validationState[fieldName]?.warning;
  }, [validationState]);

  return {
    validationState,
    validateField,
    validateAllFields,
    clearValidation,
    isFormValid,
    hasErrors,
    getFieldError,
    getFieldWarning
  };
};

// Helper function to get nested values from objects
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

// Pre-configured validation rules for common fields
export const commonValidationRules: FieldConfig = {
  'personalInfo.name': {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  'personalInfo.email': {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  'personalInfo.phone': {
    required: true,
    minLength: 10
  },
  'personalInfo.streetAddress': {
    required: true,
    minLength: 5,
    maxLength: 200
  },
  'personalInfo.city': {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  'personalInfo.state': {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  'personalInfo.county': {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  'personalInfo.zipCode': {
    required: true,
    pattern: /^\d{5}(-\d{4})?$/
  }
};
