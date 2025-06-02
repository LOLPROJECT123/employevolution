
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/ModeToggle';
import { NotificationBell } from '@/components/NotificationBell';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { 
  BriefcaseIcon, 
  FileTextIcon, 
  UserIcon, 
  BarChartIcon,
  MessageCircleIcon,
  CalendarIcon,
  NetworkIcon,
  TrendingUpIcon,
  BookIcon,
  SearchIcon
} from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
  >(({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    )
  });
  ListItem.displayName = "ListItem";

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" 
              alt="Streamline Logo" 
              className="w-8 h-8" 
            />
            <span className="font-bold text-xl">Streamline</span>
          </Link>

          {/* Navigation Menu */}
          {user && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Job Search</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/jobs"
                          >
                            <SearchIcon className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Find Jobs
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Discover opportunities tailored to your skills and preferences.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/applications" title="Applications">
                        Track and manage your job applications
                      </ListItem>
                      <ListItem href="/job-alerts" title="Job Alerts">
                        Get notified about relevant opportunities
                      </ListItem>
                      <ListItem href="/calendar" title="Calendar">
                        Schedule interviews and manage deadlines
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Career Tools</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <ListItem href="/resume-tools" title="Resume Tools">
                        Create and optimize your resume
                      </ListItem>
                      <ListItem href="/resume-forum" title="Resume Forum">
                        Get feedback from the community
                      </ListItem>
                      <ListItem href="/interview-practice" title="Interview Practice">
                        Practice coding and behavioral interviews
                      </ListItem>
                      <ListItem href="/leetcode-patterns" title="LeetCode Patterns">
                        Master common coding patterns
                      </ListItem>
                      <ListItem href="/salary-negotiations" title="Salary Negotiations">
                        Learn negotiation strategies
                      </ListItem>
                      <ListItem href="/networking" title="Networking">
                        Build professional connections
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger>Communication</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                            to="/communications"
                          >
                            <MessageCircleIcon className="h-6 w-6" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Communications
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Manage all your professional communications in one place.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <ListItem href="/networking-tools" title="Networking Tools">
                        Find and connect with professionals
                      </ListItem>
                      <ListItem href="/referrals" title="Referrals">
                        Request and manage referrals
                      </ListItem>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <ModeToggle />
            
            {user ? (
              <>
                <NotificationBell />
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="h-8 w-8 rounded-full bg-primary text-primary-foreground">
                        {user.email?.charAt(0).toUpperCase()}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                          <ListItem href="/profile" title="Profile">
                            Manage your profile
                          </ListItem>
                          <ListItem href="/enhanced-complete-profile" title="Enhanced Profile">
                            Complete your enhanced profile
                          </ListItem>
                          <li>
                            <button
                              onClick={handleSignOut}
                              className="block w-full text-left select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="text-sm font-medium leading-none">Sign Out</div>
                            </button>
                          </li>
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth?mode=signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button>Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
