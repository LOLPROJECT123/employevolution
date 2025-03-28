
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ModeToggle";
import { Link, useLocation } from "react-router-dom";
import { Menu, UserIcon } from "lucide-react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const location = useLocation();
  const isMobileJobsPage = location.pathname === "/mobile-jobs" || 
                           (location.pathname === "/jobs" && window.innerWidth <= 768);
  
  const links = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/interview-practice", label: "Interview Practice" },
    { href: "/referrals", label: "Referrals" },
    { href: "/resume-tools", label: "Resume/CV Tools" },
    { href: "/leetcode-patterns", label: "LeetCode Patterns" },
    { href: "/salary-negotiations", label: "Salary Negotiations" },
  ];

  // Get user name from localStorage or use default
  const firstName = localStorage.getItem('userFirstName') || 'Varun';
  const lastName = localStorage.getItem('userLastName') || 'Veluri';
  
  // Generate initials from first and last name
  const getInitials = () => {
    const firstInitial = firstName.charAt(0);
    const lastInitial = lastName.charAt(0);
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Simplified version for mobile jobs page
  if (isMobileJobsPage) {
    return (
      <nav className="bg-background border-b sticky top-0 z-50">
        <div className="flex items-center justify-between py-4 px-4">
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl">
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline Logo" className="w-6 h-6" />
            <span>Streamline</span>
          </Link>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-1">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-sm">
              <SheetHeader>
                <SheetTitle>Streamline</SheetTitle>
                <SheetDescription>
                  Explore the different sections of the app.
                </SheetDescription>
              </SheetHeader>
              <Separator className="my-4" />
              <div className="grid gap-4 py-4">
                <Link to="/profile" className="flex items-center gap-2 hover:underline">
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>
                <Link to="/auth" className="flex items-center gap-2 hover:underline">
                  <UserIcon className="h-4 w-4" />
                  Sign in / Create Account
                </Link>
                {links.map((link) => (
                  <Link key={link.href} to={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                ))}
              </div>
              <Separator className="my-4" />
              <ModeToggle />
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    );
  }

  // Standard navbar for other pages
  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center space-x-2 font-bold text-2xl">
          <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline Logo" className="w-6 h-6" />
          <span>Streamline</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link key={link.href} to={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          
          <div className="flex items-center space-x-3">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-48 p-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                      <Link 
                        to="/dashboard" 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Separator className="my-1" />
                      <Link 
                        to="/auth" 
                        className="flex items-center gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span>Sign out</span>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <ModeToggle />
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>Streamline</SheetTitle>
              <SheetDescription>
                Explore the different sections of the app.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <div className="grid gap-4 py-4">
              <Link to="/profile" className="flex items-center gap-2 hover:underline">
                <UserIcon className="h-4 w-4" />
                Profile
              </Link>
              <Link to="/auth" className="flex items-center gap-2 hover:underline">
                <UserIcon className="h-4 w-4" />
                Sign in / Create Account
              </Link>
              {links.map((link) => (
                <Link key={link.href} to={link.href} className="hover:underline">
                  {link.label}
                </Link>
              ))}
            </div>
            <Separator className="my-4" />
            <ModeToggle />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};

export default Navbar;
