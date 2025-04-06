
import * as React from "react";
import { isMobileScreenSize } from "@/utils/mobileUtils";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Initial check for mobile via screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    // Initialize on mount
    checkMobile();
    
    // Add resize event listener
    window.addEventListener('resize', checkMobile);
    
    // Clean up on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Create an alias for backward compatibility
export const useMobile = useIsMobile;
