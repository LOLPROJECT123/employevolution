
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile, getUserInitials } from '@/utils/profileUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Briefcase, 
  FileText, 
  Home, 
  User, 
  DollarSign, 
  Users, 
  Clock, 
  Network, 
  Sun 
} from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:text-primary';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="text-xl font-bold flex items-center gap-2">
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline Logo" className="w-8 h-8" />
            <span>Streamline</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm ${isActive('/')}`}>
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </Link>
          
          <Link to="/jobs" className={`text-sm ${isActive('/jobs')}`}>
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>Jobs</span>
            </div>
          </Link>
          
          <Link to="/resume-tools" className={`text-sm ${isActive('/resume-tools')}`}>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Resume</span>
            </div>
          </Link>
          
          <Link to="/interview-practice" className={`text-sm ${isActive('/interview-practice')}`}>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Interview Prep</span>
            </div>
          </Link>
          
          <Link to="/referrals" className={`text-sm ${isActive('/referrals')}`}>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Referrals</span>
            </div>
          </Link>
          
          <Link to="/salary-negotiations" className={`text-sm ${isActive('/salary-negotiations')}`}>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>Salary</span>
            </div>
          </Link>
          
          <Link to="/networking-tools" className={`text-sm ${isActive('/networking-tools')}`}>
            <div className="flex items-center gap-1">
              <Network className="h-4 w-4" />
              <span>Networking</span>
            </div>
          </Link>
          
          <button className="text-sm text-gray-600 dark:text-gray-400">
            <Sun className="h-4 w-4" />
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/profile" className={`text-sm ${isActive('/profile')}`}>
            <Avatar className="h-10 w-10 bg-primary text-primary-foreground">
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
