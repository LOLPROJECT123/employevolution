
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { profileCompletionService } from '@/services/profileCompletionService';

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
}

const ProfileCompletionGuard = ({ children }: ProfileCompletionGuardProps) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Routes that are allowed even if profile is incomplete
  const allowedRoutes = ['/profile', '/auth'];
  
  // Check if current route is allowed
  const isAllowedRoute = allowedRoutes.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    const checkProfileCompletion = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get profile completion data
        const completionData = await profileCompletionService.getProfileCompletion(user.id);
        const completionItems = await profileCompletionService.calculateProfileCompletion(user.id);
        
        // Define completion requirements
        const requiredFields = [
          'basic_info',
          'work_experience', 
          'education',
          'skills'
        ];

        // Check if all required fields are completed
        const isComplete = requiredFields.every(field => 
          completionItems.some(item => item.field === field && item.completed)
        );

        setIsProfileComplete(isComplete);

        // Redirect to profile page if incomplete and not on allowed route
        if (!isComplete && !isAllowedRoute) {
          navigate('/profile', { replace: true });
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
        setIsProfileComplete(false);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && user) {
      checkProfileCompletion();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading, location.pathname, navigate, isAllowedRoute]);

  // Show loading during auth or profile check
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If no user, render children (for public routes)
  if (!user) {
    return <>{children}</>;
  }

  // If profile is incomplete and not on allowed route, show completion message
  if (isProfileComplete === false && !isAllowedRoute) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Please complete your profile to access all features of the application.
          </p>
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // If profile is complete or on allowed route, render children
  return <>{children}</>;
};

export default ProfileCompletionGuard;
