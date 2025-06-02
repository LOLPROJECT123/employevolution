
import React, { Component, ReactNode } from 'react';
import { EnhancedErrorDisplay } from '@/components/ui/enhanced-error-display';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleResetError = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <EnhancedErrorDisplay
          error={this.state.error}
          onRetry={this.handleRetry}
          contextHelp="An unexpected error occurred. You can try again or return to the dashboard."
          suggestions={[
            "Try refreshing the page",
            "Check your internet connection",
            "Clear your browser cache"
          ]}
        />
      );
    }

    return this.props.children;
  }
}

export default EnhancedErrorBoundary;
