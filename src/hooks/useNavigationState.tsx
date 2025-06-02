
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationState {
  currentPath: string;
  previousPath: string;
  navigationHistory: string[];
}

interface NavigationContextType extends NavigationState {
  setCurrentPath: (path: string) => void;
  addToHistory: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPathState] = useState('/');
  const [previousPath, setPreviousPath] = useState('/');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['/']);

  const setCurrentPath = (path: string) => {
    setPreviousPath(currentPath);
    setCurrentPathState(path);
  };

  const addToHistory = (path: string) => {
    setNavigationHistory(prev => [...prev, path]);
  };

  return (
    <NavigationContext.Provider value={{
      currentPath,
      previousPath,
      navigationHistory,
      setCurrentPath,
      addToHistory
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationState = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationState must be used within a NavigationStateProvider');
  }
  return context;
};
