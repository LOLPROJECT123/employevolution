
import { z } from 'zod';
import DOMPurify from 'dompurify';

class ValidationService {
  private static instance: ValidationService;

  private constructor() {}

  static getInstance(): ValidationService {
    if (!ValidationService.instance) {
      ValidationService.instance = new ValidationService();
    }
    return ValidationService.instance;
  }

  // Common validation schemas
  emailSchema = z.string().email('Invalid email format').min(1, 'Email is required');
  
  passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');

  nameSchema = z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

  phoneSchema = z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format');

  urlSchema = z.string().url('Invalid URL format');

  // Content validation schemas
  jobTitleSchema = z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters');

  companyNameSchema = z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters');

  // File validation
  validateFile(file: File, maxSizeMB = 10, allowedTypes: string[] = []): string | null {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type if specified
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return `File type must be one of: ${allowedTypes.join(', ')}`;
    }

    // Check for suspicious file names
    const suspiciousPatterns = [/\.exe$/i, /\.bat$/i, /\.cmd$/i, /\.scr$/i, /\.pif$/i];
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      return 'This file type is not allowed for security reasons';
    }

    return null; // File is valid
  }

  // HTML sanitization
  sanitizeHtml(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
  }

  // General text sanitization
  sanitizeText(input: string): string {
    if (!input) return input;
    
    // Remove any HTML tags
    const stripped = input.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    const sanitized = stripped.replace(/[<>'"&]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#x27;';
        case '&': return '&amp;';
        default: return char;
      }
    });

    return sanitized.trim();
  }

  // SQL injection prevention
  sanitizeForDatabase(input: string): string {
    if (!input) return input;
    
    // Remove common SQL injection patterns
    const sqlPatterns = [
      /('|(\\');|(;)|(\/\*)|(\*\/)|(\-\-)|(\bor\b)|(\bunion\b)|(\bselect\b)|(\binsert\b)|(\bdelete\b)|(\bdrop\b)|(\bcreate\b)|(\balter\b)|(\bexec\b)|(\bexecute\b)/gi
    ];

    let sanitized = input;
    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    return sanitized.trim();
  }

  // Validate and sanitize form data
  validateFormData<T>(data: any, schema: z.ZodSchema<T>): { success: boolean; data?: T; errors?: string[] } {
    try {
      // First sanitize text fields
      const sanitizedData = this.sanitizeFormData(data);
      
      // Then validate with schema
      const result = schema.parse(sanitizedData);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          success: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      
      return {
        success: false,
        errors: ['Validation failed']
      };
    }
  }

  private sanitizeFormData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeText(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeFormData(item));
    }
    
    if (data && typeof data === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[key] = this.sanitizeFormData(value);
      }
      return sanitized;
    }
    
    return data;
  }

  // XSS prevention
  preventXSS(input: string): string {
    return this.sanitizeHtml(input);
  }

  // CSRF token validation (basic implementation)
  generateCSRFToken(): string {
    return crypto.randomUUID();
  }

  validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken;
  }
}

export const validationService = ValidationService.getInstance();
