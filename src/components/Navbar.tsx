
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
import { Link } from "react-router-dom";
import { Menu, UserIcon } from "lucide-react";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const links = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/interview-practice", label: "Interview Practice" },
    { href: "/referrals", label: "Referrals" },
    { href: "/resume-forum", label: "Resume Forum" },
    { href: "/leetcode-patterns", label: "LeetCode Patterns" },
    { href: "/salary-negotiations", label: "Salary Negotiations" },
  ];

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
                      <AvatarFallback>VV</AvatarFallback>
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
