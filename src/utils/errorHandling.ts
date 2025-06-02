
interface ErrorContext {
  operation?: string;
  userId?: string;
  component?: string;
  timestamp?: string;
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

    // In production, you might want to send this to a logging service
    // this.sendToLoggingService(errorInfo);

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
    error: Error,
    retryOperation: () => Promise<boolean>,
    maxRetries: number = 3
  ): Promise<boolean> {
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        return await retryOperation();
      } catch (retryError) {
        attempts++;
        console.warn(`Profile save attempt ${attempts} failed:`, retryError);
        
        if (attempts >= maxRetries) {
          this.handleError(
            retryError instanceof Error ? retryError : new Error(String(retryError)),
            { operation: 'Profile Save', attempts },
            false
          );
          return false;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
    
    return false;
  }
}
