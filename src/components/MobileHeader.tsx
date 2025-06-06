
import React from "react";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/ModeToggle";

interface MobileHeaderProps {
  title?: string;
  showLogo?: boolean;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title, showLogo = true }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-background border-b px-4 h-14">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/e143f174-8a9d-4972-8058-44990ccdb8f3.png" 
            alt="Streamline" 
            className="h-8 w-8" 
          />
          {showLogo && <span className="font-bold text-lg ml-2 text-foreground">Streamline</span>}
          {title && !showLogo && <span className="font-bold text-lg ml-2 text-foreground">{title}</span>}
        </Link>
      </div>
      
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[250px] p-0">
            <div className="flex flex-col h-full">
              <div className="border-b p-4">
                <Link to="/profile" className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground">
                    VV
                  </div>
                  <div>
                    <div className="font-medium text-foreground">Varun Veluri</div>
                    <div className="text-xs text-muted-foreground">View Profile</div>
                  </div>
                </Link>
              </div>
              
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  <li>
                    <Link to="/dashboard" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/jobs" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Jobs</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/job-alerts" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Job Alerts</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/applications" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Applications</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/resume-tools" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Resume</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/interview-practice" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Interview Prep</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/referrals" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Referrals</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/salary-negotiations" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Salary</span>
                    </Link>
                  </li>
                  <li>
                    <Link to="/networking" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent text-foreground">
                      <span className="text-sm">Networking</span>
                    </Link>
                  </li>
                </ul>
              </nav>
              
              <div className="border-t p-4">
                <div className="flex items-center justify-between">
                  <Link to="/logout" className="text-sm text-muted-foreground">Log out</Link>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default MobileHeader;
