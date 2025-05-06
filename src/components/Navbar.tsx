
import { Link, useLocation } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";
import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
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
import { 
  User, 
  BookOpen, 
  BriefcaseIcon, 
  DollarSign, 
  FileText,
  Users,
  Network
} from "lucide-react";

const Navbar = () => {
  const isMobile = useMobile();
  const location = useLocation();
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
              <NavigationMenuItem>
                <Link to="/dashboard">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/jobs">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/jobs") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    Jobs
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/resume-tools">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/resume-tools") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <FileText className="mr-2 h-4 w-4" />
                    Resume
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/interview-practice">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/interview-practice") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Interview Prep
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/referrals">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/referrals") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Users className="mr-2 h-4 w-4" />
                    Referrals
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/salary-negotiations">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/salary-negotiations") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Salary
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/networking">
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium transition-colors",
                    isActive("/networking") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <Users className="mr-2 h-4 w-4" />
                    Networking
                  </div>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
          <Link to="/profile">
            <Button variant={isActive("/profile") ? "default" : "outline"} size="sm">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
