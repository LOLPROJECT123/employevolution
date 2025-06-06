
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Menu, X, User, LogOut, AlertCircle, Lock, HelpCircle, Bug, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isProfileComplete } = useAuth();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (path: string) => {
    if (isProfileComplete === false && path !== '/profile' && path !== '/auth') {
      // Show warning and redirect to profile
      navigate('/profile');
      return;
    }
    navigate(path);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', requiresCompletion: true },
    { name: 'Jobs', path: '/jobs', requiresCompletion: true },
    { name: 'Applications', path: '/applications', requiresCompletion: true },
    { name: 'Interview Practice', path: '/interview-practice', requiresCompletion: true },
    { name: 'Resume Tools', path: '/resume-tools', requiresCompletion: true },
    { name: 'Networking', path: '/networking', requiresCompletion: true },
    { name: 'Job Alerts', path: '/job-alerts', requiresCompletion: true },
  ];

  const isActive = (path: string) => {
    if (path === '/resume-tools') {
      return location.pathname.startsWith('/resume-tools');
    }
    return location.pathname === path;
  };

  const isItemDisabled = (item: any) => {
    return item.requiresCompletion && isProfileComplete === false;
  };

  return (
    <nav className={`${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className={`font-bold text-xl ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Streamline
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user && navItems.map((item) => {
              const disabled = isItemDisabled(item);
              return (
                <button
                  key={item.name}
                  onClick={() => !disabled && handleNavigate(item.path)}
                  disabled={disabled}
                  className={`text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                    disabled
                      ? 'text-gray-400 cursor-not-allowed'
                      : isActive(item.path)
                      ? 'text-blue-600'
                      : theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {disabled && <Lock className="h-3 w-3" />}
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isProfileComplete === false && user && (
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Complete your profile
                </span>
              </div>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => window.open('mailto:support@streamline.com?subject=Issue Report', '_blank')}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Bug className="h-4 w-4" />
                    <span>Report Issues</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => window.open('mailto:support@streamline.com?subject=Support Request', '_blank')}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4" />
                    <span>Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleNavigate('/profile')}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  {isProfileComplete === false && user && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg mb-4">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        Complete your profile to access all features
                      </span>
                    </div>
                  )}
                  
                  {user && navItems.map((item) => {
                    const disabled = isItemDisabled(item);
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          if (!disabled) {
                            handleNavigate(item.path);
                            setIsMobileMenuOpen(false);
                          }
                        }}
                        disabled={disabled}
                        className={`text-left p-3 rounded-lg transition-colors flex items-center gap-2 ${
                          disabled
                            ? 'text-gray-400 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
                            : isActive(item.path)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-800'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {disabled && <Lock className="h-4 w-4" />}
                        {item.name}
                      </button>
                    );
                  })}
                  
                  <div className="border-t pt-4 mt-4">
                    {user ? (
                      <div className="space-y-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            window.open('mailto:support@streamline.com?subject=Issue Report', '_blank');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Bug className="h-4 w-4 mr-2" />
                          Report Issues
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            window.open('mailto:support@streamline.com?subject=Support Request', '_blank');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <HelpCircle className="h-4 w-4 mr-2" />
                          Support
                        </Button>
                        <div className="border-t pt-2 mt-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              handleNavigate('/profile');
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => {
                              handleLogout();
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        onClick={() => {
                          navigate('/auth');
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
