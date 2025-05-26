interface ErrorContext {
  route?: string;
  timestamp?: string;
  jobId?: string;
  query?: string;
  searchParams?: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'ui' | 'api' | 'auth' | 'data' | 'network' | 'performance';
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

class ErrorMonitoringService {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 100;
  private flushInterval = 30000; // 30 seconds

  constructor() {
    this.setupGlobalErrorHandlers();
    this.startErrorFlushTimer();
  }

  private setupGlobalErrorHandlers(): void {
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.captureError({
        message: typeof message === 'string' ? message : 'Unknown error',
        stack: error?.stack,
        context: {
          route: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        severity: 'high',
        category: 'other'
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          route: window.location.pathname,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        },
        severity: 'high',
        category: 'other'
      });
    };
  }

  captureError(errorReport: ErrorReport): void {
    console.error('Error captured:', errorReport);
    
    this.errorQueue.push(errorReport);
    
    if (this.errorQueue.length >= this.maxQueueSize) {
      this.flushErrors();
    }

    // For critical errors, flush immediately
    if (errorReport.severity === 'critical') {
      this.flushErrors();
    }
  }

  captureAuthError(error: any, context?: Partial<ErrorContext>): void {
    this.captureError({
      message: error.message || 'Authentication error',
      stack: error.stack,
      context: {
        ...context,
        route: window.location.pathname,
        timestamp: new Date().toISOString()
      },
      severity: 'medium',
      category: 'auth'
    });
  }

  captureAPIError(error: any, endpoint: string, context?: Partial<ErrorContext>): void {
    this.captureError({
      message: `API Error at ${endpoint}: ${error.message || 'Unknown API error'}`,
      stack: error.stack,
      context: {
        ...context,
        route: window.location.pathname,
        timestamp: new Date().toISOString()
      },
      severity: 'medium',
      category: 'api'
    });
  }

  capturePerformanceIssue(metric: string, value: number, threshold: number): void {
    if (value > threshold) {
      this.captureError({
        message: `Performance issue: ${metric} exceeded threshold (${value}ms > ${threshold}ms)`,
        context: {
          route: window.location.pathname,
          timestamp: new Date().toISOString()
        },
        severity: value > threshold * 2 ? 'high' : 'medium',
        category: 'performance'
      });
    }
  }

  private async flushErrors(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      // In a real implementation, you would send these to your monitoring service
      console.log('Flushing errors to monitoring service:', errors);
      
      // For now, we'll just store them locally for debugging
      const existingErrors = localStorage.getItem('errorReports');
      const allErrors = existingErrors ? JSON.parse(existingErrors) : [];
      allErrors.push(...errors);
      
      // Keep only the last 1000 errors
      if (allErrors.length > 1000) {
        allErrors.splice(0, allErrors.length - 1000);
      }
      
      localStorage.setItem('errorReports', JSON.stringify(allErrors));
    } catch (error) {
      console.error('Failed to flush errors:', error);
      // Re-add errors to queue for retry
      this.errorQueue.unshift(...errors);
    }
  }

  private startErrorFlushTimer(): void {
    setInterval(() => {
      this.flushErrors();
    }, this.flushInterval);
  }

  getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('errorReports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  clearStoredErrors(): void {
    localStorage.removeItem('errorReports');
  }
}

export const errorMonitoringService = new ErrorMonitoringService();
