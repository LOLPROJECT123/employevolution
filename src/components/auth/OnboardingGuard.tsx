
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

const OnboardingGuard = ({ children }: OnboardingGuardProps) => {
  const { user, loading: authLoading, isLoggingOut } = useAuth();

  // Show loading during auth initialization
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If user is logging out, show a simple loading state
  if (isLoggingOut) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Signing out...</p>
        </div>
      </div>
    );
  }

  // If no user, render children (which should be public routes)
  if (!user) {
    return <>{children}</>;
  }

  // If authenticated, render protected content directly
  return <>{children}</>;
};

export default OnboardingGuard;
