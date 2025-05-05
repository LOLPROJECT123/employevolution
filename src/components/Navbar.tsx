
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UserProfile, getUserInitials } from '@/utils/profileUtils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Briefcase, User, Zap } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          <span>JobSeeker</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/jobs" className="text-sm font-medium hover:underline">
            Jobs
          </Link>
          <Link to="/automation" className="text-sm font-medium hover:underline">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Automation
            </div>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/profile">
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
