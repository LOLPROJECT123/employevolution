
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationSuggestion {
  path: string;
  label: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export const useContextAwareNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<NavigationSuggestion[]>([]);

  useEffect(() => {
    generateNavigationSuggestions();
  }, [location.pathname, user]);

  const generateNavigationSuggestions = () => {
    const currentPath = location.pathname;
    const newSuggestions: NavigationSuggestion[] = [];

    // Profile completion suggestions
    if (user) {
      const profileCompletionPaths = [
        '/profile',
        '/resume-tools',
        '/job-preferences'
      ];

      if (!profileCompletionPaths.includes(currentPath)) {
        newSuggestions.push({
          path: '/profile',
          label: 'Complete Profile',
          reason: 'Improve your job match accuracy',
          priority: 'high'
        });
      }
    }

    // Job search workflow suggestions
    if (currentPath === '/jobs') {
      newSuggestions.push(
        {
          path: '/analytics/predictive',
          label: 'View Analytics',
          reason: 'Get insights on your job search performance',
          priority: 'medium'
        },
        {
          path: '/saved-searches',
          label: 'Saved Searches',
          reason: 'Quick access to your favorite job searches',
          priority: 'low'
        }
      );
    }

    // Application workflow suggestions
    if (currentPath === '/applications') {
      newSuggestions.push(
        {
          path: '/calendar',
          label: 'Interview Calendar',
          reason: 'Check upcoming interview schedules',
          priority: 'high'
        },
        {
          path: '/analytics',
          label: 'Application Analytics',
          reason: 'Track your application success rate',
          priority: 'medium'
        }
      );
    }

    // Analytics workflow suggestions
    if (currentPath.startsWith('/analytics')) {
      newSuggestions.push(
        {
          path: '/jobs',
          label: 'Browse Jobs',
          reason: 'Apply insights to find better matches',
          priority: 'high'
        },
        {
          path: '/resume-tools',
          label: 'Optimize Resume',
          reason: 'Improve based on analytics feedback',
          priority: 'medium'
        }
      );
    }

    // Collaboration workflow suggestions
    if (currentPath.startsWith('/collaboration')) {
      newSuggestions.push(
        {
          path: '/networking',
          label: 'Networking',
          reason: 'Connect with peers for more collaboration',
          priority: 'medium'
        },
        {
          path: '/analytics',
          label: 'View Performance',
          reason: 'See how collaboration improves your success',
          priority: 'low'
        }
      );
    }

    setSuggestions(newSuggestions);
  };

  const navigateToSuggestion = (suggestion: NavigationSuggestion) => {
    navigate(suggestion.path);
  };

  return {
    suggestions,
    navigateToSuggestion
  };
};

// Export the provider from the navigation state hook
export { NavigationStateProvider } from './useNavigationState';
