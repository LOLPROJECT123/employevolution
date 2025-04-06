
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onMenuToggle?: () => void;
}

export function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  return (
    <div className="mobile-header">
      <Link to="/" className="flex items-center gap-2">
        <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-6 w-6" />
        <span className="font-bold text-base">Streamline</span>
      </Link>
      
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onMenuToggle}
        className="static"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </div>
  );
}

export function MobileSidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-[100]" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-950 h-full w-[85%] max-w-[300px] p-4 shadow-lg animate-slide-in-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-8 w-8" />
              <span className="font-bold text-lg">Streamline</span>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="space-y-1 pt-2">
            <Link to="/dashboard" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Dashboard
            </Link>
            <Link to="/jobs" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Jobs
            </Link>
            <Link to="/resume-tools" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Resume &amp; CV Tools
            </Link>
            <Link to="/interview-practice" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Interview Practice
            </Link>
            <Link to="/referrals" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Referrals
            </Link>
            <Link to="/salary-negotiations" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Salary Negotiations
            </Link>
            <Link to="/networking" className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-sm">
              Networking &amp; Outreach
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
