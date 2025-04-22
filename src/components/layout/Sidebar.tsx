
"use client"

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BriefcaseIcon, 
  UserIcon, 
  FileTextIcon,
  SearchIcon,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Matches', icon: SearchIcon, path: '/matches' },
    { name: 'Job Tracker', icon: BriefcaseIcon, path: '/job-tracker' },
    { name: 'Profile', icon: UserIcon, path: '/profile' },
    { name: 'Documents', icon: FileTextIcon, path: '/documents' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div 
      className={cn(
        "h-screen bg-white dark:bg-slate-900 border-r transition-all duration-300 relative",
        collapsed ? "w-[70px]" : "w-[240px]",
        className
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" 
            alt="Logo" 
            className="h-8 w-8" 
          />
          {!collapsed && <span className="text-lg font-bold text-primary">Streamline</span>}
        </Link>
      </div>
      
      <div className="mt-6">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800",
                  collapsed && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 bg-white dark:bg-slate-900 border rounded-full p-1 shadow-sm"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </div>
  );
};

export default Sidebar;
