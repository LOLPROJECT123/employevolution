
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute check - loading:', loading, 'user:', user?.id);

  // Show loading while auth state is being determined
  if (loading) {
    console.log('🛡️ ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!user) {
    console.log('🛡️ ProtectedRoute: No user found, redirecting to /');
    return <Navigate to="/" replace />;
  }

  // If authenticated, render the protected content
  console.log('🛡️ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
};

export default ProtectedRoute;
