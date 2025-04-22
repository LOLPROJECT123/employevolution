
"use client"

import { Bell, HelpCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMobile } from '@/hooks/use-mobile';

const Header = () => {
  const isMobile = useMobile();

  return (
    <header className="h-[60px] border-b bg-white dark:bg-slate-900 w-full sticky top-0 z-10">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        {isMobile && (
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" 
              alt="Logo" 
              className="h-8 w-8" 
            />
            <span className="text-lg font-bold text-primary">Streamline</span>
          </div>
        )}
        
        <div className="flex-1 md:flex-none"></div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full overflow-hidden">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
