
interface ErrorContext {
  operation?: string;
  userId?: string;
  component?: string;
  timestamp?: string;
  attempts?: number;
}

export class ErrorHandler {
  static handleError(
    error: Error,
    context: ErrorContext = {},
    shouldThrow: boolean = true
  ): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    console.error('Application Error:', errorInfo);

    if (shouldThrow) {
      throw error;
    }
  }

  static async handleAsyncError<T>(
    asyncOperation: () => Promise<T>,
    context: ErrorContext = {}
  ): Promise<T | null> {
    try {
      return await asyncOperation();
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
        context,
        false
      );
      return null;
    }
  }
}

export class ProfileErrorHandler extends ErrorHandler {
  static async handleProfileSaveError(
    operation: () => Promise<boolean>,
    maxRetries: number = 3
  ): Promise<boolean> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < maxRetries) {
      try {
        console.log(`💾 Profile save attempt ${attempts + 1}/${maxRetries}`);
        const result = await operation();
        if (result) {
          console.log(`✅ Profile save successful on attempt ${attempts + 1}`);
          return true;
        }
        throw new Error('Save operation returned false');
      } catch (error) {
        attempts++;
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Profile save attempt ${attempts} failed:`, lastError.message);
        
        if (attempts >= maxRetries) {
          this.handleError(
            lastError,
            { operation: 'Profile Save', attempts },
            false
          );
          return false;
        }
        
        // Wait before retry with exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    return false;
  }
}
