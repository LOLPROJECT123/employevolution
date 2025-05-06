
"use client"

import { useState } from 'react';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import { useMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useMobile();
  
  return (
    <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
