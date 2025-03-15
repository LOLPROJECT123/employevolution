import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  BriefcaseIcon, 
  UserIcon, 
  HomeIcon, 
  MenuIcon, 
  XIcon 
} from 'lucide-react';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Check if the user is authenticated (this will be replaced with actual auth logic)
  const isAuthenticated = false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-primary font-semibold text-xl tracking-tight button-hover"
          >
            <span className="sr-only">Streamline</span>
            <img src="/lovable-uploads/47a5c183-6462-4482-85b2-320da7ad9a4e.png" alt="Streamline Logo" className="w-8 h-8" />
            <span className="text-[#0EA5E9]">Streamline</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-[#0EA5E9]' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/dashboard' 
                      ? 'text-[#0EA5E9]' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/jobs" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/jobs' 
                      ? 'text-[#0EA5E9]' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Jobs
                </Link>
                <Link 
                  to="/profile" 
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/profile' 
                      ? 'text-[#0EA5E9]' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Profile
                </Link>
                <Button 
                  variant="outline" 
                  className="button-hover"
                  onClick={() => console.log('Logout clicked')}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth?mode=login">
                  <Button variant="outline" className="button-hover">
                    Login
                  </Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="button-hover bg-[#F97316] hover:bg-[#F97316]/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex items-center text-muted-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="flex flex-col space-y-4 p-6 animate-fade-in">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                location.pathname === '/' 
                  ? 'bg-accent text-[#0EA5E9]' 
                  : 'hover:bg-accent/50'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                    location.pathname === '/dashboard' 
                      ? 'bg-accent text-[#0EA5E9]' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <HomeIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link 
                  to="/jobs" 
                  className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                    location.pathname === '/jobs' 
                      ? 'bg-accent text-[#0EA5E9]' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <BriefcaseIcon className="w-5 h-5" />
                  <span>Jobs</span>
                </Link>
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 py-2 px-3 rounded-md ${
                    location.pathname === '/profile' 
                      ? 'bg-accent text-[#0EA5E9]' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Logout clicked')}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/auth?mode=login">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link to="/auth?mode=signup">
                  <Button className="w-full bg-[#F97316] hover:bg-[#F97316]/90 text-white">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
