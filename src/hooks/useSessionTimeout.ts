
import { useState, useEffect, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  timeoutMinutes: number;
  warningMinutes: number;
}

export const useSessionTimeout = ({ timeoutMinutes, warningMinutes }: UseSessionTimeoutOptions) => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    setTimeLeft(0);
  }, []);

  const formatTimeLeft = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    formatTimeLeft
  };
};
