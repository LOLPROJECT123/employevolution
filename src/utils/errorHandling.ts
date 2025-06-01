
import { toast } from 'sonner';

export interface ErrorContext {
  operation: string;
  userId?: string;
  component?: string;
  additionalInfo?: Record<string, any>;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier: number;
  shouldRetry?: (error: Error) => boolean;
}

export class ErrorHandler {
  private static logError(error: Error, context: ErrorContext) {
    console.error(`[${context.operation}] Error in ${context.component || 'Unknown'}:`, {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
  }

  static handleError(error: Error, context: ErrorContext, showToast = true): void {
    this.logError(error, context);
    
    if (showToast) {
      toast.error(`${context.operation} failed: ${error.message}`);
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: ErrorContext
  ): Promise<T> {
    const { maxAttempts, delay, backoffMultiplier, shouldRetry } = config;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxAttempts || (shouldRetry && !shouldRetry(lastError))) {
          this.handleError(lastError, { ...context, additionalInfo: { attempts: attempt } });
          throw lastError;
        }
        
        const currentDelay = delay * Math.pow(backoffMultiplier, attempt - 1);
        console.warn(`[${context.operation}] Attempt ${attempt} failed, retrying in ${currentDelay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }
    
    throw lastError!;
  }

  static async withFallback<T>(
    primaryOperation: () => Promise<T>,
    fallbackOperation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    try {
      return await primaryOperation();
    } catch (primaryError) {
      console.warn(`[${context.operation}] Primary operation failed, trying fallback:`, primaryError);
      
      try {
        return await fallbackOperation();
      } catch (fallbackError) {
        this.handleError(
          fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)), 
          { ...context, operation: `${context.operation} (fallback)` }
        );
        throw fallbackError;
      }
    }
  }

  static createRetryableFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    config: RetryConfig,
    context: Omit<ErrorContext, 'additionalInfo'>
  ) {
    return async (...args: T): Promise<R> => {
      return this.withRetry(
        () => fn(...args),
        config,
        { ...context, additionalInfo: { args } }
      );
    };
  }
}

// Specific error handling for common operations
export class ProfileErrorHandler extends ErrorHandler {
  static async handleResumeParsingError(error: Error, fallbackData?: any) {
    const context: ErrorContext = {
      operation: 'Resume Parsing',
      component: 'ResumeParser'
    };

    if (fallbackData) {
      return this.withFallback(
        async () => { throw error; },
        async () => fallbackData,
        context
      );
    }

    this.handleError(error, context);
    throw error;
  }

  static async handleProfileSaveError(error: Error, retryFn: () => Promise<boolean>) {
    const retryConfig: RetryConfig = {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      shouldRetry: (err) => !err.message.includes('authentication')
    };

    const context: ErrorContext = {
      operation: 'Profile Save',
      component: 'ProfileService'
    };

    return this.withRetry(retryFn, retryConfig, context);
  }

  static handleValidationError(errors: string[], component: string) {
    const context: ErrorContext = {
      operation: 'Validation',
      component,
      additionalInfo: { validationErrors: errors }
    };

    const error = new Error(`Validation failed: ${errors.join(', ')}`);
    this.handleError(error, context, false); // Don't show toast for validation errors
    
    return {
      isValid: false,
      errors
    };
  }
}
