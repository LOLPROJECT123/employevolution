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
import { Menu } from "lucide-react";

const Navbar = () => {
  const links = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/interview-practice", label: "Interview Practice" },
    { href: "/referrals", label: "Referrals" },
  ];

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="font-bold text-2xl">
          AI Job Prep
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          {links.map((link) => (
            <Link key={link.href} to={link.href} className="hover:underline">
              {link.label}
            </Link>
          ))}
          <ModeToggle />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>AI Job Prep</SheetTitle>
              <SheetDescription>
                Explore the different sections of the app.
              </SheetDescription>
            </SheetHeader>
            <Separator className="my-4" />
            <div className="grid gap-4 py-4">
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
