
import { Link, useLocation } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { 
  User, 
  BookOpen, 
  BriefcaseIcon, 
  DollarSign, 
  FileText,
  Users,
  Network,
  Menu,
  MessageSquare,
  HelpCircle,
  LogOut,
  LogIn,
  Home,
  Briefcase,
  FileText as FileTextIcon,
  Users as UsersIcon,
  Play,
  UserPlus,
  DollarSign as DollarSignIcon
} from "lucide-react";

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Resume Tools', href: '/resume-tools', icon: FileTextIcon },
  { name: 'Networking', href: '/networking', icon: UsersIcon },
  { name: 'Interview Practice', href: '/interview-practice', icon: Play },
  { name: 'Referrals', href: '/referrals', icon: UserPlus },
  { name: 'Salary Negotiations', href: '/salary-negotiations', icon: DollarSignIcon },
];

const Navbar = () => {
  const isMobile = useMobile();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // If on mobile, don't show the navbar (it's handled in the mobile views)
  if (isMobile) {
    return null;
  }

  // Check if the current path matches
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/auth';
  };

  return (
    <div className={cn(
      "sticky top-0 z-50 w-full transition-all duration-200 bg-slate-50 dark:bg-slate-900 border-b",
      isScrolled ? "shadow-sm" : ""
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <div className="flex items-center gap-2">
              <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline" className="h-8 w-8" />
              <span className="font-bold text-lg">Streamline</span>
            </div>
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-1">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <Link to={item.href}>
                    <div className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                      isActive(item.href) ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </div>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background">
              {user && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Report Issues</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {user ? (
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleSignIn}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign in</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
