import React from "react";
import { Menu, User, MessageSquare, HelpCircle, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showLogo = true }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white dark:bg-slate-900 border-b px-4 h-14">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <img src="/lovable-uploads/f3c6fbd8-96c4-4634-9d74-649139e933f5.png" alt="Streamline" className="h-8 w-8" />
          {showLogo && <span className="font-bold text-lg ml-2">Streamline</span>}
          {title && !showLogo && <span className="font-bold text-lg ml-2">{title}</span>}
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open profile menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-slate-900">
            <DropdownMenuItem asChild>
              <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <MessageSquare className="h-4 w-4" />
              Report Issues
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <HelpCircle className="h-4 w-4" />
              Support
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Navigation Sheet (keeping the existing one for navigation) */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] p-0">
            <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <Link to="/profile" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-500">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'VV'}
                  </div>
                  <div>
                    <div className="font-medium">{user?.name || 'Varun Veluri'}</div>
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
                  <button onClick={handleLogout} className="text-sm text-muted-foreground">Log out</button>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileHeader;
