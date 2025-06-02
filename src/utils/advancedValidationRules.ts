
import { ValidationRule } from '@/hooks/useFormValidation';

export interface AdvancedValidationConfig {
  [fieldType: string]: ValidationRule[];
}

export class AdvancedValidationRules {
  // Email validation with multiple checks
  static emailValidation: ValidationRule[] = [
    {
      required: true,
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      custom: (email: string) => {
        if (!email) return { isValid: true };
        
        // Check for common typos
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        
        if (domain && !commonDomains.includes(domain)) {
          // Suggest common domain if close match
          const suggestions = commonDomains.filter(d => 
            d.includes(domain.substring(0, 3)) || domain.includes(d.substring(0, 3))
          );
          
          if (suggestions.length > 0) {
            return { 
              isValid: true, 
              message: `Did you mean @${suggestions[0]}?` 
            };
          }
        }
        
        return { isValid: true };
      }
    }
  ];

  // Phone validation with formatting
  static phoneValidation: ValidationRule[] = [
    {
      required: true,
      custom: (phone: string) => {
        if (!phone) return { isValid: false, message: 'Phone number is required' };
        
        const cleaned = phone.replace(/\D/g, '');
        
        if (cleaned.length < 10) {
          return { isValid: false, message: 'Phone number must be at least 10 digits' };
        }
        
        if (cleaned.length > 15) {
          return { isValid: false, message: 'Phone number is too long' };
        }
        
        // US phone number validation
        if (cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1')) {
          return { isValid: true };
        }
        
        return { isValid: true }; // Accept international numbers
      }
    }
  ];

  // LinkedIn URL validation
  static linkedinValidation: ValidationRule[] = [
    {
      custom: (url: string) => {
        if (!url) return { isValid: true };
        
        const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
        
        if (!linkedinPattern.test(url)) {
          return { 
            isValid: false, 
            message: 'LinkedIn URL should be in format: https://linkedin.com/in/username' 
          };
        }
        
        return { isValid: true };
      }
    }
  ];

  // GitHub URL validation
  static githubValidation: ValidationRule[] = [
    {
      custom: (url: string) => {
        if (!url) return { isValid: true };
        
        const githubPattern = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/;
        
        if (!githubPattern.test(url)) {
          return { 
            isValid: false, 
            message: 'GitHub URL should be in format: https://github.com/username' 
          };
        }
        
        return { isValid: true };
      }
    }
  ];

  // Portfolio URL validation
  static portfolioValidation: ValidationRule[] = [
    {
      custom: (url: string) => {
        if (!url) return { isValid: true };
        
        try {
          const urlObj = new URL(url);
          
          if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return { 
              isValid: false, 
              message: 'URL must start with http:// or https://' 
            };
          }
          
          return { isValid: true };
        } catch {
          return { 
            isValid: false, 
            message: 'Please enter a valid URL' 
          };
        }
      }
    }
  ];

  // Skill validation with suggestions
  static skillValidation: ValidationRule[] = [
    {
      custom: (skill: string) => {
        if (!skill || skill.length < 2) {
          return { isValid: false, message: 'Skill must be at least 2 characters' };
        }
        
        if (skill.length > 50) {
          return { isValid: false, message: 'Skill name is too long' };
        }
        
        // Check for common skill variations
        const skillVariations: { [key: string]: string } = {
          'js': 'JavaScript',
          'ts': 'TypeScript',
          'react.js': 'React',
          'node.js': 'Node.js',
          'python3': 'Python',
          'c++': 'C++',
          'c#': 'C#'
        };
        
        const lowerSkill = skill.toLowerCase();
        if (skillVariations[lowerSkill]) {
          return { 
            isValid: true, 
            message: `Consider using "${skillVariations[lowerSkill]}" instead` 
          };
        }
        
        return { isValid: true };
      }
    }
  ];

  // Date validation for work experience and education
  static dateValidation: ValidationRule[] = [
    {
      custom: (date: string) => {
        if (!date) return { isValid: true };
        
        const dateObj = new Date(date);
        const now = new Date();
        const minDate = new Date('1950-01-01');
        
        if (isNaN(dateObj.getTime())) {
          return { isValid: false, message: 'Invalid date format' };
        }
        
        if (dateObj < minDate) {
          return { isValid: false, message: 'Date cannot be before 1950' };
        }
        
        if (dateObj > now) {
          return { isValid: false, message: 'Date cannot be in the future' };
        }
        
        return { isValid: true };
      }
    }
  ];

  // Get validation rules for specific field types
  static getValidationRules(fieldType: string): ValidationRule[] {
    const rules: { [key: string]: ValidationRule[] } = {
      email: this.emailValidation,
      phone: this.phoneValidation,
      linkedin: this.linkedinValidation,
      github: this.githubValidation,
      portfolio: this.portfolioValidation,
      skill: this.skillValidation,
      date: this.dateValidation
    };
    
    return rules[fieldType] || [];
  }
}
