
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  history: string[];
  currentIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  breadcrumbs: Array<{ path: string; label: string; }>;
}

interface NavigationContextType {
  state: NavigationState;
  goBack: () => void;
  goForward: () => void;
  goToIndex: (index: number) => void;
  clearHistory: () => void;
  addBreadcrumb: (path: string, label: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigationState = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationState must be used within NavigationStateProvider');
  }
  return context;
};

interface NavigationStateProviderProps {
  children: React.ReactNode;
  maxHistorySize?: number;
}

export const NavigationStateProvider: React.FC<NavigationStateProviderProps> = ({
  children,
  maxHistorySize = 50
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [state, setState] = useState<NavigationState>(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('navigationState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          canGoBack: parsed.currentIndex > 0,
          canGoForward: parsed.currentIndex < parsed.history.length - 1
        };
      } catch (error) {
        console.error('Failed to parse saved navigation state:', error);
      }
    }
    
    return {
      history: [location.pathname],
      currentIndex: 0,
      canGoBack: false,
      canGoForward: false,
      breadcrumbs: []
    };
  });

  // Update state when location changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    setState(prevState => {
      // Don't add duplicate consecutive paths
      if (prevState.history[prevState.currentIndex] === currentPath) {
        return prevState;
      }

      // Remove any forward history when navigating to a new page
      const newHistory = [
        ...prevState.history.slice(0, prevState.currentIndex + 1),
        currentPath
      ];

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      }

      const newIndex = newHistory.length - 1;

      const newState = {
        ...prevState,
        history: newHistory,
        currentIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: false
      };

      // Auto-generate breadcrumbs
      const breadcrumbs = generateBreadcrumbs(currentPath);
      newState.breadcrumbs = breadcrumbs;

      return newState;
    });
  }, [location.pathname]);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('navigationState', JSON.stringify(state));
  }, [state]);

  const generateBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const breadcrumbs = [{ path: '/', label: 'Home' }];

    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      const label = formatSegmentLabel(segment);
      breadcrumbs.push({ path: currentPath, label });
    }

    return breadcrumbs;
  };

  const formatSegmentLabel = (segment: string): string => {
    const labelMap: Record<string, string> = {
      'jobs': 'Jobs',
      'profile': 'Profile',
      'applications': 'Applications',
      'calendar': 'Calendar',
      'resume-tools': 'Resume Tools',
      'interview-practice': 'Interview Practice',
      'networking': 'Networking',
      'analytics': 'Analytics',
      'communications': 'Communications',
      'referrals': 'Referrals',
      'salary-negotiations': 'Salary Negotiations',
      'job-alerts': 'Job Alerts',
      'leetcode-patterns': 'LeetCode Patterns'
    };

    return labelMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const goBack = () => {
    if (state.canGoBack) {
      const newIndex = state.currentIndex - 1;
      const targetPath = state.history[newIndex];
      
      setState(prev => ({
        ...prev,
        currentIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: true
      }));
      
      navigate(targetPath);
    }
  };

  const goForward = () => {
    if (state.canGoForward) {
      const newIndex = state.currentIndex + 1;
      const targetPath = state.history[newIndex];
      
      setState(prev => ({
        ...prev,
        currentIndex: newIndex,
        canGoBack: true,
        canGoForward: newIndex < prev.history.length - 1
      }));
      
      navigate(targetPath);
    }
  };

  const goToIndex = (index: number) => {
    if (index >= 0 && index < state.history.length) {
      const targetPath = state.history[index];
      
      setState(prev => ({
        ...prev,
        currentIndex: index,
        canGoBack: index > 0,
        canGoForward: index < prev.history.length - 1
      }));
      
      navigate(targetPath);
    }
  };

  const clearHistory = () => {
    setState({
      history: [location.pathname],
      currentIndex: 0,
      canGoBack: false,
      canGoForward: false,
      breadcrumbs: generateBreadcrumbs(location.pathname)
    });
  };

  const addBreadcrumb = (path: string, label: string) => {
    setState(prev => ({
      ...prev,
      breadcrumbs: [...prev.breadcrumbs, { path, label }]
    }));
  };

  const contextValue: NavigationContextType = {
    state,
    goBack,
    goForward,
    goToIndex,
    clearHistory,
    addBreadcrumb
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationStateProvider;
