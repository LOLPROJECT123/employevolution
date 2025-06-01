
import DOMPurify from 'dompurify';
import { z } from 'zod';

interface ValidationResult {
  success: boolean;
  data?: any;
  errors?: string[];
}

class ValidationService {
  validateFormData<T>(data: any, schema: z.ZodSchema<T>): ValidationResult {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return {
          success: false,
          errors: result.error.errors.map(err => err.message)
        };
      }
    } catch (error) {
      return {
        success: false,
        errors: ['Validation failed']
      };
    }
  }

  sanitizeText(input: string): string {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  }

  preventXSS(input: string): string {
    return DOMPurify.sanitize(input);
  }

  validateFile(file: File, maxSizeMB: number = 10, allowedTypes: string[] = []): string | null {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }

    return null;
  }
}

export const validationService = new ValidationService();
