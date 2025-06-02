
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface AppTransitionsProps {
  children: React.ReactNode;
}

export const AppTransitions: React.FC<AppTransitionsProps> = ({ children }) => {
  const location = useLocation();
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [previousPath, setPreviousPath] = useState<string>('');

  useEffect(() => {
    // Determine transition direction based on navigation
    const currentPath = location.pathname;
    
    // Simple heuristic for direction - in a real app, you'd use navigation history
    const routeOrder = ['/', '/jobs', '/profile', '/applications', '/calendar'];
    const currentIndex = routeOrder.indexOf(currentPath);
    const previousIndex = routeOrder.indexOf(previousPath);
    
    if (currentIndex !== -1 && previousIndex !== -1) {
      setDirection(currentIndex > previousIndex ? 'forward' : 'backward');
    }
    
    setPreviousPath(currentPath);
  }, [location.pathname, previousPath]);

  const pageVariants = {
    initial: (direction: string) => ({
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0
    }),
    in: {
      x: 0,
      opacity: 1
    },
    out: (direction: string) => ({
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0
    })
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        transition={pageTransition}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AppTransitions;
