
import React, { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { getUserInitials, getUserFullName } from "@/utils/profileUtils";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showLogo = true }) => {
  const [username, setUsername] = useState("User");

  // Listen for profile updates and update username
  useEffect(() => {
    // Try to load username from localStorage
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        if (profile?.firstName) {
          setUsername(profile.firstName);
        }
      } catch (error) {
        console.error('Error parsing user profile:', error);
      }
    }
    
    // Listen for custom profile update events
    const handleProfileUpdate = (event: CustomEvent) => {
      if (event.detail?.firstName) {
        setUsername(event.detail.firstName);
      }
    };
    
    // Add event listener for profile updates
    window.addEventListener('profileUpdated' as any, handleProfileUpdate as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('profileUpdated' as any, handleProfileUpdate as EventListener);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white dark:bg-slate-900 border-b px-4 h-14">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/f3c6fbd8-96c4-4634-9d74-649139e933f5.png" alt="Streamline" className="h-8 w-8" />
          {showLogo && <span className="font-bold text-lg ml-2">Streamline</span>}
          {title && !showLogo && <span className="font-bold text-lg ml-2">{title}</span>}
        </Link>
      </div>
      
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[250px] p-0">
          <div className="flex flex-col h-full">
            <div className="border-b p-4">
              <Link to="/profile" className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
                  {getUserInitials()}
                </div>
                <div>
                  <div className="font-medium">{getUserFullName()}</div>
                  <div className="text-xs text-muted-foreground">View Profile</div>
                </div>
              </Link>
            </div>
            
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                <li>
                  <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link to="/jobs" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Jobs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/resume-tools" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Resume</span>
                  </Link>
                </li>
                <li>
                  <Link to="/interview-practice" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Interview Prep</span>
                  </Link>
                </li>
                <li>
                  <Link to="/referrals" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Referrals</span>
                  </Link>
                </li>
                <li>
                  <Link to="/salary-negotiations" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Salary</span>
                  </Link>
                </li>
                <li>
                  <Link to="/networking" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <span className="text-sm">Networking</span>
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <Link to="/" onClick={handleLogout} className="text-sm text-muted-foreground">Log out</Link>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
  
  function handleLogout(e: React.MouseEvent) {
    e.preventDefault();
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userProfile');
    
    // Create and dispatch toast event properly
    const toastEvent = new CustomEvent('toast', {
      bubbles: true,
      detail: {
        title: 'Logged out',
        description: 'You have been successfully logged out',
      }
    });
    document.dispatchEvent(toastEvent);
    
    // Redirect to login/home page
    window.location.href = '/';
  }
};

export default MobileHeader;
