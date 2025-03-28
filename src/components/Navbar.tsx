
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
      "sticky top-0 z-50 w-full transition-all duration-200",
      isScrolled ? "bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/60 border-b" : ""
    )}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">JobHunter</span>
            </div>
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/dashboard">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/dashboard") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    Dashboard
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/jobs">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/jobs") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <BriefcaseIcon className="mr-2 h-4 w-4" />
                    Jobs
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/resume-tools">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/resume-tools") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <FileText className="mr-2 h-4 w-4" />
                    Resume
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/interview-practice">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/interview-practice") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Interview Prep
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/referrals">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/referrals") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <Users className="mr-2 h-4 w-4" />
                    Referrals
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/salary-negotiations">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/salary-negotiations") ? "bg-accent text-accent-foreground" : ""
                  )}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Salary
                  </div>
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/networking">
                  <div className={cn(
                    navigationMenuTriggerStyle(),
                    isActive("/networking") ? "bg-accent text-accent-foreground" : ""
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
